import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ERROR_CODES } from '../constants/errorCodes.js';

export interface AuthUser {
  id: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(ERROR_CODES.UNAUTHORIZED.status).json({
      success: false,
      code: ERROR_CODES.UNAUTHORIZED.code,
      message: ERROR_CODES.UNAUTHORIZED.message,
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; role: string };
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(ERROR_CODES.UNAUTHORIZED.status).json({
      success: false,
      code: ERROR_CODES.UNAUTHORIZED.code,
      message: 'Invalid or expired token',
    });
  }
};

const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(ERROR_CODES.FORBIDDEN.status).json({
        success: false,
        code: ERROR_CODES.FORBIDDEN.code,
        message: ERROR_CODES.FORBIDDEN.message,
      });
    }
    next();
  };
};

const authMiddleware = {
  authenticate,
  authorizeRoles,
};

export { authMiddleware, authenticate, authorizeRoles };
export default authMiddleware;
