const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./userModel');
const Friendship = require('./friendshipModel');

// This sets up all associations
require('./associations');

module.exports = {
  sequelize,
  Sequelize,
  User,
  Friendship
};
