const Message = require('../models/messageModel');
const User = require('../models/userModel');

// ✅ Create
const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = await Message.create({ senderId, receiverId, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// ✅ Read all messages between two users
const getConversation = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
};

// ✅ Read single message
const getMessageById = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get message' });
  }
};

// ✅ Update
const updateMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    message.content = req.body.content || message.content;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// ✅ Delete
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = {sendMessage, getConversation,getMessageById,updateMessage, deleteMessage }