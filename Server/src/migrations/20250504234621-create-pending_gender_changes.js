'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pending_gender_changes', {
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
      requestedGender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false
      },
      currentGender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false
      },
      verificationToken: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      supportingDocuments: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'requires_more_info'),
        defaultValue: 'pending'
      },
      reviewNotes: {
        type: Sequelize.TEXT,
        allowNull: true
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
      adminAlertId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'admin_alerts',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Indexes
    await queryInterface.addIndex('pending_gender_changes', ['userId'], { name: 'pending_gender_changes_user_id_idx' });
    await queryInterface.addIndex('pending_gender_changes', ['adminAlertId'], { name: 'pending_gender_changes_admin_alert_id_idx' });
    await queryInterface.addIndex('pending_gender_changes', ['status'], { name: 'pending_gender_changes_status_idx' });
    await queryInterface.addIndex('pending_gender_changes', ['reviewedBy'], { name: 'pending_gender_changes_reviewed_by_idx' });
    await queryInterface.addIndex('pending_gender_changes', ['verificationToken'], { name: 'pending_gender_changes_verification_token_idx' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pending_gender_changes');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_pending_gender_changes_requestedGender";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_pending_gender_changes_currentGender";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_pending_gender_changes_status";`);
  }
};
