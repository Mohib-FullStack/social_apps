// helper/jsonwebtoken.js
const jwt = require('jsonwebtoken');

const createJSONWebToken = (payload, secretkey, expiresIn) => {
  if (typeof payload !== 'object' || !payload) {
    throw new Error('payload must be a non-empty object');
  }

  if (typeof secretkey != 'string' || secretkey == '') {
    throw new Error('secretkey must be a non-empty string');
  }

  try {
    const token = jwt.sign(payload, secretkey, { expiresIn });
    return token;
  } catch (error) {
    console.error('Failed to sign the JWT:', error);
    throw error;
  }
};

module.exports = { createJSONWebToken };

//! lastUpdate
// // helper/jsonwebtoken.js
// const jwt = require('jsonwebtoken');

// /**
//  * Creates a JSON Web Token.
//  * @param {Object} payload - The payload to sign into the token. Must be a non-empty object.
//  * @param {string} secretkey - The secret key to sign the token. Must be a non-empty string.
//  * @param {string} expiresIn - The duration for which the token will be valid (e.g., "10m", "1h").
//  * @returns {string} - The signed JWT.
//  * @throws Will throw an error if payload is invalid or signing fails.
//  */
// const createJSONWebToken = (payload, secretkey, expiresIn) => {
//   if (typeof payload !== 'object' || !payload) {
//     throw new Error('payload must be a non-empty object');
//   }

//   if (typeof secretkey !== 'string' || secretkey === '') {
//     throw new Error('secretkey must be a non-empty string');
//   }

//   // Optional: Validate expiresIn to ensure it is a valid duration string
//   if (typeof expiresIn !== 'string' || expiresIn.length === 0) {
//     throw new Error('expiresIn must be a non-empty string');
//   }

//   try {
//     const token = jwt.sign(payload, secretkey, { expiresIn });
//     return token;
//   } catch (error) {
//     console.error('Failed to sign the JWT:', error);
//     throw new Error('Could not sign the JWT.'); // Provide a user-friendly error
//   }
// };

// module.exports = { createJSONWebToken };