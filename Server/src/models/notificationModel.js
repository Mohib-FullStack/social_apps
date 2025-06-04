const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Update path if needed
const User = require('./userModel'); // Ensure userModel is correctly set up

const NOTIFICATION_TYPES = [
  'friend_request',
  'friend_request_accepted',
  'post_like',
  'comment',
  'message',
  'system'
];

class Notification extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'sender',
      foreignKey: 'senderId',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.belongsTo(models.User, {
      as: 'recipient',
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }

  static async markAsRead(userId) {
    return this.update({ isRead: true }, {
      where: { userId, isRead: false }
    });
  }

  static async getUnreadCount(userId) {
    return this.count({
      where: { userId, isRead: false }
    });
  }

  getPreviewText() {
    switch (this.type) {
      case 'friend_request': return 'You have a new friend request';
      case 'friend_request_accepted': return 'Your friend request was accepted';
      case 'post_like': return 'Someone liked your post';
      case 'comment': return 'New comment on your post';
      case 'message': return 'New message received';
      case 'system': return this.metadata?.message || 'System notification';
      default: return 'New notification';
    }
  }
}

Notification.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(...NOTIFICATION_TYPES),
    allowNull: false,
    validate: {
      isIn: {
        args: [NOTIFICATION_TYPES],
        msg: 'Invalid notification type'
      }
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    validate: {
      isValidMetadata(value) {
        if (value && typeof value !== 'object') {
          throw new Error('Metadata must be an object');
        }

        switch (this.type) {
          case 'friend_request':
            if (!value?.friendshipId) throw new Error('"friendshipId" is required for friend_request');
            break;
          case 'post_like':
            if (!value?.postId || !value?.likeId) throw new Error('"postId" and "likeId" are required for post_like');
            break;
          case 'comment':
            if (!value?.postId || !value?.commentId) throw new Error('"postId" and "commentId" are required for comment');
            break;
          case 'system':
            if (!value?.message) throw new Error('"message" is required for system notification');
            break;
        }
      }
    }
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'isRead'] },
    { fields: ['createdAt'] },
    { fields: ['type'] }
  ],
  hooks: {
    beforeValidate: (notification) => {
      if (!notification.metadata || typeof notification.metadata !== 'object') {
        notification.metadata = {};
      }
    }
  }
});

Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
module.exports = Notification;



//! running
// models/notificationModel.js
// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const NOTIFICATION_TYPES = [
//   'friend_request',
//   'friend_request_accepted',
//   'post_like',
//   'comment',
//   'message',
//   'system'
// ];

// class Notification extends Model {
//   static associate(models) {
//     this.belongsTo(models.User, {
//       as: 'sender',
//       foreignKey: 'senderId',
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE',
//     });

//     this.belongsTo(models.User, {
//       as: 'recipient',
//       foreignKey: 'userId',
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE',
//     });
//   }

//   static async markAsRead(userId) {
//     return this.update({ isRead: true }, {
//       where: { userId, isRead: false }
//     });
//   }

//   static async getUnreadCount(userId) {
//     return this.count({
//       where: { userId, isRead: false }
//     });
//   }

//   getPreviewText() {
//     switch (this.type) {
//       case 'friend_request': return 'You have a new friend request';
//       case 'friend_request_accepted': return 'Your friend request was accepted';
//       case 'post_like': return 'Someone liked your post';
//       case 'comment': return 'New comment on your post';
//       case 'message': return 'New message received';
//       case 'system': return this.metadata?.message || 'System notification';
//       default: return 'New notification';
//     }
//   }

//   static getAttributes() {
//     return {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//       },
//       userId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: { model: 'users', key: 'id' }
//       },
//       senderId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: { model: 'users', key: 'id' }
//       },
//       type: {
//         type: DataTypes.ENUM(...NOTIFICATION_TYPES),
//         allowNull: false,
//         validate: {
//           isIn: {
//             args: [NOTIFICATION_TYPES],
//             msg: 'Invalid notification type'
//           }
//         }
//       },
//       isRead: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false
//       },
//       metadata: {
//         type: DataTypes.JSONB,
//         defaultValue: {},
//         validate: {
//           isValidMetadata(value) {
//             if (value && typeof value !== 'object') {
//               throw new Error('Metadata must be an object');
//             }

