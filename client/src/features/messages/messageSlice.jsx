// features/messages/messageSlice.js
import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: {}, // userId: [messages...]
  },
  reducers: {
   receiveMessage: (state, action) => {
  const { senderId, receiverId, content, timestamp } = action.payload;
  const partnerId = senderId; // or receiverId if currentUser is sender

  if (!state.conversations[partnerId]) {
    state.conversations[partnerId] = [];
  }

  state.conversations[partnerId].push({
    content,
    timestamp,
    incoming: true,
  });
}

  },
});

export const { receiveMessage } = messageSlice.actions;
export default messageSlice.reducer;
