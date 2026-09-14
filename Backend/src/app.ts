import express, { Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ERROR_CODES } from './constants/errorCodes.js';
import { swaggerServe, swaggerSetup } from './config/swagger.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation Route
app.use('/api-docs', swaggerServe, swaggerSetup);

// Apply rate limiting to all API endpoints
app.use('/api', apiLimiter);

// API Routes
app.use('/api', apiRouter);

// 404 Handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(ERROR_CODES.NOT_FOUND.status).json({
    success: false,
    code: ERROR_CODES.NOT_FOUND.code,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export { app };
export default app;
