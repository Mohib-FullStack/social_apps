// src/models/messageModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reactions: {
    type: DataTypes.JSON,
    defaultValue: {}  // Store as { userId: emoji } pairs
  },
  edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readBy: {
    type: DataTypes.ARRAY(DataTypes.INTEGER), // Array of user IDs
    defaultValue: []
  }
}, {
  tableName: 'Messages',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['chatId'] },
    { fields: ['senderId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Message;






