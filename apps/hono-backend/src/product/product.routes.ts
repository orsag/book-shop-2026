import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../prisma/prisma.service'; // Our global Prisma client
import { HonoEnv } from '../guards/types';
import { adminMiddleware } from '../guards/admin.middleware';
import { jwtAuthMiddleware } from '../guards/auth.middleware';
import { DEFAULT_MAX_LIMIT, DEFAULT_PAGE, DEFAULT_TYPE } from '@store/libs';
import { Prisma } from '@prismalib';

const productApp = new Hono<HonoEnv>();

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

  const skip = (page - 1) * limit;
  const andConditions: Prisma.ProductWhereInput[] = [];

  // Fuzzy Search Implementation using Raw SQL
  if (search && search.trim().length > 0) {
    const cleanedSearch = search.trim().toLowerCase();
    const rootWord =
      cleanedSearch.length > 4 ? cleanedSearch.substring(0, 4) : cleanedSearch;
    const percentageSearch = `%${rootWord}%`;

    const fuzzyMatches = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Product" 
      WHERE 
        name ILIKE ${percentageSearch}
        OR
        similarity(name, ${cleanedSearch}) > 0.18
    `;

    const matchedIds = fuzzyMatches.map((m) => m.id);
    andConditions.push({ id: { in: matchedIds } });
  }

  if (isDiscounted) {
    andConditions.push({
      discount: { gt: 0 },
    });
  }

  if (category) {
    if (type === 'BOOK') {
      andConditions.push({ bookDetails: { category: { equals: category } } });
    } else if (type === 'GAME') {
      andConditions.push({ gameDetails: { category: { equals: category } } });
    } else if (type === 'GASTRO') {
      andConditions.push({ gastroDetails: { category: { equals: category } } });
    }
  }

  const where: Prisma.ProductWhereInput = {
    productType: type,
    AND: andConditions.length > 0 ? andConditions : undefined,
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
  if (sortBy === 'price_asc') orderBy.push({ price: 'asc' });
  else if (sortBy === 'price_desc') orderBy.push({ price: 'desc' });
  orderBy.push({ id: 'asc' });

  const includeRelations: Prisma.ProductInclude = {
    rating: true,
  };

  if (type === 'BOOK') includeRelations.bookDetails = true;
  if (type === 'GAME') includeRelations.gameDetails = true;
  if (type === 'GASTRO') includeRelations.gastroDetails = true;
  if (type === 'GIFT_CARD') includeRelations.cardDetails = true;

  const [data, total] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: includeRelations,
    }),
    db.product.count({ where }),
  ]);

  return c.json({
    data,
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

  const includeRelations: Prisma.ProductInclude = {
    rating: true,
  };

  if (type === 'BOOK') includeRelations.bookDetails = true;
  if (type === 'GAME') includeRelations.gameDetails = true;
  if (type === 'GASTRO') includeRelations.gastroDetails = true;
  if (type === 'GIFT_CARD') includeRelations.cardDetails = true;

  const product = await db.product.findUnique({
    where: { id },
    include: includeRelations,
  });

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(product);
});

// 3. POST /LIST (Get many products by ID array)
productApp.post('/list', zValidator('json', getIdsBodySchema), async (c) => {
  const { ids } = c.req.valid('json');

  if (!ids || ids.length === 0) {
    return c.json([]);
  }

  const products = await db.product.findMany({
    where: { id: { in: ids } },
  });

  return c.json(products);
});

// 4. CREATE PRODUCT (Admin Route)
productApp.post('/', jwtAuthMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const {
    bookDetails,
    gameDetails,
    gastroDetails,
    cardDetails,
    ...productData
  } = body;

  const createData: Prisma.ProductCreateInput = {
    ...productData,
    sku: generateInternalSku(),
    rating: {
      create: {
        ratingValue: 0,
        ratingCount: 0,
        bestRating: 5,
        worstRating: 1,
      },
    },
  };

  if (body.productType === 'BOOK' && bookDetails) {
    const { id, productId, ...bookData } = bookDetails;
    createData.bookDetails = { create: bookData };
  }
  if (body.productType === 'GAME' && gameDetails) {
    const { id, productId, ...gameData } = gameDetails;
    createData.gameDetails = { create: gameData };
  }
  if (body.productType === 'GASTRO' && gastroDetails) {
    const { id, productId, ...gastroData } = gastroDetails;
    createData.gastroDetails = { create: gastroData };
  }
  if (body.productType === 'GIFT_CARD' && cardDetails) {
    const { id, productId, ...cardData } = cardDetails;
    createData.cardDetails = { create: cardData };
  }

  // 🛡️ FIX: Built purely dynamically here too!
  const includeRelations: Prisma.ProductInclude = {
    rating: true,
  };
  if (body.productType === 'BOOK') includeRelations.bookDetails = true;
  if (body.productType === 'GAME') includeRelations.gameDetails = true;
  if (body.productType === 'GASTRO') includeRelations.gastroDetails = true;
  if (body.productType === 'GIFT_CARD') includeRelations.cardDetails = true;

  const newProduct = await db.product.create({
    data: createData,
    include: includeRelations,
  });

  return c.json(newProduct, 201);
});

// 5. UPDATE PRODUCT (Admin Route)
productApp.patch('/:id', jwtAuthMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const updateProductDto = await c.req.json();

  const selectedProduct = await db.product.findUnique({
    where: { id },
  });

  if (!selectedProduct) {
    return c.json({ error: `Product with ID ${id} not found` }, 404);
  }

  const { bookDetails, cardDetails, gameDetails, gastroDetails, ...restProps } =
    updateProductDto;
  const updateData: Prisma.ProductUpdateInput = { ...restProps };

  if (selectedProduct.productType === 'BOOK' && bookDetails) {
    const { id: _, productId: __, ...bookUpdateData } = bookDetails;
    updateData.bookDetails = { update: bookUpdateData };
  }
  if (selectedProduct.productType === 'GAME' && gameDetails) {
    const { id: _, productId: __, ...gameUpdateData } = gameDetails;
    updateData.gameDetails = { update: gameUpdateData };
  }
  if (selectedProduct.productType === 'GASTRO' && gastroDetails) {
    const { id: _, productId: __, ...gastroUpdateData } = gastroDetails;
    updateData.gastroDetails = { update: gastroUpdateData };
  }

  const updatedProduct = await db.product.update({
    where: { id },
    data: updateData,
  });

  return c.json(updatedProduct);
});

// 6. DELETE PRODUCT (Admin Route with constraints check)
productApp.delete('/:id', jwtAuthMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');

  const orderCount = await db.orderItem.count({
    where: { productId: id },
  });

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

  // Proceed with standard deletion on the nested table
  await db.book.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: 'Produkt bol úspešne odstránený.',
  });
});

export default productApp;
