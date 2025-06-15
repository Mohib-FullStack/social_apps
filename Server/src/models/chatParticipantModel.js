// src/models/chatParticipantModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


  const ChatParticipant = sequelize.define('ChatParticipant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Chats',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    role: {
      type: DataTypes.ENUM('member', 'admin', 'creator'),
      defaultValue: 'member'
    }
  }, {
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['chatId', 'userId']
      }
    ]
  });

module.exports = ChatParticipant