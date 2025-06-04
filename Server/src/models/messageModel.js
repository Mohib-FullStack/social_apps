const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Message',
  tableName: 'messages',
  timestamps: true
});

module.exports = Message;












// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Message = sequelize.define('Message', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   senderId: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   receiverId: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   content: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   }
// }, {
//   tableName: 'messages',
//   timestamps: true
// });

// module.exports = Message;
