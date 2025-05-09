const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PendingGenderChange = sequelize.define('PendingGenderChange', {
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
  requestedGender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
    validate: {
      notNull: { msg: 'Requested gender is required' }
    }
  },
  currentGender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
    validate: {
      notNull: { msg: 'Current gender is required' }
    }
  },
  verificationToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Reason must be less than 500 characters'
      },
      notEmptyIfRequired(value) {
        if ((this.status === 'requires_info' || this.status === 'rejected') && !value) {
          throw new Error('Reason is required when status is "requires_info" or "rejected"');
        }
      }
    }
  },
  supportingDocuments: {
    type: DataTypes.JSONB,
    allowNull: true,
    validate: {
      isValidDocuments(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('Supporting documents must be an array');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM(
      'pending',        // Initial state
      'email_verified', // After email verification
      'otp_pending',    // OTP sent, waiting verification
      'admin_review',   // OTP verified, waiting admin
      'approved',       // Admin approved
      'rejected',       // Admin/System rejected
      'requires_info'   // Needs more information (kept for backward compatibility)
    ),
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [[
          'pending',
          'email_verified',
          'otp_pending',
          'admin_review',
          'approved',
          'rejected',
          'requires_info'
        ]],
        msg: 'Invalid status value'
      }
    }
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Review notes must be less than 1000 characters'
      }
    }
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  adminAlertId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admin_alerts',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'pending_gender_changes',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['userId'], name: 'pending_gender_changes_user_id_idx' },
    { fields: ['adminAlertId'], name: 'pending_gender_changes_admin_alert_id_idx' },
    { fields: ['status'], name: 'pending_gender_changes_status_idx' },
    { fields: ['reviewedBy'], name: 'pending_gender_changes_reviewed_by_idx' },
    { fields: ['verificationToken'], name: 'pending_gender_changes_verification_token_idx' }
  ],
  hooks: {
    beforeValidate: (request) => {
      if (request.status === 'approved' && !request.reviewedBy) {
        throw new Error('Reviewed by field is required when status is approved');
      }
    }
  }
});

module.exports = PendingGenderChange;










