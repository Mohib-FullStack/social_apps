// src/server.js
require('./config/loadEnv');

const { server } = require('./app');
const { serverPort, redisConfig } = require('./secret');
const sequelize = require('./config/database');
const logger = require('./config/logger');
const initializeSocketIO = require('./config/socket.io');

// ASCII Art for visual separation
const printBanner = () => {
  logger.info(`
  ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
  ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
  ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
  ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
  ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
  ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
  `);
  logger.info(`🚀 Starting Server (${process.env.NODE_ENV || 'development'})`);
};

const checkDatabase = async () => {
  try {
    logger.info('🔍 Checking database connection...');
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Display model count
    const modelCount = Object.keys(sequelize.models).length;
    logger.info(`📦 Registered ${modelCount} Sequelize models`);

    return true;
  } catch (error) {
    logger.error('❌ Database connection failed', { 
      error: error.message,
      stack: error.stack 
    });
    return false;
  }
};

const syncDatabase = async () => {
  try {
    const options = {
      alter: process.env.NODE_ENV !== 'production',
      logging: (msg) => logger.debug(`🗄️ ${msg}`)
    };

    logger.info('🔄 Synchronizing database...');
    await sequelize.sync(options);
    logger.info('✅ Database synchronized successfully');

    // Display tables with better formatting
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    if (tables.length > 0) {
      logger.info('📊 Database Tables:');
      tables.forEach((table, index) => {
        logger.info(`  ${index + 1}. ${table.table_name}`);
      });
    } else {
      logger.warn('⚠️ No tables found in public schema');
    }

    return true;
  } catch (error) {
    logger.error('❌ Database synchronization failed', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

const startSocketIO = async () => {
  try {
    logger.info('🔌 Initializing WebSocket server...');
    const io = await initializeSocketIO(server, redisConfig);
    
    io.on('connection', (socket) => {
      logger.debug(`➕ Socket connected: ${socket.id}`);
    });

    logger.info('✅ WebSocket server ready');
    return true;
  } catch (error) {
    logger.error('❌ WebSocket initialization failed', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

const startServer = async () => {
  printBanner();

  try {
    // Database setup
    if (!(await checkDatabase())) process.exit(1);
    if (!(await syncDatabase())) process.exit(1);

    // WebSocket setup
    if (!(await startSocketIO())) process.exit(1);

    // HTTP server
    server.listen(serverPort, () => {
      logger.info(`🌐 HTTP Server running on http://localhost:${serverPort}`);
      logger.info(`🔌 WebSocket available on ws://localhost:${serverPort}`);
      logger.info(`⏱ Server started in ${process.uptime().toFixed(2)} seconds`);
    });

  } catch (err) {
    logger.error('🔥 Critical startup failure', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
};

// Enhanced error handlers
process.on('unhandledRejection', (err) => {
  logger.error('🚨 Unhandled Rejection:', {
    message: err.message,
    stack: err.stack
  });
});

process.on('uncaughtException', (err) => {
  logger.error('💥 Uncaught Exception:', {
    message: err.message,
    stack: err.stack
  });
  process.exit(1);
});

startServer();



//! curent this is also fine
// src/server.js
// src/server.js
// require('./config/loadEnv');

// const { server } = require('./app');
// const { serverPort, redisConfig } = require('./secret');
// const sequelize = require('./config/database');
// const logger = require('./config/logger');
// const initializeSocketIO = require('./config/socket.io');

// const startServer = async () => {
//   try {
//     // Authenticate DB connection
//     await sequelize.authenticate();
//     logger.info('✅ Database connection established');

//     // Log registered models
//     logger.info('📦 Registered models:', Object.keys(sequelize.models));

//     // Sync models with logging
//     await sequelize.sync({
//       alter: process.env.NODE_ENV !== 'production',
//       logging: (msg) => logger.debug(msg),
//     });
//     logger.info('🔄 Sequelize models synchronized');

//     // Show existing tables
//     const [tables] = await sequelize.query(
//       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
//     );
//     logger.info('📊 Existing tables:', tables.map(t => t.table_name));

//     // Initialize WebSocket with Redis
//     await initializeSocketIO(server, redisConfig);

//     // Start HTTP server
//     server.listen(serverPort, () => {
//       logger.info(`🚀 Server running on http://localhost:${serverPort}`);
//       logger.info(`🔌 WebSocket available on ws://localhost:${serverPort}`);
//     });

//   } catch (err) {
//     logger.error(`❌ Server startup failed: ${err.message}`, { stack: err.stack });
//     process.exit(1);
//   }
// };

// // Global unhandled promise rejection handler
// process.on('unhandledRejection', (err) => {
//   logger.error('🚨 Unhandled Rejection:', { message: err.message, stack: err.stack });
// });

// startServer();


















































