const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profileSchema = new Schema({
  userEmail: { type: String, required: true, unique: true, index: true, trim: true },
  name: { type: String, default: '' },
  sex: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  age: { type: Number, min: 0, max: 120, default: null },
  heightCm: { type: Number, min: 0, max: 300, default: null },
  weightKg: { type: Number, min: 0, max: 500, default: null },
  medicalIssue: { type: Boolean, default: false },
  medicalIssueDescription: { type: String, default: '' },
  isTrainer: { type: Boolean, default: false },
  trainerDescription: { type: String, default: '' },
  trainerContactPhone: { type: String, default: '' },
  trainerContactEmail: { type: String, default: '' },
  socialLinks: {
    type: [
      {
        platform: { type: String, default: '' },
        url: { type: String, default: '' },
      }
    ],
    default: []
  },
  avatarUrl: { type: String, default: '' },
  avatarFileId: { type: Schema.Types.ObjectId, default: null },
  // trainer ratings / reviews
  reviews: {
    type: [
      {
        userEmail: { type: String, required: true, trim: true },
        rating: { type: Number, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
