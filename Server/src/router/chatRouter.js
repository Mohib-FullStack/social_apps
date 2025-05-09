// router/chatRouter.js
const express = require('express');
const { isLoggedIn } = require('../middleware/authMiddleware');
const {
  getChats,
  getChatById,
  createChat,
  getMessages
} = require('../controller/chatController');

const chatRouter = express.Router();

chatRouter.get('/', isLoggedIn, getChats);
chatRouter.get('/:id', isLoggedIn, getChatById);
chatRouter.post('/', isLoggedIn, createChat);
chatRouter.get('/:id/messages', isLoggedIn, getMessages);

module.exports = chatRouter;