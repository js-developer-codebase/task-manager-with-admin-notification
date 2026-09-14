import { Types } from 'mongoose';
import { Notification, INotification, INotificationDTO } from '../models/notification.model.js';

export interface NotificationFilterOptions {
  page?: number;
  limit?: number;
  before?: string;
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

  let beforeCondition: any = null;
  if (options.before && Types.ObjectId.isValid(options.before)) {
    const cursorDoc = await Notification.findById(options.before).select('createdAt');
    if (cursorDoc) {
      beforeCondition = {
        $or: [
          { createdAt: { $lt: cursorDoc.createdAt } },
          { createdAt: cursorDoc.createdAt, _id: { $lt: cursorDoc._id } },
        ],
      };
    } else {
      beforeCondition = {
        _id: { $lt: new Types.ObjectId(options.before) },
      };
    }
  }

  const matchConditions: any[] = [];
  if (userObjectId) {
    matchConditions.push({ deletedBy: { $ne: userObjectId } });
  }
  if (beforeCondition) {
    matchConditions.push(beforeCondition);
  }

  const pipeline: any[] = [];
  if (matchConditions.length > 0) {
    pipeline.push({
      $match: matchConditions.length === 1 ? matchConditions[0] : { $and: matchConditions },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1, _id: -1 } },
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

  // If before cursor is provided, skip is not needed (cursor directly references the slice)
  if (!options.before && skip > 0) {
    pipeline.push({ $skip: skip });
  }

  // Fetch limit + 1 to determine hasMore without requiring an extra expensive query
  pipeline.push({ $limit: limit + 1 });

  const rawNotifications: INotificationDTO[] = await Notification.aggregate(pipeline);
  const hasMore = rawNotifications.length > limit;
  const notifications = hasMore ? rawNotifications.slice(0, limit) : rawNotifications;

  const total = userObjectId
    ? await Notification.countDocuments({ deletedBy: { $ne: userObjectId } })
    : await Notification.countDocuments();
  const totalPages = Math.ceil(total / limit);

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
