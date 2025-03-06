import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: false,
    message: '',
    persist: false // thêm flag để kiểm soát việc persist
  },
  reducers: {
    startLoading: (state, action) => {
      state.isLoading = true;
      state.message = action.payload?.message || '';
      state.persist = action.payload?.persist || false;
      
      if (state.persist) {
        // Chỉ lưu vào localStorage nếu cần persist
        localStorage.setItem('loadingState', JSON.stringify({
          isLoading: true,
          message: state.message,
          persist: true
        }));
      }
    },
    stopLoading: (state) => {
      state.isLoading = false;
      state.message = '';
      state.persist = false;
      localStorage.removeItem('loadingState');
    },
    restoreLoadingState: (state) => {
      const savedState = localStorage.getItem('loadingState');
      if (savedState) {
        const { isLoading, message, persist } = JSON.parse(savedState);
        // Chỉ khôi phục nếu trạng thái trước đó được đánh dấu persist
        if (persist) {
          state.isLoading = isLoading;
          state.message = message;
          state.persist = persist;
        } else {
          localStorage.removeItem('loadingState');
        }
      }
    }
  }
});

export const { startLoading, stopLoading, restoreLoadingState } = loadingSlice.actions;
export default loadingSlice.reducer;
