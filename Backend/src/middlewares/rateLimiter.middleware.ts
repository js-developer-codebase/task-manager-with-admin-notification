import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Standard error response formatter for rate limit violations
 */
const createRateLimitHandler = (customMessage: string) => {
  return (req: Request, res: Response) => {
    res.status(ERROR_CODES.TOO_MANY_REQUESTS.status).json({
      success: false,
      code: ERROR_CODES.TOO_MANY_REQUESTS.code,
      message: customMessage,
    });
  };
};

/**
 * General API Rate Limiter
 * Restricts client IP to 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // max 100 requests per IP
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: createRateLimitHandler(
    'Too many requests from this IP, please try again after 15 minutes'
  ),
});

/**
 * Strict Auth Rate Limiter
 * Protects login and registration routes against brute-force attacks
 * Restricts client IP to 10 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // max 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many authentication attempts from this IP, please try again after 15 minutes'
  ),
});

/**
 * Notification Broadcast Rate Limiter
 * Protects against broadcast notification spamming
 * Restricts client IP to 10 broadcast creations per 5 minutes
 */
export const notificationBroadcastLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 10, // max 10 broadcasts per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many notification broadcasts sent. Please wait a few minutes before trying again'
  ),
});

export default {
  apiLimiter,
  authLimiter,
  notificationBroadcastLimiter,
};
