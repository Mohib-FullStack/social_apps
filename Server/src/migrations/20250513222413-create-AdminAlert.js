// migrations/XXXXXXXXXXXXXX-create-admin-alert.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admin_alerts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      alertType: {
        type: Sequelize.ENUM('profile_change', 'content_report', 'system_alert'),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'resolved'),
        defaultValue: 'open'
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      reviewedAt: {
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('admin_alerts');
  }
};