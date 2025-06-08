const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const isDevelopment = process.env.NODE_ENV === 'development';

class TempGenderVerification extends Model {
  // Dev-only helper to clear test records for a user
  static async clearTestRecords(userId) {
    if (!isDevelopment) return;
    await this.destroy({
      where: {
        userId,
        isTestRecord: true
      }
    });
  }

  // Dev-only helper to create a test record
  static async createTestRecord(params) {
    if (!isDevelopment) throw new Error('Not allowed outside development');
    return this.create({
      ...params,
      isTestRecord: true
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });

    this.belongsTo(models.PendingGenderChange, {
      foreignKey: 'pendingChangeId',
      as: 'pendingChange',
      onDelete: 'CASCADE'
    });
  }
}

TempGenderVerification.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  pendingChangeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'pending_gender_changes', key: 'id' },
    onDelete: 'CASCADE'
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false,
    validate: { len: [6, 6] }
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
  modelName: 'TempGenderVerification',
  tableName: 'temp_gender_verifications',
  timestamps: true,
  paranoid: !isDevelopment,
  indexes: [
    { fields: ['userId', 'pendingChangeId'], unique: true },
    { fields: ['expiresAt'] },
    ...(isDevelopment ? [{ fields: ['isTestRecord'] }] : [])
  ]
});

module.exports = TempGenderVerification;







//! with function
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const isDevelopment = process.env.NODE_ENV === 'development';

// const TempGenderVerification = sequelize.define('TempGenderVerification', {
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
//   pendingChangeId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'pending_gender_changes',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
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
//   tableName: 'temp_gender_verifications',
//   timestamps: true,
//   paranoid: !isDevelopment,
//   indexes: [
//     {
//       fields: ['userId', 'pendingChangeId'],
//       unique: true
//     },
//     {
//       fields: ['expiresAt']
//     },
//     ...(isDevelopment ? [{
//       fields: ['isTestRecord']
//     }] : [])
//   ]
// });

// if (isDevelopment) {
//   TempGenderVerification.clearTestRecords = async function(userId) {
//     await this.destroy({
//       where: {
//         userId,
//         isTestRecord: true
//       }
//     });
//   };

//   TempGenderVerification.createTestRecord = async function(params) {
//     return this.create({
//       ...params,
//       isTestRecord: true
//     });
//   };
// }

// module.exports = TempGenderVerification;