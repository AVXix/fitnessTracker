const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String },
});

const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true, trim: true },
  items: { type: [OrderItemSchema], validate: v => Array.isArray(v) && v.length > 0 },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
}, { timestamps: true });

OrderSchema.index({ userEmail: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
