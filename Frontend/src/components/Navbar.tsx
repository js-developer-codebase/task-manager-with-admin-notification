import { useState } from 'react';
import { NotificationBell } from './NotificationBell.js';
import { SendNotificationModal } from './SendNotificationModal.js';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const [sendModalOpen, setSendModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
            T
          </div>
          <h1 className="text-xl font-bold text-slate-800">Task Manager</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Admin Broadcast Button */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setSendModalOpen(true)}
              className="cursor-pointer rounded-md bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1"
            >
              <span>📢</span>
              <span className="hidden sm:inline">Broadcast</span>
            </button>
          )}

          {/* Real-time Notification Bell */}
          <NotificationBell />

          {/* User Profile Info */}
          <div className="hidden sm:block text-right border-l border-slate-200 pl-4">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
            <div className="flex items-center justify-end space-x-1">
              <span className="text-xs text-slate-500">{user?.email}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] uppercase text-slate-700">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Admin Broadcast Notification Modal */}
      {user?.role === 'admin' && (
        <SendNotificationModal
          isOpen={sendModalOpen}
          onClose={() => setSendModalOpen(false)}
        />
      )}
    </header>
  );
};

export { Navbar };
export default Navbar;
