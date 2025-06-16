// src/models/notificationModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NOTIFICATION_TYPES = [
  'friend_request',
  'friend_request_accepted',
   'friend_request_rejected', // Ensure this exists
  'post_like',
  'comment',
  'message',
  'system'
];

const Notification = sequelize.define('Notification', {
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
  },
  friendshipId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'friendships',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'groups',
      key: 'id'
    }
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'chats',
      key: 'id'
    }
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    }
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'isRead'] },
    { fields: ['createdAt'] },
    { fields: ['type'] },
    { fields: ['friendshipId'] },
    { fields: ['postId'] },
    { fields: ['commentId'] },
    { fields: ['groupId'] },
    { fields: ['chatId'] },
    { fields: ['messageId'] }
  ],
  hooks: {
    beforeValidate: (notification) => {
      if (!notification.metadata || typeof notification.metadata !== 'object') {
        notification.metadata = {};
      }
    }
  }
});

// Add associations and methods after definition
Notification.associate = function(models) {
  Notification.belongsTo(models.User, {
    as: 'recipient',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Notification.belongsTo(models.User, {
    as: 'sender',
    foreignKey: 'senderId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  Notification.belongsTo(models.Friendship, {
    foreignKey: 'friendshipId',
    as: 'friendshipNotification',
    onDelete: 'SET NULL'
  });

  Notification.belongsTo(models.Post, {
    foreignKey: 'postId',
    as: 'postNotification',
    onDelete: 'SET NULL'
  });

  Notification.belongsTo(models.Comment, {
    foreignKey: 'commentId',
    as: 'commentNotification',
    onDelete: 'SET NULL'
  });

  Notification.belongsTo(models.Group, {
    foreignKey: 'groupId',
    as: 'groupNotification',
    onDelete: 'SET NULL'
  });

  Notification.belongsTo(models.Chat, {
    foreignKey: 'chatId',
    as: 'chatNotification',
    onDelete: 'SET NULL'
  });

  Notification.belongsTo(models.Message, {
    foreignKey: 'messageId',
    as: 'messageNotification',
    onDelete: 'SET NULL'
  });
};

Notification.markAsRead = async function(userId) {
  return this.update({ isRead: true }, {
    where: { userId, isRead: false }
  });
};

Notification.getUnreadCount = async function(userId) {
  return this.count({
    where: { userId, isRead: false }
  });
};

Notification.prototype.getPreviewText = function() {
  switch (this.type) {
    case 'friend_request': return 'You have a new friend request';
    case 'friend_request_accepted': return 'Your friend request was accepted';
    case 'post_like': return 'Someone liked your post';
    case 'comment': return 'New comment on your post';
    case 'message': return 'New message received';
    case 'system': return this.metadata?.message || 'System notification';
    default: return 'New notification';
  }
};

Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

module.exports = Notification;




//! final
// // src/models/notificationModel.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

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
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   senderId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'users',
//       key: 'id'
//     }
//   },
//   type: {
//     type: DataTypes.ENUM(...NOTIFICATION_TYPES),
//     allowNull: false,
//     validate: {
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
//             if (!value?.friendshipId) throw new Error('"friendshipId" is required for friend_request');
//             break;
//           case 'post_like':
//             if (!value?.postId || !value?.likeId) throw new Error('"postId" and "likeId" are required for post_like');
//             break;
//           case 'comment':
//             if (!value?.postId || !value?.commentId) throw new Error('"postId" and "commentId" are required for comment');
//             break;
//           case 'system':
//             if (!value?.message) throw new Error('"message" is required for system notification');
//             break;
//         }
//       }
//     }
//   },
//   friendshipId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'friendships',
//       key: 'id'
//     }
//   },
//   postId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'posts',
//       key: 'id'
//     }
//   },
//   commentId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'comments',
//       key: 'id'
//     }
//   },
//   groupId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'groups',
//       key: 'id'
//     }
//   },
//   chatId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'chats',
//       key: 'id'
//     }
//   },
//   messageId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'messages',
//       key: 'id'
//     }
//   }
// }, {
//   tableName: 'notifications',
//   timestamps: true,
//   indexes: [
//     { fields: ['userId', 'isRead'] },
//     { fields: ['createdAt'] },
//     { fields: ['type'] },
//     { fields: ['friendshipId'] },
//     { fields: ['postId'] },
//     { fields: ['commentId'] },
//     { fields: ['groupId'] },
//     { fields: ['chatId'] },
//     { fields: ['messageId'] }
//   ],
//   hooks: {
//     beforeValidate: (notification) => {
//       if (!notification.metadata || typeof notification.metadata !== 'object') {
//         notification.metadata = {};
//       }
//     }
//   }
// });

// // Add associations and methods after definition
// Notification.associate = function(models) {
//   Notification.belongsTo(models.User, {
//     as: 'recipient',
//     foreignKey: 'userId',
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
//   });

//   Notification.belongsTo(models.User, {
//     as: 'sender',
//     foreignKey: 'senderId',
//     onDelete: 'SET NULL',
//     onUpdate: 'CASCADE'
//   });

//   Notification.belongsTo(models.Friendship, {
//     foreignKey: 'friendshipId',
//     as: 'friendshipNotification',
//     onDelete: 'SET NULL'
//   });

//   Notification.belongsTo(models.Post, {
//     foreignKey: 'postId',
//     as: 'postNotification',
//     onDelete: 'SET NULL'
//   });

//   Notification.belongsTo(models.Comment, {
//     foreignKey: 'commentId',
//     as: 'commentNotification',
//     onDelete: 'SET NULL'
//   });

//   Notification.belongsTo(models.Group, {
//     foreignKey: 'groupId',
//     as: 'groupNotification',
//     onDelete: 'SET NULL'
//   });

//   Notification.belongsTo(models.Chat, {
//     foreignKey: 'chatId',
//     as: 'chatNotification',
//     onDelete: 'SET NULL'
//   });

//   Notification.belongsTo(models.Message, {
//     foreignKey: 'messageId',
//     as: 'messageNotification',
//     onDelete: 'SET NULL'
//   });
// };

// Notification.markAsRead = async function(userId) {
//   return this.update({ isRead: true }, {
//     where: { userId, isRead: false }
//   });
// };

// Notification.getUnreadCount = async function(userId) {
//   return this.count({
//     where: { userId, isRead: false }
//   });
// };

// Notification.prototype.getPreviewText = function() {
//   switch (this.type) {
//     case 'friend_request': return 'You have a new friend request';
//     case 'friend_request_accepted': return 'Your friend request was accepted';
//     case 'post_like': return 'Someone liked your post';
//     case 'comment': return 'New comment on your post';
//     case 'message': return 'New message received';
//     case 'system': return this.metadata?.message || 'System notification';
//     default: return 'New notification';
//   }
// };

// Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

// module.exports = Notification;