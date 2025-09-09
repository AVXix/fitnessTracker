import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function toUTCDateOnly(d) {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
}

function formatKeyUTC(dateOrIso) {
  const d = new Date(dateOrIso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function buildContinuousSeries(entries, startUTC, endUTC) {
  // entries: [{ date, calories }], dates are UTC midnight in DB
  const map = new Map(entries.map(e => [formatKeyUTC(e.date), e.calories || 0]));
  const days = [];
  for (let d = new Date(startUTC); d <= endUTC; d.setUTCDate(d.getUTCDate() + 1)) {
    const k = formatKeyUTC(d);
    const hasData = map.has(k);
    days.push({ date: new Date(d), key: k, value: hasData ? map.get(k) : 0, hasData });
  }
  return days;
}

export default function Analytics() {
  const { user } = useAuth();
  const [rangeDays, setRangeDays] = useState(90);
  const [endDate, setEndDate] = useState(() => new Date());
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [yMaxAuto, setYMaxAuto] = useState(0);

  // NEW state
  const [profile, setProfile] = useState(null);
  const [avgAverages, setAvgAverages] = useState({ weeklyAverage: 0, monthlyAverage: 0 });
  const [recState, setRecState] = useState({ bmr: null, maintenanceMid: null, maintenanceLow: null, maintenanceHigh: null });

  const startUTC = useMemo(() => {
    const endUTC = toUTCDateOnly(endDate);
    const start = new Date(endUTC);
    start.setUTCDate(endUTC.getUTCDate() - (rangeDays - 1));
    return start;
  }, [endDate, rangeDays]);

  const endUTC = useMemo(() => toUTCDateOnly(endDate), [endDate]);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    const qs = new URLSearchParams({
      userEmail: user.email,
      from: startUTC.toISOString(),
      to: endUTC.toISOString(),
    });
    fetch(`http://localhost:5000/calories?${qs.toString()}`)
      .then(r => r.json())
      .then(list => {
        const s = buildContinuousSeries(list || [], startUTC, endUTC);
        setSeries(s);
        const maxVal = s.reduce((m, p) => Math.max(m, p.value), 0);
        setYMaxAuto(maxVal || 2500);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [user?.email, startUTC, endUTC]);

  // Fetch profile
  useEffect(() => {
    if (!user?.email) return;
    const qs = new URLSearchParams({ userEmail: user.email });
    fetch(`http://localhost:5000/profile?${qs.toString()}`)
      .then(r => r.json())
      .then(doc => setProfile(doc || null))
      .catch(() => setProfile(null));
  }, [user?.email]);

  // Fetch weekly/monthly averages (uses today's date)
  useEffect(() => {
    if (!user?.email) return;
    const today = new Date().toISOString().slice(0,10);
    const qs = new URLSearchParams({ userEmail: user.email, date: today });
    fetch(`http://localhost:5000/calories/averages?${qs.toString()}`)
      .then(r => r.json())
      .then(setAvgAverages)
      .catch(() => {});
  }, [user?.email]);

  // Compute recommendations when profile changes
  useEffect(() => {
    if (!profile) {
      setRecState({ bmr: null, maintenanceMid: null, maintenanceLow: null, maintenanceHigh: null });
      return;
    }
    const { age, heightCm, weightKg, sex } = profile;
    if (!(age && heightCm && weightKg)) {
      setRecState({ bmr: null, maintenanceMid: null, maintenanceLow: null, maintenanceHigh: null });
      return;
    }
    // Mifflin-St Jeor
    let base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (sex === 'male') base += 5;
    else if (sex === 'female') base -= 161;
    // Activity range (sedentary to moderately active)
    const maintenanceLow = Math.round(base * 1.2);
    const maintenanceHigh = Math.round(base * 1.55);
    const maintenanceMid = Math.round((maintenanceLow + maintenanceHigh) / 2);
    setRecState({
      bmr: Math.round(base),
      maintenanceLow,
      maintenanceHigh,
      maintenanceMid
    });
  }, [profile]);

  // Helper differences
  const weeklyDiff = useMemo(() => {
    if (!recState.maintenanceMid) return null;
    return avgAverages.weeklyAverage ? avgAverages.weeklyAverage - recState.maintenanceMid : null;
  }, [avgAverages.weeklyAverage, recState.maintenanceMid]);

  // Suggested targets (simple defaults)
  const targets = useMemo(() => {
    if (!recState.maintenanceMid) return null;
    return {
      maintain: recState.maintenanceMid,
      loseSlow: recState.maintenanceMid - 300,   // ~0.25 kg/week
      loseFast: recState.maintenanceMid - 500,   // ~0.5 kg/week
      gainSlow: recState.maintenanceMid + 250,   // lean gain
      gainFast: recState.maintenanceMid + 400,
    };
  }, [recState.maintenanceMid]);

  // Chart dimensions
  const width = 900;
  const height = 300;
  const margin = { top: 16, right: 12, bottom: 28, left: 44 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const yMax = Math.ceil((yMaxAuto + 200) / 200) * 200; // round up to nearest 200

  function yScale(v) {
    const t = yMax === 0 ? 0 : v / yMax;
    return margin.top + innerH - t * innerH;
  }

  const points = useMemo(() => {
    if (!series.length) return [];
    const n = series.length;
    const stepX = n > 1 ? innerW / (n - 1) : 0;
    return series.map((p, i) => ({
      x: margin.left + i * stepX,
      y: yScale(p.value),
      hasData: p.hasData,
    }));
  }, [series, innerW, margin.left]);

  function buildPaths(segPredicate) {
    const out = [];
    let cur = [];
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      if (segPredicate(pt)) {
        cur.push(pt);
      } else if (cur.length) {
        out.push(cur);
        cur = [];
      }
    }
    if (cur.length) out.push(cur);
    return out.map(seg => seg.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '));
  }

  const dataPaths = useMemo(() => buildPaths(p => p.hasData), [points]);
  const missingPaths = useMemo(() => buildPaths(p => !p.hasData), [points]);

  const xTicks = useMemo(() => {
    if (!series.length) return [];
    const n = series.length;
    const stepX = n > 1 ? innerW / (n - 1) : 0;
    const ticks = [];
    const approxEvery = Math.max(1, Math.floor(n / 6)); // ~6 ticks
    for (let i = 0; i < n; i += approxEvery) {
      const p = series[i];
      ticks.push({
        x: margin.left + i * stepX,
        label: p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    }
    // ensure last tick at end
    const lastX = margin.left + (n - 1) * stepX;
    ticks.push({ x: lastX, label: series[n - 1].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) });
    return ticks;
  }, [series, innerW, margin.left]);

  const yTicks = useMemo(() => {
    const step = yMax > 2000 ? 500 : 200;
    const ticks = [];
    for (let v = 0; v <= yMax; v += step) ticks.push(v);
    return ticks;
  }, [yMax]);

  return (
    <div>
      <div className="d-flex align-items-center mb-3 gap-2">
        <h2 className="mb-0">Analytics</h2>
      </div>

      {/* NEW: Calorie Recommendation Panel */}
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="mb-3">Calorie Recommendations</h5>
          {!profile && (
            <div className="text-muted small">Loading profile…</div>
          )}
          {profile && !recState.bmr && (
            <div className="text-warning small">
              Add age, height and weight in your Profile to see personalized targets.
            </div>
          )}
          {profile && recState.bmr && (
            <div className="row g-3">
              <div className="col-md-3">
                <div className="small text-muted">BMR</div>
                <div className="fw-semibold">{recState.bmr} kcal</div>
                <div className="small text-muted">≈ calories if you rested all day</div>
              </div>
              <div className="col-md-3">
                <div className="small text-muted">Maintenance Range</div>
                <div className="fw-semibold">{recState.maintenanceLow} – {recState.maintenanceHigh}</div>
                <div className="small text-muted">Low–moderate activity</div>
              </div>
              <div className="col-md-3">
                <div className="small text-muted">Your Weekly Avg</div>
                <div className="fw-semibold">{avgAverages.weeklyAverage} kcal</div>
                {weeklyDiff !== null && (
                  <div className={`small ${weeklyDiff > 0 ? 'text-danger' : 'text-success'}`}>
                    {weeklyDiff === 0 ? 'On target'
                      : (weeklyDiff > 0 ? `+${weeklyDiff} above` : `${weeklyDiff} below`)}
                  </div>
                )}
              </div>
              <div className="col-md-3">
                <div className="small text-muted">Targets</div>
                {targets && (
                  <ul className="list-unstyled mb-0 small">
                    <li>Maintain: {targets.maintain}</li>
                    <li>Lose (slow): {targets.loseSlow}</li>
                    <li>Lose (faster): {targets.loseFast}</li>
                    <li>Gain (slow): {targets.gainSlow}</li>
                    <li>Gain (faster): {targets.gainFast}</li>
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing range controls + chart below */}
      <div className="card mb-3">
        <div className="card-body d-flex align-items-center gap-2" style={{ gap: 12 }}>
          <label className="form-label mb-0">Range:</label>
          <select className="form-select" style={{ width: 160 }} value={rangeDays} onChange={(e) => setRangeDays(Number(e.target.value))}>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
          </select>
          <label className="form-label mb-0 ms-3">End date:</label>
          <input
            type="date"
            className="form-control"
            style={{ width: 170 }}
            value={(() => {
              const dt = endDate;
              const y = dt.getFullYear();
              const m = String(dt.getMonth() + 1).padStart(2, '0');
              const d = String(dt.getDate()).padStart(2, '0');
              return `${y}-${m}-${d}`;
            })()}
            onChange={(e) => {
              const [yy, mm, dd] = e.target.value.split('-').map(Number);
              setEndDate(new Date(yy, mm - 1, dd));
            }}
          />
        </div>
      </div>

      {loading && <div className="text-muted">Loading…</div>}
      {error && <div className="text-danger">{error}</div>}

      {!loading && !series.length && (
        <div className="text-muted">No data in selected range.</div>
      )}

      {!loading && series.length > 0 && (
        <div className="card">
          <div className="card-body" style={{ overflowX: 'auto' }}>
            <svg width={width} height={height} style={{ maxWidth: '100%' }}>
              {/* Y grid and labels */}
              {yTicks.map(v => {
                const t = yMax === 0 ? 0 : v / yMax;
                const y = margin.top + innerH - t * innerH;
                return (
                  <g key={v}>
                    <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#eee" />
                    <text x={margin.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10">{v}</text>
                  </g>
                );
              })}

              {/* X axis */}
              <line x1={margin.left} y1={margin.top + innerH} x2={width - margin.right} y2={margin.top + innerH} stroke="#ccc" />
              {xTicks.map((t, i) => (
                <g key={i}>
                  <line x1={t.x} y1={margin.top + innerH} x2={t.x} y2={margin.top + innerH + 4} stroke="#888" />
                  <text x={t.x} y={margin.top + innerH + 18} textAnchor="middle" fontSize="10">{t.label}</text>
                </g>
              ))}

              {/* Missing segments (no data): grey dashed at recorded values (0) */}
              {missingPaths.map((d, i) => (
                <path key={`m-${i}`} d={d} fill="none" stroke="#adb5bd" strokeWidth="2" strokeDasharray="4 4" />
              ))}

              {/* Data segments: blue */}
              {dataPaths.map((d, i) => (
                <path key={`d-${i}`} d={d} fill="none" stroke="#0d6efd" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
