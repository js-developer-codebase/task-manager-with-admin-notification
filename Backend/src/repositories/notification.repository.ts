import { Notification, INotification } from '../models/notification.model.js';

const create = async (data: { title: string; message: string }): Promise<INotification> => {
  const notification = new Notification(data);
  return await notification.save();
};

const findAll = async (): Promise<INotification[]> => {
  return await Notification.find().sort({ createdAt: -1 });
};

const markAsRead = async (id: string): Promise<INotification | null> => {
  return await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
};

const getUnreadCount = async (): Promise<number> => {
  return await Notification.countDocuments({ isRead: false });
};

const notificationRepository = {
  create,
  findAll,
  markAsRead,
  getUnreadCount,
};

export { notificationRepository };
export default notificationRepository;
