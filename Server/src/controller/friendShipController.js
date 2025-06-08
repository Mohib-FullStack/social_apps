const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../helper/pagination');
const Friendship = require('../models/friendshipModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Chat = require('../models/chatModel');

// Constants
const MAX_PENDING_REQUESTS = 500;
const REQUEST_EXPIRY_DAYS = 30;
const COOLING_PERIOD_DAYS = 7;
const FRIENDS_PER_PAGE = 10;
const SUGGESTIONS_LIMIT = 20;
const FRIENDSHIP_TIERS = ['regular', 'close', 'family', 'work'];
const FRIENDSHIP_STATUSES = ['pending', 'accepted', 'rejected', 'blocked'];

// Helper Functions
const validateUserId = (userId, currentUserId) => {
  if (!userId || isNaN(Number(userId))) {
    throw new Error('Invalid user ID format');
  }
  if (Number(userId) === Number(currentUserId)) {
    throw new Error('Cannot perform this action on yourself');
  }
};

const validateFriendshipStatus = (status) => {
  if (!FRIENDSHIP_STATUSES.includes(status)) {
    throw new Error('Invalid friendship status');
  }
};

const getFriendIds = async (userId) => {
  const friendships = await Friendship.findAll({
    where: {
      status: 'accepted',
      [Op.or]: [{ userId }, { friendId: userId }],
    },
    attributes: ['userId', 'friendId'],
  });

  return friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));
};

const formatFriendshipResponse = (friendship, currentUserId) => {
  const friend =
    friendship.userId === currentUserId
      ? friendship.requested
      : friendship.requester;
  return {
    id: friendship.id,
    status: friendship.status,
    tier: friendship.tier,
    customLabel: friendship.customLabel,
    createdAt: friendship.createdAt,
    acceptedAt: friendship.acceptedAt,
    friend: {
      id: friend.id,
      firstName: friend.firstName,
      lastName: friend.lastName,
      profileImage: friend.profileImage,
      lastActive: friend.lastActive,
    },
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

// Controller Functions
 //! 🔵 Send Friend Request
const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUserId = req.user.id;

    // Convert to numbers for validation
    const numericFriendId = Number(friendId);
    const numericCurrentUserId = Number(currentUserId);

    validateUserId(numericFriendId, numericCurrentUserId);

    // Check if user exists
    const friend = await User.findByPk(numericFriendId);
    if (!friend) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: "The requested user does not exist"
      });
    }

    // Check existing relationship
    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId: numericCurrentUserId, friendId: numericFriendId },
          { userId: numericFriendId, friendId: numericCurrentUserId }
        ]
      }
    });

    if (existing) {
      switch (existing.status) {
        case 'pending':
          return res.status(409).json({
            code: existing.userId === numericCurrentUserId
              ? 'REQUEST_PENDING'
              : 'REQUEST_RECEIVED',
            message: existing.userId === numericCurrentUserId
              ? "You already sent a request to this user"
              : "This user already sent you a request"
          });
        case 'accepted':
          return res.status(409).json({
            code: 'ALREADY_FRIENDS',
            message: "You are already friends with this user"
          });
        case 'rejected':
          if (existing.coolingPeriod > new Date()) {
            return res.status(429).json({
              code: 'COOLING_PERIOD',
              message: `Please wait until ${existing.coolingPeriod.toLocaleDateString()} to resend`
            });
          }
          break;
        case 'blocked':
          return res.status(403).json({
            code: 'BLOCKED',
            message: "This action is not allowed"
          });
      }
    }

    // Create new request
    const friendship = await Friendship.create({
      userId: numericCurrentUserId,
      friendId: numericFriendId,
      status: 'pending',
      actionUserId: numericCurrentUserId,
      requestCount: 1,
      expiresAt: new Date(Date.now() + REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    });

    // Create notification - FIXED HERE
    await Notification.create({
      userId: numericFriendId,
      type: 'friend_request',
      senderId: numericCurrentUserId,
      friendshipId: friendship.id, // Directly include friendshipId
      message: `${req.user.firstName} sent you a friend request`,
      metadata: { /* additional data if needed */ }
    });

    // Real-time update
    if (req.io) {
      req.io.to(`user_${numericFriendId}`).emit('friend_request', {
        from: numericCurrentUserId,
        friendshipId: friendship.id
      });
    }

    res.status(201).json({
      message: "Friend request sent successfully",
      friendship
    });

  } catch (error) {
    console.error('Friend request error:', error);
    res.status(400).json({
      error: error.message,
      code: error.message.includes('yourself') ? 'SELF_ACTION' : 'INVALID_REQUEST'
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        friendId: currentUserId,
        status: 'pending',
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'REQUEST_NOT_FOUND',
        message: 'Friend request not found',
      });
    }

    await friendship.update({
      status: 'accepted',
      actionUserId: currentUserId,
      acceptedAt: new Date(),
    });

    // Create mutual friendship record
    await Friendship.create({
      userId: currentUserId,
      friendId: friendship.userId,
      status: 'accepted',
      actionUserId: currentUserId,
      acceptedAt: new Date(),
    });

    await Notification.create({
      userId: friendship.userId,
      type: 'friend_request_accepted',
      senderId: currentUserId,
      message: `${req.user.firstName} accepted your friend request`,
    });

    if (req.io) {
      req.io.to(`user_${friendship.userId}`).emit('friend_request_accepted', {
        friendshipId: friendship.id,
        acceptedBy: currentUserId,
      });
    }

    res.status(200).json({
      message: 'Friend request accepted successfully',
      data: formatFriendshipResponse(friendship, currentUserId),
    });
  } catch (error) {
    res.status(400).json({
      code: 'ACCEPT_FAILED',
      message: error.message,
    });
  }
};

