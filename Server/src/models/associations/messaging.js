// src/models/associations/messaging.js
module.exports = (db, CASCADE, SET_NULL) => {
  const { Chat, Message, ChatParticipant, User } = db;

  Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages', ...CASCADE });
  Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat', ...CASCADE });

  User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages', ...CASCADE });
  User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages', ...CASCADE });
  Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender', ...CASCADE });
  Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver', ...CASCADE });

  Chat.belongsToMany(User, {
    through: ChatParticipant,
    foreignKey: 'chatId',
    otherKey: 'userId',
    as: 'participants',
    ...CASCADE
  });

  User.belongsToMany(Chat, {
    through: ChatParticipant,
    foreignKey: 'userId',
    otherKey: 'chatId',
    as: 'chats',
    ...CASCADE
  });
};