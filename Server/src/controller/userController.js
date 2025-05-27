/**************************************
 *           USER CONTROLLERS         *
 **************************************/
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Import the initialized instance
const { Op } = require('sequelize');
const fs = require('fs').promises;
const emailWithNodeMailer = require('../helper/email');
const {
  clientURL,
  jwtResetPasswordKey,
  jwtActivationkey,
} = require('../secret');
const { successResponse, errorResponse } = require('./responseController');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const { deleteFileFromCloudinary } = require('../helper/cloudinaryHelper');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { checkUserExist } = require('../helper/checkUserExist');
const path = require('path');

const {
  isValidPhone,
  generateOTP,
  sendSMS,
  normalizePhone,
  OTP_CONFIG,
} = require('../helper/phoneHelper');
const { handledestroyAllSessions } = require('../controller/authController');
const TempPhoneUpdate = require('../models/tempPhoneUpdateModel');

//!  🌈 Process Registration - Handles user registration flow
const handleProcessRegister = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, gender, birthDate } =
      req.body;

    // Only store the temp file path, don't upload to Cloudinary yet
    const profileImagePath = req.file ? req.file.path : null;

    // Check if user exists
    const { exists: emailExists } = await checkUserExist({ email });
    const { exists: phoneExists } = phone
      ? await checkUserExist({ phone })
      : { exists: false };

    if (emailExists || phoneExists) {
      // Clean up temp file if exists
      if (profileImagePath) {
        await fs.unlink(profileImagePath).catch(console.error);
      }

      const conflicts = [];
      if (emailExists) conflicts.push('email');
      if (phoneExists) conflicts.push('phone');
      return errorResponse(res, {
        statusCode: 409,
        message: `${conflicts.join(' and ')} already in use`,
      });
    }

    // Create token payload with plain password (let model handle hashing)
    const tokenPayload = {
      firstName,
      lastName,
      email,
      password, // Send plain password - will be hashed by model hook
      phone,
      gender,
      birthDate,
      profileImagePath,
    };

    const token = createJSONWebToken(tokenPayload, jwtActivationkey, '10m');

    await emailWithNodeMailer({
      email,
      subject: 'Account Activation',
      html: `
        <h2>Hello ${firstName} ${lastName}!</h2>
        <p>Please activate your account:</p>
        <a href="${clientURL}/activate?token=${token}">Activate Account</a>
        <p>Link expires in 10 minutes</p>
      `,
    });

    return successResponse(res, {
      statusCode: 200,
      message: `Activation email sent to ${email}`,
      payload: { token },
    });
  } catch (error) {
    // Clean up temp file if error occurs
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(error);
  }
};

//! 🎯 Activate User - Handles account activation
const handleActivateUser = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw createError(400, 'Activation token required');

    const decoded = jwt.verify(token, jwtActivationkey);

    // Check if user already exists
    const { exists } = await checkUserExist({ email: decoded.email });
    if (exists) {
      if (decoded.profileImagePath) {
        await fs.unlink(decoded.profileImagePath).catch(console.error);
      }
      return successResponse(res, {
        statusCode: 409,
        message: 'User already exists. Please log in.',
      });
    }

    let profileImageUrl = null;
    if (decoded.profileImagePath) {
      try {
        const response = await cloudinary.uploader.upload(
          decoded.profileImagePath,
          {
            folder: 'social-network/users/profile-images',
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
          }
        );
        profileImageUrl = response.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        throw createError(500, 'Failed to upload profile image');
      } finally {
        await fs.unlink(decoded.profileImagePath).catch(console.error);
      }
    }

    // Manually generate slug before creation
    const baseSlug = `${decoded.firstName.toLowerCase()}.${decoded.lastName.toLowerCase()}`;
    let profileSlug = baseSlug;
    let counter = 1;

    while (await User.findOne({ where: { profileSlug } })) {
      profileSlug = `${baseSlug}.${counter++}`;
    }

    // Create user with explicit slug
    const user = await User.create({
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      password: decoded.password,
      phone: decoded.phone,
      gender: decoded.gender,
      birthDate: decoded.birthDate,
      profileImage: profileImageUrl,
      profileSlug // Explicitly set the slug
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Account activated successfully. Please log in.',
      payload: { user }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createError(401, 'Token has expired');
    }
    next(error);
  }
};


