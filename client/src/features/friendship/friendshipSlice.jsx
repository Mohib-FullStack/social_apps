// src/features/friendship/friendshipSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

// Thunks matching the controller logic
// export const sendFriendRequest = createAsyncThunk(
//   'friendship/sendFriendRequest',
//   async ({ targetUserId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/requests', { friendId: targetUserId });
//       return {
//         friendship: res.data.friendship,
//         message: res.data.message
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to send friend request');
//     }
//   }
// );

export const sendFriendRequest = createAsyncThunk(
  'friendship/sendFriendRequest',
  async ({ targetUserId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/requests', { 
        friendId: targetUserId 
      });
      
      // Ensure the response has the expected structure
      return {
        friendship: {
          ...res.data.friendship,
          to: res.data.friendship.friendId // Add 'to' field
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send friend request');
    }
  }
);

export const cancelFriendRequest = createAsyncThunk(
  'friendship/cancelFriendRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/friendships/requests/${requestId}`);
      return requestId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to cancel request');
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friendship/acceptFriendRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/friendships/requests/${requestId}/accept`);
      return res.data.friendship;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to accept request');
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  'friendship/rejectFriendRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/friendships/requests/${requestId}/reject`);
      return res.data.friendship;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to reject request');
    }
  }
);

export const listFriends = createAsyncThunk(
  'friendship/listFriends',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/friendships');
      return res.data.payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch friends');
    }
  }
);

export const getPendingRequests = createAsyncThunk(
  'friendship/getPendingRequests',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/friendships/requests/pending');
      return res.data.payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get pending requests');
    }
  }
);

export const getSentRequests = createAsyncThunk(
  'friendship/getSentRequests',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/friendships/requests/sent');
      return res.data.payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get sent requests');
    }
  }
);

export const checkFriendshipStatus = createAsyncThunk(
  'friendship/checkFriendshipStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/friendships/status/${userId}`);
      return { userId, status: res.data.status };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to check friendship status');
    }
  }
);

export const removeFriendship = createAsyncThunk(
  'friendship/removeFriendship',
  async (friendshipId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/friendships/${friendshipId}`);
      return friendshipId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove friendship');
    }
  }
);

export const blockUser = createAsyncThunk(
  'friendship/blockUser',
  async (targetUserId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/block', { friendId: targetUserId });
      return res.data.friendship;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to block user');
    }
  }
);

export const unblockUser = createAsyncThunk(
  'friendship/unblockUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/friendships/block/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to unblock user');
    }
  }
);

const friendshipSlice = createSlice({
  name: 'friendship',
  initialState: {
    requests: [],
    friends: [],
    friendshipStatus: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
            // Update the sendFriendRequest.fulfilled reducer
.addCase(sendFriendRequest.fulfilled, (state, action) => {
  if (action.payload?.friendship) {
    // Transform the friendship object if needed
    const friendship = {
      ...action.payload.friendship,
      to: action.payload.friendship.friendId // Ensure 'to' exists
    };
    state.requests.push(friendship);
  }
  state.status = 'succeeded';
})
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload);
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.friends.push(action.payload);
        state.requests = state.requests.filter(r => r.id !== action.payload.id);
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload.id);
      })
      .addCase(listFriends.fulfilled, (state, action) => {
        state.friends = action.payload;
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        state.friendshipStatus[userId] = status;
      })
      .addCase(removeFriendship.fulfilled, (state, action) => {
        state.friends = state.friends.filter(f => f.id !== action.payload);
      })
      .addCase(blockUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(unblockUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addMatcher(
        (action) => action.type.startsWith('friendship/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('friendship/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'An error occurred';
        }
      );
  }
});

export default friendshipSlice.reducer;
