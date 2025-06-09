const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Friendship extends Model {
  // --- ENUMS ---
  static Status = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    BLOCKED: 'blocked',
    CLOSE: 'close',
    FAMILY: 'family',
    WORK: 'work'
  };

  static Tier = {
    REGULAR: 'regular',
    CLOSE: 'close',
    FAMILY: 'family',
    WORK: 'work'
  };

  static COOLING_PERIOD_DAYS = 7;

  // --- INSTANCE METHODS ---
  canResendRequest() {
    return !this.coolingPeriod || new Date() > this.coolingPeriod;
  }

  getRemainingCoolingDays() {
    if (!this.coolingPeriod) return null;
    const now = new Date();
    return now > this.coolingPeriod
      ? 0
      : Math.ceil((this.coolingPeriod.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  isActive() {
    return this.status === Friendship.Status.ACCEPTED;
  }

  async updateTier(tier, customLabel = null) {
    if (!Object.values(Friendship.Tier).includes(tier)) {
      throw new Error('Invalid friendship tier');
    }
    this.tier = tier;
    this.customLabel = customLabel;
    return this.save();
  }

  // --- ASSOCIATIONS ---
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'requester',
      onDelete: 'CASCADE'
    });

    this.belongsTo(models.User, {
      foreignKey: 'friendId',
      as: 'requested',
      onDelete: 'CASCADE'
    });

    this.belongsTo(models.User, {
      foreignKey: 'actionUserId',
      as: 'actionUser',
      onDelete: 'SET NULL'
    });
  }
}

Friendship.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(Friendship.Status)),
      defaultValue: Friendship.Status.PENDING,
      allowNull: false
    },
    tier: {
      type: DataTypes.ENUM(...Object.values(Friendship.Tier)),
      defaultValue: Friendship.Tier.REGULAR,
      allowNull: false
    },
    customLabel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    actionUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    coolingPeriod: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    requestCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: { min: 1 }
    }
  },
  {
    sequelize,
    modelName: 'Friendship',
    tableName: 'friendships',
    timestamps: true,
    // underscored: false (default)

    indexes: [
      {
        unique: true,
        fields: ['userId', 'friendId'],
        name: 'friendship_unique_pair'
      },
      { fields: ['userId', 'status'], name: 'friendship_user_status' },
      { fields: ['friendId', 'status'], name: 'friendship_friend_status' },
      { fields: ['status'], name: 'friendship_status' },
      { fields: ['tier'], name: 'friendship_tier' }
    ],

    hooks: {
      beforeValidate: (friendship) => {
        if (friendship.userId === friendship.friendId) {
          throw new Error('Cannot create friendship with yourself');
        }
      },
      beforeUpdate: (friendship) => {
        if (!friendship.changed('status')) return;

        const now = new Date();

        switch (friendship.status) {
          case Friendship.Status.ACCEPTED:
            friendship.acceptedAt = now;
            friendship.coolingPeriod = null;
            break;

          case Friendship.Status.REJECTED:
            friendship.rejectedAt = now;
            friendship.coolingPeriod = new Date(
              now.getTime() + Friendship.COOLING_PERIOD_DAYS * 24 * 60 * 60 * 1000
            );
            friendship.requestCount += 1;
            break;

          case Friendship.Status.PENDING:
            if (friendship.previous('status') === Friendship.Status.REJECTED) {
              friendship.coolingPeriod = null;
            }
            break;

          case Friendship.Status.BLOCKED:
            friendship.coolingPeriod = null;
            break;
        }
      }
    }
  }
);

module.exports = Friendship;





//! running
// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../config/database');


// class Friendship extends Model {
//   // --- ENUMS ---
//   static Status = {
//     PENDING: 'pending',
//     ACCEPTED: 'accepted',
//     REJECTED: 'rejected',
//     BLOCKED: 'blocked',
//     CLOSE: 'close',
//     FAMILY: 'family',
//     WORK: 'work'
//   };

//   static Tier = {
//     REGULAR: 'regular',
//     CLOSE: 'close',
//     FAMILY: 'family',
//     WORK: 'work'
//   };

//   static COOLING_PERIOD_DAYS = 7;

//   // --- INSTANCE METHODS ---
//   canResendRequest() {
//     return !this.coolingPeriod || new Date() > this.coolingPeriod;
//   }

