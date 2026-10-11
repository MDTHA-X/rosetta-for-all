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
      {/* Hero Welcome Card */}
      <Card
        style={{
          padding: 28,
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(20, 10, 16, 0.95) 0%, rgba(10, 6, 8, 0.95) 100%)',
          border: '1px solid var(--color-maroon-bright)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 8px 30px rgba(128, 0, 0, 0.35)'
        }}
        glow={true}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
            alt={user?.name}
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              border: '3px solid var(--color-maroon-bright)',
              boxShadow: '0 0 16px rgba(158, 18, 18, 0.55)',
              background: '#151016'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
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

      {/* Week 1 Overall Status Banner */}
      <Card style={{ padding: 24, marginBottom: 24, background: 'rgba(16, 12, 16, 0.9)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge" style={{ background: '#10b981', color: '#000000', fontWeight: 800 }}>
                100% COMPLETED
              </span>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>
                Week 1 Deliverables: 100% Finished & Verified
              </h2>
            </div>
            <p style={{ color: '#d1fae5', fontSize: '0.88rem', marginTop: 6, marginBottom: 0 }}>
              All 4 milestones from the Web Programming-II Proposal are delivered by the joint team.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>100%</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Week 1 Pass Rate: 190/190 Tests</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 10, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 5, overflow: 'hidden', marginTop: 16 }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #800000 0%, #9e1212 50%, #10b981 100%)',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)'
            }}
          />
        </div>
      </Card>

      {/* Week 1 Team Breakdown (Tanjim 70% & Khadiza 30%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Tanjim's 70% Scope Box */}
        <Card style={{ padding: 24, borderTop: '4px solid #800000', background: 'rgba(14, 10, 14, 0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fecdd3', textTransform: 'uppercase' }}>
              Phase 1 Deliverables (70%)
            </span>
            <span className="badge" style={{ background: '#800000', color: '#ffffff' }}>Completed ✅</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 8, color: '#ffffff' }}>
            Md. Tanjim Hossen Ahad (Roll 340 / Exam 231043)
          </h2>
          <p style={{ color: 'var(--dc-text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
            Core backend stabilization, in-memory MongoDB auto-fallback, authentication unification, React router architecture & Sign-In page.
          </p>
          <ul style={{ paddingLeft: 18, color: '#ffffff', fontSize: '0.85rem', lineHeight: 1.8 }}>
            <li>✔ In-Memory MongoDB auto-fallback in <code>db.js</code> for clean clones</li>
            <li>✔ Elimination of duplicate auth modules & routes</li>
            <li>✔ 190 Automated test assertions passing (Newman + RBAC)</li>
            <li>✔ React Router + AuthContext stateful architecture</li>
            <li>✔ White, Black & Maroon design system</li>
            <li>✔ Complete production-ready Sign-In Page with 1-click accounts</li>
          </ul>
        </Card>

        {/* Khadiza's 30% Scope Box */}
        <Card style={{ padding: 24, borderTop: '4px solid #10b981', background: 'rgba(14, 10, 14, 0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase' }}>
              Phase 2 Deliverables (30%)
            </span>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid #10b981' }}>
              Completed ✅
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 8, color: '#ffffff' }}>
            Khadiza Akter (Roll 367 / Exam 231070)
          </h2>
          <p style={{ color: 'var(--dc-text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
            Interactive User Registration Suite, Dynamic Avatar Engine, Real-time Password Strength Meter & Role Administration.
          </p>
          <ul style={{ paddingLeft: 18, color: '#ffffff', fontSize: '0.85rem', lineHeight: 1.8 }}>
            <li>✔ Complete Register Page UI with live form validation</li>
            <li>✔ Dynamic DiceBear Avatar Picker & Shuffle generator</li>
            <li>✔ 4-Tier Real-Time Password Security Strength Meter</li>
            <li>✔ Confirm Password matching & Honor Code consent</li>
            <li>✔ Role selection (Member vs Administrator) with permission cards</li>
            <li>✔ Celebratory account creation transition & auto-redirect</li>
          </ul>
        </Card>
      </div>

      {/* Team Member Directory */}
      <Card style={{ padding: 24, marginBottom: 24, background: 'rgba(14, 10, 14, 0.85)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Active Workspace Members</h2>
            <p style={{ color: 'var(--dc-text-muted)', fontSize: '0.85rem' }}>
              Live registered members seeded in Rosetta
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700, background: 'rgba(128, 0, 0, 0.35)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(158, 18, 18, 0.5)' }}>
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
                  background: 'rgba(20, 14, 20, 0.75)',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <img
                  src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username || 'member'}`}
                  alt={u.name}
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-maroon-bright)' }}
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
      <Card style={{ padding: 24, background: 'rgba(14, 10, 14, 0.85)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 14, color: '#ffffff' }}>5-Week Roadmap Tracker</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div style={{ padding: 14, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399' }}>WEEK 1 • 100% COMPLETE</div>
            <div style={{ fontWeight: 700, marginTop: 4, color: '#ffffff' }}>Backend Fixes, Auth & Registration</div>
            <div style={{ fontSize: '0.8rem', color: '#a7f3d0', marginTop: 2 }}>Tanjim (70%) & Khadiza (30%) Completed</div>
          </div>

          <div style={{ padding: 14, background: 'rgba(20, 14, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dc-text-muted)' }}>WEEK 2 • UP NEXT</div>
            <div style={{ fontWeight: 700, marginTop: 4, color: '#ffffff' }}>Channels & Live Chat</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)', marginTop: 2 }}>Categories, WebSockets, Online Status</div>
          </div>

          <div style={{ padding: 14, background: 'rgba(20, 14, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dc-text-muted)' }}>WEEK 3</div>
            <div style={{ fontWeight: 700, marginTop: 4, color: '#ffffff' }}>Trello Kanban Board</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)', marginTop: 2 }}>4 Columns, Drag-and-drop, WIP Limits</div>
          </div>

          <div style={{ padding: 14, background: 'rgba(20, 14, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dc-text-muted)' }}>WEEK 4 & 5</div>
            <div style={{ fontWeight: 700, marginTop: 4, color: '#ffffff' }}>Security & VPS Deployment</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--dc-text-muted)', marginTop: 2 }}>Diagnostics, Hardening, Docker Compose</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
