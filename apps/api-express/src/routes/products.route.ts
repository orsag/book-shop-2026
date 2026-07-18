import { Router, Request, Response } from 'express';
import { ProductsService } from '../services/products.service';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { getRequiredParam, getSingleQueryParam } from '../utils/params';
import {
  DEFAULT_TYPE,
  DEFAULT_PAGE,
  DEFAULT_MAX_LIMIT,
  ProductType,
} from '@store/libs';

const router = Router();
const productsService = new ProductsService();

// 1. GET /products - Find All with pagination, filters, and full typo tolerance matching
router.get('/', async (req: Request, res: Response) => {
  try {
    // Mimic DefaultValuePipe and type conversion logic
    const rawType = getSingleQueryParam(req.query['type']);
    const type = (rawType as ProductType) || DEFAULT_TYPE;

    const rawPage = getSingleQueryParam(req.query['page']);
    const page = rawPage ? parseInt(rawPage, 10) : DEFAULT_PAGE;

    const rawLimit = getSingleQueryParam(req.query['limit']);
    const limit = rawLimit ? parseInt(rawLimit, 10) : DEFAULT_MAX_LIMIT;

    const rawIsDiscounted = getSingleQueryParam(req.query['isDiscounted']);
    const isDiscounted = rawIsDiscounted === 'true';

    const search = getSingleQueryParam(req.query['search']);
    const category = getSingleQueryParam(req.query['category']);

    const rawSortBy = getSingleQueryParam(req.query['sortBy']);
    const sortBy =
      rawSortBy === 'price_asc' || rawSortBy === 'price_desc'
        ? rawSortBy
        : undefined;

    // Confirm parsed numbers are valid, fallback if not
    const sanitizedPage = isNaN(page) ? DEFAULT_PAGE : page;
    const sanitizedLimit = isNaN(limit) ? DEFAULT_MAX_LIMIT : limit;

    const result = await productsService.findAll({
      type,
      page: sanitizedPage,
      limit: sanitizedLimit,
      search,
      category,
      sortBy,
      isDiscounted,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// 2. POST /products/list - Retrieve products list by multiple IDs
router.post('/list', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(200).json([]);
      return;
    }

    const result = await productsService.getProductsByIds(ids);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// 3. GET /products/:id - Find single product with relation inclusions
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = getRequiredParam(req.params['id']);
    const rawType = getSingleQueryParam(req.query['type']);
    const type = (rawType as ProductType) || DEFAULT_TYPE;

    const result = await productsService.findOne(id, type);
    if (!result) {
      res.status(404).json({ message: `Product with ID ${id} not found` });
      return;
    }
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// 4. POST /products - Create Product (Open/Admin depending on overall project design)
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await productsService.create(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
});

// 5. PATCH /products/:id - Update Product (Admin Guarded)
router.patch(
  '/:id',
  jwtAuthMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = getRequiredParam(req.params['id']);
      const result = await productsService.update(id, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Bad Request' });
    }
  },
);

// 6. DELETE /products/:id - Delete Product (Admin Guarded)
router.delete(
  '/:id',
  jwtAuthMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = getRequiredParam(req.params['id']);
      const result = await productsService.remove(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Bad Request' });
    }
  },
);

export const productsRouter = router;
