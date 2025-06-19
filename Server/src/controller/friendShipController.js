const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { getPagination, getPagingData } = require('../helper/pagination');
const Friendship = require('../models/friendshipModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Chat = require('../models/chatModel');
const logger = require('../config/logger');
const ChatParticipant = require('../models/chatParticipantModel');
const { successResponse, errorResponse } = require('./responseController');

// Import email helpers
const sendFriendRequestAcceptedEmail = require('../helper/friendRequestAcceptedEmail');
const sendFriendRequestRejectedEmail = require('../helper/friendRequestRejectedEmail');

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

// Helper function
const getFriendIds = async (userId) => {
  const friendships = await Friendship.findAll({
    where: {
      status: FRIENDSHIP_CONFIG.STATUSES.ACCEPTED,
      [Op.or]: [
        { userId },
        { friendId: userId }
      ]
    }
  });

  return friendships.map(f => 
    f.userId === userId ? f.friendId : f.userId
  );
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


//! ==================== Core Controllers ====================
const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUserId = req.user.id;

    // Convert to numbers for safety
    const numericFriendId = Number(friendId);
    const numericCurrentUserId = Number(currentUserId);

    // Validate: can't send request to self
    if (numericFriendId === numericCurrentUserId) {
      return errorResponse(res, {
        statusCode: 400,
        code: 'SELF_ACTION',
        message: "You cannot send a friend request to yourself."
      });
    }

    // Enhanced friend lookup with profile data
    const friend = await User.findByPk(numericFriendId, {
      attributes: ['id', 'firstName', 'lastName', 'profileImage']
    });
    
    if (!friend) {
      return errorResponse(res, {
        statusCode: 404,
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
          return errorResponse(res, {
            statusCode: 409,
            code: actionInitiatorId === numericCurrentUserId
              ? 'REQUEST_ALREADY_SENT'
              : 'REQUEST_ALREADY_RECEIVED',
            message: actionInitiatorId === numericCurrentUserId
              ? "You've already sent a friend request to this user."
              : "This user already sent you a friend request."
          });

        case FRIENDSHIP_CONFIG.STATUSES.ACCEPTED:
          return errorResponse(res, {
            statusCode: 409,
            code: 'ALREADY_FRIENDS',
            message: "You are already friends with this user."
          });

        case FRIENDSHIP_CONFIG.STATUSES.REJECTED:
          if (coolingPeriod && coolingPeriod > new Date()) {
            return errorResponse(res, {
              statusCode: 429,
              code: 'COOLING_PERIOD_ACTIVE',
              message: `Try again after ${coolingPeriod.toLocaleDateString()}.`,
              payload: {
                coolingPeriodEnd: coolingPeriod.toISOString()
              }
            });
          }
          break;

        case FRIENDSHIP_CONFIG.STATUSES.BLOCKED:
          return errorResponse(res, {
            statusCode: 403,
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
      requesterId: numericCurrentUserId,  // Add this
      requestedId: numericFriendId,       // Add this
      status: FRIENDSHIP_CONFIG.STATUSES.PENDING,
      actionUserId: numericCurrentUserId,
      requestCount: existing ? existing.requestCount + 1 : 1,
      expiresAt
    });

    // Create notification
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

    return successResponse(res, {
      statusCode: 201,
      message: "Friend request sent successfully.",
      payload: friendship
    });

  } catch (error) {
    logger.error('Friend request error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: "Failed to send friend request",
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message
      })
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { friendshipId } = req.params;
  const currentUserId = req.user.id;
  
  try {
    const numericFriendshipId = validateFriendshipId(friendshipId);
    
    const request = await Friendship.findOne({
      where: { 
        id: numericFriendshipId, 
        friendId: currentUserId, 
        status: FRIENDSHIP_CONFIG.STATUSES.PENDING 
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
        },
        {
          model: User,
          as: 'requested',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
          where: { id: currentUserId },
          required: true
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        code: 'FRIEND_REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed'
      });
    }

    const updatedRequest = await request.update({
      status: FRIENDSHIP_CONFIG.STATUSES.ACCEPTED,
      acceptedAt: new Date(),
      actionUserId: currentUserId
    });

    // Create notification
    await Notification.create({
      userId: request.requester.id,
      type: 'friend_request_accepted',
      senderId: currentUserId,
      friendshipId: updatedRequest.id,
      metadata: {
        friendshipId: updatedRequest.id,
        senderName: `${request.requested.firstName} ${request.requested.lastName}`,
        avatarUrl: request.requested.profileImage || '/default-avatar.png',
        message: 'accepted your friend request'
      },
      read: false
    });

    // Send acceptance email
    try {
      await sendFriendRequestAcceptedEmail(
        request.requester,
        {
          id: currentUserId,
          firstName: request.requested.firstName,
          lastName: request.requested.lastName,
          profileImage: request.requested.profileImage || '/default-avatar.png'
        }
      );
    } catch (emailError) {
      logger.error('Failed to send acceptance email:', emailError);
    }

    // Find or create DM chat
    const [chat] = await Chat.findOrCreate({
      where: {
        type: 'dm',
        [Op.or]: [
          { user1Id: request.requester.id, user2Id: currentUserId },
          { user1Id: currentUserId, user2Id: request.requester.id }
        ]
      },
      defaults: {
        user1Id: request.requester.id,
        user2Id: currentUserId,
        type: 'dm'
      }
    });

    // Add participants if needed
    if (chat) {
      await Promise.all([
        ChatParticipant.findOrCreate({
          where: { chatId: chat.id, userId: request.requester.id },
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
      req.io.to(`user_${request.requester.id}`).emit('friend_request_accepted', {
        friendship: formatFriendshipResponse(updatedRequest, currentUserId),
        chatId: chat?.id || null,
        acceptedBy: {
          id: currentUserId,
          name: `${request.requested.firstName} ${request.requested.lastName}`,
          avatar: request.requested.profileImage || '/default-avatar.png'
        }
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
    const numericFriendshipId = validateFriendshipId(friendshipId);
    
    const request = await Friendship.findOne({
      where: { 
        id: numericFriendshipId, 
        friendId: currentUserId, 
        status: FRIENDSHIP_CONFIG.STATUSES.PENDING 
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
        },
        {
          model: User,
          as: 'requested',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
          where: { id: currentUserId },
          required: true
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        code: 'FRIEND_REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed'
      });
    }

    const updatedRequest = await request.update({
      status: FRIENDSHIP_CONFIG.STATUSES.REJECTED,
      actionUserId: currentUserId
    });

    // Create notification
    await Notification.create({
      userId: request.requester.id,
      type: 'friend_request_rejected',
      senderId: currentUserId,
      friendshipId: updatedRequest.id,
      metadata: {
        friendshipId: updatedRequest.id,
        senderName: `${request.requested.firstName} ${request.requested.lastName}`,
        avatarUrl: request.requested.profileImage || '/default-avatar.png',
        message: 'declined your friend request'
      },
      read: false
    });

    // Send rejection email
    try {
      await sendFriendRequestRejectedEmail(
        request.requester,
        {
          id: currentUserId,
          firstName: request.requested.firstName,
          lastName: request.requested.lastName,
          profileImage: request.requested.profileImage || '/default-avatar.png'
        }
      );
    } catch (emailError) {
      logger.error('Failed to send rejection email:', emailError);
    }

    // Emit real-time event
    if (req.io) {
      req.io.to(`user_${request.requester.id}`).emit('friend_request_rejected', {
        friendship: formatFriendshipResponse(updatedRequest, currentUserId),
        rejectedBy: {
          id: currentUserId,
          name: `${request.requested.firstName} ${request.requested.lastName}`,
          avatar: request.requested.profileImage || '/default-avatar.png'
        }
      });
    }

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


  // Get friend list with pagination
const listFriends = async (req, res) => {
  try {
    const { page = 1, limit = FRIENDSHIP_CONFIG.FRIENDS_PER_PAGE } = req.query;
    const currentUserId = req.user.id;
    const { offset } = getPagination(page, limit);

    const { count, rows } = await Friendship.findAndCountAll({
      where: {
        [Op.or]: [
          { userId: currentUserId, status: FRIENDSHIP_CONFIG.STATUSES.ACCEPTED },
          { friendId: currentUserId, status: FRIENDSHIP_CONFIG.STATUSES.ACCEPTED }
        ]
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: User,
          as: 'requested',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ],
      limit,
      offset,
      order: [['updatedAt', 'DESC']]
    });

    const friends = rows.map(f => formatFriendshipResponse(f, currentUserId));
    const pagingData = getPagingData(count, page, limit);

    return successResponse(res, {
      payload: friends,
      metadata: {
        pagination: pagingData
      }
    });

  } catch (error) {
    logger.error('List friends error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch friends',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message
      })
    });
  }
};



//! ==================== Additional Controllers ====================
const cancelFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const currentUserId = req.user.id;
    const numericFriendshipId = validateFriendshipId(friendshipId);

    const request = await Friendship.findOne({
      where: {
        id: numericFriendshipId,
        userId: currentUserId,
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'friend',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    if (!request) {
      return errorResponse(res, {
        statusCode: 404,
        code: 'REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed'
      });
    }

    await request.destroy();

    // Notification
    await Notification.create({
      userId: request.friendId,
      type: 'friend_request_cancelled',
      senderId: currentUserId,
      metadata: {
        friendshipId: request.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        message: 'cancelled your friend request'
      }
    });

    // Real-time update
    if (req.io) {
      req.io.to(`user_${request.friendId}`).emit('friend_request_cancelled', {
        friendshipId: request.id,
        cancelledBy: {
          id: currentUserId,
          name: `${req.user.firstName} ${req.user.lastName}`
        }
      });
    }

    return successResponse(res, {
      message: 'Friend request cancelled successfully',
      payload: { friendshipId: request.id }
    });
  } catch (error) {
    logger.error('Cancel friend request error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to cancel friend request'
    });
  }
};

const removeFriend = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { friendshipId } = req.params;
    const currentUserId = req.user.id;
    const numericFriendshipId = validateFriendshipId(friendshipId);

    const friendship = await Friendship.findOne({
      where: {
        id: numericFriendshipId,
        status: 'accepted',
        [Op.or]: [
          { userId: currentUserId },
          { friendId: currentUserId }
        ]
      },
      transaction
    });

    if (!friendship) {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 404,
        code: 'FRIENDSHIP_NOT_FOUND',
        message: 'Friendship not found'
      });
    }

    const otherUserId = friendship.userId === currentUserId ? 
      friendship.friendId : friendship.userId;

    // 1. Delete friendship
    await friendship.destroy({ transaction });

    // 2. Clean up DM chat
    await Chat.destroy({
      where: {
        type: 'dm',
        [Op.or]: [
          { user1Id: currentUserId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: currentUserId }
        ]
      },
      transaction
    });

    // 3. Create notification
    await Notification.create({
      userId: otherUserId,
      type: 'friend_removed',
      senderId: currentUserId,
      metadata: {
        friendshipId: friendship.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        message: 'removed you from friends'
      }
    }, { transaction });

    await transaction.commit();

    // Real-time update
    if (req.io) {
      req.io.to(`user_${otherUserId}`).emit('friend_removed', {
        friendshipId: friendship.id,
        removedBy: {
          id: currentUserId,
          name: `${req.user.firstName} ${req.user.lastName}`
        }
      });
    }

    return successResponse(res, {
      message: 'Friend removed successfully',
      payload: { friendshipId: friendship.id }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Remove friend error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to remove friend'
    });
  }
};

//! ==================== Block/Unblock Controllers ====================

const blockUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { friendId } = req.body;
    const currentUserId = req.user.id;
    validateUserId(friendId, currentUserId);

    // Check if already blocked
    const existingBlock = await Friendship.findOne({
      where: {
        userId: currentUserId,
        friendId,
        status: 'blocked'
      },
      transaction
    });

    if (existingBlock) {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 409,
        code: 'ALREADY_BLOCKED',
        message: 'User is already blocked'
      });
    }

    // Update or create block relationship
    const [block] = await Friendship.findOrCreate({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId },
          { userId: friendId, friendId: currentUserId }
        ]
      },
      defaults: {
        userId: currentUserId,
        friendId,
        status: 'blocked',
        actionUserId: currentUserId
      },
      transaction
    });

    // If existing relationship wasn't blocked, update it
    if (block.status !== 'blocked') {
      await block.update({
        status: 'blocked',
        actionUserId: currentUserId
      }, { transaction });
    }

    // Remove any existing friendship
    await Friendship.destroy({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userId: currentUserId, friendId },
          { userId: friendId, friendId: currentUserId }
        ]
      },
      transaction
    });

    // Create notification (unless blocking a non-friend)
    const wasFriend = await Friendship.findOne({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userId: currentUserId, friendId },
          { userId: friendId, friendId: currentUserId }
        ]
      },
      paranoid: false,
      transaction
    });

    if (wasFriend) {
      await Notification.create({
        userId: friendId,
        type: 'user_blocked',
        senderId: currentUserId,
        metadata: {
          senderName: `${req.user.firstName} ${req.user.lastName}`,
          message: 'blocked you'
        }
      }, { transaction });
    }

    await transaction.commit();

    // Real-time update
    if (req.io) {
      req.io.to(`user_${friendId}`).emit('user_blocked', {
        blockedBy: {
          id: currentUserId,
          name: `${req.user.firstName} ${req.user.lastName}`
        }
      });
    }

    return successResponse(res, {
      message: 'User blocked successfully',
      payload: { friendshipId: block.id }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Block user error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to block user'
    });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    validateUserId(userId, currentUserId);

    const friendship = await Friendship.findOne({
      where: {
        userId: currentUserId,
        friendId: userId,
        status: 'blocked'
      }
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        code: 'BLOCK_NOT_FOUND',
        message: 'Block relationship not found'
      });
    }

    await friendship.destroy();

    return res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    logger.error('Unblock user error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to unblock user',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};


