const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

const NOTIFICATION_TYPES = Object.freeze({
  FRIEND_REQUEST: {
    key: 'friend_request',
    requiredRelations: ['friendshipId'],
    defaultMessage: 'You have a new friend request',
    urlPath: '/friends/requests/:id'
  },
  FRIEND_REQUEST_ACCEPTED: {
    key: 'friend_request_accepted',
    requiredRelations: ['friendshipId'],
    defaultMessage: 'Your friend request was accepted',
    urlPath: '/friends'
  },
  POST_LIKE: {
    key: 'post_like',
    requiredRelations: ['postId', 'senderId'],
    defaultMessage: 'Someone liked your post',
    urlPath: '/posts/:id'
  },
  COMMENT: {
    key: 'comment',
    requiredRelations: ['postId', 'commentId', 'senderId'],
    defaultMessage: 'New comment on your post',
    urlPath: '/posts/:postId#comment-:commentId'
  },
  MESSAGE: {
    key: 'message',
    requiredRelations: ['messageId', 'chatId', 'senderId'],
    defaultMessage: 'New message received',
    urlPath: '/chats/:id'
  },
  SYSTEM: {
    key: 'system',
    requiredFields: ['message'],
    defaultMessage: 'System notification',
    urlPath: null
  }
});

class Notification extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'recipient', foreignKey: 'userId', onDelete: 'CASCADE' });
    this.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId', onDelete: 'SET NULL' });

    const link = (modelName, key, as) => {
      if (models[modelName]) {
        this.belongsTo(models[modelName], { foreignKey: key, as, onDelete: 'SET NULL' });
      }
    };

    link('Friendship', 'friendshipId', 'friendship');
    link('Post', 'postId', 'post');
    link('Comment', 'commentId', 'comment');
    link('Chat', 'chatId', 'chat');
    link('Message', 'messageId', 'message');
  }

  static async markAsRead(userId) {
    return this.update({ isRead: true, readAt: new Date() }, { where: { userId, isRead: false } });
  }

  static async getUnreadCount(userId) {
    return this.count({ where: { userId, isRead: false } });
  }

  getTypeConfig() {
    return Object.values(NOTIFICATION_TYPES).find(t => t.key === this.type);
  }

  getPreviewText() {
    const config = this.getTypeConfig();
    return this.type === NOTIFICATION_TYPES.SYSTEM.key && this.metadata?.message
      ? this.metadata.message
      : config?.defaultMessage || 'New notification';
  }

  getActionUrl() {
    const config = this.getTypeConfig();
    if (!config?.urlPath) return null;
    return config.urlPath
      .replace(':id', this.friendshipId || this.postId || this.chatId)
      .replace(':postId', this.postId)
      .replace(':commentId', this.commentId);
  }

  validateTypeRequirements() {
    const config = this.getTypeConfig();
    if (!config) return;

    if (config.requiredRelations) {
      for (const field of config.requiredRelations) {
        if (!this[field]) throw new Error(`"${field}" is required for ${this.type} notification`);
      }
    }
    if (config.requiredFields) {
      for (const field of config.requiredFields) {
        if (!this.metadata?.[field]) throw new Error(`"metadata.${field}" is required`);
      }
    }
  }

  // === Convenience Static Methods ===
  static async createFriendRequestNotification(friendship) {
    return this.create({
      type: NOTIFICATION_TYPES.FRIEND_REQUEST.key,
      userId: friendship.friendId,    // recipient
      senderId: friendship.userId,    // sender/requester
      friendshipId: friendship.id
    });
  }

  static async createFriendAcceptNotification(friendship) {
    return this.create({
      type: NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED.key,
      userId: friendship.userId,      // original sender
      senderId: friendship.friendId,  // acceptor
      friendshipId: friendship.id
    });
  }
}