const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        friendId: currentUserId,
        status: 'pending',
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed',
      });
    }

    await friendship.update({
      status: 'rejected',
      actionUserId: currentUserId,
      coolingPeriod: new Date(
        Date.now() + COOLING_PERIOD_DAYS * 24 * 60 * 60 * 1000
      ),
    });

    res.status(200).json({
      message: 'Friend request rejected',
      data: formatFriendshipResponse(friendship, currentUserId),
    });
  } catch (error) {
    res.status(400).json({
      code: 'REJECT_FAILED',
      message: error.message,
    });
  }
};

const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        userId: currentUserId,
        status: 'pending',
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed',
      });
    }

    await friendship.destroy();

    if (req.io) {
      req.io
        .to(`user_${friendship.friendId}`)
        .emit('friend_request_cancelled', {
          friendshipId: friendship.id,
          cancelledBy: currentUserId,
        });
    }

    res.status(200).json({
      message: 'Friend request cancelled successfully',
    });
  } catch (error) {
    res.status(400).json({
      code: 'CANCEL_FAILED',
      message: error.message,
    });
  }
};

const removeFriendship = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const currentUserId = req.user.id;

    const friendship = await Friendship.findOne({
      where: {
        id: friendshipId,
        [Op.or]: [{ userId: currentUserId }, { friendId: currentUserId }],
        status: 'accepted',
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'FRIENDSHIP_NOT_FOUND',
        message: 'Friendship not found',
      });
    }

    const otherUserId =
      friendship.userId === currentUserId
        ? friendship.friendId
        : friendship.userId;

    // Delete both sides of the friendship
    await Friendship.destroy({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId: otherUserId },
          { userId: otherUserId, friendId: currentUserId },
        ],
      },
    });

    await Chat.destroy({
      where: {
        type: 'dm',
        participants: {
          [Op.and]: [
            { [Op.contains]: [currentUserId] },
            { [Op.contains]: [otherUserId] },
          ],
        },
      },
    });

    if (req.io) {
      req.io.to(`user_${otherUserId}`).emit('friendship_removed', {
        friendshipId: friendship.id,
        removedBy: currentUserId,
      });
    }

    res.status(200).json({
      message: 'Friendship removed successfully',
    });
  } catch (error) {
    res.status(400).json({
      code: 'REMOVE_FAILED',
      message: error.message,
    });
  }
};

