const { Friendship, User, Notification, Chat } = require('../models');
const { Op } = require('sequelize');

const sendRequest = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    
    // Validation
    if (req.user.id === friendId) {
      return res.status(400).json({ error: "Cannot send request to yourself" });
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
      return res.status(400).json({ error: "Friendship request already exists" });
    }

    const friendship = await Friendship.create({
      userId: req.user.id,
      friendId,
      status: 'pending',
      actionUserId: req.user.id
    });

    // Create notification
    await Notification.create({
      userId: friendId,
      type: 'friend_request',
      senderId: req.user.id,
      isRead: false,
      metadata: { friendshipId: friendship.id }
    });

    // Real-time notification
    req.io.to(`user_${friendId}`).emit('friend_request', {
      from: req.user.id,
      friendshipId: friendship.id
    });

    res.status(201).json(friendship);
  } catch (error) {
    next(error);
  }
};

const respondToRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    const friendship = await Friendship.findOne({
      where: {
        id,
        friendId: req.user.id,
        status: 'pending'
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Request not found" });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await friendship.update({
      status: newStatus,
      actionUserId: req.user.id
    });

    // Notification to requester
    if (action === 'accept') {
      await Notification.create({
        userId: friendship.userId,
        type: 'friend_request_accepted',
        senderId: req.user.id,
        isRead: false
      });

      // Create chat room
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
          participants: [friendship.userId, friendship.friendId]
        }
      });
    }

    res.status(200).json(friendship);
  } catch (error) {
    next(error);
  }
};

const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await Friendship.findAll({
      where: {
        friendId: req.user.id,
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'requester',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }]
    });

    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

const listFriends = async (req, res, next) => {
  try {
    const friends = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userId: req.user.id },
          { friendId: req.user.id }
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
      ]
    });

    const formattedFriends = friends.map(friendship => {
      return friendship.userId === req.user.id 
        ? friendship.requested 
        : friendship.requester;
    }).filter(Boolean);

    res.status(200).json({
      count: formattedFriends.length,
      friends: formattedFriends
    });
  } catch (error) {
    next(error);
  }
};

