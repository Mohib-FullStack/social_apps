const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Post content cannot be empty'
      },
      len: {
        args: [1, 5000],
        msg: 'Post must be between 1 and 5000 characters'
      }
    }
  },
  privacy: {
    type: DataTypes.ENUM('public', 'friends', 'private'),
    defaultValue: 'friends',
    validate: {
      isIn: [['public', 'friends', 'private']]
    }
  },
  allowComments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'posts',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['groupId'] }
  ]
});

module.exports = Post;