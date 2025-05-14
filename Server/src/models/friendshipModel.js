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
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
    defaultValue: 'pending'
  },
  actionUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'friendships',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'friendId']
    },
    { fields: ['userId', 'status'] },
    { fields: ['friendId', 'status'] }
  ],
  hooks: {
    beforeUpdate: async (friendship) => {
      if (friendship.changed('status') && friendship.status === 'accepted') {
        friendship.acceptedAt = new Date();
      }
    }
  }
});

// Add associations in your model initialization file
// Friendship.belongsTo(User, { as: 'requester', foreignKey: 'userId' });
// Friendship.belongsTo(User, { as: 'requested', foreignKey: 'friendId' });

module.exports = Friendship;