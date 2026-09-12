import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { StatsCards } from '../components/StatsCards.js';
import { TaskFilters } from '../components/TaskFilters.js';
import { TaskCard } from '../components/TaskCard.js';
import { Pagination } from '../components/Pagination.js';
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

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Debounce search query by 400ms to minimize network requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadTasks = useCallback(async () => {
    try {
      dispatch(setTaskLoading(true));
      const res = await api.getTasks(currentPage, 9, statusFilter, debouncedSearch);
      dispatch(
        setTasks({
          tasks: res.data,
          pagination: res.pagination,
        })
      );
    } catch (err: any) {
      dispatch(setTaskError(err.message || 'Failed to fetch tasks'));
    }
  }, [currentPage, statusFilter, debouncedSearch, dispatch]);

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
      const updated = {
        ...res.data,
        user: res.data.user || editingTask.user || (user ? { _id: user.id, name: user.name, email: user.email } : undefined),
      };
      dispatch(updateTaskInList(updated));
    } else {
      const res = await api.createTask(title, description, status);
      const newTask = {
        ...res.data,
        user: res.data.user || (user ? { _id: user.id, name: user.name, email: user.email } : undefined),
      };
      dispatch(addTask(newTask));
    }
    loadStats();
    loadTasks();
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

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8">
        {/* KPI Status Cards */}
        <StatsCards stats={stats} />

        {/* Action Controls & Search */}
        <TaskFilters
          search={searchInput}
          status={statusFilter}
          onSearchChange={(value) => setSearchInput(value)}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          onAddNewTask={handleOpenCreate}
        />

        {/* Error alert */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Task Grid / List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-base font-medium text-slate-700">No tasks found</p>
            <p className="mt-1 text-sm text-slate-500">Get started by creating your first task.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(page) => setCurrentPage(page)}
        />
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
