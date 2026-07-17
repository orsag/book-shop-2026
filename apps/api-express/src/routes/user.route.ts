// src/routes/user.route.ts
import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';
import { userOwnershipMiddleware } from '../middleware/ownership.middleware';
import { getRequiredParam } from '../utils/params';

const router = Router();
const userService = new UserService();

// Apply JWT Authorization & User Ownership check to ALL user routes globally
router.use(jwtAuthMiddleware, userOwnershipMiddleware);

// 1. GET /user/:userId - Find One
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = getRequiredParam(req.params['userId']);
    const result = await userService.findOne(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Not Found' });
  }
});

// 2. GET /user/premium/:userId - Find Premium Status
router.get('/premium/:userId', async (req: Request, res: Response) => {
  try {
    const userId = getRequiredParam(req.params['userId']);
    const result = await userService.findPremiumStatus(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Not Found' });
  }
});

// 3. PATCH /user/:userId - Update User Detail
router.patch('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = getRequiredParam(req.params['userId']);
    const result = await userService.update(userId, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
});

// 4. POST /user - Create User Detail
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await userService.create(req.body);
    res.status(201).json({ message: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
});

// 5. DELETE /user/:userId - Remove User Detail
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = getRequiredParam(req.params['userId']);
    const result = await userService.remove(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Not Found' });
  }
});

export const userRouter = router;