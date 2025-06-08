const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
      onDelete: 'CASCADE'
    });
    
    this.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver',
      onDelete: 'CASCADE'
    });
    
    this.belongsTo(models.Chat, {
      foreignKey: 'chatId',
      as: 'chat',
      onDelete: 'CASCADE'
    });
  }
}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Message',
  tableName: 'messages',
  timestamps: true,
  indexes: [
    { fields: ['senderId'] },
    { fields: ['receiverId'] },
    { fields: ['chatId'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Message;











//! with function
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
