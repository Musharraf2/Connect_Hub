const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() {
      return this.isGroup;
    }
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: Number, // User IDs from Spring Boot backend
    required: true
  }],
  community: {
    type: String, // profession/community type
    required: true
  },
  createdBy: {
    type: Number,
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ community: 1 });
chatRoomSchema.index({ isGroup: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
