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
  profileSlug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    index: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      is: /^[a-z0-9_.]+$/i, // Alphanumeric with dots/underscores
      len: [3, 30]
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
      emailVisibility: 'friends',
      phoneVisibility: 'private',
      birthDateVisibility: 'friends',
      lastActiveVisibility: 'private'
    },
    validate: {
      isValidSettings(value) {
        if (!value || typeof value !== 'object') {
          throw new Error('Privacy settings must be an object');
        }
        const validVisibilities = ['public', 'friends', 'private'];
        for (const key in value) {
          if (!validVisibilities.includes(value[key])) {
            throw new Error(`Invalid privacy setting for ${key}`);
          }
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
    },
    publicProfile: {
      attributes: [
        'id', 'firstName', 'lastName', 'profileSlug', 'username',
        'profileImage', 'coverImage', 'bio', 'website', 'gender',
        'isVerified', 'joinedAt'
      ]
    }
  },
  hooks: {
    beforeCreate: async (user) => {
      // Auto-generate profileSlug if not provided
      if (!user.profileSlug) {
        const baseSlug = `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}`;
        let finalSlug = baseSlug;
        let counter = 1;

        while (await User.findOne({ where: { profileSlug: finalSlug } })) {
          finalSlug = `${baseSlug}.${counter++}`;
        }
        
        user.profileSlug = finalSlug;
      }

      // Only hash password if it's not already hashed
      if (user.password && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 12);
        user.passwordChangedAt = Date.now() - 1000;
      }

      // Keep other initialization logic
      if (user.isNewRecord) {
        user.originalBirthDate = user.birthDate;
        user.originalPhone = user.phone;
        user.originalGender = user.gender;
      }
    },
    beforeSave: async (user) => {
      // Only hash password if it's changed and not already hashed
      if (user.changed('password') && !user.password.startsWith('$2b$')) {
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
    },
    beforeUpdate: async (user) => {
      // Handle username changes
      if (user.changed('username') && user.username) {
        const usernameExists = await User.findOne({ 
          where: { 
            username: user.username,
            id: { [sequelize.Op.ne]: user.id }
          }
        });
        if (usernameExists) {
          throw new Error('Username already taken');
        }
      }
    }
  }
});

// === Instance Methods ===

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

User.prototype.getProfileUrl = function() {
  return this.username 
    ? `/@${this.username}`
    : `/profile/${this.profileSlug}`;
};

module.exports = User;











