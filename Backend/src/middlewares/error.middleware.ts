import { Request, Response, NextFunction } from 'express';
import { ERROR_CODES, AppError } from '../constants/errorCodes.js';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Handle Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    return res.status(409).json({
      success: false,
      code: ERROR_CODES.USER_ALREADY_EXISTS.code,
      message: `${field} already exists`,
    });
  }

  // Handle Mongoose Invalid ObjectId CastError
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      code: ERROR_CODES.BAD_REQUEST.code,
      message: `Invalid format for ID: ${err.value}`,
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    return res.status(400).json({
      success: false,
      code: ERROR_CODES.BAD_REQUEST.code,
      message: messages.join(', '),
    });
  }

  // Generic fallback
  console.error('[Unhandled Error]:', err);
  return res.status(500).json({
    success: false,
    code: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
    message: ERROR_CODES.INTERNAL_SERVER_ERROR.message,
  });
};

export { errorHandler };
export default errorHandler;