const blockUser = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUserId = req.user.id;
    validateUserId(friendId, currentUserId);

    const friend = await User.findByPk(friendId);
    if (!friend) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const [friendship, created] = await Friendship.findOrCreate({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId },
          { userId: friendId, friendId: currentUserId },
        ],
      },
      defaults: {
        userId: currentUserId,
        friendId,
        status: 'blocked',
        actionUserId: currentUserId,
      },
    });

    if (!created) {
      await friendship.update({
        status: 'blocked',
        actionUserId: currentUserId,
      });
    }

    await Chat.destroy({
      where: {
        type: 'dm',
        participants: {
          [Op.and]: [
            { [Op.contains]: [currentUserId] },
            { [Op.contains]: [friendId] },
          ],
        },
      },
    });

    res.status(200).json({
      message: 'User blocked successfully',
      data: formatFriendshipResponse(friendship, currentUserId),
    });
  } catch (error) {
    res.status(400).json({
      code: 'BLOCK_FAILED',
      message: error.message,
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
        status: 'blocked',
      },
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'BLOCK_NOT_FOUND',
        message: 'Blocked user not found',
      });
    }

    await friendship.destroy();
    res.status(200).json({
      message: 'User unblocked successfully',
    });
  } catch (error) {
    res.status(400).json({
      code: 'UNBLOCK_FAILED',
      message: error.message,
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);
    const currentUserId = req.user.id;

    const result = await Friendship.findAndCountAll({
      where: {
        friendId: currentUserId,
        status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: [
            'id',
            'firstName',
            'lastName',
            'profileImage',
            'lastActive',
          ],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const formatted = result.rows.map((friendship) =>
      formatFriendshipResponse(friendship, currentUserId)
    );

    res.status(200).json(
      getPagingData(
        {
          count: result.count,
          rows: formatted,
        },
        page,
        limit
      )
    );
  } catch (error) {
    res.status(400).json({
      code: 'FETCH_PENDING_FAILED',
      message: error.message,
    });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);
    const currentUserId = req.user.id;

    const result = await Friendship.findAndCountAll({
      where: {
        userId: currentUserId,
        status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'requested',
          attributes: [
            'id',
            'firstName',
            'lastName',
            'profileImage',
            'lastActive',
          ],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const formatted = result.rows.map((friendship) =>
      formatFriendshipResponse(friendship, currentUserId)
    );

    res.status(200).json(
      getPagingData(
        {
          count: result.count,
          rows: formatted,
        },
        page,
        limit
      )
    );
  } catch (error) {
    res.status(400).json({
      code: 'FETCH_SENT_FAILED',
      message: error.message,
    });
  }
};

const listFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);

    validateUserId(targetUserId, req.user.id);

    const result = await Friendship.findAndCountAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ userId: targetUserId }, { friendId: targetUserId }],
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' },
      ],
      limit,
      offset,
      order: [['acceptedAt', 'DESC']],
    });

    const formatted = result.rows.map((friendship) =>
      formatFriendshipResponse(friendship, targetUserId)
    );

    res.status(200).json(
      getPagingData(
        {
          count: result.count,
          rows: formatted,
        },
        page,
        limit
      )
    );
  } catch (error) {
    res.status(400).json({
      code: 'FETCH_FRIENDS_FAILED',
      message: error.message,
    });
  }
};

const checkFriendshipStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    validateUserId(userId, currentUserId);

    const friendship = await findFriendshipBetweenUsers(currentUserId, userId);

    const status = friendship ? friendship.status : 'none';
    const direction = friendship
      ? friendship.userId === currentUserId
        ? 'outgoing'
        : 'incoming'
      : null;

    res.status(200).json({
      status,
      direction,
      friendship: friendship
        ? formatFriendshipResponse(friendship, currentUserId)
        : null,
    });
  } catch (error) {
    res.status(400).json({
      code: 'CHECK_STATUS_FAILED',
      message: error.message,
    });
  }
};

const getMutualFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);
    const currentUserId = req.user.id;

    validateUserId(userId, currentUserId);

    const [currentUserFriends, targetUserFriends] = await Promise.all([
      getFriendIds(currentUserId),
      getFriendIds(userId),
    ]);

    const mutualFriendIds = currentUserFriends.filter((id) =>
      targetUserFriends.includes(id)
    );

    const { count, rows } = await User.findAndCountAll({
      where: {
        id: {
          [Op.in]: mutualFriendIds,
        },
      },
      attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive'],
      limit,
      offset,
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC'],
      ],
    });

    res.status(200).json(
      getPagingData(
        {
          count,
          rows,
        },
        page,
        limit
      )
    );
  } catch (error) {
    res.status(400).json({
      code: 'FETCH_MUTUAL_FAILED',
      message: error.message,
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
          )`),
        },
      },
      limit: SUGGESTIONS_LIMIT,
      attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive'],
    });

    res.status(200).json({
      data: suggestions,
    });
  } catch (error) {
    res.status(400).json({
      code: 'SUGGESTIONS_FAILED',
      message: error.message,
    });
  }
};

const updateFriendshipTier = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const { tier, customLabel } = req.body;
    const currentUserId = req.user.id;

    if (!FRIENDSHIP_TIERS.includes(tier)) {
      return res.status(400).json({
        code: 'INVALID_TIER',
        message: 'Invalid friendship tier',
      });
    }

    const friendship = await Friendship.findOne({
      where: {
        id: friendshipId,
        status: 'accepted',
        [Op.or]: [{ userId: currentUserId }, { friendId: currentUserId }],
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'FRIENDSHIP_NOT_FOUND',
        message: 'Friendship not found',
      });
    }

    await friendship.update({
      tier,
      customLabel,
    });

    res.status(200).json({
      message: 'Friendship tier updated successfully',
      data: formatFriendshipResponse(friendship, currentUserId),
    });
  } catch (error) {
    res.status(400).json({
      code: 'TIER_UPDATE_FAILED',
      message: error.message,
    });
  }
};

const getFriendsByTier = async (req, res) => {
  try {
    const { tier } = req.params;
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);
    const currentUserId = req.user.id;

    if (!FRIENDSHIP_TIERS.includes(tier)) {
      return res.status(400).json({
        code: 'INVALID_TIER',
        message: 'Invalid friendship tier',
      });
    }

    const result = await Friendship.findAndCountAll({
      where: {
        tier,
        status: 'accepted',
        [Op.or]: [{ userId: currentUserId }, { friendId: currentUserId }],
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' },
      ],
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
    });

    const formatted = result.rows.map((friendship) =>
      formatFriendshipResponse(friendship, currentUserId)
    );

    res.status(200).json(
      getPagingData(
        {
          count: result.count,
          rows: formatted,
        },
        page,
        limit
      )
    );
  } catch (error) {
    res.status(400).json({
      code: 'FETCH_TIER_FAILED',
      message: error.message,
    });
  }
};

const getAllFriendshipTiers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ userId: currentUserId }, { friendId: currentUserId }],
        tier: { [Op.not]: null },
      },
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'requested' },
      ],
    });

    const tiers = friendships.map((friendship) =>
      formatFriendshipResponse(friendship, currentUserId)
    );

    res.status(200).json({
      count: tiers.length,
      data: tiers,
    });
  } catch (error) {
    res.status(400).json({
      code: 'FETCH_TIERS_FAILED',
      message: error.message,
    });
  }
};

const cleanupExpiredRequests = async () => {
  try {
    const result = await Friendship.destroy({
      where: {
        status: 'pending',
        expiresAt: { [Op.lt]: new Date() },
      },
    });

    console.log(`Cleaned up ${result} expired friend requests`);
    return result;
  } catch (error) {
    console.error('Error cleaning up expired requests:', error);
    throw error;
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriendship,
  blockUser,
  unblockUser,
  getPendingRequests,
  getSentRequests,
  listFriends,
  checkFriendshipStatus,
  getMutualFriends,
  getFriendSuggestions,
  updateFriendshipTier,
  getFriendsByTier,
  getAllFriendshipTiers,
  cleanupExpiredRequests,
  // Helper functions for testing
  validateUserId,
  validateFriendshipStatus,
  getFriendIds,
  formatFriendshipResponse,
  findFriendshipBetweenUsers,
};



//! previous
// const { Op } = require('sequelize');
// const { getPagination, getPagingData } = require('../helper/pagination');
// const Friendship = require('../models/friendshipModel');
// const User = require('../models/userModel');
// const Notification = require('../models/notificationModel');
// const Chat = require('../models/chatModel');

// 🟢 CONSTANTS & CONFIGURATION ====================================
// const MAX_PENDING_REQUESTS = 500; // Max pending requests per user
// const REQUEST_EXPIRY_DAYS = 30;   // Request expires after 30 days
// const COOLING_PERIOD_DAYS = 7;    // Cooldown after rejection
// const FRIENDS_PER_PAGE = 10;      // Default pagination size

// // 🟢 HELPER FUNCTIONS =============================================
// const validateUserId = (userId, currentUserId) => {
//   if (!userId || isNaN(Number(userId))) {
//     throw new Error("Invalid user ID format");
//   }
//   if (Number(userId) === Number(currentUserId)) {
//     throw new Error("Cannot perform this action on yourself");
//   }
// };

// // Get all friend IDs for a user (accepted friendships only)
//  const getFriendIds = async (userId) => {
//   const friendships = await Friendship.findAll({
//     where: {
//       status: 'accepted',
//       [Op.or]: [
//         { userId },
//         { friendId: userId }
//       ]
//     },
//     attributes: ['userId', 'friendId']
//   });

//   return friendships.map(f => f.userId === userId ? f.friendId : f.userId);
// };

//   //! 🔵 Send Friend Request
// const sendFriendRequest = async (req, res) => {
//   try {
//     const { friendId } = req.body;
//     const currentUserId = req.user.id;

//     // Convert to numbers for validation
//     const numericFriendId = Number(friendId);
//     const numericCurrentUserId = Number(currentUserId);

//     validateUserId(numericFriendId, numericCurrentUserId);

//     // Check if user exists
//     const friend = await User.findByPk(numericFriendId);
//     if (!friend) {
//       return res.status(404).json({
//         code: 'USER_NOT_FOUND',
//         message: "The requested user does not exist"
//       });
//     }

//     // Check existing relationship
//     const existing = await Friendship.findOne({
//       where: {
//         [Op.or]: [
//           { userId: numericCurrentUserId, friendId: numericFriendId },
//           { userId: numericFriendId, friendId: numericCurrentUserId }
//         ]
//       }
//     });

//     if (existing) {
//       switch (existing.status) {
//         case 'pending':
//           return res.status(409).json({
//             code: existing.userId === numericCurrentUserId
//               ? 'REQUEST_PENDING'
//               : 'REQUEST_RECEIVED',
//             message: existing.userId === numericCurrentUserId
//               ? "You already sent a request to this user"
//               : "This user already sent you a request"
//           });
//         case 'accepted':
//           return res.status(409).json({
//             code: 'ALREADY_FRIENDS',
//             message: "You are already friends with this user"
//           });
//         case 'rejected':
//           if (existing.coolingPeriod > new Date()) {
//             return res.status(429).json({
//               code: 'COOLING_PERIOD',
//               message: `Please wait until ${existing.coolingPeriod.toLocaleDateString()} to resend`
//             });
//           }
//           break;
//         case 'blocked':
//           return res.status(403).json({
//             code: 'BLOCKED',
//             message: "This action is not allowed"
//           });
//       }
//     }

//     // Create new request
//     const friendship = await Friendship.create({
//       userId: numericCurrentUserId,
//       friendId: numericFriendId,
//       status: 'pending',
//       actionUserId: numericCurrentUserId,
//       requestCount: 1,
//       expiresAt: new Date(Date.now() + REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
//     });

//     // Create notification - FIXED HERE
//     await Notification.create({
//       userId: numericFriendId,
//       type: 'friend_request',
//       senderId: numericCurrentUserId,
//       friendshipId: friendship.id, // Directly include friendshipId
//       message: `${req.user.firstName} sent you a friend request`,
//       metadata: { /* additional data if needed */ }
//     });

//     // Real-time update
//     if (req.io) {
//       req.io.to(`user_${numericFriendId}`).emit('friend_request', {
//         from: numericCurrentUserId,
//         friendshipId: friendship.id
//       });
//     }

//     res.status(201).json({
//       message: "Friend request sent successfully",
//       friendship
//     });

//   } catch (error) {
//     console.error('Friend request error:', error);
//     res.status(400).json({
//       error: error.message,
//       code: error.message.includes('yourself') ? 'SELF_ACTION' : 'INVALID_REQUEST'
//     });
//   }
// };

// //  🔵 Cancel Friend Request
//  const cancelFriendRequest = async (req, res, next) => {
//   try {
//     const { requestId } = req.params;

//     // 🟣 Find the pending request
//     const friendship = await Friendship.findOne({
//       where: {
//         id: requestId,
//         userId: req.user.id,
//         status: 'pending'
//       }
//     });

//     if (!friendship) {
//       return res.status(404).json({ error: "Friend request not found or already processed" });
//     }

//     // 🟣 Delete the request
//     await friendship.destroy();

//     // 🟠 Notify the recipient if they're online
//     req.io.to(`user_${friendship.friendId}`).emit('friend_request_cancelled', {
//       friendshipId: friendship.id,
//       cancelledBy: req.user.id
//     });

//     res.status(200).json({
//       message: "Friend request cancelled successfully"
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// //  🔵 Accept Friend Request
// const acceptFriendRequest = async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const currentUserId = req.user.id;

//     // Find the pending request
//     const friendship = await Friendship.findOne({
//       where: {
//         id: requestId,
//         friendId: currentUserId,
//         status: 'pending'
//       },
//       include: [
//         { model: User, as: 'requester' }
//       ]
//     });

//     if (!friendship) {
//       return res.status(404).json({
//         code: 'REQUEST_NOT_FOUND',
//         message: "Friend request not found or already processed"
//       });
//     }

//     // Update friendship status
//     await friendship.update({
//       status: 'accepted',
//       actionUserId: currentUserId,
//       acceptedAt: new Date()
//     });

//     // Create mutual friendship record
//     await Friendship.findOrCreate({
//       where: {
//         userId: currentUserId,
//         friendId: friendship.userId
//       },
//       defaults: {
//         status: 'accepted',
//         actionUserId: currentUserId,
//         acceptedAt: new Date()
//       }
//     });

//     // Create notification (remove chat creation if not needed)
//     await Notification.create({
//       userId: friendship.userId,
//       type: 'friend_request_accepted',
//       senderId: currentUserId,
//       message: `${req.user.firstName} accepted your friend request`,
//       metadata: {
//         friendshipId: friendship.id,
//         action: 'accept'
//       }
//     });

//     // Real-time update
//     if (req.io) {
//       req.io.to(`user_${friendship.userId}`).emit('friend_request_accepted', {
//         friendshipId: friendship.id,
//         acceptedBy: currentUserId
//       });
//     }

//     res.status(200).json({
//       message: "Friend request accepted",
//       friendship
//     });

//   } catch (error) {
//     console.error('Accept friend request error:', error);
//     res.status(400).json({
//       error: error.message,
//       code: 'ACCEPT_FAILED'
//     });
//   }
// };

//   // 🔵 Reject Friend Request
// const rejectFriendRequest = async (req, res, next) => {
//   try {
//     const { requestId } = req.params;

//     // 🟣 Find the pending request
//     const friendship = await Friendship.findOne({
//       where: {
//         id: requestId,
//         friendId: req.user.id,
//         status: 'pending'
//       }
//     });

//     if (!friendship) {
//       return res.status(404).json({ error: "Friend request not found" });
//     }

//     // 🟣 Update with rejection and cooling period
//     await friendship.update({
//       status: 'rejected',
//       actionUserId: req.user.id,
//       coolingPeriod: new Date(Date.now() + COOLING_PERIOD_DAYS * 24 * 60 * 60 * 1000)
//     });

//     res.status(200).json({
//       message: "Friend request rejected",
//       friendship
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // 🔵 FRIENDSHIP MANAGEMENT =======================================

// // 🔵 Remove Friendship

// const removeFriendship = async (req, res, next) => {
//   try {
//     const { friendshipId } = req.params;

//     // 🟣 Find the friendship
//     const friendship = await Friendship.findOne({
//       where: {
//         id: friendshipId,
//         [Op.or]: [
//           { userId: req.user.id },
//           { friendId: req.user.id }
//         ],
//         status: 'accepted'
//       }
//     });

//     if (!friendship) {
//       return res.status(404).json({ error: "Friendship not found" });
//     }

//     // 🟣 Delete the friendship record
//     await friendship.destroy();

//     // 🟣 Remove associated DM chat
//     await Chat.destroy({
//       where: {
//         type: 'dm',
//         participants: {
//           [Op.and]: [
//             { [Op.contains]: [friendship.userId] },
//             { [Op.contains]: [friendship.friendId] }
//           ]
//         }
//       }
//     });

//     // 🟠 Notify the other user if they're online
//     const otherUserId = friendship.userId === req.user.id
//       ? friendship.friendId
//       : friendship.userId;

//     req.io.to(`user_${otherUserId}`).emit('friendship_removed', {
//       friendshipId: friendship.id,
//       removedBy: req.user.id
//     });

//     res.status(200).json({
//       message: "Friendship removed successfully"
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // 🔵 BLOCK MANAGEMENT ============================================

// /**
//  * 🔵 Block User
//  *
//  * Flow:
//  * 1. Validate user
//  * 2. Create/update blocked status
//  * 3. Remove any existing friendship/DM
//  */
// const blockUser = async (req, res, next) => {
//   try {
//     const { friendId } = req.body;
//     validateUserId(friendId, req.user.id);

//     // 🟣 Check if user exists
//     const friend = await User.findByPk(friendId);
//     if (!friend) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // 🟣 Create or update block status
//     const [friendship, created] = await Friendship.findOrCreate({
//       where: {
//         [Op.or]: [
//           { userId: req.user.id, friendId },
//           { userId: friendId, friendId: req.user.id }
//         ]
//       },
//       defaults: {
//         userId: req.user.id,
//         friendId,
//         status: 'blocked',
//         actionUserId: req.user.id
//       }
//     });

//     if (!created) {
//       friendship.status = 'blocked';
//       friendship.actionUserId = req.user.id;
//       await friendship.save();
//     }

//     // 🟣 Delete any existing chat
//     await Chat.destroy({
//       where: {
//         type: 'dm',
//         participants: {
//           [Op.and]: [
//             { [Op.contains]: [req.user.id] },
//             { [Op.contains]: [friendId] }
//           ]
//         }
//       }
//     });

//     res.status(200).json({
//       message: "User blocked successfully",
//       friendship
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * 🔵 Unblock User
//  *
//  * Flow:
//  * 1. Find block record
//  * 2. Validate ownership
//  * 3. Remove block
//  */
// const unblockUser = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     validateUserId(userId, req.user.id);

//     // 🟣 Find the block record
//     const friendship = await Friendship.findOne({
//       where: {
//         userId: req.user.id,
//         friendId: userId,
//         status: 'blocked'
//       }
//     });

//     if (!friendship) {
//       return res.status(404).json({ error: "Blocked user not found" });
//     }

//     // 🟣 Remove the block
//     await friendship.destroy();

//     res.status(200).json({
//       message: "User unblocked successfully"
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // 🔵 QUERY METHODS ===============================================

// /**
//  * 🔵 Get Pending Friend Requests (Received)
//  */
// const getPendingRequests = async (req, res, next) => {
//   try {
//     const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
//     const { limit, offset } = getPagination(page, size);

//     // 🟣 Get paginated pending requests
//     const result = await Friendship.findAndCountAll({
//       where: {
//         friendId: req.user.id,
//         status: 'pending'
//       },
//       include: [{
//         model: User,
//         as: 'requester',
//         attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive']
//       }],
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']]
//     });

//     const response = getPagingData(result, page, limit);
//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * 🔵 Get Sent Friend Requests
//  */
// const getSentRequests = async (req, res, next) => {
//   try {
//     const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
//     const { limit, offset } = getPagination(page, size);

//     // 🟣 Get paginated sent requests
//     const result = await Friendship.findAndCountAll({
//       where: {
//         userId: req.user.id,
//         status: 'pending'
//       },
//       include: [{
//         model: User,
//         as: 'requested',
//         attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive']
//       }],
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']]
//     });

//     const response = getPagingData(result, page, limit);
//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * 🔵 List Friends with Pagination
//  */
// const listFriends = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     const targetUserId = userId || req.user.id;
//     const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
//     const { limit, offset } = getPagination(page, size);

//     // 🟣 Get paginated friends list
//     const result = await Friendship.findAndCountAll({
//       where: {
//         status: 'accepted',
//         [Op.or]: [
//           { userId: targetUserId },
//           { friendId: targetUserId }
//         ]
//       },
//       include: [
//         {
//           model: User,
//           as: 'requester',
//           attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive']
//         },
//         {
//           model: User,
//           as: 'requested',
//           attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive']
//         }
//       ],
//       limit,
//       offset,
//       order: [['acceptedAt', 'DESC']]
//     });

//     // Format friends list
//     const formattedFriends = result.rows.map(friendship => {
//       return friendship.userId === targetUserId
//         ? friendship.requested
//         : friendship.requester;
//     }).filter(Boolean);

//     res.status(200).json({
//       success: true,
//       payload: getPagingData({
//         count: result.count,
//         rows: formattedFriends
//       }, page, limit)
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * 🔵 Check Friendship Status
//  */
// const checkFriendshipStatus = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     validateUserId(userId, req.user.id);

//     // 🟣 Get friendship status
//     const friendship = await Friendship.findOne({
//       where: {
//         [Op.or]: [
//           { userId: req.user.id, friendId: userId },
//           { userId: userId, friendId: req.user.id }
//         ]
//       },
//       attributes: ['id', 'status', 'actionUserId', 'createdAt', 'acceptedAt']
//     });

//     const status = friendship ? friendship.status : 'none';
//     const direction = friendship ?
//       (friendship.userId === req.user.id ? 'outgoing' : 'incoming') :
//       null;

//     res.status(200).json({
//       status,
//       direction,
//       friendship
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * 🔵 Get Mutual Friends
//  */
// const getMutualFriends = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
//     const { limit, offset } = getPagination(page, size);

//     validateUserId(userId, req.user.id);

//     // 🟣 Get both users' friend IDs
//     const [currentUserFriends, targetUserFriends] = await Promise.all([
//       getFriendIds(req.user.id),
//       getFriendIds(userId)
//     ]);

//     // Find intersection (mutual friends)
//     const mutualFriendIds = currentUserFriends.filter(id =>
//       targetUserFriends.includes(id)
//     );

//     // 🟣 Get paginated mutual friends with details
//     const { count, rows } = await User.findAndCountAll({
//       where: {
//         id: {
//           [Op.in]: mutualFriendIds
//         }
//       },
//       attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive'],
//       limit,
//       offset,
//       order: [['lastName', 'ASC'], ['firstName', 'ASC']]
//     });

//     res.status(200).json({
//       success: true,
//       payload: getPagingData({ count, rows }, page, limit)
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // 🟢 MAINTENANCE FUNCTIONS =======================================

// /**
//  * 🟢 Cleanup Expired Requests (for scheduled jobs)
//  */
// const cleanupExpiredRequests = async () => {
//   try {
//     const result = await Friendship.destroy({
//       where: {
//         status: 'pending',
//         expiresAt: { [Op.lt]: new Date() }
//       }
//     });

//     console.log(`Cleaned up ${result} expired friend requests`);
//     return result;
//   } catch (error) {
//     console.error('Error cleaning up expired requests:', error);
//     throw error;
//   }
// };

// module.exports = {
//   sendFriendRequest,
//   cancelFriendRequest,
//   getPendingRequests,
//   getSentRequests,
//   acceptFriendRequest,
//   rejectFriendRequest,
//   listFriends,
//   checkFriendshipStatus,
//   removeFriendship,
//   blockUser,
//   unblockUser,
//   getFriendIds,
//   getMutualFriends,
//   cleanupExpiredRequests
// };
