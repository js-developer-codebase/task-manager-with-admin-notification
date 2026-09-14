import { addNotificationJob } from '../queues/notification.queue.js';
import { notificationRepository, NotificationFilterOptions } from '../repositories/notification.repository.js';
import { ERROR_CODES, AppError } from '../constants/errorCodes.js';

const sendNotification = async (title: string, message: string) => {
  if (!title || !message) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, 'Title and message are required');
  }

  // Push notification task to BullMQ queue
  const job = await addNotificationJob(title.trim(), message.trim());

  return {
    jobId: job.id,
    message: 'Notification successfully queued for delivery',
  };
};

const getAllNotifications = async (userId: string, options: NotificationFilterOptions = {}) => {
  return await notificationRepository.findAll(userId, options);
};

const markNotificationAsRead = async (id: string, userId: string) => {
  const notification = await notificationRepository.markAsRead(id, userId);
  if (!notification) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'Notification not found');
  }
  return notification;
};

const getUnreadNotificationCount = async (userId: string) => {
  return await notificationRepository.getUnreadCount(userId);
};

const deleteNotification = async (id: string, userId: string) => {
  const success = await notificationRepository.deleteForUser(id, userId);
  if (!success) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'Notification not found');
  }
  return { message: 'Notification deleted successfully' };
};

const notificationService = {
  sendNotification,
  getAllNotifications,
  markNotificationAsRead,
  deleteNotification,
  getUnreadNotificationCount,
};

export { notificationService };
export default notificationService;
