// migrations/XXXXXX-create-chat.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chats', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      lastMessageId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Messages',
          key: 'id'
        }
      },
      lastMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      lastMessageAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('Chats', ['lastMessageId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Chats');
  }
};