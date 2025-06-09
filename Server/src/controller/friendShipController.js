// const { Op } = require('sequelize');
// const { getPagination, getPagingData } = require('../helper/pagination');
// const Friendship = require('../models/friendshipModel');
// const User = require('../models/userModel');
// const Notification = require('../models/notificationModel');
// const Chat = require('../models/chatModel');
// const logger = require('../config/logger');


// // Constants
// const MAX_PENDING_REQUESTS = 500;
// const REQUEST_EXPIRY_DAYS = 30;
// const COOLING_PERIOD_DAYS = 7;
// const FRIENDS_PER_PAGE = 10;
// const SUGGESTIONS_LIMIT = 20;
// const FRIENDSHIP_TIERS = ['regular', 'close', 'family', 'work'];
// const FRIENDSHIP_STATUSES = ['pending', 'accepted', 'rejected', 'blocked'];

// // Helper Functions
// const validateUserId = (userId, currentUserId) => {
//   if (!userId || isNaN(Number(userId))) {
//     throw new Error('Invalid user ID format');
//   }
//   if (Number(userId) === Number(currentUserId)) {
//     throw new Error('Cannot perform this action on yourself');
//   }
// };

// const validateFriendshipStatus = (status) => {
//   if (!FRIENDSHIP_STATUSES.includes(status)) {
//     throw new Error('Invalid friendship status');
//   }
// };

// const getFriendIds = async (userId) => {
//   const friendships = await Friendship.findAll({
//     where: {
//       status: 'accepted',
//       [Op.or]: [{ userId }, { friendId: userId }],
//     },
//     attributes: ['userId', 'friendId'],
//   });

//   return friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));
// };

// const formatFriendshipResponse = (friendship, currentUserId) => {
//   const friend =
//     friendship.userId === currentUserId
//       ? friendship.requested
//       : friendship.requester;
//   return {
//     id: friendship.id,
//     status: friendship.status,
//     tier: friendship.tier,
//     customLabel: friendship.customLabel,
//     createdAt: friendship.createdAt,
//     acceptedAt: friendship.acceptedAt,
//     friend: {
//       id: friend.id,
//       firstName: friend.firstName,
//       lastName: friend.lastName,
//       profileImage: friend.profileImage,
//       lastActive: friend.lastActive,
//     },
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

// // Controller Functions
//  //! 🔵 Send Friend Request
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

// // acceptFriendRequest
// const acceptFriendRequest = async (req, res) => {
//   const { requestId } = req.params;
//   const currentUserId = req.user.id;

//   if (isNaN(Number(requestId))) {
//     return res.status(400).json({
//       code: 'INVALID_ID',
//       message: 'Request ID must be a number',
//       receivedId: requestId,
//     });
//   }

//   try {
//     const request = await Friendship.findByPk(Number(requestId));

//     if (!request) {
//       return res.status(404).json({
//         code: 'REQUEST_NOT_FOUND',
//         message: 'Friendship request not found',
//         debug: { requestId, currentUserId },
//       });
//     }

//     if (request.userId === currentUserId) {
//       return res.status(400).json({
//         code: 'SELF_ACCEPT',
//         message: 'Cannot accept your own friend request',
//         solution: 'The recipient should accept this request',
//         debug: {
//           requestStatus: request.status,
//           sender: request.userId,
//           currentUser: currentUserId,
//         },
//       });
//     }

//     if (request.friendId !== currentUserId) {
//       return res.status(403).json({
//         code: 'NOT_RECIPIENT',
//         message: `Only user ${request.friendId} can accept this request`,
//         requiredRecipient: request.friendId,
//         debug: {
//           currentUser: currentUserId,
//           expectedRecipient: request.friendId,
//         },
//       });
//     }

//     if (request.status !== Friendship.Status.PENDING) {
//       return res.status(400).json({
//         code: 'INVALID_STATUS',
//         message: `Request is already ${request.status}`,
//         validStatuses: [Friendship.Status.PENDING],
//         debug: {
//           currentStatus: request.status,
//           acceptedAt: request.acceptedAt,
//         },
//       });
//     }

//     const [requester, recipient] = await Promise.all([
//       User.findByPk(request.userId),
//       User.findByPk(request.friendId),
//     ]);

//     await sequelize.transaction(async (t) => {
//       await request.update(
//         {
//           status: Friendship.Status.ACCEPTED,
//           acceptedAt: new Date(),
//           actionUserId: currentUserId,
//         },
//         { transaction: t }
//       );

