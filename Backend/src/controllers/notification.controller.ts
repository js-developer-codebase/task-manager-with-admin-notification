import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

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
    const notifications = await notificationService.getAllNotifications();

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
    const notification = await notificationService.markNotificationAsRead(id as string);

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
    const count = await notificationService.getUnreadNotificationCount();

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
