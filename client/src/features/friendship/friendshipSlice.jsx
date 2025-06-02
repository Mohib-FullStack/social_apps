// 🔵 FRIENDSHIP SLICE - Redux Toolkit slice for all friendship operations
// Matches backend controller functionality with proper state management

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

// 🟢 CONSTANTS
const FRIENDS_PER_PAGE = 10; // Default pagination size

// 🔵 THUNKS ======================================================

// 🔵 Friend Requests Management
export const sendFriendRequest = createAsyncThunk(
  'friendship/sendFriendRequest',
  async ({ targetUserId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/friendships/requests', { friendId: targetUserId });
      return {
        ...res.data.friendship,
        to: res.data.friendship.friendId,
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

// 🔵 Friendship Management
export const unfriendUser = createAsyncThunk(
  'friendship/unfriendUser',
  async (friendshipId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/friendships/${friendshipId}`);
      return friendshipId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove friendship');
    }
  }
);

// 🔵 Block Management
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

// 🔵 Query Methods
export const fetchUserFriends = createAsyncThunk(
  'friendship/fetchUserFriends',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/friendships/${userId}/friends?page=${page}&size=${FRIENDS_PER_PAGE}`
      );
      return {
        data: response.data.payload.data,
        pagination: response.data.payload.pagination,
        userId
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMutualFriends = createAsyncThunk(
  'friendship/fetchMutualFriends',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/friendships/${userId}/mutual-friends?page=${page}&size=${FRIENDS_PER_PAGE}`
      );
      return {
        data: response.data.payload.data,
        pagination: response.data.payload.pagination,
        userId
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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

// 🟠 Maintenance Functions (Not typically used in frontend, but available if needed)
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

// 🟢 INITIAL STATE ===============================================
const initialState = {
  friendsList: {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    }
  },
  mutualFriends: {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    }
  },
  friends: [],
  requests: [],
  friendshipStatus: {}, // Keyed by userId
  status: 'idle', // Global status
  friendsStatus: 'idle', // Specific to friends list
  mutualFriendsStatus: 'idle', // Specific to mutual friends
  error: null,
};

// 🔵 SLICE =======================================================
const friendshipSlice = createSlice({
  name: 'friendship',
  initialState,
  reducers: {
    // 🟢 Reset status and error
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    // 🟢 Clear all friendship data
    clearFriendshipData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // 🔵 Friend Lists
      .addCase(fetchUserFriends.pending, (state) => {
        state.friendsStatus = 'loading';
      })
      .addCase(fetchUserFriends.fulfilled, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.friendsList = {
            data: action.payload.data,
            pagination: action.payload.pagination
          };
        } else {
          state.friendsList = {
            data: [...state.friendsList.data, ...action.payload.data],
            pagination: action.payload.pagination
          };
        }
        state.friendsStatus = 'succeeded';
      })
      .addCase(fetchUserFriends.rejected, (state, action) => {
        state.friendsStatus = 'failed';
        state.error = action.payload;
      })

      // 🔵 Mutual Friends
      .addCase(fetchMutualFriends.pending, (state) => {
        state.mutualFriendsStatus = 'loading';
      })
      .addCase(fetchMutualFriends.fulfilled, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.mutualFriends = {
            data: action.payload.data,
            pagination: action.payload.pagination
          };
        } else {
          state.mutualFriends = {
            data: [...state.mutualFriends.data, ...action.payload.data],
            pagination: action.payload.pagination
          };
        }
        state.mutualFriendsStatus = 'succeeded';
      })
      .addCase(fetchMutualFriends.rejected, (state, action) => {
        state.mutualFriendsStatus = 'failed';
        state.error = action.payload;
      })

      // 🔵 Friend Requests
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.requests.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.friends.push(action.payload);
        state.requests = state.requests.filter(r => r.id !== action.payload.id);
        state.status = 'succeeded';
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload.id);
        state.status = 'succeeded';
      })

      // 🔵 Friendship Management
      .addCase(unfriendUser.fulfilled, (state, action) => {
        state.friends = state.friends.filter(f => f.id !== action.payload);
        state.status = 'succeeded';
      })

      // 🔵 Block Management
      .addCase(blockUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(unblockUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })

      // 🔵 Query Methods
      .addCase(listFriends.fulfilled, (state, action) => {
        state.friends = action.payload;
        state.status = 'succeeded';
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
        state.status = 'succeeded';
      })
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
        state.status = 'succeeded';
      })
      .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        state.friendshipStatus[userId] = status;
        state.status = 'succeeded';
      })

      // 🟠 Maintenance
      .addCase(cleanupExpiredRequests.fulfilled, (state) => {
        state.status = 'succeeded';
      })

      // 🟢 Global Status Matchers
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
  },
});

export const { resetStatus, clearFriendshipData } = friendshipSlice.actions;
export default friendshipSlice.reducer;



//! old
// // src/features/friendship/friendshipSlice.js
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // Thunks

// export const fetchUserFriends = createAsyncThunk(
//   'friendship/fetchUserFriends',
//   async ({ userId, page = 1 }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(
//         `/friendships/${userId}/friends?page=${page}`
//       );
//       return {
//         data: response.data.payload.data,
//         pagination: response.data.payload.pagination,
//         userId // Track which user these friends belong to
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// export const fetchMutualFriends = createAsyncThunk(
//   'friendship/fetchMutualFriends',
//   async ({ userId, page = 1 }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get(
//         `/friendships/${userId}/mutual-friends?page=${page}`
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
//       return res.data.friendship;
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
//       return res.data.friendship;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to reject request');
//     }
//   }
// );

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

// // Initial State

// const initialState = {
//   friendsList: [],
//   friendsStatus: 'idle',
//   friendsError: null,
//   requests: [],
//   mutualFriends: {
//     data: [],
//     pagination: {
//       currentPage: 1,
//       totalPages: 1,
//       totalItems: 0,
//     },
//   },
//   friendshipStatus: {},
//   status: 'idle',
//   error: null,
//   friends: [],
// };

// // Slice

// const friendshipSlice = createSlice({
//   name: 'friendship',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//          .addCase(fetchUserFriends.fulfilled, (state, action) => {
//   if (action.meta.arg.page === 1) {
//     // First page - replace data
//     state.friendsList = {
//       data: action.payload.data,
//       pagination: action.payload.pagination
//     };
//   } else {
//     // Subsequent pages - append data
//     state.friendsList = {
//       data: [...state.friendsList.data, ...action.payload.data],
//       pagination: action.payload.pagination
//     };
//   }
//   state.friendsStatus = 'succeeded';
// })

//         .addCase(fetchMutualFriends.fulfilled, (state, action) => {
//   if (action.meta.arg.page === 1) {
//     state.mutualFriends = {
//       data: action.payload.data,
//       pagination: action.payload.pagination
//     };
//   } else {
//     state.mutualFriends = {
//       data: [...state.mutualFriends.data, ...action.payload.data],
//       pagination: action.payload.pagination
//     };
//   }
//   state.mutualFriendsStatus = 'succeeded';
// })

//       .addCase(sendFriendRequest.fulfilled, (state, action) => {
//         state.requests.push(action.payload);
//         state.status = 'succeeded';
//       })

//       .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//         state.requests = state.requests.filter(r => r.id !== action.payload);
//       })

//       .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//         state.friends.push(action.payload);
//         state.requests = state.requests.filter(r => r.id !== action.payload.id);
//       })

//       .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//         state.requests = state.requests.filter(r => r.id !== action.payload.id);
//       })

//       .addCase(listFriends.fulfilled, (state, action) => {
//         state.friends = action.payload;
//       })

//       .addCase(getPendingRequests.fulfilled, (state, action) => {
//         state.requests = action.payload;
//       })

//       .addCase(getSentRequests.fulfilled, (state, action) => {
//         state.requests = action.payload;
//       })

//       .addCase(checkFriendshipStatus.fulfilled, (state, action) => {
//         const { userId, status } = action.payload;
//         state.friendshipStatus[userId] = status;
//       })

//       .addCase(unfriendUser.fulfilled, (state, action) => {
//         state.friends = state.friends.filter(f => f.id !== action.payload);
//       })

//       .addCase(blockUser.fulfilled, (state) => {
//         state.status = 'succeeded';
//       })

//       .addCase(unblockUser.fulfilled, (state) => {
//         state.status = 'succeeded';
//       })

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

// export default friendshipSlice.reducer;
