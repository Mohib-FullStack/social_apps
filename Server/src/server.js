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

























