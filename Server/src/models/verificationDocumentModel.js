const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VerificationDocument = sequelize.define('VerificationDocument', {
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
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  documentType: {
    type: DataTypes.ENUM('id_card', 'passport', 'driving_license', 'other'),
    allowNull: false,
    validate: {
      notNull: { msg: 'Document type is required' },
    },
  },
  frontImage: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Front image is required' },
      isUrl: { msg: 'Front image must be a valid URL' },
    },
  },
  backImage: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: { msg: 'Back image must be a valid URL' },
    },
  },
  selfieImage: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Selfie image is required' },
      isUrl: { msg: 'Selfie image must be a valid URL' },
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'approved', 'rejected']],
        msg: 'Invalid status value',
      },
    },
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Review notes must be less than 1000 characters',
      },
    },
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'verification_documents',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['userId'], name: 'verification_documents_user_id_idx' },
    { fields: ['status'], name: 'verification_documents_status_idx' },
    { fields: ['reviewedBy'], name: 'verification_documents_reviewed_by_idx' },
  ],
  hooks: {
    beforeValidate: (document) => {
      if (document.status === 'approved' && !document.reviewedBy) {
        throw new Error('Reviewed by field is required when status is approved');
      }
      if (document.status === 'rejected' && !document.reviewNotes) {
        throw new Error('Review notes are required when rejecting a document');
      }
    }
  }
});

// Define associations
VerificationDocument.associate = function(models) {
  VerificationDocument.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'submitter',
    onDelete: 'CASCADE'
  });
  
  VerificationDocument.belongsTo(models.User, {
    foreignKey: 'reviewedBy',
    as: 'reviewer',
    onDelete: 'SET NULL'
  });
};

module.exports = VerificationDocument;








//! with function

// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const VerificationDocument = sequelize.define('VerificationDocument', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//         primaryKey: true,
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'users',
//       key: 'id'
//     },
//     onDelete: 'CASCADE'
//   },
//   documentType: {
//     type: DataTypes.ENUM('id_card', 'passport', 'driving_license', 'other'),
//     allowNull: false,
//     validate: {
//       notNull: {
//         msg: 'Document type is required'
//       }
//     }
//   },
//   frontImage: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       notEmpty: {
//         msg: 'Front image is required'
//       },
//       isUrl: {
//         msg: 'Front image must be a valid URL'
//       }
//     }
//   },
//   backImage: {
//     type: DataTypes.STRING,
//     allowNull: true,
//     validate: {
//       isUrl: {
//         msg: 'Back image must be a valid URL',
//         args: { allow_null: true }
//       }
//     }
//   },
//   selfieImage: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       notEmpty: {
//         msg: 'Selfie image is required'
//       },
//       isUrl: {
//         msg: 'Selfie image must be a valid URL'
//       }
//     }
//   },
//   status: {
//     type: DataTypes.ENUM('pending', 'approved', 'rejected'),
//     defaultValue: 'pending',
//     validate: {
//       isIn: {
//         args: [['pending', 'approved', 'rejected']],
//         msg: 'Invalid status value'
//       }
//     }
//   },
//   reviewNotes: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//     validate: {
//       len: {
//         args: [0, 1000],
//         msg: 'Review notes must be less than 1000 characters'
//       }
//     }
//   },
//   reviewedBy: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'users',
//       key: 'id'
//     },
//     onDelete: 'SET NULL'
//   }
// }, {
//   tableName: 'verification_documents',
//   timestamps: true,
//   paranoid: true,
//   indexes: [
//     { 
//       fields: ['userId'],
//       name: 'verification_documents_user_id_idx' 
//     },
//     { 
//       fields: ['status'],
//       name: 'verification_documents_status_idx' 
//     },
//     {
//       fields: ['reviewedBy'],
//       name: 'verification_documents_reviewed_by_idx'
//     }
//   ],
//   hooks: {
//     beforeValidate: (document) => {
//       if (document.status === 'approved' && !document.reviewedBy) {
//         throw new Error('Reviewed by field is required when status is approved');
//       }
//       if (document.status === 'rejected' && !document.reviewNotes) {
//         throw new Error('Review notes are required when rejecting a document');
//       }
//     }
//   }
// });

// module.exports = VerificationDocument;