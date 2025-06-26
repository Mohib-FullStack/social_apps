// // src/features/loading/loadingSlice.js
// // ===============================
// // 1️⃣ Redux Slice: loadingSlice.js
// // ===============================

// // src/features/loading/loadingSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const loadingSlice = createSlice({
//   name: 'loading',
//   initialState: {
//     items: [] // { id, label, type: 'overlay' | 'bar' | 'button', mode?, progress? }
//   },
//   reducers: {
//     startLoading: {
//       reducer(state, action) {
//         state.items.push(action.payload);
//       },
//       prepare({ id, label = '', type = 'overlay', mode = 'indeterminate', progress = 0 }) {
//         return {
//           payload: { id, label, type, mode, progress }
//         };
//       }
//     },
//     stopLoading: (state, action) => {
//       state.items = state.items.filter(item => item.id !== action.payload);
//     },
//     updateLoadingProgress: (state, action) => {
//       const item = state.items.find(i => i.id === action.payload.id);
//       if (item) item.progress = action.payload.progress;
//     },
//     clearAllLoading: (state) => {
//       state.items = [];
//     }
//   }
// });

// export const { startLoading, stopLoading, updateLoadingProgress, clearAllLoading } = loadingSlice.actions;
// export default loadingSlice.reducer;






//! original
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
    animationType: 'wave', // 'wave', 'pulse', or 'bar'
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
      if (action.payload.progress !== undefined)
        state.progress = action.payload.progress;
      if (action.payload.variant) state.variant = action.payload.variant;
      if (action.payload.animationType)
        state.animationType = action.payload.animationType;
    },
    stopLoading: (state) => {
      state.isLoading = false;
      state.message = '';
      state.progress = 0;
      state.key = null;
    },
  },
});

export const { startLoading, stopLoading, updateLoading } =
  loadingSlice.actions;
export default loadingSlice.reducer;
