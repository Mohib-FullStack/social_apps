// models/notificationModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
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
    },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM(
      'friend_request',
      'friend_request_accepted',
      'post_like',
      'comment',
      'message',
      'system'
    ),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Notification type is required'
      },
      isIn: {
        args: [['friend_request', 'friend_request_accepted', 'post_like', 'comment', 'message', 'system']],
        msg: 'Invalid notification type'
      }
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    validate: {
      notNull: {
        msg: 'Sender ID is required'
      }
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    validate: {
      isValidMetadata(value) {
        if (value && typeof value !== 'object') {
          throw new Error('Metadata must be an object');
        }
        
        // Type-specific validation
        switch (this.type) {
          case 'friend_request':
            if (!value?.friendshipId) {
              throw new Error('Friend request notifications require friendshipId in metadata');
            }
            break;
          case 'post_like':
            if (!value?.postId || !value?.likeId) {
              throw new Error('Post like notifications require postId and likeId in metadata');
            }
            break;
          case 'comment':
            if (!value?.postId || !value?.commentId) {
              throw new Error('Comment notifications require postId and commentId in metadata');
            }
            break;
        }
      }
    }
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'isRead']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['type']
    }
  ],
  hooks: {
    beforeValidate: (notification) => {
      // Ensure metadata is always an object
      if (!notification.metadata) {
        notification.metadata = {};
      }
    }
  }
});

// Class Methods
Notification.markAsRead = async function(userId) {
  return this.update(
    { isRead: true },
    { where: { userId, isRead: false } }
  );
};

Notification.getUnreadCount = async function(userId) {
  return this.count({
    where: {
      userId,
      isRead: false
    }
  });
};

// Instance Methods
Notification.prototype.getPreviewText = function() {
  switch(this.type) {
    case 'friend_request':
      return 'You have a new friend request';
    case 'friend_request_accepted':
      return 'Your friend request was accepted';
    case 'post_like':
      return 'Someone liked your post';
    case 'comment':
      return 'New comment on your post';
    case 'message':
      return 'New message received';
    case 'system':
      return this.metadata?.message || 'System notification';
    default:
      return 'New notification';
  }
};

module.exports = Notification;