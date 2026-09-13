import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks.js';
import { clearToast } from '../redux/slices/notificationSlice.js';

const NotificationToast = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.notifications.toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-blue-200 bg-white p-4 shadow-2xl transition-all animate-bounce">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
            🔔
          </span>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              New Notification
            </h5>
            <h6 className="text-sm font-semibold text-slate-900 mt-0.5">{toast.title}</h6>
          </div>
        </div>
        <button
          onClick={() => dispatch(clearToast())}
          className="cursor-pointer text-slate-400 hover:text-slate-600 text-sm"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-600 pl-9 line-clamp-3">{toast.message}</p>
    </div>
  );
};

export { NotificationToast };
export default NotificationToast;
