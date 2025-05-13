// migrations/XXXXXXXXXXXXXX-create-chat.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chats', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: Sequelize.ENUM('dm', 'group'),
        defaultValue: 'dm'
      },
      name: {
        type: Sequelize.STRING
      },
      lastMessage: {
        type: Sequelize.TEXT
      },
      lastMessageAt: {
        type: Sequelize.DATE
      },
      lastMessageId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'messages',
          key: 'id'
        },
        onDelete: 'SET NULL'
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('chats');
  }
};