const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Friendship = sequelize.define('Friendship', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
    defaultValue: 'pending'
  },
  actionUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  tableName: 'friendships',
  indexes: [
    { 
      unique: true,
      fields: ['userId', 'friendId']
    },
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['friendId', 'status']
    }
  ],
  hooks: {
    beforeUpdate: async (friendship) => {
      if (friendship.changed('status') && friendship.status === 'accepted') {
        friendship.acceptedAt = new Date();
      }
    }
  }
});

// Then in your associations file (where you set up model relationships), you would add:
// User.belongsToMany(User, {
//   through: Friendship,
//   as: 'Friends',
//   foreignKey: 'userId',
//   otherKey: 'friendId'
// });
// 
// User.belongsToMany(User, {
//   through: Friendship,
//   as: 'FriendOf',
//   foreignKey: 'friendId',
//   otherKey: 'userId'
// });

module.exports = Friendship;