// server/src/helper/cloudinaryHelper.js
/**************************************
 *            CLOUDINARY HELPERS      *
 **************************************/
const cloudinary = require('cloudinary').v2;

/**
 * Extracts public ID from Cloudinary URL including folder structure
 * @param {string} url - Cloudinary image URL
 * @returns {string} - Public ID without extension
 * @throws {Error} - If URL is invalid or not from Cloudinary
 */
// helper/cloudinaryHelper.js
const extractPublicIdFromUrl = (url) => {
  if (!url) throw new Error('URL is required');
  
  try {
    // Handle different Cloudinary URL formats
    const cloudinaryUrlPattern = /res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/(?:v\d+\/)?(.+)/;
    const match = url.match(cloudinaryUrlPattern);
    
    if (!match) {
      throw new Error('Invalid Cloudinary URL format');
    }

    let publicId = match[2];
    
    // Remove file extension if present
    if (publicId.includes('.')) {
      publicId = publicId.split('.')[0];
    }
    
    return publicId;
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    throw error;
  }
};

const deleteFileFromCloudinary = async (url) => {
  if (!url) {
    console.warn('No URL provided for deletion');
    return false;
  }

  try {
    const publicId = extractPublicIdFromUrl(url);
    console.log(`Attempting to delete Cloudinary file with public ID: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true
    });

    if (result.result !== 'ok') {
      console.error('Cloudinary deletion failed:', result);
      return false;
    }

    console.log(`Successfully deleted from Cloudinary: ${publicId}`);
    return true;
  } catch (error) {
    console.error('Error in deleteFileFromCloudinary:', error.message);
    // Don't throw error - allow the update to continue
    return false;
  }
};

/**
 * Alternative method to get public ID without extension (legacy support)
 * @param {string} url - Cloudinary image URL
 * @returns {string} - Public ID with folder structure
 * @deprecated Use extractPublicIdFromUrl instead
 */
const publicIdWithoutExtensionFromUrl = (url) => {
  console.warn('Deprecated: Use extractPublicIdFromUrl instead');
  return extractPublicIdFromUrl(url);
};

module.exports = {
  deleteFileFromCloudinary,
  extractPublicIdFromUrl,
  publicIdWithoutExtensionFromUrl // Maintained for backward compatibility
};
