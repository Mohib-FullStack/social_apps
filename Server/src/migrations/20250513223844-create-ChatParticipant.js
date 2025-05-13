// migrations/XXXXXXXXXXXXXX-create-chat-participant.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat_participants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      chatId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'chats',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('member', 'admin'),
        defaultValue: 'member'
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      leftAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('chat_participants', ['chatId', 'userId'], {
      unique: true,
      where: { leftAt: null },
      name: 'chat_participant_unique_active'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('chat_participants');
  }
};