const router = require('express').Router();
const Forum = require('../models/forum.model');

// Test route to verify forum endpoint is working
router.get('/test', (req, res) => {
  res.json({ message: 'Forum route is working!' });
});

// Get all forum posts
router.get('/', async (req, res) => {
  try {
    console.log('Forum GET request received'); // Debug log
    const { category } = req.query;
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    const posts = await Forum.find(query).sort({ createdAt: -1 });
    console.log('Found posts:', posts.length); // Debug log
    res.json(posts);
  } catch (err) {
    console.error('Forum GET error:', err); // Debug log
    res.status(400).json({ error: 'Error fetching posts: ' + err.message });
  }
});

// Create new forum post
router.post('/add', async (req, res) => {
  try {
    console.log('Forum POST request received:', req.body); // Debug log
    
    const { title, content, author, category } = req.body;
    
    // Validate required fields
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'Title, content, and author are required' });
    }
    
    const postData = {
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      category: category || 'General'
    };
    
    const newPost = new Forum(postData);
    await newPost.save();
    console.log('Forum post saved successfully'); // Debug log
    res.json({ message: 'Forum post created successfully!', post: newPost });
  } catch (err) {
    console.error('Forum POST error:', err); // Debug log
    res.status(400).json({ error: 'Error creating post: ' + err.message });
  }
});

// Delete a forum post
router.delete('/:id', async (req, res) => {
  try {
    console.log('Forum DELETE request received:', req.params.id); // Debug log
    
    const { id } = req.params;
    const { author } = req.body; // We'll send the current user to verify ownership
    
    const post = await Forum.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if the user is the author of the post
    if (post.author !== author) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }
    
    await Forum.findByIdAndDelete(id);
    console.log('Forum post deleted successfully'); // Debug log
    res.json({ message: 'Post deleted successfully!' });
  } catch (err) {
    console.error('Forum DELETE error:', err); // Debug log
    res.status(400).json({ error: 'Error deleting post: ' + err.message });
  }
});

module.exports = router;