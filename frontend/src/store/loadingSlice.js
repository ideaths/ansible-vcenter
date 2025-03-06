import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: false,
    message: ''
  },
  reducers: {
    startLoading: (state, action) => {
      state.isLoading = true;
      state.message = action.payload || '';
      // Lưu state vào localStorage
      localStorage.setItem('loadingState', JSON.stringify({
        isLoading: true,
        message: action.payload || ''
      }));
    },
    stopLoading: (state) => {
      state.isLoading = false;
      state.message = '';
      // Xóa state khỏi localStorage
      localStorage.removeItem('loadingState');
    },
    // Thêm action để khôi phục state
    restoreLoadingState: (state) => {
      const savedState = localStorage.getItem('loadingState');
      if (savedState) {
        const { isLoading, message } = JSON.parse(savedState);
        state.isLoading = isLoading;
        state.message = message;
      }
    }
  }
});

export const { startLoading, stopLoading, restoreLoadingState } = loadingSlice.actions;
export default loadingSlice.reducer;
