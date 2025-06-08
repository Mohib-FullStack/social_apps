const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UserFollows extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'followerId',
      as: 'follower',
      onDelete: 'CASCADE'
    });
    
    this.belongsTo(models.User, {
      foreignKey: 'followingId',
      as: 'following',
      onDelete: 'CASCADE'
    });
  }
}

UserFollows.init({
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive']]
    }
  }
}, {
  sequelize,
  modelName: 'UserFollows',
  tableName: 'user_follows',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    },
    { fields: ['followerId'] },
    { fields: ['followingId'] }
  ]
});

module.exports = UserFollows;








//!  withfunction
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const UserFollows = sequelize.define('UserFollows', {
//   followerId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     references: {
//       model: 'users',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   },
//   followingId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     references: {
//       model: 'users',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   },
//   status: {
//     type: DataTypes.ENUM('active', 'inactive'),
//     defaultValue: 'active',
//     validate: {
//       isIn: [['active', 'inactive']]
//     }
//   }
// }, {
//   tableName: 'user_follows',
//   timestamps: true,
//   paranoid: true,
//   indexes: [
//     { 
//       unique: true,
//       fields: ['followerId', 'followingId']
//     },
//     { fields: ['followerId'] },
//     { fields: ['followingId'] }
//   ]
// });

// module.exports = UserFollows;