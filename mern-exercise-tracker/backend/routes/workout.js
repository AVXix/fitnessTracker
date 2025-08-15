const router = require('express').Router();
let Workout = require('../models/workout.model');

// GET all workouts
router.route('/').get((req, res) => {
  Workout.find()
    .then(workouts => res.json(workouts))
    .catch(err => res.status(400).json('Error: ' + err));
});

// ADD a workout
router.route('/add').post((req, res) => {
  const username = req.body.username; // keeping the field name for compatibility with existing form

  if (!username) {
    return res.status(400).json('Workout name is required');
  }

  const newWorkout = new Workout({ username });

  newWorkout.save()
    .then(() => res.json('Workout added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
