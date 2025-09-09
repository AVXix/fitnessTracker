const router = require('express').Router();
const Store = require('../models/store.model');

// Get all store items
router.get('/', async (req, res) => {
  try {
    const items = await Store.find();
    res.json(items);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add a new store item
router.post('/add', async (req, res) => {
  const newItem = new Store(req.body);
  try {
    await newItem.save();
    res.json('Store item added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;