import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: false,
    message: '',
    persist: false
  },
  reducers: {
    startLoading: (state, action) => {
      state.isLoading = true;
      state.message = action.payload?.message || '';
      state.persist = action.payload?.persist || false;
      
      if (state.persist) {
        // Chuyển sang dùng localStorage
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
