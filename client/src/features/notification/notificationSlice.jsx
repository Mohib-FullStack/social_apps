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