//! old
// const handleActivateUser = async (req, res, next) => {
//   try {
//     const { token } = req.body;
//     if (!token) throw createError(400, 'Activation token required');

//     const decoded = jwt.verify(token, jwtActivationkey);

//     // Check if user already exists
//     const { exists } = await checkUserExist({ email: decoded.email });
//     if (exists) {
//       if (decoded.profileImagePath) {
//         await fs.unlink(decoded.profileImagePath).catch(console.error);
//       }
//       return successResponse(res, {
//         statusCode: 409,
//         message: 'User already exists. Please log in.',
//       });
//     }

//     let profileImageUrl = null;
//     if (decoded.profileImagePath) {
//       try {
//         const response = await cloudinary.uploader.upload(
//           decoded.profileImagePath,
//           {
//             folder: 'social-network/users/profile-images',
//             transformation: [{ width: 500, height: 500, crop: 'limit' }],
//           }
//         );
//         profileImageUrl = response.secure_url;
//       } catch (uploadError) {
//         console.error('Cloudinary upload failed:', uploadError);
//         throw createError(500, 'Failed to upload profile image');
//       } finally {
//         await fs.unlink(decoded.profileImagePath).catch(console.error);
//       }
//     }

//     // Create user in database - password is already hashed from registration
//     const user = await User.create({
//       firstName: decoded.firstName,
//       lastName: decoded.lastName,
//       email: decoded.email,
//       password: decoded.password, // This is already hashed
//       phone: decoded.phone,
//       gender: decoded.gender,
//       birthDate: decoded.birthDate,
//       profileImage: profileImageUrl,
//     });

//     return successResponse(res, {
//       statusCode: 201,
//       message: 'Account activated successfully. Please log in.',
//       payload: {
//         user: {
//           id: user.id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           email: user.email,
//           phone: user.phone,
//           gender: user.gender,
//           birthDate: user.birthDate,
//           profileImage: user.profileImage,
//         },
//       },
//     });
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       throw createError(401, 'Token has expired');
//     }
//     next(error);
//   }
// };




// 🔵 USER PROFILE MANAGEMENT
// Fetch User Profile
//! Handle fetch private user profile
const handleFetchUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Safely extract user ID from JWT

    // Log userId for debugging
    console.log('User ID from request:', userId);

    if (!userId) {
      console.error('User ID is missing in the request.');
      return errorResponse(res, {
        statusCode: 401,
        message: 'Unauthorized. User ID is not found in the request.',
      });
    }

    // Log before querying the database
    console.log(
      'Attempting to fetch user profile from DB for user ID:',
      userId
    );

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'isAdmin'] },
    });

    // Log the result of the query
    console.log('User fetched from DB:', user);

    if (!user) {
      console.error('User not found in the database.');
      return errorResponse(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    // Successful response
    return successResponse(res, {
      statusCode: 200,
      message: 'User profile retrieved successfully',
      payload: { user },
    });
  } catch (error) {
    // Log detailed error
    console.error('Error fetching user profile:', error);
    return errorResponse(res, {
      statusCode: 500,
      message: 'An error occurred while fetching the user profile',
    });
  }
};

//! 🛡️ Get Public Profile (for other users)
// const handleGetPublicProfile = async (req, res, next) => {
//   try {
//     const userId = req.params.id;

//     if (!userId || userId === 'undefined') {
//       return errorResponse(res, {
//         statusCode: 400,
//         message: 'User ID is required',
//       });
//     }

//     // Get raw user data without Sequelize instance
//     const user = await User.findByPk(userId, {
//       attributes: {
//         exclude: ['password', 'isAdmin', 'emailVerifyToken'],
//       },
//       raw: true, // This ensures we get a plain JavaScript object
//     });

