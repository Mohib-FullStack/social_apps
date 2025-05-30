const { Friendship, User, Notification, Chat } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../helper/pagination');

const validateUserId = (userId, currentUserId) => {
  if (!userId || isNaN(userId)) {
    throw new Error("Invalid user ID");
  }
  if (parseInt(userId) === currentUserId) {
    throw new Error("Cannot perform this action on yourself");
  }
};

//! sendFriendRequest
const sendFriendRequest = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    validateUserId(friendId, req.user.id);

    const friend = await User.findByPk(friendId);
    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, friendId },
          { userId: friendId, friendId: req.user.id }
        ]
      }
    });

    if (existing) {
      const errorMsg = existing.status === 'blocked'
        ? "This friendship is blocked"
        : existing.status === 'pending'
        ? "Friend request already pending"
        : "You are already friends";

      return res.status(400).json({ error: errorMsg });
    }

    const friendship = await Friendship.create({
      userId: req.user.id,
      friendId,
      status: 'pending',
      actionUserId: req.user.id
    });

    await Notification.create({
      userId: friendId,
      type: 'friend_request',
      senderId: req.user.id,
      isRead: false,
      metadata: { friendshipId: friendship.id }
    });

    req.io.to(`user_${friendId}`).emit('friend_request', {
      from: req.user.id,
      friendshipId: friendship.id
    });

// In your controller
// In your controller
res.status(201).json({
  message: "Friend request sent",
  friendship: {
    id: friendship.id,
    from: req.user.id,    // Explicitly add
    to: friendId,         // This is what your UI expects
    friendId: friendId,   // Keep original field
    userId: req.user.id,  // Keep original field
    status: friendship.status,
    actionUserId: friendship.actionUserId,
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt
  }
});
 
  } catch (error) {
    next(error);
  }
};


//! Cancel a sent friend request
const cancelFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        userId: req.user.id,
        status: 'pending'
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friend request not found or already processed" });
    }

    await friendship.destroy();

    // Notify the recipient if they're online
    req.io.to(`user_${friendship.friendId}`).emit('friend_request_cancelled', {
      friendshipId: friendship.id,
      cancelledBy: req.user.id
    });

    res.status(200).json({
      message: "Friend request cancelled successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Get pending friend requests (received)
const getPendingRequests = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);

    const result = await Friendship.findAndCountAll({
      where: {
        friendId: req.user.id,
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'requester',
        attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const response = getPagingData(result, page, limit);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get sent friend requests
const getSentRequests = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);

    const result = await Friendship.findAndCountAll({
      where: {
        userId: req.user.id,
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'requested',
        attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const response = getPagingData(result, page, limit);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Accept a friend request
const acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        friendId: req.user.id,
        status: 'pending'
      },
      include: [
        { model: User, as: 'requester' }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    await friendship.update({
      status: 'accepted',
      actionUserId: req.user.id
    });

    // Notification to requester
    await Notification.create({
      userId: friendship.userId,
      type: 'friend_request_accepted',
      senderId: req.user.id,
      isRead: false
    });

    // Create chat room if it doesn't exist
    await Chat.findOrCreate({
      where: {
        type: 'dm',
        participants: {
          [Op.and]: [
            { [Op.contains]: [friendship.userId] },
            { [Op.contains]: [friendship.friendId] }
          ]
        }
      },
      defaults: {
        participants: [friendship.userId, friendship.friendId],
        lastMessageAt: new Date()
      }
    });

    // Real-time update
    req.io.to(`user_${friendship.userId}`).emit('friend_request_accepted', {
      friendshipId: friendship.id,
      acceptedBy: req.user.id
    });

    res.status(200).json({
      message: "Friend request accepted",
      friendship
    });
  } catch (error) {
    next(error);
  }
};

// Reject a friend request
const rejectFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        friendId: req.user.id,
        status: 'pending'
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    await friendship.update({
      status: 'rejected',
      actionUserId: req.user.id
    });

    res.status(200).json({
      message: "Friend request rejected",
      friendship
    });
  } catch (error) {
    next(error);
  }
};

// List all friends with pagination
const listFriends = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id; // Use param or current user
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);

    const result = await Friendship.findAndCountAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userId: targetUserId },
          { friendId: targetUserId }
        ]
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive']
        },
        {
          model: User,
          as: 'requested',
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive']
        }
      ],
      limit,
      offset,
      order: [['acceptedAt', 'DESC']]
    });

    const formattedFriends = result.rows.map(friendship => {
      return friendship.userId === targetUserId 
        ? friendship.requested 
        : friendship.requester;
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      payload: getPagingData({
        count: result.count,
        rows: formattedFriends
      }, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// Check friendship status with another user
const checkFriendshipStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    validateUserId(userId, req.user.id);

    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, friendId: userId },
          { userId: userId, friendId: req.user.id }
        ]
      },
      attributes: ['id', 'status', 'actionUserId', 'createdAt', 'acceptedAt']
    });

    const status = friendship ? friendship.status : 'none';
    const direction = friendship ? 
      (friendship.userId === req.user.id ? 'outgoing' : 'incoming') : 
      null;

    res.status(200).json({
      status,
      direction,
      friendship
    });
  } catch (error) {
    next(error);
  }
};

