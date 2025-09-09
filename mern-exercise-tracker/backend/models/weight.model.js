const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Store a user's weight per day. The `date` is normalized to UTC start-of-day.
const weightSchema = new Schema({
  userEmail: { type: String, required: true, index: true, trim: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true, min: 0 }, // Weight in kg
  unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
  notes: { type: String, default: '' }, // Optional notes about the weight entry
}, {
  timestamps: true,
});

weightSchema.index({ userEmail: 1, date: 1 }, { unique: true });

const Weight = mongoose.model('Weight', weightSchema);

module.exports = Weight;