// migrations/XXXXXX-create-chat-participant.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChatParticipants', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      chatId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id'
        }
      },
      userId: {
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

    await queryInterface.addIndex('ChatParticipants', ['chatId']);
    await queryInterface.addIndex('ChatParticipants', ['userId']);
    await queryInterface.addIndex('ChatParticipants', ['chatId', 'userId'], {
      unique: true,
      name: 'chat_participant_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChatParticipants');
  }
};