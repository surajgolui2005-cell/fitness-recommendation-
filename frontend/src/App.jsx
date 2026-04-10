import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="page-content">
          <Routes>
            {/* Public routes */}
            <Route path="/"       element={<Home />} />
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/progress"      element={<Progress />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
