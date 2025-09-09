import React, { useEffect, useState } from 'react';
import './Store.css'; // We'll create this CSS file

const Store = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/store')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching store items:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Get unique categories
  const categories = ['All', ...new Set(items.map(item => item.category))];

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item) => {
    // Add to cart functionality (you can implement this later)
    console.log('Added to cart:', item.name);
    alert(`${item.name} added to cart!`);
  };

  if (loading) return <div className="loading">Loading store...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="store-container">
      <div className="store-header">
        <h1>Fitness Store</h1>
        <p>Premium supplements and fitness gear</p>
      </div>

      {/* Search and Filter */}
      <div className="store-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <label>Category: </label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredItems.length === 0 ? (
          <div className="no-products">
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item._id} className="product-card">
              <div className="product-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="placeholder-image">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              <div className="product-info">
                <div className="product-brand">{item.brand}</div>
                <h3 className="product-name">{item.name}</h3>
                <p className="product-description">{item.description}</p>
                
                <div className="product-tags">
                  {item.tags && item.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                
                <div className="product-rating">
                  <span className="stars">
                    {'★'.repeat(Math.floor(item.rating))}
                    {'☆'.repeat(5 - Math.floor(item.rating))}
                  </span>
                  <span className="rating-text">
                    {item.rating} ({item.ratingCount} reviews)
                  </span>
                </div>
                
                <div className="product-footer">
                  <div className="price">${item.price}</div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Store;
