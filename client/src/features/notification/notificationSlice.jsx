// // notificationSlice.js
// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import axiosInstance from '../../axiosInstance';

// // Thunks
// export const fetchNotifications = createAsyncThunk(
//   'notification/fetchNotifications',
//   async ({ page = 1, type = null, limit = 20 }, { rejectWithValue }) => {
//     try {
//       const params = { page, limit };
//       if (type) params.type = type;
      
//       const response = await axiosInstance.get('/notifications', { params });
      
//       // Normalize response structure
//       const notifications = Array.isArray(response.data)
//         ? response.data
//         : response.data?.notifications || response.data?.data || [];
      
//       const pagination = response.data?.pagination || {
//         currentPage: page,
//         totalPages: Math.ceil((response.data?.total || response.data?.count || 0) / limit),
//         totalItems: response.data?.total || response.data?.count || 0,
//         limit
//       };

//       return { notifications, pagination };
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const fetchUnreadCount = createAsyncThunk(
//   'notification/fetchUnreadCount',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.get('/notifications/unread-count');
//       return response.data?.count || response.data?.unreadCount || 0;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const markAsRead = createAsyncThunk(
//   'notification/markAsRead',
//   async (notificationIds = [], { rejectWithValue }) => {
//     try {
//       await axiosInstance.patch('/notifications/mark-as-read', { 
//         notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds] 
//       });
//       return notificationIds;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const deleteNotification = createAsyncThunk(
//   'notification/deleteNotification',
//   async (notificationId, { rejectWithValue }) => {
//     try {
//       await axiosInstance.delete(`/notifications/${notificationId}`);
//       return notificationId;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const markAllAsRead = createAsyncThunk(
//   'notification/markAllAsRead',
//   async (_, { rejectWithValue }) => {
//     try {
//       await axiosInstance.patch('/notifications/mark-all-as-read');
//       return true;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // Initial state
// const initialState = {
//   items: [],
//   unreadCount: 0,
//   status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
//   error: null,
//   pagination: {
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
//     limit: 20,
//   },
//   filters: {
//     type: null,
//   },
//   lastUpdated: null,
// };

// // Slice
// const notificationSlice = createSlice({
//   name: 'notification',
//   initialState,
//   reducers: {
//     addNotification: (state, action) => {
//       const newNotification = action.payload;
//       const exists = state.items.some(item => item.id === newNotification.id);
      
//       if (!exists) {
//         state.items.unshift({
//           ...newNotification,
//           isRead: newNotification.isRead || false,
//           createdAt: newNotification.createdAt || new Date().toISOString(),
//         });
        
//         if (!newNotification.isRead) {
//           state.unreadCount += 1;
//         }
//         state.lastUpdated = Date.now();
//       }
//     },
//     resetNotifications: () => initialState,
//     setNotificationFilter: (state, action) => {
//       state.filters.type = action.payload;
//       state.pagination.currentPage = 1;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchNotifications.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchNotifications.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.items = action.payload.notifications;
//         state.pagination = action.payload.pagination;
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
//         const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
//         state.items = state.items.map(item => 
//           ids.includes(item.id) ? { ...item, isRead: true } : item
//         );
//         state.unreadCount = Math.max(0, state.unreadCount - ids.length);
//       })
//       .addCase(markAllAsRead.fulfilled, (state) => {
//         state.items = state.items.map(item => ({ ...item, isRead: true }));
//         state.unreadCount = 0;
//       })
//       .addCase(deleteNotification.fulfilled, (state, action) => {
//         const deletedItem = state.items.find(item => item.id === action.payload);
//         state.items = state.items.filter(item => item.id !== action.payload);
//         if (deletedItem && !deletedItem.isRead) {
//           state.unreadCount = Math.max(0, state.unreadCount - 1);
//         }
//         state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
//       });
//   },
// });

// // Selectors
// export const selectAllNotifications = (state) => state.notification.items;
// export const selectUnreadCount = (state) => state.notification.unreadCount;
// export const selectNotificationStatus = (state) => state.notification.status;
// export const selectNotificationError = (state) => state.notification.error;
// export const selectNotificationPagination = (state) => state.notification.pagination;

// export const { addNotification, resetNotifications, setNotificationFilter } = notificationSlice.actions;
// export default notificationSlice.reducer;


//! new
// 🔵 NOTIFICATION SLICE - Redux Toolkit slice for all notification operations
// Consistent with friendship slice architecture and patterns

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

// 🟢 CONSTANTS
const NOTIFICATIONS_PER_PAGE = 20; // Default pagination size

// 🔵 THUNKS ======================================================

// 🔵 Notification Fetching
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ page = 1, type = null, limit = NOTIFICATIONS_PER_PAGE }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      
      const response = await axiosInstance.get('/notifications', { params });
      
      return {
        notifications: response.data?.notifications || response.data?.data || [],
        pagination: response.data?.pagination || {
          currentPage: page,
          totalPages: Math.ceil(response.data?.total / limit) || 1,
          totalItems: response.data?.total || 0,
          limit
        },
        filters: { type }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔵 Notification Status Management
export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data?.count || response.data?.unreadCount || 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationIds = [], { rejectWithValue }) => {
    try {
      await axiosInstance.patch('/notifications/mark-as-read', { 
        notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds] 
      });
      return notificationIds;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.patch('/notifications/mark-all-as-read');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔵 Notification Management
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🟢 INITIAL STATE ===============================================
const initialState = {
  notifications: {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: NOTIFICATIONS_PER_PAGE,
    }
  },
  unreadCount: 0,
  filters: {
    type: null,
  },
  status: 'idle', // Global status
  notificationsStatus: 'idle', // Specific to notifications list
  error: null,
  lastUpdated: null,
};

