import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Redirector from './components/Redirector';
import { LogOut, User as UserIcon } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header>
      <Link to="/" className="logo">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
        Shorty
      </Link>
      <nav>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Shorten URL</Link>
        {user && <Link to="/dashboard" className={location.pathname === '/dashboard' || location.pathname === '/stats' ? 'active' : ''}>Dashboard</Link>}

        <div style={{ marginLeft: '12px', paddingLeft: '20px', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 700, fontSize: '14px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--input-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <UserIcon size={18} />
                </div>
                <span className="hide-mobile">{user.name}</span>
              </div>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hide-mobile">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 700, fontSize: '14px' }}>Login</Link>
              <Link to="/register" style={{ textDecoration: 'none', background: 'var(--accent)', color: 'white', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)' }}>Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/stats" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/:code" element={<Redirector />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
