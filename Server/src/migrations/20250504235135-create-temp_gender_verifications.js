'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    await queryInterface.createTable('temp_gender_verifications', {
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
      pendingChangeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pending_gender_changes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      otp: {
        type: Sequelize.STRING(6),
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isTestRecord: {
        type: Sequelize.BOOLEAN,
        defaultValue: isDevelopment
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
        allowNull: !isDevelopment
      }
    });

    await queryInterface.addIndex('temp_gender_verifications', ['userId', 'pendingChangeId'], {
      unique: true
    });
    await queryInterface.addIndex('temp_gender_verifications', ['expiresAt']);
    
    if (isDevelopment) {
      await queryInterface.addIndex('temp_gender_verifications', ['isTestRecord']);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('temp_gender_verifications');
  }
};