//     if (!user) {
//       return errorResponse(res, {
//         statusCode: 404,
//         message: 'User not found',
//       });
//     }

//     // Manually construct the response object
//     const publicData = {
//       id: user.id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       profileImage: user.profileImage,
//       coverImage: user.coverImage || '/default-cover.jpg',
//       bio: user.bio,
//       website: user.website,
//       email: user.email,
//       phone: user.phone,
//       birthDate: user.birthDate,
//       gender: user.gender,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//     };

//     return successResponse(res, {
//       statusCode: 200,
//       message: 'Public profile retrieved successfully',
//       payload: publicData,
//     });
//   } catch (error) {
//     console.error('Error in handleGetPublicProfile:', error);
//     next(error);
//   }
// };



//! new
// In your userController.js

//! 🛡️ Get Public Profile (for other users)
const handleGetPublicProfile = async (req, res, next) => {
  try {
    const rawId = req.params.id;

    // 1️⃣ Validate presence
    if (!rawId || rawId === 'undefined') {
      return errorResponse(res, {
        statusCode: 400,
        message: 'User ID is required',
      });
    }

    // 2️⃣ Reject the literal "me" on public route
    if (rawId === 'me') {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid user ID for public profile',
      });
    }

    // 3️⃣ Optionally coerce to integer and validate
    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'User ID must be a number',
      });
    }

    // 4️⃣ Fetch the user
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password', 'isAdmin', 'emailVerifyToken'],
      },
      raw: true,
    });

    // 5️⃣ Not found?
    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    // 6️⃣ Build public payload
    const publicData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      coverImage: user.coverImage || '/default-cover.jpg',
      bio: user.bio,
      website: user.website,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(res, {
      statusCode: 200,
      message: 'Public profile retrieved successfully',
      payload: publicData,
    });
  } catch (error) {
    console.error('Error in handleGetPublicProfile:', error);
    next(error);
  }
};


//! Update Private Profile (sensitive info)
// const handleUpdatePrivateProfile = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findByPk(userId);

//     if (!user) {
//       return errorResponse(res, { statusCode: 404, message: 'User not found' });
//     }



//     // Only allow updates to private fields
//     const { phone, birthDate, gender } = req.body;

//     // Validate gender changes
//     if (gender && gender !== user.gender) {
//       if (!user.canChangeGender()) {
//         return errorResponse(res, {
//           statusCode: 400,
//           message: 'Maximum gender changes reached (2 changes allowed)',
//         });
//       }
//     }

//     // Update phone if provided
//     if (phone && phone !== user.phone) {
//       user.phone = phone;
//       user.phoneVerified = false; // Reset verification status
//     }

//     // Update birth date if provided
//     if (birthDate) {
//       user.birthDate = new Date(birthDate);
//     }

//     // Update gender if provided
//     if (gender) {
//       user.gender = gender;
//     }

//     // Handle profile image upload
//     if (req.file) {
//       if (user.profileImage) {
//         await deleteFileFromCloudinary(user.profileImage);
//       }
//       const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
//         folder: 'social-network/users/profile-images',
//       });
//       user.profileImage = uploadResponse.secure_url;
//     }

//  //! Handle cover image upload
//     if (req.file) {
//       if (user.coverImage) {
//         await deleteFileFromCloudinary(user.coverImage);
//       }
//       const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
//         folder: 'social-network/users/cover-images',
//       });
//       user.coverImage = uploadResponse.secure_url;
//     }
   
//         await user.save();

//     return successResponse(res, {
//       statusCode: 200,
//       message: 'Private profile updated successfully',
//       payload: { user },
//     });
//   } catch (error) {
//     console.error('Error updating private profile:', error);
//     next(error);
//   }
// };

