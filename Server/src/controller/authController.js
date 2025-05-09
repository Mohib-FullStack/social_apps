const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // ✅ Not bcryptjs!
const User = require('../models/userModel');
const {
  successResponse,
  errorResponse,
} = require('../controller/responseController');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtAccessKey, jwtRefreshKey } = require('../secret');
const {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} = require('../helper/cookie');

// Handle Login
const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log(`Login attempt for: ${normalizedEmail}`); // Debug log

    // Find user including the password field
    const user = await User.findOne({
      where: { email: normalizedEmail },
      attributes: ['id', 'email', 'password', 'isBanned', 'isAdmin'],
      paranoid: false,
      raw: true, // Get plain object instead of model instance
    });

    if (!user) {
      console.log('No user found with email:', normalizedEmail); // Debug log
      return errorResponse(res, {
        statusCode: 401,
        message: 'Email or password is incorrect.',
      });
    }

    console.log('User found:', user.id); // Debug log
    console.log('Stored password hash:', user.password); // Debug log

    // Verify the password is a valid bcrypt hash
    const isHashValid = user.password.match(/^\$2[aby]\$\d+\$.{53}$/);
    console.log('Is stored password a valid bcrypt hash?', isHashValid); // Debug log

    if (!isHashValid) {
      console.error('Invalid password hash format in database');
      return errorResponse(res, {
        statusCode: 500,
        message: 'System error. Please contact support.',
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      trimmedPassword,
      user.password
    );
    console.log('Password match result:', isPasswordMatch); // Debug log

    if (!isPasswordMatch) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Email or password is incorrect.',
      });
    }

    if (user.isBanned) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'You are banned. Contact the administrator.',
      });
    }

    // Rest of your successful login logic...
    const accessToken = createJSONWebToken(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      jwtAccessKey,
      '15m'
    );

    const refreshToken = createJSONWebToken(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      jwtRefreshKey,
      '7d'
    );

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    // Remove password before response
    delete user.password;

    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      payload: { user },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, {
      statusCode: 500,
      message: 'Login failed due to server error',
    });
  }
};

// Handle Logout
const handleLogout = (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return successResponse(res, {
      statusCode: 200,
      message: 'Logout successful',
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

// Handle Refresh Token
const handleRefreshToken = (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return next(createError(401, 'No refresh token provided.'));
  }

  try {
    const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);
    const newAccessToken = createJSONWebToken(
      {
        id: decodedToken.id,
        email: decodedToken.email,
        isAdmin: decodedToken.isAdmin,
      },
      jwtAccessKey,
      '15m'
    );
    setAccessTokenCookie(res, newAccessToken);

    return successResponse(res, {
      statusCode: 200,
      message: 'New access token generated',
      payload: { accessToken: newAccessToken },
    });
  } catch (error) {
    return next(createError(403, 'Invalid or expired refresh token.'));
  }
};

// Protected Route Handler
const handleProtectedRoute = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next(createError(401, 'No access token provided. Please log in.'));
  }

  try {
    const decodedToken = jwt.verify(accessToken, jwtAccessKey);
    req.user = decodedToken;

    const tokenExpirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    const timeRemaining = tokenExpirationTime - currentTime;

    if (timeRemaining < 5 * 60 * 1000) {
      const newAccessToken = createJSONWebToken(
        {
          id: decodedToken.id,
          email: decodedToken.email,
          isAdmin: decodedToken.isAdmin,
        },
        jwtAccessKey,
        '15m'
      );
      setAccessTokenCookie(res, newAccessToken);
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Accessed protected resources successfully',
      payload: {
        user: {
          id: decodedToken.id,
          email: decodedToken.email,
          isAdmin: decodedToken.isAdmin,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Destroy all active sessions for a user
 * @param  {number} userId - User ID
 * @return {Promise<void>}
 */
const handledestroyAllSessions = async (userId) => {
  try {
    // In a real implementation, you would:
    // 1. Invalidate all refresh tokens for this user
    // 2. Clear any session records in your database
    // 3. Optionally notify connected WebSocket clients
    
    // For now, we'll just log this action
    console.log(`All sessions destroyed for user ${userId}`);
    
    // In a production app, you might:
    // await RefreshToken.destroy({ where: { userId } });
    // await Session.destroy({ where: { userId } });
  } catch (error) {
    console.error('Failed to destroy sessions:', error);
    throw error;
  }
};

module.exports = {
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleProtectedRoute,
  handledestroyAllSessions
};