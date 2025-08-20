const router = require('express').Router();
const Calorie = require('../models/calorie.model');

function toUTCDateOnly(d) {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
}

// List calories for a user within a date range. If no range, return recent 60 days
router.get('/', async (req, res) => {
  try {
    const { userEmail, from, to } = req.query;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });

    const query = { userEmail };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = toUTCDateOnly(from);
      if (to) query.date.$lte = toUTCDateOnly(to);
    }

    const docs = await Calorie.find(query).sort({ date: 1 }).exec();
    res.json(docs);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching calories', error: String(err) });
  }
});

// Upsert a calorie entry for a specific day
router.post('/set', async (req, res) => {
  try {
    const { userEmail, date, calories } = req.body;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    if (!date) return res.status(400).json({ message: 'date is required' });
    if (typeof calories !== 'number' || calories < 0) return res.status(400).json({ message: 'calories must be a non-negative number' });

    const day = toUTCDateOnly(date);

    const updated = await Calorie.findOneAndUpdate(
      { userEmail, date: day },
      { $set: { calories } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    res.status(200).json({ message: 'Saved', entry: updated });
  } catch (err) {
    res.status(400).json({ message: 'Error saving calories', error: String(err) });
  }
});

// Get weekly and monthly averages ending at provided date (inclusive)
router.get('/averages', async (req, res) => {
  try {
    const { userEmail, date } = req.query;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    const end = toUTCDateOnly(date || new Date());

    const startWeek = new Date(end);
    startWeek.setUTCDate(end.getUTCDate() - 6); // last 7 days inclusive

    const startMonth = new Date(end);
    startMonth.setUTCDate(end.getUTCDate() - 29); // last 30 days inclusive

    const [weekDocs, monthDocs] = await Promise.all([
      Calorie.find({ userEmail, date: { $gte: startWeek, $lte: end } }).exec(),
      Calorie.find({ userEmail, date: { $gte: startMonth, $lte: end } }).exec(),
    ]);

    function avg(arr) {
      if (!arr.length) return 0;
      return Math.round(arr.reduce((s, d) => s + (d.calories || 0), 0) / arr.length);
    }

    res.json({
      weeklyAverage: avg(weekDocs),
      monthlyAverage: avg(monthDocs),
    });
  } catch (err) {
    res.status(400).json({ message: 'Error computing averages', error: String(err) });
  }
});

module.exports = router;
