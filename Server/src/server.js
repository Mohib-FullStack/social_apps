require('./config/loadEnv');

const { app, server } = require('./app');
const { serverPort, redisConfig } = require('./secret');
const sequelize = require('./config/database');
const logger = require('./config/logger');
const initializeSocketIO = require('./config/socket.io');

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

    app.attachSocketIO(io); // ✅ Inject io into req.io for controllers

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
    if (!(await checkDatabase())) process.exit(1);
    if (!(await syncDatabase())) process.exit(1);
    if (!(await startSocketIO())) process.exit(1);

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































































