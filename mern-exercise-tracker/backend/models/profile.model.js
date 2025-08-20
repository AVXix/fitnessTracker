const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profileSchema = new Schema({
  userEmail: { type: String, required: true, unique: true, index: true, trim: true },
  name: { type: String, default: '' },
  sex: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  age: { type: Number, min: 0, max: 120, default: null },
  heightCm: { type: Number, min: 0, max: 300, default: null },
  weightKg: { type: Number, min: 0, max: 500, default: null },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active', ''], default: '' },
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
