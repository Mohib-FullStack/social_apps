// src/config/loadEnv.js
const dotenv = require('dotenv');
const path = require('path');

// Choose env file based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
const envPath = path.resolve(__dirname, '../../', envFile);

// Load the selected .env file
dotenv.config({ path: envPath });

console.log(`[ENV] Loaded environment: ${process.env.NODE_ENV}`);
