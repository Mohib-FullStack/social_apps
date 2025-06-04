const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Comment extends Model {}

Comment.init({
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
        msg: 'Comment content cannot be empty'
      },
      len: {
        args: [1, 2000],
        msg: 'Comment must be between 1 and 2000 characters'
      }
    },
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
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
}, {
  sequelize,
  modelName: 'Comment',
  tableName: 'comments',
  timestamps: true,
  paranoid: true,
  indexes: [
    { 
      fields: ['userId'],
      name: 'comments_userId_index' 
    },
    { 
      fields: ['postId'],
      name: 'comments_postId_index' 
    },
    { 
      fields: ['parentId'],
      name: 'comments_parentId_index' 
    },
  ],
});

module.exports = Comment;










// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Comment = sequelize.define('Comment', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   content: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//     validate: {
//       notEmpty: {
//         msg: 'Comment content cannot be empty'
//       },
//       len: {
//         args: [1, 2000],
//         msg: 'Comment must be between 1 and 2000 characters'
//       }
//     },
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   },
//   postId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'posts',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   },
//   parentId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'comments',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   },
// }, {
//   tableName: 'comments',
//   timestamps: true,
//   paranoid: true,
//   indexes: [
//     { 
//       fields: ['userId'],
//       name: 'comments_userId_index' 
//     },
//     { 
//       fields: ['postId'],
//       name: 'comments_postId_index' 
//     },
//     { 
//       fields: ['parentId'],
//       name: 'comments_parentId_index' 
//     },
//   ],
// });

// module.exports = Comment;