//! test
const handleUpdatePrivateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    // Only allow updates to private fields
    const { phone, birthDate, gender } = req.body;

    // Validate gender changes
    if (gender && gender !== user.gender) {
      if (!user.canChangeGender()) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Maximum gender changes reached (2 changes allowed)',
        });
      }
    }

    // Update phone if provided
    if (phone && phone !== user.phone) {
      user.phone = phone;
      user.phoneVerified = false; // Reset verification status
    }

    // Update birth date if provided
    if (birthDate) {
      user.birthDate = new Date(birthDate);
    }

    // Update gender if provided
    if (gender) {
      user.gender = gender;
    }

    // Handle profile image upload (if provided)
    if (req.files?.profileImage) {
      if (user.profileImage) {
        await deleteFileFromCloudinary(user.profileImage);
      }
      const uploadResponse = await cloudinary.uploader.upload(req.files.profileImage[0].path, {
        folder: 'social-network/users/profile-images',
      });
      user.profileImage = uploadResponse.secure_url;
    }

    // Handle cover image upload (if provided)
    if (req.files?.coverImage) {
      if (user.coverImage) {
        await deleteFileFromCloudinary(user.coverImage);
      }
      const uploadResponse = await cloudinary.uploader.upload(req.files.coverImage[0].path, {
        folder: 'social-network/users/cover-images',
      });
      user.coverImage = uploadResponse.secure_url;
    }
   
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Private profile updated successfully',
      payload: { user },
    });
  } catch (error) {
    console.error('Error updating private profile:', error);
    next(error);
  }
};



//! updateCoverImage
const handleUpdateCoverImage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    if (req.file) {
      if (user.coverImage) {
        await deleteFileFromCloudinary(user.coverImage);
      }
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: 'social-network/users/cover-images',
      });
      user.coverImage = uploadResponse.secure_url;
    }

    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Cover image updated successfully',
      payload: { user },
    });
  } catch (error) {
    console.error('Error updating cover image:', error);
    next(error);
  }
};

//! Update Public Profile (non-sensitive info)
const handleUpdatePublicProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    // Validate file sizes
    if (req.files?.profileImage) {
      if (req.files.profileImage[0].size > 5 * 1024 * 1024) { // 5MB
        return errorResponse(res, {
          statusCode: 400,
          message: 'Profile image must be less than 5MB'
        });
      }
    }

    if (req.files?.coverImage) {
      if (req.files.coverImage[0].size > 10 * 1024 * 1024) { // 10MB
        return errorResponse(res, {
          statusCode: 400,
          message: 'Cover image must be less than 10MB'
        });
      }
    }

    // Only allow updates to public fields
    const { firstName, lastName, bio, website, location } = req.body;

    // Update basic info
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.bio = bio || user.bio;
    user.website = website || user.website;
    user.location = location || user.location;

    // Handle profile image upload
    if (req.files?.profileImage) {
      if (user.profileImage) {
        await deleteFileFromCloudinary(user.profileImage);
      }
      const uploadResponse = await cloudinary.uploader.upload(
        req.files.profileImage[0].path,
        {
          folder: 'social-network/users/profile-images',
        }
      );
      user.profileImage = uploadResponse.secure_url;
    }

    // Handle cover image upload
    if (req.files?.coverImage) {
      if (user.coverImage) {
        await deleteFileFromCloudinary(user.coverImage);
      }
      const uploadResponse = await cloudinary.uploader.upload(
        req.files.coverImage[0].path,
        {
          folder: 'social-network/users/cover-images',
        }
      );
      user.coverImage = uploadResponse.secure_url;
    }

    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Public profile updated successfully',
      payload: { user },
    });
  } catch (error) {
    console.error('Error updating public profile:', error);
    next(error);
  }
};


//! 🔐 Update Privacy Settings
const handleUpdatePrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { privacySettings } = req.body;

    const user = await User.findByPk(userId);
    if (!user) throw createError(404, 'User not found');

    // Validate and update only allowed fields
    const validSettings = [
      'profileVisibility',
      'emailVisibility',
      'phoneVisibility',
      'birthDateVisibility',
    ];

    const newSettings = { ...user.privacySettings };
    for (const key in privacySettings) {
      if (validSettings.includes(key)) {
        newSettings[key] = privacySettings[key];
      }
    }

    user.privacySettings = newSettings;
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Privacy settings updated',
      payload: { privacySettings: user.privacySettings },
    });
  } catch (error) {
    next(error);
  }
};

