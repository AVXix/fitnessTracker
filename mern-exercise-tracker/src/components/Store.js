import React, { useEffect, useMemo, useState } from 'react';
import './Store.css'; // We'll create this CSS file
import { useAuth } from '../context/AuthContext';

const Store = () => {
  const { user } = useAuth();
  const userEmail = user?.email || '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]); // {productId, name, price, quantity, imageUrl}
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

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
    setCart(prev => {
      const idx = prev.findIndex(p => p.productId === item._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { productId: item._id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl || '' }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQty = (productId, qty) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const totalAmount = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    if (!userEmail) {
      setSubmitStatus({ type: 'error', message: 'Please sign in to place an order.' });
      return;
    }
    if (!cart.length) {
      setSubmitStatus({ type: 'error', message: 'Your cart is empty.' });
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/orders/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, items: cart, address, phone, deliveryDate, totalAmount })
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      setSubmitStatus({ type: 'success', message: 'Order placed!' });
      setCart([]);
      setAddress('');
      setPhone('');
      setDeliveryDate('');
      setShowCheckout(false);
    } catch (e) {
      setSubmitStatus({ type: 'error', message: e.message || 'Failed to place order' });
    }
  };

  if (loading) return <div className="loading">Loading store...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="store-container">
      <div className="store-header">
        <h1>Fitness Store</h1>
  <p>Premium supplements and fitness gear</p>
  <div className="cart-info">Cart: {cart.reduce((s, i) => s + i.quantity, 0)} items (${totalAmount.toFixed(2)})</div>
      </div>

      {/* Cart Panel (moved to top) */}
      <div className="cart-panel">
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <div className="text-muted">Cart is empty.</div>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map(ci => (
                <li key={ci.productId} className="cart-item">
                  <div className="ci-main">
                    <strong>{ci.name}</strong>
                    <div className="ci-price">${ci.price} x</div>
                    <input
                      type="number"
                      min={1}
                      value={ci.quantity}
                      onChange={e => updateQty(ci.productId, Number(e.target.value))}
                      className="ci-qty"
                    />
                    <div className="ci-subtotal">=${(ci.price * ci.quantity).toFixed(2)}</div>
                  </div>
                  <button className="btn-remove" onClick={() => removeFromCart(ci.productId)}>Remove</button>
                </li>
              ))}
            </ul>
            <div className="cart-total">Total: ${totalAmount.toFixed(2)}</div>
            <button className="btn-checkout" onClick={() => setShowCheckout(true)}>Buy</button>
          </>
        )}
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

      

      {/* Checkout Form */}
      {showCheckout && (
        <div className="checkout-modal">
          <div className="checkout-content">
            <h3>Checkout</h3>
            {submitStatus && (
              <div className={`alert ${submitStatus.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {submitStatus.message}
              </div>
            )}
            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Address</label>
                <textarea className="form-control" value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Delivery date</label>
                <input type="date" className="form-control" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Place Order (${totalAmount.toFixed(2)})</button>
                <button type="button" className="btn" onClick={() => setShowCheckout(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
