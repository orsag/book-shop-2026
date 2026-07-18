import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { jwtAuthMiddleware } from '../guards/auth.middleware';
import { adminMiddleware } from '../guards/admin.middleware';
import { OrderStatus } from '@store/libs';
import { HonoEnv } from '../guards/types';
import { eq, sql, desc, and } from 'drizzle-orm';
import { db } from '../db'; // Adjust path to your Drizzle db instance
import { product, order, orderItem } from '../../drizzle/schema';

const orderApp = new Hono<HonoEnv>();

// --- VALIDATION SCHEMAS (Replacing DTOs) ---
const createOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z
    .array(createOrderItemSchema)
    .nonempty('Order must contain at least one item'),
});

const updateOrderSchema = z
  .object({
    // Define update properties if needed (matching UpdateOrderDto)
  })
  .passthrough();

const updateStatusSchema = z.object({
  status: z.string().min(1),
});

// --- ALL ROUTES ARE PROTECTED BY JWT (Class-level equivalent) ---
orderApp.use('/*', jwtAuthMiddleware);

// --- ROUTES ---

// 1. POST / (Create a new order - Transaction safe with stock management)
orderApp.post('/', zValidator('json', createOrderSchema), async (c) => {
  const user = c.get('user');
  const { items } = c.req.valid('json');

  if (!user?.userId) {
    throw new HTTPException(400, { message: `Missing user context` });
  }

  try {
    // 🛡️ We use a Drizzle transaction to ensure atomic stock decrement and order creation
    const result = await db.transaction(async (tx) => {
      let totalAmount = 0;
      const VAT_RATE = 0.05;
      const orderItemsData: {
        id: string;
        productId: string;
        quantity: number;
        price: number;
      }[] = [];

      for (const item of items) {
        // Fetch current price directly from DB (never trust frontend prices!)
        const [selectedProduct] = await tx
          .select()
          .from(product)
          .where(eq(product.id, item.productId))
          .limit(1);

        if (!selectedProduct) {
          throw new HTTPException(404, {
            message: `Product ${item.productId} not found`,
          });
        }

        // 🛡️ STOCK CHECK: Prevent ordering more than available
        if (selectedProduct.availableCount < item.quantity) {
          throw new HTTPException(400, {
            message: `Insufficient stock for "${selectedProduct.name}". Available: ${selectedProduct.availableCount}`,
          });
        }

        const priceWithVat =
          selectedProduct.price *
          (1 - selectedProduct.discount) *
          (1 + VAT_RATE);
        const itemTotal = priceWithVat * item.quantity;

        totalAmount += itemTotal;

        // Prepare the item data with locked pricing and generate unique IDs for OrderItems
        orderItemsData.push({
          id: crypto.randomUUID(),
          productId: item.productId,
          quantity: item.quantity,
          price: priceWithVat,
        });

        // DECREASE STOCK: Use atomic decrement
        await tx
          .update(product)
          .set({
            availableCount: sql`${product.availableCount} - ${item.quantity}`,
          })
          .where(eq(product.id, item.productId));
      }

      // Generate unique ID for the Order
      const orderId = crypto.randomUUID();

      // Create the order
      const [newOrder] = await tx
        .insert(order)
        .values({
          id: orderId,
          userId: user.userId,
          totalAmount,
          status: 'PENDING',
          updatedAt: new Date().toISOString(),
        })
        .returning();

      // Create the child OrderItems
      const itemsToInsert = orderItemsData.map((oi) => ({
        ...oi,
        orderId: newOrder.id,
      }));

      const insertedItems = await tx
        .insert(orderItem)
        .values(itemsToInsert)
        .returning();

      // Fetch inserted items with product details to match original "include" structure
      const itemsWithProducts = await Promise.all(
        insertedItems.map(async (insertedItem) => {
          const [associatedProduct] = await tx
            .select()
            .from(product)
            .where(eq(product.id, insertedItem.productId))
            .limit(1);

          return {
            ...insertedItem,
            product: associatedProduct,
          };
        }),
      );

      return {
        ...newOrder,
        items: itemsWithProducts,
      };
    });

    return c.json(result, 201);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      message: 'Failed to create order',
      cause: error,
    });
  }
});

// 2. GET /all (Administration: Get all global orders)
orderApp.get('/all', adminMiddleware, async (c) => {
  // 1. Fetch all orders and their items using a left join
  const rawRows = await db
    .select({
      order: order,
      item: orderItem,
    })
    .from(order)
    .leftJoin(orderItem, eq(order.id, orderItem.orderId))
    .orderBy(desc(order.createdAt));

  // 2. Group the flat rows by Order ID to match Prisma's nested structure
  const ordersMap = new Map<string, any>();

  for (const row of rawRows) {
    const orderId = row.order.id;

    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        ...row.order,
        items: [],
      });
    }

    if (row.item) {
      ordersMap.get(orderId).items.push(row.item);
    }
  }

  // 3. Convert the map back to an array
  const formattedOrders = Array.from(ordersMap.values());

  return c.json(formattedOrders);
});

