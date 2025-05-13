// migrations/XXXXXXXXXXXXXX-create-like.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('likes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      postId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      commentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'comments',
          key: 'id'
        },
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('likes', ['userId', 'postId'], {
      unique: true,
      where: { commentId: null }
    });

    await queryInterface.addIndex('likes', ['userId', 'commentId'], {
      unique: true,
      where: { postId: null }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('likes');
  }
};