//   getRemainingCoolingDays() {
//     if (!this.coolingPeriod) return null;
//     const now = new Date();
//     return now > this.coolingPeriod
//       ? 0
//       : Math.ceil((this.coolingPeriod - now) / (1000 * 60 * 60 * 24));
//   }

//   isActive() {
//     return this.status === Friendship.Status.ACCEPTED;
//   }

//   async updateTier(tier, customLabel = null) {
//     if (!Object.values(Friendship.Tier).includes(tier)) {
//       throw new Error('Invalid friendship tier');
//     }
//     this.tier = tier;
//     this.customLabel = customLabel;
//     return this.save();
//   }

//   // --- ASSOCIATIONS ---
//   static associate(models) {
//     this.belongsTo(models.User, {
//       foreignKey: 'userId',
//       as: 'requester',
//       onDelete: 'CASCADE'
//     });

//     this.belongsTo(models.User, {
//       foreignKey: 'friendId',
//       as: 'requested',
//       onDelete: 'CASCADE'
//     });

//     this.belongsTo(models.User, {
//       foreignKey: 'actionUserId',
//       as: 'actionUser',
//       onDelete: 'SET NULL'
//     });
//   }
// }

// Friendship.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'users', key: 'id' }
//     },
//     friendId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'users', key: 'id' }
//     },
//     status: {
//       type: DataTypes.ENUM(...Object.values(Friendship.Status)),
//       defaultValue: Friendship.Status.PENDING,
//       allowNull: false
//     },
//     tier: {
//       type: DataTypes.ENUM(...Object.values(Friendship.Tier)),
//       defaultValue: Friendship.Tier.REGULAR,
//       allowNull: false
//     },
//     customLabel: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     },
//     actionUserId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       references: { model: 'users', key: 'id' }
//     },
//     acceptedAt: {
//       type: DataTypes.DATE,
//       allowNull: true
//     },
//     rejectedAt: {
//       type: DataTypes.DATE,
//       allowNull: true
//     },
//     coolingPeriod: {
//       type: DataTypes.DATE,
//       allowNull: true,
//       defaultValue: null
//     },
//     requestCount: {
//       type: DataTypes.INTEGER,
//       defaultValue: 1,
//       validate: { min: 1 }
//     }
//   },
//   {
//     sequelize, 
//     modelName: 'Friendship',
//     tableName: 'friendships',
//     timestamps: true,
//     // underscored: true,

//     indexes: [
//       {
//         unique: true,
//         fields: ['userId', 'friendId'],
//         name: 'friendship_unique_pair'
//       },
//       { fields: ['userId', 'status'], name: 'friendship_user_status' },
//       { fields: ['friendId', 'status'], name: 'friendship_friend_status' },
//       { fields: ['status'], name: 'friendship_status' },
//       { fields: ['tier'], name: 'friendship_tier' }
//     ],

//     hooks: {
//       beforeValidate: (friendship) => {
//         if (friendship.userId === friendship.friendId) {
//           throw new Error('Cannot create friendship with yourself');
//         }
//       },
//       beforeUpdate: (friendship) => {
//         if (!friendship.changed('status')) return;

//         const now = new Date();

//         switch (friendship.status) {
//           case Friendship.Status.ACCEPTED:
//             friendship.acceptedAt = now;
//             friendship.coolingPeriod = null;
//             break;

//           case Friendship.Status.REJECTED:
//             friendship.rejectedAt = now;
//             friendship.coolingPeriod = new Date(
//               now.getTime() + Friendship.COOLING_PERIOD_DAYS * 24 * 60 * 60 * 1000
//             );
//             friendship.requestCount += 1;
//             break;

//           case Friendship.Status.PENDING:
//             if (friendship.previous('status') === Friendship.Status.REJECTED) {
//               friendship.coolingPeriod = null;
//             }
//             break;

//           case Friendship.Status.BLOCKED:
//             friendship.coolingPeriod = null;
//             break;
//         }
//       }
//     }
//   }
// );

// module.exports = Friendship;




//! running
// models/friendship.model.js
// const {
//   Model,
//   DataTypes
// } = require('sequelize');
// const sequelize = require('../config/database');
// const User = require('./userModel');

