const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

// Get all chat rooms for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chatRooms = await ChatRoom.find({
      participants: parseInt(userId)
    })
    .populate('lastMessage')
    .sort({ lastMessageTime: -1 });
    
    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Get chat rooms by community
router.get('/community/:community', async (req, res) => {
  try {
    const { community } = req.params;
    const chatRooms = await ChatRoom.find({
      community,
      isGroup: true
    })
    .populate('lastMessage')
    .sort({ lastMessageTime: -1 });
    
    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching community chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch community chat rooms' });
  }
});

// Create or get 1:1 chat room
router.post('/direct', async (req, res) => {
  try {
    const { userId1, userId2, community } = req.body;
    
    // Check if chat room already exists
    let chatRoom = await ChatRoom.findOne({
      isGroup: false,
      participants: { $all: [parseInt(userId1), parseInt(userId2)] }
    });
    
    if (!chatRoom) {
      // Create new chat room
      chatRoom = new ChatRoom({
        isGroup: false,
        participants: [parseInt(userId1), parseInt(userId2)],
        community,
        createdBy: parseInt(userId1)
      });
      await chatRoom.save();
    }
    
    res.json(chatRoom);
  } catch (error) {
    console.error('Error creating/getting direct chat:', error);
    res.status(500).json({ error: 'Failed to create/get direct chat' });
  }
});

// Create group chat
router.post('/group', async (req, res) => {
  try {
    const { name, participants, community, createdBy } = req.body;
    
    const chatRoom = new ChatRoom({
      name,
      isGroup: true,
      participants: participants.map(p => parseInt(p)),
      community,
      createdBy: parseInt(createdBy)
    });
    
    await chatRoom.save();
    res.json(chatRoom);
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ error: 'Failed to create group chat' });
  }
});

// Join group chat
router.post('/:chatRoomId/join', async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId } = req.body;
    
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    if (!chatRoom.participants.includes(parseInt(userId))) {
      chatRoom.participants.push(parseInt(userId));
      await chatRoom.save();
    }
    
    res.json(chatRoom);
  } catch (error) {
    console.error('Error joining group chat:', error);
    res.status(500).json({ error: 'Failed to join group chat' });
  }
});

// Get chat room details
router.get('/:chatRoomId', async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const chatRoom = await ChatRoom.findById(chatRoomId)
      .populate('lastMessage');
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    res.json(chatRoom);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
});

module.exports = router;
