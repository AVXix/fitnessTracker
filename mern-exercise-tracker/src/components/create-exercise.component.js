import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class CreateExercise extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDuration = this.onChangeDuration.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Create ref properly
    this.userInputRef = React.createRef();

    this.state = {
      username: '',
      description: '',
      duration: 0,
      date: new Date(),
      users: []
    }
  }

  componentDidMount() {
    console.log('Fetching users from API...');
    axios.get('http://localhost:5000/users/')
      .then(response => {
        console.log('API response:', response.data);
        if (response.data.length > 0) {
          const usernames = response.data.map(user => user.username);
          console.log('Extracted usernames:', usernames);
          this.setState({
            users: usernames,
            username: usernames[0]
          });
          console.log('State updated with users:', usernames);
        } else {
          console.log('No users found in API response');
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        console.error('Error details:', error.response?.data || error.message);
      })

  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    })
  }

  onChangeDuration(e) {
    this.setState({
      duration: e.target.value
    })
  }

  onChangeDate(date) {
    this.setState({
      date: date
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const exercise = {
      username: this.state.username,
      description: this.state.description,
      duration: this.state.duration,
      date: this.state.date
    }

    console.log(exercise);

    axios.post('http://localhost:5000/exercises/add', exercise)
      .then(res => {
        console.log(res.data);
        // Clear the form after successful submission
        this.setState({
          description: '',
          duration: 0,
          date: new Date()
          // username remains the same for convenience
        });
        // Redirect to home page to see the new exercise
        window.location = '/';
      })
      .catch(err => {
        console.error('Error adding exercise:', err);
      });
  }

  render() {
    return (
    <div>
      <h3>Fill details of workout</h3>
      <form onSubmit={this.onSubmit}>
        <div className="form-group"> 
          <label>Workout </label>
          <select ref={this.userInputRef}
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}>
              {this.state.users.length === 0 ? (
                <option value="">No users found - check server connection</option>
              ) : (
                this.state.users.map(function(user) {
                  return <option 
                    key={user}
                    value={user}>{user}
                    </option>;
                })
              )}
          </select>
          <small className="form-text text-muted">
            {this.state.users.length > 0 ? `${this.state.users.length} users loaded` : 'Loading users...'}
          </small>
        </div>
        <div className="form-group"> 
          <label>Description: </label>
          <input  type="text"
              required
              className="form-control"
              value={this.state.description}
              onChange={this.onChangeDescription}
              />
        </div>
        <div className="form-group">
          <label>Duration (in minutes): </label>
          <input 
              type="text" 
              className="form-control"
              value={this.state.duration}
              onChange={this.onChangeDuration}
              />
        </div>
        <div className="form-group">
          <label>Date: </label>
          <div>
            <DatePicker
              selected={this.state.date}
              onChange={this.onChangeDate}
            />
          </div>
        </div>

        <div className="form-group">
          <input type="submit" value="Compleate with details" className="btn btn-primary" />
        </div>
      </form>
    </div>
    )
  }
}