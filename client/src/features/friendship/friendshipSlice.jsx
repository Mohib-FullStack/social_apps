import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from "../../axiosInstance";

// Helper function to find friendship index
const findFriendshipIndex = (state, userId, friendId) => {
  return state.friendships.findIndex(
    f => 
      (f.userId === userId && f.friendId === friendId) ||
      (f.userId === friendId && f.friendId === userId)
  );
};

// Send a friend request
export const sendFriendRequest = createAsyncThunk(
  'friendship/sendFriendRequest',
  async ({ userId, friendId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/request', {
        userId,
        friendId
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to send friend request');
    }
  }
);

// Accept friend request
export const acceptFriendRequest = createAsyncThunk(
  'friendship/acceptFriendRequest',
  async ({ userId, friendId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/accept', {
        userId,
        friendId
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to accept friend request');
    }
  }
);


// Reject friend request
export const rejectFriendRequest = createAsyncThunk(
  'friendship/rejectFriendRequest',
  async ({ userId, friendId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/reject', {
        userId,
        friendId
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to reject friend request');
    }
  }
);

// Fetch current user's friendships
export const fetchFriendships = createAsyncThunk(
  'friendship/fetchFriendships',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/friendships/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch friendships');
    }
  }
);

// Remove a friendship
export const removeFriendship = createAsyncThunk(
  'friendship/removeFriendship',
  async ({ userId, friendId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete('/friendships', {
        data: { userId, friendId }
      });
      return { userId, friendId, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to remove friendship');
    }
  }
);

const friendshipSlice = createSlice({
  name: 'friendship',
  initialState: {
    friendships: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    operationStatus: 'idle', // Tracks individual operation status
    operationError: null
  },
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = 'idle';
      state.operationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch friendships
      .addCase(fetchFriendships.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFriendships.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.friendships = action.payload;
      })
      .addCase(fetchFriendships.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Send friend request
      .addCase(sendFriendRequest.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        const existingIndex = findFriendshipIndex(state, action.payload.userId, action.payload.friendId);
        if (existingIndex === -1) {
          state.friendships.push(action.payload);
        }
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Accept friend request
      .addCase(acceptFriendRequest.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        const idx = findFriendshipIndex(state, action.payload.userId, action.payload.friendId);
        if (idx !== -1) {
          state.friendships[idx] = action.payload;
        }
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Reject friend request
      .addCase(rejectFriendRequest.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        state.friendships = state.friendships.filter(
          f => !(f.userId === action.payload.userId && f.friendId === action.payload.friendId)
        );
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Remove friendship
      .addCase(removeFriendship.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(removeFriendship.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        state.friendships = state.friendships.filter
          f => !(
            (f.userId === action.payload.userId && f.friendId === action.payload.friendId) ||
            (f.userId === action.payload.friendId && f.friendId === action.payload.userId)
          )
      })
      .addCase(removeFriendship.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      });
  }
});

export const { resetOperationStatus } = friendshipSlice.actions;
export default friendshipSlice.reducer;


