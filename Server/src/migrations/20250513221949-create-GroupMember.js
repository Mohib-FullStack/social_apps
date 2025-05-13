// migrations/XXXXXXXXXXXXXX-create-group-member.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('group_members', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      groupId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'groups',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('member', 'admin', 'moderator'),
        defaultValue: 'member'
      },
      status: {
        type: Sequelize.ENUM('active', 'pending', 'banned'),
        defaultValue: 'active'
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

    await queryInterface.addIndex('group_members', ['groupId', 'userId'], {
      unique: true,
      name: 'group_member_unique_pair'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('group_members');
  }
};