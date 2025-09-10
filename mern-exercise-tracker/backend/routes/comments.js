const router = require('express').Router();
const Comment = require('../models/comment.model');

// Get all comments for a specific post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    console.log('Fetching comments for post:', postId);
    
    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 }); // Sort oldest to newest for chronological order
    
    console.log('Found comments:', comments.length);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(400).json({ error: 'Error fetching comments: ' + err.message });
  }
});

// Add a new comment to a post
router.post('/add', async (req, res) => {
  try {
    const { content, author, postId, userId } = req.body;
    
    console.log('Adding comment:', { content, author, postId, userId });
    
    // Validate required fields
    if (!content || !author || !postId) {
      return res.status(400).json({ error: 'Content, author, and postId are required' });
    }
    
    // Validate content length
    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ error: 'Comment must be 500 characters or less' });
    }
    
    const commentData = {
      content: content.trim(),
      author: author.trim(),
      postId,
      userId: userId || null
    };
    
    const newComment = new Comment(commentData);
    await newComment.save();
    
    console.log('Comment saved successfully');
    res.json({ message: 'Comment added successfully!', comment: newComment });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(400).json({ error: 'Error adding comment: ' + err.message });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { author } = req.body;
    
    console.log('Deleting comment:', id, 'by author:', author);
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check if the user is the author of the comment
    if (comment.author !== author) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }
    
    await Comment.findByIdAndDelete(id);
    console.log('Comment deleted successfully');
    res.json({ message: 'Comment deleted successfully!' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(400).json({ error: 'Error deleting comment: ' + err.message });
  }
});

// Like/unlike a comment
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const hasLiked = comment.likedBy.includes(userId);
    
    if (hasLiked) {
      comment.likedBy = comment.likedBy.filter(id => id !== userId);
      comment.likes -= 1;
    } else {
      comment.likedBy.push(userId);
      comment.likes += 1;
    }
    
    await comment.save();
    res.json({ likes: comment.likes, hasLiked: !hasLiked });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(400).json({ error: 'Error toggling like: ' + err.message });
  }
});

module.exports = router;
