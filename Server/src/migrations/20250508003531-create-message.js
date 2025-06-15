// migrations/XXXXXX-create-message.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      chatId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id'
        }
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
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

    await queryInterface.addIndex('Messages', ['chatId']);
    await queryInterface.addIndex('Messages', ['senderId']);
    await queryInterface.addIndex('Messages', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  }
};