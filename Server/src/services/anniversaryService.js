const { Op } = require('sequelize');
const Friendship = require('../models/friendshipModel');
const Notification = require('../models/notificationModel');
const logger = require('../config/logger');

class AnniversaryService {
  static async checkAnniversaries() {
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      
      // Get friendships accepted on this date
      const friendships = await Friendship.findAll({
        where: {
          status: 'accepted',
          [Op.and]: [
            sequelize.where(sequelize.fn('DAY', sequelize.col('acceptedAt')), day),
            sequelize.where(sequelize.fn('MONTH', sequelize.col('acceptedAt')), month)
          ]
        }
      });

      // Process each friendship
      for (const friendship of friendships) {
        await this.notifyFriends(friendship);
      }

      logger.info(`Processed ${friendships.length} anniversaries`);
    } catch (error) {
      logger.error('Anniversary check failed:', error);
    }
  }

  static async notifyFriends(friendship) {
    try {
      const years = new Date().getFullYear() - friendship.acceptedAt.getFullYear();
      
      const notifications = [
        {
          userId: friendship.userId,
          type: 'friendship_anniversary',
          senderId: friendship.friendId,
          message: `You've been friends with ${friendship.requested.firstName} for ${years} year${years > 1 ? 's' : ''}!`,
          metadata: {
            friendshipId: friendship.id,
            years
          }
        },
        {
          userId: friendship.friendId,
          type: 'friendship_anniversary',
          senderId: friendship.userId,
          message: `You've been friends with ${friendship.requester.firstName} for ${years} year${years > 1 ? 's' : ''}!`,
          metadata: {
            friendshipId: friendship.id,
            years
          }
        }
      ];

      await Notification.bulkCreate(notifications);

      logger.info(`Sent anniversary notifications for friendship ${friendship.id}`);
    } catch (error) {
      logger.error(`Failed to notify friends for friendship ${friendship.id}:`, error);
    }
  }
}

module.exports = AnniversaryService;