// 🔵 PASSWORD MANAGEMENT
// Update Password
const handleUpdatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) throw createError(404, 'User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw createError(400, 'Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
const handleForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw createError(404, 'No account found with this email');

    const token = createJSONWebToken({ email }, jwtResetPasswordKey, '10m');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await emailWithNodeMailer({
      email,
      subject: 'Password Reset',
      html: `
        <h2>Hello ${user.firstName}!</h2>
        <p>Reset your password:</p>
        <a href="${clientURL}/reset-password?token=${token}">Reset Password</a>
        <p>Link expires in 10 minutes</p>
      `,
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Password reset email sent',
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
const handleResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, jwtResetPasswordKey);
    const user = await User.findOne({
      where: {
        email: decoded.email,
        passwordResetExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) throw createError(401, 'Token expired or invalid');

    user.password = await bcrypt.hash(password, 12);
    user.passwordChangedAt = new Date();
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Password reset link expired',
      });
    }
    next(error);
  }
};

// 🔵 USER RELATIONSHIPS
// Follow User
const handleFollowUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    if (followerId === followingId) {
      throw createError(400, 'Cannot follow yourself');
    }

    const [follower, userToFollow] = await Promise.all([
      User.findByPk(followerId),
      User.findByPk(followingId),
    ]);

    if (!follower || !userToFollow) {
      throw createError(404, 'User not found');
    }

    const isFollowing = await userToFollow.hasFollower(followerId);
    if (isFollowing) {
      throw createError(400, 'Already following this user');
    }

    await userToFollow.addFollower(followerId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Successfully followed user',
      payload: {
        following: {
          id: userToFollow.id,
          username: userToFollow.username,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Unfollow User
const handleUnfollowUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    const userToUnfollow = await User.findByPk(followingId);
    if (!userToUnfollow) throw createError(404, 'User not found');

    const isFollowing = await userToUnfollow.hasFollower(followerId);
    if (!isFollowing) throw createError(400, 'Not following this user');

    await userToUnfollow.removeFollower(followerId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Successfully unfollowed user',
    });
  } catch (error) {
    next(error);
  }
};

// Get Followers
const handleGetFollowers = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'followers',
          attributes: [
            'id',
            'username',
            'firstName',
            'lastName',
            'profileImage',
          ],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) throw createError(404, 'User not found');

    return successResponse(res, {
      statusCode: 200,
      message: 'Followers retrieved',
      payload: user.followers,
    });
  } catch (error) {
    next(error);
  }
};

// Get Following
const handleGetFollowing = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'following',
          attributes: [
            'id',
            'username',
            'firstName',
            'lastName',
            'profileImage',
          ],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) throw createError(404, 'User not found');

    return successResponse(res, {
      statusCode: 200,
      message: 'Following retrieved',
      payload: user.following,
    });
  } catch (error) {
    next(error);
  }
};

/**************************************
 *          ADMIN CONTROLLERS         *
 **************************************/

// 🟠 ADMIN USER MANAGEMENT
const handleGetUsers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: users, count } = await User.findAndCountAll({
      where: {
        [Op.and]: [
          { isAdmin: false },
          {
            [Op.or]: [
              { firstName: { [Op.iLike]: `%${search}%` } },
              { lastName: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } },
            ],
          },
        ],
      },
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Users retrieved',
      payload: {
        users,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          current: parseInt(page),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleGetUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'User retrieved successfully',
      payload: user,
    });
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve user', 500);
  }
};


