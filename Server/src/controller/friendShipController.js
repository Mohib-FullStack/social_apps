const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { getPagination, getPagingData } = require('../helper/pagination');
const Friendship = require('../models/friendshipModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Chat = require('../models/chatModel');
const logger = require('../config/logger');
const ChatParticipant = require('../models/chatParticipantModel');

// Friendship configuration constants
const FRIENDSHIP_CONFIG = {
  REQUEST_EXPIRY_DAYS: 7,
  MAX_PENDING_REQUESTS: 500,
  COOLING_PERIOD_DAYS: 7,
  FRIENDS_PER_PAGE: 10,
  SUGGESTIONS_LIMIT: 20,
  STATUSES: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    BLOCKED: 'blocked'
  },
  TIERS: ['regular', 'close', 'family', 'work']
};



// Helper Functions

const validateFriendshipId = (friendshipId) => {
  if (isNaN(Number(friendshipId))) {
    throw new Error('Invalid friendship ID format');
  }
  return Number(friendshipId);
};
const validateUserId = (userId, currentUserId) => {
  if (!userId || isNaN(Number(userId))) {
    throw new Error('Invalid user ID format');
  }
  if (Number(userId) === Number(currentUserId)) {
    throw new Error('Cannot perform this action on yourself');
  }
};


const formatFriendshipResponse = (friendship, currentUserId) => {
  const isRequester = friendship.userId === currentUserId;
  return {
    id: friendship.id,
    status: friendship.status,
    createdAt: friendship.createdAt,
    acceptedAt: friendship.acceptedAt,
    user: isRequester ? friendship.friend : friendship.requester,
    actionUserId: friendship.actionUserId
  };
};

const findFriendshipBetweenUsers = async (userId1, userId2) => {
  return Friendship.findOne({
    where: {
      [Op.or]: [
        { userId: userId1, friendId: userId2 },
        { userId: userId2, friendId: userId1 },
      ],
    },
  });
};

const checkPendingRequestsLimit = async (userId) => {
  const count = await Friendship.count({
    where: {
      userId,
      status: 'pending',
    },
  });

  if (count >= FRIENDSHIP_CONFIG.MAX_PENDING_REQUESTS) {
    throw new Error('Maximum pending friend requests limit reached');
  }
};

// Helper functions
const validateId = (id) => {
  if (!id || isNaN(Number(id))) throw new Error('Invalid ID format');
  return Number(id);
};

const getFriendIds = async (userId) => {
  const friendships = await Friendship.findAll({
    where: {
      status: 'accepted',
      [Op.or]: [{ userId }, { friendId: userId }]
    },
    attributes: ['userId', 'friendId']
  });
  return friendships.map(f => f.userId === userId ? f.friendId : f.userId);
};

const formatFriendship = (friendship, currentUserId) => {
  const friend = friendship.userId === currentUserId ? friendship.requested : friendship.requester;
  return {
    id: friendship.id,
    status: friendship.status,
    tier: friendship.tier,
    customLabel: friendship.customLabel,
    createdAt: friendship.createdAt,
    friend: {
      id: friend.id,
      name: `${friend.firstName} ${friend.lastName}`,
      profileImage: friend.profileImage
    }
  };
};