// Remove a friendship
const removeFriendship = async (req, res, next) => {
  try {
    const { friendshipId } = req.params;

    const friendship = await Friendship.findOne({
      where: {
        id: friendshipId,
        [Op.or]: [
          { userId: req.user.id },
          { friendId: req.user.id }
        ],
        status: 'accepted'
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    // Delete the friendship record
    await friendship.destroy();

    // Update chat
    await Chat.destroy({
      where: {
        type: 'dm',
        participants: {
          [Op.and]: [
            { [Op.contains]: [friendship.userId] },
            { [Op.contains]: [friendship.friendId] }
          ]
        }
      }
    });

    // Notify the other user if they're online
    const otherUserId = friendship.userId === req.user.id 
      ? friendship.friendId 
      : friendship.userId;

    req.io.to(`user_${otherUserId}`).emit('friendship_removed', {
      friendshipId: friendship.id,
      removedBy: req.user.id
    });

    res.status(200).json({
      message: "Friendship removed successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Block a user
const blockUser = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    validateUserId(friendId, req.user.id);

    // Check if user exists
    const friend = await User.findByPk(friendId);
    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    const [friendship, created] = await Friendship.findOrCreate({
      where: {
        [Op.or]: [
          { userId: req.user.id, friendId },
          { userId: friendId, friendId: req.user.id }
        ]
      },
      defaults: {
        userId: req.user.id,
        friendId,
        status: 'blocked',
        actionUserId: req.user.id
      }
    });

    if (!created) {
      friendship.status = 'blocked';
      friendship.actionUserId = req.user.id;
      await friendship.save();
    }

    // Delete any existing chat
    await Chat.destroy({
      where: {
        type: 'dm',
        participants: {
          [Op.and]: [
            { [Op.contains]: [req.user.id] },
            { [Op.contains]: [friendId] }
          ]
        }
      }
    });

    res.status(200).json({
      message: "User blocked successfully",
      friendship
    });
  } catch (error) {
    next(error);
  }
};

// Unblock a user
const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    validateUserId(userId, req.user.id);

    const friendship = await Friendship.findOne({
      where: {
        userId: req.user.id,
        friendId: userId,
        status: 'blocked'
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Blocked user not found" });
    }

    await friendship.destroy();

    res.status(200).json({
      message: "User unblocked successfully"
    });
  } catch (error) {
    next(error);
  }
};

// 🔥 NEW MUTUAL FRIENDS FUNCTION ====================================
// const getMutualFriends = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, size = 10 } = req.query;
//     const { limit, offset } = getPagination(page, size);

//     validateUserId(userId, req.user.id);

//     // Get both users' friend IDs
//     const [currentUserFriends, targetUserFriends] = await Promise.all([
//       getFriendIds(req.user.id),
//       getFriendIds(userId)
//     ]);

//     // Find intersection (mutual friends)
//     const mutualFriendIds = currentUserFriends.filter(id => 
//       targetUserFriends.includes(id)
//     );

//     // Get paginated mutual friends with details
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

//     const response = getPagingData({ count, rows }, page, limit);
//     res.status(200).json(response);
    
//   } catch (error) {
//     next(error);
//   }
// };

// friendshipController.js
const getFriendIds = async (userId) => {
  const friendships = await Friendship.findAll({
    where: {
      status: 'accepted',
      [Op.or]: [
        { userId },
        { friendId: userId }
      ]
    },
    attributes: ['userId', 'friendId']
  });

  return friendships.map(f => 
    f.userId === userId ? f.friendId : f.userId
  );
};

const getMutualFriends = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);

    validateUserId(userId, req.user.id);

    // Get both users' friend IDs
    const [currentUserFriends, targetUserFriends] = await Promise.all([
      getFriendIds(req.user.id),
      getFriendIds(userId)
    ]);

    // Find intersection (mutual friends)
    const mutualFriendIds = currentUserFriends.filter(id => 
      targetUserFriends.includes(id)
    );

    // Get paginated mutual friends with details
    const { count, rows } = await User.findAndCountAll({
      where: {
        id: {
          [Op.in]: mutualFriendIds
        }
      },
      attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive'],
      limit,
      offset,
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.status(200).json({
      success: true,
      payload: getPagingData({ count, rows }, page, limit)
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendFriendRequest,
  cancelFriendRequest,
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  listFriends,
  checkFriendshipStatus,
  removeFriendship,
  blockUser,
  unblockUser,
  getFriendIds,
  getMutualFriends
};