// 🔵 SLICE =======================================================
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // 🟢 Add a new notification (for real-time updates)
    addNotification: (state, action) => {
      const newNotification = action.payload;
      const exists = state.notifications.data.some(item => item.id === newNotification.id);
      
      if (!exists) {
        state.notifications.data.unshift({
          ...newNotification,
          isRead: newNotification.isRead || false,
          createdAt: newNotification.createdAt || new Date().toISOString(),
        });
        
        if (!newNotification.isRead) {
          state.unreadCount += 1;
        }
        state.lastUpdated = Date.now();
      }
    },
    // 🟢 Reset status and error
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    // 🟢 Clear all notification data
    clearNotifications: () => initialState,
    // 🟢 Set filter type
    setNotificationFilter: (state, action) => {
      state.filters.type = action.payload;
      state.notifications.pagination.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔵 Notification Lists
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsStatus = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.notifications = {
            data: action.payload.notifications,
            pagination: action.payload.pagination
          };
        } else {
          state.notifications = {
            data: [...state.notifications.data, ...action.payload.notifications],
            pagination: action.payload.pagination
          };
        }
        state.filters.type = action.payload.filters.type;
        state.notificationsStatus = 'succeeded';
        state.lastUpdated = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsStatus = 'failed';
        state.error = action.payload;
      })

      // 🔵 Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // 🔵 Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.notifications.data = state.notifications.data.map(item => 
          ids.includes(item.id) ? { ...item, isRead: true } : item
        );
        state.unreadCount = Math.max(0, state.unreadCount - ids.length);
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.data = state.notifications.data.map(item => ({ ...item, isRead: true }));
        state.unreadCount = 0;
      })

      // 🔵 Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedItem = state.notifications.data.find(item => item.id === action.payload);
        state.notifications.data = state.notifications.data.filter(item => item.id !== action.payload);
        if (deletedItem && !deletedItem.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.pagination.totalItems = Math.max(0, state.notifications.pagination.totalItems - 1);
      })

      // 🟢 Global Status Matchers
      .addMatcher(
        (action) => action.type.startsWith('notification/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('notification/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'An error occurred';
        }
      );
  },
});

// 🟢 SELECTORS ==================================================
export const selectAllNotifications = (state) => state.notification.notifications.data;
export const selectNotificationStatus = (state) => state.notification.status;
export const selectNotificationError = (state) => state.notification.error;
export const selectNotificationPagination = (state) => state.notification.notifications.pagination;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectNotificationFilters = (state) => state.notification.filters;
export const selectNotificationsStatus = (state) => state.notification.notificationsStatus;



export const { 
  addNotification, 
  resetStatus, 
  clearNotifications, 
  setNotificationFilter 
} = notificationSlice.actions;

export default notificationSlice.reducer;