//! handleUpdateUserById
const handleUpdateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.isAdmin; // From isAdmin middleware
    const updateData = req.body;

    // Only admins can access this endpoint
    if (!isAdmin) {
      return errorResponse(res, 'Admin privileges required', 403);
    }

    // Find the user to update
    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Define allowed fields for admin updates
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'phone',
      'profileImage',
      'coverImage',
      'bio',
      'website',
      'gender',
      'birthDate',
      'privacySettings',
    ];

    // Filter update data to only include allowed fields
    const filteredUpdateData = {};
    for (const field in updateData) {
      if (allowedFields.includes(field)) {
        filteredUpdateData[field] = updateData[field];
      }
    }

    // Handle profile image update if file was uploaded
    if (req.file) {
      try {
        // Delete old image if exists
        if (user.profileImage) {
          const deletionSuccess = await deleteFileFromCloudinary(
            user.profileImage
          );
          if (!deletionSuccess) {
            console.warn(
              'Old image could not be deleted, but continuing with update'
            );
          }
        }

        // Upload new image
        const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
          folder: 'social-network/users/profile-images',
          public_id: `user-${id}-profile`,
          overwrite: true,
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          ],
        });

        filteredUpdateData.profileImage = uploadResponse.secure_url;

        // Clean up temp file
        await fs.unlink(req.file.path).catch((err) => {
          console.error('Error deleting temp file:', err);
        });
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        await fs.unlink(req.file.path).catch(console.error);
        return errorResponse(res, 'Failed to upload profile image', 500);
      }
    }

    // Special handling for password updates
    if (filteredUpdateData.password) {
      filteredUpdateData.passwordChangedAt = new Date(Date.now() - 1000);
    }

    // Special handling for gender changes to track changes
    if (
      filteredUpdateData.gender &&
      filteredUpdateData.gender !== user.gender
    ) {
      filteredUpdateData.lastGenderChange = new Date();
      filteredUpdateData.genderChangeCount = (user.genderChangeCount || 0) + 1;
    }

    // Update the user
    await user.update(filteredUpdateData);

    // Prepare response data
    const userResponse = user.toJSON();

    // Always remove sensitive data from response
    const sensitiveFields = [
      'password',
      'passwordResetToken',
      'passwordResetExpires',
      'emailVerifyToken',
    ];

    sensitiveFields.forEach((field) => delete userResponse[field]);

    return successResponse(res, {
      statusCode: 200,
      message: 'User updated successfully',
      payload: { user: userResponse },
    });
  } catch (error) {
    console.error('Update error:', error);
    return errorResponse(res, 'Failed to update user', 500);
  }
};

