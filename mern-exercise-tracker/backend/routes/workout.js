const router = require('express').Router();
let Workout = require('../models/workout.model');

// GET workouts for a user: /workout?userEmail=...
router.route('/').get(async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    const workouts = await Workout.find({ userEmail }).sort({ username: 1 }).exec();
    res.json(workouts);
  } catch (err) {
    res.status(400).json({ message: 'Error: ' + err });
  }
});

// ADD a workout for a user
router.route('/add').post(async (req, res) => {
  try {
    const { userEmail, username } = req.body; // username is workout name
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    if (!username) return res.status(400).json({ message: 'Workout name is required' });

    const newWorkout = new Workout({ userEmail, username });
    const saved = await newWorkout.save();
    res.status(201).json({ message: 'Workout added!', workout: saved });
  } catch (err) {
    // Handle duplicate per-user names
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Workout with this name already exists for this user' });
    }
    res.status(400).json({ message: 'Error: ' + err });
  }
});

module.exports = router;
