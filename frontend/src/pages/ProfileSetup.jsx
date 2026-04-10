import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ───────────────────────── helpers ─────────────────────────── */

const GOALS = [
  { value: 'weight loss',  label: 'Weight Loss',  icon: '🔥', desc: 'Burn fat, feel lighter' },
  { value: 'muscle gain',  label: 'Muscle Gain',  icon: '💪', desc: 'Build strength & size' },
  { value: 'maintenance',  label: 'Maintenance',  icon: '⚖️', desc: 'Stay fit & balanced' },
];

const ACTIVITY_LEVELS = [
  { value: 'low',    label: 'Low — Sedentary',  icon: '🛋️', desc: 'Little to no exercise' },
  { value: 'medium', label: 'Medium — Moderate', icon: '🚶', desc: '3–5 days/week of moderate exercise' },
  { value: 'high',   label: 'High — Active',     icon: '🏃', desc: '6–7 days/week or intense training' },
];

const DIET_PREFS = [
  { value: 'vegetarian',     label: 'Vegetarian',     icon: '🥦' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
  { value: 'vegan',          label: 'Vegan',           icon: '🌱' },
];

/* ─────────────────────────────────────────────────────────────── */

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    age: '', gender: 'Male', height: '', weight: '',
    goal: 'weight loss', activityLevel: 'medium', dietaryPreference: 'vegetarian',
  });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  /* Pre-fill if profile exists */
  useEffect(() => {
    api.get('/profile/me')
      .then(res => {
        if (res.data.profile) {
          const p = res.data.profile;
          setFormData({
            age: p.age, gender: p.gender, height: p.height, weight: p.weight,
            goal: p.goal, activityLevel: p.activityLevel, dietaryPreference: p.dietaryPreference,
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/profile', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Profile setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading your profile…</span>
      </div>
    );
  }

  return (
    <div className="profile-setup-page animate-fade-up">
      {/* ── Page header ── */}
      <div className="profile-setup-header">
        <h1>Your Profile</h1>
        <p>We use this to calculate your BMI, daily calories, and personalised plans.</p>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-sm)', padding: '0.7rem 1rem',
            fontSize: '0.85rem', color: '#f87171', marginBottom: '1.25rem',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form" id="profile-form">

        {/* ── Section 1: Body Metrics ── */}
        <div className="profile-form-section">
          <div className="profile-form-section-title">
            <span>📏</span> Body Metrics
          </div>
          <div className="profile-form-grid">
            {/* Age */}
            <div className="form-group">
              <label htmlFor="profile-age">Age (years)</label>
              <input
                id="profile-age"
                type="number" min="10" max="100" required
                placeholder="e.g. 25"
                className="form-control"
                value={formData.age}
                onChange={e => set('age', e.target.value)}
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="profile-gender">Gender</label>
              <select id="profile-gender" className="form-control" value={formData.gender} onChange={e => set('gender', e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Prefer not to say</option>
              </select>
            </div>

            {/* Height */}
            <div className="form-group">
              <label htmlFor="profile-height">Height (cm)</label>
              <input
                id="profile-height"
                type="number" min="100" max="250" required
                placeholder="e.g. 175"
                className="form-control"
                value={formData.height}
                onChange={e => set('height', e.target.value)}
              />
            </div>

            {/* Weight */}
            <div className="form-group">
              <label htmlFor="profile-weight">Current Weight (kg)</label>
              <input
                id="profile-weight"
                type="number" min="30" max="300" step="0.1" required
                placeholder="e.g. 72"
                className="form-control"
                value={formData.weight}
                onChange={e => set('weight', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Fitness Goal ── */}
        <div className="profile-form-section">
          <div className="profile-form-section-title">
            <span>🎯</span> Fitness Goal
          </div>
          <div className="radio-card-group">
            {GOALS.map(g => (
              <div className="radio-card" key={g.value}>
                <input
                  type="radio"
                  id={`goal-${g.value}`}
                  name="goal"
                  value={g.value}
                  checked={formData.goal === g.value}
                  onChange={() => set('goal', g.value)}
                />
                <label className="radio-card-label" htmlFor={`goal-${g.value}`}>
                  <span className="radio-dot" />
                  <span style={{ fontSize: '1.2rem' }}>{g.icon}</span>
                  <span>
                    <span style={{ fontWeight: 700 }}>{g.label}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>— {g.desc}</span>
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Activity Level ── */}
        <div className="profile-form-section">
          <div className="profile-form-section-title">
            <span>🏃</span> Activity Level
          </div>
          <div className="radio-card-group">
            {ACTIVITY_LEVELS.map(a => (
              <div className="radio-card" key={a.value}>
                <input
                  type="radio"
                  id={`activity-${a.value}`}
                  name="activityLevel"
                  value={a.value}
                  checked={formData.activityLevel === a.value}
                  onChange={() => set('activityLevel', a.value)}
                />
                <label className="radio-card-label" htmlFor={`activity-${a.value}`}>
                  <span className="radio-dot" />
                  <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                  <span>
                    <span style={{ fontWeight: 700 }}>{a.label}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>— {a.desc}</span>
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: Dietary Preference ── */}
        <div className="profile-form-section">
          <div className="profile-form-section-title">
            <span>🥗</span> Dietary Preference
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {DIET_PREFS.map(d => (
              <label
                key={d.value}
                htmlFor={`diet-${d.value}`}
                style={{
                  flex: '1 1 140px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: formData.dietaryPreference === d.value
                    ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${formData.dietaryPreference === d.value ? 'rgba(124,58,237,0.5)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontSize: '0.875rem',
                  fontWeight: formData.dietaryPreference === d.value ? 700 : 500,
                  color: formData.dietaryPreference === d.value ? '#a78bfa' : 'var(--color-text)',
                  textAlign: 'center',
                }}
              >
                <input
                  type="radio"
                  id={`diet-${d.value}`}
                  name="dietaryPreference"
                  value={d.value}
                  style={{ display: 'none' }}
                  checked={formData.dietaryPreference === d.value}
                  onChange={() => set('dietaryPreference', d.value)}
                />
                <span style={{ fontSize: '1.8rem' }}>{d.icon}</span>
                {d.label}
              </label>
            ))}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          id="profile-submit"
          type="submit"
          className="btn btn-primary btn-full btn-lg"
          disabled={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              Saving…
            </>
          ) : '💾 Save Profile & Get My Plan →'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
