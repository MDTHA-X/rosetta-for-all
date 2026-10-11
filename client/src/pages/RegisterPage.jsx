import React, { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const AVATAR_PRESETS = [
  { name: 'Khadiza Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=khadiza' },
  { name: 'Tanjim Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=tanjim' },
  { name: 'Cyber Hero', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber' },
  { name: 'Alex Spark', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex' },
  { name: 'Sarah Star', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah' },
  { name: 'Neon Scout', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=neon' },
  { name: 'Quantum Core', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum' },
  { name: 'Astra Pulse', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=astra' }
];

export default function RegisterPage() {
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    avatar: AVATAR_PRESETS[0].url,
    agreeTerms: true
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [customSeed, setCustomSeed] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'None', color: 'rgba(255,255,255,0.1)' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 1, text: 'Weak', color: '#ef4444' };
      case 2:
        return { score: 2, text: 'Fair', color: '#f97316' };
      case 3:
        return { score: 3, text: 'Good', color: '#eab308' };
      case 4:
      default:
        return { score: 4, text: 'Strong 🔒', color: '#10b981' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const next = { ...prev, [name]: val };
      // Auto-suggest username if user hasn't typed custom username yet
      if (name === 'name' && (!prev.username || prev.username === prev.name.toLowerCase().replace(/\s+/g, ''))) {
        next.username = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      return next;
    });

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (localError) setLocalError('');
    if (authError) clearError();
  };

  const handleSelectAvatar = (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
  };

  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const newUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    setFormData((prev) => ({ ...prev, avatar: newUrl }));
    setCustomSeed(randomSeed);
  };

  // 1-Click Test Presets
  const applyPreset = (presetKey) => {
    const timestamp = Date.now().toString().slice(-4);
    if (presetKey === 'khadiza') {
      setFormData({
        name: 'Khadiza Akter',
        email: `khadiza_${timestamp}@rosetta.local`,
        username: `khadiza_${timestamp}`,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'User',
        avatar: AVATAR_PRESETS[0].url,
        agreeTerms: true
      });
    } else if (presetKey === 'tanjim') {
      setFormData({
        name: 'Md. Tanjim Hossen',
        email: `tanjim_${timestamp}@rosetta.local`,
        username: `tanjim_${timestamp}`,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'Admin',
        avatar: AVATAR_PRESETS[1].url,
        agreeTerms: true
      });
    } else if (presetKey === 'random') {
      const id = Math.floor(100 + Math.random() * 900);
      setFormData({
        name: `Tester CSE ${id}`,
        email: `evaluator_${id}_${timestamp}@rosetta.local`,
        username: `tester_${id}`,
        password: 'SecurePass@123',
        confirmPassword: 'SecurePass@123',
        role: id % 2 === 0 ? 'Admin' : 'User',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=tester_${id}`,
        agreeTerms: true
      });
    }
    setFieldErrors({});
    setLocalError('');
    clearError();
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email format (e.g. user@rosetta.local)';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must agree to the Code of Conduct';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLocalError('');
    clearError();

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      username: formData.username.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
      avatar: formData.avatar
    });

    setIsSubmitting(false);

    if (result.success) {
      setRegisteredUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim().toLowerCase(),
        role: formData.role,
        avatar: formData.avatar
      });

      // Automatically redirect after 3 seconds
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 3000);
    } else {
      setLocalError(result.error || 'Registration failed. Please try again.');
    }
  };

  const displayError = localError || authError;

  // Celebratory view upon successful registration
  if (registeredUser) {
    return (
      <div className="auth-wrapper" style={{ padding: '40px 16px' }}>
        <Card className="auth-card" style={{ maxWidth: 540 }}>
          <div className="success-celebration-card">
            <div className="success-icon-badge">🎉</div>
            <h1 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: 8 }}>
              Account Created Successfully!
            </h1>
            <p style={{ color: 'var(--dc-text-muted)', fontSize: '0.92rem', marginBottom: 24 }}>
              Welcome to the Rosetta Developer Workspace, <strong style={{ color: '#ffffff' }}>{registeredUser.name}</strong>.
            </p>

            <div
              style={{
                background: 'rgba(20, 10, 16, 0.85)',
                border: '1px solid var(--color-maroon-bright)',
                borderRadius: 14,
                padding: '20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 8px 24px rgba(128, 0, 0, 0.3)'
              }}
            >
              <img
                src={registeredUser.avatar}
                alt={registeredUser.name}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '3px solid #10b981',
                  background: '#09080b'
                }}
              />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                    {registeredUser.name}
                  </span>
                  <span className={`badge ${registeredUser.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                    {registeredUser.role}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--dc-text-muted)' }}>
                  @{registeredUser.username} • {registeredUser.email}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: 4 }}>
                  ● Authenticated & JWT Stored
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#fecdd3', marginBottom: 20 }}>
              🚀 Redirecting to workspace in <strong>3 seconds</strong>...
            </p>

            <Button
              variant="primary"
              fullWidth={true}
              onClick={() => navigate('/app', { replace: true })}
            >
              Enter Workspace Now →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-wrapper" style={{ padding: '40px 16px' }}>
      <Card className="auth-card" style={{ maxWidth: 580 }}>
        {/* 1-Click Test Presets */}
        <div className="demo-accounts-box" style={{ marginTop: 0, marginBottom: 20 }}>
          <div className="demo-title">
            <span>⚡ 1-Click Test & Grading Presets</span>
            <span style={{ fontSize: '0.7rem', color: '#fda4af' }}>Autofill Evaluator Data</span>
          </div>
          <div className="demo-buttons-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => applyPreset('khadiza')}
              title="Autofill as Khadiza Akter (Member)"
            >
              <strong style={{ color: '#ffffff' }}>Khadiza Akter</strong>
              <span className="demo-role">Member (Roll 367)</span>
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => applyPreset('tanjim')}
              title="Autofill as Tanjim Hossen (Admin)"
            >
              <strong style={{ color: '#ffffff' }}>Tanjim Hossen</strong>
              <span className="demo-role">Admin (Roll 340)</span>
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => applyPreset('random')}
              title="Autofill random unique user to test without 409 duplicate errors"
            >
              <strong style={{ color: '#6ee7b7' }}>🎲 Random User</strong>
              <span className="demo-role">Unique Instant Test</span>
            </button>
          </div>
        </div>

        <div className="auth-header" style={{ marginBottom: 20 }}>
          <h1>Create an Account</h1>
          <p>Join the Rosetta Workspace with Full Role Administration</p>
        </div>

        {displayError && (
          <Alert
            type="error"
            message={displayError}
            onClose={() => {
              setLocalError('');
              clearError();
            }}
          />
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Avatar Picker & Live Preview */}
          <div className="avatar-selector-box">
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🎨 Choose Your Avatar</span>
              <button
                type="button"
                onClick={handleRandomAvatar}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f43f5e',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                🎲 Shuffle Random
              </button>
            </div>

            <div className="avatar-preview-wrapper">
              <img
                src={formData.avatar}
                alt="Selected avatar"
                className="avatar-preview-img"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: '#d1c9cc', marginBottom: 6 }}>
                  Select a preset character or click shuffle for a unique bot seed:
                </div>
                <div className="avatar-chips-grid">
                  {AVATAR_PRESETS.map((preset) => (
                    <img
                      key={preset.url}
                      src={preset.url}
                      alt={preset.name}
                      title={preset.name}
                      className={`avatar-chip ${formData.avatar === preset.url ? 'active' : ''}`}
                      onClick={() => handleSelectAvatar(preset.url)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <Input
            label="Full Name"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Khadiza Akter"
            required
            error={fieldErrors.name}
            disabled={isSubmitting}
          />

          {/* Email & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@rosetta.local"
              required
              error={fieldErrors.email}
              disabled={isSubmitting}
            />

            <Input
              label="Username"
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. khadiza367"
              required
              error={fieldErrors.username}
              disabled={isSubmitting}
            />
          </div>

          {/* Password with Strength Meter */}
          <div>
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              error={fieldErrors.password}
              disabled={isSubmitting}
            />

            {formData.password && (
              <div className="strength-meter-wrapper">
                <div className="strength-meter-bar">
                  <div
                    className="strength-segment"
                    style={{ background: strength.score >= 1 ? strength.color : 'rgba(255,255,255,0.1)' }}
                  />
                  <div
                    className="strength-segment"
                    style={{ background: strength.score >= 2 ? strength.color : 'rgba(255,255,255,0.1)' }}
                  />
                  <div
                    className="strength-segment"
                    style={{ background: strength.score >= 3 ? strength.color : 'rgba(255,255,255,0.1)' }}
                  />
                  <div
                    className="strength-segment"
                    style={{ background: strength.score >= 4 ? strength.color : 'rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div className="strength-label">
                  <span>Security Strength: <strong style={{ color: strength.color }}>{strength.text}</strong></span>
                  <span>{formData.password.length >= 6 ? '✓ Valid Length' : 'Min 6 Chars'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            error={fieldErrors.confirmPassword}
            helperText={
              formData.confirmPassword && formData.password === formData.confirmPassword
                ? '✅ Passwords match'
                : ''
            }
            disabled={isSubmitting}
          />

          {/* Role Selection Cards */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Role & Access Level</label>
            <div className="role-cards-grid">
              <div
                className={`role-select-card ${formData.role === 'User' ? 'active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'User' }))}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                    👤 Member (User)
                  </span>
                  <input
                    type="radio"
                    name="role"
                    value="User"
                    checked={formData.role === 'User'}
                    onChange={handleChange}
                  />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--dc-text-muted)', lineHeight: 1.3 }}>
                  Create and update project cards, browse channels, and collaborate.
                </span>
              </div>

              <div
                className={`role-select-card ${formData.role === 'Admin' ? 'active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'Admin' }))}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#fecdd3', fontSize: '0.9rem' }}>
                    🛡️ Administrator
                  </span>
                  <input
                    type="radio"
                    name="role"
                    value="Admin"
                    checked={formData.role === 'Admin'}
                    onChange={handleChange}
                  />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--dc-text-muted)', lineHeight: 1.3 }}>
                  Full privileges: delete cards, manage system boards, and audit security.
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Honor Code */}
          <div style={{ marginBottom: 22 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: '0.84rem',
                color: '#d1c9cc',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                style={{ marginTop: 2 }}
              />
              <span>
                I agree to adhere to the <strong>Rosetta Code of Conduct</strong> and Jahangirnagar University CSE Academic Integrity Guidelines.
              </span>
            </label>
            {fieldErrors.agreeTerms && (
              <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                {fieldErrors.agreeTerms}
              </span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            isLoading={isSubmitting}
          >
            Complete Registration & Enter Workspace
          </Button>
        </form>

        <div
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--dc-text-muted)'
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#fda4af',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Sign in here →
          </Link>
        </div>
      </Card>
    </div>
  );
}
