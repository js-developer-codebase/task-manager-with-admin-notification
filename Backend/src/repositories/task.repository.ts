import { Types, PipelineStage } from 'mongoose';
import { Task, ITask } from '../models/task.model.js';

export interface TaskFilterOptions {
  userId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTasksResult {
  tasks: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Common aggregation projection pipeline stage for joining User details
 */
const getUserLookupStages = (): PipelineStage[] => [
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userDetails',
    },
  },
  {
    $unwind: {
      path: '$userDetails',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      _id: 1,
      title: 1,
      description: 1,
      status: 1,
      userId: 1,
      createdAt: 1,
      updatedAt: 1,
      user: {
        _id: '$userDetails._id',
        name: '$userDetails.name',
        email: '$userDetails.email',
      },
    },
  },
];

/**
 * Find single task by ID using MongoDB Aggregation Pipeline ($match + $lookup + $unwind + $project)
 */
const findById = async (id: string): Promise<any | null> => {
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id) } },
    ...getUserLookupStages(),
  ];

  const [task] = await Task.aggregate(pipeline);
  return task || null;
};

/**
 * Create task and return full joined task document using Aggregation Pipeline
 */
const create = async (taskData: Partial<ITask>): Promise<any> => {
  const task = new Task(taskData);
  const savedTask = await task.save();
  return await findById(savedTask._id.toString());
};

/**
 * MongoDB Aggregation Pipeline for Tasks:
 * Performs $match, $lookup (join with users), $project, and $facet for pagination + total count in a single query.
 */
const findWithAggregation = async (options: TaskFilterOptions): Promise<PaginatedTasksResult> => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 10);
  const skip = (page - 1) * limit;

  const baseMatch: Record<string, any> = {};

  if (options.userId) {
    baseMatch.userId = new Types.ObjectId(options.userId);
  }

  if (options.status) {
    baseMatch.status = options.status;
  }

  const pipeline: PipelineStage[] = [];

  if (Object.keys(baseMatch).length > 0) {
    pipeline.push({ $match: baseMatch });
  }

  pipeline.push(...getUserLookupStages());

  if (options.search && options.search.trim()) {
    const searchRegex = { $regex: options.search.trim(), $options: 'i' };
    pipeline.push({
      $match: {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'user.name': searchRegex },
          { 'user.email': searchRegex },
        ],
      },
    });
  }

  pipeline.push({
    $facet: {
      data: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
      metadata: [
        { $count: 'total' },
      ],
    },
  });

  const [result] = await Task.aggregate(pipeline);

  const total = result.metadata[0] ? result.metadata[0].total : 0;
  const tasks = result.data || [];
  const totalPages = Math.ceil(total / limit);

  return {
    tasks,
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Aggregation pipeline to calculate task status summary/statistics ($match + $group)
 */
const getTaskStats = async (userId?: string): Promise<{ [key: string]: number }> => {
  const matchConditions: Record<string, any> = {};
  if (userId) {
    matchConditions.userId = new Types.ObjectId(userId);
  }

  const stats = await Task.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const result: { [key: string]: number } = {
    Pending: 0,
    'In Progress': 0,
    Completed: 0,
  };

  stats.forEach((item: { _id: string; count: number }) => {
    if (item._id) {
      result[item._id] = item.count;
    }
  });

  return result;
};

/**
 * Update task by ID and return updated document with Aggregation Pipeline
 */
const updateById = async (id: string, updateData: Partial<ITask>): Promise<any> => {
  await Task.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return await findById(id);
};

const deleteById = async (id: string): Promise<ITask | null> => {
  return await Task.findByIdAndDelete(id);
};

const taskRepository = {
  create,
  findById,
  findWithAggregation,
  getTaskStats,
  updateById,
  deleteById,
};

export { taskRepository };
export default taskRepository;
