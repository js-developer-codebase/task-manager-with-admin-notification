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
  toast: AppNotification | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  toast: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<AppNotification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      state.loading = false;
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
    clearToast: (state) => {
      state.toast = null;
    },
    setNotificationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

const {
  setNotifications,
  addNotification,
  markAsReadInList,
  clearToast,
  setNotificationLoading,
} = notificationSlice.actions;

const notificationReducer = notificationSlice.reducer;

export {
  notificationSlice,
  notificationReducer,
  setNotifications,
  addNotification,
  markAsReadInList,
  clearToast,
  setNotificationLoading,
};
export default notificationReducer;
