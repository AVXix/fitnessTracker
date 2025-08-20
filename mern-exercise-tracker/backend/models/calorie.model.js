const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Store a user's calorie intake per day. The `date` is normalized to UTC start-of-day.
const calorieSchema = new Schema({
  userEmail: { type: String, required: true, index: true, trim: true },
  date: { type: Date, required: true },
  calories: { type: Number, required: true, min: 0 },
}, {
  timestamps: true,
});

calorieSchema.index({ userEmail: 1, date: 1 }, { unique: true });

const Calorie = mongoose.model('Calorie', calorieSchema);

module.exports = Calorie;
