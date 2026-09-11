import { Types } from 'mongoose';
import { taskRepository, TaskFilterOptions } from '../repositories/task.repository.js';
import { ERROR_CODES, AppError } from '../constants/errorCodes.js';
import { TaskStatus } from '../models/task.model.js';

const createTask = async (
  title: string,
  description: string = '',
  status: TaskStatus = 'Pending',
  userId: string
) => {
  if (!title || title.trim() === '') {
    throw new AppError(ERROR_CODES.BAD_REQUEST, 'Task title is required');
  }

  return await taskRepository.create({
    title: title.trim(),
    description: description.trim(),
    status,
    userId: new Types.ObjectId(userId),
  });
};

const getTasks = async (
  options: TaskFilterOptions,
  currentUserId: string,
  currentUserRole: string
) => {
  // Regular users can only access their own tasks; admins can query all or specific users
  const queryOptions: TaskFilterOptions = {
    ...options,
    userId: currentUserRole === 'admin' ? options.userId : currentUserId,
  };

  return await taskRepository.findWithAggregation(queryOptions);
};

const getTaskStats = async (currentUserId: string, currentUserRole: string) => {
  const targetUserId = currentUserRole === 'admin' ? undefined : currentUserId;
  return await taskRepository.getTaskStats(targetUserId);
};

const getTaskById = async (taskId: string, currentUserId: string, currentUserRole: string) => {
  const task = await taskRepository.findById(taskId);
  if (!task) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'Task not found');
  }

  // Ownership check: regular user can only view their own task
  if (currentUserRole !== 'admin' && task.userId.toString() !== currentUserId) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  return task;
};

const updateTask = async (
  taskId: string,
  updateData: { title?: string; description?: string; status?: TaskStatus },
  currentUserId: string,
  currentUserRole: string
) => {
  const task = await taskRepository.findById(taskId);
  if (!task) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'Task not found');
  }

  // Ownership check: regular user can only update their own task
  if (currentUserRole !== 'admin' && task.userId.toString() !== currentUserId) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  const updatedTask = await taskRepository.updateById(taskId, updateData);
  if (!updatedTask) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'Task not found');
  }

  return updatedTask;
};

const deleteTask = async (taskId: string, currentUserId: string, currentUserRole: string) => {
  const task = await taskRepository.findById(taskId);
  if (!task) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'Task not found');
  }

  // Ownership check: regular user can only delete their own task
  if (currentUserRole !== 'admin' && task.userId.toString() !== currentUserId) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  const deletedTask = await taskRepository.deleteById(taskId);
  if (!deletedTask) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'Task not found');
  }

  return deletedTask;
};

const taskService = {
  createTask,
  getTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  deleteTask,
};

export { taskService };
export default taskService;
