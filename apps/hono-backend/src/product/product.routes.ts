import { Hono, Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HonoEnv } from '../guards/types';
import { adminMiddleware } from '../guards/admin.middleware';
import { jwtAuthMiddleware } from '../guards/auth.middleware';
import { DEFAULT_MAX_LIMIT, DEFAULT_PAGE, DEFAULT_TYPE } from '@store/libs';
import { rateLimiter } from 'hono-rate-limiter';
import { securityLogger } from '../guards/logger.middleware';
import { eq, asc, desc, count, inArray, gt, and, ilike, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  product,
  book,
  game,
  gastro,
  aggregateRating,
  giftCard,
  orderItem,
} from '../../drizzle/schema';
import { HTTPException } from 'hono/http-exception';

const productApp = new Hono<HonoEnv>();

const adminLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
  // Use the UserID if they are logged in, otherwise fallback to IP
  keyGenerator: (c: Context<HonoEnv>) => {
    const user = c.get('user');
    return user ? user.userId : c.req.header('x-forwarded-for') || '127.0.0.1';
  },
  handler: (c) => {
    securityLogger.warn(
      {
        event: 'ADMIN_RATE_LIMIT',
        path: c.req.path,
      },
      'Admin rate limit triggered',
    );
    return c.json({ error: 'Too many admin requests' }, 429);
  },
});

// Helper to generate a unique internal SKU
const generateInternalSku = (): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');
};

// --- VALIDATION SCHEMAS ---
const findAllQuerySchema = z.object({
  type: z
    .enum(['BOOK', 'GAME', 'GASTRO', 'GIFT_CARD'] as const)
    .default(DEFAULT_TYPE as any),
  page: z.string().transform(Number).default(DEFAULT_PAGE),
  limit: z.string().transform(Number).default(DEFAULT_MAX_LIMIT),
  isDiscounted: z
    .string()
    .transform((val) => val === 'true')
    .default(false),
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc']).optional(),
});

const getIdsBodySchema = z.object({
  ids: z.array(z.string()),
});

// --- ROUTES ---

// 1. GET ALL PRODUCTS (with query parameters, pagination, and fuzzy search)
productApp.get('/', zValidator('query', findAllQuerySchema), async (c) => {
  const { type, page, limit, isDiscounted, search, category, sortBy } =
    c.req.valid('query');
  const offset = (page - 1) * limit;

  // 1. Handle Sorting
  const order =
    sortBy === 'price_asc'
      ? asc(product.price)
      : sortBy === 'price_desc'
        ? desc(product.price)
        : asc(product.id);

  // 1. Prepare base filters array dynamically
  const filters = [eq(product.productType, type)];

  if (search && search.trim().length > 0) {
    filters.push(ilike(product.name, `%${search}%`));
  }
  if (isDiscounted) {
    filters.push(gt(product.discount, 0));
  }

  if (category) {
    if (type === 'BOOK') {
      filters.push(eq(book.category, category));
    } else if (type === 'GAME') {
      filters.push(eq(game.category, category));
    } else if (type === 'GASTRO') {
      filters.push(eq(gastro.category, category));
    }
  }

  // 2. Fetch data & total count in ONE query using a window function
  const rawResults = await db
    .select({
      Product: product,
      Book: book,
      Game: game,
      Gastro: gastro,
      Rating: aggregateRating,
      // This calculates the count matching the where clause BEFORE limit/offset is applied
      totalCount: sql<number>`count(*) over()`.mapWith(Number),
    })
    .from(product)
    .leftJoin(book, eq(product.id, book.productId))
    .leftJoin(game, eq(product.id, game.productId))
    .leftJoin(gastro, eq(product.id, gastro.productId))
    .leftJoin(aggregateRating, eq(product.id, aggregateRating.productId))
    .where(and(...filters))
    .limit(limit)
    .offset(offset)
    .orderBy(order, asc(product.id));

  // 3. Extract the total count from the first returned row (if any results exist)
  const total = rawResults[0]?.totalCount ?? 0;

  // 4. Format the final JSON output
  const formattedData = rawResults.map((row) => {
    const item = { ...row.Product } as any;

    if (type === 'BOOK' && row.Book) item.bookDetails = row.Book;
    if (type === 'GAME' && row.Game) item.gameDetails = row.Game;
    if (type === 'GASTRO' && row.Gastro) item.gastroDetails = row.Gastro;

    return item;
  });

  return c.json({
    data: formattedData,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    },
  });
});

