import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth() || {};
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [errorWorkouts, setErrorWorkouts] = useState('');

  const [averages, setAverages] = useState({ weeklyAverage: 0, monthlyAverage: 0 });
  const [loadingAvg, setLoadingAvg] = useState(false);
  const [errorAvg, setErrorAvg] = useState('');

  const didLoad = useRef(false);

  const loadWorkouts = () => {
    setLoadingWorkouts(true);
    setErrorWorkouts('');
    if (!user?.email) {
      setWorkouts([]);
      setLoadingWorkouts(false);
      return;
    }
    axios.get('http://localhost:5000/workout/', { params: { userEmail: user.email } })
      .then(res => {
        const names = Array.isArray(res.data) ? res.data.map(w => w.username) : [];
        setWorkouts(names);
      })
      .catch(err => setErrorWorkouts(err.response?.data || 'Failed to load workouts'))
      .finally(() => setLoadingWorkouts(false));
  };

  const loadAverages = () => {
    if (!user?.email) return;
    setLoadingAvg(true);
    setErrorAvg('');
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const qs = new URLSearchParams({ userEmail: user.email, date: dateStr });
    fetch(`http://localhost:5000/calories/averages?${qs.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then(data => setAverages(data))
      .catch(err => setErrorAvg(err.message || 'Failed to load averages'))
      .finally(() => setLoadingAvg(false));
  };

  const refreshAll = () => {
    loadWorkouts();
    loadAverages();
  };

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]); // reload when user changes

  return (
    <div className="container py-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h2 className="mb-2">Dashboard</h2>
        <button
          className="btn btn-sm btn-outline-secondary"
            onClick={refreshAll}
            disabled={loadingWorkouts || loadingAvg}
        >
          {(loadingWorkouts || loadingAvg) ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Calorie Averages Summary */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Weekly Avg Calories</h6>
              {errorAvg ? (
                <div className="text-danger small">{errorAvg}</div>
              ) : (
                <div className="fs-4 fw-semibold">
                  {loadingAvg ? '...' : `${averages.weeklyAverage || 0} kcal`}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Monthly Avg Calories</h6>
              {errorAvg ? (
                <div className="text-danger small">{errorAvg}</div>
              ) : (
                <div className="fs-4 fw-semibold">
                  {loadingAvg ? '...' : `${averages.monthlyAverage || 0} kcal`}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-sm-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h6 className="text-muted mb-2">Full Analytics</h6>
              <p className="small text-muted mb-3">
                View trends, history and daily inputs on the Analytics page.
              </p>
              <Link to="/analytics" className="btn btn-sm btn-primary mt-auto align-self-start">
                Open Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Workouts Section */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="mb-0">My Workouts</h3>
        <Link to="/workouts" className="btn btn-sm btn-outline-primary">Manage / Add</Link>
      </div>

      {errorWorkouts && <div className="alert alert-danger py-2">{errorWorkouts}</div>}
      {!loadingWorkouts && workouts.length === 0 && !errorWorkouts && (
        <div className="text-muted mb-3">No workouts yet. Create one on the Workouts page.</div>
      )}

      <div className="row g-3">
        {workouts.map(name => (
          <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={name}>
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <strong className="mb-1" style={{ fontSize: 14 }}>{name}</strong>
                <small className="text-muted mt-auto">Workout</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
