import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    // Simple manual validation
    if (!name || !email || !password) {
      return res.status(ERROR_CODES.BAD_REQUEST.status).json({
        success: false,
        code: ERROR_CODES.BAD_REQUEST.code,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(ERROR_CODES.BAD_REQUEST.status).json({
        success: false,
        code: ERROR_CODES.BAD_REQUEST.code,
        message: 'Password must be at least 6 characters long',
      });
    }

    const result = await authService.register(name, email, password, role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Simple manual validation
    if (!email || !password) {
      return res.status(ERROR_CODES.BAD_REQUEST.status).json({
        success: false,
        code: ERROR_CODES.BAD_REQUEST.code,
        message: 'Email and password are required',
      });
    }

    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(ERROR_CODES.UNAUTHORIZED.status).json({
        success: false,
        code: ERROR_CODES.UNAUTHORIZED.code,
        message: ERROR_CODES.UNAUTHORIZED.message,
      });
    }

    const user = await authService.getProfile(userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const authController = {
  signup,
  login,
  getMe,
};

export { authController, signup, login, getMe };
export default authController;