// Controller methods
const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUserId = req.user.id;

    // Convert to numbers for safety
    const numericFriendId = Number(friendId);
    const numericCurrentUserId = Number(currentUserId);

    // Validate: can't send request to self
    if (numericFriendId === numericCurrentUserId) {
      return res.status(400).json({
        success: false,
        code: 'SELF_ACTION',
        message: "You cannot send a friend request to yourself."
      });
    }

    // Enhanced friend lookup with profile data
    const friend = await User.findByPk(numericFriendId, {
      attributes: ['id', 'firstName', 'lastName', 'profileImage']
    });
    
    if (!friend) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: "The user you're trying to add does not exist."
      });
    }

    // Check if any friendship already exists
    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId: numericCurrentUserId, friendId: numericFriendId },
          { userId: numericFriendId, friendId: numericCurrentUserId }
        ]
      }
    });

    if (existing) {
      const { status, userId: actionInitiatorId, coolingPeriod } = existing;

      switch (status) {
        case FRIENDSHIP_CONFIG.STATUSES.PENDING:
          return res.status(409).json({
            success: false,
            code: actionInitiatorId === numericCurrentUserId
              ? 'REQUEST_ALREADY_SENT'
              : 'REQUEST_ALREADY_RECEIVED',
            message: actionInitiatorId === numericCurrentUserId
              ? "You've already sent a friend request to this user."
              : "This user already sent you a friend request."
          });

        case FRIENDSHIP_CONFIG.STATUSES.ACCEPTED:
          return res.status(409).json({
            success: false,
            code: 'ALREADY_FRIENDS',
            message: "You are already friends with this user."
          });

        case FRIENDSHIP_CONFIG.STATUSES.REJECTED:
          if (coolingPeriod && coolingPeriod > new Date()) {
            return res.status(429).json({
              success: false,
              code: 'COOLING_PERIOD_ACTIVE',
              message: `Try again after ${coolingPeriod.toLocaleDateString()}.`,
              coolingPeriodEnd: coolingPeriod.toISOString()
            });
          }
          break;

        case FRIENDSHIP_CONFIG.STATUSES.BLOCKED:
          return res.status(403).json({
            success: false,
            code: 'USER_BLOCKED',
            message: "You cannot send a request to this user."
          });
      }
    }

    // Create new friend request
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + FRIENDSHIP_CONFIG.REQUEST_EXPIRY_DAYS);

    const friendship = await Friendship.create({
      userId: numericCurrentUserId,
      friendId: numericFriendId,
      status: FRIENDSHIP_CONFIG.STATUSES.PENDING,
      actionUserId: numericCurrentUserId,
      requesterId: numericCurrentUserId,
      requestedId: numericFriendId,
      requestCount: existing ? existing.requestCount + 1 : 1,
      expiresAt
    });

    // Create notification with complete data
    await Notification.create({
      userId: numericFriendId,
      type: 'friend_request',
      senderId: numericCurrentUserId,
      metadata: {
        friendshipId: friendship.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        avatarUrl: req.user.profileImage || '/default-avatar.png',
        message: 'sent you a friend request',
        senderId: numericCurrentUserId
      },
      read: false
    });

    // Emit real-time event
    if (req.io) {
      req.io.to(`user_${numericFriendId}`).emit('friend_request', {
        from: numericCurrentUserId,
        friendshipId: friendship.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        avatarUrl: req.user.profileImage || '/default-avatar.png'
      });
    }

    return res.status(201).json({
      success: true,
      message: "Friend request sent successfully.",
      friendship
    });

  } catch (error) {
    logger.error('Friend request error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: "Failed to send friend request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ! acceptFriendRequest 
const acceptFriendRequest = async (req, res) => {
  const { friendshipId } = req.params;
  const currentUserId = req.user.id;
  
  try {
    // Validate and parse friendship ID
    const numericFriendshipId = validateId(friendshipId);
    
    // Find the pending friend request
    const request = await Friendship.findOne({
      where: { 
        id: numericFriendshipId, 
        friendId: currentUserId, 
        status: 'pending' 
      },
      include: [{
        model: User,
        as: 'requester',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        code: 'FRIEND_REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed'
      });
    }

    // Update friendship status (no transaction)
    const updatedRequest = await request.update({
      status: 'accepted',
      acceptedAt: new Date(),
      actionUserId: currentUserId
    });

  
    // In acceptFriendRequest:
await Notification.create({
  userId: request.userId,
  type: 'friend_request_accepted',
  senderId: currentUserId,
  friendshipId: updatedRequest.id,
  metadata: {
    friendshipId: updatedRequest.id,
    senderName: `${req.user.firstName} ${req.user.lastName}`,
    avatarUrl: req.user.profileImage || '/default-avatar.png', // Add fallback
    message: 'accepted your friend request'
  },
  read: false
});

    // Find or create DM chat
    const [chat] = await Chat.findOrCreate({
      where: {
        type: 'dm',
        [Op.or]: [
          { user1Id: request.userId, user2Id: currentUserId },
          { user1Id: currentUserId, user2Id: request.userId }
        ]
      },
      defaults: {
        user1Id: request.userId,
        user2Id: currentUserId,
        type: 'dm'
      }
    });

    // Add participants if needed
    if (chat) {
      await Promise.all([
        ChatParticipant.findOrCreate({
          where: { chatId: chat.id, userId: request.userId },
          defaults: { role: 'member' }
        }),
        ChatParticipant.findOrCreate({
          where: { chatId: chat.id, userId: currentUserId },
          defaults: { role: 'member' }
        })
      ]);
    }

    // Emit real-time event
    if (req.io) {
      req.io.to(`user_${request.userId}`).emit('friend_request_accepted', {
        friendship: formatFriendshipResponse(updatedRequest, currentUserId),
        chatId: chat?.id || null
      });
    }

return res.status(200).json({
  success: true,
  message: 'Friend request accepted successfully',
  data: {
    friendship: formatFriendshipResponse(updatedRequest, currentUserId),
    chatId: chat?.id || null
  }
});

  } catch (error) {
    logger.error('Accept friend request error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to accept friend request',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
}

};

const rejectFriendRequest = async (req, res) => {
  const { friendshipId } = req.params;
  const currentUserId = req.user.id;
  
  try {
    // Validate and parse friendship ID (same as accept)
    const numericFriendshipId = validateId(friendshipId);
    
    // Find the pending friend request (same structure as accept)
    const request = await Friendship.findOne({
      where: { 
        id: numericFriendshipId, 
        friendId: currentUserId, 
        status: 'pending' 
      },
      include: [{
        model: User,
        as: 'requester',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        code: 'FRIEND_REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed'
      });
    }

    // Update friendship status
    const updatedRequest = await request.update({
      status: 'rejected',
      actionUserId: currentUserId
    });

    // Create notification with proper type (match your Notification model)
    await Notification.create({
      userId: request.userId,
      type: 'friend_request_rejected', // Ensure this matches your model enum
      senderId: currentUserId,
      friendshipId: updatedRequest.id,
      metadata: {
        friendshipId: updatedRequest.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        avatarUrl: req.user.profileImage || '/default-avatar.png',
        message: 'declined your friend request'
      },
      read: false
    });

    // Emit real-time event with consistent structure
    if (req.io) {
      req.io.to(`user_${request.userId}`).emit('friend_request_rejected', {
        friendship: formatFriendshipResponse(updatedRequest, currentUserId),
        rejectedBy: currentUserId
      });
    }

    // Return response matching accept structure
    return res.status(200).json({
      success: true,
      message: 'Friend request declined successfully',
      data: {
        friendship: formatFriendshipResponse(updatedRequest, currentUserId),
        friendshipId: updatedRequest.id
      }
    });

  } catch (error) {
    logger.error('Reject friend request error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to reject friend request',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

// rejectFriendRequest
// const rejectFriendRequest = async (req, res) => {
//   try {
//     const { friendshipId } = req.params;
//     const currentUserId = req.user.id;
//     const numericFriendshipId = validateId(friendshipId);

//     // Find the pending friend request using simplified associations
//     const request = await Friendship.findOne({
//       where: { 
//         id: numericFriendshipId, 
//         friendId: currentUserId, 
//         status: 'pending' 
//       },
//       include: [
//         { 
//           model: User, 
//           as: 'requester', 
//           attributes: ['id', 'firstName', 'lastName', 'profileImage'] 
//         }
//       ]
//     });

//     if (!request) {
//       return res.status(404).json({ 
//         success: false,
//         code: 'NOT_FOUND', 
//         message: 'Friend request not found or already processed' 
//       });
//     }

//     // Update the friendship status
//     await request.update({
//       status: 'rejected',
//       actionUserId: currentUserId
//     });

//        // In rejectFriendRequest:
// await Notification.create({
//   userId: request.userId,
//   type: 'friend_request_rejected',
//   senderId: currentUserId,
//   friendshipId: request.id,
//   metadata: {
//     friendshipId: request.id,
//     senderName: `${req.user.firstName} ${req.user.lastName}`,
//     avatarUrl: req.user.profileImage || '/default-avatar.png', // Add fallback
//     message: 'declined your friend request'
//   },
//   read: false
// });

//     // Emit real-time event
//     if (req.io) {
//       req.io.to(`user_${request.userId}`).emit('friend_request_rejected', {
//         friendshipId: request.id,
//         rejectedBy: currentUserId
//       });
//     }

//     return res.status(200).json({ 
//       success: true,
//       message: 'Friend request declined successfully',
//       friendshipId: request.id
//     });

//   } catch (error) {
//     logger.error('Reject friend request error:', error);
//     return res.status(500).json({ 
//       success: false,
//       code: 'SERVER_ERROR', 
//       message: "An error occurred while processing the friend request" 
//     });
//   }
// };


const cancelFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const currentUserId = req.user.id;
    const numericFriendshipId = validateId(friendshipId);

    const request = await Friendship.findOne({
      where: { id: numericFriendshipId, userId: currentUserId, status: 'pending' }
    });

    if (!request) return res.status(404).json({ code: 'NOT_FOUND', message: 'Request not found' });

    await request.destroy();

    if (req.io) {
      req.io.to(`user_${request.friendId}`).emit('friend_request_cancelled', {
        friendshipId: request.id
      });
    }

    return res.status(200).json({ message: 'Request cancelled' });

  } catch (error) {
    logger.error('Cancel request error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to cancel request" });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const currentUserId = req.user.id;
    const numericFriendshipId = validateId(friendshipId);

    const friendship = await Friendship.findOne({
      where: {
        id: numericFriendshipId,
        status: 'accepted',
        [Op.or]: [
          { userId: currentUserId },
          { friendId: currentUserId }
        ]
      }
    });

    if (!friendship) return res.status(404).json({ code: 'NOT_FOUND', message: 'Friendship not found' });

    const otherUserId = friendship.userId === currentUserId ? friendship.friendId : friendship.userId;

    await friendship.destroy();

    await Chat.destroy({
      where: {
        [Op.or]: [
          { user1Id: currentUserId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: currentUserId }
        ]
      }
    });

    if (req.io) {
      req.io.to(`user_${otherUserId}`).emit('friend_removed', {
        friendshipId: friendship.id
      });
    }

    return res.status(200).json({ message: 'Friend removed' });

  } catch (error) {
    logger.error('Remove friend error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to remove friend" });
  }
};

const blockUser = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUserId = req.user.id;
    const numericFriendId = validateId(friendId);

    if (numericFriendId === currentUserId) {
      return res.status(400).json({ code: 'SELF_ACTION', message: "Cannot block yourself" });
    }

    const [friendship] = await Friendship.findOrCreate({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId: numericFriendId },
          { userId: numericFriendId, friendId: currentUserId }
        ]
      },
      defaults: {
        userId: currentUserId,
        friendId: numericFriendId,
        status: 'blocked',
        actionUserId: currentUserId
      }
    });

    await friendship.update({
      status: 'blocked',
      actionUserId: currentUserId
    });

    await Chat.destroy({
      where: {
        [Op.or]: [
          { user1Id: currentUserId, user2Id: numericFriendId },
          { user1Id: numericFriendId, user2Id: currentUserId }
        ]
      }
    });

    return res.status(200).json({ message: 'User blocked' });

  } catch (error) {
    logger.error('Block user error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to block user" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const numericUserId = validateId(userId);

    const friendship = await Friendship.findOne({
      where: {
        userId: currentUserId,
        friendId: numericUserId,
        status: 'blocked'
      }
    });

    if (!friendship) return res.status(404).json({ code: 'NOT_FOUND', message: 'Block not found' });

    await friendship.destroy();
    return res.status(200).json({ message: 'User unblocked' });

  } catch (error) {
    logger.error('Unblock user error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to unblock user" });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);
    const currentUserId = req.user.id;

    const result = await Friendship.findAndCountAll({
      where: { friendId: currentUserId, status: 'pending' },
      include: [
        { 
          model: User, 
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const formatted = result.rows.map(f => formatFriendship(f, currentUserId));
    return res.status(200).json(getPagingData({ count: result.count, rows: formatted }, page, limit));

  } catch (error) {
    logger.error('Get pending requests error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to get requests" });
  }
};

const getFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);
    const targetUserId = userId || req.user.id;

    const result = await Friendship.findAndCountAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ userId: targetUserId }, { friendId: targetUserId }]
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' }
      ],
      limit,
      offset,
      order: [['acceptedAt', 'DESC']]
    });

    const formatted = result.rows.map(f => formatFriendship(f, targetUserId));
    return res.status(200).json(getPagingData({ count: result.count, rows: formatted }, page, limit));

  } catch (error) {
    logger.error('Get friends error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to get friends" });
  }
};

const checkFriendshipStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const numericUserId = validateId(userId);

    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId: numericUserId },
          { userId: numericUserId, friendId: currentUserId }
        ]
      }
    });

    const status = friendship ? friendship.status : 'none';
    return res.status(200).json({ status });

  } catch (error) {
    logger.error('Check status error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to check status" });
  }
};

const getMutualFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);
    const currentUserId = req.user.id;
    const numericUserId = validateId(userId);

    const [currentFriends, targetFriends] = await Promise.all([
      getFriendIds(currentUserId),
      getFriendIds(numericUserId)
    ]);

    const mutualIds = currentFriends.filter(id => targetFriends.includes(id));
    const { count, rows } = await User.findAndCountAll({
      where: { id: mutualIds },
      attributes: ['id', 'firstName', 'lastName', 'profileImage'],
      limit,
      offset
    });

    return res.status(200).json(getPagingData({ count, rows }, page, limit));

  } catch (error) {
    logger.error('Get mutual friends error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to get mutual friends" });
  }
};

const getFriendSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const friends = await getFriendIds(currentUserId);

    const suggestions = await User.findAll({
      where: {
        id: {
          [Op.notIn]: [...friends, currentUserId],
          [Op.in]: sequelize.literal(`(
            SELECT DISTINCT f.friendId 
            FROM friendships f
            WHERE f.userId IN (${friends.join(',') || 'NULL'})
            AND f.status = 'accepted'
            AND f.friendId NOT IN (
              SELECT friendId FROM friendships 
              WHERE userId = ${currentUserId}
              UNION
              SELECT userId FROM friendships 
              WHERE friendId = ${currentUserId}
            )
          )`)
        }
      },
      limit: 20,
      attributes: ['id', 'firstName', 'lastName', 'profileImage']
    });

    return res.status(200).json({ data: suggestions });

  } catch (error) {
    logger.error('Get suggestions error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to get suggestions" });
  }
};

