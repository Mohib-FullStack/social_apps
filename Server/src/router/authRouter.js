// authRouter.js
const express = require('express');
const {
  handleLogin,
  handleLogout,
  handleRefreshToken,
} = require('../controller/authController');
const { validateLogin } = require('../validators/user');
const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut } = require('../middleware/authMiddleware');

const authRouter = express.Router();

// Authentication Routes
authRouter.post('/login', isLoggedOut, validateLogin, runValidation, handleLogin); // Login route

authRouter.post('/logout', isLoggedIn, handleLogout); // Logout route

// Token Routes
authRouter.post('/refresh-token', handleRefreshToken); // Refresh token route


module.exports = authRouter;

