import { Router, Request, Response } from 'express';
import { authRouter } from './auth.routes.js';
import { taskRouter } from './task.routes.js';
import { notificationRouter } from './notification.routes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modules
apiRouter.use('/auth', authRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/notifications', notificationRouter);

export { apiRouter };
export default apiRouter;