const updateFriendshipTier = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const { tier, customLabel } = req.body;
    const currentUserId = req.user.id;
    const numericFriendshipId = validateId(friendshipId);

    if (!Friendship.TIERS.includes(tier)) {
      return res.status(400).json({ 
        code: 'INVALID_TIER', 
        message: `Valid tiers: ${Friendship.TIERS.join(', ')}` 
      });
    }

    const friendship = await Friendship.findOne({
      where: {
        id: numericFriendshipId,
        status: 'accepted',
        [Op.or]: [
          { userId: currentUserId },
          { friendId: currentUserId }
        ]
      }
    });

    if (!friendship) return res.status(404).json({ code: 'NOT_FOUND', message: 'Friendship not found' });

    await friendship.update({ tier, customLabel });
    return res.status(200).json({ message: 'Tier updated' });

  } catch (error) {
    logger.error('Update tier error:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to update tier" });
  }
};

const cleanupExpiredRequests = async () => {
  try {
    const result = await Friendship.destroy({
      where: {
        status: 'pending',
        expiresAt: { [Op.lt]: new Date() }
      }
    });
    logger.info(`Cleaned ${result} expired requests`);
    return result;
  } catch (error) {
    logger.error('Cleanup error:', error);
    throw error;
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getPendingRequests,
  getFriends,
  checkFriendshipStatus,
  getMutualFriends,
  getFriendSuggestions,
  updateFriendshipTier,
  cleanupExpiredRequests
};










//! original
// const { Op } = require('sequelize');
// const { sequelize } = require('../config/database');
// const { getPagination, getPagingData } = require('../helper/pagination');
// const Friendship = require('../models/friendshipModel');
// const User = require('../models/userModel');
// const Notification = require('../models/notificationModel');
// const Chat = require('../models/chatModel');
// const logger = require('../config/logger');
// const ChatParticipant = require('../models/chatParticipantModel');

// // Friendship configuration constants
// const FRIENDSHIP_CONFIG = {
//   REQUEST_EXPIRY_DAYS: 7,
//   MAX_PENDING_REQUESTS: 500,
//   COOLING_PERIOD_DAYS: 7,
//   FRIENDS_PER_PAGE: 10,
//   SUGGESTIONS_LIMIT: 20,
//   STATUSES: {
//     PENDING: 'pending',
//     ACCEPTED: 'accepted',
//     REJECTED: 'rejected',
//     BLOCKED: 'blocked'
//   },
//   TIERS: ['regular', 'close', 'family', 'work']
// };



// // Helper Functions

// const validateFriendshipId = (friendshipId) => {
//   if (isNaN(Number(friendshipId))) {
//     throw new Error('Invalid friendship ID format');
//   }
//   return Number(friendshipId);
// };
// const validateUserId = (userId, currentUserId) => {
//   if (!userId || isNaN(Number(userId))) {
//     throw new Error('Invalid user ID format');
//   }
//   if (Number(userId) === Number(currentUserId)) {
//     throw new Error('Cannot perform this action on yourself');
//   }
// };


// const formatFriendshipResponse = (friendship, currentUserId) => {
//   const isRequester = friendship.userId === currentUserId;
//   return {
//     id: friendship.id,
//     status: friendship.status,
//     createdAt: friendship.createdAt,
//     acceptedAt: friendship.acceptedAt,
//     user: isRequester ? friendship.friend : friendship.requester,
//     actionUserId: friendship.actionUserId
//   };
// };

// const findFriendshipBetweenUsers = async (userId1, userId2) => {
//   return Friendship.findOne({
//     where: {
//       [Op.or]: [
//         { userId: userId1, friendId: userId2 },
//         { userId: userId2, friendId: userId1 },
//       ],
//     },
//   });
// };

// const checkPendingRequestsLimit = async (userId) => {
//   const count = await Friendship.count({
//     where: {
//       userId,
//       status: 'pending',
//     },
//   });

//   if (count >= FRIENDSHIP_CONFIG.MAX_PENDING_REQUESTS) {
//     throw new Error('Maximum pending friend requests limit reached');
//   }
// };

// // Helper functions
// const validateId = (id) => {
//   if (!id || isNaN(Number(id))) throw new Error('Invalid ID format');
//   return Number(id);
// };

// const getFriendIds = async (userId) => {
//   const friendships = await Friendship.findAll({
//     where: {
//       status: 'accepted',
//       [Op.or]: [{ userId }, { friendId: userId }]
//     },
//     attributes: ['userId', 'friendId']
//   });
//   return friendships.map(f => f.userId === userId ? f.friendId : f.userId);
// };

// const formatFriendship = (friendship, currentUserId) => {
//   const friend = friendship.userId === currentUserId ? friendship.requested : friendship.requester;
//   return {
//     id: friendship.id,
//     status: friendship.status,
//     tier: friendship.tier,
//     customLabel: friendship.customLabel,
//     createdAt: friendship.createdAt,
//     friend: {
//       id: friend.id,
//       name: `${friend.firstName} ${friend.lastName}`,
//       profileImage: friend.profileImage
//     }
//   };
// };

// // Controller methods
// const sendFriendRequest = async (req, res) => {
//   try {
//     const { friendId } = req.body;
//     const currentUserId = req.user.id;

//     // Convert to numbers for safety
//     const numericFriendId = Number(friendId);
//     const numericCurrentUserId = Number(currentUserId);

//     // Validate: can't send request to self
//     if (numericFriendId === numericCurrentUserId) {
//       return res.status(400).json({
//         success: false,
//         code: 'SELF_ACTION',
//         message: "You cannot send a friend request to yourself."
//       });
//     }

//     // Check if friend exists
//     const friend = await User.findByPk(numericFriendId);
//     if (!friend) {
//       return res.status(404).json({
//         success: false,
//         code: 'USER_NOT_FOUND',
//         message: "The user you're trying to add does not exist."
//       });
//     }

//     // Check if any friendship already exists
//     const existing = await Friendship.findOne({
//       where: {
//         [Op.or]: [
//           { userId: numericCurrentUserId, friendId: numericFriendId },
//           { userId: numericFriendId, friendId: numericCurrentUserId }
//         ]
//       }
//     });

//     if (existing) {
//       const { status, userId: actionInitiatorId, coolingPeriod } = existing;

//       switch (status) {
//         case FRIENDSHIP_CONFIG.STATUSES.PENDING:
//           return res.status(409).json({
//             success: false,
//             code: actionInitiatorId === numericCurrentUserId
//               ? 'REQUEST_ALREADY_SENT'
//               : 'REQUEST_ALREADY_RECEIVED',
//             message: actionInitiatorId === numericCurrentUserId
//               ? "You've already sent a friend request to this user."
//               : "This user already sent you a friend request."
//           });

//         case FRIENDSHIP_CONFIG.STATUSES.ACCEPTED:
//           return res.status(409).json({
//             success: false,
//             code: 'ALREADY_FRIENDS',
//             message: "You are already friends with this user."
//           });

//         case FRIENDSHIP_CONFIG.STATUSES.REJECTED:
//           if (coolingPeriod && coolingPeriod > new Date()) {
//             return res.status(429).json({
//               success: false,
//               code: 'COOLING_PERIOD_ACTIVE',
//               message: `Try again after ${coolingPeriod.toLocaleDateString()}.`,
//               coolingPeriodEnd: coolingPeriod.toISOString()
//             });
//           }
//           break;

//         case FRIENDSHIP_CONFIG.STATUSES.BLOCKED:
//           return res.status(403).json({
//             success: false,
//             code: 'USER_BLOCKED',
//             message: "You cannot send a request to this user."
//           });
//       }
//     }

//     // Create new friend request
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + FRIENDSHIP_CONFIG.REQUEST_EXPIRY_DAYS);

