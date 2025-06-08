const { Op } = require('sequelize');
const User = require('../models/userModel');
const Friendship = require('../models/friendshipModel');
const Notification = require('../models/notificationModel');
const logger = require('../config/logger');

class BirthdayService {
  static async checkBirthdays() {
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      
      // Get all users with birthdays today
      const birthdayUsers = await User.findAll({
        where: {
          [Op.and]: [
            sequelize.where(sequelize.fn('DAY', sequelize.col('birthDate')), day),
            sequelize.where(sequelize.fn('MONTH', sequelize.col('birthDate')), month)
          ]
        }
      });

      // Process each birthday user
      for (const user of birthdayUsers) {
        await this.notifyFriends(user);
      }

      logger.info(`Processed ${birthdayUsers.length} birthdays`);
    } catch (error) {
      logger.error('Birthday check failed:', error);
    }
  }

  static async notifyFriends(birthdayUser) {
    try {
      // Get all accepted friendships
      const friendships = await Friendship.findAll({
        where: {
          [Op.or]: [
            { userId: birthdayUser.id },
            { friendId: birthdayUser.id }
          ],
          status: 'accepted'
        }
      });

      // Extract friend IDs
      const friendIds = friendships.map(f => 
        f.userId === birthdayUser.id ? f.friendId : f.userId
      );

      // Create notifications
      const notifications = friendIds.map(friendId => ({
        userId: friendId,
        type: 'birthday_reminder',
        senderId: birthdayUser.id,
        message: `It's ${birthdayUser.firstName}'s birthday today!`,
        metadata: {
          birthdayUserId: birthdayUser.id
        }
      }));

      await Notification.bulkCreate(notifications);

      logger.info(`Sent ${notifications.length} birthday reminders for user ${birthdayUser.id}`);
    } catch (error) {
      logger.error(`Failed to notify friends for user ${birthdayUser.id}:`, error);
    }
  }
}

module.exports = BirthdayService;