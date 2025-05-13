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
        type: Sequelize.ENUM('pending', 'in_review', 'resolved', 'rejected', 'flagged'),
        defaultValue: 'pending'
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
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
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create indexes
    await queryInterface.addIndex('admin_alerts', ['userId'], {
      name: 'admin_alerts_user_id_idx'
    });

    await queryInterface.addIndex('admin_alerts', ['status'], {
      name: 'admin_alerts_status_idx'
    });

    await queryInterface.addIndex('admin_alerts', ['reviewedBy'], {
      name: 'admin_alerts_reviewed_by_idx'
    });

    await queryInterface.addIndex('admin_alerts', ['createdAt'], {
      name: 'admin_alerts_created_at_idx'
    });

    await queryInterface.addIndex('admin_alerts', ['type'], {
      name: 'admin_alerts_type_idx'
    });
  },

  down: async (queryInterface) => {
    // Drop indexes first
    await queryInterface.removeIndex('admin_alerts', 'admin_alerts_user_id_idx');
    await queryInterface.removeIndex('admin_alerts', 'admin_alerts_status_idx');
    await queryInterface.removeIndex('admin_alerts', 'admin_alerts_reviewed_by_idx');
    await queryInterface.removeIndex('admin_alerts', 'admin_alerts_created_at_idx');
    await queryInterface.removeIndex('admin_alerts', 'admin_alerts_type_idx');
    
    // Then drop table
    await queryInterface.dropTable('admin_alerts');
    
    // Drop enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_admin_alerts_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_admin_alerts_status";');
  }
};