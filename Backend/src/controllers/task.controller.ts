import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { TaskStatus } from '../models/task.model.js';

const VALID_STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(ERROR_CODES.UNAUTHORIZED.status).json({
        success: false,
        code: ERROR_CODES.UNAUTHORIZED.code,
        message: ERROR_CODES.UNAUTHORIZED.message,
      });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(ERROR_CODES.BAD_REQUEST.status).json({
        success: false,
        code: ERROR_CODES.BAD_REQUEST.code,
        message: 'Task title is required',
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(ERROR_CODES.BAD_REQUEST.status).json({
        success: false,
        code: ERROR_CODES.BAD_REQUEST.code,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const task = await taskService.createTask(title, description, status, userId);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role!;

    const { page, limit, status, search, targetUserId } = req.query;

    const result = await taskService.getTasks(
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        status: status as string,
        search: search as string,
        userId: targetUserId as string,
      },
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      data: result.tasks,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTaskStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role!;

    const stats = await taskService.getTaskStats(userId, userRole);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id as string;
    const userId = req.user?.id!;
    const userRole = req.user?.role!;

    const task = await taskService.getTaskById(taskId, userId, userRole);

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id as string;
    const userId = req.user?.id!;
    const userRole = req.user?.role!;
    const { title, description, status } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(ERROR_CODES.BAD_REQUEST.status).json({
        success: false,
        code: ERROR_CODES.BAD_REQUEST.code,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const updatedTask = await taskService.updateTask(
      taskId,
      { title, description, status },
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id as string;
    const userId = req.user?.id!;
    const userRole = req.user?.role!;

    await taskService.deleteTask(taskId, userId, userRole);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const taskController = {
  createTask,
  getTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  deleteTask,
};

export {
  taskController,
  createTask,
  getTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  deleteTask,
};
export default taskController;
