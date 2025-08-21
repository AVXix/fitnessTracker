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
  medicalIssue: false,
  medicalIssueDescription: '',
  isTrainer: false,
  trainerDescription: '',
  trainerContactPhone: '',
  trainerContactEmail: '',
  socialLinks: [],
  avatarUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

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
            medicalIssue: !!doc.medicalIssue,
            medicalIssueDescription: doc.medicalIssueDescription || '',
            isTrainer: !!doc.isTrainer,
            trainerDescription: doc.trainerDescription || '',
            trainerContactPhone: doc.trainerContactPhone || '',
            trainerContactEmail: doc.trainerContactEmail || '',
            socialLinks: Array.isArray(doc.socialLinks) ? doc.socialLinks : [],
            avatarUrl: doc.avatarUrl || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const onChange = (e) => {
  const { name, value, type, checked } = e.target;
  const v = type === 'checkbox' ? checked : value;
  setForm(prev => ({ ...prev, [name]: v }));
  };

  const onFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('avatar', f);
    try {
      const res = await fetch('http://localhost:5000/profile/upload-avatar', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm(prev => ({ ...prev, avatarUrl: data.url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
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
            medicalIssue: !!form.medicalIssue,
            medicalIssueDescription: form.medicalIssueDescription || '',
            isTrainer: !!form.isTrainer,
            trainerDescription: form.trainerDescription || '',
            trainerContactPhone: form.trainerContactPhone || '',
            trainerContactEmail: form.trainerContactEmail || '',
            socialLinks: Array.isArray(form.socialLinks) ? form.socialLinks : [],
            avatarUrl: form.avatarUrl || '',
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

  const backendBase = 'http://localhost:5000';

  const resolveAvatar = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${backendBase}${url}`;
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Profile</h2>
      </div>
      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Avatar image</label>
                  <div className="d-flex align-items-start">
                    <input name="avatarUrl" className="form-control me-2" value={form.avatarUrl} onChange={onChange} placeholder="https://... or upload" />
                    <div>
                      <input type="file" accept="image/*" onChange={onFileChange} />
                      {uploading && <div className="text-muted">Uploading…</div>}
                    </div>
                  </div>
                  {form.avatarUrl && (
                    <div className="mt-2" style={{ width: 120 }}>
                      <img src={resolveAvatar(form.avatarUrl)} alt="avatar" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input name="name" className="form-control" value={form.name} onChange={onChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Sex</label>
                  <select name="sex" className="form-select" value={form.sex} onChange={onChange}>
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Age</label>
                  <input name="age" type="number" min="0" className="form-control" value={form.age} onChange={onChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Height (cm)</label>
                  <input name="heightCm" type="number" min="0" className="form-control" value={form.heightCm} onChange={onChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Weight (kg)</label>
                  <input name="weightKg" type="number" min="0" className="form-control" value={form.weightKg} onChange={onChange} />
                </div>
                <div className="col-12">
                  <div className="form-check mb-2">
                    <input name="medicalIssue" className="form-check-input" type="checkbox" id="medicalIssue" checked={form.medicalIssue} onChange={onChange} />
                    <label className="form-check-label" htmlFor="medicalIssue">I have a medical issue</label>
                  </div>
                  <label className="form-label">Medical issue description</label>
                  <textarea name="medicalIssueDescription" className="form-control" value={form.medicalIssueDescription} onChange={onChange} rows={3} placeholder="Describe any medical conditions or restrictions"></textarea>

                  <hr />

                  <div className="form-check mb-2 mt-3">
                    <input name="isTrainer" className="form-check-input" type="checkbox" id="isTrainer" checked={form.isTrainer} onChange={onChange} />
                    <label className="form-check-label" htmlFor="isTrainer">I am a trainer</label>
                  </div>
                  <label className="form-label">Trainer description (what you offer)</label>
                  <textarea name="trainerDescription" className="form-control" value={form.trainerDescription} onChange={onChange} rows={3} placeholder="Short description for clients (specialties, experience, location)"></textarea>

                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <label className="form-label">Contact phone</label>
                      <input name="trainerContactPhone" className="form-control" value={form.trainerContactPhone} onChange={onChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact email</label>
                      <input name="trainerContactEmail" type="email" className="form-control" value={form.trainerContactEmail} onChange={onChange} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="form-label">Avatar image URL</label>
                    <div className="d-flex align-items-start">
                      <input name="avatarUrl" className="form-control me-2" value={form.avatarUrl} onChange={onChange} placeholder="https://..." />
                      <div>
                        <input type="file" accept="image/*" onChange={onFileChange} />
                        {uploading && <div className="text-muted">Uploading…</div>}
                      </div>
                    </div>
                    {form.avatarUrl && (
                      <div className="mt-2" style={{ width: 120 }}>
                        <img src={form.avatarUrl} alt="avatar" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <label className="form-label">Social links</label>
                    {form.socialLinks && form.socialLinks.map((s, idx) => (
                      <div className="row g-2 align-items-center mb-2" key={idx}>
                        <div className="col-md-3">
                          <select className="form-select" value={['Facebook','Instagram','YouTube','Twitter'].includes(s.platform) ? s.platform : (s.platform ? 'other' : '')} onChange={(e) => {
                            const v = e.target.value;
                            setForm(prev => {
                              const arr = (prev.socialLinks || []).slice();
                              arr[idx] = { ...arr[idx], platform: v === 'other' ? '' : v };
                              return { ...prev, socialLinks: arr };
                            });
                          }}>
                            <option value="">Select</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Instagram">Instagram</option>
                            <option value="YouTube">YouTube</option>
                            <option value="Twitter">Twitter</option>
                            <option value="other">Other...</option>
                          </select>
                          {(!['Facebook','Instagram','YouTube','Twitter'].includes(s.platform)) && (
                            <input className="form-control mt-2" placeholder="Other platform" value={s.platform} onChange={(e) => {
                              const v = e.target.value;
                              setForm(prev => {
                                const arr = (prev.socialLinks || []).slice();
                                arr[idx] = { ...arr[idx], platform: v };
                                return { ...prev, socialLinks: arr };
                              });
                            }} />
                          )}
                        </div>
                        <div className="col-md-7">
                          <input name={`social_url_${idx}`} className="form-control" placeholder="URL" value={s.url} onChange={(e) => {
                            const v = e.target.value;
                            setForm(prev => {
                              const arr = (prev.socialLinks || []).slice();
                              arr[idx] = { ...arr[idx], url: v };
                              return { ...prev, socialLinks: arr };
                            });
                          }} />
                        </div>
                        <div className="col-md-2">
                          <button type="button" className="btn btn-danger" onClick={() => {
                            setForm(prev => ({ ...prev, socialLinks: (prev.socialLinks || []).filter((_, i) => i !== idx) }));
                          }}>Remove</button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setForm(prev => ({ ...prev, socialLinks: [ ...(prev.socialLinks || []), { platform: '', url: '' } ] }));
                      }}>Add social link</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 d-flex align-items-center">
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                {message && <span className="ms-3">{message}</span>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
