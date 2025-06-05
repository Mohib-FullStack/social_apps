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































