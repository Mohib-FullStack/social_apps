const express = require('express');
const notificationRouter = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
     markAllAsRead,
  getUnreadCount,
  deleteNotification,

} = require('../controller/notificationController');

// Get all notifications for user
notificationRouter.get('/', isLoggedIn, getNotifications);

// Get unread notifications count
notificationRouter.get('/unread-count', isLoggedIn, getUnreadCount);

// Mark notifications as read
notificationRouter.patch('/mark-as-read', isLoggedIn, markAsRead);

// Mark all notifications as read
notificationRouter.patch('/mark-all-as-read', isLoggedIn, markAllAsRead);

// Delete a notification
notificationRouter.delete('/:notificationId', isLoggedIn, deleteNotification);

module.exports = notificationRouter;