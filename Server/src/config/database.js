// src/config/database.js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');

const requiredEnvVars = [
  'POSTGRES_DATABASE',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_HOST',
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Environment variable ${varName} is missing.`);
    process.exit(1);
  }
});

const sequelize = new Sequelize(
  process.env.POSTGRES_DATABASE,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5433,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions:
      process.env.NODE_ENV === 'production'
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false, // Set to true for verified certs
            },
          }
        : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');
    
    // Register all models and their associations
    require('../models/associations');

    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Running in production mode - applying migrations...');
      // Run migrations in production
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    } else {
      console.log('🔄 Running in development mode - synchronizing models...');
      
      const syncOptions = {
        force: false,
        alter: {
          drop: false, // Prevent dropping constraints
          add: true    // Only add new columns/constraints
        },
        logging: console.log
      };

      try {
        await sequelize.sync(syncOptions);
        console.log('🔄 Database synchronized successfully');
      } catch (syncError) {
        console.error('⚠️ Sync error (non-blocking):', syncError.message);
        
        // Try a more conservative approach if first sync fails
        if (syncError.name.includes('Constraint')) {
          console.log('🛠 Attempting conservative sync...');
          await sequelize.sync({ alter: false });
        }
      }

      // Optional: Run seeds in development
      // execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    }

    // Show created tables
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('📊 Existing tables:', tables.map(t => t.table_name));
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

connectDatabase();

module.exports = sequelize;


//! test
// require('dotenv').config({
//   path: `.env.${process.env.NODE_ENV || 'development'}`,
// });

// const { Sequelize } = require('sequelize');
// const { execSync } = require('child_process');
// const crypto = require('crypto');

// // Generate a unique application identifier
// const APP_ID = crypto.randomBytes(4).toString('hex');

// // Validate environment variables
// const requiredEnvVars = [
//   'POSTGRES_DATABASE',
//   'POSTGRES_USER',
//   'POSTGRES_PASSWORD',
//   'POSTGRES_HOST',
// ];

// requiredEnvVars.forEach((varName) => {
//   if (!process.env[varName]) {
//     console.error(`Environment variable ${varName} is missing.`);
//     process.exit(1);
//   }
// });

// // Enhanced Sequelize configuration
// const sequelize = new Sequelize(
//   process.env.POSTGRES_DATABASE,
//   process.env.POSTGRES_USER,
//   process.env.POSTGRES_PASSWORD,
//   {
//     host: process.env.POSTGRES_HOST,
//     port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
//     dialect: 'postgres',
//     logging: (msg, timing) => {
//       if (process.env.NODE_ENV === 'development') {
//         console.log(`[SQL] ${msg} (${timing}ms)`);
//       }
//     },
//     dialectOptions: {
//       ssl: process.env.NODE_ENV === 'production' ? {
//         require: true,
//         rejectUnauthorized: true,
//         ca: process.env.PG_SSL_CA // Add your CA certificate if needed
//       } : false,
//       application_name: `seq-${APP_ID}`,
//       statement_timeout: 10000, // 10 seconds timeout
//     },
//     pool: {
//       max: 10,
//       min: 2,
//       acquire: 30000,
//       idle: 10000,
//       evict: 10000 // Run idle connection check every 10s
//     },
//     define: {
//       freezeTableName: true, // Prevent table name pluralization
//       underscored: true, // Use snake_case for column names
//       timestamps: true, // Enable createdAt and updatedAt
//       paranoid: true, // Enable soft deletes
//       charset: 'utf8',
//       collate: 'utf8_general_ci',
//     },
//     benchmark: true, // Log query timing
//     isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
//     retry: {
//       max: 3,
//       match: [
//         /ConnectionError/,
//         /ConnectionTimedOutError/,
//         /TimeoutError/,
//         Sequelize.ConnectionError,
//         Sequelize.ConnectionRefusedError,
//         Sequelize.ConnectionTimedOutError
//       ],
//     },
//     hooks: {
//       beforeDefine: (attributes, options) => {
//         // Global validation for model attributes
//         Object.keys(attributes).forEach(key => {
//           if (!attributes[key].validate) {
//             attributes[key].validate = {};
//           }
//         });
//       }
//     }
//   }
// );

// // Enhanced database connection handler
// const connectDatabase = async () => {
//   try {
//     console.log('🔌 Attempting database connection...');
    
//     // Test authentication
//     await sequelize.authenticate();
//     console.log('✅ Database authenticated successfully');

//     // Register models and associations
//     console.log('🔄 Registering models...');
//     require('../models/associations');

//     // Database synchronization strategy
//     if (process.env.NODE_ENV === 'production') {
//       console.log('🚀 Production mode - running migrations...');
//       try {
//         execSync('npx sequelize-cli db:migrate', { 
//           stdio: 'inherit',
//           timeout: 300000 // 5 minute timeout
//         });
//         console.log('✅ Migrations completed successfully');
//       } catch (migrateError) {
//         console.error('❌ Migration failed:', migrateError);
//         process.exit(1);
//       }
//     } else {
//       console.log('🛠 Development mode - synchronizing models...');
      
//       const syncOptions = {
//         force: false,
//         alter: {
//           drop: false,
//           add: true,
//           // Additional safety checks
//           check: true,
//           // Whitelist specific alter operations
//           fields: ['add', 'remove', 'modify'],
//           indexes: ['add', 'remove']
//         },
//         hooks: true,
//         logging: console.log
//       };

//       try {
//         await sequelize.sync(syncOptions);
//         console.log('🔄 Database synchronized successfully');
//       } catch (syncError) {
//         console.error('⚠️ Sync error:', syncError.message);
        
//         // Fallback to safer sync if first attempt fails
//         try {
//           console.log('🛠 Attempting conservative sync...');
//           await sequelize.sync({ alter: false });
//           console.log('🔄 Database synchronized (conservative mode)');
//         } catch (fallbackError) {
//           console.error('❌ Fallback sync failed:', fallbackError);
//           throw fallbackError;
//         }
//       }
//     }

//     // Audit existing tables and their structure
//     try {
//       const [tables] = await sequelize.query(`
//         SELECT 
//           table_name, 
//           table_type,
//           pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
//         FROM information_schema.tables 
//         WHERE table_schema = 'public'
//         ORDER BY table_name
//       `);
      
//       console.log('📊 Database schema report:');
//       console.table(tables);

//       // Sample row counts for each table (for development)
//       if (process.env.NODE_ENV === 'development') {
//         for (const table of tables) {
//           const [count] = await sequelize.query(
//             `SELECT COUNT(*) FROM "${table.table_name}"`
//           );
//           table.row_count = count[0].count;
//         }
//         console.log('📈 Table row counts:');
//         console.table(tables);
//       }
//     } catch (auditError) {
//       console.warn('⚠️ Could not audit database structure:', auditError.message);
//     }

//   } catch (error) {
//     console.error('❌ Database connection failed:', error);
    
//     // Enhanced error handling
//     if (error.original && error.original.code) {
//       console.error('Database error code:', error.original.code);
//     }
    
//     // Exit with specific code for connection issues
//     if (error.name === 'SequelizeConnectionError') {
//       process.exit(101); // Custom exit code for connection failures
//     }
    
//     process.exit(1);
//   }
// };

// // Add graceful shutdown
// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received - closing database connections');
//   try {
//     await sequelize.close();
//     console.log('Database connections closed gracefully');
//     process.exit(0);
//   } catch (err) {
//     console.error('Error closing database connections:', err);
//     process.exit(1);
//   }
// });

// // Connection monitoring
// setInterval(async () => {
//   try {
//     await sequelize.query('SELECT 1');
//   } catch (err) {
//     console.error('Database heartbeat failed:', err);
//   }
// }, 30000); // Every 30 seconds

// module.exports = {
//   sequelize,
//   connectDatabase,
//   APP_ID
// };






