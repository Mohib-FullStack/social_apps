// utils/notifyUser.js
const { Notification } = require('../models');
const io = require('../config/socketInstance'); // You need to export the io instance after initialization

async function sendNotification({ recipientId, senderId, type, metadata }) {
  const notification = await Notification.create({
    userId: recipientId,
    senderId,
    type,
    metadata,
  });

  io.to(`user_${recipientId}`).emit('notification:new', {
    id: notification.id,
    type,
    isRead: false,
    metadata,
    createdAt: notification.createdAt,
  });

  return notification;
}

module.exports = { sendNotification };
