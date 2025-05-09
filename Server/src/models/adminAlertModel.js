const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminAlert = sequelize.define('AdminAlert', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  type: {
    type: DataTypes.ENUM('gender_change', 'birthdate_change', 'suspicious_activity'),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Alert type is required'
      }
    }
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidDetails(value) {
        if (!value || typeof value !== 'object') {
          throw new Error('Details must be an object');
        }
        
        // Common required field for all alert types
        if (!value.alertMessage) {
          throw new Error('Details must contain an alertMessage field');
        }

        // Type-specific required fields
        if (this.type === 'gender_change') {
          const genderFields = ['oldGender', 'newGender', 'userEmail'];
          genderFields.forEach(field => {
            if (!value[field]) {
              throw new Error(`Gender change alerts must contain ${field} field`);
            }
          });
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM(
      'pending',     // Initial state
      'in_review',   // Currently being reviewed
      'resolved',    // Approved and completed
      'rejected',    // Denied
      'flagged'      // Requires special attention
    ),
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'in_review', 'resolved', 'rejected', 'flagged']],
        msg: 'Invalid status value'
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
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
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
  }
}, {
  tableName: 'admin_alerts',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['userId'], name: 'admin_alerts_user_id_idx' },
    { fields: ['status'], name: 'admin_alerts_status_idx' },
    { fields: ['reviewedBy'], name: 'admin_alerts_reviewed_by_idx' },
    { fields: ['createdAt'], name: 'admin_alerts_created_at_idx' },
    { fields: ['type'], name: 'admin_alerts_type_idx' }
  ],
  hooks: {
    beforeUpdate: (alert) => {
      if (alert.status === 'pending' && alert._previousDataValues.status !== 'pending') {
        throw new Error('Cannot revert status to pending after review');
      }
      
      // Automatically set reviewedAt when status changes from pending
      if (alert.changed('status') && 
          alert._previousDataValues.status === 'pending' && 
          alert.status !== 'pending') {
        alert.reviewedAt = new Date();
      }
    }
  }
});

module.exports = AdminAlert;






