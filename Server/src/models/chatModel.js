// src/models/chatModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('dm', 'group'),
    defaultValue: 'dm',
    allowNull: false
  },
  user1Id: {
    type: DataTypes.INTEGER,
    allowNull: true // Nullable for group chats
  },
  user2Id: {
    type: DataTypes.INTEGER,
    allowNull: true // Nullable for group chats
  },
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'chats',
  timestamps: true,
  indexes: [
    { fields: ['lastMessageAt'] },
    {
      unique: true,
      fields: ['user1Id', 'user2Id'],
      where: { type: 'dm' }
    }
  ]
});

// Define associations
Chat.associate = function(models) {
  Chat.hasMany(models.Message, {
    foreignKey: 'chatId',
    as: 'messages',
    onDelete: 'CASCADE'
  });
  
  Chat.belongsTo(models.User, {
    foreignKey: 'user1Id',
    as: 'user1'
  });
  
  Chat.belongsTo(models.User, {
    foreignKey: 'user2Id',
    as: 'user2'
  });
  
  Chat.belongsToMany(models.User, {
    through: models.ChatParticipant,
    as: 'participants',
    foreignKey: 'chatId',
    onDelete: 'CASCADE'
  });
};

module.exports = Chat;