//     const friendship = await Friendship.create({
//       userId: numericCurrentUserId,
//       friendId: numericFriendId,
//       status: FRIENDSHIP_CONFIG.STATUSES.PENDING,
//       actionUserId: numericCurrentUserId,
//       requesterId: numericCurrentUserId, // Added for consistency
//       requestedId: numericFriendId,     // Added for consistency
//       requestCount: existing ? existing.requestCount + 1 : 1,
//       expiresAt
//     });

//     // Create notification
//     // await Notification.create({
//     //   userId: numericFriendId,
//     //   type: 'friend_request',
//     //   senderId: numericCurrentUserId,
//     //   metadata: {
//     //     friendshipId: friendship.id,
//     //     senderName: `${req.user.firstName} ${req.user.lastName}`,
//     //     avatarUrl: req.user.profileImage
//     //   }
//     // });

//     // In sendFriendRequest:
// await Notification.create({
//   userId: numericFriendId,
//   type: 'friend_request',
//   senderId: numericCurrentUserId,
//   metadata: {
//     friendshipId: friendship.id,
//     senderName: `${req.user.firstName} ${req.user.lastName}`,
//     avatarUrl: req.user.profileImage || '/default-avatar.png', // Add fallback
//     message: 'sent you a friend request'
//   },
//   read: false
// });


//     // Emit real-time event
//     if (req.io) {
//       req.io.to(`user_${numericFriendId}`).emit('friend_request', {
//         from: numericCurrentUserId,
//         friendshipId: friendship.id
//       });
//     }

//     return res.status(201).json({
//       message: "Friend request sent successfully.",
//       friendship
//     });




//   } catch (error) {
//     logger.error('Friend request error:', error);
//     return res.status(500).json({
//       success: false,
//       code: 'SERVER_ERROR',
//       message: "Failed to send friend request",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // ! acceptFriendRequest 
// const acceptFriendRequest = async (req, res) => {
//   const { friendshipId } = req.params;
//   const currentUserId = req.user.id;
  
//   try {
//     // Validate and parse friendship ID
//     const numericFriendshipId = validateId(friendshipId);
    
//     // Find the pending friend request
//     const request = await Friendship.findOne({
//       where: { 
//         id: numericFriendshipId, 
//         friendId: currentUserId, 
//         status: 'pending' 
//       },
//       include: [{
//         model: User,
//         as: 'requester',
//         attributes: ['id', 'firstName', 'lastName', 'profileImage']
//       }]
//     });

//     if (!request) {
//       return res.status(404).json({
//         success: false,
//         code: 'FRIEND_REQUEST_NOT_FOUND',
//         message: 'Friend request not found or already processed'
//       });
//     }

//     // Update friendship status (no transaction)
//     const updatedRequest = await request.update({
//       status: 'accepted',
//       acceptedAt: new Date(),
//       actionUserId: currentUserId
//     });

//     // Create notification
//     // await Notification.create({
//     //   userId: request.userId,
//     //   type: 'friend_request_accepted',
//     //   senderId: currentUserId,
//     //   friendshipId: updatedRequest.id,
//     //   metadata: {
//     //     friendshipId: updatedRequest.id,
//     //     senderName: `${req.user.firstName} ${req.user.lastName}`,
//     //     avatarUrl: req.user.profileImage,
//     //     message: 'accepted your friend request'
//     //   },
//     //   read: false
//     // });

//     // In acceptFriendRequest:
// await Notification.create({
//   userId: request.userId,
//   type: 'friend_request_accepted',
//   senderId: currentUserId,
//   friendshipId: updatedRequest.id,
//   metadata: {
//     friendshipId: updatedRequest.id,
//     senderName: `${req.user.firstName} ${req.user.lastName}`,
//     avatarUrl: req.user.profileImage || '/default-avatar.png', // Add fallback
//     message: 'accepted your friend request'
//   },
//   read: false
// });

