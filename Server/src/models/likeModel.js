const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Like extends Model {}

Like.init({
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
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  reactionType: {
    type: DataTypes.ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry'),
    allowNull: false,
    defaultValue: 'like',
    validate: {
      isIn: [['like', 'love', 'laugh', 'wow', 'sad', 'angry']]
    }
  }
}, {
  sequelize,
  modelName: 'Like',
  tableName: 'likes',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['postId'] },
    { fields: ['commentId'] }
  ]
});

module.exports = Like;








// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Like = sequelize.define('Like', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
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
//     allowNull: true,
//     references: {
//       model: 'posts',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   },
//   commentId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'comments',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   },
//   reactionType: {
//     type: DataTypes.ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry'),
//     allowNull: false,
//     defaultValue: 'like',
//     validate: {
//       isIn: [['like', 'love', 'laugh', 'wow', 'sad', 'angry']]
//     }
//   }
// }, {
//   tableName: 'likes',
//   timestamps: true,
//   paranoid: true,
//   indexes: [
//     { fields: ['userId'] },
//     { fields: ['postId'] },
//     { fields: ['commentId'] }
//   ]
// });

// module.exports = Like;