Notification.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: true },
  type: {
    type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES).map(t => t.key)),
    allowNull: false
  },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE, allowNull: true },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    validate: {
      isObject(value) {
        if (typeof value !== 'object') throw new Error('Metadata must be an object');
      }
    }
  },
  friendshipId: DataTypes.INTEGER,
  postId: DataTypes.INTEGER,
  commentId: DataTypes.INTEGER,
  chatId: DataTypes.INTEGER,
  messageId: DataTypes.INTEGER
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true,
  paranoid: false,
  indexes: [
    { fields: ['userId', 'isRead'] },
    { fields: ['userId', 'createdAt'] },
    { fields: ['type'] }
  ],
  hooks: {
    beforeValidate(notification) {
      if (!notification.metadata || typeof notification.metadata !== 'object') {
        notification.metadata = {};
      }
      if (notification.type && notification.changed('type')) {
        notification.validateTypeRequirements();
      }
    }
  }
});

Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

module.exports = Notification;







//! curent
// const { DataTypes, Model } = require('sequelize');
// const sequelize = require('../config/database');

// const NOTIFICATION_TYPES = Object.freeze({
//   FRIEND_REQUEST: {
//     key: 'friend_request',
//     requiredRelations: ['friendshipId'],
//     defaultMessage: 'You have a new friend request',
//     urlPath: '/friends/requests/:id'
//   },
//   FRIEND_REQUEST_ACCEPTED: {
//     key: 'friend_request_accepted',
//     requiredRelations: ['friendshipId'],
//     defaultMessage: 'Your friend request was accepted',
//     urlPath: '/friends'
//   },
//   POST_LIKE: {
//     key: 'post_like',
//     requiredRelations: ['postId', 'senderId'],
//     defaultMessage: 'Someone liked your post',
//     urlPath: '/posts/:id'
//   },
//   COMMENT: {
//     key: 'comment',
//     requiredRelations: ['postId', 'commentId', 'senderId'],
//     defaultMessage: 'New comment on your post',
//     urlPath: '/posts/:postId#comment-:commentId'
//   },
//   MESSAGE: {
//     key: 'message',
//     requiredRelations: ['messageId', 'chatId', 'senderId'],
//     defaultMessage: 'New message received',
//     urlPath: '/chats/:id'
//   },
//   SYSTEM: {
//     key: 'system',
//     requiredFields: ['message'],
//     defaultMessage: 'System notification',
//     urlPath: null
//   }
// });

// class Notification extends Model {
//   static associate(models) {
//     this.belongsTo(models.User, { as: 'recipient', foreignKey: 'userId', onDelete: 'CASCADE' });
//     this.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId', onDelete: 'SET NULL' });

//     const link = (modelName, key, as) => {
//       if (models[modelName]) {
//         this.belongsTo(models[modelName], { foreignKey: key, as, onDelete: 'SET NULL' });
//       }
//     };

//     link('Friendship', 'friendshipId', 'friendship');
//     link('Post', 'postId', 'post');
//     link('Comment', 'commentId', 'comment');
//     link('Chat', 'chatId', 'chat');
//     link('Message', 'messageId', 'message');
//   }

//   static async markAsRead(userId) {
//     return this.update({ isRead: true, readAt: new Date() }, { where: { userId, isRead: false } });
//   }

//   static async getUnreadCount(userId) {
//     return this.count({ where: { userId, isRead: false } });
//   }

//   getTypeConfig() {
//     return Object.values(NOTIFICATION_TYPES).find(t => t.key === this.type);
//   }

//   getPreviewText() {
//     const config = this.getTypeConfig();
//     return this.type === NOTIFICATION_TYPES.SYSTEM.key && this.metadata?.message
//       ? this.metadata.message
//       : config?.defaultMessage || 'New notification';
//   }

//   getActionUrl() {
//     const config = this.getTypeConfig();
//     if (!config?.urlPath) return null;
//     return config.urlPath
//       .replace(':id', this.friendshipId || this.postId || this.chatId)
//       .replace(':postId', this.postId)
//       .replace(':commentId', this.commentId);
//   }

