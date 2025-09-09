import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Forum.css';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState(null);
  const [testMessage, setTestMessage] = useState('');
  const { user } = useAuth();

  const categories = ['All', 'Nutrition', 'Workout', 'Supplements', 'Weight Loss', 'Muscle Gain', 'General'];

  useEffect(() => {
    testConnection();
    fetchPosts();
  }, [selectedCategory]);

  // Test if backend is accessible
  const testConnection = async () => {
    try {
      const response = await fetch('/forum/test');
      if (response.ok) {
        const data = await response.json();
        setTestMessage(data.message);
        console.log('Backend test successful:', data.message);
      } else {
        setTestMessage('Backend test failed: ' + response.status);
      }
    } catch (error) {
      setTestMessage('Backend connection failed: ' + error.message);
      console.error('Backend test error:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setError(null);
      console.log('Fetching posts...'); // Debug log
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);

      const response = await fetch(`/forum?${params}`);
      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched posts:', data); // Debug log
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load forum posts: ' + error.message);
      setLoading(false);
    }
  };

  const deletePost = async (postId, postAuthor) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      console.log('Deleting post:', postId, 'by author:', postAuthor); // Debug log
      
      const response = await fetch(`/forum/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author: postAuthor }),
      });

      console.log('Delete response status:', response.status); // Debug log
      
      // Get response text first to check what we're getting
      const responseText = await response.text();
      console.log('Delete response text:', responseText); // Debug log

      if (response.ok) {
        // Try to parse as JSON, if it fails, just use the text
        let result;
        try {
          result = JSON.parse(responseText);
          console.log('Delete success:', result); // Debug log
          alert(result.message || 'Post deleted successfully!');
        } catch (parseError) {
          console.log('Response is not JSON, using text:', responseText);
          alert('Post deleted successfully!');
        }
        fetchPosts(); // Refresh the posts list
      } else {
        // Try to parse error as JSON
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} - ${responseText}`);
        }
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post: ' + error.message);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffTime = Math.abs(now - postDate);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  // Get username from user object
  const getUserName = () => {
    if (!user) return 'Anonymous User';
    if (typeof user === 'string') return user;
    if (user.email) return user.email;
    if (user.username) return user.username;
    if (user.name) return user.name;
    return 'Anonymous User';
  };

  // Check if current user can delete a post
  const canDeletePost = (postAuthor) => {
    const currentUser = getUserName();
    return currentUser === postAuthor;
  };

  if (loading) return <div className="forum-loading">Loading forum...</div>;

  return (
    <div className="forum-container">
      <h1>Forum</h1>
      
      {testMessage && (
        <div className="test-message">
          <small>Backend Status: {testMessage}</small>
        </div>
      )}

      {error && <div className="forum-error">{error}</div>}

      <div className="forum-controls">
        <div className="forum-filters">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button 
          className="ask-question-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '❓ Ask Question'}
        </button>
      </div>

      {showCreateForm && (
        <SimpleQuestionForm 
          onPostCreated={fetchPosts} 
          onCancel={() => setShowCreateForm(false)} 
          userName={getUserName()}
        />
      )}

      <div className="questions-list">
        {posts.length === 0 ? (
          <div className="no-questions">
            <h3>No questions yet</h3>
            <p>Be the first to ask a question!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="question-card">
              <div className="question-header">
                <span className={`category-tag ${post.category.toLowerCase().replace(' ', '-')}`}>
                  {post.category}
                </span>
                <div className="question-header-right">
                  <span className="question-time">{getTimeAgo(post.createdAt)}</span>
                  {canDeletePost(post.author) && (
                    <button 
                      className="delete-btn"
                      onClick={() => deletePost(post._id, post.author)}
                      title="Delete this post"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="question-title">{post.title}</h3>
              <p className="question-content">{post.content}</p>

              <div className="question-footer">
                <div className="question-author">
                  <strong>Asked by {post.author}</strong>
                </div>
                
                <div className="question-stats">
                  <span className="stat">👁️ {post.views || 0}</span>
                  <span className="stat">❤️ {post.likes || 0}</span>
                  <span className="stat">💬 {post.replies ? post.replies.length : 0}</span>
                  {post.isAnswered && <span className="answered">✅ Solved</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SimpleQuestionForm = ({ onPostCreated, onCancel, userName }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['Nutrition', 'Workout', 'Supplements', 'Weight Loss', 'Muscle Gain', 'General'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.title.trim() || !formData.content.trim()) {
        throw new Error('Please fill in all required fields');
      }
      
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: userName,
        category: formData.category
      };

      console.log('Submitting post data:', postData); // Debug log

      const response = await fetch('/forum/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result); // Debug log
        alert('Question posted successfully!');
        setFormData({ title: '', content: '', category: 'General' });
        onPostCreated();
        onCancel();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to post question: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="question-form">
      <h3>Ask Your Question</h3>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="What's your question? (e.g., How to lose belly fat?)"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
          className="question-input"
          disabled={submitting}
          maxLength={200}
        />

        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
          className="category-select"
          disabled={submitting}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <textarea
          placeholder="Describe your problem or question in detail..."
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          rows="4"
          required
          className="question-textarea"
          disabled={submitting}
          maxLength={1000}
        />

        <div className="form-info">
          <small>
            Posting as: <strong>{userName}</strong>
            <br />
            Characters: {formData.content.length}/1000
          </small>
        </div>

        <div className="form-buttons">
          <button type="submit" className="post-btn" disabled={submitting || !formData.title.trim() || !formData.content.trim()}>
            {submitting ? 'Posting...' : 'Post Question'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn" disabled={submitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Forum;