//       // OPTIONAL: Only if you want to store the reverse friendship
//       // const reverseFriendship = await Friendship.findOne({
//       //   where: { userId: currentUserId, friendId: request.userId },
//       //   transaction: t,
//       // });
//       // if (!reverseFriendship) {
//       //   await Friendship.create(
//       //     {
//       //       userId: currentUserId,
//       //       friendId: request.userId,
//       //       status: Friendship.Status.ACCEPTED,
//       //       acceptedAt: new Date(),
//       //       actionUserId: currentUserId,
//       //     },
//       //     { transaction: t }
//       //   );
//       // }
//     });

//     return res.json({
//       message: 'Friend request accepted successfully',
//       data: {
//         friendship: {
//           id: request.id,
//           status: Friendship.Status.ACCEPTED,
//           requester: {
//             id: requester.id,
//             name: requester.name,
//           },
//           recipient: {
//             id: recipient.id,
//             name: recipient.name,
//           },
//         },
//       },
//       metadata: {
//         timestamp: new Date().toISOString(),
//         requestId: request.id,
//       },
//     });
//   } catch (error) {
//     console.error('Accept friend request error:', {
//       error: error.message,
//       stack: error.stack,
//       requestId,
//       currentUserId,
//       timestamp: new Date().toISOString(),
//     });

//     return res.status(500).json({
//       code: 'SERVER_ERROR',
//       message: 'Failed to process friend request acceptance',
//       error:
//         process.env.NODE_ENV === 'development'
//           ? {
//               message: error.message,
//               stack: error.stack,
//             }
//           : undefined,
//       debug: {
//         requestId,
//         timestamp: new Date().toISOString(),
//       },
//     });
//   }
// };


