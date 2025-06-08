const express = require('express');
const notificationRouter = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  getUnreadCount,
  deleteNotification,
  markAllAsRead,

} = require('../controller/notificationController');

// Add notifications
notificationRouter.post('/', isLoggedIn,getNotifications);

// Get all notifications for user
notificationRouter.get('/', isLoggedIn, getNotifications);

// Get unread notifications count
notificationRouter.get('/unread-count', isLoggedIn, getUnreadCount);

// Mark notifications as read
notificationRouter.put('/mark-as-read', isLoggedIn, markAsRead);

// Mark notifications as read
notificationRouter.put('/mark-all-as-read', isLoggedIn, markAllAsRead);

// Delete a notification
notificationRouter.delete('/:notificationId', isLoggedIn, deleteNotification);

module.exports = notificationRouter;