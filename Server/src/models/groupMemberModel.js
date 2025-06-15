const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'groups',
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
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member',
    validate: {
      isIn: [['admin', 'member']]
    }
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'group_members',
  timestamps: true,
  paranoid: true,
  indexes: [
    { 
      unique: true,
      fields: ['groupId', 'userId']
    },
    { fields: ['userId'] }
  ]
});

module.exports = GroupMember;