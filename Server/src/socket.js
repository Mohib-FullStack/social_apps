// src/socket.js
const http = require('http');
const app = require('./app'); // your Express app
const initializeSocketIO = require('./config/socket.io');
const redisConfig = require('./config/redis'); // your Redis config

const server = http.createServer(app);

(async () => {
  try {
    const io = await initializeSocketIO(server, redisConfig);
    // You can store `io` somewhere for later use if needed
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
  }
})();
