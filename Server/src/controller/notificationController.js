const { Op } = require('sequelize');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const { getPagination, getPagingData } = require('../helper/pagination');
const { redisConfig } = require('../secret');
const formatResponse = require('../helper/formatResponse'); // make sure this exists
const redisClient = require('../redisClient');

const getCacheKey = (userId) => `user:${userId}:unread_notifications`;


// In notificationController.js
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, size = 20 } = req.query;

    // Validate inputs
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    
    if (isNaN(pageNum)) throw new Error('Invalid page number');
    if (isNaN(sizeNum)) throw new Error('Invalid page size');

    const { count, rows } = await Notification.findAndCountAll({
      where: { userId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        required: false // Make this optional
      }],
      limit: sizeNum,
      offset: (pageNum - 1) * sizeNum,
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    });

    // Process notifications to ensure consistent structure
    const notifications = rows.map(row => {
      const sender = row.sender || {};
      return {
        ...row,
        metadata: {
          ...row.metadata,
          senderName: `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Unknown User',
          avatarUrl: sender.profileImage || '/default-avatar.png',
          senderId: sender.id || null
        }
      };
    });

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(count / sizeNum),
        totalItems: count,
        itemsPerPage: sizeNum
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



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



const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.markAsRead(req.user.id);
    await redisConfig.del(getCacheKey(req.user.id));

    return res.status(200).json(formatResponse(true, null, 'All notifications marked as read'));
  } catch (error) {
    return next(error);
  }
};



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
    
    // Update Redis cache
    try {
      if (redisClient.isOpen) {
        await redisClient.del(`user:${req.user.id}:unread_notifications`);
      }
    } catch (redisError) {
      console.error('Redis error during notification deletion:', redisError);
    }

    return res.status(200).json(formatResponse(true, null, 'Notification deleted successfully'));
  } catch (error) {
    console.error('Delete notification error:', error);
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





































//! final
// const { Op } = require('sequelize');
// const Notification = require('../models/notificationModel');
// const User = require('../models/userModel');
// const { getPagination, getPagingData } = require('../helper/pagination');
// const { redisConfig } = require('../secret');
// const formatResponse = require('../helper/formatResponse'); // make sure this exists
// const redisClient = require('../redisClient');

// const getCacheKey = (userId) => `user:${userId}:unread_notifications`;


// const getNotifications = async (req, res) => {
//   const userId = req.user.id; // 👈 this might be undefined if JWT is not verified
//   const { page = 1, size = 20 } = req.query;

//   try {
//     const notifications = await Notification.findAndCountAll({
//       where: { userId },
//       limit: size,
//       offset: (page - 1) * size,
//       order: [['createdAt', 'DESC']]
//     });

//     return res.status(200).json({
//       notifications: notifications.rows,
//       total: notifications.count
//     });
//   } catch (err) {
//     console.error('Error fetching notifications:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };



// const getUnreadCount = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       console.error('No user found in request');
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const count = await Notification.getUnreadCount(req.user.id);
//     res.json({ count });
//   } catch (error) {
//     console.error('Get unread count error:', error.message, error.stack);
//     res.status(500).json({ error: 'Server error while counting unread notifications' });
//   }
// };



// const markAsRead = async (req, res, next) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json(formatResponse(false, null, 'Unauthorized'));
//     }

//     const { notificationIds } = req.body;

//     if (Array.isArray(notificationIds) && notificationIds.length > 0) {
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
//       // Ensure this method exists or use the alternative:
//       await Notification.update(
//         { isRead: true },
//         { where: { userId: req.user.id } }
//       );
//     }

//     try {
//       await redisConfig.del(getCacheKey(req.user.id));
//     } catch (redisError) {
//       console.error('Redis deletion error:', redisError.message);
//     }

//     return res.status(200).json(formatResponse(true, null, 'Notifications marked as read'));
//   } catch (error) {
//     console.error('markAsRead error:', error);
//     return next(error);
//   }
// };



// const markAllAsRead = async (req, res, next) => {
//   try {
//     await Notification.markAsRead(req.user.id);
//     await redisConfig.del(getCacheKey(req.user.id));

//     return res.status(200).json(formatResponse(true, null, 'All notifications marked as read'));
//   } catch (error) {
//     return next(error);
//   }
// };



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
    
//     // Update Redis cache
//     try {
//       if (redisClient.isOpen) {
//         await redisClient.del(`user:${req.user.id}:unread_notifications`);
//       }
//     } catch (redisError) {
//       console.error('Redis error during notification deletion:', redisError);
//     }

//     return res.status(200).json(formatResponse(true, null, 'Notification deleted successfully'));
//   } catch (error) {
//     console.error('Delete notification error:', error);
//     return next(error);
//   }
// };

// module.exports = {
//   getNotifications,
//   getUnreadCount,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification
// };





