//     // Find or create DM chat
//     const [chat] = await Chat.findOrCreate({
//       where: {
//         type: 'dm',
//         [Op.or]: [
//           { user1Id: request.userId, user2Id: currentUserId },
//           { user1Id: currentUserId, user2Id: request.userId }
//         ]
//       },
//       defaults: {
//         user1Id: request.userId,
//         user2Id: currentUserId,
//         type: 'dm'
//       }
//     });

//     // Add participants if needed
//     if (chat) {
//       await Promise.all([
//         ChatParticipant.findOrCreate({
//           where: { chatId: chat.id, userId: request.userId },
//           defaults: { role: 'member' }
//         }),
//         ChatParticipant.findOrCreate({
//           where: { chatId: chat.id, userId: currentUserId },
//           defaults: { role: 'member' }
//         })
//       ]);
//     }

//     // Emit real-time event
//     if (req.io) {
//       req.io.to(`user_${request.userId}`).emit('friend_request_accepted', {
//         friendship: formatFriendshipResponse(updatedRequest, currentUserId),
//         chatId: chat?.id || null
//       });
//     }

// return res.status(200).json({
//   success: true,
//   message: 'Friend request accepted successfully',
//   data: {
//     friendship: formatFriendshipResponse(updatedRequest, currentUserId),
//     chatId: chat?.id || null
//   }
// });

//   } catch (error) {
//     logger.error('Accept friend request error:', error);
//     return res.status(500).json({
//       success: false,
//       code: 'SERVER_ERROR',
//       message: error.message || 'Failed to accept friend request',
//       ...(process.env.NODE_ENV === 'development' && { 
//         error: error.message,
//         stack: error.stack 
//       })
//     });
// }

// };

// //! new with email
// // const acceptFriendRequest = async (req, res) => {
// //   const { friendshipId } = req.params;
// //   const currentUserId = req.user.id;
  
// //   try {
// //     // Validate and parse friendship ID
// //     const numericFriendshipId = validateId(friendshipId);
    
// //     // Find the pending friend request with requester details
// //     const request = await Friendship.findOne({
// //       where: { 
// //         id: numericFriendshipId, 
// //         friendId: currentUserId, 
// //         status: 'pending' 
// //       },
// //       include: [
// //         {
// //           model: User,
// //           as: 'requester',
// //           attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
// //         },
// //         {
// //           model: User,
// //           as: 'requested',
// //           attributes: ['id', 'firstName', 'lastName', 'profileImage']
// //         }
// //       ]
// //     });

// //     if (!request) {
// //       return res.status(404).json({
// //         success: false,
// //         code: 'FRIEND_REQUEST_NOT_FOUND',
// //         message: 'Friend request not found or already processed'
// //       });
// //     }

// //     // Update friendship status
// //     const updatedRequest = await request.update({
// //       status: 'accepted',
// //       acceptedAt: new Date(),
// //       actionUserId: currentUserId
// //     });

// //     // Create notification
// //     await Notification.create({
// //       userId: request.userId,
// //       type: 'friend_request_accepted',
// //       senderId: currentUserId,
// //       friendshipId: updatedRequest.id,
// //       metadata: {
// //         friendshipId: updatedRequest.id,
// //         senderName: `${req.user.firstName} ${req.user.lastName}`,
// //         avatarUrl: req.user.profileImage,
// //         message: 'accepted your friend request'
// //       },
// //       read: false
// //     });

// //     // Find or create DM chat
// //     const [chat] = await Chat.findOrCreate({
// //       where: {
// //         type: 'dm',
// //         [Op.or]: [
// //           { user1Id: request.userId, user2Id: currentUserId },
// //           { user1Id: currentUserId, user2Id: request.userId }
// //         ]
// //       },
// //       defaults: {
// //         user1Id: request.userId,
// //         user2Id: currentUserId,
// //         type: 'dm'
// //       }
// //     });

// //     // Add participants if needed
// //     if (chat) {
// //       await Promise.all([
// //         ChatParticipant.findOrCreate({
// //           where: { chatId: chat.id, userId: request.userId },
// //           defaults: { role: 'member' }
// //         }),
// //         ChatParticipant.findOrCreate({
// //           where: { chatId: chat.id, userId: currentUserId },
// //           defaults: { role: 'member' }
// //         })
// //       ]);
// //     }

// //     // Send email notification (async - don't block response)
// //     try {
// //       await sendFriendRequestAcceptedEmail({
// //         requester: {
// //           firstName: request.requester.firstName,
// //           lastName: request.requester.lastName,
// //           email: request.requester.email
// //         },
// //         recipient: {
// //           firstName: req.user.firstName,
// //           lastName: req.user.lastName,
// //           profileImage: req.user.profileImage
// //         },
// //         chatId: chat.id
// //       });
// //     } catch (emailError) {
// //       logger.error('Failed to send acceptance email:', emailError);
// //       // Continue even if email fails
// //     }

// //     // Emit real-time event
// //     if (req.io) {
// //       req.io.to(`user_${request.userId}`).emit('friend_request_accepted', {
// //         friendship: formatFriendshipResponse(updatedRequest, currentUserId),
// //         chatId: chat?.id || null
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       message: 'Friend request accepted successfully',
// //       data: {
// //         friendship: formatFriendshipResponse(updatedRequest, currentUserId),
// //         chatId: chat?.id || null
// //       }
// //     });

// //   } catch (error) {
// //     logger.error('Accept friend request error:', error);
// //     return res.status(500).json({
// //       success: false,
// //       code: 'SERVER_ERROR',
// //       message: error.message || 'Failed to accept friend request',
// //       ...(process.env.NODE_ENV === 'development' && { 
// //         error: error.message,
// //         stack: error.stack 
// //       })
// //     });
// //   }
// // };


