import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

// Constants
const FRIENDS_PER_PAGE = 10;
const SUGGESTIONS_LIMIT = 20;

// Helper: default pagination state
const createPaginatedState = () => ({
  data: [],
  pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
  status: 'idle',
  error: null,
});

// Thunks
// friendshipSlice.js
export const sendFriendRequest = createAsyncThunk(
  'friendship/sendFriendRequest',
  async ({ friendId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/requests', {
        friendId,
      });
      return res.data.friendship;
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        code: backendError?.code || 'UNKNOWN_ERROR',
        message: backendError?.message || 'Failed to send friend request',
      });
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friendship/acceptFriendRequest',
  async (friendshipId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/friendships/requests/${friendshipId}/accept`
      );
      // Change from res.data.data.friendship to res.data.friendship
      return res.data.data; // Now returns the entire data object
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Accept failed',
        friendshipId,
      });
    }
  }
);

// In friendshipSlice.js
export const rejectFriendRequest = createAsyncThunk(
  'friendship/rejectFriendRequest',
  async (friendshipId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/friendships/requests/${friendshipId}/reject`
      );
      return res.data.data; // Ensure this matches the controller response
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to reject request',
        friendshipId,
        code: error.response?.data?.code,
      });
    }
  }
);

export const cancelFriendRequest = createAsyncThunk(
  'friendship/cancelFriendRequest',
  async (friendshipId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/friendships/requests/${friendshipId}`);
      return friendshipId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to cancel request');
    }
  }
);

export const removeFriend = createAsyncThunk(
  'friendship/removeFriend',
  async (friendshipId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/friendships/${friendshipId}`);
      return friendshipId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove friend');
    }
  }
);

export const updateFriendshipTier = createAsyncThunk(
  'friendship/updateFriendshipTier',
  async ({ friendshipId, tier, customLabel }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/friendships/${friendshipId}/tier`,
        { tier, customLabel }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to update friendship tier'
      );
    }
  }
);

export const blockUser = createAsyncThunk(
  'friendship/blockUser',
  async (friendId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/block', { friendId });
      return res.data.data;
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

export const getPendingRequests = createAsyncThunk(
  'friendship/getPendingRequests',
  // async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
  async ({ page = 1, size = FRIENDSHIP_CONFIG.FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/friendships/requests/pending?page=${page}&size=${size}`
      );
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get pending requests');
    }
  }
);

export const getSentRequests = createAsyncThunk(
  'friendship/getSentRequests',
  async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/friendships/requests/sent?page=${page}&size=${size}`
      );
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to get sent requests'
      );
    }
  }
);

export const listFriends = createAsyncThunk(
  'friendship/listFriends',
  async (
    { userId, page = 1, size = FRIENDS_PER_PAGE } = {},
    { rejectWithValue }
  ) => {
    try {
      const url = userId
        ? `/friendships/${userId}/friends?page=${page}&size=${size}`
        : `/friendships?page=${page}&size=${size}`;
      const res = await axiosInstance.get(url);
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
        userId,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch friends');
    }
  }
);

export const getFriends = createAsyncThunk(
  'friendship/getFriends',
  async (
    { userId, page = 1, size = FRIENDSHIP_CONFIG.FRIENDS_PER_PAGE } = {},
    { rejectWithValue }
  ) => {
    try {
      const url = userId
        ? `/friendships/${userId}/friends?page=${page}&size=${size}`
        : `/friendships?page=${page}&size=${size}`;
      
      const res = await axiosInstance.get(url);
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
        userId: userId || 'current',
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch friends',
        userId,
        code: error.response?.data?.code,
      });
    }
  }
);

export const getMutualFriends = createAsyncThunk(
  'friendship/getMutualFriends',
  async (
    { userId, page = 1, size = FRIENDSHIP_CONFIG.FRIENDS_PER_PAGE },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.get(
        `/friendships/${userId}/mutual-friends?page=${page}&size=${size}`
      );
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
        userId,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch mutual friends'
      );
    }
  }
);

export const getFriendSuggestions = createAsyncThunk(
  'friendship/getFriendSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/friendships/suggestions?limit=${SUGGESTIONS_LIMIT}`
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to get friend suggestions'
      );
    }
  }
);

export const checkFriendshipStatus = createAsyncThunk(
  'friendship/checkFriendshipStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/friendships/status/${userId}`);
      return {
        userId,
        status: res.data.status,
        direction: res.data.direction,
        friendship: res.data.friendship,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to check friendship status'
      );
    }
  }
);

