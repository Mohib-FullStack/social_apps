// src/redisClient.js
const redis = require('redis');
const { redisConfig } = require('./secret');

// Create Redis client
const redisClient = redis.createClient(redisConfig);

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis connection established');
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();

module.exports = redisClient;

