// middleware/realIp.js
const realIp = (req, res, next) => {
  req.ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                 req.connection?.remoteAddress || 
                 req.socket?.remoteAddress || 
                 req.connection?.socket?.remoteAddress;
  next();
};

module.exports = realIp;