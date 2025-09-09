const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  description: { type: String },
  tags: [{ type: String }],
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);