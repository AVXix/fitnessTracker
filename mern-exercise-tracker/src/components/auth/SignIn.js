import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: replace with real auth API
    signIn(email);
    navigate('/');
  };

  return (
    <div className="container mt-3">
      <h3>Sign In</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <div className="form-group mb-3">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Sign In</button>
        <span className="ms-3">No account? <Link to="/signup">Sign Up</Link></span>
      </form>
    </div>
  );
}
