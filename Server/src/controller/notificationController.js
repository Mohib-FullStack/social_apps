const { Op } = require('sequelize');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const { getPagination, getPagingData } = require('../helper/pagination');
const { redisConfig } = require('../secret');
const formatResponse = require('../helper/formatResponse'); // make sure this exists

const getCacheKey = (userId) => `user:${userId}:unread_notifications`;

/**
 * @desc Get all notifications for authenticated user
 * @route GET /api/notifications
 * @access Private
 */
const getNotifications = async (req, res) => {
  const userId = req.user.id; // 👈 this might be undefined if JWT is not verified
  const { page = 1, size = 20 } = req.query;

  try {
    const notifications = await Notification.findAndCountAll({
      where: { userId },
      limit: size,
      offset: (page - 1) * size,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      notifications: notifications.rows,
      total: notifications.count
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


/**
 * @desc Get unread notifications count (with Redis cache)
 * @route GET /api/notifications/unread-count
 * @access Private
 */
const getUnreadCount = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error('No user found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error while counting unread notifications' });
  }
};


/**
 * @desc Mark specific or all notifications as read
 * @route PATCH /api/notifications/mark-as-read
 * @access Private
 */
const markAsRead = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json(formatResponse(false, null, 'Unauthorized'));
    }

    const { notificationIds } = req.body;

    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      await Notification.update(
        { isRead: true },
        {
          where: {
            id: { [Op.in]: notificationIds },
            userId: req.user.id
          }
        }
      );
    } else {
      // Ensure this method exists or use the alternative:
      await Notification.update(
        { isRead: true },
        { where: { userId: req.user.id } }
      );
    }

    try {
      await redisConfig.del(getCacheKey(req.user.id));
    } catch (redisError) {
      console.error('Redis deletion error:', redisError.message);
    }

    return res.status(200).json(formatResponse(true, null, 'Notifications marked as read'));
  } catch (error) {
    console.error('markAsRead error:', error);
    return next(error);
  }
};


/**
 * @desc Mark all notifications as read
 * @route PATCH /api/notifications/mark-all-as-read
 * @access Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.markAsRead(req.user.id);
    await redisConfig.del(getCacheKey(req.user.id));

    return res.status(200).json(formatResponse(true, null, 'All notifications marked as read'));
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc Delete a notification
 * @route DELETE /api/notifications/:notificationId
 * @access Private
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json(formatResponse(false, null, 'Notification not found'));
    }

    await notification.destroy();
    await redisConfig.del(getCacheKey(req.user.id));

    return res.status(200).json(formatResponse(true, null, 'Notification deleted successfully'));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};





























