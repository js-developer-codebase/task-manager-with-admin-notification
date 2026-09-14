import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  readBy: Types.ObjectId[];
  deletedBy: Types.ObjectId[];
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
    deletedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimizing per-user queries and counts
notificationSchema.index({ readBy: 1 });
notificationSchema.index({ deletedBy: 1 });

const Notification = model<INotification>('Notification', notificationSchema);

export { Notification };
export default Notification;
