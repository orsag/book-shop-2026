import { Router, Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { userOwnershipMiddleware } from '../middleware/ownership.middleware';
import { getRequiredParam } from '../utils/params';

const router = Router();
const orderService = new OrderService();

// Apply JWT Authorization to ALL order routes globally
router.use(jwtAuthMiddleware);

// 1. POST /order - Create Order
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId; // Assured by auth middleware
    const result = await orderService.create(userId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
});

// 2. GET /order/all - Find All Global (Admin Only)
router.get('/all', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await orderService.findAll();
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// 3. GET /order/user/:userId - Find All By User
// Uses userOwnershipMiddleware so users can only fetch their own lists unless they are Admin[cite: 9]
router.get(
  '/user/:userId',
  userOwnershipMiddleware,
  async (req: Request, res: Response) => {
    try {
      const targetUserId = getRequiredParam(req.params['userId']);
      const result = await orderService.findAllByUser(targetUserId);
      res.status(200).json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  },
);

// 4. GET /order/:id - Find One
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = getRequiredParam(req.params['id']);
    const result = await orderService.findOne(id);
    if (!result) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// 5. PATCH /order/:id - Update Order
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = getRequiredParam(req.params['id']);
    const userId = req.user!.userId;
    const result = await orderService.update(userId, id, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
});

// 6. PATCH /order/:id/status - Update Status (Admin Only)
router.patch(
  '/:id/status',
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = getRequiredParam(req.params['id']);
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ message: 'Status field is required' });
        return;
      }
      const result = await orderService.updateStatus(id, status);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Bad Request' });
    }
  },
);

// 7. PATCH /order/:id/cancel - Cancel Order
router.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const id = getRequiredParam(req.params['id']);
    const userId = req.user!.userId;
    const result = await orderService.cancel(userId, id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
});

// 8. DELETE /order/:id - Remove Order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = getRequiredParam(req.params['id']);
    const userId = req.user!.userId;
    const isAdmin = req.user!.isAdmin;
    const result = await orderService.remove(userId, id, isAdmin);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
});

export const orderRouter = router;
