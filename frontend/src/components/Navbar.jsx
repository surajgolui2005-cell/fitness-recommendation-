import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));

  /* Keep token state in sync when it changes across pages */
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" id="navbar-brand">
          <img
            src="/logo.png"
            alt="FitPick"
            style={{ height: '150px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Links */}
        <div className="navbar-links">
          {token ? (
            <>
              <Link
                to="/dashboard"
                id="nav-dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
                style={isActive('/dashboard') ? { color: 'var(--color-text)', background: 'rgba(255,255,255,0.07)' } : {}}
              >
                Dashboard
              </Link>
              <Link
                to="/progress"
                id="nav-progress"
                className={`nav-link ${isActive('/progress') ? 'nav-link-active' : ''}`}
                style={isActive('/progress') ? { color: 'var(--color-text)', background: 'rgba(255,255,255,0.07)' } : {}}
              >
                Progress
              </Link>
              <Link
                to="/profile-setup"
                id="nav-profile"
                className={`nav-link ${isActive('/profile-setup') ? 'nav-link-active' : ''}`}
                style={isActive('/profile-setup') ? { color: 'var(--color-text)', background: 'rgba(255,255,255,0.07)' } : {}}
              >
                Profile
              </Link>
              <button
                id="nav-logout"
                onClick={handleLogout}
                className="btn-nav-logout"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  id="nav-login"  className="nav-link">Login</Link>
              <Link
                to="/signup"
                id="nav-signup"
                className="btn btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-sm)' }}
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
