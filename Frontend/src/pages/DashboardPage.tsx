import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Badge } from '../components/ui/badge.js';
import { TaskModal } from '../components/TaskModal.js';
import { api } from '../services/api.js';
import { useAppDispatch, useAppSelector } from '../redux/hooks.js';
import { logout } from '../redux/slices/authSlice.js';
import {
  setTasks,
  addTask,
  updateTaskInList,
  removeTaskFromList,
  setTaskStats,
  setTaskLoading,
  setTaskError,
  type Task,
  type TaskStatus,
} from '../redux/slices/taskSlice.js';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { tasks, stats, pagination, loading, error } = useAppSelector((state) => state.tasks);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      dispatch(setTaskLoading(true));
      const res = await api.getTasks(currentPage, 9, statusFilter, search);
      dispatch(
        setTasks({
          tasks: res.data,
          pagination: res.pagination,
        })
      );
    } catch (err: any) {
      dispatch(setTaskError(err.message || 'Failed to fetch tasks'));
    }
  }, [currentPage, statusFilter, search, dispatch]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.getTaskStats();
      dispatch(setTaskStats(res.data));
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, [dispatch]);

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [loadTasks, loadStats]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = async (title: string, description: string, status: TaskStatus) => {
    if (editingTask) {
      const res = await api.updateTask(editingTask._id, title, description, status);
      dispatch(updateTaskInList(res.data));
    } else {
      const res = await api.createTask(title, description, status);
      dispatch(addTask(res.data));
    }
    loadStats();
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(id);
      dispatch(removeTaskFromList(id));
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'Pending':
        return 'pending';
      case 'In Progress':
        return 'inProgress';
      case 'Completed':
        return 'completed';
      default:
        return 'default';
    }
  };

  const totalTasksCount = (stats.Pending || 0) + (stats['In Progress'] || 0) + (stats.Completed || 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              T
            </div>
            <h1 className="text-xl font-bold text-slate-800">Task Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
              <div className="flex items-center justify-end space-x-1">
                <span className="text-xs text-slate-500">{user?.email}</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono uppercase">
                  {user?.role}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* KPI Status Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
              <CardTitle className="text-2xl font-bold">{totalTasksCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending</p>
              <CardTitle className="text-2xl font-bold text-amber-700">{stats.Pending || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">In Progress</p>
              <CardTitle className="text-2xl font-bold text-blue-700">{stats['In Progress'] || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed</p>
              <CardTitle className="text-2xl font-bold text-emerald-700">{stats.Completed || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Action Controls & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-1 items-center gap-3">
            <div className="w-full sm:max-w-xs">
              <Input
                type="text"
                placeholder="Search tasks by title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <Button onClick={handleOpenCreate} className="whitespace-nowrap">
            + Add New Task
          </Button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Task Grid / List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-2"></div>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-base font-medium text-slate-700">No tasks found</p>
            <p className="text-sm text-slate-500 mt-1">Get started by creating your first task.</p>
            <Button onClick={handleOpenCreate} className="mt-4">
              Create Task
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task._id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                      {task.title}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line">
                      {task.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0 pb-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3">
                    <span>
                      {new Date(task.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {task.user?.name && (
                      <span className="font-medium text-slate-500 truncate max-w-[120px]">
                        By: {task.user.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(task)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task._id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-xs">
            <div className="text-sm text-slate-600">
              Showing page <span className="font-medium">{pagination.page}</span> of{' '}
              <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} total)
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Task Add / Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export { DashboardPage };
export default DashboardPage;
