import React, { useEffect, useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

export default function WorkoutBuilder() {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [exDescription, setExDescription] = useState('');
  const [exDuration, setExDuration] = useState(0);
  const [exDate, setExDate] = useState(new Date());
  const [exercises, setExercises] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const newWorkoutInputRef = useRef(null);

  const api = {
    workouts: 'http://localhost:5000/workout/',
    addWorkout: 'http://localhost:5000/workout/add',
    exercises: 'http://localhost:5000/exercises/',
    addExercise: 'http://localhost:5000/exercises/add'
  };

  // Load workouts
  const fetchWorkouts = () => {
    setLoadingWorkouts(true);
    axios.get(api.workouts)
      .then(res => {
        const names = res.data.map(w => w.username);
        setWorkouts(names);
        if (!selectedWorkout && names.length) setSelectedWorkout(names[0]);
      })
      .finally(() => setLoadingWorkouts(false));
  };

  // Load all exercises then filter client-side (backend has no workout filter route in current code)
  const fetchExercises = () => {
    setLoadingExercises(true);
    axios.get(api.exercises)
      .then(res => setExercises(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoadingExercises(false));
  };

  useEffect(() => {
    fetchWorkouts();
    fetchExercises();
  }, []);

  const handleAddWorkout = (e) => {
    e.preventDefault();
    const trimmed = newWorkoutName.trim();
    if (!trimmed) return;
    axios.post(api.addWorkout, { username: trimmed })
      .then(() => {
        setNewWorkoutName('');
        // Optimistic update
        setWorkouts(prev => {
          if (!prev.includes(trimmed)) {
            const next = [...prev, trimmed].sort();
            return next;
          }
          return prev;
        });
        setSelectedWorkout(trimmed);
        setTimeout(() => newWorkoutInputRef.current?.focus(), 0);
      })
      .catch(err => {
        console.error('Error adding workout', err.response?.data || err.message);
        alert(err.response?.data || 'Failed to add workout');
      });
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!selectedWorkout) {
      alert('Select a workout first');
      return;
    }
    const payload = {
      username: selectedWorkout,  // Keeping legacy field name
      description: exDescription,
      duration: Number(exDuration),
      date: exDate
    };
    axios.post(api.addExercise, payload)
      .then(res => {
        // Refresh exercises
        fetchExercises();
        // Reset exercise portion (keep chosen workout)
        setExDescription('');
        setExDuration(0);
        setExDate(new Date());
      })
      .catch(err => {
        console.error('Error adding exercise', err.response?.data || err.message);
        alert(err.response?.data || 'Failed to add exercise');
      });
  };

  const handleDeleteExercise = (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    axios.delete(api.exercises + id)
      .then(() => {
        setExercises(prev => prev.filter(e => e._id !== id));
      })
      .catch(err => {
        console.error('Delete failed', err);
        alert('Failed to delete');
      });
  };

  const filteredExercises = exercises.filter(e => e.username === selectedWorkout);

  return (
    <div className="container py-3">
      <h2 className="mb-4">Workout Builder</h2>

      <div className="row g-4">
        {/* Column: Create / Select Workout */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5>Create / Select Workout</h5>
              <form onSubmit={handleAddWorkout} className="mb-3">
                <label className="form-label">New Workout Name</label>
                <input
                  ref={newWorkoutInputRef}
                  type="text"
                  className="form-control mb-2"
                  value={newWorkoutName}
                  onChange={e => setNewWorkoutName(e.target.value)}
                  placeholder="e.g. Push Day"
                />
                <button type="submit" className="btn btn-sm btn-primary">
                  Add Workout
                </button>
              </form>

              <label className="form-label">Existing Workouts</label>
              {loadingWorkouts && <div className="form-text">Loading...</div>}
              <select
                className="form-select"
                value={selectedWorkout}
                onChange={e => setSelectedWorkout(e.target.value)}
              >
                <option value="" disabled>Select a workout</option>
                {workouts.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <small className="text-muted d-block mt-2">
                {workouts.length
                  ? `${workouts.length} available`
                  : (loadingWorkouts ? 'Loading...' : 'No workouts yet')}
              </small>
            </div>
          </div>
        </div>

        {/* Column: Add Exercise Details */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5>Add Exercise Details</h5>
              <form onSubmit={handleAddExercise}>
                <div className="mb-3">
                  <label className="form-label">Workout</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedWorkout || ''}
                    disabled
                    placeholder="Select or create a workout first"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={exDescription}
                    onChange={e => setExDescription(e.target.value)}
                    required
                    placeholder="e.g. Bench Press"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={exDuration}
                    onChange={e => setExDuration(e.target.value)}
                    required
                    min={0}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <div>
                    <DatePicker
                      selected={exDate}
                      onChange={d => setExDate(d)}
                      className="form-control"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={!selectedWorkout}
                  title={!selectedWorkout ? 'Select or create a workout first' : ''}
                >
                  Add Exercise
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Column: Current Exercises */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="mb-3">
                {selectedWorkout ? `Exercises: ${selectedWorkout}` : 'Select a workout'}
              </h5>
              {loadingExercises && <div className="text-muted">Loading exercises...</div>}
              {!loadingExercises && selectedWorkout && filteredExercises.length === 0 && (
                <div className="text-muted">No exercises yet</div>
              )}
              <div style={{ overflowY: 'auto', maxHeight: 360 }}>
                {filteredExercises.map(ex => (
                  <div key={ex._id} className="border rounded p-2 mb-2">
                    <div className="d-flex justify-content-between">
                      <strong>{ex.description}</strong>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteExercise(ex._id)}
                      >
                        &times;
                      </button>
                    </div>
                    <div style={{ fontSize: 12 }}>
                      Duration: {ex.duration} min<br />
                      {ex.date && (
                        <span>{new Date(ex.date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {selectedWorkout && filteredExercises.length > 0 && (
                <small className="text-muted mt-auto">
                  {filteredExercises.length} exercise{filteredExercises.length > 1 ? 's' : ''} total
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}