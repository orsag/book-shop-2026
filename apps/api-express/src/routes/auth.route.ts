import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();

// 1. POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Unauthorized' });
  }
});

// 1. POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Unauthorized' });
  }
});

// 2. GET /auth/logout (Protected)
router.get('/logout', jwtAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // req.user is fully defined here thanks to our types and auth middleware!
    const username = req.user!.username;
    const result = await authService.logout(username);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Not Found' });
  }
});

// 3. GET /auth?username=value
router.get('/', async (req: Request, res: Response) => {
  try {
    const username = req.query['username'] as string;
    if (!username) {
      res.status(400).json({ message: 'Query parameter "username" is required' });
      return;
    }
    const user = await authService.findByUsername(username);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Not Found' });
  }
});

// 4. PATCH /auth/favorites (Protected)
router.patch('/favorites', jwtAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const username = req.user!.username;
    const { favorites } = req.body as { favorites: string[] };

    if (!Array.isArray(favorites)) {
      res.status(400).json({ message: 'Favorites must be an array of strings' });
      return;
    }

    const updatedUser = await authService.updateFavorites(username, favorites);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update favorites', error: error.message });
  }
});

// 5. PATCH /auth/update (Protected)
router.patch('/update', jwtAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const username = req.user!.username;
    const { updates } = req.body as {
      updates: {
        email?: string;
        phoneNumber?: string;
        theme?: string;
      };
    };

    if (!updates) {
      res.status(400).json({ message: 'Updates body is required' });
      return;
    }

    const updatedUser = await authService.updateProfile(username, updates);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

export const authRouter = router;