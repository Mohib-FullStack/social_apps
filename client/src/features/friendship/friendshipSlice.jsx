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
// export const sendFriendRequest = createAsyncThunk(
//   'friendship/sendFriendRequest',
//   async ({ friendId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/requests', { friendId });
//       return {
//         ...res.data.friendship,
//         to: res.data.friendship.friendId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to send friend request');
//     }
//   }
// );

//! new
// friendshipSlice.js
export const sendFriendRequest = createAsyncThunk(
  'friendship/sendFriendRequest',
  async ({ friendId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/requests', { friendId });
      return res.data.friendship;
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        code: backendError?.code || 'UNKNOWN_ERROR',
        message: backendError?.message || 'Failed to send friend request'
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


export const acceptFriendRequest = createAsyncThunk(
  'friendship/acceptFriendRequest',
  async (friendshipId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/friendships/requests/${friendshipId}/accept`);
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

export const rejectFriendRequest = createAsyncThunk(
  'friendship/rejectFriendRequest',
  async (friendshipId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/friendships/requests/${friendshipId}/reject`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to reject request');
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

export const updateFriendshipTier = createAsyncThunk(
  'friendship/updateFriendshipTier',
  async ({ friendshipId, tier, customLabel }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/friendships/${friendshipId}/tier`, { tier, customLabel });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update friendship tier');
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
  async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/friendships/requests/pending?page=${page}&size=${size}`);
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
      const res = await axiosInstance.get(`/friendships/requests/sent?page=${page}&size=${size}`);
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get sent requests');
    }
  }
);

export const listFriends = createAsyncThunk(
  'friendship/listFriends',
  async ({ userId, page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
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

export const getMutualFriends = createAsyncThunk(
  'friendship/getMutualFriends',
  async ({ userId, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/friendships/${userId}/mutual-friends?page=${page}&size=${size}`);
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
        userId,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch mutual friends');
    }
  }
);

export const getFriendSuggestions = createAsyncThunk(
  'friendship/getFriendSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/friendships/suggestions?limit=${SUGGESTIONS_LIMIT}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get friend suggestions');
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
      return rejectWithValue(error.response?.data || 'Failed to check friendship status');
    }
  }
);

export const getFriendsByTier = createAsyncThunk(
  'friendship/getFriendsByTier',
  async ({ tier, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/friendships/tier/${tier}?page=${page}&size=${size}`);
      return {
        data: res.data.payload.data,
        pagination: res.data.payload.pagination,
        tier,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch friends by tier');
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
      return rejectWithValue(error.response?.data || 'Failed to fetch friendship tiers');
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
      return rejectWithValue(error.response?.data || 'Failed to cleanup requests');
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
      // Send friend request
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

      // Cancel friend request
      .addCase(cancelFriendRequest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.sentRequests.data = state.sentRequests.data.filter(
          (req) => req.id !== action.payload
        );
        state.status = 'succeeded';
        state.lastAction = 'cancelFriendRequest';
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
    req => req.id !== friendship.id
  );
        
           
   
  // Add to friends list
  state.friends.data.unshift(friendship);
  
  // Update status lookup for both users
  [friendship.userId, friendship.friendId].forEach(id => {
    if (id) {
      state.statusLookup[id] = { 
        status: 'accepted',
        friendship 
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
        const friendship = action.payload;
        state.pendingRequests.data = state.pendingRequests.data.filter(
          req => req.id !== friendship.id
        );
        state.status = 'succeeded';
        state.lastAction = 'rejectFriendRequest';
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Remove friendship
      .addCase(removeFriendship.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeFriendship.fulfilled, (state, action) => {
        state.friends.data = state.friends.data.filter(
          friend => friend.id !== action.payload
        );
        state.status = 'succeeded';
        state.lastAction = 'removeFriendship';
      })
      .addCase(removeFriendship.rejected, (state, action) => {
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
        state.lastAction = 'updateFriendshipTier';
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
          friend => friend.id !== action.payload.id
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
      .addCase(unblockUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.lastAction = 'unblockUser';
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

export const { resetStatus, clearFriendshipData, updateFriendshipStatus } = friendshipSlice.actions;
export default friendshipSlice.reducer;







//! running
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // Constants
// const FRIENDS_PER_PAGE = 10;
// const SUGGESTIONS_LIMIT = 20;

// // Helper: default pagination state
// const createPaginatedState = () => ({
//   data: [],
//   pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
//   status: 'idle',
//   error: null,
// });

// // Thunks
// export const sendFriendRequest = createAsyncThunk(
//   'friendship/sendFriendRequest',
//   async ({ friendId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/requests', { friendId });
//       return {
//         ...res.data.friendship,
//         to: res.data.friendship.friendId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to send friend request');
//     }
//   }
// );




// export const cancelFriendRequest = createAsyncThunk(
//   'friendship/cancelFriendRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/requests/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cancel request');
//     }
//   }
// );

// export const acceptFriendRequest = createAsyncThunk(
//   'friendship/acceptFriendRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${friendshipId}/accept`);
//       return res.data.data.friendship;
//     } catch (error) {
//       return rejectWithValue({
//         message: error.response?.data?.message || 'Accept failed',
//         friendshipId,
//       });
//     }
//   }
// );

// export const rejectFriendRequest = createAsyncThunk(
//   'friendship/rejectFriendRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${friendshipId}/reject`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to reject request');
//     }
//   }
// );

// export const removeFriendship = createAsyncThunk(
//   'friendship/removeFriendship',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to remove friendship');
//     }
//   }
// );

// export const updateFriendshipTier = createAsyncThunk(
//   'friendship/updateFriendshipTier',
//   async ({ friendshipId, tier, customLabel }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/${friendshipId}/tier`, { tier, customLabel });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to update friendship tier');
//     }
//   }
// );

// export const blockUser = createAsyncThunk(
//   'friendship/blockUser',
//   async (friendId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/block', { friendId });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to block user');
//     }
//   }
// );

// export const unblockUser = createAsyncThunk(
//   'friendship/unblockUser',
//   async (userId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/block/${userId}`);
//       return userId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to unblock user');
//     }
//   }
// );

// export const getPendingRequests = createAsyncThunk(
//   'friendship/getPendingRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/pending?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get pending requests');
//     }
//   }
// );

// export const getSentRequests = createAsyncThunk(
//   'friendship/getSentRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/sent?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get sent requests');
//     }
//   }
// );

// export const listFriends = createAsyncThunk(
//   'friendship/listFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const url = userId
//         ? `/friendships/${userId}/friends?page=${page}&size=${size}`
//         : `/friendships?page=${page}&size=${size}`;
//       const res = await axiosInstance.get(url);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends');
//     }
//   }
// );

// export const getMutualFriends = createAsyncThunk(
//   'friendship/getMutualFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/${userId}/mutual-friends?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch mutual friends');
//     }
//   }
// );

// export const getFriendSuggestions = createAsyncThunk(
//   'friendship/getFriendSuggestions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/suggestions?limit=${SUGGESTIONS_LIMIT}`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get friend suggestions');
//     }
//   }
// );

// export const checkFriendshipStatus = createAsyncThunk(
//   'friendship/checkFriendshipStatus',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/status/${userId}`);
//       return {
//         userId,
//         status: res.data.status,
//         direction: res.data.direction,
//         friendship: res.data.friendship,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to check friendship status');
//     }
//   }
// );

// export const getFriendsByTier = createAsyncThunk(
//   'friendship/getFriendsByTier',
//   async ({ tier, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/tier/${tier}?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         tier,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends by tier');
//     }
//   }
// );

// export const getAllFriendshipTiers = createAsyncThunk(
//   'friendship/getAllFriendshipTiers',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get('/friendships/tiers');
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friendship tiers');
//     }
//   }
// );

// export const cleanupExpiredRequests = createAsyncThunk(
//   'friendship/cleanupExpiredRequests',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.delete('/friendships/cleanup');
//       return res.data.deletedCount;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cleanup requests');
//     }
//   }
// );

// // Initial state
// const initialState = {
//   friends: createPaginatedState(),
//   mutualFriends: createPaginatedState(),
//   pendingRequests: createPaginatedState(),
//   sentRequests: createPaginatedState(),
//   suggestions: { data: [], status: 'idle', error: null },
//   tiers: { data: [], status: 'idle', error: null },
//   friendsByTier: createPaginatedState(),
//   statusLookup: {},
//   status: 'idle',
//   error: null,
//   lastAction: null,
// };

// // Slice
// const friendshipSlice = createSlice({
//   name: 'friendship',
//   initialState,
//   reducers: {
//     resetStatus(state) {
//       state.status = 'idle';
//       state.error = null;
//     },
//     clearFriendshipData() {
//       return initialState;
//     },
//     updateFriendshipStatus(state, action) {
//       const { userId, status } = action.payload;
//       state.statusLookup[userId] = status;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Send friend request
//       .addCase(sendFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data.unshift(action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'sendFriendRequest';
//       })
//          // Cancel friend request
//       .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data = state.sentRequests.data.filter((req) => req.id !== action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'cancelFriendRequest';
//       })
//           // Accept friend request
//           // In friendshipSlice.js, ensure the accept/reject cases update state properly:
// .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//   const friendship = action.payload;
//   state.pendingRequests.data = state.pendingRequests.data.filter(
//     req => req.id !== friendship.id
//   );
//   state.friends.data.unshift(friendship);
//   state.status = 'succeeded';
// })

//             // Reject friend request
//             .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//   const friendship = action.payload;
//   state.pendingRequests.data = state.pendingRequests.data.filter(
//     req => req.id !== friendship.id
//   );
//   state.status = 'succeeded';
// })
 
//        // Remove friendship
//       .addCase(removeFriendship.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter((friend) => friend.id !== action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'removeFriendship';
//       })
//        // Update friendship tier
//       .addCase(updateFriendshipTier.fulfilled, (state, action) => {
//         const index = state.friends.data.findIndex((f) => f.id === action.payload.id);
//         if (index !== -1) {
//           state.friends.data[index] = action.payload;
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'updateFriendshipTier';
//       })
//     // Block user
//       .addCase(blockUser.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter((friend) => friend.id !== action.payload.id);
//         state.status = 'succeeded';
//         state.lastAction = 'blockUser';
//       })
//        // Unblock user
//       .addCase(unblockUser.fulfilled, (state) => {
//         state.status = 'succeeded';
//         state.lastAction = 'unblockUser';
//       })
//      // Get pending requests
//       .addCase(getPendingRequests.pending, (state) => {
//         state.pendingRequests.status = 'loading';
//       })
//       .addCase(getPendingRequests.fulfilled, (state, action) => {
//         state.pendingRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getPendingRequests.rejected, (state, action) => {
//         state.pendingRequests.status = 'failed';
//         state.pendingRequests.error = action.payload;
//       })
//    // Get sent requests
//       .addCase(getSentRequests.pending, (state) => {
//         state.sentRequests.status = 'loading';
//       })
//       .addCase(getSentRequests.fulfilled, (state, action) => {
//         state.sentRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getSentRequests.rejected, (state, action) => {
//         state.sentRequests.status = 'failed';
//         state.sentRequests.error = action.payload;
//       })
//       // List friends
//       .addCase(listFriends.pending, (state) => {
//         state.friends.status = 'loading';
//       })
//       .addCase(listFriends.fulfilled, (state, action) => {
//         state.friends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(listFriends.rejected, (state, action) => {
//         state.friends.status = 'failed';
//         state.friends.error = action.payload;
//       })
//          // Get mutual friends
//       .addCase(getMutualFriends.pending, (state) => {
//         state.mutualFriends.status = 'loading';
//       })
//       .addCase(getMutualFriends.fulfilled, (state, action) => {
//         state.mutualFriends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getMutualFriends.rejected, (state, action) => {
//         state.mutualFriends.status = 'failed';
//         state.mutualFriends.error = action.payload;
//       })
//       // Get friend suggestions
//       .addCase(getFriendSuggestions.pending, (state) => {
//         state.suggestions.status = 'loading';
//       })
//       .addCase(getFriendSuggestions.fulfilled, (state, action) => {
//         state.suggestions = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getFriendSuggestions.rejected, (state, action) => {
//         state.suggestions.status = 'failed';
//         state.suggestions.error = action.payload;
//       })
//     // Check friendship status
//       .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
//         const { userId, status, direction, friendship } = action.payload;
//         state.statusLookup[userId] = { status, direction, friendship };
//       })
//      // Friends by tier
//       .addCase(getFriendsByTier.pending, (state) => {
//         state.friendsByTier.status = 'loading';
//       })
//       .addCase(getFriendsByTier.fulfilled, (state, action) => {
//         state.friendsByTier = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getFriendsByTier.rejected, (state, action) => {
//         state.friendsByTier.status = 'failed';
//         state.friendsByTier.error = action.payload;
//       })
//    // Get all friendship tiers
//       .addCase(getAllFriendshipTiers.pending, (state) => {
//         state.tiers.status = 'loading';
//       })
//       .addCase(getAllFriendshipTiers.fulfilled, (state, action) => {
//         state.tiers = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getAllFriendshipTiers.rejected, (state, action) => {
//         state.tiers.status = 'failed';
//         state.tiers.error = action.payload;
//       })
//     // Cleanup expired requests
//       .addCase(cleanupExpiredRequests.fulfilled, (state) => {
//         state.status = 'succeeded';
//         state.lastAction = 'cleanupExpiredRequests';
//       });
//   },
// });

// export const { resetStatus, clearFriendshipData, updateFriendshipStatus } = friendshipSlice.actions;
// export default friendshipSlice.reducer;




//! refactored version
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // Constants
// const FRIENDS_PER_PAGE = 10;
// const SUGGESTIONS_LIMIT = 20;

// // Helper: default pagination state
// const createPaginatedState = () => ({
//   data: [],
//   pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
//   status: 'idle',
//   error: null,
// });

// // Thunks
// export const sendFriendRequest = createAsyncThunk(
//   'friendship/sendFriendRequest',
//   async ({ friendId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/requests', { friendId });
//       return {
//         ...res.data.friendship,
//         to: res.data.friendship.friendId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to send friend request');
//     }
//   }
// );

// export const cancelFriendRequest = createAsyncThunk(
//   'friendship/cancelFriendRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/requests/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cancel request');
//     }
//   }
// );

// export const acceptFriendRequest = createAsyncThunk(
//   'friendship/acceptFriendRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${friendshipId}/accept`);
//       return res.data.data.friendship;
//     } catch (error) {
//       return rejectWithValue({
//         message: error.response?.data?.message || 'Accept failed',
//         friendshipId,
//       });
//     }
//   }
// );

// export const rejectFriendRequest = createAsyncThunk(
//   'friendship/rejectFriendRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${friendshipId}/reject`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to reject request');
//     }
//   }
// );

// export const removeFriendship = createAsyncThunk(
//   'friendship/removeFriendship',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to remove friendship');
//     }
//   }
// );

// export const updateFriendshipTier = createAsyncThunk(
//   'friendship/updateFriendshipTier',
//   async ({ friendshipId, tier, customLabel }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/${friendshipId}/tier`, { tier, customLabel });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to update friendship tier');
//     }
//   }
// );

// export const blockUser = createAsyncThunk(
//   'friendship/blockUser',
//   async (friendId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/block', { friendId });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to block user');
//     }
//   }
// );

// export const unblockUser = createAsyncThunk(
//   'friendship/unblockUser',
//   async (userId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/block/${userId}`);
//       return userId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to unblock user');
//     }
//   }
// );

// export const getPendingRequests = createAsyncThunk(
//   'friendship/getPendingRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/pending?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get pending requests');
//     }
//   }
// );

// export const getSentRequests = createAsyncThunk(
//   'friendship/getSentRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/sent?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get sent requests');
//     }
//   }
// );

// export const listFriends = createAsyncThunk(
//   'friendship/listFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const url = userId
//         ? `/friendships/${userId}/friends?page=${page}&size=${size}`
//         : `/friendships?page=${page}&size=${size}`;
//       const res = await axiosInstance.get(url);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends');
//     }
//   }
// );

// export const getMutualFriends = createAsyncThunk(
//   'friendship/getMutualFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/${userId}/mutual-friends?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch mutual friends');
//     }
//   }
// );

// export const getFriendSuggestions = createAsyncThunk(
//   'friendship/getFriendSuggestions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/suggestions?limit=${SUGGESTIONS_LIMIT}`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get friend suggestions');
//     }
//   }
// );

// export const checkFriendshipStatus = createAsyncThunk(
//   'friendship/checkFriendshipStatus',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/status/${userId}`);
//       return {
//         userId,
//         status: res.data.status,
//         direction: res.data.direction,
//         friendship: res.data.friendship,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to check friendship status');
//     }
//   }
// );

// export const getFriendsByTier = createAsyncThunk(
//   'friendship/getFriendsByTier',
//   async ({ tier, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/tier/${tier}?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         tier,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends by tier');
//     }
//   }
// );

// export const getAllFriendshipTiers = createAsyncThunk(
//   'friendship/getAllFriendshipTiers',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get('/friendships/tiers');
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friendship tiers');
//     }
//   }
// );

// export const cleanupExpiredRequests = createAsyncThunk(
//   'friendship/cleanupExpiredRequests',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.delete('/friendships/cleanup');
//       return res.data.deletedCount;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cleanup requests');
//     }
//   }
// );

// // Initial state
// const initialState = {
//   friends: createPaginatedState(),
//   mutualFriends: createPaginatedState(),
//   pendingRequests: createPaginatedState(),
//   sentRequests: createPaginatedState(),
//   suggestions: { data: [], status: 'idle', error: null },
//   tiers: { data: [], status: 'idle', error: null },
//   friendsByTier: createPaginatedState(),
//   statusLookup: {},
//   status: 'idle',
//   error: null,
//   lastAction: null,
// };

// // Slice
// const friendshipSlice = createSlice({
//   name: 'friendship',
//   initialState,
//   reducers: {
//     resetStatus(state) {
//       state.status = 'idle';
//       state.error = null;
//     },
//     clearFriendshipData() {
//       return initialState;
//     },
//     updateFriendshipStatus(state, action) {
//       const { userId, status } = action.payload;
//       state.statusLookup[userId] = status;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Send friend request
//       .addCase(sendFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data.unshift(action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'sendFriendRequest';
//       })
//       // Cancel friend request
//       .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data = state.sentRequests.data.filter((req) => req.id !== action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'cancelFriendRequest';
//       })
//       // Accept friend request
//       .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//         state.pendingRequests.data = state.pendingRequests.data.filter(
//           (req) => req.id !== action.payload.id
//         );
//         state.friends.data.unshift(action.payload);
//         if (action.payload.friend) {
//           state.statusLookup[action.payload.friend.id] = {
//             status: 'accepted',
//             direction: 'none',
//             friendship: action.payload,
//           };
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'acceptFriendRequest';
//       })
//       // Reject friend request
//       .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//         state.pendingRequests.data = state.pendingRequests.data.filter(
//           (req) => req.id !== action.payload.id
//         );
//         if (action.payload.friend) {
//           state.statusLookup[action.payload.friend.id] = {
//             status: 'rejected',
//             direction: 'none',
//             friendship: action.payload,
//           };
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'rejectFriendRequest';
//       })
//       // Remove friendship
//       .addCase(removeFriendship.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter((friend) => friend.id !== action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'removeFriendship';
//       })
//       // Update friendship tier
//       .addCase(updateFriendshipTier.fulfilled, (state, action) => {
//         const index = state.friends.data.findIndex((f) => f.id === action.payload.id);
//         if (index !== -1) {
//           state.friends.data[index] = action.payload;
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'updateFriendshipTier';
//       })
//       // Block user
//       .addCase(blockUser.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter((friend) => friend.id !== action.payload.id);
//         state.status = 'succeeded';
//         state.lastAction = 'blockUser';
//       })
//       // Unblock user
//       .addCase(unblockUser.fulfilled, (state) => {
//         state.status = 'succeeded';
//         state.lastAction = 'unblockUser';
//       })
//       // Get pending requests
//       .addCase(getPendingRequests.pending, (state) => {
//         state.pendingRequests.status = 'loading';
//       })
//       .addCase(getPendingRequests.fulfilled, (state, action) => {
//         state.pendingRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getPendingRequests.rejected, (state, action) => {
//         state.pendingRequests.status = 'failed';
//         state.pendingRequests.error = action.payload;
//       })
//       // Get sent requests
//       .addCase(getSentRequests.pending, (state) => {
//         state.sentRequests.status = 'loading';
//       })
//       .addCase(getSentRequests.fulfilled, (state, action) => {
//         state.sentRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getSentRequests.rejected, (state, action) => {
//         state.sentRequests.status = 'failed';
//         state.sentRequests.error = action.payload;
//       })
//       // List friends
//       .addCase(listFriends.pending, (state) => {
//         state.friends.status = 'loading';
//       })
//       .addCase(listFriends.fulfilled, (state, action) => {
//         state.friends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(listFriends.rejected, (state, action) => {
//         state.friends.status = 'failed';
//         state.friends.error = action.payload;
//       })
//       // Get mutual friends
//       .addCase(getMutualFriends.pending, (state) => {
//         state.mutualFriends.status = 'loading';
//       })
//       .addCase(getMutualFriends.fulfilled, (state, action) => {
//         state.mutualFriends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getMutualFriends.rejected, (state, action) => {
//         state.mutualFriends.status = 'failed';
//         state.mutualFriends.error = action.payload;
//       })
//       // Get friend suggestions
//       .addCase(getFriendSuggestions.pending, (state) => {
//         state.suggestions.status = 'loading';
//       })
//       .addCase(getFriendSuggestions.fulfilled, (state, action) => {
//         state.suggestions = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getFriendSuggestions.rejected, (state, action) => {
//         state.suggestions.status = 'failed';
//         state.suggestions.error = action.payload;
//       })
//       // Check friendship status
//       .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
//         const { userId, status, direction, friendship } = action.payload;
//         state.statusLookup[userId] = { status, direction, friendship };
//       })
//       // Friends by tier
//       .addCase(getFriendsByTier.pending, (state) => {
//         state.friendsByTier.status = 'loading';
//       })
//       .addCase(getFriendsByTier.fulfilled, (state, action) => {
//         state.friendsByTier = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getFriendsByTier.rejected, (state, action) => {
//         state.friendsByTier.status = 'failed';
//         state.friendsByTier.error = action.payload;
//       })
//       // Get all friendship tiers
//       .addCase(getAllFriendshipTiers.pending, (state) => {
//         state.tiers.status = 'loading';
//       })
//       .addCase(getAllFriendshipTiers.fulfilled, (state, action) => {
//         state.tiers = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getAllFriendshipTiers.rejected, (state, action) => {
//         state.tiers.status = 'failed';
//         state.tiers.error = action.payload;
//       })
//       // Cleanup expired requests
//       .addCase(cleanupExpiredRequests.fulfilled, (state) => {
//         state.status = 'succeeded';
//         state.lastAction = 'cleanupExpiredRequests';
//       });
//   },
// });

// export const { resetStatus, clearFriendshipData, updateFriendshipStatus } = friendshipSlice.actions;
// export default friendshipSlice.reducer;






//! running
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // Constants
// const FRIENDS_PER_PAGE = 10;
// const SUGGESTIONS_LIMIT = 20;

// // Thunks =========================================================
// export const sendFriendRequest = createAsyncThunk(
//   'friendship/sendFriendRequest',
//   async ({ friendId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/requests', { friendId });
//       return {
//         ...res.data.friendship,
//         to: res.data.friendship.friendId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to send friend request');
//     }
//   }
// );

// export const cancelFriendRequest = createAsyncThunk(
//   'friendship/cancelFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/requests/${requestId}`);
//       return requestId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cancel request');
//     }
//   }
// );

// export const acceptFriendRequest = createAsyncThunk(
//   'friendship/acceptFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//       console.log('Sending accept for request:', requestId); // Debug
//       const res = await axiosInstance.put(
//         `/friendships/requests/${requestId}/accept`
//       );
//       return res.data;
//     } catch (error) {
//       return rejectWithValue({
//         message: error.response?.data?.message || 'Accept failed',
//         requestId // Include for error handling
//       });
//     }
//   }
// );

// // Similar update for rejectFriendRequest

// export const rejectFriendRequest = createAsyncThunk(
//   'friendship/rejectFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${requestId}/reject`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to reject request');
//     }
//   }
// );

// export const removeFriendship = createAsyncThunk(
//   'friendship/removeFriendship',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to remove friendship');
//     }
//   }
// );

// export const updateFriendshipTier = createAsyncThunk(
//   'friendship/updateFriendshipTier',
//   async ({ friendshipId, tier, customLabel }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/${friendshipId}/tier`, { tier, customLabel });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to update friendship tier');
//     }
//   }
// );

// export const blockUser = createAsyncThunk(
//   'friendship/blockUser',
//   async (friendId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/block', { friendId });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to block user');
//     }
//   }
// );

// export const unblockUser = createAsyncThunk(
//   'friendship/unblockUser',
//   async (userId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/block/${userId}`);
//       return userId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to unblock user');
//     }
//   }
// );

// export const getPendingRequests = createAsyncThunk(
//   'friendship/getPendingRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/pending?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get pending requests');
//     }
//   }
// );

// export const getSentRequests = createAsyncThunk(
//   'friendship/getSentRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/sent?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get sent requests');
//     }
//   }
// );

// export const listFriends = createAsyncThunk(
//   'friendship/listFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const url = userId 
//         ? `/friendships/${userId}/friends?page=${page}&size=${size}`
//         : `/friendships?page=${page}&size=${size}`;
//       const res = await axiosInstance.get(url);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends');
//     }
//   }
// );

// export const getMutualFriends = createAsyncThunk(
//   'friendship/getMutualFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(
//         `/friendships/${userId}/mutual-friends?page=${page}&size=${size}`
//       );
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch mutual friends');
//     }
//   }
// );

// export const getFriendSuggestions = createAsyncThunk(
//   'friendship/getFriendSuggestions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/suggestions?limit=${SUGGESTIONS_LIMIT}`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get friend suggestions');
//     }
//   }
// );

// export const checkFriendshipStatus = createAsyncThunk(
//   'friendship/checkFriendshipStatus',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/status/${userId}`);
//       return {
//         userId,
//         status: res.data.status,
//         direction: res.data.direction,
//         friendship: res.data.friendship
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to check friendship status');
//     }
//   }
// );

// export const getFriendsByTier = createAsyncThunk(
//   'friendship/getFriendsByTier',
//   async ({ tier, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/tier/${tier}?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         tier
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends by tier');
//     }
//   }
// );

// export const getAllFriendshipTiers = createAsyncThunk(
//   'friendship/getAllFriendshipTiers',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get('/friendships/tiers');
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friendship tiers');
//     }
//   }
// );

// export const cleanupExpiredRequests = createAsyncThunk(
//   'friendship/cleanupExpiredRequests',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.delete('/friendships/cleanup');
//       return res.data.deletedCount;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cleanup requests');
//     }
//   }
// );

// // Initial State ==================================================
// const initialState = {
//   friends: { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }, status: 'idle', error: null },
//   mutualFriends: { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }, status: 'idle', error: null },
//   pendingRequests: { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }, status: 'idle', error: null },
//   sentRequests: { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }, status: 'idle', error: null },
//   suggestions: { data: [], status: 'idle', error: null },
//   tiers: { data: [], status: 'idle', error: null },
//   friendsByTier: { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }, status: 'idle', error: null },
//   statusLookup: {},
//   status: 'idle',
//   error: null,
//   lastAction: null
// };

// // Slice =========================================================
// const friendshipSlice = createSlice({
//   name: 'friendship',
//   initialState,
//   reducers: {
//     resetStatus: (state) => {
//       state.status = 'idle';
//       state.error = null;
//     },
//     clearFriendshipData: () => initialState,
//     updateFriendshipStatus: (state, action) => {
//       const { userId, status } = action.payload;
//       state.statusLookup[userId] = status;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Friend requests
//       .addCase(sendFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data.unshift(action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'sendFriendRequest';
//       })
//       .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data = state.sentRequests.data.filter(req => req.id !== action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'cancelFriendRequest';
//       })
//       .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//         state.pendingRequests.data = state.pendingRequests.data.filter(
//           req => req.id !== action.payload.id
//         );
//         state.friends.data.unshift(action.payload);
//         if (action.payload.friend) {
//           state.statusLookup[action.payload.friend.id] = {
//             status: 'accepted',
//             direction: 'none',
//             friendship: action.payload
//           };
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'acceptFriendRequest';
//       })
//       .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//         state.pendingRequests.data = state.pendingRequests.data.filter(
//           req => req.id !== action.payload.id
//         );
//         if (action.payload.friend) {
//           state.statusLookup[action.payload.friend.id] = {
//             status: 'rejected',
//             direction: 'none',
//             friendship: action.payload
//           };
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'rejectFriendRequest';
//       })
      
//       // Friendship management
//       .addCase(removeFriendship.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter(friend => friend.id !== action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'removeFriendship';
//       })
//       .addCase(updateFriendshipTier.fulfilled, (state, action) => {
//         const index = state.friends.data.findIndex(f => f.id === action.payload.id);
//         if (index !== -1) state.friends.data[index] = action.payload;
//         state.status = 'succeeded';
//         state.lastAction = 'updateFriendshipTier';
//       })
      
//       // Block management
//       .addCase(blockUser.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter(friend => friend.id !== action.payload.id);
//         state.status = 'succeeded';
//         state.lastAction = 'blockUser';
//       })
//       .addCase(unblockUser.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.lastAction = 'unblockUser';
//       })
      
//       // Query methods
//       .addCase(getPendingRequests.pending, (state) => {
//         state.pendingRequests.status = 'loading';
//       })
//       .addCase(getPendingRequests.fulfilled, (state, action) => {
//         state.pendingRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//       })
//       .addCase(getPendingRequests.rejected, (state, action) => {
//         state.pendingRequests.status = 'failed';
//         state.pendingRequests.error = action.payload;
//       })
      
//       .addCase(getSentRequests.pending, (state) => {
//         state.sentRequests.status = 'loading';
//       })
//       .addCase(getSentRequests.fulfilled, (state, action) => {
//         state.sentRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//       })
//       .addCase(getSentRequests.rejected, (state, action) => {
//         state.sentRequests.status = 'failed';
//         state.sentRequests.error = action.payload;
//       })
      
//       .addCase(listFriends.pending, (state) => {
//         state.friends.status = 'loading';
//       })
//       .addCase(listFriends.fulfilled, (state, action) => {
//         state.friends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//       })
//       .addCase(listFriends.rejected, (state, action) => {
//         state.friends.status = 'failed';
//         state.friends.error = action.payload;
//       })
      
//       .addCase(getMutualFriends.pending, (state) => {
//         state.mutualFriends.status = 'loading';
//       })
//       .addCase(getMutualFriends.fulfilled, (state, action) => {
//         state.mutualFriends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//       })
//       .addCase(getMutualFriends.rejected, (state, action) => {
//         state.mutualFriends.status = 'failed';
//         state.mutualFriends.error = action.payload;
//       })
      
//       .addCase(getFriendSuggestions.pending, (state) => {
//         state.suggestions.status = 'loading';
//       })
//       .addCase(getFriendSuggestions.fulfilled, (state, action) => {
//         state.suggestions = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null
//         };
//       })
//       .addCase(getFriendSuggestions.rejected, (state, action) => {
//         state.suggestions.status = 'failed';
//         state.suggestions.error = action.payload;
//       })
      
//       .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
//         state.statusLookup[action.payload.userId] = {
//           status: action.payload.status,
//           direction: action.payload.direction,
//           friendship: action.payload.friendship
//         };
//       })
      
//       .addCase(getFriendsByTier.pending, (state) => {
//         state.friendsByTier.status = 'loading';
//       })
//       .addCase(getFriendsByTier.fulfilled, (state, action) => {
//         state.friendsByTier = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//       })
//       .addCase(getFriendsByTier.rejected, (state, action) => {
//         state.friendsByTier.status = 'failed';
//         state.friendsByTier.error = action.payload;
//       })
      
//       .addCase(getAllFriendshipTiers.pending, (state) => {
//         state.tiers.status = 'loading';
//       })
//       .addCase(getAllFriendshipTiers.fulfilled, (state, action) => {
//         state.tiers = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null
//         };
//       })
//       .addCase(getAllFriendshipTiers.rejected, (state, action) => {
//         state.tiers.status = 'failed';
//         state.tiers.error = action.payload;
//       })
      
//       // Global matchers
//       .addMatcher(
//         (action) => action.type.startsWith('friendship/') && action.type.endsWith('/pending'),
//         (state) => {
//           state.status = 'loading';
//           state.error = null;
//         }
//       )
//       .addMatcher(
//         (action) => action.type.startsWith('friendship/') && action.type.endsWith('/rejected'),
//         (state, action) => {
//           state.status = 'failed';
//           state.error = action.payload;
//           state.lastAction = action.type.replace('/rejected', '');
//         }
//       );
//   }
// });

// export const { resetStatus, clearFriendshipData, updateFriendshipStatus } = friendshipSlice.actions;
// export default friendshipSlice.reducer;



//! curent
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // Constants
// const FRIENDS_PER_PAGE = 10;
// const SUGGESTIONS_LIMIT = 20;

// // Thunks =========================================================

// // Friend Requests Management
// export const sendFriendRequest = createAsyncThunk(
//   'friendship/sendFriendRequest',
//   async ({ friendId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/requests', { friendId: friendId });
//       return {
//         ...res.data.friendship,
//         to: res.data.friendship.friendId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to send friend request');
//     }
//   }
// );



// export const cancelFriendRequest = createAsyncThunk(
//   'friendship/cancelFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/requests/${requestId}`);
//       return requestId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cancel request');
//     }
//   }
// );

// export const acceptFriendRequest = createAsyncThunk(
//   'friendship/acceptFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${requestId}/accept`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to accept request');
//     }
//   }
// );

// export const rejectFriendRequest = createAsyncThunk(
//   'friendship/rejectFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${requestId}/reject`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to reject request');
//     }
//   }
// );

// // Friendship Management
// export const removeFriendship = createAsyncThunk(
//   'friendship/removeFriendship',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to remove friendship');
//     }
//   }
// );

// export const updateFriendshipTier = createAsyncThunk(
//   'friendship/updateFriendshipTier',
//   async ({ friendshipId, tier, customLabel }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/${friendshipId}/tier`, { tier, customLabel });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to update friendship tier');
//     }
//   }
// );

// // Block Management
// export const blockUser = createAsyncThunk(
//   'friendship/blockUser',
//   async (friendId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/block', { friendId });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to block user');
//     }
//   }
// );

// export const unblockUser = createAsyncThunk(
//   'friendship/unblockUser',
//   async (userId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/block/${userId}`);
//       return userId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to unblock user');
//     }
//   }
// );

// // Query Methods
// export const getPendingRequests = createAsyncThunk(
//   'friendship/getPendingRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/pending?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get pending requests');
//     }
//   }
// );

// export const getSentRequests = createAsyncThunk(
//   'friendship/getSentRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/sent?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get sent requests');
//     }
//   }
// );

// export const listFriends = createAsyncThunk(
//   'friendship/listFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const url = userId 
//         ? `/friendships/${userId}/friends?page=${page}&size=${size}`
//         : `/friendships?page=${page}&size=${size}`;
//       const res = await axiosInstance.get(url);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends');
//     }
//   }
// );

// export const getMutualFriends = createAsyncThunk(
//   'friendship/getMutualFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(
//         `/friendships/${userId}/mutual-friends?page=${page}&size=${size}`
//       );
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch mutual friends');
//     }
//   }
// );

// export const getFriendSuggestions = createAsyncThunk(
//   'friendship/getFriendSuggestions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/suggestions?limit=${SUGGESTIONS_LIMIT}`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get friend suggestions');
//     }
//   }
// );

// export const checkFriendshipStatus = createAsyncThunk(
//   'friendship/checkFriendshipStatus',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/status/${userId}`);
//       return {
//         userId,
//         status: res.data.status,
//         direction: res.data.direction,
//         friendship: res.data.friendship
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to check friendship status');
//     }
//   }
// );

// export const getFriendsByTier = createAsyncThunk(
//   'friendship/getFriendsByTier',
//   async ({ tier, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(
//         `/friendships/tier/${tier}?page=${page}&size=${size}`
//       );
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         tier
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends by tier');
//     }
//   }
// );

// export const getAllFriendshipTiers = createAsyncThunk(
//   'friendship/getAllFriendshipTiers',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get('/friendships/tiers');
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friendship tiers');
//     }
//   }
// );

// // Maintenance Functions
// export const cleanupExpiredRequests = createAsyncThunk(
//   'friendship/cleanupExpiredRequests',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.delete('/friendships/cleanup');
//       return res.data.deletedCount;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cleanup requests');
//     }
//   }
// );

// // Initial State ==================================================
// const initialState = {
//   // Friend lists
//   friends: {
//     data: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     },
//     status: 'idle',
//     error: null
//   },
  
//   // Mutual friends
//   mutualFriends: {
//     data: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     },
//     status: 'idle',
//     error: null
//   },
  
//   // Requests
//   pendingRequests: {
//     data: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     },
//     status: 'idle',
//     error: null
//   },
  
//   sentRequests: {
//     data: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     },
//     status: 'idle',
//     error: null
//   },
  
//   // Friend suggestions
//   suggestions: {
//     data: [],
//     status: 'idle',
//     error: null
//   },
  
//   // Friendship tiers
//   tiers: {
//     data: [],
//     status: 'idle',
//     error: null
//   },
  
//   // Friends by tier
//   friendsByTier: {
//     data: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     },
//     status: 'idle',
//     error: null
//   },
  
//   // Friendship status lookup
//   statusLookup: {},
  
//   // Global state
//   status: 'idle',
//   error: null,
//   lastAction: null
// };

// // Slice =========================================================
// const friendshipSlice = createSlice({
//   name: 'friendship',
//   initialState,
//   reducers: {
//     resetStatus: (state) => {
//       state.status = 'idle';
//       state.error = null;
//     },
//     clearFriendshipData: () => initialState,
//     updateFriendshipStatus: (state, action) => {
//       const { userId, status } = action.payload;
//       state.statusLookup[userId] = status;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
           
//       // Friend requests
//       .addCase(sendFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data.unshift(action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'sendFriendRequest';
//       })



//       .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data = state.sentRequests.data.filter(
//           req => req.id !== action.payload
//         );
//         state.status = 'succeeded';
//         state.lastAction = 'cancelFriendRequest';
//       })
//       .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//         state.pendingRequests.data = state.pendingRequests.data.filter(
//           req => req.id !== action.payload.id
//         );
//         state.friends.data.unshift(action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'acceptFriendRequest';
//       })
//       .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//         state.pendingRequests.data = state.pendingRequests.data.filter(
//           req => req.id !== action.payload.id
//         );
//         state.status = 'succeeded';
//         state.lastAction = 'rejectFriendRequest';
//       })
      
//       // Friendship management
//       .addCase(removeFriendship.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter(
//           friend => friend.id !== action.payload
//         );
//         state.status = 'succeeded';
//         state.lastAction = 'removeFriendship';
//       })
//       .addCase(updateFriendshipTier.fulfilled, (state, action) => {
//         const index = state.friends.data.findIndex(
//           f => f.id === action.payload.id
//         );
//         if (index !== -1) {
//           state.friends.data[index] = action.payload;
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'updateFriendshipTier';
//       })
      
//       // Block management
//       .addCase(blockUser.fulfilled, (state, action) => {
//         // Remove from friends if they were friends
//         state.friends.data = state.friends.data.filter(
//           friend => friend.id !== action.payload.id
//         );
//         state.status = 'succeeded';
//         state.lastAction = 'blockUser';
//       })
//       .addCase(unblockUser.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.lastAction = 'unblockUser';
//       })
      
//       // Query methods - pending/fulfilled/rejected for each
//       .addCase(getPendingRequests.pending, (state) => {
//         state.pendingRequests.status = 'loading';
//       })
//       .addCase(getPendingRequests.fulfilled, (state, action) => {
//         state.pendingRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//         state.status = 'succeeded';
//       })
//       .addCase(getPendingRequests.rejected, (state, action) => {
//         state.pendingRequests.status = 'failed';
//         state.pendingRequests.error = action.payload;
//       })
      
//       .addCase(getSentRequests.pending, (state) => {
//         state.sentRequests.status = 'loading';
//       })
//       .addCase(getSentRequests.fulfilled, (state, action) => {
//         state.sentRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//         state.status = 'succeeded';
//       })
//       .addCase(getSentRequests.rejected, (state, action) => {
//         state.sentRequests.status = 'failed';
//         state.sentRequests.error = action.payload;
//       })
      
//       .addCase(listFriends.pending, (state) => {
//         state.friends.status = 'loading';
//       })
//       .addCase(listFriends.fulfilled, (state, action) => {
//         state.friends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//         state.status = 'succeeded';
//       })
//       .addCase(listFriends.rejected, (state, action) => {
//         state.friends.status = 'failed';
//         state.friends.error = action.payload;
//       })
      
//       .addCase(getMutualFriends.pending, (state) => {
//         state.mutualFriends.status = 'loading';
//       })
//       .addCase(getMutualFriends.fulfilled, (state, action) => {
//         state.mutualFriends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//         state.status = 'succeeded';
//       })
//       .addCase(getMutualFriends.rejected, (state, action) => {
//         state.mutualFriends.status = 'failed';
//         state.mutualFriends.error = action.payload;
//       })
      
//       .addCase(getFriendSuggestions.pending, (state) => {
//         state.suggestions.status = 'loading';
//       })
//       .addCase(getFriendSuggestions.fulfilled, (state, action) => {
//         state.suggestions = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null
//         };
//         state.status = 'succeeded';
//       })
//       .addCase(getFriendSuggestions.rejected, (state, action) => {
//         state.suggestions.status = 'failed';
//         state.suggestions.error = action.payload;
//       })
      
//       .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
//         state.statusLookup[action.payload.userId] = {
//           status: action.payload.status,
//           direction: action.payload.direction,
//           friendship: action.payload.friendship
//         };
//         state.status = 'succeeded';
//       })
      
//       .addCase(getFriendsByTier.pending, (state) => {
//         state.friendsByTier.status = 'loading';
//       })
//       .addCase(getFriendsByTier.fulfilled, (state, action) => {
//         state.friendsByTier = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null
//         };
//         state.status = 'succeeded';
//       })
//       .addCase(getFriendsByTier.rejected, (state, action) => {
//         state.friendsByTier.status = 'failed';
//         state.friendsByTier.error = action.payload;
//       })
      
//       .addCase(getAllFriendshipTiers.pending, (state) => {
//         state.tiers.status = 'loading';
//       })
//       .addCase(getAllFriendshipTiers.fulfilled, (state, action) => {
//         state.tiers = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null
//         };
//         state.status = 'succeeded';
//       })
//       .addCase(getAllFriendshipTiers.rejected, (state, action) => {
//         state.tiers.status = 'failed';
//         state.tiers.error = action.payload;
//       })
//       // Global pending/rejected handlers
//       .addMatcher(
//         (action) => action.type.startsWith('friendship/') && action.type.endsWith('/pending'),
//         (state) => {
//           state.status = 'loading';
//           state.error = null;
//         }
//       )
//       .addMatcher(
//         (action) => action.type.startsWith('friendship/') && action.type.endsWith('/rejected'),
//         (state, action) => {
//           state.status = 'failed';
//           state.error = action.payload;
//           state.lastAction = action.type.replace('/rejected', '');
//         }
//       )
//   }
// });

// export const { resetStatus, clearFriendshipData, updateFriendshipStatus } = friendshipSlice.actions;
// export default friendshipSlice.reducer;









//! previous
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // 🟢 CONSTANTS
// const FRIENDS_PER_PAGE = 10; // Default pagination size

// // 🔵 THUNKS ======================================================

// // 🔵 Friend Requests Management
// // sendFriendRequest
// export const sendFriendRequest = createAsyncThunk(
//   'friendship/sendFriendRequest',
//   async ({ targetUserId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/requests', { friendId: targetUserId });
//       return {
//         ...res.data.friendship,
//         to: res.data.friendship.friendId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to send friend request');
//     }
//   }
// );

// // cancelFriendRequest
// export const cancelFriendRequest = createAsyncThunk(
//   'friendship/cancelFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/requests/${requestId}`);
//       return requestId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cancel request');
//     }
//   }
// );

// // acceptFriendRequest
// export const acceptFriendRequest = createAsyncThunk(
//   'friendship/acceptFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//          const res = await axiosInstance.put(
//         `/friendships/requests/${requestId}/accept`
//       );
//       return res.data.friendship;
//     } catch (error) {
//       // Handle specific error codes
//       if (error.response?.data?.code === 'REQUEST_NOT_FOUND') {
//         return rejectWithValue('Friend request not found');
//       }
//       if (error.response?.data?.code === 'INVALID_REQUEST_ID') {
//         return rejectWithValue('Invalid request ID format');
//       }
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to accept request'
//       );
//     }
//   }
// );

// // rejectFriendRequest
// export const rejectFriendRequest = createAsyncThunk(
//   'friendship/rejectFriendRequest',
//   async (requestId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${requestId}/reject`);
//       return res.data.friendship;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to reject request');
//     }
//   }
// );

// // 🔵 Friendship Management
// export const unfriendUser = createAsyncThunk(
//   'friendship/unfriendUser',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to remove friendship');
//     }
//   }
// );

// // 🔵 Block Management
// export const blockUser = createAsyncThunk(
//   'friendship/blockUser',
//   async (targetUserId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/block', { friendId: targetUserId });
//       return res.data.friendship;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to block user');
//     }
//   }
// );

// // unblockUser
// export const unblockUser = createAsyncThunk(
//   'friendship/unblockUser',
//   async (userId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/block/${userId}`);
//       return userId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to unblock user');
//     }
//   }
// );

// // 🔵 Query Methods
// // fetchUserFriends
// export const fetchUserFriends = createAsyncThunk(
//   'friendship/fetchUserFriends',
//   async ({ userId, page = 1 }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(
//         `/friendships/${userId}/friends?page=${page}&size=${FRIENDS_PER_PAGE}`
//       );
//       return {
//         data: response.data.payload.data,
//         pagination: response.data.payload.pagination,
//         userId
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // fetchMutualFriends
// export const fetchMutualFriends = createAsyncThunk(
//   'friendship/fetchMutualFriends',
//   async ({ userId, page = 1 }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(
//         `/friendships/${userId}/mutual-friends?page=${page}&size=${FRIENDS_PER_PAGE}`
//       );
//       return {
//         data: response.data.payload.data,
//         pagination: response.data.payload.pagination,
//         userId
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // listFriends
// export const listFriends = createAsyncThunk(
//   'friendship/listFriends',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get('/friendships');
//       return res.data.payload;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends');
//     }
//   }
// );

// // getPendingRequests
// export const getPendingRequests = createAsyncThunk(
//   'friendship/getPendingRequests',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get('/friendships/requests/pending');
//       return res.data.payload;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get pending requests');
//     }
//   }
// );

// // getSentRequests
// export const getSentRequests = createAsyncThunk(
//   'friendship/getSentRequests',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get('/friendships/requests/sent');
//       return res.data.payload;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get sent requests');
//     }
//   }
// );

// // checkFriendshipStatus
// export const checkFriendshipStatus = createAsyncThunk(
//   'friendship/checkFriendshipStatus',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/status/${userId}`);
//       return { userId, status: res.data.status };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to check friendship status');
//     }
//   }
// );

// // 🟠 Maintenance Functions (Not typically used in frontend, but available if needed)
// // cleanupExpiredRequests
// export const cleanupExpiredRequests = createAsyncThunk(
//   'friendship/cleanupExpiredRequests',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.delete('/friendships/cleanup');
//       return res.data.deletedCount;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cleanup requests');
//     }
//   }
// );

// // 🟢 INITIAL STATE ===============================================
// const initialState = {
//   friendsList: {
//     data: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     }
//   },
//   mutualFriends: {
//     data: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     }
//   },
//   friends: [],
//   requests: [],
//   friendshipStatus: {}, // Keyed by userId
//   status: 'idle', // Global status
//   friendsStatus: 'idle', // Specific to friends list
//   mutualFriendsStatus: 'idle', // Specific to mutual friends
//   error: null,
// };

// // 🔵 SLICE =======================================================
// const friendshipSlice = createSlice({
//   name: 'friendship',
//   initialState,
//   reducers: {
//     // 🟢 Reset status and error
//     resetStatus: (state) => {
//       state.status = 'idle';
//       state.error = null;
//     },
//     // 🟢 Clear all friendship data
//     clearFriendshipData: () => initialState,
//   },
//   extraReducers: (builder) => {
//     builder
//       // 🔵 Friend Lists
//       .addCase(fetchUserFriends.pending, (state) => {
//         state.friendsStatus = 'loading';
//       })
//       .addCase(fetchUserFriends.fulfilled, (state, action) => {
//         if (action.meta.arg.page === 1) {
//           state.friendsList = {
//             data: action.payload.data,
//             pagination: action.payload.pagination
//           };
//         } else {
//           state.friendsList = {
//             data: [...state.friendsList.data, ...action.payload.data],
//             pagination: action.payload.pagination
//           };
//         }
//         state.friendsStatus = 'succeeded';
//       })
//       .addCase(fetchUserFriends.rejected, (state, action) => {
//         state.friendsStatus = 'failed';
//         state.error = action.payload;
//       })

//       // 🔵 Mutual Friends
//       .addCase(fetchMutualFriends.pending, (state) => {
//         state.mutualFriendsStatus = 'loading';
//       })
//       .addCase(fetchMutualFriends.fulfilled, (state, action) => {
//         if (action.meta.arg.page === 1) {
//           state.mutualFriends = {
//             data: action.payload.data,
//             pagination: action.payload.pagination
//           };
//         } else {
//           state.mutualFriends = {
//             data: [...state.mutualFriends.data, ...action.payload.data],
//             pagination: action.payload.pagination
//           };
//         }
//         state.mutualFriendsStatus = 'succeeded';
//       })
//       .addCase(fetchMutualFriends.rejected, (state, action) => {
//         state.mutualFriendsStatus = 'failed';
//         state.error = action.payload;
//       })

//       // 🔵 Friend Requests
//       .addCase(sendFriendRequest.fulfilled, (state, action) => {
//         state.requests.push(action.payload);
//         state.status = 'succeeded';
//       })
//       .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//         state.requests = state.requests.filter(r => r.id !== action.payload);
//         state.status = 'succeeded';
//       })
//       .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//         state.friends.push(action.payload);
//         state.requests = state.requests.filter(r => r.id !== action.payload.id);
//         state.status = 'succeeded';
//       })
//       .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//         state.requests = state.requests.filter(r => r.id !== action.payload.id);
//         state.status = 'succeeded';
//       })

//       // 🔵 Friendship Management
//       .addCase(unfriendUser.fulfilled, (state, action) => {
//         state.friends = state.friends.filter(f => f.id !== action.payload);
//         state.status = 'succeeded';
//       })

//       // 🔵 Block Management
//       .addCase(blockUser.fulfilled, (state) => {
//         state.status = 'succeeded';
//       })
//       .addCase(unblockUser.fulfilled, (state) => {
//         state.status = 'succeeded';
//       })

//       // 🔵 Query Methods
//       .addCase(listFriends.fulfilled, (state, action) => {
//         state.friends = action.payload;
//         state.status = 'succeeded';
//       })
//       .addCase(getPendingRequests.fulfilled, (state, action) => {
//         state.requests = action.payload;
//         state.status = 'succeeded';
//       })
//       .addCase(getSentRequests.fulfilled, (state, action) => {
//         state.requests = action.payload;
//         state.status = 'succeeded';
//       })
//       .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
//         const { userId, status } = action.payload;
//         state.friendshipStatus[userId] = status;
//         state.status = 'succeeded';
//       })

//       // 🟠 Maintenance
//       .addCase(cleanupExpiredRequests.fulfilled, (state) => {
//         state.status = 'succeeded';
//       })

//       // 🟢 Global Status Matchers
//       .addMatcher(
//         (action) => action.type.startsWith('friendship/') && action.type.endsWith('/pending'),
//         (state) => {
//           state.status = 'loading';
//           state.error = null;
//         }
//       )
//       .addMatcher(
//         (action) => action.type.startsWith('friendship/') && action.type.endsWith('/rejected'),
//         (state, action) => {
//           state.status = 'failed';
//           state.error = action.payload || 'An error occurred';
//         }
//       );
//   },
// });

// export const { resetStatus, clearFriendshipData } = friendshipSlice.actions;
// export default friendshipSlice.reducer;














// previous
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // Constants
// const FRIENDS_PER_PAGE = 10;
// const SUGGESTIONS_LIMIT = 20;

// // Helper: default pagination state
// const createPaginatedState = () => ({
//   data: [],
//   pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
//   status: 'idle',
//   error: null,
// });

// // Thunks
// export const sendFriendRequest = createAsyncThunk(
//   'friendship/sendFriendRequest',
//   async ({ friendId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/requests', { friendId });
//       return {
//         ...res.data.friendship,
//         to: res.data.friendship.friendId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to send friend request');
//     }
//   }
// );



// export const cancelFriendRequest = createAsyncThunk(
//   'friendship/cancelFriendRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/requests/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cancel request');
//     }
//   }
// );

// export const acceptFriendRequest = createAsyncThunk(
//   'friendship/acceptRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.put(`/friendships/requests/${friendshipId}/accept`);
//       return response.data.data;
//     } catch (error) {
//       return rejectWithValue({
//         code: error.response?.data?.code || 'UNKNOWN_ERROR',
//         message: error.response?.data?.message || 'Failed to accept request',
//         friendshipId
//       });
//     }
//   }
// );

// export const rejectFriendRequest = createAsyncThunk(
//   'friendship/rejectFriendRequest',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/requests/${friendshipId}/reject`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to reject request');
//     }
//   }
// );

// export const removeFriendship = createAsyncThunk(
//   'friendship/removeFriendship',
//   async (friendshipId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/${friendshipId}`);
//       return friendshipId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to remove friendship');
//     }
//   }
// );

// export const updateFriendshipTier = createAsyncThunk(
//   'friendship/updateFriendshipTier',
//   async ({ friendshipId, tier, customLabel }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.put(`/friendships/${friendshipId}/tier`, { tier, customLabel });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to update friendship tier');
//     }
//   }
// );

// export const blockUser = createAsyncThunk(
//   'friendship/blockUser',
//   async (friendId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.post('/friendships/block', { friendId });
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to block user');
//     }
//   }
// );

// export const unblockUser = createAsyncThunk(
//   'friendship/unblockUser',
//   async (userId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/friendships/block/${userId}`);
//       return userId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to unblock user');
//     }
//   }
// );

// export const getPendingRequests = createAsyncThunk(
//   'friendship/getPendingRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/pending?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get pending requests');
//     }
//   }
// );

// export const getSentRequests = createAsyncThunk(
//   'friendship/getSentRequests',
//   async ({ page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/requests/sent?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get sent requests');
//     }
//   }
// );

// export const listFriends = createAsyncThunk(
//   'friendship/listFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE } = {}, { rejectWithValue }) => {
//     try {
//       const url = userId
//         ? `/friendships/${userId}/friends?page=${page}&size=${size}`
//         : `/friendships?page=${page}&size=${size}`;
//       const res = await axiosInstance.get(url);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends');
//     }
//   }
// );

// export const getMutualFriends = createAsyncThunk(
//   'friendship/getMutualFriends',
//   async ({ userId, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/${userId}/mutual-friends?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         userId,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch mutual friends');
//     }
//   }
// );

// export const getFriendSuggestions = createAsyncThunk(
//   'friendship/getFriendSuggestions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/suggestions?limit=${SUGGESTIONS_LIMIT}`);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to get friend suggestions');
//     }
//   }
// );

// export const checkFriendshipStatus = createAsyncThunk(
//   'friendship/checkFriendshipStatus',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/status/${userId}`);
//       return {
//         userId,
//         status: res.data.status,
//         direction: res.data.direction,
//         friendship: res.data.friendship,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to check friendship status');
//     }
//   }
// );

// export const getFriendsByTier = createAsyncThunk(
//   'friendship/getFriendsByTier',
//   async ({ tier, page = 1, size = FRIENDS_PER_PAGE }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/friendships/tier/${tier}?page=${page}&size=${size}`);
//       return {
//         data: res.data.payload.data,
//         pagination: res.data.payload.pagination,
//         tier,
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friends by tier');
//     }
//   }
// );

// export const getAllFriendshipTiers = createAsyncThunk(
//   'friendship/getAllFriendshipTiers',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get('/friendships/tiers');
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch friendship tiers');
//     }
//   }
// );

// export const cleanupExpiredRequests = createAsyncThunk(
//   'friendship/cleanupExpiredRequests',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.delete('/friendships/cleanup');
//       return res.data.deletedCount;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to cleanup requests');
//     }
//   }
// );

// // Initial state
// const initialState = {
//   friends: createPaginatedState(),
//   mutualFriends: createPaginatedState(),
//   pendingRequests: createPaginatedState(),
//   sentRequests: createPaginatedState(),
//   suggestions: { data: [], status: 'idle', error: null },
//   tiers: { data: [], status: 'idle', error: null },
//   friendsByTier: createPaginatedState(),
//   statusLookup: {},
//   status: 'idle',
//   error: null,
//   lastAction: null,
// };

// // Slice
// const friendshipSlice = createSlice({
//   name: 'friendship',
//   initialState,
//   reducers: {
//     resetStatus(state) {
//       state.status = 'idle';
//       state.error = null;
//     },
//     clearFriendshipData() {
//       return initialState;
//     },
//     updateFriendshipStatus(state, action) {
//       const { userId, status } = action.payload;
//       state.statusLookup[userId] = status;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Send friend request
//       .addCase(sendFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data.unshift(action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'sendFriendRequest';
//       })

   
      
//          // Cancel friend request
//       .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//         state.sentRequests.data = state.sentRequests.data.filter((req) => req.id !== action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'cancelFriendRequest';
//       })
//           // Accept friend request
//       .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//         state.pendingRequests.data = state.pendingRequests.data.filter(
//           (req) => req.id !== action.payload.id
//         );
//         state.friends.data.unshift(action.payload);
//         if (action.payload.friend) {
//           state.statusLookup[action.payload.friend.id] = {
//             status: 'accepted',
//             direction: 'none',
//             friendship: action.payload,
//           };
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'acceptFriendRequest';
//       })
//             // Reject friend request
//       .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//         state.pendingRequests.data = state.pendingRequests.data.filter(
//           (req) => req.id !== action.payload.id
//         );
//         if (action.payload.friend) {
//           state.statusLookup[action.payload.friend.id] = {
//             status: 'rejected',
//             direction: 'none',
//             friendship: action.payload,
//           };
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'rejectFriendRequest';
//       })
//        // Remove friendship
//       .addCase(removeFriendship.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter((friend) => friend.id !== action.payload);
//         state.status = 'succeeded';
//         state.lastAction = 'removeFriendship';
//       })
//        // Update friendship tier
//       .addCase(updateFriendshipTier.fulfilled, (state, action) => {
//         const index = state.friends.data.findIndex((f) => f.id === action.payload.id);
//         if (index !== -1) {
//           state.friends.data[index] = action.payload;
//         }
//         state.status = 'succeeded';
//         state.lastAction = 'updateFriendshipTier';
//       })
//     // Block user
//       .addCase(blockUser.fulfilled, (state, action) => {
//         state.friends.data = state.friends.data.filter((friend) => friend.id !== action.payload.id);
//         state.status = 'succeeded';
//         state.lastAction = 'blockUser';
//       })
//        // Unblock user
//       .addCase(unblockUser.fulfilled, (state) => {
//         state.status = 'succeeded';
//         state.lastAction = 'unblockUser';
//       })
//      // Get pending requests
//       .addCase(getPendingRequests.pending, (state) => {
//         state.pendingRequests.status = 'loading';
//       })
//       .addCase(getPendingRequests.fulfilled, (state, action) => {
//         state.pendingRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getPendingRequests.rejected, (state, action) => {
//         state.pendingRequests.status = 'failed';
//         state.pendingRequests.error = action.payload;
//       })
//    // Get sent requests
//       .addCase(getSentRequests.pending, (state) => {
//         state.sentRequests.status = 'loading';
//       })
//       .addCase(getSentRequests.fulfilled, (state, action) => {
//         state.sentRequests = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getSentRequests.rejected, (state, action) => {
//         state.sentRequests.status = 'failed';
//         state.sentRequests.error = action.payload;
//       })
//       // List friends
//       .addCase(listFriends.pending, (state) => {
//         state.friends.status = 'loading';
//       })
//       .addCase(listFriends.fulfilled, (state, action) => {
//         state.friends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(listFriends.rejected, (state, action) => {
//         state.friends.status = 'failed';
//         state.friends.error = action.payload;
//       })
//          // Get mutual friends
//       .addCase(getMutualFriends.pending, (state) => {
//         state.mutualFriends.status = 'loading';
//       })
//       .addCase(getMutualFriends.fulfilled, (state, action) => {
//         state.mutualFriends = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getMutualFriends.rejected, (state, action) => {
//         state.mutualFriends.status = 'failed';
//         state.mutualFriends.error = action.payload;
//       })
//       // Get friend suggestions
//       .addCase(getFriendSuggestions.pending, (state) => {
//         state.suggestions.status = 'loading';
//       })
//       .addCase(getFriendSuggestions.fulfilled, (state, action) => {
//         state.suggestions = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getFriendSuggestions.rejected, (state, action) => {
//         state.suggestions.status = 'failed';
//         state.suggestions.error = action.payload;
//       })
//     // Check friendship status
//       .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
//         const { userId, status, direction, friendship } = action.payload;
//         state.statusLookup[userId] = { status, direction, friendship };
//       })
//      // Friends by tier
//       .addCase(getFriendsByTier.pending, (state) => {
//         state.friendsByTier.status = 'loading';
//       })
//       .addCase(getFriendsByTier.fulfilled, (state, action) => {
//         state.friendsByTier = {
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getFriendsByTier.rejected, (state, action) => {
//         state.friendsByTier.status = 'failed';
//         state.friendsByTier.error = action.payload;
//       })
//    // Get all friendship tiers
//       .addCase(getAllFriendshipTiers.pending, (state) => {
//         state.tiers.status = 'loading';
//       })
//       .addCase(getAllFriendshipTiers.fulfilled, (state, action) => {
//         state.tiers = {
//           data: action.payload,
//           status: 'succeeded',
//           error: null,
//         };
//       })
//       .addCase(getAllFriendshipTiers.rejected, (state, action) => {
//         state.tiers.status = 'failed';
//         state.tiers.error = action.payload;
//       })
//     // Cleanup expired requests
//       .addCase(cleanupExpiredRequests.fulfilled, (state) => {
//         state.status = 'succeeded';
//         state.lastAction = 'cleanupExpiredRequests';
//       });
//   },
// });

// export const { resetStatus, clearFriendshipData, updateFriendshipStatus } = friendshipSlice.actions;
// export default friendshipSlice.reducer;






