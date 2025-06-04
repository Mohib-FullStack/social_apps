// src/features/notification/notificationSlice.jsx

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

// Constants
const NOTIFICATIONS_PER_PAGE = 20;

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, size = NOTIFICATIONS_PER_PAGE, type = null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (type) params.append('type', type);

      const { data } = await axiosInstance.get(`/notifications?${params.toString()}`);

      if (!data || !data.notifications) throw new Error('Invalid response structure from server');

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
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch notifications');
    }
  }
);

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

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.patch('/notifications/mark-all-as-read');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 3) Accept friend request
export const acceptFriendRequest = createAsyncThunk(
  'notifications/acceptFriendRequest',
  async ({ notificationId, senderId }, thunkAPI) => {
    await axiosInstance.post(`/friends/accept`, { senderId }); // or { friendRequestId }
    return { notificationId };
  }
);


// 4) Reject friend request
export const rejectFriendRequest = createAsyncThunk(
  'notifications/rejectFriendRequest',
  async ({ notificationId, senderId }, thunkAPI) => {
    await axiosInstance.post(`/friends/reject`, { senderId }); // or { friendRequestId }
    return { notificationId };
  }
);


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

// Initial State
const initialState = {
  items: [],
  unreadCount: 0,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: NOTIFICATIONS_PER_PAGE
  },
  filters: {
    type: null
  },
  status: 'idle',
  error: null,
  lastUpdated: null
};

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotif = action.payload;
      const exists = state.items.some(item => item.id === newNotif.id);
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
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { notifications, pagination, filters } = action.payload;
        state.items = pagination.currentPage === 1
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
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const ids = action.payload;
        state.items = state.items.map(item =>
          ids.includes(item.id) ? { ...item, isRead: true } : item
        );
        state.unreadCount = Math.max(0, state.unreadCount - ids.length);
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items = state.items.map(item => ({ ...item, isRead: true }));
        state.unreadCount = 0;
      })


  // ACCEPT FRIEND REQUEST
  .addCase(acceptFriendRequest.fulfilled, (state, action) => {
  const { notificationId } = action.payload;
  state.items = state.items.filter((n) => n.id !== notificationId);
})

      // REJECT FRIEND REQUEST
.addCase(rejectFriendRequest.fulfilled, (state, action) => {
  const { notificationId } = action.payload;
  state.items = state.items.filter((n) => n.id !== notificationId);
})


      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const deleted = state.items.find(item => item.id === id);
        state.items = state.items.filter(item => item.id !== id);
        if (deleted && !deleted.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      })
      .addMatcher(
        (action) => action.type.startsWith('notifications/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Something went wrong';
        }
      );
  }
});

// Selectors
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectPagination = (state) => state.notifications.pagination;
export const selectNotificationStatus = (state) => state.notifications.status;
export const selectNotificationError = (state) => state.notifications.error;
export const selectNotificationFilters = (state) => state.notifications.filters;

// Actions
export const {
  addNotification,
  resetStatus,
  clearNotifications,
  setNotificationFilter
} = notificationSlice.actions;

export default notificationSlice.reducer;










