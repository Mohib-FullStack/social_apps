const { Op } = require('sequelize');
const User = require('../models/userModel');

/**
 * Checks if a user exists based on provided criteria
 * @param {Object} criteria - Search criteria (can include id, email, phone, username)
 * @param {number} [excludeId] - Optional user ID to exclude from search
 * @returns {Promise<{exists: boolean, user: User|null}>} - Returns existence status and user if found
 */
const checkUserExist = async (criteria, excludeId = null) => {
  try {
    if (!criteria || typeof criteria !== 'object' || Object.keys(criteria).length === 0) {
      throw new Error('Invalid search criteria provided');
    }

    const allowedFields = ['id', 'email', 'phone'];
    const invalidFields = Object.keys(criteria).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      throw new Error(`Invalid field(s) provided: ${invalidFields.join(', ')}`);
    }

    const where = { ...criteria };
    if (excludeId) where.id = { [Op.ne]: excludeId };

    const user = await User.findOne({ where });
    return {
      exists: !!user,
      user
    };
  } catch (error) {
    console.error(`Error checking user existence: ${error.message}`);
    throw error;
  }
};

module.exports = {checkUserExist};