//   validateTypeRequirements() {
//     const config = this.getTypeConfig();
//     if (!config) return;

//     if (config.requiredRelations) {
//       for (const field of config.requiredRelations) {
//         if (!this[field]) throw new Error(`"${field}" is required for ${this.type} notification`);
//       }
//     }
//     if (config.requiredFields) {
//       for (const field of config.requiredFields) {
//         if (!this.metadata?.[field]) throw new Error(`"metadata.${field}" is required`);
//       }
//     }
//   }

//   // === Convenience Static Methods ===
//   static async createFriendRequestNotification(friendship) {
//     return this.create({
//       type: NOTIFICATION_TYPES.FRIEND_REQUEST.key,
//       userId: friendship.friendId,    // recipient
//       senderId: friendship.userId,    // sender/requester
//       friendshipId: friendship.id
//     });
//   }

//   static async createFriendAcceptNotification(friendship) {
//     return this.create({
//       type: NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED.key,
//       userId: friendship.userId,      // original sender
//       senderId: friendship.friendId,  // acceptor
//       friendshipId: friendship.id
//     });
//   }
// }

// Notification.init({
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//   userId: { type: DataTypes.INTEGER, allowNull: false },
//   senderId: { type: DataTypes.INTEGER, allowNull: true },
//   type: {
//     type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES).map(t => t.key)),
//     allowNull: false
//   },
//   isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
//   readAt: { type: DataTypes.DATE, allowNull: true },
//   metadata: {
//     type: DataTypes.JSONB,
//     defaultValue: {},
//     validate: {
//       isObject(value) {
//         if (typeof value !== 'object') throw new Error('Metadata must be an object');
//       }
//     }
//   },
//   friendshipId: DataTypes.INTEGER,
//   postId: DataTypes.INTEGER,
//   commentId: DataTypes.INTEGER,
//   chatId: DataTypes.INTEGER,
//   messageId: DataTypes.INTEGER
// }, {
//   sequelize,
//   modelName: 'Notification',
//   tableName: 'notifications',
//   timestamps: true,
//   paranoid: false,
//   indexes: [
//     { fields: ['userId', 'isRead'] },
//     { fields: ['userId', 'createdAt'] },
//     { fields: ['type'] }
//   ],
//   hooks: {
//     beforeValidate(notification) {
//       if (!notification.metadata || typeof notification.metadata !== 'object') {
//         notification.metadata = {};
//       }
//       if (notification.type && notification.changed('type')) {
//         notification.validateTypeRequirements();
//       }
//     }
//   }
// });

// Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

// module.exports = Notification;







//! previous
// const { DataTypes, Model } = require('sequelize');
// const sequelize = require('../config/database');

// // Enhanced notification type configuration
// const NOTIFICATION_TYPES = Object.freeze({
//   FRIEND_REQUEST: {
//     key: 'friend_request',
//     requiredRelations: ['friendshipId'],
//     defaultMessage: 'You have a new friend request',
//     urlPath: '/friends/requests/:id'
//   },
//   FRIEND_REQUEST_ACCEPTED: {
//     key: 'friend_request_accepted',
//     requiredRelations: ['friendshipId'],
//     defaultMessage: 'Your friend request was accepted',
//     urlPath: '/friends'
//   },
//   POST_LIKE: {
//     key: 'post_like',
//     requiredRelations: ['postId', 'senderId'],
//     defaultMessage: 'Someone liked your post',
//     urlPath: '/posts/:id'
//   },
//   COMMENT: {
//     key: 'comment',
//     requiredRelations: ['postId', 'commentId', 'senderId'],
//     defaultMessage: 'New comment on your post',
//     urlPath: '/posts/:postId#comment-:commentId'
//   },
//   MESSAGE: {
//     key: 'message',
//     requiredRelations: ['messageId', 'chatId', 'senderId'],
//     defaultMessage: 'New message received',
//     urlPath: '/chats/:id'
//   },
//   SYSTEM: {
//     key: 'system',
//     requiredFields: ['message'],
//     defaultMessage: 'System notification',
//     urlPath: null
//   }
// });

