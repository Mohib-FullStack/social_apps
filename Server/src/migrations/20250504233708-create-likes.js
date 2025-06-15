'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
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
      postId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      commentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      reactionType: {
        type: Sequelize.ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry'),
        allowNull: false,
        defaultValue: 'like'
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

    await queryInterface.addIndex('likes', ['userId']);
    await queryInterface.addIndex('likes', ['postId']);
    await queryInterface.addIndex('likes', ['commentId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('likes');
  }
};