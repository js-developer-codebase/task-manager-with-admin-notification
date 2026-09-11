import { Schema, model, Document, Types } from 'mongoose';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by user
taskSchema.index({ userId: 1, createdAt: -1 });

export const Task = model<ITask>('Task', taskSchema);
