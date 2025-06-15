// migrations/XXXXXX-add-last-message-fk-to-chat.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Chats', 'lastMessageId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Chats', 'lastMessageId');
  }
};