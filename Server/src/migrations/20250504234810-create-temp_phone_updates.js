'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    await queryInterface.createTable('temp_phone_updates', {
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
      newPhone: {
        type: Sequelize.STRING,
        allowNull: false
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

    if (!isDevelopment) {
      await queryInterface.addIndex('temp_phone_updates', ['userId'], {
        unique: true
      });
    }
    
    await queryInterface.addIndex('temp_phone_updates', ['expiresAt']);
    
    if (isDevelopment) {
      await queryInterface.addIndex('temp_phone_updates', ['isTestRecord']);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('temp_phone_updates');
  }
};