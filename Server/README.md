npx sequelize-cli migration:generate --name create-friendships

module.exports = {
up: async (queryInterface, Sequelize) => {
await queryInterface.createTable('friendships', {
id: {
type: Sequelize.UUID,
defaultValue: Sequelize.UUIDV4,
primaryKey: true
},
userId: {
type: Sequelize.UUID,
references: { model: 'users', key: 'id' },
onDelete: 'CASCADE'
},
friendId: {
type: Sequelize.UUID,
references: { model: 'users', key: 'id' },
onDelete: 'CASCADE'
},
status: {
type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'blocked'),
defaultValue: 'pending'
},
actionUserId: {
type: Sequelize.UUID,
references: { model: 'users', key: 'id' },
allowNull: true
},
createdAt: { type: Sequelize.DATE },
updatedAt: { type: Sequelize.DATE }
});

    await queryInterface.addIndex('friendships', ['userId', 'friendId'], {
      unique: true
    });

},

down: async (queryInterface) => {
await queryInterface.dropTable('friendships');
}
};
