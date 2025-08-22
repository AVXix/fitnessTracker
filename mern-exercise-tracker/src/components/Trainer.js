import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Trainer() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const { user } = useAuth();
  const [userRatings, setUserRatings] = useState({});

  const fetchTrainers = () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (query) qs.set('q', query);
    fetch(`http://localhost:5000/profile/trainers?${qs.toString()}`)
      .then(r => r.json())
      .then(d => setTrainers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  const backendBase = 'http://localhost:5000';
  const resolveAvatar = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${backendBase}${url}`;
  };

  useEffect(() => { fetchTrainers(); }, []);

  const submitRating = async (trainerEmail, rating) => {
    if (!user || !user.email) return; // should not happen if UI checks
    // optimistic UI
    setUserRatings(prev => ({ ...prev, [trainerEmail]: rating }));
    try {
      const res = await fetch(`http://localhost:5000/profile/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerEmail, userEmail: user.email, rating })
      });
      if (!res.ok) throw new Error('Failed');
      const d = await res.json();
      // update local trainers state with new avg/count
      setTrainers(prev => prev.map(t => t.userEmail === trainerEmail ? { ...t, avgRating: d.avgRating, reviewCount: d.reviewCount } : t));
    } catch (e) {
      console.error('Rating failed', e);
      alert('Failed to submit rating');
      // rollback optimistic
      setUserRatings(prev => { const copy = { ...prev }; delete copy[trainerEmail]; return copy; });
    }
  };

  const toggleExpand = (email) => {
    setExpanded(prev => ({ ...prev, [email]: !prev[email] }));
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Trainers</h2>
      </div>

      <div className="mb-3 d-flex">
        <input className="form-control me-2" placeholder="Search trainers" value={query} onChange={e => setQuery(e.target.value)} />
        <button className="btn btn-outline-primary" onClick={fetchTrainers}>Search</button>
      </div>

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : (
        <div className="row g-3">
          {trainers.length === 0 && <div className="text-muted">No trainers found.</div>}
          {trainers.map(t => (
            <div className="col-12" key={t.userEmail}>
              <div className="card h-100 w-100">
                <div className="card-body">
                  <div className="d-flex">
                    <div style={{ width: 120, flexShrink: 0 }}>
                      {t.avatarUrl ? (
                        <img src={resolveAvatar(t.avatarUrl)} alt={t.name || t.userEmail} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: '100%', height: 120, background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
                          <small className="text-muted">No image</small>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }} className="ms-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div>
                            <h5 className="card-title mb-1" style={{ margin: 0 }}>{t.name || t.userEmail}</h5>
                            <div style={{ fontSize: 12 }}>
                              {t.avgRating == null ? (
                                <span className="text-muted">No reviews yet</span>
                              ) : (
                                <span className="text-primary">{Number(t.avgRating).toFixed(1)} / 5</span>
                              )}
                              {' '}
                              <span className="text-muted">{t.reviewCount ? `(${t.reviewCount} review${t.reviewCount > 1 ? 's' : ''})` : ''}</span>
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">{t.age ? `${t.age} yrs` : ''}</small>
                      </div>

                      {t.trainerDescription && (
                        (() => {
                          const limit = 160;
                          const full = t.trainerDescription || '';
                          const isExpanded = !!expanded[t.userEmail];
                          if (full.length <= limit) return <p className="card-text">{full}</p>;
                          return (
                            <p className="card-text">{isExpanded ? full : `${full.slice(0, limit)}... `}
                              <button type="button" className="btn btn-link p-0 ms-1" onClick={() => toggleExpand(t.userEmail)}>
                                {isExpanded ? 'Show less' : 'Read more'}
                              </button>
                            </p>
                          );
                        })()
                      )}

                      <div className="d-flex align-items-center mb-2">
                        <button type="button" className="btn btn-sm btn-outline-info me-2" onClick={() => toggleExpand(`details:${t.userEmail}`)}>
                          {expanded[`details:${t.userEmail}`] ? 'Hide details' : 'Details'}
                        </button>
                        <small className="text-muted ms-2">Joined: {new Date(t.createdAt).toLocaleDateString?.() || ''}</small>
                      </div>

                      {expanded[`details:${t.userEmail}`] && (
                        <div className="border-top pt-2">
                          <div className="mb-2">
                            {t.trainerContactPhone && (
                              <div className="mb-1">
                                <strong>Phone:</strong> <span>{t.trainerContactPhone}</span>
                              </div>
                            )}

                            {t.trainerContactEmail && (
                              <div className="mb-1">
                                <strong>Email:</strong> <span>{t.trainerContactEmail}</span>
                              </div>
                            )}
                          </div>

                          {Array.isArray(t.socialLinks) && t.socialLinks.length > 0 && (
                            <div className="mb-1">
                              <strong>Social</strong>
                              <ul className="list-unstyled mt-2 mb-0">
                                {t.socialLinks.map((s, i) => (
                                  <li key={i} className="mb-1">
                                    <strong>{s.platform || 'Link'}:</strong>{' '}
                                    <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Rating UI */}
                          <div className="mt-3 border-top pt-2">
                            <strong style={{ fontSize: 14 }}>Rate this trainer</strong>
                            <div className="d-flex align-items-center mt-2" style={{ gap: 6 }}>
                              {user && user.email ? (
                                <div>
                                  {[1,2,3,4,5].map(i => {
                                    const filled = (userRatings[t.userEmail] ?? (t.avgRating ? Math.round(t.avgRating) : 0)) >= i;
                                    return (
                                      <button key={i} type="button" className={`btn btn-sm ${filled ? 'btn-warning' : 'btn-outline-secondary'}`} style={{ padding: '4px 8px', lineHeight: 1 }} onClick={() => submitRating(t.userEmail, i)} aria-label={`${i} star`}>
                                        <span style={{ fontWeight: 600 }}>{filled ? '★' : '☆'}</span>
                                      </button>
                                    );
                                  })}
                                  <span className="text-muted ms-2" style={{ fontSize: 13 }}>{t.reviewCount ? `${t.reviewCount} review${t.reviewCount > 1 ? 's' : ''}` : 'No reviews'}</span>
                                </div>
                              ) : (
                                <small className="text-muted">Sign in to leave a rating</small>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