//! Phone Update with OTP
const handleUpdatePhone = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    // Validate input presence
    if (!phone) {
      await transaction.rollback();
      return errorResponse(res, 'Phone number is required', 400);
    }

    // this is testing start
    if (process.env.NODE_ENV === 'development') {
      await TempPhoneUpdate.destroy({ where: { userId: req.user.id } });
      console.log('DEV: Cleared previous OTP records for testing');
    }

    // this is testing end

    // Normalize and validate phone format
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
      await transaction.rollback();
      return errorResponse(res, 'Invalid phone number format', 400);
    }

    // Get current user within transaction
    const user = await User.findByPk(userId, {
      attributes: ['id', 'phone', 'phoneVerified', 'isBanned'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      await transaction.rollback();
      return errorResponse(res, 'User not found', 404);
    }

    if (user.isBanned) {
      await transaction.rollback();
      return errorResponse(
        res,
        'Banned users cannot change phone numbers',
        403
      );
    }

    // Check if phone is unchanged
    if (normalizedPhone === user.phone) {
      await transaction.rollback();
      return errorResponse(
        res,
        'This is already your current phone number',
        400
      );
    }

    // Check for existing user with this phone
    const existingUser = await User.findOne({
      where: {
        phone: normalizedPhone,
        id: { [Op.ne]: userId },
      },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return errorResponse(res, 'Phone number already in use', 409);
    }

    // Check for existing OTP request
    const existingRequest = await TempPhoneUpdate.findOne({
      where: { userId },
      transaction,
    });

    if (existingRequest) {
      // If valid OTP exists
      if (new Date() < existingRequest.expiresAt) {
        await transaction.rollback();
        return errorResponse(
          res,
          {
            message: 'OTP already sent',
            canResendAt: new Date(
              existingRequest.createdAt.getTime() +
                OTP_CONFIG.resendDelay * 60 * 1000
            ),
            remainingTime: Math.ceil(
              (existingRequest.expiresAt - new Date()) / 1000 / 60
            ),
          },
          429
        );
      }
      // Remove expired request
      await existingRequest.destroy({ transaction });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(
      Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000
    );

    // DEVELOPMENT MODE: Skip actual SMS sending
    if (process.env.NODE_ENV === 'development') {
      await TempPhoneUpdate.create(
        {
          userId,
          newPhone: normalizedPhone,
          otp,
          expiresAt,
          attempts: 0,
        },
        { transaction }
      );

      await transaction.commit();

      return successResponse(res, {
        message: 'OTP generated (development mode - no SMS sent)',
        payload: {
          expiresIn: `${OTP_CONFIG.expiryMinutes} minutes`,
          maskedPhone: normalizedPhone.replace(
            /(\d{3})\d+(\d{2})/,
            '$1*****$2'
          ),
          debugOtp: otp, // Only include in development
        },
      });
    }

    // PRODUCTION MODE: Send actual SMS
    const smsResult = await sendSMS(
      normalizedPhone,
      `Your ${process.env.APP_NAME} verification code: ${otp}\nValid for ${OTP_CONFIG.expiryMinutes} minutes.`
    );

    if (!smsResult.success) {
      await transaction.rollback();

      // Special handling for invalid numbers
      if (smsResult.error?.includes('invalid')) {
        return errorResponse(
          res,
          'Invalid phone number: Cannot receive SMS',
          400
        );
      }

      return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
    }

    // Create temporary record
    await TempPhoneUpdate.create(
      {
        userId,
        newPhone: normalizedPhone,
        otp,
        expiresAt,
        attempts: 0,
      },
      { transaction }
    );

    await transaction.commit();

    return successResponse(res, {
      message: 'OTP sent successfully',
      payload: {
        expiresIn: `${OTP_CONFIG.expiryMinutes} minutes`,
        maskedPhone: normalizedPhone.replace(/(\d{3})\d+(\d{2})/, '$1*****$2'),
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Phone update error:', error);
    return errorResponse(
      res,
      {
        message: 'Failed to initiate phone update',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      500
    );
  }
};

//! OTP Verification
const verifyPhoneOTP = async (req, res) => {
  let transaction;
  try {
    console.log(
      '[OTP Verification] Starting verification process for user:',
      req.user.id
    );
    console.log('[OTP Verification] Request body:', req.body);

    transaction = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });
    console.log('[OTP Verification] Transaction started');

    const { otp } = req.body;
    const userId = req.user.id;

    // Validate OTP format
    if (!otp || !/^\d{6}$/.test(otp)) {
      console.log('[OTP Verification] Invalid OTP format received');
      await transaction.rollback();
      return errorResponse(res, 'Invalid OTP format', 400);
    }

    // Find with row locking
    console.log('[OTP Verification] Looking up temp phone update record');
    const tempUpdate = await TempPhoneUpdate.findOne({
      where: { userId },
      transaction,
      lock: true,
    });

    if (!tempUpdate) {
      console.log('[OTP Verification] No active OTP request found');
      await transaction.rollback();
      return errorResponse(res, 'No active OTP request', 404);
    }

    // Check expiration
    if (new Date() > tempUpdate.expiresAt) {
      console.log('[OTP Verification] OTP expired');
      await tempUpdate.destroy({ transaction });
      await transaction.rollback();
      return errorResponse(res, 'OTP expired', 401);
    }

    // Verify OTP
    if (tempUpdate.otp !== otp.trim()) {
      console.log('[OTP Verification] Invalid OTP provided');
      await tempUpdate.increment('attempts', { transaction });

      if (tempUpdate.attempts >= parseInt(process.env.OTP_MAX_ATTEMPTS || 5)) {
        console.log('[OTP Verification] Max attempts reached');
        await tempUpdate.destroy({ transaction });
        await transaction.rollback();
        return errorResponse(res, 'Too many attempts', 429);
      }

      await transaction.commit();
      return errorResponse(res, 'Invalid OTP', 401);
    }

    // Successful verification
    console.log('[OTP Verification] OTP verified successfully');
    await User.update(
      { phone: tempUpdate.newPhone, phoneVerified: true },
      { where: { id: userId }, transaction }
    );

    await tempUpdate.destroy({ transaction });
    await transaction.commit();

    console.log('[OTP Verification] Phone number updated successfully');
    return successResponse(res, {
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('[OTP Verification] CRITICAL ERROR:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      body: req.body,
      dbConnectionStatus: sequelize.authenticate
        ? 'checking...'
        : 'no connection',
    });

    // Try to check DB connection status
    try {
      const dbStatus = await sequelize.authenticate();
      console.log('[OTP Verification] DB Connection Status:', dbStatus);
    } catch (dbError) {
      console.error('[OTP Verification] DB Connection Check Failed:', dbError);
    }

    if (transaction) await transaction.rollback();
    return errorResponse(res, 'Verification failed', 500);
  }
};

//! Delete userById
const handleDeleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user including soft-deleted ones
    const user = await User.findOne({
      where: { id: userId },
      paranoid: false,
    });

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    // Always delete Cloudinary assets first
    const deletionResults = [];

    if (user.profileImage) {
      try {
        await deleteFileFromCloudinary(user.profileImage);
        deletionResults.push({ type: 'profileImage', success: true });
      } catch (error) {
        deletionResults.push({
          type: 'profileImage',
          success: false,
          error: error.message,
        });
      }
    }

    if (user.coverImage) {
      try {
        await deleteFileFromCloudinary(user.coverImage);
        deletionResults.push({ type: 'coverImage', success: true });
      } catch (error) {
        deletionResults.push({
          type: 'coverImage',
          success: false,
          error: error.message,
        });
      }
    }

    // Then perform hard delete regardless of soft-delete status
    await user.destroy({ force: true });

    return successResponse(res, {
      statusCode: 200,
      message: user.deletedAt
        ? 'User was permanently deleted along with any previously soft-deleted records'
        : 'User deleted successfully',
      payload: { deletions: deletionResults },
    });
  } catch (error) {
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// 🟠 USER MODERATION
const handleBanUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Ensure the user exists first
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError(404, 'User not found');
    }

    // Update the user’s status to banned
    const [rowsUpdated, [updatedUser]] = await User.update(
      { isBanned: true },
      {
        where: { id: userId },
        returning: true, // Ensures we get the updated user back
      }
    );

    // If no rows were updated, send an error response
    if (rowsUpdated === 0) {
      throw createError(400, 'User was not banned successfully');
    }

    // Return success response without sensitive data
    return successResponse(res, {
      statusCode: 200,
      message: 'User was banned successfully',
      payload: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isBanned: updatedUser.isBanned,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

//! Unban a user by ID
const handleUnbanUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Ensure the user exists first
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError(404, 'User not found');
    }

    // Update the user’s status to unbanned
    const [rowsUpdated, [updatedUser]] = await User.update(
      { isBanned: false },
      {
        where: { id: userId },
        returning: true, // Ensures we get the updated user back
      }
    );

    // If no rows were updated, send an error response
    if (rowsUpdated === 0) {
      throw createError(400, 'User was not unbanned successfully');
    }

    // Return success response without sensitive data
    return successResponse(res, {
      statusCode: 200,
      message: 'User was unbanned successfully',
      payload: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isBanned: updatedUser.isBanned,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleProcessRegister,
  handleActivateUser,
  handleFetchUserProfile,
  handleGetPublicProfile,
  handleUpdatePrivateProfile,
  handleUpdateCoverImage,
  handleUpdatePublicProfile,
  handleUpdatePrivacySettings,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
  handleFollowUser,
  handleUnfollowUser,
  handleGetFollowers,
  handleGetFollowing,

  // Admin functions
  handleGetUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleUpdatePhone,
  verifyPhoneOTP,
  handleDeleteUserById,
  handleBanUserById,
  handleUnbanUserById,
};