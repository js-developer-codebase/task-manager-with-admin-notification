import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  page: number;
  toast: AppNotification | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  loadingMore: false,
  hasMore: false,
  page: 1,
  toast: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<
        AppNotification[] | { notifications: AppNotification[]; hasMore?: boolean; page?: number }
      >
    ) => {
      if (Array.isArray(action.payload)) {
        state.notifications = action.payload;
        state.hasMore = false;
        state.page = 1;
      } else {
        state.notifications = action.payload.notifications;
        state.hasMore = action.payload.hasMore ?? false;
        state.page = action.payload.page ?? 1;
      }
      state.loading = false;
    },
    appendNotifications: (
      state,
      action: PayloadAction<{ notifications: AppNotification[]; hasMore: boolean; page: number }>
    ) => {
      const existingIds = new Set(state.notifications.map((n) => n._id));
      const newItems = action.payload.notifications.filter((n) => !existingIds.has(n._id));
      state.notifications.push(...newItems);
      state.hasMore = action.payload.notifications.length > 0 ? action.payload.hasMore : false;
      state.page = action.payload.page;
      state.loadingMore = false;
    },
    setLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.loadingMore = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      // Check if already exists to prevent duplicate
      const exists = state.notifications.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
      // Show toast alert for incoming real-time notification
      state.toast = action.payload;
    },
    markAsReadInList: (state, action: PayloadAction<string>) => {
      const item = state.notifications.find((n) => n._id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    removeNotificationInList: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n._id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    clearToast: (state) => {
      state.toast = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.hasMore = false;
      state.page = 1;
      state.loadingMore = false;
      state.toast = null;
      state.loading = false;
    },
    setNotificationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

const {
  setNotifications,
  appendNotifications,
  setLoadingMore,
  setUnreadCount,
  addNotification,
  markAsReadInList,
  removeNotificationInList,
  clearToast,
  clearNotifications,
  setNotificationLoading,
} = notificationSlice.actions;

const notificationReducer = notificationSlice.reducer;

export {
  notificationSlice,
  notificationReducer,
  setNotifications,
  appendNotifications,
  setLoadingMore,
  setUnreadCount,
  addNotification,
  markAsReadInList,
  removeNotificationInList,
  clearToast,
  clearNotifications,
  setNotificationLoading,
};
export default notificationReducer;
