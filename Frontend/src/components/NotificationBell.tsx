import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks.js';
import {
  setNotifications,
  markAsReadInList,
  removeNotificationInList,
  appendNotifications,
  setLoadingMore,
  type AppNotification,
} from '../redux/slices/notificationSlice.js';
import { api } from '../services/api.js';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, hasMore, page, loadingMore } = useAppSelector(
    (state) => state.notifications
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || isFetchingRef.current) return;
    if (!hasMore && notifications.length > 0 && unreadCount === 0) return;

    try {
      isFetchingRef.current = true;
      dispatch(setLoadingMore(true));

      if (notifications.length === 0) {
        // If list is empty (e.g. all visible notifications deleted), fetch from top (page 1)
        const res = await api.getNotifications(1, 10);
        dispatch(
          setNotifications({
            notifications: res.data,
            hasMore: res.pagination?.hasMore ?? false,
            page: 1,
          })
        );
      } else {
        // Cursor: ID of the oldest notification currently in the list
        const oldestId = notifications[notifications.length - 1]._id;
        const nextPage = page + 1;
        const res = await api.getNotifications(nextPage, 10, oldestId);
        dispatch(
          appendNotifications({
            notifications: res.data,
            hasMore: res.pagination?.hasMore ?? false,
            page: nextPage,
          })
        );
      }
    } catch (err) {
      console.error('Failed to load more notifications:', err);
    } finally {
      dispatch(setLoadingMore(false));
      isFetchingRef.current = false;
    }
  }, [dispatch, hasMore, loadingMore, notifications, page, unreadCount]);

  const handleScroll = () => {
    if (!listRef.current || loadingMore || !hasMore || isFetchingRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 40) {
      loadMore();
    }
  };

  // Auto-refill when notifications list is empty or does not fill the dropdown (scrollbar removed)
  // but more notifications are available in the database
  useEffect(() => {
    if (!isOpen || loadingMore || isFetchingRef.current) return;

    // If list is empty but notifications exist on server, immediately fetch top batch
    if (notifications.length === 0 && (unreadCount > 0 || hasMore)) {
      loadMore();
      return;
    }

    if (hasMore) {
      const timer = setTimeout(() => {
        if (listRef.current) {
          const { scrollHeight, clientHeight } = listRef.current;
          // If content is not overflowing (no scrollbar) or near bottom
          if (scrollHeight <= clientHeight + 20) {
            loadMore();
          }
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, notifications.length, hasMore, unreadCount, loadingMore, loadMore]);

  const handleMarkAsRead = async (notification: AppNotification) => {
    if (notification.isRead) return;
    try {
      await api.markNotificationAsRead(notification._id);
      dispatch(markAsReadInList(notification._id));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      dispatch(removeNotificationInList(id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        {/* Bell SVG */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
            <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar"
          >
            {notifications.length === 0 ? (
              loadingMore ? (
                <div className="flex items-center justify-center py-8 text-xs text-slate-500 gap-1.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" />
                  <span>Loading notifications...</span>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">
                  No notifications yet
                </div>
              )
            ) : (
              <>
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleMarkAsRead(n)}
                    className={`group relative cursor-pointer p-4 text-left transition-colors hover:bg-slate-50 ${
                      !n.isRead ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                        <h5
                          className={`text-sm truncate ${
                            !n.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {n.title}
                        </h5>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          onClick={(e) => handleDeleteNotification(e, n._id)}
                          className="cursor-pointer rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{n.message}</p>
                  </div>
                ))}

                {loadingMore && (
                  <div className="flex items-center justify-center py-3 text-xs text-slate-500 gap-1.5 bg-slate-50">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" />
                    <span>Loading more notifications...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { NotificationBell };
export default NotificationBell;
