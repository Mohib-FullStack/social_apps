// src/models/associations/notifications.js
module.exports = (db, CASCADE, SET_NULL) => {
  const { Notification, User, Friendship, Post, Comment, Group, Chat, Message } = db;

  User.hasMany(Notification, { foreignKey: 'userId', as: 'receivedNotifications', ...CASCADE });
  User.hasMany(Notification, { foreignKey: 'senderId', as: 'sentNotifications', ...CASCADE });

  Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient', ...CASCADE });
  Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender', ...CASCADE });

  Notification.belongsTo(Friendship, { foreignKey: 'friendshipId', as: 'friendshipNotification', ...SET_NULL });
  Notification.belongsTo(Post, { foreignKey: 'postId', as: 'postNotification', ...SET_NULL });
  Notification.belongsTo(Comment, { foreignKey: 'commentId', as: 'commentNotification', ...SET_NULL });
  Notification.belongsTo(Group, { foreignKey: 'groupId', as: 'groupNotification', ...SET_NULL });
  Notification.belongsTo(Chat, { foreignKey: 'chatId', as: 'chatNotification', ...SET_NULL });
  Notification.belongsTo(Message, { foreignKey: 'messageId', as: 'messageNotification', ...SET_NULL });
};
