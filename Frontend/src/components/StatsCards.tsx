import type { TaskStats } from '../redux/slices/taskSlice.js';

interface StatsCardsProps {
  stats: TaskStats;
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const totalTasks = (stats.Pending || 0) + (stats['In Progress'] || 0) + (stats.Completed || 0);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Tasks</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{totalTasks}</p>
      </div>

      <div className="rounded-xl border border-l-4 border-slate-200 border-l-amber-500 bg-white p-5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-600">Pending</p>
        <p className="mt-1 text-2xl font-bold text-amber-700">{stats.Pending || 0}</p>
      </div>

      <div className="rounded-xl border border-l-4 border-slate-200 border-l-blue-500 bg-white p-5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">In Progress</p>
        <p className="mt-1 text-2xl font-bold text-blue-700">{stats['In Progress'] || 0}</p>
      </div>

      <div className="rounded-xl border border-l-4 border-slate-200 border-l-emerald-500 bg-white p-5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">Completed</p>
        <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.Completed || 0}</p>
      </div>
    </div>
  );
};

export { StatsCards };
export default StatsCards;
