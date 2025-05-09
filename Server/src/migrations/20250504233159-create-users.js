'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      originalPhone: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      coverImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false
      },
      originalGender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      birthDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      originalBirthDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      lastGenderChange: {
        type: Sequelize.DATE,
        allowNull: true
      },
      genderChangeCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      phoneVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verificationDocuments: {
        type: Sequelize.JSON,
        defaultValue: null
      },
      lastActive: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isBanned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      privacySettings: {
        type: Sequelize.JSON,
        defaultValue: {
          profileVisibility: 'public',
          searchVisibility: true,
          activityStatus: true
        }
      },
      passwordChangedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      emailVerifyToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      lastUpdatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['phone'], { unique: true });
    await queryInterface.addIndex('users', ['originalPhone'], { unique: true });
    await queryInterface.addIndex('users', ['firstName', 'lastName']);
    await queryInterface.addIndex('users', ['isAdmin']);
    await queryInterface.addIndex('users', ['lastActive']);
    await queryInterface.addIndex('users', ['joinedAt']);
    await queryInterface.addIndex('users', ['phoneVerified']);
    await queryInterface.addIndex('users', ['lastActive'], {
      where: { isBanned: false }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};