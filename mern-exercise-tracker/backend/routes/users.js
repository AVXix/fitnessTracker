const router = require('express').Router();
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;
  
  // For simple user creation without password, use a default password
  const newUser = new User({
    username, 
    password: 'defaultpass123' // Default password for simple users
  });

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// SIGNUP
router.route('/signup').post(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json('Username and password required');
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json('Username already exists');
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.json('User signed up!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// LOGIN
router.route('/login').post(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json('Username and password required');
  }
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).json('Invalid credentials');
    }
    res.json('Login successful');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});


module.exports = router;