//! refactor version
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../helper/pagination');
const Friendship = require('../models/friendshipModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Chat = require('../models/chatModel');
const logger = require('../config/logger');

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
//  //! 🔵 Send Friend Request
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



// const acceptFriendRequest = async (req, res) => {
//   const { friendshipId } = req.params;
//   const currentUserId = req.user.id;

//   if (isNaN(Number(friendshipId))) {
//     return res.status(400).json({
//       code: 'INVALID_ID',
//       message: 'Friendship ID must be a number',
//       receivedId: friendshipId,
//     });
//   }

//   try {
//     const request = await Friendship.findByPk(Number(friendshipId), {
//       include: [
//         { model: User, as: 'requester' },
//         { model: User, as: 'requested' }
//       ]
//     });

//     if (!request) {
//       return res.status(404).json({
//         code: 'REQUEST_NOT_FOUND',
//         message: 'Friendship request not found',
//         debug: { friendshipId, currentUserId },
//       });
//     }

//     if (request.userId === currentUserId) {
//       return res.status(400).json({
//         code: 'SELF_ACCEPT',
//         message: 'Cannot accept your own friend request',
//         solution: 'The recipient should accept this request',
//         debug: {
//           requestStatus: request.status,
//           sender: request.userId,
//           currentUser: currentUserId,
//         },
//       });
//     }

//     if (request.friendId !== currentUserId) {
//       return res.status(403).json({
//         code: 'NOT_RECIPIENT',
//         message: `Only user ${request.friendId} can accept this request`,
//         requiredRecipient: request.friendId,
//         debug: {
//           currentUser: currentUserId,
//           expectedRecipient: request.friendId,
//         },
//       });
//     }

//     if (request.status !== 'pending') {
//       return res.status(400).json({
//         code: 'INVALID_STATUS',
//         message: `Request is already ${request.status}`,
//         validStatuses: ['pending'],
//         debug: {
//           currentStatus: request.status,
//           acceptedAt: request.acceptedAt,
//         },
//       });
//     }

//     // Update the friendship status
//     await request.update({
//       status: 'accepted',
//       acceptedAt: new Date(),
//       actionUserId: currentUserId,
//     });

//     // Create acceptance notification
//     await Notification.create({
//       userId: request.userId,
//       type: 'friend_request_accepted',
//       senderId: currentUserId,
//       message: `${request.requested.firstName} accepted your friend request`,
//       metadata: {
//         friendshipId: request.id,
//         senderName: request.requested.firstName + ' ' + request.requested.lastName,
//         avatarUrl: request.requested.profileImage
//       }
//     });

//     return res.json({
//       message: 'Friend request accepted successfully',
//       data: {
//         friendship: formatFriendshipResponse(request, currentUserId)
//       },
//       metadata: {
//         timestamp: new Date().toISOString(),
//         friendshipId: request.id,
//       },
//     });
//   } catch (error) {
//     logger.error('Accept friend request error:', {
//       error: error.message,
//       stack: error.stack,
//       friendshipId,
//       currentUserId,
//       timestamp: new Date().toISOString(),
//     });

//     return res.status(500).json({
//       code: 'SERVER_ERROR',
//       message: 'Failed to process friend request acceptance',
//       error: process.env.NODE_ENV === 'development' ? {
//         message: error.message,
//         stack: error.stack,
//       } : undefined,
//       debug: {
//         friendshipId,
//         timestamp: new Date().toISOString(),
//       },
//     });
//   }
// };

const acceptFriendRequest = async (req, res) => {
  const { friendshipId } = req.params;
  const currentUserId = req.user.id;

  // Validate friendshipId
  if (isNaN(Number(friendshipId))) {
    return res.status(400).json({
      code: 'INVALID_ID',
      message: 'Friendship ID must be a number',
      receivedId: friendshipId,
    });
  }

  try {
    // Find the friendship request with proper associations
    const request = await Friendship.findByPk(Number(friendshipId), {
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
      ]
    });

    if (!request) {
      return res.status(404).json({
        code: 'REQUEST_NOT_FOUND',
        message: 'Friendship request not found',
        friendshipId,
        currentUserId,
      });
    }

    // Verify the current user is the recipient
    if (request.requestedId !== currentUserId) {
      return res.status(403).json({
        code: 'NOT_RECIPIENT',
        message: `Only the recipient can accept this request`,
        requiredRecipient: request.requestedId,
        currentUser: currentUserId,
      });
    }

    // Check request status
    if (request.status !== 'pending') {
      return res.status(400).json({
        code: 'INVALID_STATUS',
        message: `Cannot accept request that is ${request.status}`,
        currentStatus: request.status,
      });
    }

    // Transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // Update friendship status
      const updatedRequest = await request.update({
        status: 'accepted',
        acceptedAt: new Date(),
        actionUserId: currentUserId,
      }, { transaction: t });

      // Create acceptance notification
      await Notification.create({
        userId: request.requesterId, // Notify the requester
        senderId: currentUserId,
        type: 'friend_request_accepted',
        friendshipId: request.id,
        metadata: {
          senderName: `${request.requested.firstName} ${request.requested.lastName}`,
          avatarUrl: request.requested.profileImage,
          message: `${request.requested.firstName} accepted your friend request`
        }
      }, { transaction: t });

      return updatedRequest;
    });

    // Format response
    return res.json({
      success: true,
      message: 'Friend request accepted successfully',
      data: {
        friendship: {
          id: result.id,
          status: result.status,
          requester: {
            id: request.requester.id,
            name: `${request.requester.firstName} ${request.requester.lastName}`,
            avatar: request.requester.profileImage
          },
          requested: {
            id: request.requested.id,
            name: `${request.requested.firstName} ${request.requested.lastName}`,
            avatar: request.requested.profileImage
          },
          acceptedAt: result.acceptedAt
        }
      }
    });

  } catch (error) {
    console.error(`Error accepting friend request ${friendshipId}:`, error);
    
    return res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'An error occurred while processing your request',
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

  // Input validation
  if (isNaN(Number(friendshipId))) {
    return res.status(400).json({
      code: 'INVALID_ID',
      message: 'Friendship ID must be a number',
      receivedId: friendshipId,
    });
  }

  try {
    const request = await Friendship.findOne({
      where: {
        id: Number(friendshipId),
        friendId: currentUserId,
        status: 'pending'
      },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'profileImage'] },
        { model: User, as: 'requested', attributes: ['id', 'firstName', 'lastName', 'profileImage'] }
      ]
    });

    if (!request) {
      return res.status(404).json({
        code: 'REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed',
        debug: {
          possibleReasons: [
            'Friendship ID does not exist',
            'Request already accepted/rejected',
            'Current user is not the recipient'
          ],
          friendshipId,
          currentUserId
        }
      });
    }

    // Update the request status with cooling period
    const coolingPeriod = new Date();
    coolingPeriod.setDate(coolingPeriod.getDate() + COOLING_PERIOD_DAYS);

    await request.update({
      status: 'rejected',
      actionUserId: currentUserId,
      coolingPeriod,
      updatedAt: new Date()
    });

    // Create rejection notification
    const notificationPayload = {
      userId: request.userId,
      type: 'friend_request_rejected',
      senderId: currentUserId,
      message: `${request.requested.firstName} declined your friend request`,
      metadata: {
        friendshipId: request.id,
        senderName: `${request.requested.firstName} ${request.requested.lastName}`,
        avatarUrl: request.requested.profileImage,
        coolingPeriodDays: COOLING_PERIOD_DAYS
      }
    };

    await Notification.create(notificationPayload);

    // Real-time update
    if (req.io) {
      req.io.to(`user_${request.userId}`).emit('friend_request_rejected', {
        friendshipId: request.id,
        rejectedBy: currentUserId,
        coolingPeriod
      });
    }

    return res.status(200).json({
      message: 'Friend request rejected successfully',
      data: formatFriendshipResponse(request, currentUserId),
      metadata: {
        coolingPeriod,
        canResendAfter: coolingPeriod.toISOString()
      }
    });

  } catch (error) {
    logger.error('Error rejecting friend request:', {
      error: error.message,
      stack: error.stack,
      friendshipId,
      currentUserId,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      code: 'REJECTION_FAILED',
      message: 'Failed to process friend request rejection',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      suggestion: 'Please try again later or contact support'
    });
  }
};


