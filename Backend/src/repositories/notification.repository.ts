import { Types } from 'mongoose';
import { Notification, INotification, INotificationDTO } from '../models/notification.model.js';

export interface NotificationFilterOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationsResult {
  notifications: INotificationDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

const create = async (data: { title: string; message: string }): Promise<INotification> => {
  const notification = new Notification({
    ...data,
    readBy: [],
    deletedBy: [],
  });
  return await notification.save();
};

const findAll = async (
  userId: string,
  options: NotificationFilterOptions = {}
): Promise<PaginatedNotificationsResult> => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 10);
  const skip = (page - 1) * limit;

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
    },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
        ],
        metadata: [
          { $count: 'total' },
        ],
      },
    }
  );

  const [result] = await Notification.aggregate(pipeline);

  const total = result?.metadata?.[0]?.total || 0;
  const notifications: INotificationDTO[] = result?.data || [];
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    notifications,
    total,
    page,
    limit,
    totalPages,
    hasMore,
  };
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