export const getFriendsByTier = createAsyncThunk(
  'friendship/getFriendsByTier',
  async ({ tier, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/friendships/tier/${tier}?page=${page}&size=${size}`
      );
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
        tier,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch friends by tier'
      );
    }
  }
);

export const getAllFriendshipTiers = createAsyncThunk(
  'friendship/getAllFriendshipTiers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/friendships/tiers');
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch friendship tiers'
      );
    }
  }
);

export const cleanupExpiredRequests = createAsyncThunk(
  'friendship/cleanupExpiredRequests',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete('/friendships/cleanup');
      return res.data.deletedCount;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to cleanup requests'
      );
    }
  }
);

// Initial state
const initialState = {
  friends: createPaginatedState(),
  mutualFriends: createPaginatedState(),
  pendingRequests: createPaginatedState(),
  sentRequests: createPaginatedState(),
  suggestions: { data: [], status: 'idle', error: null },
  tiers: { data: [], status: 'idle', error: null },
  friendsByTier: createPaginatedState(),
  current: createPaginatedState(),
  statusLookup: {},
  status: 'idle',
  error: null,
  lastAction: null,
};

// Slice
const friendshipSlice = createSlice({
  name: 'friendship',
  initialState,
  reducers: {
    resetStatus(state) {
      state.status = 'idle';
      state.error = null;
    },
    clearFriendshipData() {
      return initialState;
    },
    updateFriendshipStatus(state, action) {
      const { userId, status } = action.payload;
      state.statusLookup[userId] = status;
    },
  },
  extraReducers: (builder) => {
    builder
      //! Send friend request
      .addCase(sendFriendRequest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.sentRequests.data.unshift(action.payload);
        state.status = 'succeeded';
        state.lastAction = 'sendFriendRequest';
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      //! Cancel friend request
      .addCase(cancelFriendRequest.pending, (state) => {
        state.status = 'loading';
      })
.addCase(cancelFriendRequest.fulfilled, (state, action) => {
  state.sentRequests.data = state.sentRequests.data.filter(
    req => req.id !== action.payload
  );
  state.status = 'succeeded';
})
      .addCase(cancelFriendRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Accept friend request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const { friendship } = action.payload; // Now correctly destructured

        if (!friendship?.id) {
          console.error('Invalid friendship in response:', action.payload);
          throw new Error('Accepted friendship data is invalid');
        }

        // Remove from pending requests
        state.pendingRequests.data = state.pendingRequests.data.filter(
          (req) => req.id !== friendship.id
        );

        // Add to friends list
        state.friends.data.unshift(friendship);

        // Update status lookup for both users
        [friendship.userId, friendship.friendId].forEach((id) => {
          if (id) {
            state.statusLookup[id] = {
              status: 'accepted',
              friendship,
            };
          }
        });

        state.status = 'succeeded';
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Reject friend request
      .addCase(rejectFriendRequest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        const { friendship } = action.payload;

        // Remove from pending requests
        state.pendingRequests.data = state.pendingRequests.data.filter(
          (req) => req.id !== friendship.id
        );

        // Update status lookup
        state.statusLookup[friendship.friendId] = {
          status: 'rejected',
          friendship,
        };

        state.status = 'succeeded';
      })

      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Remove friendship
      .addCase(removeFriend.pending, (state) => {
        state.status = 'loading';
      })

      .addCase(removeFriend.fulfilled, (state, action) => {
  state.friends.data = state.friends.data.filter(
    friend => friend.id !== action.payload
  );
  state.status = 'succeeded';
})
     
      .addCase(removeFriend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update friendship tier
    .addCase(updateFriendshipTier.pending, (state) => {
  state.status = 'loading';
})
.addCase(updateFriendshipTier.fulfilled, (state, action) => {
  const index = state.friends.data.findIndex(
    f => f.id === action.payload.id
  );
  if (index !== -1) {
    state.friends.data[index] = action.payload;
  }
  state.status = 'succeeded';
})
.addCase(updateFriendshipTier.rejected, (state, action) => {
  state.status = 'failed';
  state.error = action.payload;
})

      // Block user
      .addCase(blockUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.friends.data = state.friends.data.filter(
          (friend) => friend.id !== action.payload.id
        );
        state.status = 'succeeded';
        state.lastAction = 'blockUser';
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Unblock user
      .addCase(unblockUser.pending, (state) => {
        state.status = 'loading';
      })
   .addCase(unblockUser.fulfilled, (state, action) => {
  state.status = 'succeeded';
})
      .addCase(unblockUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Get pending requests
    .addCase(getPendingRequests.pending, (state) => {
  state.pendingRequests.status = 'loading';
})
.addCase(getPendingRequests.fulfilled, (state, action) => {
  state.pendingRequests = {
    data: action.payload.data,
    pagination: action.payload.pagination,
    status: 'succeeded',
    error: null,
  };
})
.addCase(getPendingRequests.rejected, (state, action) => {
  state.pendingRequests.status = 'failed';
  state.pendingRequests.error = action.payload;
})

      // Get sent requests
      .addCase(getSentRequests.pending, (state) => {
        state.sentRequests.status = 'loading';
      })
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.sentRequests = {
          data: action.payload.data,
          pagination: action.payload.pagination,
          status: 'succeeded',
          error: null,
        };
      })
      .addCase(getSentRequests.rejected, (state, action) => {
        state.sentRequests.status = 'failed';
        state.sentRequests.error = action.payload;
      })

      // List friends
      .addCase(listFriends.pending, (state) => {
        state.friends.status = 'loading';
      })
      .addCase(listFriends.fulfilled, (state, action) => {
        state.friends = {
          data: action.payload.data,
          pagination: action.payload.pagination,
          status: 'succeeded',
          error: null,
        };
      })
      .addCase(listFriends.rejected, (state, action) => {
        state.friends.status = 'failed';
        state.friends.error = action.payload;
      })

      // Get friends (for any user)
     .addCase(getFriends.pending, (state, action) => {
  const userId = action.meta.arg.userId || 'current';
  state.friendsByUser[userId] = state.friendsByUser[userId] || createPaginatedState();
  state.friendsByUser[userId].status = 'loading';
})
.addCase(getFriends.fulfilled, (state, action) => {
  const { data, pagination, userId = 'current' } = action.payload;
  state.friendsByUser[userId] = {
    data,
    pagination,
    status: 'succeeded',
    error: null,
  };
})
.addCase(getFriends.rejected, (state, action) => {
  const userId = action.meta.arg.userId || 'current';
  state.friendsByUser[userId] = state.friendsByUser[userId] || createPaginatedState();
  state.friendsByUser[userId].status = 'failed';
  state.friendsByUser[userId].error = action.payload;
})

      // Get mutual friends
   .addCase(getMutualFriends.pending, (state) => {
  state.mutualFriends.status = 'loading';
})
.addCase(getMutualFriends.fulfilled, (state, action) => {
  state.mutualFriends = {
    data: action.payload.data,
    pagination: action.payload.pagination,
    status: 'succeeded',
    error: null,
  };
})
.addCase(getMutualFriends.rejected, (state, action) => {
  state.mutualFriends.status = 'failed';
  state.mutualFriends.error = action.payload;
})

      // Get friend suggestions
    .addCase(getFriendSuggestions.pending, (state) => {
  state.suggestions.status = 'loading';
})
.addCase(getFriendSuggestions.fulfilled, (state, action) => {
  state.suggestions = {
    data: action.payload,
    status: 'succeeded',
    error: null,
  };
})
.addCase(getFriendSuggestions.rejected, (state, action) => {
  state.suggestions.status = 'failed';
  state.suggestions.error = action.payload;
})

      // Check friendship status
         .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
  const { userId, status, direction, friendship } = action.payload;
  state.statusLookup[userId] = { status, direction, friendship };
})

      // Friends by tier
      .addCase(getFriendsByTier.pending, (state) => {
        state.friendsByTier.status = 'loading';
      })
      .addCase(getFriendsByTier.fulfilled, (state, action) => {
        state.friendsByTier = {
          data: action.payload.data,
          pagination: action.payload.pagination,
          status: 'succeeded',
          error: null,
        };
      })
      .addCase(getFriendsByTier.rejected, (state, action) => {
        state.friendsByTier.status = 'failed';
        state.friendsByTier.error = action.payload;
      })

      // Get all friendship tiers
      .addCase(getAllFriendshipTiers.pending, (state) => {
        state.tiers.status = 'loading';
      })
      .addCase(getAllFriendshipTiers.fulfilled, (state, action) => {
        state.tiers = {
          data: action.payload,
          status: 'succeeded',
          error: null,
        };
      })
      .addCase(getAllFriendshipTiers.rejected, (state, action) => {
        state.tiers.status = 'failed';
        state.tiers.error = action.payload;
      })

      // Cleanup expired requests
   .addCase(cleanupExpiredRequests.fulfilled, (state) => {
  state.status = 'succeeded';
  state.lastAction = 'cleanupExpiredRequests';
});
  },
});

export const { resetStatus, clearFriendshipData, updateFriendshipStatus } =
  friendshipSlice.actions;
export default friendshipSlice.reducer;
