//! src/models/friendshipModel
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Friendship = sequelize.define('Friendship', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'), // ✅ Added more status options for flexibility
    defaultValue: 'pending'
  },
  actionUserId: {
    type: DataTypes.INTEGER,
    allowNull: true // ✅ Optional - Who acted last (used for UI/UX insights)
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true // ✅ Timestamp for when the friendship was accepted
  }
}, {
  tableName: 'friendships',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'friendId'] // ✅ Ensures no duplicate friendships
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
      // ✅ Automatically set acceptedAt when friendship is accepted
      if (friendship.changed('status') && friendship.status === 'accepted') {
        friendship.acceptedAt = new Date();
      }
    }
  }
});

module.exports = Friendship;
