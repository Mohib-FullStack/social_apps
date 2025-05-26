// src/models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./userModel');
const Friendship = require('./friendshipModel');
const Notification = require('./notificationModel');
const Chat = require('./chatModel');

// Set up associations
require('./associations');

module.exports = {
  sequelize,
  Sequelize,
  User,
  Friendship,
  Notification,
  Chat
};
