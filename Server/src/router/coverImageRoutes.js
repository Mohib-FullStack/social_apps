// // routes/coverImageRoutes.js
// const express = require('express');
// const { isLoggedIn } = require('../middleware/authMiddleware');
// const uploadCoverImage = require('../middleware/uploadCoverImage');
// const { handleUpdateCoverImage, handleDeleteCoverImage } = require('../controller/coverImageController');

// const coverImageRouter = express.Router();

// // Update cover image
// coverImageRouter.patch(
//   '/',
//   isLoggedIn,
//   uploadCoverImage,
//   handleUpdateCoverImage
// );

// // Delete cover image
// coverImageRouter.delete(
//   '/',
//   isLoggedIn,
//   handleDeleteCoverImage
// );

// module.exports = coverImageRouter;