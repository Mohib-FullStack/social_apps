// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/userModel');
const { jwtAccessKey, jwtRefreshKey,jwtSecret, } = require('../secret');


// Middleware to verify access token from cookies (for logged-in users)
const isLoggedIn = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return next(createError(401, "Access token not found. Please log in."));
    }

    const decodedToken = jwt.verify(accessToken, jwtAccessKey);
    req.user = decodedToken; // Attach decoded token data to the request
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return next(createError(401, "Invalid or expired token. Please log in."));
  }
};

// Middleware to prevent logged-in users from accessing certain routes (like login/register)
const isLoggedOut = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (accessToken) {
    return next(
      createError(
        400,
        'You are already logged in. Please log out before logging in again.'
      )
    );
  }
  next();
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  // Ensure req.user exists and isAdmin is explicitly set
  if (req.user && req.user.isAdmin === true) {
    return next();
  }

  // More descriptive error message
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.',
    details: req.user
      ? `User isAdmin status: ${req.user.isAdmin}`
      : 'No user information found',
  });
};

// Middleware to verify JWT from authorization headers (Bearer token for API routes)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, 'Unauthorized: Token missing or malformed.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, jwtSecret);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return next(createError(401, 'Invalid or expired token.'));
  }
};

module.exports = { isLoggedIn, isLoggedOut, isAdmin, verifyToken };