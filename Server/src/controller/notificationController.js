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

//! refactor
// const { Op } = require('sequelize');
// const Notification = require('../models/notificationModel');
// const User = require('../models/userModel');
// const { getPagination, getPagingData } = require('../helper/pagination');
// const { redisConfig } = require('../secret');
// const formatResponse = require('../helper/formatResponse');

// const getCacheKey = (userId) => `user:${userId}:unread_notifications`;

// /**
//  * @desc Create a new notification
//  * @route POST /api/notifications
//  * @access Private (typically used internally by other services)
//  */
// const addNotification = async (req, res) => {
//   try {
//     const { userId, type, message, metadata } = req.body;

//     if (!userId || !type || !message) {
//       return res.status(400).json(
//         formatResponse(false, null, 'userId, type, and message are required')
//       );
//     }

//     const notification = await Notification.create({
//       userId,
//       type,
//       message,
//       metadata: metadata || {},
//       isRead: false
//     });

//     // Invalidate unread count cache
//     await redisConfig.del(getCacheKey(userId));

//     return res.status(201).json(
//       formatResponse(true, notification, 'Notification created successfully')
//     );
//   } catch (error) {
//     console.error('Add notification error:', error);
//     return res.status(500).json(
//       formatResponse(false, null, 'Failed to create notification')
//     );
//   }
// };

// /**
//  * @desc Get all notifications for authenticated user with pagination
//  * @route GET /api/notifications
//  * @access Private
//  */
// const getNotifications = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(401).json(
//         formatResponse(false, null, 'Unauthorized')
//       );
//     }

//     const { page = 1, size = 20, readStatus } = req.query;
//     const { limit, offset } = getPagination(page, size);
    
//     const where = { userId: req.user.id };
//     if (readStatus === 'read') where.isRead = true;
//     if (readStatus === 'unread') where.isRead = false;

//     const notifications = await Notification.findAndCountAll({
//       where,
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']],
//       include: [{
//         model: User,
//         attributes: ['id', 'username', 'avatar'],
//         as: 'user'
//       }]
//     });

//     const response = getPagingData(notifications, page, limit);
//     return res.status(200).json(
//       formatResponse(true, response, 'Notifications retrieved successfully')
//     );
//   } catch (error) {
//     console.error('Get notifications error:', error);
//     return res.status(500).json(
//       formatResponse(false, null, 'Failed to retrieve notifications')
//     );
//   }
// };

// /**
//  * @desc Get unread notifications count (with Redis cache)
//  * @route GET /api/notifications/unread-count
//  * @access Private
//  */
// const getUnreadCount = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(401).json(
//         formatResponse(false, null, 'Unauthorized')
//       );
//     }

//     const cacheKey = getCacheKey(req.user.id);
    
//     // Try to get from cache first
//     const cachedCount = await redisConfig.get(cacheKey);
//     if (cachedCount) {
//       return res.status(200).json(
//         formatResponse(true, { count: parseInt(cachedCount) }, 'Unread count retrieved from cache')
//       );
//     }

//     // If not in cache, query database
//     const count = await Notification.count({
//       where: {
//         userId: req.user.id,
//         isRead: false
//       }
//     });

//     // Cache the result with 5 minute expiration
//     await redisConfig.setex(cacheKey, 300, count);

//     return res.status(200).json(
//       formatResponse(true, { count }, 'Unread count retrieved successfully')
//     );
//   } catch (error) {
//     console.error('Get unread count error:', error);
//     return res.status(500).json(
//       formatResponse(false, null, 'Failed to get unread count')
//     );
//   }
// };

// /**
//  * @desc Mark specific or all notifications as read
//  * @route PATCH /api/notifications/mark-as-read
//  * @access Private
//  */
// const markAsRead = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(401).json(
//         formatResponse(false, null, 'Unauthorized')
//       );
//     }

//     const { notificationIds } = req.body;
//     const updateCondition = { userId: req.user.id, isRead: false }; // Only update unread ones

//     // If specific IDs provided, add them to condition
//     if (Array.isArray(notificationIds)){
//       updateCondition.id = { [Op.in]: notificationIds };
//     }
//     // If no IDs provided, it will update all unread notifications

//     const [affectedCount] = await Notification.update(
//       { isRead: true },
//       { where: updateCondition }
//     );

//     // Invalidate cache
//     await redisConfig.del(getCacheKey(req.user.id));

//     return res.status(200).json(
//       formatResponse(true, { affectedCount }, `${affectedCount} notifications marked as read`)
//     );
//   } catch (error) {
//     console.error('Mark as read error:', error);
//     return res.status(500).json(
//       formatResponse(false, null, 'Failed to mark notifications as read')
//     );
//   }
// };



// /**
//  * @desc Delete a notification
//  * @route DELETE /api/notifications/:notificationId
//  * @access Private
//  */
// const deleteNotification = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(401).json(
//         formatResponse(false, null, 'Unauthorized')
//       );
//     }

//     const { notificationId } = req.params;

//     const result = await Notification.destroy({
//       where: {
//         id: notificationId,
//         userId: req.user.id
//       }
//     });

//     if (!result) {
//       return res.status(404).json(
//         formatResponse(false, null, 'Notification not found or already deleted')
//       );
//     }

//     // Invalidate cache
//     await redisConfig.del(getCacheKey(req.user.id));

//     return res.status(200).json(
//       formatResponse(true, null, 'Notification deleted successfully')
//     );
//   } catch (error) {
//     console.error('Delete notification error:', error);
//     return res.status(500).json(
//       formatResponse(false, null, 'Failed to delete notification')
//     );
//   }
// };

// module.exports = {
//   addNotification,
//   getNotifications,
//   getUnreadCount,
//   markAsRead,
//   deleteNotification
// };



