const removeFriendship = async (req, res, next) => {
  try {
    const { id } = req.params;

    const friendship = await Friendship.findOne({
      where: {
        id,
        [Op.or]: [
          { userId: req.user.id },
          { friendId: req.user.id }
        ]
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    // Delete the friendship record
    await friendship.destroy();

    // If it was an accepted friendship, update chat
    if (friendship.status === 'accepted') {
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
    }

    // Notify the other user if they're online
    const otherUserId = friendship.userId === req.user.id 
      ? friendship.friendId 
      : friendship.userId;

    req.io.to(`user_${otherUserId}`).emit('friendship_removed', {
      friendshipId: id,
      removedBy: req.user.id
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRequest,
  respondToRequest,
  getPendingRequests,
  listFriends,
  removeFriendship
};








// const { Friendship, User, Notification } = require('../models');
// const { Op } = require('sequelize');

// const sendRequest = async (req, res, next) => {
//   try {
//     const { friendId } = req.body;
    
//     // Validation
//     if (req.user.id === friendId) {
//       return res.status(400).json({ error: "Cannot send request to yourself" });
//     }

//     const existing = await Friendship.findOne({
//       where: {
//         [Op.or]: [
//           { userId: req.user.id, friendId },
//           { userId: friendId, friendId: req.user.id }
//         ]
//       }
//     });

//     if (existing) {
//       return res.status(400).json({ error: "Friendship request already exists" });
//     }

//     const friendship = await Friendship.create({
//       userId: req.user.id,
//       friendId,
//       status: 'pending',
//       actionUserId: req.user.id
//     });

//     // Create notification
//     await Notification.create({
//       userId: friendId,
//       type: 'friend_request',
//       senderId: req.user.id,
//       isRead: false,
//       metadata: { friendshipId: friendship.id }
//     });

//     // Real-time notification
//     req.io.to(`user_${friendId}`).emit('friend_request', {
//       from: req.user.id,
//       friendshipId: friendship.id
//     });

//     res.status(201).json(friendship);
//   } catch (error) {
//     next(error);
//   }
// };

// const respondToRequest = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { action } = req.body; // 'accept' or 'reject'

//     const friendship = await Friendship.findOne({
//       where: {
//         id,
//         friendId: req.user.id,
//         status: 'pending'
//       }
//     });

//     if (!friendship) {
//       return res.status(404).json({ error: "Request not found" });
//     }

//     const newStatus = action === 'accept' ? 'accepted' : 'rejected';
//     await friendship.update({
//       status: newStatus,
//       actionUserId: req.user.id
//     });

//     // Notification to requester
//     if (action === 'accept') {
//       await Notification.create({
//         userId: friendship.userId,
//         type: 'friend_request_accepted',
//         senderId: req.user.id,
//         isRead: false
//       });

//       // Create chat room
//       await Chat.findOrCreate({
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
//           participants: [friendship.userId, friendship.friendId]
//         }
//       });
//     }

//     res.status(200).json(friendship);
//   } catch (error) {
//     next(error);
//   }
// };

// const getPendingRequests = async (req, res, next) => {
//   try {
//     const requests = await Friendship.findAll({
//       where: {
//         friendId: req.user.id,
//         status: 'pending'
//       },
//       include: [{
//         model: User,
//         as: 'requester',
//         attributes: ['id', 'firstName', 'lastName', 'profileImage']
//       }]
//     });

//     res.status(200).json(requests);
//   } catch (error) {
//     next(error);
//   }
// };

// // New method: List all accepted friends
// const listFriends = async (req, res, next) => {
//   try {
//     const friends = await Friendship.findAll({
//       where: {
//         [Op.or]: [
//           { userId: req.user.id, status: 'accepted' },
//           { friendId: req.user.id, status: 'accepted' }
//         ]
//       },
//       include: [
//         {
//           model: User,
//           as: 'friendInfo',
//           foreignKey: 'friendId',
//           where: { id: { [Op.ne]: req.user.id } },
//           attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive'],
//           required: false
//         },
//         {
//           model: User,
//           as: 'userInfo',
//           foreignKey: 'userId',
//           where: { id: { [Op.ne]: req.user.id } },
//           attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastActive'],
//           required: false
//         }
//       ],
//       attributes: ['id', 'status', 'createdAt']
//     });

//     // Transform the data to a cleaner format
//     const formattedFriends = friends.map(friendship => {
//       return friendship.userId === req.user.id 
//         ? friendship.friendInfo 
//         : friendship.userInfo;
//     }).filter(Boolean);

//     res.status(200).json({
//       count: formattedFriends.length,
//       friends: formattedFriends
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // New method: Remove friendship or cancel request
// const removeFriendship = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const friendship = await Friendship.findOne({
//       where: {
//         id,
//         [Op.or]: [
//           { userId: req.user.id },
//           { friendId: req.user.id }
//         ]
//       }
//     });

//     if (!friendship) {
//       return res.status(404).json({ error: "Friendship not found" });
//     }

//     // Delete the friendship record
//     await friendship.destroy();

//     // If it was an accepted friendship, update chat
//     if (friendship.status === 'accepted') {
//       await Chat.destroy({
//         where: {
//           type: 'dm',
//           participants: {
//             [Op.and]: [
//               { [Op.contains]: [friendship.userId] },
//               { [Op.contains]: [friendship.friendId] }
//             ]
//           }
//         }
//       });
//     }

//     // Notify the other user if they're online
//     const otherUserId = friendship.userId === req.user.id 
//       ? friendship.friendId 
//       : friendship.userId;

//     req.io.to(`user_${otherUserId}`).emit('friendship_removed', {
//       friendshipId: id,
//       removedBy: req.user.id
//     });

//     res.status(204).end();
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   sendRequest,
//   respondToRequest,
//   getPendingRequests,
//   listFriends,
//   removeFriendship
// };


