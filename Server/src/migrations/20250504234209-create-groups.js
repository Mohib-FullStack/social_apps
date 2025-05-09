'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('groups', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      privacy: {
        type: Sequelize.ENUM('public', 'private', 'secret'),
        defaultValue: 'public'
      },
      coverImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      creatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('groups', ['name'], { unique: true });
    await queryInterface.addIndex('groups', ['privacy']);
    await queryInterface.addIndex('groups', ['creatorId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('groups');
  }
};