// // rejectFriendRequest
// const rejectFriendRequest = async (req, res) => {
//   try {
//     const { friendshipId } = req.params;
//     const currentUserId = req.user.id;
//     const numericFriendshipId = validateId(friendshipId);

//     // Find the pending friend request using simplified associations
//     const request = await Friendship.findOne({
//       where: { 
//         id: numericFriendshipId, 
//         friendId: currentUserId, 
//         status: 'pending' 
//       },
//       include: [
//         { 
//           model: User, 
//           as: 'requester', 
//           attributes: ['id', 'firstName', 'lastName', 'profileImage'] 
//         }
//       ]
//     });

//     if (!request) {
//       return res.status(404).json({ 
//         success: false,
//         code: 'NOT_FOUND', 
//         message: 'Friend request not found or already processed' 
//       });
//     }

//     // Update the friendship status
//     await request.update({
//       status: 'rejected',
//       actionUserId: currentUserId
//     });

//     // Create notification for the requester
//     // await Notification.create({
//     //   userId: request.userId,
//     //   type: 'friend_request_rejected',
//     //   senderId: currentUserId,
//     //   friendshipId: request.id,
//     //   metadata: {
//     //     friendshipId: request.id,
//     //     senderName: `${req.user.firstName} ${req.user.lastName}`,
//     //     avatarUrl: req.user.profileImage,
//     //     message: 'declined your friend request'
//     //   },
//     //   read: false
//     // });

//     // In rejectFriendRequest:
// await Notification.create({
//   userId: request.userId,
//   type: 'friend_request_rejected',
//   senderId: currentUserId,
//   friendshipId: request.id,
//   metadata: {
//     friendshipId: request.id,
//     senderName: `${req.user.firstName} ${req.user.lastName}`,
//     avatarUrl: req.user.profileImage || '/default-avatar.png', // Add fallback
//     message: 'declined your friend request'
//   },
//   read: false
// });

//     // Emit real-time event
//     if (req.io) {
//       req.io.to(`user_${request.userId}`).emit('friend_request_rejected', {
//         friendshipId: request.id,
//         rejectedBy: currentUserId
//       });
//     }

//     return res.status(200).json({ 
//       success: true,
//       message: 'Friend request declined successfully',
//       friendshipId: request.id
//     });

//   } catch (error) {
//     logger.error('Reject friend request error:', error);
//     return res.status(500).json({ 
//       success: false,
//       code: 'SERVER_ERROR', 
//       message: "An error occurred while processing the friend request" 
//     });
//   }
// };


// const cancelFriendRequest = async (req, res) => {
//   try {
//     const { friendshipId } = req.params;
//     const currentUserId = req.user.id;
//     const numericFriendshipId = validateId(friendshipId);

//     const request = await Friendship.findOne({
//       where: { id: numericFriendshipId, userId: currentUserId, status: 'pending' }
//     });

//     if (!request) return res.status(404).json({ code: 'NOT_FOUND', message: 'Request not found' });

//     await request.destroy();

//     if (req.io) {
//       req.io.to(`user_${request.friendId}`).emit('friend_request_cancelled', {
//         friendshipId: request.id
//       });
//     }

//     return res.status(200).json({ message: 'Request cancelled' });

//   } catch (error) {
//     logger.error('Cancel request error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to cancel request" });
//   }
// };

// const removeFriend = async (req, res) => {
//   try {
//     const { friendshipId } = req.params;
//     const currentUserId = req.user.id;
//     const numericFriendshipId = validateId(friendshipId);

//     const friendship = await Friendship.findOne({
//       where: {
//         id: numericFriendshipId,
//         status: 'accepted',
//         [Op.or]: [
//           { userId: currentUserId },
//           { friendId: currentUserId }
//         ]
//       }
//     });

//     if (!friendship) return res.status(404).json({ code: 'NOT_FOUND', message: 'Friendship not found' });

//     const otherUserId = friendship.userId === currentUserId ? friendship.friendId : friendship.userId;

//     await friendship.destroy();

//     await Chat.destroy({
//       where: {
//         [Op.or]: [
//           { user1Id: currentUserId, user2Id: otherUserId },
//           { user1Id: otherUserId, user2Id: currentUserId }
//         ]
//       }
//     });

//     if (req.io) {
//       req.io.to(`user_${otherUserId}`).emit('friend_removed', {
//         friendshipId: friendship.id
//       });
//     }

//     return res.status(200).json({ message: 'Friend removed' });

//   } catch (error) {
//     logger.error('Remove friend error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to remove friend" });
//   }
// };

// const blockUser = async (req, res) => {
//   try {
//     const { friendId } = req.body;
//     const currentUserId = req.user.id;
//     const numericFriendId = validateId(friendId);

//     if (numericFriendId === currentUserId) {
//       return res.status(400).json({ code: 'SELF_ACTION', message: "Cannot block yourself" });
//     }

//     const [friendship] = await Friendship.findOrCreate({
//       where: {
//         [Op.or]: [
//           { userId: currentUserId, friendId: numericFriendId },
//           { userId: numericFriendId, friendId: currentUserId }
//         ]
//       },
//       defaults: {
//         userId: currentUserId,
//         friendId: numericFriendId,
//         status: 'blocked',
//         actionUserId: currentUserId
//       }
//     });

//     await friendship.update({
//       status: 'blocked',
//       actionUserId: currentUserId
//     });

//     await Chat.destroy({
//       where: {
//         [Op.or]: [
//           { user1Id: currentUserId, user2Id: numericFriendId },
//           { user1Id: numericFriendId, user2Id: currentUserId }
//         ]
//       }
//     });

//     return res.status(200).json({ message: 'User blocked' });

//   } catch (error) {
//     logger.error('Block user error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to block user" });
//   }
// };

// const unblockUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const currentUserId = req.user.id;
//     const numericUserId = validateId(userId);

//     const friendship = await Friendship.findOne({
//       where: {
//         userId: currentUserId,
//         friendId: numericUserId,
//         status: 'blocked'
//       }
//     });

//     if (!friendship) return res.status(404).json({ code: 'NOT_FOUND', message: 'Block not found' });

//     await friendship.destroy();
//     return res.status(200).json({ message: 'User unblocked' });

