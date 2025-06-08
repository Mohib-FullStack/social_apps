const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Media extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
    
    this.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
      onDelete: 'CASCADE'
    });
  }
}

Media.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  type: {
    type: DataTypes.ENUM('image', 'video'),
    defaultValue: 'image',
    validate: {
      isIn: [['image', 'video']]
    }
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  sequelize,
  modelName: 'Media',
  tableName: 'media',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['postId'] },
    { fields: ['userId'] }
  ]
});

module.exports = Media;









//! with function
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Media = sequelize.define('Media', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   url: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       isUrl: true
//     }
//   },
//   type: {
//     type: DataTypes.ENUM('image', 'video'),
//     defaultValue: 'image',
//     validate: {
//       isIn: [['image', 'video']]
//     }
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
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   }
// }, {
//   tableName: 'media',
//   timestamps: true,
//   paranoid: true,
//   indexes: [
//     { fields: ['postId'] },
//     { fields: ['userId'] }
//   ]
// });

// module.exports = Media;