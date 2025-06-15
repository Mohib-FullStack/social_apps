'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create new table structure
    await queryInterface.createTable('friendships', {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
       },
       userId: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: {
           model: 'users',
           key: 'id'
         },
         onDelete: 'CASCADE'
       },
friendId: {
    type: DataTypes.INTEGER,
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
        references: { model: 'users', key: 'id' }
      },
      acceptedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true }
    });

    // 2. Copy data from old table (with UUID generation)
    await queryInterface.sequelize.query(`
      INSERT INTO friendships 
        (id, userId, friendId, status, acceptedAt, createdAt, updatedAt, deletedAt)
      SELECT 
        gen_random_uuid(),  -- PostgreSQL UUID function
        userId, 
        friendId, 
        status, 
        CASE WHEN status = 'accepted' THEN COALESCE(acceptedAt, NOW()) ELSE NULL END,
        createdAt,
        updatedAt,
        deletedAt
      FROM user_friends
    `);

    // 3. Add indexes
    await queryInterface.addIndex('friendships', ['userId', 'friendId'], {
      unique: true,
      name: 'friendships_user_id_friend_id'
    });

    // 4. Verify counts match before dropping old table
    const [oldCount] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) FROM user_friends'
    );
    const [newCount] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) FROM friendships'
    );

    if (oldCount[0].count !== newCount[0].count) {
      throw new Error('Data migration count mismatch! Aborting.');
    }

    // 5. Only then drop the old table
    await queryInterface.dropTable('user_friends');
  },

  async down(queryInterface) {
    // Rollback procedure
    await queryInterface.createTable('user_friends', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { 
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      friendId: { 
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      acceptedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true }
    });

    // Copy data back
    await queryInterface.sequelize.query(`
      INSERT INTO user_friends 
        (userId, friendId, status, acceptedAt, createdAt, updatedAt, deletedAt)
      SELECT 
        userId, 
        friendId, 
        status, 
        CASE WHEN status = 'accepted' THEN acceptedAt ELSE NULL END,
        createdAt,
        updatedAt,
        deletedAt
      FROM friendships
    `);

    await queryInterface.dropTable('friendships');
  }
};