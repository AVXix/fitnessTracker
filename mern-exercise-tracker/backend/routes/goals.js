const router = require('express').Router();
let Goal = require('../models/goal.model');

// Get all goals for a user: /goals?userEmail=...
router.route('/').get(async (req, res) => {
  try {
    const { userEmail } = req.query;
    const query = userEmail ? { userEmail } : {};
    const goals = await Goal.find(query).sort({ createdAt: -1 }).exec();
    res.json(goals);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get latest goal for a user: /goals/latest?userEmail=...
router.route('/latest').get(async (req, res) => {
  try {
    const { userEmail } = req.query;
    const query = userEmail ? { userEmail } : {};
    const latest = await Goal.findOne(query).sort({ createdAt: -1 }).exec();
    res.json(latest || null);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add a goal (returns created goal)
router.route('/add').post(async (req, res) => {
  try {
    const { userEmail, goalName, description, targetDate } = req.body;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    if (!goalName) return res.status(400).json({ message: 'Goal name is required' });

    const goal = new Goal({
      userEmail,
      goalName,
      description: description || '',
      targetDate: targetDate ? new Date(targetDate) : null,
    });

    const saved = await goal.save();
    return res.status(201).json({ message: 'Goal added!', goal: saved });
  } catch (err) {
    return res.status(400).json({ message: 'Error adding goal', error: String(err) });
  }
});

// Delete a goal by id
router.route('/:id').delete(async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Goal.findByIdAndDelete(id).exec();
    if (!deleted) return res.status(404).json({ message: 'Goal not found' });
    return res.json({ message: 'Goal deleted', id });
  } catch (err) {
    return res.status(400).json({ message: 'Error deleting goal', error: String(err) });
  }
});

module.exports = router;