const getPendingRequests = async (req, res) => {
  try {
    const { page = 1, limit = FRIENDSHIP_CONFIG.FRIENDS_PER_PAGE } = req.query;
    const currentUserId = req.user.id;
    const { offset } = getPagination(page, limit);

    const { count, rows } = await Friendship.findAndCountAll({
      where: {
        friendId: currentUserId,
        status: FRIENDSHIP_CONFIG.STATUSES.PENDING
      },
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

    const pendingRequests = rows.map(f => formatFriendshipResponse(f, currentUserId));
    const pagingData = getPagingData(count, page, limit);

    return successResponse(res, {
      payload: pendingRequests,
      metadata: {
        pagination: pagingData
      }
    });
  } catch (error) {
    logger.error('Get pending requests error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to get pending requests',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message
      })
    });
  }
};


const getFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = FRIENDSHIP_CONFIG.FRIENDS_PER_PAGE } = req.query;
    const currentUserId = req.user.id;
    const targetUserId = userId || currentUserId;

    const { offset } = getPagination(page, limit);

    const { count, rows } = await Friendship.findAndCountAll({
      where: {
        status: FRIENDSHIP_CONFIG.STATUSES.ACCEPTED,
        [Op.or]: [
          { userId: targetUserId },
          { friendId: targetUserId }
        ]
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: User,
          as: 'requested',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ],
      limit,
      offset,
      order: [['acceptedAt', 'DESC']]
    });

    const friends = rows.map(f => formatFriendshipResponse(f, targetUserId));
    const pagingData = getPagingData(count, page, limit);

    return successResponse(res, {
      payload: friends,
      metadata: {
        pagination: pagingData
      }
    });
  } catch (error) {
    logger.error('Get friends error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to get friends',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message
      })
    });
  }
};

const checkFriendshipStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const numericUserId = validateFriendshipId(userId);

    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId: numericUserId },
          { userId: numericUserId, friendId: currentUserId }
        ]
      }
    });

    const status = friendship ? friendship.status : 'none';
    return successResponse(res, {
      payload: { status }
    });
  } catch (error) {
    logger.error('Check friendship status error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to check friendship status',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message
      })
    });
  }
};

const getMutualFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = FRIENDSHIP_CONFIG.FRIENDS_PER_PAGE } = req.query;
    const currentUserId = req.user.id;
    const numericUserId = validateId(userId);

    const { offset } = getPagination(page, limit);

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

    const pagingData = getPagingData(count, page, limit);
    return successResponse(res, {
      payload: rows,
      metadata: {
        pagination: pagingData
      }
    });
  } catch (error) {
    logger.error('Get mutual friends error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to get mutual friends',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message
      })
    });
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
      limit: FRIENDSHIP_CONFIG.SUGGESTIONS_LIMIT,
      attributes: ['id', 'firstName', 'lastName', 'profileImage']
    });

    return successResponse(res, {
      payload: suggestions
    });
  } catch (error) {
    logger.error('Get friend suggestions error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to get friend suggestions',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message
      })
    });
  }
};

const updateFriendshipTier = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const { tier, customLabel } = req.body;
    const currentUserId = req.user.id;
    const numericFriendshipId = validateFriendshipId(friendshipId);

    if (!FRIENDSHIP_CONFIG.TIERS.includes(tier)) {
      return errorResponse(res, {
        statusCode: 400,
        code: 'INVALID_TIER',
        message: `Valid tiers are: ${FRIENDSHIP_CONFIG.TIERS.join(', ')}`
      });
    }

    const friendship = await Friendship.findOne({
      where: {
        id: numericFriendshipId,
        status: FRIENDSHIP_CONFIG.STATUSES.ACCEPTED,
        [Op.or]: [
          { userId: currentUserId },
          { friendId: currentUserId }
        ]
      }
    });

    if (!friendship) {
      return errorResponse(res, {
        statusCode: 404,
        code: 'FRIENDSHIP_NOT_FOUND',
        message: 'Friendship not found'
      });
    }

    await friendship.update({ tier, customLabel });
    return successResponse(res, {
      message: 'Friendship tier updated successfully',
      payload: friendship
    });
  } catch (error) {
    logger.error('Update friendship tier error:', error);
    return errorResponse(res, {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'Failed to update friendship tier',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message
      })
    });
  }
};

