const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }] // Array of user IDs who liked this reply
});

const forumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    default: 'General'
  },
  tags: [{ type: String }],
  replies: [replySchema],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }], // Array of user IDs who liked this post
  isAnswered: { type: Boolean, default: false },
  bestAnswer: { type: mongoose.Schema.Types.ObjectId }, // Reference to reply ID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Forum', forumSchema);