import { Types } from 'mongoose';
import { Notification, INotification, INotificationDTO } from '../models/notification.model.js';

const create = async (data: { title: string; message: string }): Promise<INotification> => {
  const notification = new Notification({
    ...data,
    readBy: [],
    deletedBy: [],
  });
  return await notification.save();
};

const findAll = async (userId: string): Promise<INotificationDTO[]> => {
  const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;

  const pipeline: any[] = [];

  if (userObjectId) {
    pipeline.push({
      $match: {
        deletedBy: { $ne: userObjectId },
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        title: 1,
        message: 1,
        createdAt: 1,
        updatedAt: 1,
        isRead: userObjectId
          ? { $in: [userObjectId, { $ifNull: ['$readBy', []] }] }
          : false,
      },
    }
  );

  return await Notification.aggregate<INotificationDTO>(pipeline);
};

const markAsRead = async (id: string, userId: string): Promise<INotificationDTO | null> => {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
  if (!userObjectId) {
    return null;
  }

  const notification = await Notification.findByIdAndUpdate(
    id,
    { $addToSet: { readBy: userObjectId } },
    { new: true }
  );

  if (!notification) {
    return null;
  }

  return {
    _id: notification._id,
    title: notification.title,
    message: notification.message,
    isRead: true,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
};

const deleteForUser = async (id: string, userId: string): Promise<boolean> => {
  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
  if (!userObjectId) {
    return false;
  }

  const updated = await Notification.findByIdAndUpdate(
    id,
    { $addToSet: { deletedBy: userObjectId } },
    { new: true }
  );

  return !!updated;
};

const getUnreadCount = async (userId: string): Promise<number> => {
  const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
  if (!userObjectId) {
    return 0;
  }

  return await Notification.countDocuments({
    readBy: { $ne: userObjectId },
    deletedBy: { $ne: userObjectId },
  });
};

const notificationRepository = {
  create,
  findAll,
  markAsRead,
  deleteForUser,
  getUnreadCount,
};

export { notificationRepository };
export default notificationRepository;
