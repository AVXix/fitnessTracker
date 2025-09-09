import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default class Navbar extends Component {
  static contextType = AuthContext;

  render() {
    const { isAuthenticated, signOut, loginToast } = this.context || {};

    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <div className="container">
          <Link to="/" className="navbar-brand">ExerciseTracker</Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            {isAuthenticated ? (
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <Link to="/workouts" className="nav-link">Workouts</Link>
                  </li>
                  
                  <li className="nav-item">
                    <Link to="/goals" className="nav-link">Set Goal</Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/calories" className="nav-link">Calorie tracker</Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/analytics" className="nav-link">Analytics</Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/forum" className="nav-link">Forum</Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/store" className="nav-link">Store</Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/trainer" className="nav-link">Trainer</Link>
                  </li>
                </ul>
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link">Profile</Link>
                  </li>
                  <li className="nav-item d-flex align-items-center ms-lg-2">
                    <button onClick={signOut} className="btn btn-outline-light btn-sm">Logout</button>
                  </li>
                </ul>
              </>
            ) : (
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link to="/signin" className="nav-link">Sign In</Link>
                </li>
                <li className="nav-item">
                  <Link to="/signup" className="nav-link">Sign Up</Link>
                </li>
              </ul>
            )}
          </div>
        </div>

        {isAuthenticated && loginToast && (
          <div style={{ position: 'fixed', right: 16, bottom: 16, background: '#222', color: '#fff', padding: '12px 16px', borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <div><strong>Goal:</strong> {loginToast.goalName}</div>
            <div><strong>Target date:</strong> {loginToast.targetDate ? new Date(loginToast.targetDate).toLocaleDateString() : 'N/A'}</div>
          </div>
        )}
      </nav>
    );
  }
}