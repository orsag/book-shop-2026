import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db } from '../prisma/prisma.service'; // Our global Prisma client
import { jwtAuthMiddleware } from '../guards/auth.middleware';
import { adminMiddleware } from '../guards/admin.middleware';
import { OrderStatus } from '@store/libs';
import { HonoEnv } from '../guards/types';

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
    // 🛡️ We use a Prisma transaction to ensure atomic stock decrement and order creation
    const result = await db.$transaction(async (tx) => {
      let totalAmount = 0;
      const VAT_RATE = 0.05;
      const orderItemsData: {
        productId: string;
        quantity: number;
        price: number;
      }[] = [];

      for (const item of items) {
        // Fetch current price directly from DB (never trust frontend prices!)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new HTTPException(404, {
            message: `Product ${item.productId} not found`,
          });
        }

        // 🛡️ STOCK CHECK: Prevent ordering more than available
        if (product.availableCount < item.quantity) {
          throw new HTTPException(400, {
            message: `Insufficient stock for "${product.name}". Available: ${product.availableCount}`,
          });
        }

        const priceWithVat =
          product.price * (1 - product.discount) * (1 + VAT_RATE);
        const itemTotal = priceWithVat * item.quantity;

        totalAmount += itemTotal;

        // Prepare the item data with locked pricing
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: priceWithVat,
        });

        // DECREASE STOCK: Use atomic decrement
        await tx.product.update({
          where: { id: item.productId },
          data: {
            availableCount: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create the order and its items
      return await tx.order.create({
        data: {
          user: { connect: { id: user.userId } },
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
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
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(orders);
});

// 3. GET /user/:userId (Fetch all orders for the currently authenticated user)
orderApp.get('/user/:userId', async (c) => {
  const user = c.get('user');

  if (!user?.userId) {
    throw new HTTPException(400, { message: 'Missing user context' });
  }

  const orders = await db.order.findMany({
    where: { userId: user.userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return c.json(orders);
});

// 4. GET /:id (Find single order by ID)
orderApp.get('/:id', async (c) => {
  const id = c.req.param('id');

  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    throw new HTTPException(404, { message: 'Order not found' });
  }

  return c.json(order);
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

    const updatedOrder = await db.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

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

  const order = await db.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw new HTTPException(404, { message: 'Order not found' });
  }

  // Backend validation for the 14-day cancellation window
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  if (order.createdAt < fourteenDaysAgo) {
    throw new HTTPException(400, {
      message: 'Orders older than 14 days cannot be cancelled',
    });
  }

  const updatedOrder = await db.order.update({
    where: { id },
    data: { status: 'CANCELLED' as OrderStatus },
  });

  return c.json(updatedOrder);
});

// 8. DELETE /:id (Remove order and its cascading records inside a transaction)
orderApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user?.userId) {
    throw new HTTPException(400, { message: 'Missing user context' });
  }

  const result = await db.$transaction(async (tx) => {
    // Delete all items associated with this order first to respect foreign key constraints
    await tx.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Delete the order (admins can delete any order; regular users can only delete their own)
    return tx.order.delete({
      where: {
        id,
        ...(user.isAdmin ? {} : { userId: user.userId }),
      },
    });
  });

  return c.json(result);
});

export default orderApp;
