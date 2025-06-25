// features/snackbar/snackbarSlice.jsx
// import { createSlice } from '@reduxjs/toolkit'

// const snackbarSlice = createSlice({
//   name: 'snackbar',
//   initialState: {
//     open: false,
//     message: '',
//     severity: 'info',
//   },
//   reducers: {
//     showSnackbar: (state, action) => {
//       state.open = true
//       state.message = action.payload.message
//       state.severity = action.payload.severity
//     },
//     hideSnackbar: (state) => {
//       state.open = false
//       state.message = ''
//       state.severity = 'info'
//     },
//   },
// })

// export const { showSnackbar, hideSnackbar } = snackbarSlice.actions

// export default snackbarSlice.reducer

//! Refactor
// import { createSlice } from '@reduxjs/toolkit';
// import { nanoid } from 'nanoid';

// const snackbarSlice = createSlice({
//   name: 'snackbar',
//   initialState: {
//     messages: [],
//   },
//   reducers: {
//     showSnackbar: {
//       reducer(state, action) {
//         state.messages.push(action.payload);
//       },
//       prepare({ message, severity = 'info', duration = 6000 }) {
//         return {
//           payload: {
//             id: nanoid(),
//             message,
//             severity,
//             duration,
//           },
//         };
//       },
//     },
//     removeSnackbar: (state, action) => {
//       state.messages = state.messages.filter(
//         (msg) => msg.id !== action.payload
//       );
//     },
//   },
// });

// export const { showSnackbar, removeSnackbar } = snackbarSlice.actions;
// export default snackbarSlice.reducer;

//! last
// src/features/snackbar/snackbarSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState: {
    messages: [],
  },
  reducers: {
    showSnackbar: {
      reducer(state, action) {
        state.messages.push(action.payload);
      },
      prepare({ message, severity = 'info', duration = 6000, username = null, avatarUrl = null }) {
        return {
          payload: {
            id: nanoid(),
            message,
            severity,
            duration,
            username,
            avatarUrl,
          },
        };
      },
    },
    removeSnackbar: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg.id !== action.payload
      );
    },
  },
});

export const { showSnackbar, removeSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
