const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserFriends = sequelize.define('UserFriends', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'rejected']]
    }
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_friends',
  timestamps: true,
  paranoid: true,
  indexes: [
    { 
      unique: true,
      fields: ['userId', 'friendId'],
      name: 'user_friends_user_id_friend_id'
    },
    {
      name: 'unique_friendship',
      unique: true,
      fields: [
        sequelize.literal('LEAST("userId", "friendId")'), 
        sequelize.literal('GREATEST("userId", "friendId")')
      ]
    }
  ]
});

module.exports = UserFriends;