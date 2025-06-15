// src/models/postModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Post content cannot be empty' },
        len: [1, 5000]
      }
    },
    privacy: {
      type: DataTypes.ENUM('public', 'friends', 'private'),
      defaultValue: 'friends',
    },
    allowComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ['userId'] }]
  });


  module.exports = Post