const express = require('express');
const friendShipsRouter = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const { 
  validateFriendId, 
  validateRequestId, 
  validateBlockAction 
} = require('../validators/friendship');
const runValidation = require('../validators');
const {
  sendFriendRequest,
  cancelFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendSuggestions,
  // listFriends,
  checkFriendshipStatus,
  getMutualFriends,
  blockUser,
  unblockUser,
  cleanupExpiredRequests,
  updateFriendshipTier,
   removeFriend,
  getFriends,
} = require('../controller/friendShipController');
const { friendRequestLimiter } = require('../middleware/friendRequestLimiter');


//! Friend request endpoints
friendShipsRouter.post(
  '/requests',
  isLoggedIn,
  friendRequestLimiter,
  // validateFriendId,
  // runValidation,
  sendFriendRequest
);

friendShipsRouter.delete(
  '/requests/:friendshipId',
  isLoggedIn,
  validateRequestId,
  runValidation,
  cancelFriendRequest
);

friendShipsRouter.get('/requests/pending', isLoggedIn, getPendingRequests);

// ===== Friend List =====
friendShipsRouter.get('/:userId/friends', isLoggedIn, getFriends);          // ✅ Mohib, Ara, or others
friendShipsRouter.get('/me/friends', isLoggedIn, getFriends);               // ✅ Current user's friends


//! Friend request responses
friendShipsRouter.put(
  '/requests/:friendshipId/accept',
  isLoggedIn,
  // validateRequestId,
  // runValidation,
  acceptFriendRequest
);

//! reject
friendShipsRouter.put(
  '/requests/:friendshipId/reject',
  isLoggedIn,
  // validateRequestId,
  // runValidation,
  rejectFriendRequest
);

// Friend management
// friendShipsRouter.get('/', isLoggedIn, listFriends);

friendShipsRouter.get('/suggestions', isLoggedIn, getFriendSuggestions);

friendShipsRouter.get('/status/:userId', isLoggedIn, checkFriendshipStatus);

friendShipsRouter.get('/:userId/mutual-friends', isLoggedIn, getMutualFriends);

friendShipsRouter.delete('/:friendshipId', isLoggedIn, removeFriend);

// Block management
friendShipsRouter.post(
  '/block',
  isLoggedIn,
  validateBlockAction,
  runValidation,
  blockUser
);

friendShipsRouter.delete(
  '/block/:userId',
  isLoggedIn,
  validateBlockAction,
  runValidation,
  unblockUser
);

// Maintenance
friendShipsRouter.post('/cleanup', isLoggedIn, cleanupExpiredRequests);

// Tier management
friendShipsRouter.put(
  '/:friendshipId/tier',
  isLoggedIn,
  updateFriendshipTier
);


module.exports = friendShipsRouter;



//! new
// const express = require('express');
// const router = express.Router();

// const {
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
//   cleanupExpiredRequests,
//   getSentRequests // assuming you have this too
// } = require('../controllers/friendshipController');

// const { isLoggedIn } = require('../middleware/authMiddleware');

// // ===== Friend Request Actions =====
// router.post('/requests', isLoggedIn, sendFriendRequest);
// router.put('/requests/:friendshipId/accept', isLoggedIn, acceptFriendRequest);
// router.put('/requests/:friendshipId/reject', isLoggedIn, rejectFriendRequest);
// router.delete('/requests/:friendshipId', isLoggedIn, cancelFriendRequest);

// // ===== Friend List =====
// router.get('/:userId/friends', isLoggedIn, getFriends);          // ✅ Mohib, Ara, or others
// router.get('/me/friends', isLoggedIn, getFriends);               // ✅ Current user's friends

// // ===== Pending & Sent Requests =====
// router.get('/requests/pending', isLoggedIn, getPendingRequests);
// router.get('/requests/sent', isLoggedIn, getSentRequests);       // Only if you implemented this

// // ===== Friend Management =====
// router.delete('/:friendshipId', isLoggedIn, removeFriend);
// router.put('/:friendshipId/tier', isLoggedIn, updateFriendshipTier);

// // ===== Block/Unblock =====
// router.post('/block', isLoggedIn, blockUser);
// router.delete('/block/:userId', isLoggedIn, unblockUser);

// // ===== Friendship Status & Mutuals =====
// router.get('/status/:userId', isLoggedIn, checkFriendshipStatus);
// router.get('/:userId/mutual-friends', isLoggedIn, getMutualFriends);

// // ===== Suggestions & Cleanup =====
// router.get('/suggestions', isLoggedIn, getFriendSuggestions);
// router.delete('/cleanup', isLoggedIn, cleanupExpiredRequests);

// module.exports = router;
