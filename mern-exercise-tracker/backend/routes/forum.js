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

// Like/unlike a forum post
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    console.log('Forum LIKE request received:', { id, userId });
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const post = await Forum.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const hasLiked = post.likedBy.includes(userId);
    
    if (hasLiked) {
      // Unlike the post
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like the post
      post.likedBy.push(userId);
      post.likes = (post.likes || 0) + 1;
    }
    
    await post.save();
    console.log('Post like toggled successfully');
    res.json({ likes: post.likes, hasLiked: !hasLiked });
  } catch (err) {
    console.error('Forum LIKE error:', err);
    res.status(400).json({ error: 'Error toggling like: ' + err.message });
  }
});

module.exports = router;