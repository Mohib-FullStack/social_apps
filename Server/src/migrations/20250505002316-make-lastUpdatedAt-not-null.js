"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Set default value for existing NULL entries
    await queryInterface.sequelize.query(`
      UPDATE "users" SET "lastUpdatedAt" = NOW() WHERE "lastUpdatedAt" IS NULL;
    `);

    // Step 2: Change column to NOT NULL
    await queryInterface.changeColumn("users", "lastUpdatedAt", {
      allowNull: false,
      type: Sequelize.DATE,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert: allow NULL again
    await queryInterface.changeColumn("users", "lastUpdatedAt", {
      allowNull: true,
      type: Sequelize.DATE,
    });
  },
};
