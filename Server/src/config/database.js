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


//! running
// src/config/database.js
// src/config/database.js
// require('dotenv').config({
//   path: `.env.${process.env.NODE_ENV || 'development'}`,
// });

// const { Sequelize } = require('sequelize');
// const { execSync } = require('child_process');

// // Use chalk's CommonJS version explicitly to avoid ES modules warning
// const chalk = require('chalk');


// // Validate environment variables
// const requiredEnvVars = [
//   'POSTGRES_DATABASE',
//   'POSTGRES_USER',
//   'POSTGRES_PASSWORD',
//   'POSTGRES_HOST',
// ];

// // Check for missing environment variables
// let missingVars = false;
// requiredEnvVars.forEach((varName) => {
//   if (!process.env[varName]) {
//     console.error(chalk.red(`❌ Missing environment variable: ${varName}`));
//     missingVars = true;
//   }
// });

// if (missingVars) {
//   process.exit(1);
// }

// // Initialize Sequelize
// const sequelize = new Sequelize(
//   process.env.POSTGRES_DATABASE,
//   process.env.POSTGRES_USER,
//   process.env.POSTGRES_PASSWORD,
//   {
//     host: process.env.POSTGRES_HOST,
//     port: process.env.POSTGRES_PORT || 5433,
//     dialect: 'postgres',
//     logging: process.env.NODE_ENV === 'development' 
//       ? (msg) => console.log(chalk.gray(`[SQL] ${msg}`)) 
//       : false,
//     dialectOptions: {
//       ...(process.env.NODE_ENV === 'production' && {
//         ssl: {
//           require: true,
//           rejectUnauthorized: false,
//         },
//       }),
//     },
//     pool: {
//       max: 10,
//       min: 2,
//       acquire: 30000,
//       idle: 10000,
//     },
//     define: {
//       timestamps: true,
//       underscored: true,
//       paranoid: true,
//     },
//   }
// );

// // Database connection and synchronization
// (async () => {
//   try {
//     console.log(chalk.blue('🔌 Connecting to database...'));
//     await sequelize.authenticate();
//     console.log(chalk.green('✅ Database connected'));

//     // Load models - ensure this path is correct for your project
//     require('../models/associations');
//     console.log(chalk.blue('📦 Models loaded'));

//     // Database synchronization strategy
//     if (process.env.NODE_ENV === 'production') {
//       console.log(chalk.yellow('🚀 Running migrations...'));
//       execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
//     } else {
//       console.log(chalk.blue('🛠 Syncing models...'));
//       try {
//         await sequelize.sync({
//           force: process.env.FORCE_SYNC === 'true',
//           alter: { drop: false, add: true },
//         });
//         console.log(chalk.green('🔄 Sync complete'));
//       } catch (syncError) {
//         console.error(chalk.yellow('⚠️ Sync error:'), syncError.message);
//         console.log(chalk.blue('🛠 Attempting conservative sync...'));
//         await sequelize.sync({ alter: false });
//       }
//     }

//     // Show tables for diagnostics
//     try {
//       const [tables] = await sequelize.query(`
//         SELECT table_name 
//         FROM information_schema.tables 
//         WHERE table_schema = 'public'
//         ORDER BY table_name
//       `);
//       console.log(chalk.blue('📊 Database tables:'), tables.map(t => t.table_name).join(', '));
//     } catch (queryError) {
//       console.error(chalk.yellow('⚠️ Could not list tables:'), queryError.message);
//     }

//   } catch (error) {
//     console.error(chalk.red('❌ Database error:'), error);
//     process.exit(1);
//   }
// })();

// // Export just the sequelize instance
// module.exports = sequelize;




