const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ChatParticipant extends Model {
  static associate(models) {
    this.belongsTo(models.Chat, {
      foreignKey: 'chatId',
      as: 'chat',
      onDelete: 'CASCADE'
    });
    
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
  }
}

ChatParticipant.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chats',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ChatParticipant',
  tableName: 'chat_participants',
  timestamps: true,
  indexes: [
    { fields: ['chatId'] },
    { fields: ['userId'] },
    { 
      unique: true,
      fields: ['chatId', 'userId']
    }
  ]
});

module.exports = ChatParticipant;








//! with function
// // src/models/chatParticipantModel.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const ChatParticipant = sequelize.define('ChatParticipant', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   }
// }, {
//   tableName: 'ChatParticipants',
//   timestamps: true,
//   createdAt: 'createdAt',
//   updatedAt: 'updatedAt',
//   indexes: [
//     { fields: ['chatId'] },
//     { fields: ['userId'] }
//   ]
// });

// module.exports = ChatParticipant;