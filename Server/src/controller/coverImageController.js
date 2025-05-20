// // controllers/coverImageController.js
// const createError = require('http-errors');
// const User = require('../models/userModel');
// const cloudinary = require('../config/cloudinary');
// const { deleteFileFromCloudinary } = require('../helper/cloudinaryHelper');
// const fs = require('fs').promises;
// const { successResponse, errorResponse } = require('./responseController');
// const path = require('path');

// const handleUpdateCoverImage = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       throw createError(400, 'No cover image file provided');
//     }

//     const userId = req.user.id;
//     const user = await User.findByPk(userId);
//     if (!user) {
//       // Clean up the uploaded file if user not found
//       await fs.unlink(req.file.path).catch(console.error);
//       throw createError(404, 'User not found');
//     }

//     // Delete old cover image from Cloudinary if exists
//     if (user.coverImage) {
//       try {
//         await deleteFileFromCloudinary(user.coverImage);
//       } catch (error) {
//         console.error('Error deleting old cover image:', error.message);
//       }
//     }

//     // Upload new cover image to Cloudinary
//     let coverImageUrl;
//     try {
//       const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//         folder: 'social-network/users/cover-images',
//         transformation: [
//           { width: 1500, height: 500, crop: 'fill', quality: 'auto' }
//         ]
//       });
//       coverImageUrl = uploadResult.secure_url;
//     } catch (uploadError) {
//       await fs.unlink(req.file.path).catch(console.error);
//       throw createError(500, 'Failed to upload cover image to cloud storage');
//     }

//     // Clean up the temporary file
//     await fs.unlink(req.file.path).catch(console.error);

//     // Update user with new cover image
//     user.coverImage = coverImageUrl;
//     await user.save();

//     return successResponse(res, {
//       statusCode: 200,
//       message: 'Cover image updated successfully',
//       payload: { coverImage: coverImageUrl }
//     });
//   } catch (error) {
//     // Clean up the temporary file if error occurs
//     if (req.file?.path) {
//       await fs.unlink(req.file.path).catch(console.error);
//     }
//     next(error);
//   }
// };

// const handleDeleteCoverImage = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findByPk(userId);
//     if (!user) throw createError(404, 'User not found');

//     if (!user.coverImage) {
//       return successResponse(res, {
//         statusCode: 200,
//         message: 'No cover image to delete'
//       });
//     }

//     // Delete from Cloudinary
//     await deleteFileFromCloudinary(user.coverImage);

//     // Update user record
//     user.coverImage = null;
//     await user.save();

//     return successResponse(res, {
//       statusCode: 200,
//       message: 'Cover image deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   handleUpdateCoverImage,
//   handleDeleteCoverImage
// };