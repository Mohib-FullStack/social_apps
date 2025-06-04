// ===================== src/models/associations/index.js =====================
const contentAssociations = require('./content');
const socialAssociations = require('./social');
// Add others: groups, verification, messaging, notifications, etc.

module.exports = (db) => {
  const CASCADE = { onDelete: 'CASCADE', onUpdate: 'CASCADE' };
  const SET_NULL = { onDelete: 'SET NULL', onUpdate: 'CASCADE' };

  contentAssociations(db, CASCADE, SET_NULL);
  socialAssociations(db, CASCADE, SET_NULL);
  // Add others below once modularized
  // groupsAssociations(db, CASCADE, SET_NULL);
  // messagingAssociations(db, CASCADE, SET_NULL);
  // verificationAssociations(db, CASCADE, SET_NULL);
  // notificationAssociations(db, CASCADE, SET_NULL);
};