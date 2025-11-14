const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

// Get messages for a chat room
router.get('/room/:chatRoomId', async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    
    const messages = await Message.find({ chatRoom: chatRoomId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const { chatRoomId, sender, senderName, content, messageType, mediaUrl } = req.body;
    
    const message = new Message({
      chatRoom: chatRoomId,
      sender: parseInt(sender),
      senderName,
      content,
      messageType: messageType || 'text',
      mediaUrl
    });
    
    await message.save();
    
    // Update chat room's last message
    await ChatRoom.findByIdAndUpdate(chatRoomId, {
      lastMessage: message._id,
      lastMessageTime: message.createdAt
    });
    
    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.post('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if already read by this user
    const alreadyRead = message.readBy.some(r => r.userId === parseInt(userId));
    if (!alreadyRead) {
      message.readBy.push({
        userId: parseInt(userId),
        readAt: new Date()
      });
      await message.save();
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

module.exports = router;
