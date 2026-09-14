import { addNotificationJob } from '../queues/notification.queue.js';
import { notificationRepository } from '../repositories/notification.repository.js';
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

const getAllNotifications = async (userId: string) => {
  return await notificationRepository.findAll(userId);
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

const notificationService = {
  sendNotification,
  getAllNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
};

export { notificationService };
export default notificationService;
