import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">⚡</div>
        <div>
          <span>Rosetta</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--dc-text-muted)', marginLeft: 8, fontWeight: 400 }}>
            CSE-JU
          </span>
        </div>
      </Link>

      <nav className="navbar-nav">
        {isAuthenticated ? (
          <>
            <Link
              to="/app"
              className={`nav-link ${location.pathname === '/app' ? 'active' : ''}`}
            >
              Workspace
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
                alt={user?.name || 'User avatar'}
                style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                {user?.name || user?.username}
              </span>
              <span className={`badge ${user?.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                {user?.role || 'User'}
              </span>
              <span className="status-dot status-online" title="Online" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
