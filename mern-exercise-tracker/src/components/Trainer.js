import React, { useEffect, useState } from 'react';

export default function Trainer() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});

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
            <div className="col-md-6" key={t.userEmail}>
              <div className="card h-100">
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
                        <h5 className="card-title mb-1">{t.name || t.userEmail}</h5>
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
                        <small className="text-muted ms-auto">Joined: {new Date(t.createdAt).toLocaleDateString?.() || ''}</small>
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
