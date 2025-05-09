const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },


  
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 128]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^\+?[\d\s-]+$/
    }
  },
  originalPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^\+?[\d\s-]+$/
    }
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  originalGender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  originalBirthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  lastGenderChange: {
    type: DataTypes.DATE,
    allowNull: true
  },
  genderChangeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 2
    }
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationDocuments: {
    type: DataTypes.JSON,
    defaultValue: null
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  privacySettings: {
    type: DataTypes.JSON,
    defaultValue: {
      profileVisibility: 'public',
      searchVisibility: true,
      activityStatus: true
    },
    validate: {
      isValidSettings(value) {
        if (!value || typeof value !== 'object') {
          throw new Error('Privacy settings must be an object');
        }
        const validVisibilities = ['public', 'friends', 'private'];
        if (!validVisibilities.includes(value.profileVisibility)) {
          throw new Error('Invalid profile visibility setting');
        }
      }
    }
  },
  passwordChangedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerifyToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'joinedAt',
  updatedAt: 'lastUpdatedAt',
  paranoid: true,
  defaultScope: {
    attributes: {
      exclude: [
        'password',
        'passwordResetToken',
        'passwordResetExpires',
        'emailVerifyToken',
        'verificationDocuments'
      ]
    }
  },
  scopes: {
    withSensitive: {
      attributes: {
        include: ['password', 'passwordResetToken', 'verificationDocuments']
      }
    }
  },
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
        user.passwordChangedAt = Date.now() - 1000;
      }

      if (user.changed('gender') && !user.isNewRecord) {
        if (user.genderChangeCount >= 2) {
          throw new Error('Maximum gender changes reached');
        }
        user.lastGenderChange = new Date();
        user.genderChangeCount = (user.genderChangeCount || 0) + 1;
      }

      if (user.isNewRecord) {
        user.originalBirthDate = user.birthDate;
        user.originalPhone = user.phone;
        user.originalGender = user.gender;
      }
    }
  }
});

// Instance Methods
User.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.comparePassword = User.prototype.isPasswordCorrect;

User.prototype.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

User.prototype.canChangeGender = function () {
  return this.genderChangeCount < 2;
};

User.prototype.getCoverImageUrl = function (size = 'original') {
  if (!this.coverImage) return null;
  if (this.coverImage.includes('res.cloudinary.com')) {
    const [base, rest] = this.coverImage.split('/upload/');
    const transformations = {
      thumbnail: 'c_fill,h_150,w_500',
      medium: 'c_fill,h_300,w_1000'
    };
    return `${base}/upload/${transformations[size] || ''}/${rest}`;
  }
  return this.coverImage;
};

module.exports = User;