// 2. GET SINGLE PRODUCT
productApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  const type = c.req.query('type') || 'BOOK';

  // Query product and all possible relation tables in one single JOIN query
  const [row] = await db
    .select({
      Product: product,
      Rating: aggregateRating,
      Book: book,
      Game: game,
      Gastro: gastro,
      GiftCard: giftCard,
    })
    .from(product)
    .leftJoin(aggregateRating, eq(product.id, aggregateRating.productId))
    .leftJoin(book, eq(product.id, book.productId))
    .leftJoin(game, eq(product.id, game.productId))
    .leftJoin(gastro, eq(product.id, gastro.productId))
    .leftJoin(giftCard, eq(product.id, giftCard.productId))
    .where(eq(product.id, id))
    .limit(1);

  // If the product doesn't exist, return 404
  if (!row || !row.Product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  // Flatten the response so it looks exactly like the Prisma object structure
  const formattedProduct = {
    ...row.Product,
    rating: row.Rating || null, // rating is included by default
  } as any;

  // Conditionally append the details matching the type parameter
  if (type === 'BOOK' && row.Book) formattedProduct.bookDetails = row.Book;
  if (type === 'GAME' && row.Game) formattedProduct.gameDetails = row.Game;
  if (type === 'GASTRO' && row.Gastro)
    formattedProduct.gastroDetails = row.Gastro;
  if (type === 'GIFT_CARD' && row.GiftCard)
    formattedProduct.cardDetails = row.GiftCard;

  return c.json(formattedProduct);
});

// 3. POST /LIST (Get many products by ID array)
productApp.post('/list', zValidator('json', getIdsBodySchema), async (c) => {
  const { ids } = c.req.valid('json');

  if (!ids || ids.length === 0) {
    return c.json([]);
  }

  // Fetch all matching products in a single batch query
  const products = await db
    .select()
    .from(product)
    .where(inArray(product.id, ids));

  return c.json(products);
});

// 4. CREATE PRODUCT (Admin Route)
productApp.post(
  '/',
  jwtAuthMiddleware,
  adminMiddleware,
  adminLimiter,
  async (c) => {
    const body = await c.req.json();
    const {
      bookDetails,
      gameDetails,
      gastroDetails,
      cardDetails,
      ...productData
    } = body;

    // Generate a random, unique ID for the new product
    const productId = crypto.randomUUID();
    const sku = generateInternalSku();

    // Run everything inside a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Create parent Product
      const [newProduct] = await tx
        .insert(product)
        .values({
          id: productId,
          sku,
          ...productData,
          updatedAt: new Date().toISOString(), // Ensure you set updatedAt to match schema requirements
        })
        .returning();

      // 2. Create the empty starting Rating
      const [ratingRecord] = await tx
        .insert(aggregateRating)
        .values({
          id: crypto.randomUUID(),
          productId: newProduct.id,
          ratingValue: 0,
          ratingCount: 0,
          bestRating: 5,
          worstRating: 1,
        })
        .returning();

      // 3. Create conditional type details
      let bookRecord = null;
      let gameRecord = null;
      let gastroRecord = null;
      let cardRecord = null;

      if (body.productType === 'BOOK' && bookDetails) {
        const { id, productId: _, ...bookData } = bookDetails;
        const [inserted] = await tx
          .insert(book)
          .values({
            id: crypto.randomUUID(),
            productId: newProduct.id,
            ...bookData,
          })
          .returning();
        bookRecord = inserted;
      }

      if (body.productType === 'GAME' && gameDetails) {
        const { id, productId: _, ...gameData } = gameDetails;
        const [inserted] = await tx
          .insert(game)
          .values({
            id: crypto.randomUUID(),
            productId: newProduct.id,
            ...gameData,
          })
          .returning();
        gameRecord = inserted;
      }

      if (body.productType === 'GASTRO' && gastroDetails) {
        const { id, productId: _, ...gastroData } = gastroDetails;
        const [inserted] = await tx
          .insert(gastro)
          .values({
            id: crypto.randomUUID(),
            productId: newProduct.id,
            ...gastroData,
          })
          .returning();
        gastroRecord = inserted;
      }

      if (body.productType === 'GIFT_CARD' && cardDetails) {
        const { id, productId: _, ...cardData } = cardDetails;
        const [inserted] = await tx
          .insert(giftCard)
          .values({
            id: crypto.randomUUID(),
            productId: newProduct.id,
            ...cardData,
          })
          .returning();
        cardRecord = inserted;
      }

      // 4. Construct response payload that exactly matches what Prisma returned
      return {
        ...newProduct,
        rating: ratingRecord,
        ...(body.productType === 'BOOK' && { bookDetails: bookRecord }),
        ...(body.productType === 'GAME' && { gameDetails: gameRecord }),
        ...(body.productType === 'GASTRO' && { gastroDetails: gastroRecord }),
        ...(body.productType === 'GIFT_CARD' && { cardDetails: cardRecord }),
      };
    });

    return c.json(result, 201);
  },
);

