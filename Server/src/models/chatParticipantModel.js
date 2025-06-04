// src/models/chatParticipantModel.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ChatParticipant extends Model {}

ChatParticipant.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'ChatParticipant',
  tableName: 'ChatParticipants',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['chatId'] },
    { fields: ['userId'] }
  ]
});

module.exports = ChatParticipant;









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