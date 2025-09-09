const router = require('express').Router();
const Weight = require('../models/weight.model');

function toUTCDateOnly(d) {
  const date = new Date(d);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

// List weights for a user within a date range. If no range, return recent 60 days
router.get('/', async (req, res) => {
  try {
    const { userEmail, from, to } = req.query;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });

    const query = { userEmail };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = toUTCDateOnly(from);
      if (to) query.date.$lte = toUTCDateOnly(to);
    } else {
      // Default to last 60 days
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      query.date = { $gte: toUTCDateOnly(sixtyDaysAgo) };
    }

    const docs = await Weight.find(query).sort({ date: 1 }).exec();
    res.json(docs);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching weights', error: String(err) });
  }
});

// Upsert a weight entry for a specific day
router.post('/set', async (req, res) => {
  try {
    const { userEmail, date, weight, unit, notes } = req.body;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });
    if (!date) return res.status(400).json({ message: 'date is required' });
    if (typeof weight !== 'number' || weight <= 0) return res.status(400).json({ message: 'weight must be a positive number' });

    const day = toUTCDateOnly(date);

    const updated = await Weight.findOneAndUpdate(
      { userEmail, date: day },
      { $set: { weight, unit: unit || 'kg', notes: notes || '' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    res.status(200).json({ message: 'Saved', entry: updated });
  } catch (err) {
    res.status(400).json({ message: 'Error saving weight', error: String(err) });
  }
});

// Delete a weight entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Weight.findByIdAndDelete(id).exec();
    if (!deleted) return res.status(404).json({ message: 'Weight entry not found' });
    res.json({ message: 'Weight entry deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting weight', error: String(err) });
  }
});

// Get weight averages and trends
router.get('/averages', async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weekDocs, monthDocs, latest] = await Promise.all([
      Weight.find({ userEmail, date: { $gte: toUTCDateOnly(weekAgo) } }).exec(),
      Weight.find({ userEmail, date: { $gte: toUTCDateOnly(monthAgo) } }).exec(),
      Weight.findOne({ userEmail }).sort({ date: -1 }).exec()
    ]);

    const avg = (docs) => docs.length === 0 ? null : (docs.reduce((s, d) => s + d.weight, 0) / docs.length);

    // Calculate weight change from first to last entry
    const getWeightChange = (docs) => {
      if (docs.length < 2) return null;
      const sorted = docs.sort((a, b) => new Date(a.date) - new Date(b.date));
      return sorted[sorted.length - 1].weight - sorted[0].weight;
    };

    res.json({
      latestWeight: latest?.weight || null,
      latestDate: latest?.date || null,
      latestUnit: latest?.unit || 'kg',
      weeklyAverage: avg(weekDocs),
      monthlyAverage: avg(monthDocs),
      weeklyChange: getWeightChange(weekDocs),
      monthlyChange: getWeightChange(monthDocs),
      totalEntries: monthDocs.length
    });
  } catch (err) {
    res.status(400).json({ message: 'Error computing averages', error: String(err) });
  }
});

module.exports = router;