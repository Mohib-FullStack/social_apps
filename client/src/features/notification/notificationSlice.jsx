import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

// Thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ page = 1, type = null, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      
      const response = await axiosInstance.get('/notifications', { params });
      
      // Ensure consistent response structure
      return {
        data: response.data.notifications || response.data,
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: Math.ceil(response.data.total / limit),
          totalItems: response.data.total,
          limit
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);




export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationIds = [], { rejectWithValue }) => {
    try {
      await axiosInstance.patch('/notifications/mark-as-read', { notificationIds });
      return notificationIds;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

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

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  },
  filters: {
    type: null,
  },
  status: 'idle',
  error: null,
  lastUpdated: null,
};

// Slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // Check for duplicates based on a unique identifier
      const isDuplicate = state.notifications.some(
        n => n.id === action.payload.id || 
             (n.type === action.payload.type && n.metadata?.id === action.payload.metadata?.id)
      );
      
      if (!isDuplicate) {
        state.notifications.unshift({
          ...action.payload,
          isRead: action.payload.isRead || false,
          createdAt: action.payload.createdAt || new Date().toISOString(),
        });
        
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
        
        state.lastUpdated = Date.now();
      }
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    resetNotifications: () => initialState,
    setNotificationFilter: (state, action) => {
      state.filters.type = action.payload;
      // Reset pagination when filters change
      state.pagination.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      // .addCase(fetchNotifications.fulfilled, (state, action) => {
      //   state.status = 'succeeded';
      //   state.notifications = action.payload.data;
      //   state.pagination = {
      //     ...state.pagination,
      //     currentPage: action.payload.pagination.currentPage,
      //     totalPages: action.payload.pagination.totalPages,
      //     totalItems: action.payload.pagination.totalItems,
      //   };
      //   state.lastUpdated = Date.now();
      // })
 .addCase(fetchNotifications.fulfilled, (state, action) => {
      state.status = 'succeeded'; // Fix typo here
      // Ensure we're properly storing the array of notifications
      state.notifications = Array.isArray(action.payload?.data) 
        ? action.payload.data 
        : action.payload || [];
      state.pagination = action.payload.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: state.notifications.length,
        limit: 20
      };
    })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Mark As Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const idsToUpdate = action.payload;
        
        state.notifications = state.notifications.map(n => 
          idsToUpdate.includes(n.id) ? { ...n, isRead: true } : n
        );
        
        // Only decrease unreadCount if we actually marked some as read
        const markedCount = idsToUpdate.length > 0 ? 
          idsToUpdate.length : 
          state.notifications.filter(n => !n.isRead).length;
          
        state.unreadCount = Math.max(0, state.unreadCount - markedCount);
        state.lastUpdated = Date.now();
      })
      
      // Mark All As Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
        state.lastUpdated = Date.now();
      })
      
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const deletedNotification = state.notifications.find(n => n.id === deletedId);
        
        state.notifications = state.notifications.filter(n => n.id !== deletedId);
        
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        state.lastUpdated = Date.now();
      });
  },
});

export const { 
  addNotification, 
  incrementUnreadCount, 
  resetNotifications,
  setNotificationFilter,
} = notificationSlice.actions;

export const selectAllNotifications = (state) => state.notification.notifications;
export const selectUnreadNotifications = (state) => 
  state.notification.notifications.filter(n => !n.isRead);
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectNotificationStatus = (state) => state.notification.status;
export const selectNotificationError = (state) => state.notification.error;
export const selectNotificationPagination = (state) => state.notification.pagination;
export const selectNotificationFilters = (state) => state.notification.filters;

export default notificationSlice.reducer;