// const FriendshipStatus = {
//   PENDING: 'pending',
//   ACCEPTED: 'accepted',
//   REJECTED: 'rejected',
//   BLOCKED: 'blocked'
// };

// const COOLING_PERIOD_DAYS = 7;

// class Friendship extends Model {
//   canResendRequest() {
//     return !this.coolingPeriod || new Date() > this.coolingPeriod;
//   }

//   getRemainingCoolingDays() {
//     if (!this.coolingPeriod) return null;
//     const now = new Date();
//     if (now > this.coolingPeriod) return 0;
//     return Math.ceil((this.coolingPeriod.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
//   }

//   isActive() {
//     return this.status === FriendshipStatus.ACCEPTED;
//   }

//   static associate(models) {
//     this.belongsTo(models.User, {
//       foreignKey: 'userId',
//       as: 'requester',
//       onDelete: 'CASCADE'
//     });

//     this.belongsTo(models.User, {
//       foreignKey: 'friendId',
//       as: 'requested', // Changed from 'receiver' to match social.js
//       onDelete: 'CASCADE'
//     });

//     this.belongsTo(models.User, {
//       foreignKey: 'actionUserId',
//       as: 'actionUser',
//       onDelete: 'SET NULL'
//     });
//   }
// }

// Friendship.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'users',
//         key: 'id'
//       }
//     },
//     friendId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'users',
//         key: 'id'
//       }
//     },
//     status: {
//       type: DataTypes.ENUM(
//         FriendshipStatus.PENDING,
//         FriendshipStatus.ACCEPTED,
//         FriendshipStatus.REJECTED,
//         FriendshipStatus.BLOCKED
//       ),
//       defaultValue: FriendshipStatus.PENDING,
//       validate: {
//         isIn: {
//           args: [Object.values(FriendshipStatus)],
//           msg: 'Invalid friendship status'
//         }
//       }
//     },
//     actionUserId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       references: {
//         model: 'users',
//         key: 'id'
//       }
//     },
//     acceptedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//       validate: {
//         isDate: true
//       }
//     },
//     rejectedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//       validate: {
//         isDate: true
//       }
//     },
//     coolingPeriod: {
//       type: DataTypes.DATE,
//       allowNull: true,
//       defaultValue: null,
//       validate: {
//         isDate: true
//       }
//     },
//     requestCount: {
//       type: DataTypes.INTEGER,
//       defaultValue: 1,
//       validate: {
//         min: 1
//       }
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW
//     }
//   },
//   {
//     sequelize,
//     modelName: 'Friendship',
//     tableName: 'friendships',
//     timestamps: true,
//     indexes: [
//       {
//         unique: true,
//         fields: ['userId', 'friendId'],
//         name: 'friendship_unique_pair'
//       },
//       {
//         fields: ['userId', 'status'],
//         name: 'friendship_user_status'
//       },
//       {
//         fields: ['friendId', 'status'],
//         name: 'friendship_friend_status'
//       },
//       {
//         fields: ['status'],
//         name: 'friendship_status'
//       }
//     ],
//     hooks: {
//       beforeValidate: (friendship) => {
//         if (friendship.userId === friendship.friendId) {
//           throw new Error('Cannot create friendship with yourself');
//         }
//       },
//       beforeUpdate: async (friendship) => {
//         if (friendship.changed('status')) {
//           const now = new Date();

//           switch (friendship.status) {
//             case FriendshipStatus.ACCEPTED:
//               friendship.acceptedAt = now;
//               friendship.coolingPeriod = null;
//               break;

//             case FriendshipStatus.REJECTED:
//               friendship.rejectedAt = now;
//               friendship.coolingPeriod = new Date(
//                 now.getTime() + COOLING_PERIOD_DAYS * 24 * 60 * 60 * 1000
//               );
//               friendship.requestCount += 1;
//               break;
           
//             case FriendshipStatus.PENDING:
//               if (friendship.previous('status') === FriendshipStatus.REJECTED) {
//                 friendship.coolingPeriod = null;
//               }
//               break;

//             case FriendshipStatus.BLOCKED:
//               friendship.coolingPeriod = null;
//               break;
//           }
//         }
//       }
//     }
//   }
// );

