const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  userEmail: { type: String, required: true, index: true, trim: true },
  username: { type: String, required: true }, // workout name
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
}, {
  timestamps: true,
});

// Helpful index for per-user workout filtering
exerciseSchema.index({ userEmail: 1, username: 1, date: -1 });

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;