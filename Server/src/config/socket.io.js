// src/config/socket.io.js
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { parsePhoneNumber } = require('libphonenumber-js');
const jwt = require('jsonwebtoken');
const logger = require('./logger');
const { checkUserExist } = require('../helper/checkUserExist');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

const initializeSocketIO = async (httpServer, redisConfig) => {
  // Enhanced CORS configuration
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL] 
    : ['http://localhost:5173'];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
    transports: ['websocket', 'polling']
  });

  // Redis configuration with enhanced error handling
  let pubClient, subClient;
  
  if (redisConfig?.socket?.host) {
    try {
      pubClient = createClient({
        socket: {
          host: redisConfig.socket.host,
          port: redisConfig.socket.port || 6379,
          reconnectStrategy: (retries) => {
            const delay = Math.min(retries * 100, 5000);
            logger.warn(`Redis connection failed, retrying in ${delay}ms`);
            return delay;
          }
        }
      });

      subClient = pubClient.duplicate();

      pubClient.on('error', err => {
        logger.error('Redis Pub Client Error:', err.message);
        if (err.code === 'ECONNREFUSED') {
          logger.error('Make sure Redis server is running on localhost:6379');
        }
      });

      subClient.on('error', err => {
        logger.error('Redis Sub Client Error:', err.message);
      });

      await Promise.all([pubClient.connect(), subClient.connect()]);
      
      const { createAdapter } = require('@socket.io/redis-adapter');
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Redis adapter initialized successfully');

    } catch (err) {
      logger.error('Redis connection failed:', err.message);
      if (process.env.REDIS_REQUIRED === 'true') {
        throw new Error('Redis connection failed and is required');
      }
      logger.warn('Continuing with in-memory adapter');
    }
  }

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        logger.warn('Authentication attempt without token');
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        logger.warn(`User not found for token: ${decoded.id}`);
        return next(new Error('Authentication error: User not found'));
      }

      if (user.isBanned) {
        logger.warn(`Banned user attempted connection: ${user.id}`);
        return next(new Error('Authentication error: Account suspended'));
      }

      socket.user = user;
      logger.info(`Authenticated socket for user: ${user.id}`);
      next();
    } catch (error) {
      logger.error('Authentication failed:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler with enhanced validation
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id} (Socket: ${socket.id})`);
    
    // Join user's personal room
    socket.join(`user_${socket.user.id}`);

    // Field validation handler
    socket.on('validate-field', async ({ field, value, requestId }, callback) => {
      try {
        if (!['email', 'phone'].includes(field)) {
          throw new Error(`Invalid validation field: ${field}`);
        }

        let validationResult;
        if (field === 'email') {
          const { exists } = await checkUserExist({ email: value });
          validationResult = { 
            valid: !exists, 
            message: exists ? 'Email is already in use' : '',
            field,
            requestId
          };
        } else if (field === 'phone') {
          const phoneNumber = parsePhoneNumber(value);
          const { exists } = await checkUserExist({ phone: phoneNumber.number });
          validationResult = { 
            valid: !exists, 
            message: exists ? 'Phone number already in use' : '',
            field,
            requestId
          };
        }

        callback(validationResult);
      } catch (error) {
        callback({
          valid: false,
          error: 'Validation failed',
          message: error.message,
          field,
          requestId
        });
      }
    });

    // Chat message handler
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { chatId, content } = data;
        
        if (!content || content.trim().length === 0) {
          throw new Error('Message content cannot be empty');
        }

        // Save message to database
        const message = await Message.create({
          chatId,
          senderId: socket.user.id,
          content: content.trim()
        });

        // Update chat last message
        await Chat.update({
          lastMessage: content.trim(),
          lastMessageAt: new Date(),
          lastMessageId: message.id
        }, { where: { id: chatId } });

        // Get chat with participants
        const chat = await Chat.findByPk(chatId, {
          include: [{
            model: User,
            as: 'participants',
            attributes: ['id'],
            through: { attributes: [] }
          }]
        });

        // Prepare response data
        const response = {
          ...message.get({ plain: true }),
          sender: {
            id: socket.user.id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            profileImage: socket.user.profileImage
          }
        };

        // Emit to all participants
        chat.participants.forEach(participant => {
          io.to(`user_${participant.id}`).emit('newMessage', response);
        });

        // Send success response
        if (typeof callback === 'function') {
          callback({ 
            status: 'success',
            message: response
          });
        }

        logger.info(`Message sent in chat ${chatId} by user ${socket.user.id}`);
      } catch (error) {
        logger.error(`Error sending message by user ${socket.user.id}:`, error.message);
        
        if (typeof callback === 'function') {
          callback({ 
            status: 'error',
            error: error.message 
          });
        }
      }
    });

    // Message read receipt handler
    socket.on('markMessagesRead', async ({ chatId, messageIds }, callback) => {
      try {
        await Message.update(
          { isRead: true },
          { 
            where: { 
              id: messageIds,
              chatId,
              senderId: { [Op.ne]: socket.user.id } // Only mark others' messages as read
            }
          }
        );

        if (typeof callback === 'function') {
          callback({ status: 'success' });
        }

        logger.info(`User ${socket.user.id} marked messages as read in chat ${chatId}`);
      } catch (error) {
        logger.error(`Error marking messages read by user ${socket.user.id}:`, error.message);
        
        if (typeof callback === 'function') {
          callback({ 
            status: 'error',
            error: error.message 
          });
        }
      }
    });

    // Health check endpoint
    socket.on('ping', (cb) => {
      if (typeof cb === 'function') {
        cb({
          status: 'pong',
          timestamp: new Date().toISOString(),
          socketId: socket.id,
          serverTime: Date.now(),
          userId: socket.user.id
        });
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.user.id} (Reason: ${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.user.id}:`, error.message);
    });
  });

  // Add global error handler
  io.of("/").adapter.on("error", (err) => {
    logger.error("Socket.IO adapter error:", err);
  });

  return io;
};