// class Notification extends Model {
//   static associate(models) {
//     // Validate models exist before creating associations
//     if (!models.User) throw new Error('User model is required');
    
//     // Recipient association (user who receives the notification)
//     this.belongsTo(models.User, {
//       as: 'recipient',
//       foreignKey: 'userId',
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE'
//     });

//     // Sender association (user who triggered the notification)
//     this.belongsTo(models.User, {
//       as: 'sender',
//       foreignKey: 'senderId',
//       onDelete: 'SET NULL',
//       onUpdate: 'CASCADE'
//     });

//     // Optional relationships with safe checks
//     const safeBelongsTo = (modelName, foreignKey, as) => {
//       if (models[modelName]) {
//         this.belongsTo(models[modelName], {
//           foreignKey,
//           as,
//           onDelete: 'SET NULL',
//           onUpdate: 'CASCADE'
//         });
//       }
//     };

//     safeBelongsTo('Friendship', 'friendshipId', 'friendship');
//     safeBelongsTo('Post', 'postId', 'post');
//     safeBelongsTo('Comment', 'commentId', 'comment');
//     safeBelongsTo('Group', 'groupId', 'group');
//     safeBelongsTo('Chat', 'chatId', 'chat');
//     safeBelongsTo('Message', 'messageId', 'message');
//   }

//   /**
//    * Mark all notifications as read for a user
//    * @param {number} userId - ID of the recipient user
//    * @returns {Promise<number>} Number of updated notifications
//    */
//   static async markAsRead(userId) {
//     return this.update(
//       { isRead: true, readAt: new Date() },
//       { where: { userId, isRead: false } }
//     );
//   }

//   /**
//    * Get unread notification count for a user
//    * @param {number} userId - ID of the recipient user
//    * @returns {Promise<number>} Count of unread notifications
//    */
//   static async getUnreadCount(userId) {
//     return this.count({
//       where: { userId, isRead: false }
//     });
//   }

//   /**
//    * Get notification preview text
//    * @returns {string} Human-readable notification summary
//    */
//   getPreviewText() {
//     const typeConfig = this.getTypeConfig();
    
//     if (this.type === NOTIFICATION_TYPES.SYSTEM.key && this.metadata?.message) {
//       return this.metadata.message;
//     }
    
//     return typeConfig?.defaultMessage || 'New notification';
//   }

//   /**
//    * Get action URL for the notification
//    * @returns {string|null} URL path or null if no action available
//    */
//   getActionUrl() {
//     const typeConfig = this.getTypeConfig();
//     if (!typeConfig?.urlPath) return null;

//     return typeConfig.urlPath
//       .replace(':id', this.friendshipId || this.postId || this.chatId)
//       .replace(':postId', this.postId)
//       .replace(':commentId', this.commentId);
//   }

//   /**
//    * Get configuration for current notification type
//    * @private
//    */
//   getTypeConfig() {
//     return Object.values(NOTIFICATION_TYPES).find(t => t.key === this.type);
//   }

//   /**
//    * Validate required fields based on notification type
//    * @private
//    */
//   validateTypeRequirements() {
//     const typeConfig = this.getTypeConfig();
//     if (!typeConfig) return;

//     // Validate required relations
//     if (typeConfig.requiredRelations) {
//       for (const field of typeConfig.requiredRelations) {
//         if (!this[field]) {
//           throw new Error(`"${field}" is required for ${this.type} notifications`);
//         }
//       }
//     }

//     // Validate required metadata fields
//     if (typeConfig.requiredFields) {
//       for (const field of typeConfig.requiredFields) {
//         if (!this.metadata?.[field]) {
//           throw new Error(`"metadata.${field}" is required for ${this.type} notifications`);
//         }
//       }
//     }
//   }
// }

