const express = require('express');
const friendShipsRouter = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const { sendFriendRequest, cancelFriendRequest, getPendingRequests, getSentRequests, acceptFriendRequest, rejectFriendRequest, listFriends, checkFriendshipStatus, removeFriendship, blockUser, unblockUser } = require('../controller/friendShipController');

// Friend request management
friendShipsRouter.post('/requests', isLoggedIn,sendFriendRequest);
friendShipsRouter.delete('/requests/:requestId', isLoggedIn,cancelFriendRequest);
friendShipsRouter.get('/requests/pending', isLoggedIn,getPendingRequests);
friendShipsRouter.get('/requests/sent', isLoggedIn,getSentRequests);

// Friend request responses
friendShipsRouter.put('/requests/:requestId/accept', isLoggedIn,acceptFriendRequest);
friendShipsRouter.put('/requests/:requestId/reject', isLoggedIn,rejectFriendRequest);

// Friend management
friendShipsRouter.get('/', isLoggedIn,listFriends);
friendShipsRouter.get('/status/:userId', isLoggedIn,checkFriendshipStatus);
friendShipsRouter.delete('/:friendshipId', isLoggedIn,removeFriendship);

// Block management
friendShipsRouter.post('/block', isLoggedIn,blockUser);
friendShipsRouter.delete('/block/:userId', isLoggedIn,unblockUser);



module.exports = friendShipsRouter;










//! with mutuel Friendshipnd
// const express = require('express');
// const friendShipsRouter = express.Router();
// const { isLoggedIn } = require('../middleware/authMiddleware');
// const { 
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
//   getMutualFriends // 👈 New mutual friends endpoint
// } = require('../controller/friendShipController');

// // 🟢 FRIEND REQUEST MANAGEMENT
// friendShipsRouter.post('/requests', isLoggedIn, sendFriendRequest);
// friendShipsRouter.delete('/requests/:requestId', isLoggedIn, cancelFriendRequest);
// friendShipsRouter.get('/requests/pending', isLoggedIn, getPendingRequests);
// friendShipsRouter.get('/requests/sent', isLoggedIn, getSentRequests);

// // 🟠 FRIEND REQUEST RESPONSES
// friendShipsRouter.put('/requests/:requestId/accept', isLoggedIn, acceptFriendRequest);
// friendShipsRouter.put('/requests/:requestId/reject', isLoggedIn, rejectFriendRequest);

// // 🔵 FRIEND MANAGEMENT
// friendShipsRouter.get('/', isLoggedIn, listFriends);
// friendShipsRouter.get('/status/:userId', isLoggedIn, checkFriendshipStatus);
// friendShipsRouter.delete('/:friendshipId', isLoggedIn, removeFriendship);

// // 🟣 MUTUAL FRIENDS FEATURE 👈 New route
// friendShipsRouter.get('/mutual/:userId', isLoggedIn, getMutualFriends);

// // 🔴 BLOCK MANAGEMENT
// friendShipsRouter.post('/block', isLoggedIn, blockUser);
// friendShipsRouter.delete('/block/:userId', isLoggedIn, unblockUser);

// module.exports = friendShipsRouter;













