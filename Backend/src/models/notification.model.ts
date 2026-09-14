import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDTO {
  _id: string | Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for optimizing per-user unread count and queries
notificationSchema.index({ readBy: 1 });

const Notification = model<INotification>('Notification', notificationSchema);

export { Notification };
export default Notification;
