const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Chat extends Model {
  static associate(models) {
    this.hasMany(models.Message, {
      foreignKey: 'chatId',
      as: 'messages',
      onDelete: 'CASCADE'
    });
    
    this.belongsToMany(models.User, {
      through: models.ChatParticipant,
      as: 'participants',
      foreignKey: 'chatId',
      onDelete: 'CASCADE'
    });
  }
}

Chat.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
  sequelize,
  modelName: 'Chat',
  tableName: 'chats',
  timestamps: true,
  indexes: [
    { fields: ['lastMessageAt'] }
  ]
});

module.exports = Chat;






//! with function
// // src/models/chatModel.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Chat = sequelize.define('Chat', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   lastMessage: {
//     type: DataTypes.TEXT,
//     allowNull: true
//   },
//   lastMessageAt: {
//     type: DataTypes.DATE,
//     allowNull: true
//   }
// }, {
//   tableName: 'Chats',
//   timestamps: true,
//   createdAt: 'createdAt',
//   updatedAt: 'updatedAt'
// });

// module.exports = Chat;
  