/**
 * FRIENDSHIP CONTROLLER
 * 
 * Handles all friend-related operations including:
 * - Sending/canceling friend requests
 * - Accepting/rejecting requests
 * - Friendship management
 * - Blocking/unblocking users
 * 
 * Color Legend:
 * 🔵 Blue: Core functionality
 * 🟢 Green: Helper/utility functions
 * 🟣 Purple: Database operations
 * 🟠 Orange: Notification/real-time events
 * 🔴 Red: Error handling
 */

// const { Friendship, User, Notification, Chat } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../helper/pagination');
const Friendship = require('../models/friendshipModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Chat = require('../models/chatModel');

// 🟢 CONSTANTS & CONFIGURATION ====================================
const MAX_PENDING_REQUESTS = 500; // Max pending requests per user
const REQUEST_EXPIRY_DAYS = 30;   // Request expires after 30 days
const COOLING_PERIOD_DAYS = 7;    // Cooldown after rejection
const FRIENDS_PER_PAGE = 10;      // Default pagination size

// 🟢 HELPER FUNCTIONS =============================================

/**
 * Validate user ID and prevent self-actions
 * @throws Error if validation fails
 */
const validateUserId = (userId, currentUserId) => {
  if (!userId || isNaN(userId)) {
    throw new Error("Invalid user ID");
  }
  if (parseInt(userId) === currentUserId) {
    throw new Error("Cannot perform this action on yourself");
  }
};

/**
 * Get all friend IDs for a user (accepted friendships only)
 */
const getFriendIds = async (userId) => {
  const friendships = await Friendship .findAll({
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

// 🔵 FRIEND REQUEST MANAGEMENT ===================================

/**
 * 🔵 Send Friend Request
 * 
 * Flow:
 * 1. Validate input
 * 2. Check request limits
 * 3. Check existing relationship
 * 4. Create/update request
 * 5. Send notification
 */
const sendFriendRequest = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    validateUserId(friendId, req.user.id);

    // 🟣 Check request limits
    const pendingCount = await Friendship.count({
      where: { 
        userId: req.user.id, 
        status: 'pending',
        createdAt: { [Op.gt]: new Date(Date.now() - REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000) }
      }
    });

    if (pendingCount >= MAX_PENDING_REQUESTS) {
      return res.status(429).json({ 
        code: 'REQUEST_LIMIT_EXCEEDED',
        message: "You have too many pending requests" 
      });
    }

    // 🟣 Check existing relationship
    const [friend, existing] = await Promise.all([
      User.findByPk(friendId),
      Friendship.findOne({
        where: {
          [Op.or]: [
            { userId: req.user.id, friendId },
            { userId: friendId, friendId: req.user.id }
          ]
        }
      })
    ]);

    // 🔴 Validate
    if (!friend) return res.status(404).json({ error: "User not found" });

    if (existing) {
      switch (existing.status) {
        case 'pending':
          return res.status(400).json({ 
            code: 'REQUEST_PENDING',
            message: existing.userId === req.user.id 
              ? "Your request is still pending" 
              : "This user already sent you a request"
          });
          
        case 'accepted':
          return res.status(400).json({ 
            code: 'ALREADY_FRIENDS', 
            message: "You are already friends" 
          });
          
        case 'rejected':
          if (existing.coolingPeriod > new Date()) {
            return res.status(400).json({
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

    // 🟣 Create/Update friendship record
    const [friendship, created] = existing 
      ? [
          await existing.update({
            status: 'pending',
            actionUserId: req.user.id,
            requestCount: (existing.requestCount || 1) + 1,
            expiresAt: new Date(Date.now() + REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
          }),
          false
        ]
      : [
          await Friendship.create({
            userId: req.user.id,
            friendId,
            status: 'pending',
            actionUserId: req.user.id,
            requestCount: 1,
            expiresAt: new Date(Date.now() + REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
          }),
          true
        ];

    // 🟠 Create notification and real-time event
    try {
      await Notification.create({
        userId: friendId,
        type: 'friend_request',
        senderId: req.user.id,
        message: friendship.requestCount > 1 
          ? `${req.user.firstName} resent a friend request` 
          : `${req.user.firstName} sent a friend request`,
        metadata: { 
          friendshipId: friendship.id,
          requestCount: friendship.requestCount
        }
      });

      if (req.io) {
        req.io.to(`user_${friendId}`).emit('friend_request', {
          from: req.user.id,
          friendshipId: friendship.id
        });
      }
    } catch (notificationError) {
      console.error('Notification creation failed:', notificationError);
      // Continue even if notification fails since friendship was created
    }

    return res.status(201).json({
      message: created ? "Friend request sent" : "Friend request updated",
      friendship
    });

  } catch (error) {
    console.error('Friend request error:', error);
    // Ensure we don't send headers twice
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
};

/**
 * 🔵 Cancel Friend Request
 * 
 * Flow:
 * 1. Find pending request
 * 2. Validate ownership
 * 3. Delete request
 * 4. Notify recipient
 */
const cancelFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    // 🟣 Find the pending request
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

    // 🟣 Delete the request
    await friendship.destroy();

    // 🟠 Notify the recipient if they're online
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

/**
 * 🔵 Accept Friend Request
 * 
 * Flow:
 * 1. Find pending request
 * 2. Validate recipient
 * 3. Update status
 * 4. Create mutual friendship
 * 5. Create DM chat
 * 6. Send notifications
 */
const acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    // 🟣 Find the pending request
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
      return res.status(404).json({ error: "Friend request not found or already processed" });
    }

    // 🔴 Prevent self-acceptance
    if (friendship.userId === req.user.id) {
      return res.status(400).json({ error: "Cannot accept your own request" });
    }

    // 🟣 Update friendship status
    await friendship.update({
      status: 'accepted',
      actionUserId: req.user.id,
      acceptedAt: new Date()
    });

    // 🟣 Create mutual friendship record
    await Friendship.findOrCreate({
      where: {
        userId: req.user.id,
        friendId: friendship.userId
      },
      defaults: {
        status: 'accepted',
        actionUserId: req.user.id,
        acceptedAt: new Date()
      }
    });

    // 🟣🟠 Create notifications and chat in parallel
    await Promise.all([
      Notification.create({
        userId: friendship.userId,
        type: 'friend_request_accepted',
        senderId: req.user.id,
        message: `${req.user.firstName} accepted your friend request`,
        metadata: {
          friendshipId: friendship.id,
          action: 'accept'
        }
      }),
      Chat.findOrCreate({
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
      })
    ]);

    // 🟠 Send real-time event
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

/**
 * 🔵 Reject Friend Request
 * 
 * Flow:
 * 1. Find pending request
 * 2. Validate recipient
 * 3. Update status with cooling period
 */
const rejectFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    // 🟣 Find the pending request
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

    // 🟣 Update with rejection and cooling period
    await friendship.update({
      status: 'rejected',
      actionUserId: req.user.id,
      coolingPeriod: new Date(Date.now() + COOLING_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    });

    res.status(200).json({
      message: "Friend request rejected",
      friendship
    });
  } catch (error) {
    next(error);
  }
};

// 🔵 FRIENDSHIP MANAGEMENT =======================================

/**
 * 🔵 Remove Friendship
 * 
 * Flow:
 * 1. Find friendship
 * 2. Validate participation
 * 3. Delete friendship
 * 4. Remove DM chat
 * 5. Notify other user
 */
const removeFriendship = async (req, res, next) => {
  try {
    const { friendshipId } = req.params;

    // 🟣 Find the friendship
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

    // 🟣 Delete the friendship record
    await friendship.destroy();

    // 🟣 Remove associated DM chat
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

    // 🟠 Notify the other user if they're online
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

// 🔵 BLOCK MANAGEMENT ============================================

/**
 * 🔵 Block User
 * 
 * Flow:
 * 1. Validate user
 * 2. Create/update blocked status
 * 3. Remove any existing friendship/DM
 */
const blockUser = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    validateUserId(friendId, req.user.id);

    // 🟣 Check if user exists
    const friend = await User.findByPk(friendId);
    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🟣 Create or update block status
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

    // 🟣 Delete any existing chat
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

/**
 * 🔵 Unblock User
 * 
 * Flow:
 * 1. Find block record
 * 2. Validate ownership
 * 3. Remove block
 */
const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    validateUserId(userId, req.user.id);

    // 🟣 Find the block record
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

    // 🟣 Remove the block
    await friendship.destroy();

    res.status(200).json({
      message: "User unblocked successfully"
    });
  } catch (error) {
    next(error);
  }
};

// 🔵 QUERY METHODS ===============================================

/**
 * 🔵 Get Pending Friend Requests (Received)
 */
const getPendingRequests = async (req, res, next) => {
  try {
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);

    // 🟣 Get paginated pending requests
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

/**
 * 🔵 Get Sent Friend Requests
 */
const getSentRequests = async (req, res, next) => {
  try {
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);

    // 🟣 Get paginated sent requests
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

/**
 * 🔵 List Friends with Pagination
 */
const listFriends = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);

    // 🟣 Get paginated friends list
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

    // Format friends list
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

/**
 * 🔵 Check Friendship Status
 */
const checkFriendshipStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    validateUserId(userId, req.user.id);

    // 🟣 Get friendship status
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

/**
 * 🔵 Get Mutual Friends
 */
const getMutualFriends = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, size = FRIENDS_PER_PAGE } = req.query;
    const { limit, offset } = getPagination(page, size);

    validateUserId(userId, req.user.id);

    // 🟣 Get both users' friend IDs
    const [currentUserFriends, targetUserFriends] = await Promise.all([
      getFriendIds(req.user.id),
      getFriendIds(userId)
    ]);

    // Find intersection (mutual friends)
    const mutualFriendIds = currentUserFriends.filter(id => 
      targetUserFriends.includes(id)
    );

    // 🟣 Get paginated mutual friends with details
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

// 🟢 MAINTENANCE FUNCTIONS =======================================

/**
 * 🟢 Cleanup Expired Requests (for scheduled jobs)
 */
const cleanupExpiredRequests = async () => {
  try {
    const result = await Friendship.destroy({
      where: {
        status: 'pending',
        expiresAt: { [Op.lt]: new Date() }
      }
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
  getMutualFriends,
  cleanupExpiredRequests
};





//! old
// const { Friendship, User, Notification, Chat } = require('../models');
// const { Op } = require('sequelize');
// const { getPagination, getPagingData } = require('../helper/pagination');

// const validateUserId = (userId, currentUserId) => {
//   if (!userId || isNaN(userId)) {
//     throw new Error("Invalid user ID");
//   }
//   if (parseInt(userId) === currentUserId) {
//     throw new Error("Cannot perform this action on yourself");
//   }
// };

// //! sendFriendRequest
// /**
//  * Send a friend request to another user
//  */
// // const sendFriendRequest = async (req, res, next) => {
// //   try {
// //     const { friendId } = req.body;
// //     validateUserId(friendId, req.user.id);

// //     const [friend, existingFriendship] = await Promise.all([
// //       User.findByPk(friendId),
// //       Friendship.findOne({
// //         where: {
// //           [Op.or]: [
// //             { userId: req.user.id, friendId },
// //             { userId: friendId, friendId: req.user.id }
// //           ]
// //         }
// //       })
// //     ]);

// //     if (!friend) {
// //       return res.status(404).json({ error: "User not found" });
// //     }

// //     if (existingFriendship) {
// //       const errorMessages = {
// //         blocked: "This friendship is blocked",
// //         pending: "Friend request already pending",
// //         accepted: "You are already friends"
// //       };
      
// //       return res.status(400).json({ 
// //         error: errorMessages[existingFriendship.status] || "Friendship already exists" 
// //       });
// //     }

// //     const friendship = await Friendship.create({
// //       userId: req.user.id,
// //       friendId,
// //       status: 'pending',
// //       actionUserId: req.user.id
// //     });

// //     await createFriendshipNotification({
// //       userId: friendId,
// //       type: 'friend_request',
// //       senderId: req.user.id,
// //       metadata: { 
// //         friendshipId: friendship.id,
// //         action: 'request'
// //       }
// //     });

// //     req.io.to(`user_${friendId}`).emit('friend_request', {
// //       from: req.user.id,
// //       friendshipId: friendship.id
// //     });

// //     res.status(201).json({
// //       message: "Friend request sent",
// //       friendship: {
// //         ...friendship.toJSON(),
// //         from: req.user.id,
// //         to: friendId
// //       }
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };


// const sendFriendRequest = async (req, res, next) => {
//   try {
//     const { friendId } = req.body;
//     validateUserId(friendId, req.user.id);

//     // 1. Check existing relationship
//     const [friend, existing] = await Promise.all([
//       User.findByPk(friendId),
//       Friendship.findOne({
//         where: {
//           [Op.or]: [
//             { userId: req.user.id, friendId },
//             { userId: friendId, friendId: req.user.id }
//           ]
//         }
//       })
//     ]);

//     // 2. Validate
//     if (!friend) return res.status(404).json({ error: "User not found" });

//     if (existing) {
//       switch (existing.status) {
//         case 'pending':
//           return res.status(400).json({ 
//             code: 'REQUEST_PENDING',
//             message: existing.userId === req.user.id 
//               ? "Your request is still pending" 
//               : "This user already sent you a request"
//           });
          
//         case 'accepted':
//           return res.status(400).json({ 
//             code: 'ALREADY_FRIENDS', 
//             message: "You are already friends" 
//           });
          
//         case 'rejected':
//           if (existing.coolingPeriod > new Date()) {
//             return res.status(400).json({
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

//     // 3. Create/Update
//     const [friendship, created] = existing 
//       ? [
//           await existing.update({
//             status: 'pending',
//             actionUserId: req.user.id,
//             requestCount: existing.requestCount + 1
//           }),
//           false
//         ]
//       : [
//           await Friendship.create({
//             userId: req.user.id,
//             friendId,
//             status: 'pending',
//             actionUserId: req.user.id
//           }),
//           true
//         ];

//     // 4. Notify (only if new request)
//     if (created) {
//       await Notification.create({
//         userId: friendId,
//         type: 'friend_request',
//         senderId: req.user.id,
//         metadata: { 
//           friendshipId: friendship.id,
//           requestCount: 1
//         }
//       });

//       req.io.to(`user_${friendId}`).emit('friend_request', {
//         from: req.user.id,
//         friendshipId: friendship.id
//       });
//     }

//     res.status(201).json({
//       message: created ? "Friend request sent" : "Friend request updated",
//       friendship
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// //! Cancel a sent friend request
// const cancelFriendRequest = async (req, res, next) => {
//   try {
//     const { requestId } = req.params;

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

//     await friendship.destroy();

//     // Notify the recipient if they're online
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

// // Get pending friend requests (received)
// const getPendingRequests = async (req, res, next) => {
//   try {
//     const { page = 1, size = 10 } = req.query;
//     const { limit, offset } = getPagination(page, size);

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

// // Get sent friend requests
// const getSentRequests = async (req, res, next) => {
//   try {
//     const { page = 1, size = 10 } = req.query;
//     const { limit, offset } = getPagination(page, size);

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
//  * Accept a friend request
//  */
// const acceptFriendRequest = async (req, res, next) => {
//   try {
//     const { requestId } = req.params;

//     const friendship = await Friendship.findOne({
//       where: {
//         id: requestId,
//         friendId: req.user.id,
//         status: 'pending'
//       },
//       include: [
//         { model: User, as: 'requester' }
//       ]
//     });

//     if (!friendship) {
//       return res.status(404).json({ error: "Friend request not found or already processed" });
//     }

//     await friendship.update({
//       status: 'accepted',
//       actionUserId: req.user.id
//     });

//     // Create notifications and chat in parallel
//     await Promise.all([
//       createFriendshipNotification({
//         userId: friendship.userId,
//         type: 'friend_request_accepted',
//         senderId: req.user.id,
//         metadata: {
//           friendshipId: friendship.id,
//           action: 'accept'
//         }
//       }),
//       Chat.findOrCreate({
//         where: {
//           type: 'dm',
//           participants: {
//             [Op.and]: [
//               { [Op.contains]: [friendship.userId] },
//               { [Op.contains]: [friendship.friendId] }
//             ]
//           }
//         },
//         defaults: {
//           participants: [friendship.userId, friendship.friendId],
//           lastMessageAt: new Date()
//         }
//       })
//     ]);

//     req.io.to(`user_${friendship.userId}`).emit('friend_request_accepted', {
//       friendshipId: friendship.id,
//       acceptedBy: req.user.id
//     });

//     res.status(200).json({
//       message: "Friend request accepted",
//       friendship
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Reject a friend request
// const rejectFriendRequest = async (req, res, next) => {
//   try {
//     const { requestId } = req.params;

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

//     await friendship.update({
//       status: 'rejected',
//       actionUserId: req.user.id
//     });

//     res.status(200).json({
//       message: "Friend request rejected",
//       friendship
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // List all friends with pagination
// const listFriends = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     const targetUserId = userId || req.user.id; // Use param or current user
//     const { page = 1, size = 10 } = req.query;
//     const { limit, offset } = getPagination(page, size);

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

// // Check friendship status with another user
// const checkFriendshipStatus = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     validateUserId(userId, req.user.id);

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

// // Remove a friendship
// const removeFriendship = async (req, res, next) => {
//   try {
//     const { friendshipId } = req.params;

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

//     // Delete the friendship record
//     await friendship.destroy();

//     // Update chat
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

//     // Notify the other user if they're online
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

// // Block a user
// const blockUser = async (req, res, next) => {
//   try {
//     const { friendId } = req.body;
//     validateUserId(friendId, req.user.id);

//     // Check if user exists
//     const friend = await User.findByPk(friendId);
//     if (!friend) {
//       return res.status(404).json({ error: "User not found" });
//     }

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

//     // Delete any existing chat
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

// // Unblock a user
// const unblockUser = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     validateUserId(userId, req.user.id);

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

//     await friendship.destroy();

//     res.status(200).json({
//       message: "User unblocked successfully"
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getFriendIds = async (userId) => {
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

//   return friendships.map(f => 
//     f.userId === userId ? f.friendId : f.userId
//   );
// };

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

//     res.status(200).json({
//       success: true,
//       payload: getPagingData({ count, rows }, page, limit)
//     });
    
//   } catch (error) {
//     next(error);
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
//   getMutualFriends
// };