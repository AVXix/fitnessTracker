import React, { Component } from 'react';
import axios from 'axios';

export default class CreateWorkout extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: ''
    }
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const saved = localStorage.getItem('authUser');
    const email = saved ? (JSON.parse(saved).email || '') : '';
    const workout = {
      userEmail: email,
      username: this.state.username
    }

    console.log(workout);

    axios.post('http://localhost:5000/workout/add', workout)
      .then(res => console.log(res.data));

    this.setState({
      username: ''
    })
  }

  render() {
    return (
      <div>
        <h3>Create New Workout</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group"> 
            <label>Workout Name</label>
            <input  type="text"
                required
                className="form-control"
                value={this.state.username}
                onChange={this.onChangeUsername}
                />
          </div>
          <div className="form-group">
            <input type="submit" value="Create Workout" className="btn btn-primary" />
          </div>
        </form>
      </div>
    )
  }
}
