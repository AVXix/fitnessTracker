import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    sex: '',
    age: '',
    heightCm: '',
    weightKg: '',
    activityLevel: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    const qs = new URLSearchParams({ userEmail: user.email });
    fetch(`http://localhost:5000/profile?${qs.toString()}`)
      .then(r => r.json())
      .then(doc => {
        if (doc) {
          setForm({
            name: doc.name || '',
            sex: doc.sex || '',
            age: doc.age ?? '',
            heightCm: doc.heightCm ?? '',
            weightKg: doc.weightKg ?? '',
            activityLevel: doc.activityLevel || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email,
          name: form.name,
          sex: form.sex,
          age: form.age === '' ? null : Number(form.age),
          heightCm: form.heightCm === '' ? null : Number(form.heightCm),
          weightKg: form.weightKg === '' ? null : Number(form.weightKg),
          activityLevel: form.activityLevel,
        })
      });
      if (!res.ok) throw new Error('Failed');
      setMessage('Saved');
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <div>
      <h2>Profile</h2>
      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : (
        <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input name="name" className="form-control" value={form.name} onChange={onChange} />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Sex</label>
              <select name="sex" className="form-select" value={form.sex} onChange={onChange}>
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Age</label>
              <input name="age" type="number" min="0" className="form-control" value={form.age} onChange={onChange} />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Height (cm)</label>
              <input name="heightCm" type="number" min="0" className="form-control" value={form.heightCm} onChange={onChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Weight (kg)</label>
              <input name="weightKg" type="number" min="0" className="form-control" value={form.weightKg} onChange={onChange} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Activity level</label>
            <select name="activityLevel" className="form-select" value={form.activityLevel} onChange={onChange}>
              <option value="">—</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          {message && <span className="ms-3">{message}</span>}
        </form>
      )}
    </div>
  );
}
