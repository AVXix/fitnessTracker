import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Goals() {
  const { user } = useAuth();
  const userEmail = user?.email || '';

  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState(null);

  const canSubmit = useMemo(() => !!goalName && !!userEmail, [goalName, userEmail]);

  const loadGoals = async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get('http://localhost:5000/goals', { params: { userEmail } });
      setGoals(res.data || []);
    } catch (e) {
      console.error('Failed to load goals', e);
    }
  };

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/goals/${id}`);
      setStatus({ type: 'success', message: res.data?.message || 'Goal deleted' });
      setGoals((prev) => prev.filter(g => g._id !== id));
      setTimeout(() => setStatus(null), 4000);
    } catch (e) {
      setStatus({ type: 'error', message: e.response?.data?.message || 'Failed to delete goal' });
      console.error('Failed to delete goal', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const payload = {
      userEmail,
      goalName,
      description,
      targetDate: targetDate ? targetDate : null,
    };

    try {
      const res = await axios.post('http://localhost:5000/goals/add', payload);
      setStatus({ type: 'success', message: res.data?.message || 'Goal added!' });
      setToast({ goalName: res.data?.goal?.goalName || goalName, targetDate: res.data?.goal?.targetDate || (targetDate || null) });
      setGoalName('');
      setDescription('');
      setTargetDate('');
      setShowForm(false);
      await loadGoals();
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      setStatus({ type: 'error', message: e.response?.data?.message || 'Failed to add goal' });
      console.error('Failed to add goal', e);
    }
  };

  return (
    <div>
      <h2>Goals</h2>

      {/* Goals list with Create button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Your Goals</h5>
        <button className="btn btn-sm btn-success" onClick={handleCreateClick}>Create Goal</button>
      </div>

      {status && (
        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
          {status.message}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-muted mb-3">No goals yet.</div>
      ) : (
        <ul className="list-group mb-4">
          {goals.map(g => (
            <li key={g._id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <strong>{g.goalName}</strong>
                {g.description ? ` — ${g.description}` : ''}
                <span className="text-muted ms-2">Target date: {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : 'N/A'}</span>
              </span>
              <div>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(g._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Inline creation form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
          <div className="form-group mb-3">
            <label>Goal name</label>
            <input className="form-control" value={goalName} onChange={(e) => setGoalName(e.target.value)} required />
          </div>
          <div className="form-group mb-3">
            <label>Description</label>
            <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group mb-3">
            <label>Target date (optional)</label>
            <input type="date" className="form-control" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            <small className="form-text text-muted">Leave empty for N/A</small>
          </div>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>Save Goal</button>
        </form>
      )}

      {toast && (
        <div style={{ position: 'fixed', right: 16, bottom: 16, background: '#222', color: '#fff', padding: '12px 16px', borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
          <div><strong>Goal:</strong> {toast.goalName}</div>
          <div><strong>Target date:</strong> {toast.targetDate ? new Date(toast.targetDate).toLocaleDateString() : 'N/A'}</div>
        </div>
      )}
    </div>
  );
}