// // Initialize model without foreign key constraints initially
// const NotificationSchema = {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   senderId: {
//     type: DataTypes.INTEGER,
//     allowNull: true
//   },
//   type: {
//     type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES).map(t => t.key)),
//     allowNull: false,
//     validate: {
//       isIn: {
//         args: [Object.values(NOTIFICATION_TYPES).map(t => t.key)],
//         msg: 'Invalid notification type'
//       }
//     }
//   },
//   isRead: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },
//   readAt: {
//     type: DataTypes.DATE,
//     allowNull: true
//   },
//   metadata: {
//     type: DataTypes.JSONB,
//     defaultValue: {},
//     validate: {
//       isValidMetadata(value) {
//         if (value && typeof value !== 'object') {
//           throw new Error('Metadata must be an object');
//         }
//       }
//     }
//   },
//   // Foreign key fields (constraints will be added later)
//   friendshipId: { type: DataTypes.INTEGER, allowNull: true },
//   postId: { type: DataTypes.INTEGER, allowNull: true },
//   commentId: { type: DataTypes.INTEGER, allowNull: true },
//   groupId: { type: DataTypes.INTEGER, allowNull: true },
//   chatId: { type: DataTypes.INTEGER, allowNull: true },
//   messageId: { type: DataTypes.INTEGER, allowNull: true }
// };

// const NotificationOptions = {
//   sequelize,
//   modelName: 'Notification',
//   tableName: 'notifications',
//   timestamps: true,
//   paranoid: false, // Will be enabled after initial sync
//   indexes: [
//     { fields: ['userId', 'isRead'] },
//     { fields: ['userId', 'createdAt'] },
//     { fields: ['type'] }
//   ],
//   hooks: {
//     beforeValidate: function(notification) {
//       // Ensure metadata exists
//       if (!notification.metadata || typeof notification.metadata !== 'object') {
//         notification.metadata = {};
//       }
      
//       // Validate type-specific requirements
//       if (notification.type && notification.changed('type')) {
//         notification.validateTypeRequirements();
//       }
//     }
//   }
// };

// // Initialize model
// Notification.init(NotificationSchema, NotificationOptions);

// // Add this after all models are defined
// async function completeModelSetup() {
//   try {
//     // Add foreign key constraints
//     await sequelize.queryInterface.addConstraint('notifications', {
//       fields: ['userId'],
//       type: 'foreign key',
//       references: { table: 'users', field: 'id' },
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE'
//     });

//     await sequelize.queryInterface.addConstraint('notifications', {
//       fields: ['senderId'],
//       type: 'foreign key',
//       references: { table: 'users', field: 'id' },
//       onDelete: 'SET NULL',
//       onUpdate: 'CASCADE'
//     });

//     // Enable paranoid mode by adding deletedAt column
//     await sequelize.queryInterface.addColumn('notifications', 'deletedAt', {
//       type: DataTypes.DATE,
//       allowNull: true
//     });

//     // Add remaining indexes
//     await sequelize.queryInterface.addIndex('notifications', ['senderId']);
//     await sequelize.queryInterface.addIndex('notifications', ['friendshipId']);
//     await sequelize.queryInterface.addIndex('notifications', ['postId']);

//     console.log('Notification model setup completed successfully');
//   } catch (error) {
//     console.error('Error completing notification model setup:', error);
//   }
// }

// // Static properties
// Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
// Notification.completeSetup = completeModelSetup;

// module.exports = Notification;



//! previous version
// src/models/notificationModel.js
// const { DataTypes, Model } = require('sequelize');
// const sequelize = require('../config/database'); // Update path if needed
// const User = require('./userModel'); // Ensure userModel is correctly set up

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
//       onDelete: 'SET NULL',
//       onUpdate: 'CASCADE'
//     });

//     this.belongsTo(models.User, {
//       as: 'recipient',
//       foreignKey: 'userId',
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE'
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
// }

// Notification.init({
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
//   }
// }, {
//   sequelize,
//   modelName: 'Notification',
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

// Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
// module.exports = Notification;

















