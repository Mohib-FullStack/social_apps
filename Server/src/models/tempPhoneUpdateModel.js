const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const isDevelopment = process.env.NODE_ENV === 'development';

class TempPhoneUpdate extends Model {
  // Development helper methods
  static async clearTestRecords(userId) {
    await this.destroy({
      where: {
        userId,
        isTestRecord: true
      }
    });
  }

  static async createTestRecord(params) {
    return this.create({
      ...params,
      isTestRecord: true
    });
  }
}

TempPhoneUpdate.init({
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
    },
    onDelete: 'CASCADE'
  },
  newPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\+?[\d\s-]+$/
    }
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      max: isDevelopment ? 100 : 5
    }
  },
  isTestRecord: {
    type: DataTypes.BOOLEAN,
    defaultValue: isDevelopment
  }
}, {
  sequelize,
  modelName: 'TempPhoneUpdate',
  tableName: 'temp_phone_updates',
  timestamps: true,
  paranoid: !isDevelopment,
  indexes: [
    ...(isDevelopment ? [] : [{
      fields: ['userId'],
      unique: true
    }]),
    {
      fields: ['expiresAt']
    },
    ...(isDevelopment ? [{
      fields: ['isTestRecord']
    }] : [])
  ]
});

module.exports = TempPhoneUpdate;











// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const isDevelopment = process.env.NODE_ENV === 'development';

// const TempPhoneUpdate = sequelize.define('TempPhoneUpdate', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   userId: {  // Add this missing field
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   newPhone: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       is: /^\+?[\d\s-]+$/
//     }
//   },
//   otp: {
//     type: DataTypes.STRING(6),
//     allowNull: false
//   },
//   expiresAt: {
//     type: DataTypes.DATE,
//     allowNull: false
//   },
//   attempts: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0,
//     validate: {
//       max: isDevelopment ? 100 : 5
//     }
//   },
//   isTestRecord: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: isDevelopment
//   }
// }, {
//   timestamps: true,
//   indexes: [
//     ...(isDevelopment ? [] : [{
//       fields: ['userId'],
//       unique: true
//     }]),
//     {
//       fields: ['expiresAt']
//     },
//     ...(isDevelopment ? [{
//       fields: ['isTestRecord']
//     }] : [])
//   ],
//   paranoid: !isDevelopment
// });

// // Development helper methods
// if (isDevelopment) {
//   TempPhoneUpdate.clearTestRecords = async function(userId) {
//     await this.destroy({
//       where: {
//         userId,
//         isTestRecord: true
//       }
//     });
//   };

//   TempPhoneUpdate.createTestRecord = async function(params) {
//     return this.create({
//       ...params,
//       isTestRecord: true
//     });
//   };
// }



// module.exports = TempPhoneUpdate;

