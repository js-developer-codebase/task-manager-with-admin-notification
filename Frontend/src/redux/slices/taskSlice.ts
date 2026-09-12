import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskFilters {
  search: string;
  status: string;
  page: number;
  limit: number;
}

export interface TaskStats {
  Pending: number;
  'In Progress': number;
  Completed: number;
}

export interface TaskState {
  tasks: Task[];
  stats: TaskStats;
  pagination: Pagination;
  filters: TaskFilters;
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  stats: {
    Pending: 0,
    'In Progress': 0,
    Completed: 0,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: '',
    page: 1,
    limit: 10,
  },
  selectedTask: null,
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (
      state,
      action: PayloadAction<{ tasks: Task[]; pagination: Pagination }>
    ) => {
      state.tasks = action.payload.tasks;
      state.pagination = action.payload.pagination;
      state.loading = false;
      state.error = null;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
      state.pagination.total += 1;
      state.stats[action.payload.status] = (state.stats[action.payload.status] || 0) + 1;
    },
    updateTaskInList: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.selectedTask?._id === action.payload._id) {
        state.selectedTask = action.payload;
      }
    },
    removeTaskFromList: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    setTaskStats: (state, action: PayloadAction<TaskStats>) => {
      state.stats = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setTaskLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTaskError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

const {
  setTasks,
  addTask,
  updateTaskInList,
  removeTaskFromList,
  setTaskStats,
  setFilters,
  setSelectedTask,
  setTaskLoading,
  setTaskError,
} = taskSlice.actions;

const taskReducer = taskSlice.reducer;

export {
  taskSlice,
  taskReducer,
  setTasks,
  addTask,
  updateTaskInList,
  removeTaskFromList,
  setTaskStats,
  setFilters,
  setSelectedTask,
  setTaskLoading,
  setTaskError,
};
export default taskReducer;
