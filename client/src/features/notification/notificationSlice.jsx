// src/features/notification/notificationSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

const NOTIFICATIONS_PER_PAGE = 20;

// 1) Fetch notifications (paginated)
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, size = NOTIFICATIONS_PER_PAGE, type = null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (type) params.append('type', type);
      const { data } = await axiosInstance.get(`/notifications?${params.toString()}`);
      if (!data || !data.notifications) throw new Error('Invalid response');
      return {
        notifications: data.notifications,
        pagination: data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: size
        },
        filters: { type: type || null }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 2) Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/notifications/unread-count');
      return data.count ?? data.unreadCount ?? 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 3) Mark as read (one or more)
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationIds = [], { rejectWithValue }) => {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      await axiosInstance.patch('/notifications/mark-as-read', { notificationIds: ids });
      return ids;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 4) Mark all as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.put('/notifications/mark-all-as-read');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 7) Delete single notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: NOTIFICATIONS_PER_PAGE
  },
  filters: { type: null },
  status: 'idle',
  error: null,
  lastUpdated: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotif = action.payload;
      const exists = state.items.some((item) => item.id === newNotif.id);
      if (!exists) {
        state.items.unshift({
          ...newNotif,
          isRead: newNotif.isRead ?? false,
          createdAt: newNotif.createdAt || new Date().toISOString()
        });
        if (!newNotif.isRead) state.unreadCount += 1;
        state.lastUpdated = Date.now();
      }
    },
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearNotifications: () => initialState,
    setNotificationFilter: (state, action) => {
      state.filters.type = action.payload;
      state.pagination.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { notifications, pagination, filters } = action.payload;
        state.items =
          pagination.currentPage === 1
            ? notifications
            : [...state.items, ...notifications];
        state.pagination = pagination;
        state.filters = filters;
        state.status = 'succeeded';
        state.lastUpdated = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // markAsRead
      .addCase(markAsRead.fulfilled, (state, action) => {
        const ids = action.payload;
        state.items = state.items.map((item) =>
          ids.includes(item.id) ? { ...item, isRead: true } : item
        );
        state.unreadCount = Math.max(0, state.unreadCount - ids.length);
      })

            // markAllAsRead
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true }));
        state.unreadCount = 0;
      })

        // deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const deleted = state.items.find((item) => item.id === id);
        state.items = state.items.filter((item) => item.id !== id);
        if (deleted && !deleted.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      })

      // catch any other /rejected
      .addMatcher(
        (action) =>
          action.type.startsWith('notifications/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Something went wrong';
        }
      );
  }
});

export const {
  addNotification,
  resetStatus,
  clearNotifications,
  setNotificationFilter
} = notificationSlice.actions;

export default notificationSlice.reducer;




// ! final
// src/features/notification/notificationSlice.js

// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';
// const NOTIFICATIONS_PER_PAGE = 20;

// // 1) Fetch notifications
// export const fetchNotifications = createAsyncThunk(
//   'notifications/fetchNotifications',
//   async ({ page = 1, size = NOTIFICATIONS_PER_PAGE, type = null }, { rejectWithValue }) => {
//     try {
//       const params = new URLSearchParams({ page, size });
//       if (type) params.append('type', type);
//       const { data } = await axiosInstance.get(`/notifications?${params.toString()}`);
//       if (!data || !data.notifications) throw new Error('Invalid response');
//       return {
//         notifications: data.notifications,
//         pagination: data.pagination || {
//           currentPage: page,
//           totalPages: 1,
//           totalItems: 0,
//           itemsPerPage: size
//         },
//         filters: { type: type || null }
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // 2) Fetch unread count
// export const fetchUnreadCount = createAsyncThunk(
//   'notifications/fetchUnreadCount',
//   async (_, { rejectWithValue }) => {
//     try {
//       const { data } = await axiosInstance.get('/notifications/unread-count');
//       // backend returns { count: X }
//       return data.count ?? data.unreadCount ?? 0;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // 3) Mark as read
// export const markAsRead = createAsyncThunk(
//   'notifications/markAsRead',
//   async (notificationIds = [], { rejectWithValue }) => {
//     try {
//       const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
//       await axiosInstance.patch('/notifications/mark-as-read', { notificationIds: ids });
//       return ids; // return an array of IDs that were marked read
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // 4) Mark all as read
// export const markAllAsRead = createAsyncThunk(
//   'notifications/markAllAsRead',
//   async (_, { rejectWithValue }) => {
//     try {
//       await axiosInstance.patch('/notifications/mark-all-as-read');
//       return true;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // 5) Accept friend request
// export const acceptFriendRequest = createAsyncThunk(
//   'notifications/acceptFriendRequest',
//   async ({ notificationId, senderId }, thunkAPI) => {
//     // Ensure your backend has POST /api/friends/accept
//     await axiosInstance.post('/api/friends/accept', { senderId });
//     // After backend updates Friendship, it should also create a new notification 
//     // for the original sender (type = 'friend_request_accepted')
//     return { notificationId };
//   }
// );

