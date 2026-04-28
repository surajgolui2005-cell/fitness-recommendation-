import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

/* ───────────── BMI helpers ───────────────────────────────── */

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', cls: 'badge-cyan',   pct: Math.max(4, (bmi / 40) * 100) };
  if (bmi < 25)   return { label: 'Normal',      cls: 'badge-green',  pct: (bmi / 40) * 100 };
  if (bmi < 30)   return { label: 'Overweight',  cls: 'badge-amber',  pct: (bmi / 40) * 100 };
  return            { label: 'Obese',            cls: 'badge-red',    pct: Math.min(96, (bmi / 40) * 100) };
};

const MEAL_ICONS = {
  breakfast: '🌅',
  lunch:     '☀️',
  snacks:    '🍎',
  dinner:    '🌙',
};

const MEAL_ORDER = ['breakfast', 'lunch', 'snacks', 'dinner'];

/* ─────────────────────────────────────────────────────────── */

const Dashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile/me')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── AI Generation Loading Screen ── */
  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem',
        textAlign: 'center',
      }}>
        {/* Animated logo glow */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0057FF, #00B8FF, #00E0C2, #2DFF9A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'spin 1.5s linear infinite',
          boxShadow: '0 0 40px rgba(0,184,255,0.4)',
          flexShrink: 0,
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
          }}>🤖</div>
        </div>

        {/* Title */}
        <div>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #00B8FF, #2DFF9A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
          }}>
            AI is personalizing your plan…
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            GPT-4o-mini is analyzing your profile and generating your custom recommendations
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '320px' }}>
          {[
            { icon: '📊', label: 'Calculating your calorie targets' },
            { icon: '🥗', label: 'Generating personalized diet plan' },
            { icon: '💪', label: 'Building your workout schedule' },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              animation: `fade-up 0.4s ease ${i * 0.15}s both`,
            }}>
              <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{step.label}</span>
              <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginLeft: 'auto', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── No profile ── */
  if (!data) {
    return (
      <div className="empty-state animate-fade-up">
        <div className="empty-state-icon">📋</div>
        <h2>No profile found</h2>
        <p>Set up your profile to get personalised fitness & diet recommendations.</p>
        <Link to="/profile-setup" className="btn btn-primary btn-lg" id="setup-profile-btn">
          Set Up My Profile →
        </Link>
      </div>
    );
  }

  const { profile, recommendations } = data;
  const { bmi, tdee, bmr } = profile.stats;
  const bmiInfo = getBmiCategory(Number(bmi));
  const firstName = profile.user?.name?.split(' ')[0] ?? 'there';

  /* Goal label capitalised */
  const goalLabel = profile.goal
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="dashboard-page animate-fade-up">

      {/* ────────── Header ────────── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            Hey, <span>{firstName}</span> 👋
          </h1>
          <p className="dashboard-meta">
            Goal: <strong>{goalLabel}</strong> &nbsp;·&nbsp;
            Diet: <strong style={{ textTransform: 'capitalize' }}>{profile.dietaryPreference}</strong> &nbsp;·&nbsp;
            Activity: <strong style={{ textTransform: 'capitalize' }}>{profile.activityLevel}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/progress"      className="btn btn-outline" id="view-progress-btn">📈 Progress</Link>
          <Link to="/profile-setup" className="btn btn-ghost"   id="edit-profile-btn">✏️ Edit Profile</Link>
        </div>
      </div>

      {/* ────────── Stat cards ────────── */}
      <div className="stats-grid">

        {/* BMI */}
        <div className="stat-card stat-violet animate-fade-up delay-100">
          <div className="stat-card-icon">⚡</div>
          <div className="stat-card-label">BMI</div>
          <div className="stat-card-value">
            {bmi}
            <span className="stat-card-unit">
              <span className={`badge ${bmiInfo.cls}`} style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
                {bmiInfo.label}
              </span>
            </span>
          </div>
          {/* BMI bar */}
          <div className="bmi-bar-wrap">
            <div className="bmi-bar-track">
              <div className="bmi-bar-marker" style={{ left: `${bmiInfo.pct}%` }} />
            </div>
            <div className="bmi-bar-labels">
              <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
            </div>
          </div>
        </div>

        {/* Daily Calories */}
        <div className="stat-card stat-cyan animate-fade-up delay-150">
          <div className="stat-card-icon">🔥</div>
          <div className="stat-card-label">Daily Target Calories</div>
          <div className="stat-card-value">
            {tdee?.toLocaleString()}
            <span className="stat-card-unit">kcal</span>
          </div>
          <div className="stat-card-sublabel">BMR: {Math.round(bmr)} kcal/day (base metabolic rate)</div>
        </div>

        {/* Weight */}
        <div className="stat-card stat-green animate-fade-up delay-200">
          <div className="stat-card-icon">⚖️</div>
          <div className="stat-card-label">Current Weight</div>
          <div className="stat-card-value">
            {profile.weight}
            <span className="stat-card-unit">kg</span>
          </div>
          <div className="stat-card-sublabel">Height: {profile.height} cm &nbsp;·&nbsp; Age: {profile.age} yrs</div>
        </div>

        {/* Weight history count */}
        <div className="stat-card stat-amber animate-fade-up delay-250">
          <div className="stat-card-icon">📅</div>
          <div className="stat-card-label">Check-ins Logged</div>
          <div className="stat-card-value">{profile.weightHistory?.length ?? 1}</div>
          <div className="stat-card-sublabel">
            <Link to="/progress" style={{ color: 'var(--accent-warn)', fontWeight: 600 }}>Log a new entry →</Link>
          </div>
        </div>
      </div>

      {/* ────────── Diet + Workout ────────── */}
      <div className="reco-grid">

        {/* ── Diet Plan ── */}
        <div className="diet-section animate-fade-up delay-300">
          <div className="section-header" style={{ background: 'rgba(16,185,129,0.07)' }}>
            <span className="section-header-icon">🥗</span>
            <div>
              <h2>Your Diet Plan</h2>
              <p style={{ textTransform: 'capitalize' }}>{profile.dietaryPreference} · {goalLabel}</p>
            </div>
          </div>
          <div className="diet-section-body">
            {MEAL_ORDER.map(meal => (
              <div className="meal-row" key={meal}>
                <span className="meal-time-icon">{MEAL_ICONS[meal]}</span>
                <div className="meal-info">
                  <div className="meal-label">{meal}</div>
                  <div className="meal-text">{recommendations.dietPlan[meal]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Workout Plan ── */}
        <div className="workout-section animate-fade-up delay-350">
          <div className="section-header" style={{ background: 'rgba(124,58,237,0.07)' }}>
            <span className="section-header-icon">💪</span>
            <div>
              <h2>Your Workout Routine</h2>
              <p>{goalLabel} · {profile.activityLevel} activity</p>
            </div>
          </div>
          <div className="workout-section-body">
            {recommendations.workoutPlan.map((w, idx) => (
              <div className="workout-row" key={idx}>
                <div className="workout-num">{idx + 1}</div>
                <div className="workout-info">
                  <div className="workout-day">{w.day}</div>
                  <div className="workout-activity">{w.activity}</div>
                  <div className="workout-detail">{w.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ padding: '0 1.4rem 1rem', fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>
            * Plans are dynamically generated based on your profile. Update anytime.
          </p>
        </div>
      </div>

      {/* ────────── Quick Tips ────────── */}
      <div
        className="animate-fade-up delay-400"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.1rem' }}>💡</span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
            Quick Tips for {goalLabel}
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {profile.goal === 'weight loss' && [
            ['💧', 'Hydration', 'Drink 8–10 glasses of water daily to boost metabolism.'],
            ['😴', 'Sleep',     '7–9 hours of quality sleep regulates hunger hormones.'],
            ['🍽️', 'Portions',  'Use smaller plates and eat slowly to avoid overeating.'],
          ].map(([icon, title, text]) => (
            <div key={title} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{icon}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.2rem' }}>{title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
          {profile.goal === 'muscle gain' && [
            ['🥩', 'Protein',      'Target 1.6–2.2g of protein per kg of bodyweight daily.'],
            ['📈', 'Progressive',  'Increase weights gradually each week (progressive overload).'],
            ['😴', 'Recovery',     'Muscles grow during rest — never skip rest days.'],
          ].map(([icon, title, text]) => (
            <div key={title} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{icon}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.2rem' }}>{title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
          {profile.goal === 'maintenance' && [
            ['🔄', 'Consistency', 'Show up even when motivation is low — habits beat motivation.'],
            ['🥗', 'Variety',     'Rotate meals to ensure you get a wide range of micronutrients.'],
            ['🧘', 'Mindfulness', 'Stress management is key to avoiding emotional eating.'],
          ].map(([icon, title, text]) => (
            <div key={title} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{icon}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.2rem' }}>{title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
