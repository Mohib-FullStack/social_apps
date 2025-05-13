const express = require('express');
const friendShipsRouter = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
// const { validateRequest } = require('../middleware/friendsMiddleware');
const { sendRequest, respondToRequest, getPendingRequests, listFriends, removeFriendship } = require('../controller/friendShipController');

friendShipsRouter .post('/request', isLoggedIn, sendRequest);
friendShipsRouter .put('/:id/respond', isLoggedIn, respondToRequest);
friendShipsRouter .get('/pending', isLoggedIn, getPendingRequests);
friendShipsRouter .get('/friends', isLoggedIn, listFriends);
friendShipsRouter .delete('/:id', isLoggedIn, removeFriendship);


module.exports = friendShipsRouter; 