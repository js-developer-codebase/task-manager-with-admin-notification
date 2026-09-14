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

const getAllNotifications = async () => {
  return await notificationRepository.findAll();
};

const markNotificationAsRead = async (id: string) => {
  const notification = await notificationRepository.markAsRead(id);
  if (!notification) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'Notification not found');
  }
  return notification;
};

const getUnreadNotificationCount = async () => {
  return await notificationRepository.getUnreadCount();
};

const notificationService = {
  sendNotification,
  getAllNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
};

export { notificationService };
export default notificationService;
