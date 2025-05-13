class NotificationService {
  static async createFriendRequestNotification(senderId, recipientId, friendshipId) {
    const notification = await Notification.create({
      userId: recipientId,
      type: 'friend_request',
      senderId,
      isRead: false,
      metadata: { friendshipId }
    });

    // Real-time push
    this.sendSocketNotification(recipientId, {
      type: 'friend_request',
      data: {
        from: senderId,
        friendshipId
      }
    });

    // Email notification
    await this.sendEmailNotification(recipientId, 'friend_request');
  }

  static async sendSocketNotification(userId, payload) {
    // Implementation using your socket service
  }

  static async sendEmailNotification(userId, type) {
    // Email sending logic
  }
}

module.exports = NotificationService;