const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const goalSchema = new Schema({
  userEmail: { type: String, required: true, index: true, trim: true },
  goalName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  targetDate: { type: Date, default: null }, // null => N/A
}, {
  timestamps: true,
});

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
