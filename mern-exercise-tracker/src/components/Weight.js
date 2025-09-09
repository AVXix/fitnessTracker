import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function formatDateInput(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function formatDateUTCString(iso) {
  const d = new Date(iso);
  return formatDateInput(d);
}

function toUTCDateOnlyStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Weight() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weightByDay, setWeightByDay] = useState({});
  const [inputWeight, setInputWeight] = useState('');
  const [averages, setAverages] = useState({ weeklyAverage: 0, monthlyAverage: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedKey = useMemo(() => formatDateInput(selectedDate), [selectedDate]);

  useEffect(() => {
    if (!user?.email) return;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 90);
    const qs = new URLSearchParams({ userEmail: user.email, from: start.toISOString(), to: end.toISOString() });
    setLoading(true);
    fetch(`http://localhost:5000/weight?${qs.toString()}`)
      .then(r => r.json())
      .then(list => {
        const map = {};
        for (const e of list) {
          const k = formatDateUTCString(e.date);
          map[k] = e.weight;
        }
        setWeightByDay(map);
      })
      .catch(() => setError('Failed to load weight'))
      .finally(() => setLoading(false));
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    const qs = new URLSearchParams({ userEmail: user.email, date: toUTCDateOnlyStr(selectedDate) });
    fetch(`http://localhost:5000/weight/averages?${qs.toString()}`)
      .then(r => r.json())
      .then(setAverages)
      .catch(() => {});
  }, [user?.email, selectedDate]);

  useEffect(() => {
    const v = weightByDay[selectedKey];
    setInputWeight(v !== undefined ? String(v) : '');
  }, [selectedKey, weightByDay]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const num = Number(inputWeight);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Enter a valid positive number');
      return;
    }
    if (!user?.email) return;

    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/weight/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, date: toUTCDateOnlyStr(selectedDate), weight: num })
      });
      if (!res.ok) throw new Error('Failed');
      setWeightByDay(prev => ({ ...prev, [selectedKey]: num }));
    } catch (e) {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function isSameDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="d-flex align-items-center mb-3 gap-2">
          <h2 className="mb-0">Weight Tracker</h2>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setSelectedDate(new Date(year, month - 1, Math.min(selectedDate.getDate(), 28)))}>&lt; Prev</button>
            <div className="fw-semibold align-self-center" style={{ minWidth: 160, textAlign: 'center' }}>{selectedDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
            <button className="btn btn-outline-secondary" onClick={() => setSelectedDate(new Date(year, month + 1, Math.min(selectedDate.getDate(), 28)))}>Next &gt;</button>
            <input type="date" className="form-control" style={{ width: 170 }} value={formatDateInput(selectedDate)} onChange={(e) => { const [yy, mm, dd] = e.target.value.split('-').map(Number); setSelectedDate(new Date(yy, mm - 1, dd)); }} />
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-grid text-center text-muted small mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {cells.map((d, idx) => {
                if (!d) return <div key={idx} />;
                const key = formatDateInput(d);
                const isSelected = isSameDate(d, selectedDate);
                const weight = weightByDay[key];
                return (
                  <button key={idx} onClick={() => setSelectedDate(d)} className={`btn ${isSelected ? 'border-primary' : 'border-secondary-subtle'}`} style={{ borderWidth: isSelected ? 2 : 1, background: isSelected ? '#e7f1ff' : '#fff', padding: 8, textAlign: 'left', minHeight: 80 }}>
                    <div className="fw-semibold">{d.getDate()}</div>
                    <div className="small text-secondary">{weight !== undefined ? `${weight} kg` : '—'}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card mt-3">
          <div className="card-body">
            <form onSubmit={handleSave}>
              <div className="row g-2 align-items-center">
                <div className="col-auto"><label className="col-form-label">Weight for {formatDateInput(selectedDate)}</label></div>
                <div className="col-auto"><input type="number" className="form-control" min="1" step="0.1" placeholder="e.g., 70.5" value={inputWeight} onChange={(e) => setInputWeight(e.target.value)} required /></div>
                <div className="col-auto"><button disabled={saving} className="btn btn-primary" type="submit">{saving ? 'Saving...' : 'Save'}</button></div>
                {loading && <div className="col-auto text-muted">Loading…</div>}
              </div>
              {error && <div className="text-danger mt-2">{error}</div>}
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="position-sticky" style={{ top: 16 }}>
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between"><span>Weekly average</span><strong>{averages.weeklyAverage || 0} kg</strong></div>
              <div className="d-flex justify-content-between mt-2"><span>Monthly average</span><strong>{averages.monthlyAverage || 0} kg</strong></div>
            </div>
          </div>
          <div className="card">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Selected day</div>
                <div className="fw-semibold">{selectedDate.toLocaleDateString()}</div>
              </div>
              <div className="fw-bold fs-5">{weightByDay[selectedKey] !== undefined ? `${weightByDay[selectedKey]} kg` : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}