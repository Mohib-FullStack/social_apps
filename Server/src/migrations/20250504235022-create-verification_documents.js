'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verification_documents', {
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
      documentType: {
        type: Sequelize.ENUM('id_card', 'passport', 'driving_license', 'other'),
        allowNull: false
      },
      frontImage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      backImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      selfieImage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
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

    await queryInterface.addIndex('verification_documents', ['userId'], {
      name: 'verification_documents_user_id_idx'
    });
    await queryInterface.addIndex('verification_documents', ['status'], {
      name: 'verification_documents_status_idx'
    });
    await queryInterface.addIndex('verification_documents', ['reviewedBy'], {
      name: 'verification_documents_reviewed_by_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('verification_documents');
  }
};