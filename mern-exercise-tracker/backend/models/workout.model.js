const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// A simple Workout document that stores the workout name under `username`
// to remain compatible with the existing frontend which expects a `username` string.
const workoutSchema = new Schema({
  username: { type: String, required: true, trim: true, unique: true },
}, {
  timestamps: true,
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;