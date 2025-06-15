'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_friends', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      friendId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      acceptedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('user_friends', ['userId', 'friendId'], {
      unique: true,
      name: 'user_friends_user_id_friend_id'
    });
    
    await queryInterface.addIndex('user_friends', [
      Sequelize.literal('LEAST("userId", "friendId")'),
      Sequelize.literal('GREATEST("userId", "friendId")')
    ], {
      unique: true,
      name: 'unique_friendship'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_friends');
  }
};