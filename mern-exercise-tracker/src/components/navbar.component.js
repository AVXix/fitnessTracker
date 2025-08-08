import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand">ExerciseTracker</Link>
        <div className="collapse navbar-collapse">
        <ul className="navbar-nav mr-auto">

          
          <li className="navbar-item">
          <Link to="/" className="nav-link">Current workouts</Link>
          </li>

          <li className="navbar-item">
          <Link to="/user" className="nav-link">Create a workout</Link>
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
        </div>
      </nav>
    );
  }
}