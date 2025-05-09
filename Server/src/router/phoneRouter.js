// phoneRouter.js
const express = require('express');
const { handleUpdatePhone, verifyPhoneOTP } = require('../controller/userController');
const { isLoggedIn } = require('../middleware/authMiddleware');

const phoneRouter = express.Router();

// Ensure these routes are properly prefixed when mounted
phoneRouter.put('/phone', isLoggedIn, handleUpdatePhone);
phoneRouter.post('/phone/verify-OTP', isLoggedIn, verifyPhoneOTP);

module.exports = phoneRouter;

