// controller/chatController.js
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const { successResponse, errorResponse } = require('./responseController');

const getChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [{
        model: User,
        as: 'participants',
        where: { id: req.user.id },
        attributes: [],
        through: { attributes: [] }
      }, {
        model: User,
        as: 'participants',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }, {
        model: Message,
        as: 'messages',
        limit: 1,
        order: [['createdAt', 'DESC']]
      }],
      order: [['lastMessageAt', 'DESC']]
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Chats retrieved successfully',
      payload: chats
    });
  } catch (error) {
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to retrieve chats'
    });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'participants',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }]
    });

    if (!chat) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Chat not found'
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Chat retrieved successfully',
      payload: chat
    });
  } catch (error) {
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to retrieve chat'
    });
  }
};

const createChat = async (req, res) => {
  try {
    const { participantIds } = req.body;
    
    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      include: [{
        model: User,
        as: 'participants',
        where: { id: participantIds },
        attributes: [],
        through: { attributes: [] }
      }],
      group: ['Chat.id'],
      having: sequelize.literal('COUNT(DISTINCT participants.id) = ' + participantIds.length)
    });

    if (existingChat) {
      return successResponse(res, {
        statusCode: 200,
        message: 'Chat already exists',
        payload: existingChat
      });
    }

    // Create new chat
    const chat = await Chat.create();
    await chat.addParticipants([...participantIds, req.user.id]);

    return successResponse(res, {
      statusCode: 201,
      message: 'Chat created successfully',
      payload: chat
    });
  } catch (error) {
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to create chat'
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await Message.findAll({
      where: { chatId: req.params.id },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Messages retrieved successfully',
      payload: messages.reverse() // Return oldest first
    });
  } catch (error) {
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to retrieve messages'
    });
  }
};

module.exports = {
  getChats,
  getChatById,
  createChat,
  getMessages
};