module.exports = initializeSocketIO;


//! old

// // src/config/socket.io.js
// const { Server } = require('socket.io');
// const { createClient } = require('redis');
// const { parsePhoneNumber } = require('libphonenumber-js');
// const logger = require('./logger');
// const { checkUserExist } = require('../helper/checkUserExist');
// const User = require('../models/userModel');


// const initializeSocketIO = async (httpServer, redisConfig) => {
//   // Enhanced CORS configuration
//   const io = new Server(httpServer, {
//     cors: {
//       origin: process.env.NODE_ENV === 'production' 
//         ? process.env.CLIENT_URL 
//         : ['http://localhost:5173'], // Array to match Express config
//       methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//       credentials: true,
//       allowedHeaders: ["Content-Type", "Authorization"]
//     },
//     connectionStateRecovery: {
//       maxDisconnectionDuration: 2 * 60 * 1000,
//       skipMiddlewares: true,
//     },
//     pingTimeout: 60000,
//     pingInterval: 25000,
//     maxHttpBufferSize: 1e6,
//     transports: ['websocket', 'polling'] // Explicitly set transports
//   });

//   // Redis configuration with enhanced error handling
//   let pubClient, subClient;
  
//   if (redisConfig?.socket?.host) {
//     try {
//       pubClient = createClient({
//         socket: {
//           host: redisConfig.socket.host,
//           port: redisConfig.socket.port || 6379,
//           reconnectStrategy: (retries) => {
//             const delay = Math.min(retries * 100, 5000);
//             logger.warn(`Redis connection failed, retrying in ${delay}ms`);
//             return delay;
//           }
//         }
//       });

//       subClient = pubClient.duplicate();

//       pubClient.on('error', err => {
//         logger.error('Redis Pub Client Error:', err.message);
//         if (err.code === 'ECONNREFUSED') {
//           logger.error('Make sure Redis server is running on localhost:6379');
//         }
//       });

//       subClient.on('error', err => {
//         logger.error('Redis Sub Client Error:', err.message);
//       });

//       await Promise.all([pubClient.connect(), subClient.connect()]);
      
//       const { createAdapter } = require('@socket.io/redis-adapter');
//       io.adapter(createAdapter(pubClient, subClient));
//       logger.info('Redis adapter initialized successfully');

//     } catch (err) {
//       logger.error('Redis connection failed:', err.message);
//       if (process.env.REDIS_REQUIRED === 'true') {
//         throw new Error('Redis connection failed and is required');
//       }
//       logger.warn('Continuing with in-memory adapter');
//     }
//   }

//   // Connection handler with enhanced validation
//   io.on('connection', (socket) => {
//     logger.info(`Socket connected: ${socket.id} from ${socket.handshake.address}`);
    
//     // Cleanup on disconnect
//     socket.on('disconnect', (reason) => {
//       logger.info(`Socket disconnected (${reason}): ${socket.id}`);
//     });

//     socket.on('error', (error) => {
//       logger.error(`Socket error (${socket.id}):`, error.message);
//     });

//     // In src/config/socket.io.js
// socket.on('validate-field', async ({ field, value, requestId }, callback) => {
//   try {
//     if (!['email', 'phone'].includes(field)) {
//       throw new Error(`Invalid validation field: ${field}`);
//     }

//     let validationResult;
//     if (field === 'email') {
//       const { exists } = await checkUserExist({ email: value });
//       validationResult = { 
//         valid: !exists, 
//         message: exists ? 'Email is already in use' : '',
//         field,
//         requestId
//       };
//     } else if (field === 'phone') {
//       const phoneNumber = parsePhoneNumber(value);
//       const { exists } = await checkUserExist({ phone: phoneNumber.number });
//       validationResult = { 
//         valid: !exists, 
//         message: exists ? 'Phone number already in use' : '',
//         field,
//         requestId
//       };
//     }

//     // Send response directly through callback
//     callback(validationResult);
//   } catch (error) {
//     callback({
//       valid: false,
//       error: 'Validation failed',
//       message: error.message,
//       field,
//       requestId
//     });
//   }
// });
//     // Health check endpoint
//     socket.on('ping', (cb) => {
//       if (typeof cb === 'function') {
//         cb({
//           status: 'pong',
//           timestamp: new Date().toISOString(),
//           socketId: socket.id,
//           serverTime: Date.now()
//         });
//       }
//     });
//   });

//   // Add global error handler
//   io.of("/").adapter.on("error", (err) => {
//     logger.error("Socket.IO adapter error:", err);
//   });

//   return io;
// };

// module.exports = initializeSocketIO;
































