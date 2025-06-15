// In the migration file
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "pending_gender_changes" 
      ALTER COLUMN "status" TYPE VARCHAR(255),
      DROP CONSTRAINT IF EXISTS "pending_gender_changes_status_check"
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE "pending_gender_changes"
      ALTER COLUMN "status" TYPE TEXT 
      USING (status::text)
    `);
    
    await queryInterface.changeColumn('pending_gender_changes', 'status', {
      type: Sequelize.ENUM(
        'pending',
        'email_verified',
        'otp_pending',
        'admin_review',
        'approved',
        'rejected',
        'requires_info'
      ),
      defaultValue: 'pending'
    });
  },

  async down(queryInterface) {
    // Revert logic if needed
  }
};