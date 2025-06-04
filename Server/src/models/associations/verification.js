// src/models/associations/verification.js
module.exports = (db, CASCADE, SET_NULL) => {
  const {
    User,
    VerificationDocument,
    TempPhoneUpdate,
    PendingGenderChange,
    TempGenderVerification,
    AdminAlert
  } = db;

  User.hasMany(VerificationDocument, { foreignKey: 'userId', as: 'submittedDocuments', ...CASCADE });
  VerificationDocument.belongsTo(User, { foreignKey: 'userId', as: 'submitter', ...CASCADE });
  VerificationDocument.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer', ...SET_NULL });

  User.hasMany(TempPhoneUpdate, { foreignKey: 'userId', as: 'phoneUpdateRequests', ...CASCADE });
  TempPhoneUpdate.belongsTo(User, { foreignKey: 'userId', as: 'user', ...CASCADE });

  User.hasMany(PendingGenderChange, { foreignKey: 'userId', as: 'genderChangeRequests', ...CASCADE });
  PendingGenderChange.belongsTo(User, { foreignKey: 'userId', as: 'requestingUser', ...CASCADE });
  PendingGenderChange.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewingAdmin', ...SET_NULL });

  PendingGenderChange.hasOne(TempGenderVerification, { foreignKey: 'pendingChangeId', as: 'otpVerification', ...CASCADE });
  TempGenderVerification.belongsTo(PendingGenderChange, { foreignKey: 'pendingChangeId', as: 'genderChangeRequest', ...CASCADE });

  User.hasMany(TempGenderVerification, { foreignKey: 'userId', as: 'genderVerificationOTPs', ...CASCADE });
  TempGenderVerification.belongsTo(User, { foreignKey: 'userId', as: 'user', ...CASCADE });

  AdminAlert.hasOne(PendingGenderChange, { foreignKey: 'adminAlertId', as: 'genderChangeRequest', ...SET_NULL });
  PendingGenderChange.belongsTo(AdminAlert, { foreignKey: 'adminAlertId', as: 'adminAlert', ...SET_NULL });
};