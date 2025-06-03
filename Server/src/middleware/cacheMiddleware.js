const { redisConfig } = require("../secret");

const cacheUnreadCount = async (req, res, next) => {
  const cacheKey = `user:${req.user.id}:unread_notifications`;
  
  try {
    const cachedCount = await redisConfig.get(cacheKey);
    if (cachedCount) {
      return res.status(200).json({
        success: true,
        data: { count: parseInt(cachedCount) },
        fromCache: true
      });
    }
    next();
  } catch (error) {
    console.error('Cache error:', error);
    next();
  }
};

module.exports = { cacheUnreadCount };