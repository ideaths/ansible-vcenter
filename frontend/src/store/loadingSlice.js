import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: localStorage.getItem('isLoading') === 'true',
    message: localStorage.getItem('loadingMessage') || ''
  },
  reducers: {
    startLoading: (state, action) => {
      state.isLoading = true;
      state.message = action.payload || '';
      localStorage.setItem('isLoading', 'true');
      localStorage.setItem('loadingMessage', action.payload || '');
    },
    stopLoading: (state) => {
      state.isLoading = false;
      state.message = '';
      localStorage.removeItem('isLoading');
      localStorage.removeItem('loadingMessage');
    }
  }
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
