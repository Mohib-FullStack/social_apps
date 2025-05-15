const express = require('express');
const { sendMessage, getConversation, getMessageById, updateMessage, deleteMessage } = require('../controller/messageController');
const messageRouter = express.Router();


messageRouter.post('/',sendMessage);
messageRouter.get('/conversation/:user1Id/:user2Id',getConversation);
messageRouter.get('/:id',getMessageById);
messageRouter.put('/:id',updateMessage);
messageRouter.delete('/:id',deleteMessage);

module.exports = messageRouter;
