const router = require('express').Router();
const Order = require('../models/order.model');

// Create order
router.post('/add', async (req, res) => {
  try {
    const { userEmail, items, address, phone, deliveryDate, totalAmount } = req.body;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'items are required' });
    if (!address) return res.status(400).json({ message: 'address is required' });
    if (!phone) return res.status(400).json({ message: 'phone is required' });
    if (!deliveryDate) return res.status(400).json({ message: 'deliveryDate is required' });
    if (typeof totalAmount !== 'number') return res.status(400).json({ message: 'totalAmount must be a number' });

    const order = new Order({
      userEmail,
      items: items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity || 1),
        imageUrl: i.imageUrl || '',
      })),
      address,
      phone,
      deliveryDate: new Date(deliveryDate),
      totalAmount: Number(totalAmount),
    });

    const saved = await order.save();
    res.status(201).json({ message: 'Order created', order: saved });
  } catch (err) {
    res.status(400).json({ message: 'Error creating order', error: String(err) });
  }
});

// List user's orders
router.get('/', async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    const orders = await Order.find({ userEmail }).sort({ createdAt: -1 }).exec();
    res.json(orders);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching orders', error: String(err) });
  }
});

module.exports = router;
