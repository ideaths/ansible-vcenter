import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './loadingSlice';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Bỏ qua kiểm tra serializable cho các action và path cụ thể
        ignoredActions: ['loading/startLoading', 'loading/stopLoading'],
        ignoredPaths: ['loading.message'],
      },
    }),
});

export default store;
