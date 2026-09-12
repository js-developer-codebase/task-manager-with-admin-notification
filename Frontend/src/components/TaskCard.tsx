import type { Task, TaskStatus } from '../redux/slices/taskSlice.js';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const getStatusBadgeClass = (status: TaskStatus) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold leading-snug text-slate-900">{task.title}</h4>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
              task.status
            )}`}
          >
            {task.status}
          </span>
        </div>
        {task.description && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-3 whitespace-pre-line">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {new Date(task.createdAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {task.user?.name && (
            <span className="max-w-[130px] truncate font-medium text-slate-500">
              By: {task.user.name}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="cursor-pointer rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="cursor-pointer rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export { TaskCard };
export default TaskCard;
