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
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendIds,
  getFriendSuggestions,
  listFriends,
  checkFriendshipStatus,
  getMutualFriends,
  removeFriendship,
  blockUser,
  unblockUser,
  cleanupExpiredRequests,
  updateFriendshipTier,
  getFriendsByTier
} = require('../controller/friendShipController');

// Friend request endpoints
friendShipsRouter.post(
  '/requests',
  isLoggedIn,
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
// friendShipsRouter.get('/requests/sent', isLoggedIn, getSentRequests);

// Friend request responses
friendShipsRouter.put(
  '/requests/:friendshipId/accept',
  isLoggedIn,
  // validateRequestId,
  // runValidation,
  acceptFriendRequest
);

friendShipsRouter.put(
  '/requests/:friendshipId/reject',
  isLoggedIn,
  // validateRequestId,
  // runValidation,
  rejectFriendRequest
);

// Friend management
// friendShipsRouter.get('/', isLoggedIn, getFriendIds);
friendShipsRouter.get('/suggestions', isLoggedIn, getFriendSuggestions);
// friendShipsRouter.get('/:userId/friends', isLoggedIn, listFriends);
friendShipsRouter.get('/status/:userId', isLoggedIn, checkFriendshipStatus);
friendShipsRouter.get('/:userId/mutual-friends', isLoggedIn, getMutualFriends);
// friendShipsRouter.delete('/:friendshipId', isLoggedIn, removeFriendship);

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

friendShipsRouter.get(
  '/tier/:tier',
  isLoggedIn,
  // getFriendsByTier
);

module.exports = friendShipsRouter;









//! previous
// const express = require('express');
// const friendShipsRouter = express.Router();
// const { isLoggedIn } = require('../middleware/authMiddleware');
// const { validateFriendId, validateRequestId, validateBlockAction } = require('../validators/friendship');
// const runValidation = require('../validators');
// const { sendFriendRequest, cancelFriendRequest, getPendingRequests, getSentRequests, acceptFriendRequest, rejectFriendRequest, getFriendIds, getFriendSuggestions, listFriends, checkFriendshipStatus, getMutualFriends, removeFriendship, blockUser, unblockUser, cleanupExpiredRequests, updateFriendshipTier, getFriendsByTier } = require('../controller/friendShipController');


// // Friend request endpoints
// friendShipsRouter.post(
//   '/requests',
//   isLoggedIn,
//   validateFriendId,
//   runValidation,
//   sendFriendRequest
  
// );

// friendShipsRouter.delete(
//   '/requests/:requestId',
//   isLoggedIn,
//   validateRequestId,
//   runValidation,
//   cancelFriendRequest
// );

// friendShipsRouter.get('/requests/pending', isLoggedIn, getPendingRequests);
// friendShipsRouter.get('/requests/sent', isLoggedIn, getSentRequests);

// //! Friend request responses
// friendShipsRouter.put(
//   '/requests/:requestId/accept',
//   isLoggedIn,
//    validateRequestId,
//    runValidation,
//   acceptFriendRequest
// );

// friendShipsRouter.put(
//   '/requests/:requestId/reject',
//   isLoggedIn,
//   validateRequestId,
//   runValidation,
//   rejectFriendRequest
// );

// // Friend management
// friendShipsRouter.get('/', isLoggedIn, getFriendIds);
// friendShipsRouter.get('/suggestions', isLoggedIn, getFriendSuggestions);
// friendShipsRouter.get('/:userId/friends', isLoggedIn, listFriends);
// friendShipsRouter.get('/status/:userId', isLoggedIn, checkFriendshipStatus);
// friendShipsRouter.get('/:userId/mutual-friends', isLoggedIn, getMutualFriends);
// friendShipsRouter.delete('/:friendshipId', isLoggedIn,removeFriendship);

// // Block management
// friendShipsRouter.post(
//   '/block',
//   isLoggedIn,
//   validateBlockAction,
//   runValidation,
//   blockUser
// );

// friendShipsRouter.delete(
//   '/block/:userId',
//   isLoggedIn,
//   validateBlockAction,
//   runValidation,
//   unblockUser
// );

// // Maintenance
// friendShipsRouter.post('/cleanup', isLoggedIn, cleanupExpiredRequests);

// // Add these routes
// friendShipsRouter.put(
//   '/:friendshipId/tier',
//   isLoggedIn,
//   updateFriendshipTier
// );

// friendShipsRouter.get(
//   '/tier/:tier',
//   isLoggedIn,
//   getFriendsByTier
// );

// module.exports = friendShipsRouter;







//! previous
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
//   getMutualFriends,
//   getFriendIds,
//   cleanupExpiredRequests,
// } = require('../controller/friendShipController');

// // Friend request endpoints
// friendShipsRouter.post('/requests', isLoggedIn, sendFriendRequest);

// friendShipsRouter.delete(
//   '/requests/:requestId',
//   isLoggedIn,
//   cancelFriendRequest
// );
// friendShipsRouter.get('/requests/pending', isLoggedIn, getPendingRequests);

// friendShipsRouter.get('/requests/sent', isLoggedIn, getSentRequests);

// // Friend request responses
// friendShipsRouter.put(
//   '/requests/:requestId/accept',
//   isLoggedIn,
//   acceptFriendRequest
// );
// friendShipsRouter.put(
//   '/requests/:requestId/reject',
//   isLoggedIn,
//   rejectFriendRequest
// );

// // Friend management
// friendShipsRouter.get('/', isLoggedIn, getFriendIds);
// friendShipsRouter.get('/:userId/friends', isLoggedIn, listFriends);
// friendShipsRouter.get('/status/:userId', isLoggedIn, checkFriendshipStatus);
// friendShipsRouter.get('/:userId/mutual-friends', isLoggedIn, getMutualFriends);
// friendShipsRouter.delete('/:friendshipId', isLoggedIn, removeFriendship);

// // Block management
// friendShipsRouter.post('/block', isLoggedIn, blockUser);
// friendShipsRouter.delete('/block/:userId', isLoggedIn, unblockUser);

// // Maintenance
// friendShipsRouter.post('/cleanup', isLoggedIn, cleanupExpiredRequests);

// module.exports = friendShipsRouter;