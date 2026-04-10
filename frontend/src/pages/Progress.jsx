import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Dot,
} from 'recharts';
import api from '../api';

/* ─── Custom tooltip for recharts ────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border-2)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.6rem 0.9rem',
        fontSize: '0.85rem',
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{label}</p>
        <p style={{ color: '#a78bfa', fontWeight: 700 }}>{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

/* ─── Delta helper ─────────────────────────────────────────── */
const getDelta = (curr, prev) => {
  if (prev == null) return null;
  const d = (curr - prev).toFixed(1);
  return d;
};

/* ─────────────────────────────────────────────────────────── */

const Progress = () => {
  const [history,     setHistory]     = useState([]);
  const [newWeight,   setNewWeight]   = useState('');
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [noProfile,   setNoProfile]   = useState(false);
  const [toast,       setToast]       = useState(null);

  /* Helper: show a temporary toast */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Fetch initial profile */
  useEffect(() => {
    api.get('/profile/me')
      .then(res => {
        const entries = res.data.profile?.weightHistory ?? [];
        setHistory(entries);
      })
      .catch(err => {
        if (err.response?.status === 400) setNoProfile(true);
      })
      .finally(() => setLoading(false));
  }, []);

  /* Log new weight */
  const handleLog = async (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight) || Number(newWeight) <= 0) {
      showToast('Please enter a valid weight.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/profile/weight', { weight: Number(newWeight) });
      setHistory(res.data.weightHistory);
      setNewWeight('');
      showToast(`✅ Weight ${newWeight} kg logged successfully!`);
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to log weight.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* Build chart data */
  const chartData = history.map((entry, idx) => ({
    name: entry.date
      ? new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : `Entry ${idx + 1}`,
    weight: entry.weight,
  }));

  /* Summary stats */
  const firstWeight = history[0]?.weight;
  const lastWeight  = history[history.length - 1]?.weight;
  const totalChange = history.length > 1 ? (lastWeight - firstWeight).toFixed(1) : null;
  const minWeight   = history.length ? Math.min(...history.map(e => e.weight)) : null;
  const maxWeight   = history.length ? Math.max(...history.map(e => e.weight)) : null;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading progress data…</span>
      </div>
    );
  }

  /* ── No profile ── */
  if (noProfile) {
    return (
      <div className="empty-state animate-fade-up">
        <div className="empty-state-icon">📋</div>
        <h2>Profile Required</h2>
        <p>You need to set up your profile before tracking progress.</p>
        <Link to="/profile-setup" className="btn btn-primary btn-lg" id="setup-profile-from-progress-btn">
          Set Up Profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="progress-page animate-fade-up">

      {/* ── Toast ── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="progress-header">
        <h1>📈 Weight Progress</h1>
        <p>Track your weight over time to stay accountable and celebrate your wins.</p>
      </div>

      {/* ── Summary stats ── */}
      {history.length > 1 && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card stat-violet animate-fade-up delay-100">
            <div className="stat-card-label">Total Change</div>
            <div className="stat-card-value" style={{ fontSize: '2rem' }}>
              {totalChange > 0 ? '+' : ''}{totalChange}
              <span className="stat-card-unit">kg</span>
            </div>
            <div className="stat-card-sublabel">Since first entry</div>
          </div>
          <div className="stat-card stat-green animate-fade-up delay-150">
            <div className="stat-card-label">Lowest Weight</div>
            <div className="stat-card-value" style={{ fontSize: '2rem' }}>
              {minWeight}<span className="stat-card-unit">kg</span>
            </div>
            <div className="stat-card-sublabel">Best recorded</div>
          </div>
          <div className="stat-card stat-amber animate-fade-up delay-200">
            <div className="stat-card-label">Highest Weight</div>
            <div className="stat-card-value" style={{ fontSize: '2rem' }}>
              {maxWeight}<span className="stat-card-unit">kg</span>
            </div>
            <div className="stat-card-sublabel">Peak recorded</div>
          </div>
          <div className="stat-card stat-cyan animate-fade-up delay-250">
            <div className="stat-card-label">Entries Logged</div>
            <div className="stat-card-value" style={{ fontSize: '2rem' }}>{history.length}</div>
            <div className="stat-card-sublabel">Keep it up! 🎉</div>
          </div>
        </div>
      )}

      {/* ── Log new weight ── */}
      <div className="log-form-card animate-fade-up delay-200">
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          📝 Log Today's Weight
        </h3>
        <form onSubmit={handleLog} id="log-weight-form">
          <div className="log-form-row">
            <div className="form-group">
              <label htmlFor="new-weight-input">Weight (kg)</label>
              <input
                id="new-weight-input"
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder="e.g. 74.5"
                className="form-control"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                required
              />
            </div>
            <button
              id="log-weight-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flexShrink: 0 }}
            >
              {submitting ? (
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : '+ Log Weight'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Chart ── */}
      {chartData.length >= 2 ? (
        <div className="chart-wrap animate-fade-up delay-300">
          <h3>Weight Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
                tickFormatter={v => `${v} kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              {lastWeight && (
                <ReferenceLine
                  y={lastWeight}
                  stroke="rgba(124,58,237,0.3)"
                  strokeDasharray="4 3"
                  label={{ value: 'Current', position: 'right', fill: '#8b949e', fontSize: 11 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                dot={(props) => {
                  const isLast = props.index === chartData.length - 1;
                  return (
                    <Dot
                      {...props}
                      r={isLast ? 6 : 4}
                      fill={isLast ? '#a78bfa' : '#7c3aed'}
                      stroke="var(--color-bg)"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, fill: '#06b6d4', stroke: 'var(--color-bg)', strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : history.length === 1 ? (
        <div
          className="animate-fade-up delay-300"
          style={{
            textAlign: 'center', padding: '2.5rem', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem', color: 'var(--color-text-muted)',
          }}
        >
          <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</p>
          <p>Log at least <strong>2 entries</strong> to see your progress chart.</p>
        </div>
      ) : null}

      {/* ── History table ── */}
      {history.length > 0 && (
        <div className="weight-list animate-fade-up delay-350">
          <div className="section-header">
            <span className="section-header-icon">🗓️</span>
            <div>
              <h2>Weight History</h2>
              <p>{history.length} {history.length === 1 ? 'entry' : 'entries'} recorded</p>
            </div>
          </div>
          <div className="weight-list-header">
            <span>#</span>
            <span>Date</span>
            <span>Weight</span>
            <span>Change</span>
          </div>
          {[...history].reverse().map((entry, i, arr) => {
            const origIdx  = history.length - 1 - i;
            const prevEntry = origIdx > 0 ? history[origIdx - 1] : null;
            const delta     = getDelta(entry.weight, prevEntry?.weight);
            const dateStr   = entry.date
              ? new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—';
            return (
              <div className="weight-list-item" key={i}>
                <div className="weight-idx">{origIdx + 1}</div>
                <div className="weight-date">{dateStr}</div>
                <div className="weight-val">{entry.weight} kg</div>
                <div>
                  {delta === null ? (
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>First Entry</span>
                  ) : Number(delta) > 0 ? (
                    <span className="weight-delta-pos">▲ +{delta} kg</span>
                  ) : Number(delta) < 0 ? (
                    <span className="weight-delta-neg">▼ {delta} kg</span>
                  ) : (
                    <span className="weight-delta-neu">— No change</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {history.length === 0 && (
        <div className="empty-state animate-fade-up delay-300">
          <div className="empty-state-icon">📉</div>
          <h2>No entries yet</h2>
          <p>Log your first weight entry above to start tracking.</p>
        </div>
      )}

    </div>
  );
};

export default Progress;