// // Add the direct associations that match social.js
// Friendship.belongsTo(User, { as: 'requester', foreignKey: 'userId', onDelete: 'CASCADE' });
// Friendship.belongsTo(User, { as: 'requested', foreignKey: 'friendId', onDelete: 'CASCADE' });
// Friendship.belongsTo(User, { as: 'actionUser', foreignKey: 'actionUserId', onDelete: 'SET NULL' });

// module.exports = Friendship;
// module.exports.FriendshipStatus = FriendshipStatus;





//! old
// models/friendshipModel.js
// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// class Friendship extends Model {
//   static associate(models) {
//     Friendship.belongsTo(models.User, {
//       foreignKey: 'userId',
//       as: 'requester',
//       onDelete: 'CASCADE',
//     });

//     Friendship.belongsTo(models.User, {
//       foreignKey: 'friendId',
//       as: 'receiver',
//       onDelete: 'CASCADE',
//     });

//     Friendship.belongsTo(models.User, {
//       foreignKey: 'actionUserId',
//       as: 'actionUser',
//       onDelete: 'SET NULL',
//     });
//   }

//   canResendRequest() {
//     return !this.coolingPeriod || new Date() > this.coolingPeriod;
//   }
// }

// Friendship.init({
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   friendId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
//     defaultValue: 'pending',
//   },
//   actionUserId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//   },
//   acceptedAt: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   coolingPeriod: {
//     type: DataTypes.DATE,
//     allowNull: true,
//     defaultValue: null,
//   },
//   requestCount: {
//     type: DataTypes.INTEGER,
//     defaultValue: 1,
//   },
// }, {
//   sequelize,
//   modelName: 'Friendship',
//   tableName: 'friendships',
//   timestamps: true,
//   indexes: [
//     { unique: true, fields: ['userId', 'friendId'] },
//     { fields: ['userId', 'status'] },
//     { fields: ['friendId', 'status'] },
//   ],
//   hooks: {
//     beforeUpdate: async (friendship) => {
//       if (friendship.changed('status')) {
//         const now = new Date();

//         if (friendship.status === 'accepted') {
//           friendship.acceptedAt = now;
//           friendship.coolingPeriod = null;

//         } else if (friendship.status === 'rejected') {
//           friendship.coolingPeriod = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
//           friendship.requestCount += 1;

//         } else if (
//           friendship.status === 'pending' &&
//           friendship.previous('status') === 'rejected'
//         ) {
//           friendship.coolingPeriod = null;
//         }
//       }
//     }
//   }
// });

// module.exports = Friendship;










//! src/models/friendshipModel
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Friendship = sequelize.define('Friendship', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   friendId: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   status: {
//     type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
//     defaultValue: 'pending'
//   },
//   actionUserId: {
//     type: DataTypes.INTEGER,
//     allowNull: true
//   },
//   acceptedAt: {
//     type: DataTypes.DATE,
//     allowNull: true
//   },
//   coolingPeriod: {
//     type: DataTypes.DATE,
//     allowNull: true,
//     defaultValue: null
//   },
//   requestCount: {
//     type: DataTypes.INTEGER,
//     defaultValue: 1
//   }
// }, {
//   tableName: 'friendships',
//   timestamps: true,
//   indexes: [
//     {
//       unique: true,
//       fields: ['userId', 'friendId']
//     },
//     {
//       fields: ['userId', 'status']
//     },
//     {
//       fields: ['friendId', 'status']
//     }
//   ],
//   hooks: {
//     beforeUpdate: async (friendship) => {
//       if (friendship.changed('status')) {
//         if (friendship.status === 'accepted') {
//           friendship.acceptedAt = new Date();
//           friendship.coolingPeriod = null; // Reset cooling period if accepted
//         } else if (friendship.status === 'rejected') {
//           // Set 1 week cooldown period after rejection
//           friendship.coolingPeriod = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//           friendship.requestCount += 1; // Increment request count
//         } else if (friendship.status === 'pending' && friendship.previous('status') === 'rejected') {
//           // Reset cooling period if user resends request after rejection
//           friendship.coolingPeriod = null;
//         }
//       }
//     }
//   }
// });

// // Custom method to check if friendship request can be resent
// Friendship.prototype.canResendRequest = function() {
//   return !this.coolingPeriod || new Date() > this.coolingPeriod;
// };

// module.exports = Friendship;






