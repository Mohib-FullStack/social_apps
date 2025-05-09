//! test for development mode good
// const sequelize = require('../config/database');
// const { DataTypes } = require('sequelize');
// // Determine if we're in development mode
// const isDevelopment = process.env.NODE_ENV === 'development';

// const TempPhoneUpdate = sequelize.define('TempPhoneUpdate', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   userId: {
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
//       max: isDevelopment ? 100 : 5 // Higher limit for development
//     }
//   },
//   isTestRecord: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: isDevelopment // Mark test records in development
//   }
// }, {
//   timestamps: true,
//   indexes: [
//     // Only enforce unique userId constraint in production
//     ...(isDevelopment ? [] : [{
//       fields: ['userId'],
//       unique: true
//     }]),
//     // Always index expiresAt for performance
//     {
//       fields: ['expiresAt']
//     },
//     // Additional index for development cleanup
//     ...(isDevelopment ? [{
//       fields: ['isTestRecord']
//     }] : [])
//   ],
//   // Enable paranoid mode only in production
//   paranoid: !isDevelopment
// });

// // Add association to User model
// TempPhoneUpdate.associate = function(models) {
//   TempPhoneUpdate.belongsTo(models.User, {
//     foreignKey: 'userId',
//     as: 'user',
//     onDelete: 'CASCADE'
//   });
// };

// // Add development helper methods
// if (isDevelopment) {
//   /**
//    * Clears all test records for a user
//    * @param {number} userId 
//    */
//   TempPhoneUpdate.clearTestRecords = async function(userId) {
//     await this.destroy({
//       where: {
//         userId,
//         isTestRecord: true
//       }
//     });
//   };

//   /**
//    * Creates a test OTP record bypassing normal constraints
//    */
//   TempPhoneUpdate.createTestRecord = async function(params) {
//     return this.create({
//       ...params,
//       isTestRecord: true
//     });
//   };
// }

// module.exports = TempPhoneUpdate;


//! review
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const isDevelopment = process.env.NODE_ENV === 'development';

const TempPhoneUpdate = sequelize.define('TempPhoneUpdate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {  // Add this missing field
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
  timestamps: true,
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
  ],
  paranoid: !isDevelopment
});

// Development helper methods
if (isDevelopment) {
  TempPhoneUpdate.clearTestRecords = async function(userId) {
    await this.destroy({
      where: {
        userId,
        isTestRecord: true
      }
    });
  };

  TempPhoneUpdate.createTestRecord = async function(params) {
    return this.create({
      ...params,
      isTestRecord: true
    });
  };
}



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
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
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
//     allowNull: false,
//     validate: {
//       len: [6, 6]
//     }
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
//   tableName: 'temp_phone_updates',
//   timestamps: true,
//   paranoid: !isDevelopment,
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
//   ]
// });

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