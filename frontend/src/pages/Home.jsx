import React from 'react';
import { Link } from 'react-router-dom';

/* ─── Feature data ─────────────────────────────────────────── */
const features = [
  {
    icon: '⚡',
    iconClass: 'feature-icon-violet',
    title: 'Calorie Calculator',
    desc: 'Precise BMR & TDEE calculations using the Mifflin-St Jeor equation, adjusted for your activity level.',
  },
  {
    icon: '🥗',
    iconClass: 'feature-icon-green',
    title: 'Personalised Diet Plans',
    desc: 'Daily meal plans tailored to your dietary preference — vegan, vegetarian, or non-veg — and fitness goal.',
  },
  {
    icon: '💪',
    iconClass: 'feature-icon-cyan',
    title: 'Smart Workout Routines',
    desc: 'Goal-specific weekly workout schedules covering cardio, strength, and recovery days.',
  },
  {
    icon: '📈',
    iconClass: 'feature-icon-amber',
    title: 'Progress Tracking',
    desc: 'Log your weight over time and visualise your journey with an interactive progress chart.',
  },
];

/* ─── Stat pill data ───────────────────────────────────────── */
const stats = [
  { label: 'Users Tracking',  value: '12K+' },
  { label: 'Meals Planned',   value: '85K+' },
  { label: 'Calories Saved',  value: '2M+'  },
];

const Home = () => {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="home-hero animate-fade-in">
      {/* ── Eyebrow badge ── */}
      <div className="hero-eyebrow animate-fade-up">
        <span>✨</span>
        <span>AI-Powered Fitness & Nutrition</span>
      </div>

      {/* ── Headline ── */}
      <h1 className="hero-title animate-fade-up delay-100">
        Your Personal<br />
        <span>Health OS</span>
      </h1>

      {/* ── Sub-headline ── */}
      <p className="hero-subtitle animate-fade-up delay-200">
        Get scientifically calculated calorie targets, personalised meal plans, 
        and weekly workout routines — all based on your unique body and goals.
      </p>

      {/* ── CTA Buttons ── */}
      <div className="hero-cta animate-fade-up delay-300">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
            <Link to="/progress"  className="btn btn-outline btn-lg">View Progress</Link>
          </>
        ) : (
          <>
            <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free →</Link>
            <Link to="/login"  className="btn btn-outline btn-lg">Sign In</Link>
          </>
        )}
      </div>

      {/* ── Mini stats ── */}
      <div
        style={{ display: 'flex', gap: '2.5rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}
        className="animate-fade-up delay-400"
      >
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Feature cards ── */}
      <div className="features-grid animate-fade-up delay-400">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
