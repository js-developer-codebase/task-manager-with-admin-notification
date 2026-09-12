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
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
            <div className="flex items-center justify-end space-x-1">
              <span className="text-xs text-slate-500">{user?.email}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] uppercase text-slate-700">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export { Navbar };
export default Navbar;
