const router = require('express').Router();
let Exercise = require('../models/exercise.model');

// List exercises for a user (optionally filter by workout name via ?username=...)
router.route('/').get(async (req, res) => {
  const { userEmail, username } = req.query;
  const query = {};
  if (userEmail) query.userEmail = userEmail;
  if (username) query.username = username;
  const exercises = await Exercise.find(query).sort({ date: -1 }).exec();
  res.json(exercises);
});

router.route('/add').post(async (req, res) => {
  const userEmail = req.body.userEmail;
  const username = req.body.username;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = new Date(req.body.date);

  const newExercise = new Exercise({
    userEmail,
    username,
    description,
    duration,
    date,
  });

  const saved = await newExercise.save();
  res.status(201).json({ message: 'Exercise added!', exercise: saved });
});

router.route('/:id').get((req, res) => {
  Exercise.findById(req.params.id)
    .then(exercise => res.json(exercise))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Exercise.findByIdAndDelete(req.params.id)
    .then(() => res.json('Exercise deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post(async (req, res) => {
  Exercise.findById(req.params.id)
    .then(exercise => {
      exercise.userEmail = req.body.userEmail || exercise.userEmail;
      exercise.username = req.body.username;
      exercise.description = req.body.description;
      exercise.duration = Number(req.body.duration);
      exercise.date = new Date(req.body.date);

      exercise.save()
        .then((doc) => res.json({ message: 'Exercise updated!', exercise: doc }))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;