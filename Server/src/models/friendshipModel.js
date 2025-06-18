const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Friendship = sequelize.define('Friendship', {
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
    }
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  requestedId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
    defaultValue: 'pending',
    allowNull: false
  },
  actionUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
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
    defaultValue: 1
  },
  tier: {
    type: DataTypes.ENUM('regular', 'close', 'family', 'work'),
    defaultValue: 'regular'
  },
  customLabel: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'friendships',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'friendId']
    },
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['friendId', 'status']
    },
    {
      fields: ['requesterId']
    },
    {
      fields: ['requestedId']
    },
    {
      fields: ['expiresAt']
    },
    {
      fields: ['actionUserId']
    }
  ],
  hooks: {
    beforeCreate: async (friendship) => {
      // Set requester, requested and action users
      friendship.requesterId = friendship.userId;
      friendship.requestedId = friendship.friendId;
      friendship.actionUserId = friendship.userId;
      
      // Set default expiry for pending requests (7 days)
      if (friendship.status === 'pending') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        friendship.expiresAt = expiresAt;
      }
    },
    beforeUpdate: async (friendship) => {
      if (friendship.changed('status')) {
        // Update action user to whoever changed the status
        friendship.actionUserId = friendship.changedBy || friendship.actionUserId;
        
        if (friendship.status === 'accepted') {
          friendship.acceptedAt = new Date();
          friendship.coolingPeriod = null;
          friendship.expiresAt = null;
        } else if (friendship.status === 'rejected') {
          const coolingPeriod = new Date();
          coolingPeriod.setDate(coolingPeriod.getDate() + 7);
          friendship.coolingPeriod = coolingPeriod;
          friendship.requestCount += 1;
        } else if (friendship.status === 'pending' && friendship.previous('status') === 'rejected') {
          friendship.coolingPeriod = null;
        }
      }
    }
  }
});

// Custom method to check if friendship request can be resent
Friendship.prototype.canResendRequest = function() {
  return !this.coolingPeriod || new Date() > this.coolingPeriod;
};

// Static configuration
Friendship.STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

Friendship.TIERS = {
  REGULAR: 'regular',
  CLOSE: 'close',
  FAMILY: 'family',
  WORK: 'work'
};

// Associate function to be called after all models are loaded
Friendship.associate = function(models) {
  Friendship.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  Friendship.belongsTo(models.User, { as: 'friend', foreignKey: 'friendId' });
  Friendship.belongsTo(models.User, { as: 'requester', foreignKey: 'requesterId' });
  Friendship.belongsTo(models.User, { as: 'requested', foreignKey: 'requestedId' });
  Friendship.belongsTo(models.User, { as: 'actionUser', foreignKey: 'actionUserId' });
};

module.exports = Friendship;







//! original
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
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   friendId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   requesterId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   requestedId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   status: {
//     type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
//     defaultValue: 'pending'
//   },
//   actionUserId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   acceptedAt: {
//     type: DataTypes.DATE,
//     allowNull: true
//   },
//   expiresAt: {
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
//   },
//   tier: {
//     type: DataTypes.ENUM('regular', 'close', 'family', 'work'),
//     defaultValue: 'regular'
//   },
//   customLabel: {
//     type: DataTypes.STRING,
//     allowNull: true
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
//     },
//     {
//       fields: ['requesterId']
//     },
//     {
//       fields: ['requestedId']
//     },
//     {
//       fields: ['expiresAt']
//     }
//   ],
//   hooks: {
//     beforeCreate: async (friendship) => {
//       // Set requester and requested users
//       friendship.requesterId = friendship.userId;
//       friendship.requestedId = friendship.friendId;
      
//       // Set default expiry for pending requests (7 days)
//       if (friendship.status === 'pending') {
//         const expiresAt = new Date();
//         expiresAt.setDate(expiresAt.getDate() + 7);
//         friendship.expiresAt = expiresAt;
//       }
//     },
//     beforeUpdate: async (friendship) => {
//       if (friendship.changed('status')) {
//         if (friendship.status === 'accepted') {
//           friendship.acceptedAt = new Date();
//           friendship.coolingPeriod = null;
//           friendship.expiresAt = null;
//         } else if (friendship.status === 'rejected') {
//           const coolingPeriod = new Date();
//           coolingPeriod.setDate(coolingPeriod.getDate() + 7);
//           friendship.coolingPeriod = coolingPeriod;
//           friendship.requestCount += 1;
//         } else if (friendship.status === 'pending' && friendship.previous('status') === 'rejected') {
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

// // Static configuration
// Friendship.STATUSES = {
//   PENDING: 'pending',
//   ACCEPTED: 'accepted',
//   REJECTED: 'rejected',
//   BLOCKED: 'blocked'
// };

// Friendship.TIERS = ['regular', 'close', 'family', 'work'];

// module.exports = Friendship;