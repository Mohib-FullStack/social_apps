const Message = require('../models/messageModel');
const User = require('../models/userModel');

// ✅ Create
// In controller/messageController.js
const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const message = await Message.create({ senderId, receiverId, content });

    // Fetch sender info (for snackbar display)
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'firstName', 'lastName', 'profileImage']
    });

    // Attach metadata for client
    const enrichedMessage = {
      id: message.id,
      senderId,
      receiverId,
      content,
      timestamp: message.createdAt,
      senderName: `${sender.firstName} ${sender.lastName}`,
      senderAvatar: sender.profileImage,
    };

    // ✅ Emit to receiver's socket room
    req.app.get('io')?.to(receiverId.toString()).emit('private_message', enrichedMessage);

    res.status(201).json(enrichedMessage);
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