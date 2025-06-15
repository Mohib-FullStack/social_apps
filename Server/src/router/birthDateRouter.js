// birthDateRouter.js
const express = require('express');
const { isLoggedIn } = require('../middleware/authMiddleware');
const { handleUpdateBirthDate } = require('../controller/birthDateController');



const birthDateRouter = express.Router();



birthDateRouter.put('/birthdate',
  isLoggedIn,
  // upload.fields([
  //   { name: 'documentFront', maxCount: 1 },
  //   { name: 'documentBack', maxCount: 1 }
  // ]),
  handleUpdateBirthDate
  
);
  

module.exports = birthDateRouter

