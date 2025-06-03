const { Notification, User } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../helper/pagination');
const { redisConfig } = require('../secret');

/**
 * @desc    Get all notifications for authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const { page = 1, size = 20, type } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const whereClause = { 
      userId: req.user.id 
    };
    
    if (type) {
      whereClause.type = type;
    }

    const result = await Notification.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const response = getPagingData(result, page, limit);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread notifications count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notifications as read
 * @route   PATCH /api/notifications/mark-as-read
 * @access  Private
 */
const markNotificationsAsRead = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;
    
    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
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
      // Mark all notifications as read
      await Notification.markAsRead(req.user.id);
    }

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/mark-all-as-read
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.markAsRead(req.user.id);
    
    // Clear unread count cache
    await redisConfig.del(`user:${req.user.id}:unread_notifications`);
    
    res.status(200).json(formatResponse(true, null, 'All notifications marked as read'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:notificationId
 * @access  Private
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
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  markNotificationsAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
};













// const { Notification, User } = require('../models/associations');
// const { Op } = require('sequelize');
// const { getPagination, getPagingData } = require('../helper/pagination');
// const { redisConfig } = require('../secret');
// const { emitNotification } = require('../config/socket.io');

// // Enhanced response formatter with status codes
// const formatResponse = (success, data = null, message = '', statusCode = 200) => {
//   return {
//     statusCode,
//     response: {
//       success,
//       data,
//       message,
//       timestamp: new Date().toISOString()
//     }
//   };
// };

// // Helper to clear cache and emit socket events
// const updateNotificationState = async (userId, notification = null) => {
//   const cacheKey = `user:${userId}:unread_notifications`;
//   await redisConfig.del(cacheKey);
  
//   if (notification) {
//     emitNotification(io, userId, notification);
//   }
// };

// /**
//  * @desc    Get all notifications for authenticated user
//  * @route   GET /api/notifications
//  * @access  Private
//  */
// const getUserNotifications = async (req, res, next) => {
//   try {
//     const { page = 1, size = 20, type, isRead } = req.query;
//     const { limit, offset } = getPagination(page, size);
    
//     const whereClause = { 
//       userId: req.user.id 
//     };
    
//     if (type) whereClause.type = type;
//     if (isRead) whereClause.isRead = isRead === 'true';

//     const result = await Notification.findAndCountAll({
//       where: whereClause,
//       include: [{
//         model: User,
//         as: 'sender',
//         attributes: ['id', 'firstName', 'lastName', 'profileImage']
//       }],
//       order: [['createdAt', 'DESC']],
//       limit,
//       offset
//     });

//     const response = getPagingData(result, page, limit);
//     const { statusCode, response: formattedResponse } = formatResponse(true, response);
//     res.status(statusCode).json(formattedResponse);
//   } catch (error) {
//     next(error);
//   }
// };


// /**
//  * @desc    Get unread notifications count
//  * @route   GET /api/notifications/unread-count
//  * @access  Private
//  */
// const getUnreadCount = async (req, res, next) => {
//   try {
//     const cacheKey = `user:${req.user.id}:unread_notifications`;
    
//     // Try to get from cache first
//     const cachedCount = await redisConfig.get(cacheKey);
//     if (cachedCount) {
//       return res.status(200).json(formatResponse(true, { count: parseInt(cachedCount) }));
//     }

//     const count = await Notification.getUnreadCount(req.user.id);
    
//     // Cache the result for 5 minutes
//     await redisConfig.set(cacheKey, count, { EX: 300 });
    
//     res.status(200).json(formatResponse(true, { count }));
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Mark notifications as read
//  * @route   PATCH /api/notifications/mark-as-read
//  * @access  Private
//  */
// const markNotificationsAsRead = async (req, res, next) => {
//   try {
//     const { notificationIds } = req.body;
    
//     if (notificationIds && notificationIds.length > 0) {
//       // Mark specific notifications as read
//       await Notification.update(
//         { isRead: true },
//         { 
//           where: { 
//             id: { [Op.in]: notificationIds },
//             userId: req.user.id 
//           } 
//         }
//       );
//     } else {
//       // Fallback to marking all as read if no IDs provided
//       await Notification.markAsRead(req.user.id);
//     }

//     // Clear unread count cache
//     await redisConfig.del(`user:${req.user.id}:unread_notifications`);
    
//     res.status(200).json(formatResponse(true, null, 'Notifications marked as read'));
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Mark all notifications as read
//  * @route   PATCH /api/notifications/mark-all-as-read
//  * @access  Private
//  */
// const markAllAsRead = async (req, res, next) => {
//   try {
//     await Notification.markAsRead(req.user.id);
    
//     // Clear unread count cache
//     await redisConfig.del(`user:${req.user.id}:unread_notifications`);
    
//     res.status(200).json(formatResponse(true, null, 'All notifications marked as read'));
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Delete a notification
//  * @route   DELETE /api/notifications/:notificationId
//  * @access  Private
//  */
// const deleteNotification = async (req, res, next) => {
//   try {
//     const { notificationId } = req.params;
    
//     const notification = await Notification.findOne({
//       where: {
//         id: notificationId,
//         userId: req.user.id
//       }
//     });

//     if (!notification) {
//       return res.status(404).json(formatResponse(false, null, 'Notification not found'));
//     }

//     await notification.destroy();
    
//     // Clear unread count cache if the deleted notification was unread
//     if (!notification.isRead) {
//       await redisConfig.del(`user:${req.user.id}:unread_notifications`);
//     }
    
//     res.status(200).json(formatResponse(true, null, 'Notification deleted successfully'));
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   getUserNotifications,
//   markNotificationsAsRead,
//   markAllAsRead,
//   getUnreadCount,
//   deleteNotification
// };