// 5. UPDATE PRODUCT (Admin Route)
productApp.patch(
  '/:id',
  jwtAuthMiddleware,
  adminMiddleware,
  adminLimiter,
  async (c) => {
    const id = c.req.param('id');
    const updateProductDto = await c.req.json();

    if (!id) {
      throw new HTTPException(400, { message: 'Invalid product ID' });
    }

    // 1. Fetch the product to determine its type
    const [selectedProduct] = await db
      .select()
      .from(product)
      .where(eq(product.id, id))
      .limit(1);

    if (!selectedProduct) {
      return c.json({ error: `Product with ID ${id} not found` }, 404);
    }

    const {
      bookDetails,
      cardDetails,
      gameDetails,
      gastroDetails,
      ...restProps
    } = updateProductDto;

    // 2. Perform updates atomically inside a transaction
    const updatedProduct = await db.transaction(async (tx) => {
      let parentProduct = selectedProduct;

      // A. Update parent Product table if fields are provided
      if (Object.keys(restProps).length > 0) {
        const [updated] = await tx
          .update(product)
          .set({
            ...restProps,
            updatedAt: new Date().toISOString(), // Always update timestamp
          })
          .where(eq(product.id, id))
          .returning();

        parentProduct = updated;
      }

      // B. Conditionally update specific details based on type
      if (selectedProduct.productType === 'BOOK' && bookDetails) {
        const { id: _, productId: __, ...bookUpdateData } = bookDetails;
        if (Object.keys(bookUpdateData).length > 0) {
          await tx
            .update(book)
            .set(bookUpdateData)
            .where(eq(book.productId, id));
        }
      }

      if (selectedProduct.productType === 'GAME' && gameDetails) {
        const { id: _, productId: __, ...gameUpdateData } = gameDetails;
        if (Object.keys(gameUpdateData).length > 0) {
          await tx
            .update(game)
            .set(gameUpdateData)
            .where(eq(game.productId, id));
        }
      }

      if (selectedProduct.productType === 'GASTRO' && gastroDetails) {
        const { id: _, productId: __, ...gastroUpdateData } = gastroDetails;
        if (Object.keys(gastroUpdateData).length > 0) {
          await tx
            .update(gastro)
            .set(gastroUpdateData)
            .where(eq(gastro.productId, id));
        }
      }

      // Note: Added support for GIFT_CARD updates (which was missing in the original Prisma code!)
      if (selectedProduct.productType === 'GIFT_CARD' && cardDetails) {
        const { id: _, productId: __, ...cardUpdateData } = cardDetails;
        if (Object.keys(cardUpdateData).length > 0) {
          await tx
            .update(giftCard)
            .set(cardUpdateData)
            .where(eq(giftCard.productId, id));
        }
      }

      return parentProduct;
    });

    return c.json(updatedProduct);
  },
);

// 6. DELETE PRODUCT (Admin Route with constraints check)
productApp.delete('/:id', jwtAuthMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');

  // WebStorm type safety check
  if (!id) {
    throw new HTTPException(400, { message: 'Invalid product ID' });
  }

  // 1. Check if the product is in any orders
  const [orderCountResult] = await db
    .select({ count: count() })
    .from(orderItem)
    .where(eq(orderItem.productId, id));

  const orderCount = orderCountResult?.count ?? 0;

  if (orderCount > 0) {
    return c.json(
      {
        success: false,
        message: `Produkt nie je možné vymazať, pretože sa nachádza v ${orderCount} objednávkach.`,
        warning: true,
      },
      400,
    );
  }

  // 2. Safely remove sub-table details and parent product in a transaction
  await db.transaction(async (tx) => {
    // Delete from child tables first to avoid foreign key constraint violations
    await tx.delete(book).where(eq(book.productId, id));
    await tx.delete(game).where(eq(game.productId, id));
    await tx.delete(gastro).where(eq(gastro.productId, id));
    await tx.delete(giftCard).where(eq(giftCard.productId, id));

    // Finally, delete the parent product
    await tx.delete(product).where(eq(product.id, id));
  });

  return c.json({
    success: true,
    message: 'Produkt bol úspešne odstránený.',
  });
});

export default productApp;