//   } catch (error) {
//     logger.error('Unblock user error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to unblock user" });
//   }
// };

// const getPendingRequests = async (req, res) => {
//   try {
//     const { page = 1, size = 10 } = req.query;
//     const { limit, offset } = getPagination(page, size);
//     const currentUserId = req.user.id;

//     const result = await Friendship.findAndCountAll({
//       where: { friendId: currentUserId, status: 'pending' },
//       include: [
//         { 
//           model: User, 
//           as: 'requester',
//           attributes: ['id', 'firstName', 'lastName', 'profileImage']
//         }
//       ],
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']]
//     });

//     const formatted = result.rows.map(f => formatFriendship(f, currentUserId));
//     return res.status(200).json(getPagingData({ count: result.count, rows: formatted }, page, limit));

//   } catch (error) {
//     logger.error('Get pending requests error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to get requests" });
//   }
// };

// const getFriends = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, size = 10 } = req.query;
//     const { limit, offset } = getPagination(page, size);
//     const targetUserId = userId || req.user.id;

//     const result = await Friendship.findAndCountAll({
//       where: {
//         status: 'accepted',
//         [Op.or]: [{ userId: targetUserId }, { friendId: targetUserId }]
//       },
//       include: [
//         { model: User, as: 'requester' },
//         { model: User, as: 'requested' }
//       ],
//       limit,
//       offset,
//       order: [['acceptedAt', 'DESC']]
//     });

//     const formatted = result.rows.map(f => formatFriendship(f, targetUserId));
//     return res.status(200).json(getPagingData({ count: result.count, rows: formatted }, page, limit));

//   } catch (error) {
//     logger.error('Get friends error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to get friends" });
//   }
// };

// const checkFriendshipStatus = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const currentUserId = req.user.id;
//     const numericUserId = validateId(userId);

//     const friendship = await Friendship.findOne({
//       where: {
//         [Op.or]: [
//           { userId: currentUserId, friendId: numericUserId },
//           { userId: numericUserId, friendId: currentUserId }
//         ]
//       }
//     });

//     const status = friendship ? friendship.status : 'none';
//     return res.status(200).json({ status });

//   } catch (error) {
//     logger.error('Check status error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to check status" });
//   }
// };

// const getMutualFriends = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, size = 10 } = req.query;
//     const { limit, offset } = getPagination(page, size);
//     const currentUserId = req.user.id;
//     const numericUserId = validateId(userId);

//     const [currentFriends, targetFriends] = await Promise.all([
//       getFriendIds(currentUserId),
//       getFriendIds(numericUserId)
//     ]);

//     const mutualIds = currentFriends.filter(id => targetFriends.includes(id));
//     const { count, rows } = await User.findAndCountAll({
//       where: { id: mutualIds },
//       attributes: ['id', 'firstName', 'lastName', 'profileImage'],
//       limit,
//       offset
//     });

//     return res.status(200).json(getPagingData({ count, rows }, page, limit));

//   } catch (error) {
//     logger.error('Get mutual friends error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to get mutual friends" });
//   }
// };

// const getFriendSuggestions = async (req, res) => {
//   try {
//     const currentUserId = req.user.id;
//     const friends = await getFriendIds(currentUserId);

//     const suggestions = await User.findAll({
//       where: {
//         id: {
//           [Op.notIn]: [...friends, currentUserId],
//           [Op.in]: sequelize.literal(`(
//             SELECT DISTINCT f.friendId 
//             FROM friendships f
//             WHERE f.userId IN (${friends.join(',') || 'NULL'})
//             AND f.status = 'accepted'
//             AND f.friendId NOT IN (
//               SELECT friendId FROM friendships 
//               WHERE userId = ${currentUserId}
//               UNION
//               SELECT userId FROM friendships 
//               WHERE friendId = ${currentUserId}
//             )
//           )`)
//         }
//       },
//       limit: 20,
//       attributes: ['id', 'firstName', 'lastName', 'profileImage']
//     });

//     return res.status(200).json({ data: suggestions });

//   } catch (error) {
//     logger.error('Get suggestions error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to get suggestions" });
//   }
// };

// const updateFriendshipTier = async (req, res) => {
//   try {
//     const { friendshipId } = req.params;
//     const { tier, customLabel } = req.body;
//     const currentUserId = req.user.id;
//     const numericFriendshipId = validateId(friendshipId);

//     if (!Friendship.TIERS.includes(tier)) {
//       return res.status(400).json({ 
//         code: 'INVALID_TIER', 
//         message: `Valid tiers: ${Friendship.TIERS.join(', ')}` 
//       });
//     }

//     const friendship = await Friendship.findOne({
//       where: {
//         id: numericFriendshipId,
//         status: 'accepted',
//         [Op.or]: [
//           { userId: currentUserId },
//           { friendId: currentUserId }
//         ]
//       }
//     });

//     if (!friendship) return res.status(404).json({ code: 'NOT_FOUND', message: 'Friendship not found' });

//     await friendship.update({ tier, customLabel });
//     return res.status(200).json({ message: 'Tier updated' });

//   } catch (error) {
//     logger.error('Update tier error:', error);
//     return res.status(500).json({ code: 'SERVER_ERROR', message: "Failed to update tier" });
//   }
// };

// const cleanupExpiredRequests = async () => {
//   try {
//     const result = await Friendship.destroy({
//       where: {
//         status: 'pending',
//         expiresAt: { [Op.lt]: new Date() }
//       }
//     });
//     logger.info(`Cleaned ${result} expired requests`);
//     return result;
//   } catch (error) {
//     logger.error('Cleanup error:', error);
//     throw error;
//   }
// };

// module.exports = {
//   sendFriendRequest,
//   acceptFriendRequest,
//   rejectFriendRequest,
//   cancelFriendRequest,
//   removeFriend,
//   blockUser,
//   unblockUser,
//   getPendingRequests,
//   getFriends,
//   checkFriendshipStatus,
//   getMutualFriends,
//   getFriendSuggestions,
//   updateFriendshipTier,
//   cleanupExpiredRequests
// };



























