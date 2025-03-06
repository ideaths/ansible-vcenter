import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: false,
    message: '',
    persist: false,
    startTime: null
  },
  reducers: {
    startLoading: (state, action) => {
      state.isLoading = true;
      state.message = action.payload?.message || '';
      state.persist = action.payload?.persist || false;
      state.startTime = new Date().toISOString();
      
      if (state.persist) {
        localStorage.setItem('loadingState', JSON.stringify({
          isLoading: true,
          message: state.message,
          persist: true,
          startTime: state.startTime
        }));
      }
    },
    stopLoading: (state) => {
      state.isLoading = false;
      state.message = '';
      state.persist = false;
      state.startTime = null;
      localStorage.removeItem('loadingState');
    },
    restoreLoadingState: (state) => {
      const savedState = localStorage.getItem('loadingState');
      if (savedState) {
        const { isLoading, message, persist, startTime } = JSON.parse(savedState);
        if (persist) {
          state.isLoading = isLoading;
          state.message = message;
          state.persist = persist;
          state.startTime = startTime;
        } else {
          localStorage.removeItem('loadingState');
        }
      }
    }
  }
});

export const { startLoading, stopLoading, restoreLoadingState } = loadingSlice.actions;
export default loadingSlice.reducer;
