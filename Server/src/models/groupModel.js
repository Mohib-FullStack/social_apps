const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100],
      notEmpty: true
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  privacy: {
    type: DataTypes.ENUM('public', 'private', 'secret'),
    defaultValue: 'public',
    validate: {
      isIn: [['public', 'private', 'secret']]
    }
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'groups',
  timestamps: true,
  paranoid: true,
  indexes: [
    { 
      fields: ['name'],
      unique: true 
    },
    { 
      fields: ['privacy'] 
    },
    { 
      fields: ['creatorId'] 
    }
  ]
});

module.exports = Group;