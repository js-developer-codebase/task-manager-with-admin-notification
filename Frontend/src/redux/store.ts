import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice.js';
import { taskReducer } from './slices/taskSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
export default store;
