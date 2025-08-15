import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default class Navbar extends Component {
  static contextType = AuthContext;

  render() {
    const { isAuthenticated, signOut } = this.context || {};

    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand">ExerciseTracker</Link>
        <div className="collapse navbar-collapse">
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav mr-auto">
                <li className="navbar-item">
                  <Link to="/" className="nav-link">Current workouts</Link>
                </li>

                <li className="navbar-item">
                  <Link to="/workout" className="nav-link">Create a workout</Link>
                </li>

                <li className="navbar-item">
                  <Link to="/create" className="nav-link">Workout details</Link>
                </li>
                
                <li className="navbar-item">
                  <Link to="/create" className="nav-link">Set Goal</Link>
                </li>

                <li className="navbar-item">
                  <Link to="/create" className="nav-link">Callorie tracker</Link>
                </li>

                <li className="navbar-item">
                  <Link to="/create" className="nav-link">Analytics</Link>
                </li>

                <li className="navbar-item">
                  <Link to="/create" className="nav-link">Store</Link>
                </li>

                <li className="navbar-item">
                  <Link to="/create" className="nav-link">Trainer</Link>
                </li>
              </ul>
              <ul className="navbar-nav ml-auto">
                <li className="navbar-item">
                  <button onClick={signOut} className="btn btn-outline-light btn-sm">Logout</button>
                </li>
              </ul>
            </>
          ) : (
            <ul className="navbar-nav ml-auto">
              <li className="navbar-item">
                <Link to="/signin" className="nav-link">Sign In</Link>
              </li>
              <li className="navbar-item">
                <Link to="/signup" className="nav-link">Sign Up</Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    );
  }
}