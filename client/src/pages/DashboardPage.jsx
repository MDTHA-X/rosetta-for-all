import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import * as authApi from '../api/auth';

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await authApi.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Failed to load users:', err.message);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Hero Welcome */}
      <Card
        style={{
          padding: 28,
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
        glow={true}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
            alt={user?.name}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '3px solid var(--dc-brand)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                Welcome, {user?.name}!
              </h1>
              <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
                {user?.role || 'User'}
              </span>
            </div>
            <p style={{ color: 'var(--dc-text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
              {user?.email} • @{user?.username} • <span style={{ color: '#10b981' }}>● Online</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Week 1 Status Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Tanjim's 70% Scope Box */}
        <Card style={{ padding: 24, borderTop: '4px solid #800000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fecdd3', textTransform: 'uppercase' }}>
              Week 1 Completed Work (70%)
            </span>
            <span className="badge badge-admin">Completed</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>
            Tanjim Hossen (Roll 340)
          </h2>
          <p style={{ color: 'var(--dc-text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
            Core backend repair, data layer fallback, authentication consolidation, React routing foundation & Sign-In page.
          </p>
          <ul style={{ paddingLeft: 18, color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.8 }}>
            <li>✔ In-Memory MongoDB auto-fallback for clean clone</li>
            <li>✔ Duplicate auth routes removed & consolidated</li>
            <li>✔ 148 Automated test cases passing (Newman + RBAC)</li>
            <li>✔ React Router + AuthContext architecture</li>
            <li>✔ Modern Vanilla CSS UI Component System</li>
            <li>✔ Complete production-ready Sign-In Page</li>
          </ul>
        </Card>

        {/* Khadiza's 30% Scope Box */}
        <Card style={{ padding: 24, borderTop: '4px solid #ea580c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase' }}>
              Week 1 Remaining Work (30%)
            </span>
            <span style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', border: '1px solid #ea580c' }} className="badge">
              Assigned
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>
            Khadiza Akter (Roll 367)
          </h2>
          <p style={{ color: 'var(--dc-text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
            Front-end implementation of registration UI, custom avatar integration, client-side validation rules & PR creation.
          </p>
          <ul style={{ paddingLeft: 18, color: '#fed7aa', fontSize: '0.85rem', lineHeight: 1.8 }}>
            <li>⏳ Register page UI refinement & styling</li>
            <li>⏳ Live validation rules (email regex, password length)</li>
            <li>⏳ Role selector (User / Admin) enhancement</li>
            <li>⏳ DiceBear avatar picker integration</li>
            <li>⏳ PR from <code>feature/week1-register-page</code> to <code>main</code></li>
          </ul>
        </Card>
      </div>

      {/* Team Member Directory */}
      <Card style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Active Workspace Members</h2>
            <p style={{ color: 'var(--dc-text-muted)', fontSize: '0.85rem' }}>
              Seeded user directory from Rosetta API
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700, background: 'rgba(128, 0, 0, 0.35)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(128, 0, 0, 0.5)' }}>
            {users.length} Registered
          </span>
        </div>

        {loadingUsers ? (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <LoadingSpinner size={24} message="Loading directory..." />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {users.map((u) => (
              <div
                key={u.id || u.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <img
                  src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username || 'member'}`}
                  alt={u.name}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.92rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--dc-text-muted)' }}>
                    @{u.username} • <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{u.role || 'User'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 5-Week Roadmap Status */}
      <Card style={{ padding: 24 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 14 }}>5-Week Roadmap Preview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div style={{ padding: 14, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>WEEK 1 • ACTIVE</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>Backend Fixes & Auth</div>
            <div style={{ fontSize: '0.8rem', color: '#a7f3d0', marginTop: 2 }}>70% Done by Tanjim • 30% Khadiza</div>
          </div>

          <div style={{ padding: 14, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dc-text-muted)' }}>WEEK 2</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>Channels & Live Chat</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)', marginTop: 2 }}>Categories, WebSockets, Online Status</div>
          </div>

          <div style={{ padding: 14, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dc-text-muted)' }}>WEEK 3</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>Trello Kanban Board</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)', marginTop: 2 }}>4 Columns, Drag-and-drop, WIP Limits</div>
          </div>

          <div style={{ padding: 14, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dc-text-muted)' }}>WEEK 4 & 5</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>Security & Deployment</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)', marginTop: 2 }}>Diagnostics, Hardening, Docker VPS</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
