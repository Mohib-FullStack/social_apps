// features/loading/loadingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: false,
    message: 'Loading...',
    progress: 0,
    variant: 'indeterminate', // 'determinate' or 'indeterminate'
    key: null,
    animationType: 'wave' // 'wave', 'pulse', or 'bar'
  },
  reducers: {
    startLoading: (state, action) => {
      state.isLoading = true;
      state.message = action.payload?.message || 'Loading...';
      state.progress = action.payload?.progress || 0;
      state.variant = action.payload?.variant || 'indeterminate';
      state.key = action.payload?.key || null;
      state.animationType = action.payload?.animationType || 'wave';
    },
    updateLoading: (state, action) => {
      if (action.payload.message) state.message = action.payload.message;
      if (action.payload.progress !== undefined) state.progress = action.payload.progress;
      if (action.payload.variant) state.variant = action.payload.variant;
      if (action.payload.animationType) state.animationType = action.payload.animationType;
    },
    stopLoading: (state) => {
      state.isLoading = false;
      state.message = '';
      state.progress = 0;
      state.key = null;
    }
  }
});

export const { startLoading, stopLoading, updateLoading } = loadingSlice.actions;
export default loadingSlice.reducer;