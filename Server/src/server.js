// src/server.js
require('./config/loadEnv');

const { server } = require('./app');
const { serverPort, redisConfig } = require('./secret');
const sequelize = require('./config/database');
const logger = require('./config/logger');
const initializeSocketIO = require('./config/socket.io');

const startServer = async () => {
  try {
    // Authenticate DB connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Log registered models
    logger.info('📦 Registered models:', Object.keys(sequelize.models));

    // Sync models with logging
    await sequelize.sync({
      alter: process.env.NODE_ENV !== 'production',
      logging: (msg) => logger.debug(msg),
    });
    logger.info('🔄 Sequelize models synchronized');

    // Show existing tables
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    logger.info('📊 Existing tables:', tables.map(t => t.table_name));

    // Initialize WebSocket with Redis
    await initializeSocketIO(server, redisConfig);

    // Start HTTP server
    server.listen(serverPort, () => {
      logger.info(`🚀 Server running on http://localhost:${serverPort}`);
      logger.info(`🔌 WebSocket available on ws://localhost:${serverPort}`);
    });

  } catch (err) {
    logger.error(`❌ Server startup failed: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
};

// Global unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
  logger.error('🚨 Unhandled Rejection:', { message: err.message, stack: err.stack });
});

startServer();




//! running
// require('./config/loadEnv');

// const { server } = require('./app');
// const { serverPort, redisConfig } = require('./secret');

// // Import models FIRST before database operations
//   const sequelize = require('./config/database');

// const logger = require('./config/logger');
// const initializeSocketIO = require('./config/socket.io');

// const startServer = async () => {
//   try {
//     await sequelize.authenticate();
//     logger.info('Database connection established');

//     // Add verification of loaded models
//     logger.info('Registered models:', Object.keys(sequelize.models));

//     // Enhanced sync with logging
//     await sequelize.sync({ 
//       alter: process.env.NODE_ENV !== 'production',
//       logging: (msg) => logger.debug(msg) 
//     });

//     // Verify tables were created
//     const tables = await sequelize.query(
//       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
//     );
//     logger.info('Existing tables:', tables[0].map(t => t.table_name));

//     // Initialize Socket.IO
//     await initializeSocketIO(server, redisConfig);

//     server.listen(serverPort, () => {
//       logger.info(`Server running on http://localhost:${serverPort}`);
//       logger.info(`WebSocket available on ws://localhost:${serverPort}`);
//     });
//   } catch (err) {
//     logger.error('Server startup failed:', err);
//     process.exit(1);
//   }
// };

// process.on('unhandledRejection', (err) => {
//   logger.error('Unhandled Rejection:', err);
// });

// startServer();




















