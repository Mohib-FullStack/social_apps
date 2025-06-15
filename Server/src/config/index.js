//  config/index.js
const UPLOAD_USER_IMG_DIRECTORY = 'public/images/users';

const MAX_FILE_SIZE = 10 * 1024 * 1024 ;


// Include additional MIME types for images
const ALLOWED_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/apng',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'image/webp',
];

module.exports = {
  UPLOAD_USER_IMG_DIRECTORY,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
};