// 4. GET /:id (Fetch a single order with nested items and product details)
orderApp.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user?.userId) {
    throw new HTTPException(400, { message: 'Missing user context' });
  }

  // 1. Fetch order, items, and products in a single join query
  const rawRows = await db
    .select({
      order: order,
      item: orderItem,
      product: product,
    })
    .from(order)
    .leftJoin(orderItem, eq(order.id, orderItem.orderId))
    .leftJoin(product, eq(orderItem.productId, product.id))
    .where(eq(order.id, id));

  // If no rows are returned, the order does not exist
  if (rawRows.length === 0) {
    throw new HTTPException(404, { message: 'Order not found' });
  }

  // 🔒 Optional Security Guard: Restrict non-admins to only viewing their own orders
  const firstRow = rawRows[0];
  if (firstRow.order.userId !== user.userId && !user.isAdmin) {
    throw new HTTPException(403, { message: 'Forbidden' });
  }

  // 2. Format the flat SQL join rows back into Prisma's nested object format
  const formattedOrder = {
    ...firstRow.order,
    items: [] as any[],
  };

  for (const row of rawRows) {
    if (row.item) {
      formattedOrder.items.push({
        ...row.item,
        product: row.product || null, // Nests the matched product within the item
      });
    }
  }

  return c.json(formattedOrder);
});

// 3. GET /user/:userId (Fetch all orders for the currently authenticated user)
orderApp.get('/user/:userId', async (c) => {
  const user = c.get('user');

  if (!user?.userId) {
    throw new HTTPException(400, { message: 'Missing user context' });
  }

  // 1. Fetch orders, items, and products in a single join query
  const rawRows = await db
    .select({
      order: order,
      item: orderItem,
      product: product,
    })
    .from(order)
    .leftJoin(orderItem, eq(order.id, orderItem.orderId))
    .leftJoin(product, eq(orderItem.productId, product.id))
    .where(eq(order.userId, user.userId))
    .orderBy(desc(order.createdAt));

  // 2. Format the flat rows into the nested structure Prisma returned
  const ordersMap = new Map<string, any>();

  for (const row of rawRows) {
    const orderId = row.order.id;

    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        ...row.order,
        items: [],
      });
    }

    if (row.item) {
      ordersMap.get(orderId).items.push({
        ...row.item,
        product: row.product || null, // Include the matched product nested within the item
      });
    }
  }

  const formattedOrders = Array.from(ordersMap.values());

  return c.json(formattedOrders);
});

// 5. PATCH /:id (Placeholder update)
orderApp.patch('/:id', zValidator('json', updateOrderSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');
  console.log(JSON.stringify(body));

  return c.json({ message: `This action updates a #${id} order` });
});

// 6. PATCH /:id/status (Administration: Generic status update)
orderApp.patch(
  '/:id/status',
  zValidator('json', updateStatusSchema),
  async (c) => {
    const id = c.req.param('id');
    const { status } = c.req.valid('json');

    // Update the order status and fetch the updated row using .returning()
    const [updatedOrder] = await db
      .update(order)
      .set({
        status: status as OrderStatus, // cast to match your OrderStatus enum types
        updatedAt: new Date().toISOString(), // Keep timestamps updated
      })
      .where(eq(order.id, id))
      .returning();

    if (!updatedOrder) {
      throw new HTTPException(404, { message: 'Order not found' });
    }

    return c.json(updatedOrder);
  },
);

// 7. PATCH /:id/cancel (Cancel an order if within the 14-day window)
orderApp.patch('/:id/cancel', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user?.userId) {
    throw new HTTPException(400, { message: 'Missing user context' });
  }

  // 1. Fetch the order first to check its creation date
  const [existingOrder] = await db
    .select()
    .from(order)
    .where(eq(order.id, id))
    .limit(1);

  if (!existingOrder) {
    throw new HTTPException(404, { message: 'Order not found' });
  }

  // 2. Parse Drizzle string timestamp into a JavaScript Date object
  const orderCreatedAt = new Date(existingOrder.createdAt);

  // 3. Backend validation for the 14-day cancellation window
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  if (orderCreatedAt < fourteenDaysAgo) {
    throw new HTTPException(400, {
      message: 'Orders older than 14 days cannot be cancelled',
    });
  }

  // 4. Update the order status to CANCELLED
  const [updatedOrder] = await db
    .update(order)
    .set({
      status: 'CANCELLED' as OrderStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(order.id, id))
    .returning();

  return c.json(updatedOrder);
});

// 8. DELETE /:id (Remove order and its cascading records inside a transaction)
orderApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user?.userId) {
    throw new HTTPException(400, { message: 'Missing user context' });
  }

  const result = await db.transaction(async (tx) => {
    // 1. Delete all items associated with this order first to respect foreign key constraints
    await tx.delete(orderItem).where(eq(orderItem.orderId, id));

    // 2. Build conditional conditions for the parent order delete
    const deleteConditions = [eq(order.id, id)];

    // If user is not an admin, restrict deletion to their own orders
    if (!user.isAdmin) {
      deleteConditions.push(eq(order.userId, user.userId));
    }

    // 3. Delete the parent order
    const [deletedOrder] = await tx
      .delete(order)
      .where(and(...deleteConditions))
      .returning();

    if (!deletedOrder) {
      throw new HTTPException(404, {
        message: 'Order not found or you do not have permission to delete it',
      });
    }

    return deletedOrder;
  });

  return c.json(result);
});

export default orderApp;
