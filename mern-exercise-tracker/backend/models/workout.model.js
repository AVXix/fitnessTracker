const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Workout documents are user-scoped. `username` is the workout name (legacy field name).
const workoutSchema = new Schema({
  userEmail: { type: String, required: true, index: true, trim: true },
  username: { type: String, required: true, trim: true }, // workout name
}, {
  timestamps: true,
});

// Ensure per-user unique workout names
workoutSchema.index({ userEmail: 1, username: 1 }, { unique: true });

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;