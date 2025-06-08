const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Post extends Model {
  // Instance methods
  getPreview() {
    return this.content.length > 100
      ? this.content.slice(0, 100) + '...'
      : this.content;
  }

  // Static methods
  static async getRecentPostsByUser(userId, limit = 10) {
    return await Post.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  // Associations
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
    
    this.hasMany(models.Comment, {
      foreignKey: 'postId',
      as: 'comments',
      onDelete: 'CASCADE'
    });
    
    this.hasMany(models.Media, {
      foreignKey: 'postId',
      as: 'media',
      onDelete: 'CASCADE'
    });
    
    this.hasMany(models.Like, {
      foreignKey: 'postId',
      as: 'likes',
      onDelete: 'CASCADE'
    });
    
    this.belongsTo(models.Group, {
      foreignKey: 'groupId',
      as: 'group',
      onDelete: 'SET NULL'
    });
  }
}

Post.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'groups',
      key: 'id'
    },
    onDelete: 'SET NULL'
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
  sequelize,
  modelName: 'Post',
  tableName: 'posts',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['groupId'] }
  ]
});

module.exports = Post;






//! function
// // src/models/postModel.js
// module.exports = (sequelize, DataTypes) => {
//   const Post = sequelize.define('Post', {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//       validate: {
//         notEmpty: { msg: 'Post content cannot be empty' },
//         len: [1, 5000]
//       }
//     },
//     privacy: {
//       type: DataTypes.ENUM('public', 'friends', 'private'),
//       defaultValue: 'friends',
//     },
//     allowComments: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true
//     }
//   }, {
//     tableName: 'posts',
//     timestamps: true,
//     paranoid: true,
//     indexes: [{ fields: ['userId'] }]
//   });

//   return Post;
// };