const cancelFriendRequest = async (req, res) => {
  const { friendshipId } = req.params;
  const currentUserId = req.user.id;

  if (isNaN(Number(friendshipId))) {
    return res.status(400).json({
      code: 'INVALID_ID',
      message: 'Friendship ID must be a number',
      receivedId: friendshipId,
    });
  }

  try {
    const friendship = await Friendship.findOne({
      where: {
        id: Number(friendshipId),
        userId: currentUserId,
        status: 'pending',
      },
      include: [
        { 
          model: User, 
          as: 'requested',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ]
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'REQUEST_NOT_FOUND',
        message: 'Friend request not found or already processed',
        debug: {
          possibleReasons: [
            'Friendship ID does not exist',
            'Request already processed',
            'Current user is not the sender'
          ],
          friendshipId,
          currentUserId
        }
      });
    }

    await friendship.destroy();

    if (req.io) {
      req.io.to(`user_${friendship.friendId}`).emit('friend_request_cancelled', {
        friendshipId: friendship.id,
        cancelledBy: currentUserId,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      message: 'Friend request cancelled successfully',
      metadata: {
        cancelledAt: new Date().toISOString(),
        recipientId: friendship.friendId
      }
    });
  } catch (error) {
    logger.error('Cancel friend request error:', {
      error: error.message,
      stack: error.stack,
      friendshipId,
      currentUserId,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      code: 'CANCELLATION_FAILED',
      message: 'Failed to cancel friend request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const removeFriendship = async (req, res) => {
  const { friendshipId } = req.params;
  const currentUserId = req.user.id;

  if (isNaN(Number(friendshipId))) {
    return res.status(400).json({
      code: 'INVALID_ID',
      message: 'Friendship ID must be a number',
      receivedId: friendshipId,
    });
  }

  try {
    const friendship = await Friendship.findOne({
      where: {
        id: Number(friendshipId),
        [Op.or]: [{ userId: currentUserId }, { friendId: currentUserId }],
        status: 'accepted',
      },
      include: [
        { 
          model: User, 
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName']
        },
        { 
          model: User, 
          as: 'requested',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'FRIENDSHIP_NOT_FOUND',
        message: 'Friendship not found',
        debug: {
          possibleReasons: [
            'Friendship ID does not exist',
            'Friendship not in accepted status',
            'Current user not part of friendship'
          ],
          friendshipId,
          currentUserId
        }
      });
    }

    const otherUserId = friendship.userId === currentUserId 
      ? friendship.friendId 
      : friendship.userId;

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
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      message: 'Friendship removed successfully',
      metadata: {
        removedAt: new Date().toISOString(),
        formerFriendId: otherUserId
      }
    });
  } catch (error) {
    logger.error('Remove friendship error:', {
      error: error.message,
      stack: error.stack,
      friendshipId,
      currentUserId,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      code: 'REMOVAL_FAILED',
      message: 'Failed to remove friendship',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
          [Op.or]: [
            { userId: currentUserId },
            { friendId: currentUserId },
          ],
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
          [Op.or]: [
            { userId: req.user.id },
            { friendId: req.user.id },
          ],
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
        formatFriendshipResponse(friendship, req.user.id)
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













//! refactor
// const { Op } = require('sequelize');
// const { getPagination, getPagingData } = require('../helper/pagination');
// const Friendship = require('../models/friendshipModel');
// const User = require('../models/userModel');
// const Notification = require('../models/notificationModel');
// const Chat = require('../models/chatModel');
// const logger = require('../config/logger');

// // Constants
// const MAX_PENDING_REQUESTS = 500;
// const REQUEST_EXPIRY_DAYS = 30;
// const COOLING_PERIOD_DAYS = 7;
// const FRIENDS_PER_PAGE = 10;
// const SUGGESTIONS_LIMIT = 20;
// const FRIENDSHIP_TIERS = ['regular', 'close', 'family', 'work'];
// const FRIENDSHIP_STATUSES = ['pending', 'accepted', 'rejected', 'blocked'];

// // Helper Functions
// const validateUserId = (userId, currentUserId) => {
//   if (!userId || isNaN(Number(userId))) {
//     throw new Error('Invalid user ID format');
//   }
//   if (Number(userId) === Number(currentUserId)) {
//     throw new Error('Cannot perform this action on yourself');
//   }
// };

// const validateFriendshipStatus = (status) => {
//   if (!FRIENDSHIP_STATUSES.includes(status)) {
//     throw new Error('Invalid friendship status');
//   }
// };

// const getFriendIds = async (userId) => {
//   const friendships = await Friendship.findAll({
//     where: {
//       status: 'accepted',
//       [Op.or]: [{ userId }, { friendId: userId }],
//     },
//     attributes: ['userId', 'friendId'],
//   });

//   return friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));
// };

// const formatFriendshipResponse = (friendship, currentUserId) => {
//   const friend =
//     friendship.userId === currentUserId
//       ? friendship.requested
//       : friendship.requester;
//   return {
//     id: friendship.id,
//     status: friendship.status,
//     tier: friendship.tier,
//     customLabel: friendship.customLabel,
//     createdAt: friendship.createdAt,
//     acceptedAt: friendship.acceptedAt,
//     friend: {
//       id: friend.id,
//       firstName: friend.firstName,
//       lastName: friend.lastName,
//       profileImage: friend.profileImage,
//       lastActive: friend.lastActive,
//     },
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

// // Controller Functions
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

//     // Create notification with friendshipId in metadata
//     await Notification.create({
//       userId: numericFriendId,
//       type: 'friend_request',
//       senderId: numericCurrentUserId,
//       message: `${req.user.firstName} sent you a friend request`,
//       metadata: { 
//         friendshipId: friendship.id,
//         senderName: req.user.firstName + ' ' + req.user.lastName,
//         avatarUrl: req.user.profileImage 
//       }
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
//     logger.error('Friend request error:', error);
//     res.status(400).json({
//       error: error.message,
//       code: error.message.includes('yourself') ? 'SELF_ACTION' : 'INVALID_REQUEST'
//     });
//   }
// };

// const acceptFriendRequest = async (req, res) => {
//   const { friendshipId } = req.params;
//   const currentUserId = req.user.id;

//   if (isNaN(Number(friendshipId))) {
//     return res.status(400).json({
//       code: 'INVALID_ID',
//       message: 'Friendship ID must be a number',
//       receivedId: friendshipId,
//     });
//   }

//   try {
//     const request = await Friendship.findByPk(Number(friendshipId), {
//       include: [
//         { model: User, as: 'requester' },
//         { model: User, as: 'requested' }
//       ]
//     });

//     if (!request) {
//       return res.status(404).json({
//         code: 'REQUEST_NOT_FOUND',
//         message: 'Friendship request not found',
//         debug: { friendshipId, currentUserId },
//       });
//     }

//     if (request.userId === currentUserId) {
//       return res.status(400).json({
//         code: 'SELF_ACCEPT',
//         message: 'Cannot accept your own friend request',
//         solution: 'The recipient should accept this request',
//         debug: {
//           requestStatus: request.status,
//           sender: request.userId,
//           currentUser: currentUserId,
//         },
//       });
//     }

//     if (request.friendId !== currentUserId) {
//       return res.status(403).json({
//         code: 'NOT_RECIPIENT',
//         message: `Only user ${request.friendId} can accept this request`,
//         requiredRecipient: request.friendId,
//         debug: {
//           currentUser: currentUserId,
//           expectedRecipient: request.friendId,
//         },
//       });
//     }

//     if (request.status !== 'pending') {
//       return res.status(400).json({
//         code: 'INVALID_STATUS',
//         message: `Request is already ${request.status}`,
//         validStatuses: ['pending'],
//         debug: {
//           currentStatus: request.status,
//           acceptedAt: request.acceptedAt,
//         },
//       });
//     }

//     // Update the friendship status
//     await request.update({
//       status: 'accepted',
//       acceptedAt: new Date(),
//       actionUserId: currentUserId,
//     });

//     // Create acceptance notification
//     await Notification.create({
//       userId: request.userId,
//       type: 'friend_request_accepted',
//       senderId: currentUserId,
//       message: `${request.requested.firstName} accepted your friend request`,
//       metadata: {
//         friendshipId: request.id,
//         senderName: request.requested.firstName + ' ' + request.requested.lastName,
//         avatarUrl: request.requested.profileImage
//       }
//     });

//     return res.json({
//       message: 'Friend request accepted successfully',
//       data: {
//         friendship: formatFriendshipResponse(request, currentUserId)
//       },
//       metadata: {
//         timestamp: new Date().toISOString(),
//         friendshipId: request.id,
//       },
//     });
//   } catch (error) {
//     logger.error('Accept friend request error:', {
//       error: error.message,
//       stack: error.stack,
//       friendshipId,
//       currentUserId,
//       timestamp: new Date().toISOString(),
//     });

//     return res.status(500).json({
//       code: 'SERVER_ERROR',
//       message: 'Failed to process friend request acceptance',
//       error: process.env.NODE_ENV === 'development' ? {
//         message: error.message,
//         stack: error.stack,
//       } : undefined,
//       debug: {
//         friendshipId,
//         timestamp: new Date().toISOString(),
//       },
//     });
//   }
// };

// const rejectFriendRequest = async (req, res) => {
//   try {
//     const { friendshipId } = req.params;
//     const currentUserId = req.user.id;

//     const request = await Friendship.findOne({
//       where: {
//         id: friendshipId,
//         friendId: currentUserId,
//         status: 'pending'
//       },
//       include: [
//         { model: User, as: 'requester' },
//         { model: User, as: 'requested' }
//       ]
//     });

//     if (!request) {
//       return res.status(404).json({
//         code: 'REQUEST_NOT_FOUND',
//         message: 'Friend request not found or already processed'
//       });
//     }

//     // Update the request status with cooling period
//     await request.update({
//       status: 'rejected',
//       actionUserId: currentUserId,
//       coolingPeriod: new Date(Date.now() + COOLING_PERIOD_DAYS * 24 * 60 * 60 * 1000)
//     });

//     // Create rejection notification
//     await Notification.create({
//       userId: request.userId,
//       type: 'friend_request_rejected',
//       senderId: currentUserId,
//       message: `${request.requested.firstName} declined your friend request`,
//       metadata: {
//         friendshipId: request.id,
//         senderName: request.requested.firstName + ' ' + request.requested.lastName,
//         avatarUrl: request.requested.profileImage
//       }
//     });

//     res.status(200).json({
//       message: 'Friend request rejected',
//       data: formatFriendshipResponse(request, currentUserId)
//     });
//   } catch (error) {
//     logger.error('Error rejecting friend request:', error);
//     res.status(500).json({
//       code: 'REJECT_FAILED',
//       message: error.message
//     });
//   }
// };










// // ... [Keep all other controller functions the same, just ensure they use friendshipId consistently]

// module.exports = {
//   sendFriendRequest,
//   acceptFriendRequest,
//   rejectFriendRequest,
//   cancelFriendRequest,
//   removeFriendship,
//   blockUser,
//   unblockUser,
//   getPendingRequests,
//   getSentRequests,
//   listFriends,
//   checkFriendshipStatus,
//   getMutualFriends,
//   getFriendSuggestions,
//   updateFriendshipTier,
//   getFriendsByTier,
//   getAllFriendshipTiers,
//   cleanupExpiredRequests,
//   validateUserId,
//   validateFriendshipStatus,
//   getFriendIds,
//   formatFriendshipResponse,
//   findFriendshipBetweenUsers,
// };



