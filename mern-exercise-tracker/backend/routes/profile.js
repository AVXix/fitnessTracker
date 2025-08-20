const router = require('express').Router();
const Profile = require('../models/profile.model');

// Get current user's profile
router.get('/', async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    const doc = await Profile.findOne({ userEmail }).exec();
    res.json(doc || null);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching profile', error: String(err) });
  }
});

// Upsert current user's profile
router.post('/save', async (req, res) => {
  try {
    const { userEmail, name, sex, age, heightCm, weightKg, activityLevel } = req.body;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });

    const update = { name, sex, age, heightCm, weightKg, activityLevel };

    const doc = await Profile.findOneAndUpdate(
      { userEmail },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    res.json({ message: 'Profile saved', profile: doc });
  } catch (err) {
    res.status(400).json({ message: 'Error saving profile', error: String(err) });
  }
});

module.exports = router;
