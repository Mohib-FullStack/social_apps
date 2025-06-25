// authController.js
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { errorResponse, successResponse } = require('./responseController');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtAccessKey, jwtRefreshKey } = require('../secret');
const {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} = require('../helper/cookie');
const sendLoginNotificationEmail = require('../helper/loginNotificationEmail');
const geoip = require('geoip-lite'); // For IP geolocation
const DeviceDetector = require('device-detector-js'); // For device detection

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Find user including the password field
    const user = await User.findOne({
      where: { email: normalizedEmail },
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'isBanned',
        'isAdmin',
      ],
      paranoid: false,
      raw: true,
    });

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Email or password is incorrect.',
      });
    }

    // Password verification
    const isPasswordMatch = await bcrypt.compare(
      trimmedPassword,
      user.password
    );
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

    // Generate tokens
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

    // Prepare login notification (async - don't wait for it)
    try {
      // Get location from IP
      const geo = geoip.lookup(ipAddress) || {};
      const location = {
        city: geo.city || 'Unknown',
        region: geo.region || 'Unknown',
        country: geo.country || 'Unknown',
      };

      // Detect device
      const deviceDetector = new DeviceDetector();
      const deviceInfo = deviceDetector.parse(userAgent);
      const device = deviceInfo.device?.type
        ? `${deviceInfo.device.type} (${deviceInfo.os?.name || 'Unknown OS'})`
        : 'Unknown Device';

      await sendLoginNotificationEmail(user, {
        time: new Date(),
        location,
        device,
        ipAddress,
      });
    } catch (emailError) {
      console.error('Failed to send login notification:', emailError);
      // Don't fail login if email fails
    }

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

//! Handle Logout
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
const handleRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw createError(401, 'Refresh token missing');

    const decoded = jwt.verify(refreshToken, jwtRefreshKey);

    const user = await User.findByPk(decoded.id);
    if (!user) throw createError(401, 'Invalid refresh token');

    const newAccessToken = createJSONWebToken(
      { id: user.id },
      jwtAccessKey,
      '15m'
    );

    setAccessTokenCookie(res, newAccessToken);

    return successResponse(res, {
      statusCode: 200,
      message: 'Access token refreshed successfully',
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

//! Protected Route Handler
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
  handledestroyAllSessions,
};
