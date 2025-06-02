const express = require('express');
const friendShipsRouter = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const { sendFriendRequest, cancelFriendRequest, getPendingRequests, getSentRequests, acceptFriendRequest, rejectFriendRequest, listFriends, checkFriendshipStatus, removeFriendship, blockUser, unblockUser, getMutualFriends, getFriendIds, cleanupExpiredRequests } = require('../controller/friendShipController');

// Friend request management
friendShipsRouter.post('/requests', isLoggedIn,sendFriendRequest);
friendShipsRouter.delete('/requests/:requestId', isLoggedIn,cancelFriendRequest);
friendShipsRouter.get('/requests/pending', isLoggedIn,getPendingRequests);
friendShipsRouter.get('/requests/sent', isLoggedIn,getSentRequests);

// Friend request responses
friendShipsRouter.put('/requests/:requestId/accept', isLoggedIn,acceptFriendRequest);
friendShipsRouter.put('/requests/:requestId/reject', isLoggedIn,rejectFriendRequest);

// Friend management
// In your friendShipsRouter.js
friendShipsRouter.get('/:userId/friends', isLoggedIn, listFriends);
 friendShipsRouter.get('/', isLoggedIn,getFriendIds);
friendShipsRouter.get('/status/:userId', isLoggedIn,checkFriendshipStatus);
friendShipsRouter.get('/:userId/mutual-friends', isLoggedIn, getMutualFriends);
friendShipsRouter.delete('/:friendshipId', isLoggedIn,removeFriendship);

// Block management
friendShipsRouter.post('/block', isLoggedIn,blockUser);
friendShipsRouter.delete('/block/:userId', isLoggedIn,unblockUser);

 friendShipsRouter.post('/', isLoggedIn,cleanupExpiredRequests);



module.exports = friendShipsRouter;







//! update
// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/friendshipController');
// const { isLoggedIn } = require('../middleware/authMiddleware');
// const { validate } = require('../middleware/validationMiddleware');
// const rateLimit = require('express-rate-limit');

// // Rate limiting configuration
// const createRequestLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 50,
//   message: 'Too many friend requests, please try again later'
// });

// // =========================================================================
// // 🎯  API Versioning & Base Route
// // =========================================================================
// /**
//  * @swagger
//  * tags:
//  *   name: Friendships
//  *   description: User friendship management
//  */

// // =========================================================================
// // 🔐  Authentication - All routes protected
// // =========================================================================
// router.use(isLoggedIn);

// // =========================================================================
// // 📨  FRIEND REQUEST MANAGEMENT
// // =========================================================================
// /**
//  * @swagger
//  * /friends/requests:
//  *   post:
//  *     summary: Send friend request
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               friendId:
//  *                 type: integer
//  */
// router.post('/requests', createRequestLimiter, validate.friendId, controller.sendFriendRequest);

// /**
//  * @swagger
//  * /friends/requests/{requestId}:
//  *   delete:
//  *     summary: Cancel pending request
//  *     parameters:
//  *       - in: path
//  *         name: requestId
//  *         required: true
//  */
// router.delete('/requests/:requestId', validate.requestId, controller.cancelFriendRequest);

// router.get('/requests/pending', controller.getPendingRequests);  // List received
// router.get('/requests/sent', controller.getSentRequests);       // List sent

// // =========================================================================
// // ✉️  REQUEST RESPONSES
// // =========================================================================
// router.put('/requests/:requestId/accept', validate.requestId, controller.acceptFriendRequest);
// router.put('/requests/:requestId/reject', validate.requestId, controller.rejectFriendRequest);

// // =========================================================================
// // 👥  FRIENDSHIP MANAGEMENT
// // =========================================================================
// router.get('/friends', controller.listFriends);                     // Current user
// router.get('/:userId/friends', validate.userId, controller.listFriends); // Specific user

// router.get('/status/:userId', validate.userId, controller.checkFriendshipStatus);
// router.get('/:userId/mutual-friends', validate.userId, controller.getMutualFriends);
// router.delete('/:friendshipId', validate.friendshipId, controller.removeFriendship);

// // =========================================================================
// // 🚫  BLOCK MANAGEMENT
// // =========================================================================
// router.post('/block', validate.friendId, controller.blockUser);
// router.delete('/block/:userId', validate.userId, controller.unblockUser);

// module.exports = router;






//! old
























