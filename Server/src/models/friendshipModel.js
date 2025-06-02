//! src/models/friendshipModel
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
    allowNull: false
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
    defaultValue: 'pending'
  },
  actionUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  acceptedAt: {
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
    }
  ],
  hooks: {
    beforeUpdate: async (friendship) => {
      if (friendship.changed('status')) {
        if (friendship.status === 'accepted') {
          friendship.acceptedAt = new Date();
          friendship.coolingPeriod = null; // Reset cooling period if accepted
        } else if (friendship.status === 'rejected') {
          // Set 1 week cooldown period after rejection
          friendship.coolingPeriod = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          friendship.requestCount += 1; // Increment request count
        } else if (friendship.status === 'pending' && friendship.previous('status') === 'rejected') {
          // Reset cooling period if user resends request after rejection
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

module.exports = Friendship;





// old
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
//     type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'), // ✅ Added more status options for flexibility
//     defaultValue: 'pending'
//   },
//   actionUserId: {
//     type: DataTypes.INTEGER,
//     allowNull: true // ✅ Optional - Who acted last (used for UI/UX insights)
//   },
//   acceptedAt: {
//     type: DataTypes.DATE,
//     allowNull: true // ✅ Timestamp for when the friendship was accepted
//   }
// }, {
//   tableName: 'friendships',
//   timestamps: true,
//   indexes: [
//     {
//       unique: true,
//       fields: ['userId', 'friendId'] // ✅ Ensures no duplicate friendships
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
//       // ✅ Automatically set acceptedAt when friendship is accepted
//       if (friendship.changed('status') && friendship.status === 'accepted') {
//         friendship.acceptedAt = new Date();
//       }
//     }
//   }
// });

// module.exports = Friendship;