const cleanupExpiredRequests = async () => {
  try {
    const result = await Friendship.destroy({
      where: {
        status: FRIENDSHIP_CONFIG.STATUSES.PENDING,
        expiresAt: { [Op.lt]: new Date() }
      }
    });
    logger.info(`Cleaned ${result} expired friend requests`);
    return result;
  } catch (error) {
    logger.error('Cleanup expired requests error:', error);
    throw error;
  }
};


module.exports = {
  // Send a new friend request to another user
  sendFriendRequest,
  
  // Accept an incoming friend request from another user
  acceptFriendRequest,
  
  // Reject/decline an incoming friend request
  rejectFriendRequest,
  
  // List all friends with pagination support (for current user)
  listFriends,
  
  // Cancel a friend request you previously sent
  cancelFriendRequest,
  
  // Remove an existing friend from your friends list
  removeFriend,
  
  // Block another user (prevents all interactions)
  blockUser,
  
  // Unblock a previously blocked user
  unblockUser,
  
  // Get all pending friend requests you've received
  getPendingRequests,
  
  // Get friends list for any user (defaults to current user)
  getFriends,
  
  // Check the friendship status between current user and another user
  checkFriendshipStatus,
  
  // Get mutual friends between current user and another user
  getMutualFriends,
  
  // Get suggested friends based on your existing friendships
  getFriendSuggestions,
  
  // Update friendship tier/level (close friend, family, etc.)
  updateFriendshipTier,
  
  // Background task to clean up expired friend requests (cron job)
  cleanupExpiredRequests
};









































