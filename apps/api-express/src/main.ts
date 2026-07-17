import express, { Router } from 'express';
import cors from 'cors';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { connectDatabase, disconnectDatabase } from './db';
import { authRouter } from './routes/auth.route';
import { orderRouter } from './routes/order.route';
import { userRouter } from './routes/user.route';
import { productsRouter } from './routes/products.route';
import { uploadsRouter } from './routes/upload.route';
import { loggingMiddleware } from './middleware/logging.middleware';

dotenv.config({ path: join(__dirname, '../../../.env') });

const app = express();

app.set('strict routing', false);

app.use(loggingMiddleware);

// 2. Enable CORS (Replaces app.enableCors() from NestJS)
app.use(cors({
  origin: 'http://localhost:4200', // Allow your Angular frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));


// 1. Create a master router for the API
const apiRouter = Router();
// 2. Attach your individual feature routers to the master router
apiRouter.use('/auth', authRouter);
apiRouter.use('/order', orderRouter);
apiRouter.use('/user-detail', userRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/upload', uploadsRouter);

// 3. Mount the master router under the 'api' global prefix 🚀
app.use('/api', apiRouter);

app.get(/.*/, (req, res) => {
  res.status(404).json({ message: 'Not Found on Express Root' });
});

async function startServer() {
  try {
    // 1. Establish database connection first
    await connectDatabase();

    const port = process.env['PORT'] || 3000;
    const server = app.listen(port, () => {
      console.log(`🚀 Express API listening at http://localhost:${port}/api`);
    });
    server.on('error', console.error);

    // 3. Graceful Shutdown (Cleanly disconnect database when app terminates)
    const shutdown = async () => {
      console.log('\nReceived shutdown signal. Closing connections...');
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
