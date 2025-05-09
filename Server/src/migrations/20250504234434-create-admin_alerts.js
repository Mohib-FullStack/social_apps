'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_alerts', {
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
      type: {
        type: Sequelize.ENUM('gender_change', 'birthdate_change', 'suspicious_activity'),
        allowNull: false
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'flagged'),
        defaultValue: 'pending'
      },
 
         reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewNotes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('admin_alerts', ['userId']);
    await queryInterface.addIndex('admin_alerts', ['status']);
    await queryInterface.addIndex('admin_alerts', ['reviewedBy']);
    await queryInterface.addIndex('admin_alerts', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_alerts');
  }
};