import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function formatDateInput(d) {
  const dt = new Date(d);
  // format YYYY-MM-DD in local time for input[type=date]
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const da = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function formatDateUTCString(iso) {
  const dt = new Date(iso);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const da = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function toUTCDateOnlyStr(d) {
  const dt = new Date(d);
  const utc = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  return utc.toISOString();
}

export default function Calories() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [caloriesByDay, setCaloriesByDay] = useState({}); // key: yyyy-mm-dd, value: number
  const [inputCalories, setInputCalories] = useState('');
  const [averages, setAverages] = useState({ weeklyAverage: 0, monthlyAverage: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedKey = useMemo(() => formatDateInput(selectedDate), [selectedDate]);

  useEffect(() => {
    if (!user?.email) return;
    // load last 90 days of entries for calendar view
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 90);
    const qs = new URLSearchParams({
      userEmail: user.email,
      from: start.toISOString(),
      to: end.toISOString(),
    });
    setLoading(true);
    fetch(`http://localhost:5000/calories?${qs.toString()}`)
      .then(r => r.json())
      .then(list => {
        const map = {};
        for (const e of list) {
          const k = formatDateUTCString(e.date);
          map[k] = e.calories;
        }
        setCaloriesByDay(map);
      })
      .catch(() => setError('Failed to load calories'))
      .finally(() => setLoading(false));
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    const qs = new URLSearchParams({ userEmail: user.email, date: toUTCDateOnlyStr(selectedDate) });
    fetch(`http://localhost:5000/calories/averages?${qs.toString()}`)
      .then(r => r.json())
      .then(setAverages)
      .catch(() => {});
  }, [user?.email, selectedDate]);

  useEffect(() => {
    // sync input with stored value when date changes
    const v = caloriesByDay[selectedKey];
    setInputCalories(v !== undefined ? String(v) : '');
  }, [selectedKey, caloriesByDay]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const num = Number(inputCalories);
    if (!Number.isFinite(num) || num < 0) {
      setError('Enter a valid non-negative number');
      return;
    }
    if (!user?.email) return;

    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/calories/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          date: toUTCDateOnlyStr(selectedDate),
          calories: num,
        })
      });
      if (!res.ok) throw new Error('Failed');
      setCaloriesByDay(prev => ({ ...prev, [selectedKey]: num }));
    } catch (e) {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Simple mini-calendar grid for current month
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 Sun - 6 Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function isSameDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
      <div>
        <h2>Calorie Tracker</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button className="btn btn-outline-secondary" onClick={() => setSelectedDate(new Date(year, month - 1, Math.min(selectedDate.getDate(), 28)))}>&lt; Prev</button>
          <h5 style={{ margin: 0 }}>{selectedDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h5>
          <button className="btn btn-outline-secondary" onClick={() => setSelectedDate(new Date(year, month + 1, Math.min(selectedDate.getDate(), 28)))}>Next &gt;</button>
          <input
            type="date"
            className="form-control"
            style={{ maxWidth: 170, marginLeft: 'auto' }}
            value={formatDateInput(selectedDate)}
            onChange={(e) => {
              const [yy, mm, dd] = e.target.value.split('-').map(Number);
              setSelectedDate(new Date(yy, mm - 1, dd));
            }}
          />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, borderTop: '1px solid #eee', paddingTop: 8
        }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ fontSize: 12, color: '#6c757d', textAlign: 'center' }}>{d}</div>
          ))}
          {cells.map((d, idx) => {
            if (!d) return <div key={idx} />;
            const key = formatDateInput(d);
            const isSelected = isSameDate(d, selectedDate);
            const calories = caloriesByDay[key];
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(d)}
                className="btn"
                style={{
                  border: isSelected ? '2px solid #0d6efd' : '1px solid #ddd',
                  background: isSelected ? '#e7f1ff' : '#fff',
                  padding: 8,
                  textAlign: 'left',
                  minHeight: 72,
                }}
              >
                <div style={{ fontWeight: 600 }}>{d.getDate()}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{calories !== undefined ? `${calories} kcal` : '—'}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSave} style={{ marginTop: 16 }}>
          <div className="input-group" style={{ maxWidth: 360 }}>
            <span className="input-group-text">Calories for {formatDateInput(selectedDate)}</span>
            <input
              type="number"
              className="form-control"
              min="0"
              step="1"
              placeholder="e.g., 2200"
              value={inputCalories}
              onChange={(e) => setInputCalories(e.target.value)}
              required
            />
            <button disabled={saving} className="btn btn-primary" type="submit">{saving ? 'Saving...' : 'Save'}</button>
          </div>
          {error && <div className="text-danger mt-2">{error}</div>}
          {loading && <div className="text-muted mt-2">Loading recent entries…</div>}
        </form>
      </div>

      <aside style={{ borderLeft: '1px solid #eee', paddingLeft: 16, position: 'sticky', top: 8, alignSelf: 'start', height: 'fit-content' }}>
        <h5>Summary</h5>
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <span>Weekly average</span>
              <strong>{averages.weeklyAverage} kcal</strong>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <span>Monthly average</span>
              <strong>{averages.monthlyAverage} kcal</strong>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontSize: 12, color: '#6c757d' }}>Selected day</div>
                <div style={{ fontWeight: 600 }}>{selectedDate.toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{caloriesByDay[selectedKey] !== undefined ? `${caloriesByDay[selectedKey]} kcal` : '—'}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
