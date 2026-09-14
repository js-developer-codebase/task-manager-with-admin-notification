import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(ERROR_CODES.BAD_REQUEST.status).json({
        success: false,
        code: ERROR_CODES.BAD_REQUEST.code,
        message: 'Title and message are required',
      });
    }

    const result = await notificationService.sendNotification(title, message);

    return res.status(202).json({
      success: true,
      message: 'Notification queued for processing and delivery',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const notifications = await notificationService.getAllNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;
    const notification = await notificationService.markNotificationAsRead(id as string, userId);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const count = await notificationService.getUnreadNotificationCount(userId);

    return res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

const notificationController = {
  createNotification,
  getNotifications,
  markAsRead,
  getUnreadCount,
};

export {
  notificationController,
  createNotification,
  getNotifications,
  markAsRead,
  getUnreadCount,
};
export default notificationController;
