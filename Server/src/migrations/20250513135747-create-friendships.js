'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('friendships', {
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
      friendId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'blocked'),
        defaultValue: 'pending'
      },
      actionUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      acceptedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add composite unique index
    await queryInterface.addIndex('friendships', {
      name: 'friendships_userId_friendId_unique',
      unique: true,
      fields: ['userId', 'friendId']
    });

    // Add status indexes
    await queryInterface.addIndex('friendships', {
      name: 'friendships_userId_status',
      fields: ['userId', 'status']
    });

    await queryInterface.addIndex('friendships', {
      name: 'friendships_friendId_status',
      fields: ['friendId', 'status']
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('friendships');
  }
};