module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Messages', 'reactions', {
      type: Sequelize.JSON,
      defaultValue: {}
    });
    await queryInterface.addColumn('Messages', 'edited', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('Messages', 'readBy', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: []
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Messages', 'reactions');
    await queryInterface.removeColumn('Messages', 'edited');
    await queryInterface.removeColumn('Messages', 'readBy');
  }
};