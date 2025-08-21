const router = require('express').Router();
const Profile = require('../models/profile.model');
const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// upload avatar image to GridFS
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const db = req.app.get('mongoose').connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'avatars' });
    const uploadStream = bucket.openUploadStream(req.file.originalname, { contentType: req.file.mimetype });
    uploadStream.end(req.file.buffer);
    uploadStream.on('finish', (file) => {
      const url = `/profile/avatar/${file._id}`;
      res.json({ fileId: file._id, url });
    });
    uploadStream.on('error', (err) => {
      res.status(500).json({ message: 'Upload failed', error: String(err) });
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: String(err) });
  }
});

// serve avatar by GridFS id
router.get('/avatar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.get('mongoose').connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'avatars' });
    const _id = new ObjectId(id);
    const cursor = bucket.find({ _id });
    const files = await cursor.toArray();
    if (!files || files.length === 0) return res.status(404).send('Not found');
    res.set('Content-Type', files[0].contentType || 'application/octet-stream');
    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching avatar', error: String(err) });
  }
});

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
  const { userEmail, name, sex, age, heightCm, weightKg, medicalIssue, medicalIssueDescription, isTrainer, trainerDescription, trainerContactPhone, trainerContactEmail, socialLinks, avatarUrl, avatarFileId } = req.body;
    if (!userEmail) return res.status(400).json({ message: 'userEmail is required' });

  const update = { name, sex, age, heightCm, weightKg, medicalIssue, medicalIssueDescription, isTrainer, trainerDescription, trainerContactPhone, trainerContactEmail, socialLinks, avatarUrl, avatarFileId };

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

// Get list of trainers
router.get('/trainers', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { isTrainer: true };
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [ { name: re }, { trainerDescription: re }, { 'socialLinks.url': re } ];
    }
    const docs = await Profile.find(filter).select('-__v').lean().exec();
    res.json(docs || []);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching trainers', error: String(err) });
  }
});
