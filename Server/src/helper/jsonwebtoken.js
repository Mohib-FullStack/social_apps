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

