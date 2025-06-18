const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../redisClient');

const friendRequestLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' 
    ? new RedisStore({ 
        client: redisClient, 
        prefix: 'rl_friend:' 
      })
    : undefined,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // 50 requests per window
  keyGenerator: (req) => {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return 'unknown'; // Fallback key for unauthenticated requests
    }
    return req.user.id; // Use user ID for authenticated requests
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many friend requests. Please try again tomorrow.',
      code: 'RATE_LIMITED'
    });
  },
  skip: (req) => {
    // Skip rate limiting for certain conditions if needed
    return false; // Keep rate limiting for all requests by default
  }
});

module.exports = { friendRequestLimiter };