// // 6) Reject friend request
// export const rejectFriendRequest = createAsyncThunk(
//   'notifications/rejectFriendRequest',
//   async ({ notificationId, senderId }, thunkAPI) => {
//     // Ensure backend has POST /api/friends/reject
//     await axiosInstance.post('/api/friends/reject', { senderId });
//     return { notificationId };
//   }
// );

// // 7) Delete notification
// export const deleteNotification = createAsyncThunk(
//   'notifications/deleteNotification',
//   async (id, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/api/notifications/${id}`);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// const initialState = {
//   items: [],
//   unreadCount: 0,
//   pagination: {
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
//     itemsPerPage: NOTIFICATIONS_PER_PAGE
//   },
//   filters: { type: null },
//   status: 'idle',
//   error: null,
//   lastUpdated: null
// };

// const notificationSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     // (if you push real-time notifications via WebSocket, you can `addNotification` here)
//     addNotification: (state, action) => {
//       const newNotif = action.payload;
//       const exists = state.items.some((item) => item.id === newNotif.id);
//       if (!exists) {
//         state.items.unshift({
//           ...newNotif,
//           isRead: newNotif.isRead ?? false,
//           createdAt: newNotif.createdAt || new Date().toISOString()
//         });
//         if (!newNotif.isRead) state.unreadCount += 1;
//         state.lastUpdated = Date.now();
//       }
//     },
//     resetStatus: (state) => {
//       state.status = 'idle';
//       state.error = null;
//     },
//     clearNotifications: () => initialState,
//     setNotificationFilter: (state, action) => {
//       state.filters.type = action.payload;
//       state.pagination.currentPage = 1;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // fetchNotifications
//       .addCase(fetchNotifications.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchNotifications.fulfilled, (state, action) => {
//         const { notifications, pagination, filters } = action.payload;
//         state.items =
//           pagination.currentPage === 1
//             ? notifications
//             : [...state.items, ...notifications];
//         state.pagination = pagination;
//         state.filters = filters;
//         state.status = 'succeeded';
//         state.lastUpdated = Date.now();
//       })
//       .addCase(fetchNotifications.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })

//       // fetchUnreadCount
//       .addCase(fetchUnreadCount.fulfilled, (state, action) => {
//         state.unreadCount = action.payload;
//       })

//       // markAsRead
//       .addCase(markAsRead.fulfilled, (state, action) => {
//         const ids = action.payload; // array of IDs
//         state.items = state.items.map((item) =>
//           ids.includes(item.id) ? { ...item, isRead: true } : item
//         );
//         state.unreadCount = Math.max(0, state.unreadCount - ids.length);
//       })

//       // markAllAsRead
//       .addCase(markAllAsRead.fulfilled, (state) => {
//         state.items = state.items.map((item) => ({ ...item, isRead: true }));
//         state.unreadCount = 0;
//       })

//       // acceptFriendRequest
//       .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//         const { notificationId } = action.payload;
//         // remove that “friend_request” notification from the array
//         state.items = state.items.filter((n) => n.id !== notificationId);
//       })

//       // rejectFriendRequest
//       .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//         const { notificationId } = action.payload;
//         state.items = state.items.filter((n) => n.id !== notificationId);
//       })

//       // deleteNotification
//       .addCase(deleteNotification.fulfilled, (state, action) => {
//         const id = action.payload;
//         const deleted = state.items.find((item) => item.id === id);
//         state.items = state.items.filter((item) => item.id !== id);
//         if (deleted && !deleted.isRead) {
//           state.unreadCount = Math.max(0, state.unreadCount - 1);
//         }
//         state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
//       })

//       // catch any other rejected async thunk
//       .addMatcher(
//         (action) =>
//           action.type.startsWith('notifications/') && action.type.endsWith('/rejected'),
//         (state, action) => {
//           state.status = 'failed';
//           state.error = action.payload || 'Something went wrong';
//         }
//       );
//   }
// });

// export const {
//   addNotification,
//   resetStatus,
//   clearNotifications,
//   setNotificationFilter
// } = notificationSlice.actions;

// export default notificationSlice.reducer;


//! running
// src/features/notification/notificationSlice.jsx

// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // Constants
// const NOTIFICATIONS_PER_PAGE = 20;

// // Async Thunks
// export const fetchNotifications = createAsyncThunk(
//   'notifications/fetchNotifications',
//   async ({ page = 1, size = NOTIFICATIONS_PER_PAGE, type = null }, { rejectWithValue }) => {
//     try {
//       const params = new URLSearchParams({ page, size });
//       if (type) params.append('type', type);

//       const { data } = await axiosInstance.get(`/notifications?${params.toString()}`);

//       if (!data || !data.notifications) throw new Error('Invalid response structure from server');

//       return {
//         notifications: data.notifications,
//         pagination: data.pagination || {
//           currentPage: page,
//           totalPages: 1,
//           totalItems: 0,
//           itemsPerPage: size
//         },
//         filters: { type: type || null }
//       };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch notifications');
//     }
//   }
// );