//             switch (this.type) {
//               case 'friend_request':
//                 if (!value?.friendshipId) throw new Error('"friendshipId" is required for friend_request');
//                 break;
//               case 'post_like':
//                 if (!value?.postId || !value?.likeId) throw new Error('"postId" and "likeId" are required for post_like');
//                 break;
//               case 'comment':
//                 if (!value?.postId || !value?.commentId) throw new Error('"postId" and "commentId" are required for comment');
//                 break;
//               case 'system':
//                 if (!value?.message) throw new Error('"message" is required for system notification');
//                 break;
//             }
//           }
//         }
//       }
//     };
//   }

//   static getOptions() {
//     return {
//       sequelize,
//       modelName: 'Notification',
//       tableName: 'notifications',
//       timestamps: true,
//       indexes: [
//         { fields: ['userId', 'isRead'] },
//         { fields: ['createdAt'] },
//         { fields: ['type'] }
//       ],
//       hooks: {
//         beforeValidate: (notification) => {
//           if (!notification.metadata || typeof notification.metadata !== 'object') {
//             notification.metadata = {};
//           }
//         }
//       }
//     };
//   }
// }

// Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
// module.exports = Notification;









//! old
// // models/notificationModel.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const User = require('./userModel');


// const NOTIFICATION_TYPES = [
//   'friend_request',
//   'friend_request_accepted',
//   'post_like',
//   'comment',
//   'message',
//   'system'
// ];

// const Notification = sequelize.define('Notification', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
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

//   senderId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     },
//     onDelete: 'CASCADE',
//     validate: {
//       notNull: {
//         msg: 'Sender ID is required'
//       }
//     }
//   },

//   type: {
//     type: DataTypes.ENUM(...NOTIFICATION_TYPES),
//     allowNull: false,
//     validate: {
//       notNull: {
//         msg: 'Notification type is required'
//       },
//       isIn: {
//         args: [NOTIFICATION_TYPES],
//         msg: 'Invalid notification type'
//       }
//     }
//   },

//   isRead: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },

//   metadata: {
//     type: DataTypes.JSONB,
//     defaultValue: {},
//     validate: {
//       isValidMetadata(value) {
//         if (value && typeof value !== 'object') {
//           throw new Error('Metadata must be an object');
//         }

//         switch (this.type) {
//           case 'friend_request':
//             if (!value?.friendshipId) {
//               throw new Error('"friendshipId" is required for friend_request');
//             }
//             break;

//           case 'post_like':
//             if (!value?.postId || !value?.likeId) {
//               throw new Error('"postId" and "likeId" are required for post_like');
//             }
//             break;

//           case 'comment':
//             if (!value?.postId || !value?.commentId) {
//               throw new Error('"postId" and "commentId" are required for comment');
//             }
//             break;

//           case 'system':
//             if (!value?.message) {
//               throw new Error('"message" is required for system notification');
//             }
//             break;
//         }
//       }
//     }
//   }
// }, {
//   tableName: 'notifications',
//   timestamps: true,
//   indexes: [
//     { fields: ['userId', 'isRead'] },
//     { fields: ['createdAt'] },
//     { fields: ['type'] }
//   ],
//   hooks: {
//     beforeValidate: (notification) => {
//       if (!notification.metadata || typeof notification.metadata !== 'object') {
//         notification.metadata = {};
//       }
//     }
//   }
// });

// // ✅ Class Methods
// Notification.markAsRead = async function(userId) {
//   return this.update(
//     { isRead: true },
//     { where: { userId, isRead: false } }
//   );
// };

// Notification.getUnreadCount = async function(userId) {
//   return this.count({
//     where: {
//       userId,
//       isRead: false
//     }
//   });
// };

// // ✅ Instance Method
// Notification.prototype.getPreviewText = function () {
//   switch (this.type) {
//     case 'friend_request':
//       return 'You have a new friend request';
//     case 'friend_request_accepted':
//       return 'Your friend request was accepted';
//     case 'post_like':
//       return 'Someone liked your post';
//     case 'comment':
//       return 'New comment on your post';
//     case 'message':
//       return 'New message received';
//     case 'system':
//       return this.metadata?.message || 'System notification';
//     default:
//       return 'New notification';
//   }
// };



// Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
// Notification.belongsTo(User, { as: 'recipient', foreignKey: 'userId' });


// // module.exports = Notification;
// // module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

// Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
// module.exports = Notification;