// export const fetchUnreadCount = createAsyncThunk(
//   'notifications/fetchUnreadCount',
//   async (_, { rejectWithValue }) => {
//     try {
//       const { data } = await axiosInstance.get('/notifications/unread-count');
//       return data.count ?? data.unreadCount ?? 0;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const markAsRead = createAsyncThunk(
//   'notifications/markAsRead',
//   async (notificationIds = [], { rejectWithValue }) => {
//     try {
//       const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
//       await axiosInstance.patch('/notifications/mark-as-read', { notificationIds: ids });
//       return ids;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const markAllAsRead = createAsyncThunk(
//   'notifications/markAllAsRead',
//   async (_, { rejectWithValue }) => {
//     try {
//       await axiosInstance.patch('/notifications/mark-all-as-read');
//       return true;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // 3) Accept friend request
// export const acceptFriendRequest = createAsyncThunk(
//   'notifications/acceptFriendRequest',
//   async ({ notificationId, senderId }, thunkAPI) => {
//     await axiosInstance.post(`/friends/accept`, { senderId }); // or { friendRequestId }
//     return { notificationId };
//   }
// );


// // 4) Reject friend request
// export const rejectFriendRequest = createAsyncThunk(
//   'notifications/rejectFriendRequest',
//   async ({ notificationId, senderId }, thunkAPI) => {
//     await axiosInstance.post(`/friends/reject`, { senderId }); // or { friendRequestId }
//     return { notificationId };
//   }
// );


// export const deleteNotification = createAsyncThunk(
//   'notifications/deleteNotification',
//   async (id, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/notifications/${id}`);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // Initial State
// const initialState = {
//   items: [],
//   unreadCount: 0,
//   pagination: {
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
//     itemsPerPage: NOTIFICATIONS_PER_PAGE
//   },
//   filters: {
//     type: null
//   },
//   status: 'idle',
//   error: null,
//   lastUpdated: null
// };

// // Slice
// const notificationSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     addNotification: (state, action) => {
//       const newNotif = action.payload;
//       const exists = state.items.some(item => item.id === newNotif.id);
//       if (!exists) {
//         state.items.unshift({
//           ...newNotif,
//           isRead: newNotif.isRead ?? false,
//           createdAt: newNotif.createdAt || new Date().toISOString()
//         });
//         if (!newNotif.isRead) state.unreadCount += 1;
//         state.lastUpdated = Date.now();
//       }
//     },
//     resetStatus: (state) => {
//       state.status = 'idle';
//       state.error = null;
//     },
//     clearNotifications: () => initialState,
//     setNotificationFilter: (state, action) => {
//       state.filters.type = action.payload;
//       state.pagination.currentPage = 1;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchNotifications.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchNotifications.fulfilled, (state, action) => {
//         const { notifications, pagination, filters } = action.payload;
//         state.items = pagination.currentPage === 1
//           ? notifications
//           : [...state.items, ...notifications];
//         state.pagination = pagination;
//         state.filters = filters;
//         state.status = 'succeeded';
//         state.lastUpdated = Date.now();
//       })
//       .addCase(fetchNotifications.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })
//       .addCase(fetchUnreadCount.fulfilled, (state, action) => {
//         state.unreadCount = action.payload;
//       })
//       .addCase(markAsRead.fulfilled, (state, action) => {
//         const ids = action.payload;
//         state.items = state.items.map(item =>
//           ids.includes(item.id) ? { ...item, isRead: true } : item
//         );
//         state.unreadCount = Math.max(0, state.unreadCount - ids.length);
//       })
//       .addCase(markAllAsRead.fulfilled, (state) => {
//         state.items = state.items.map(item => ({ ...item, isRead: true }));
//         state.unreadCount = 0;
//       })


//   // ACCEPT FRIEND REQUEST
//   .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//   const { notificationId } = action.payload;
//   state.items = state.items.filter((n) => n.id !== notificationId);
// })

//       // REJECT FRIEND REQUEST
// .addCase(rejectFriendRequest.fulfilled, (state, action) => {
//   const { notificationId } = action.payload;
//   state.items = state.items.filter((n) => n.id !== notificationId);
// })


//       .addCase(deleteNotification.fulfilled, (state, action) => {
//         const id = action.payload;
//         const deleted = state.items.find(item => item.id === id);
//         state.items = state.items.filter(item => item.id !== id);
//         if (deleted && !deleted.isRead) {
//           state.unreadCount = Math.max(0, state.unreadCount - 1);
//         }
//         state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
//       })
//       .addMatcher(
//         (action) => action.type.startsWith('notifications/') && action.type.endsWith('/rejected'),
//         (state, action) => {
//           state.status = 'failed';
//           state.error = action.payload || 'Something went wrong';
//         }
//       );
//   }
// });

// // Selectors
// export const selectNotifications = (state) => state.notifications.items;
// export const selectUnreadCount = (state) => state.notifications.unreadCount;
// export const selectPagination = (state) => state.notifications.pagination;
// export const selectNotificationStatus = (state) => state.notifications.status;
// export const selectNotificationError = (state) => state.notifications.error;
// export const selectNotificationFilters = (state) => state.notifications.filters;

// // Actions
// export const {
//   addNotification,
//   resetStatus,
//   clearNotifications,
//   setNotificationFilter
// } = notificationSlice.actions;

// export default notificationSlice.reducer;










