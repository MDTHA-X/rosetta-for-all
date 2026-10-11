import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function LoginPage() {
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoAccounts = [
    { name: 'Tanjim Hossen', email: 'tanjim@rosetta.local', role: 'Admin (Roll 340)', pwd: 'password123', icon: '🛡️' },
    { name: 'Alex Rivera', email: 'alex@rosetta.local', role: 'Lead Developer', pwd: 'password123', icon: '💻' },
    { name: 'Sarah Chen', email: 'sarah@rosetta.local', role: 'Product Designer', pwd: 'password123', icon: '🎨' },
    { name: 'Marcus Vance', email: 'marcus@rosetta.local', role: 'QA Engineer', pwd: 'password123', icon: '🔍' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (localError) setLocalError('');
    if (authError) clearError();
  };

  const handleSelectDemo = (account) => {
    setFormData({
      identifier: account.email,
      password: account.pwd
    });
    setFieldErrors({});
    setLocalError('');
    clearError();
  };

  const validate = () => {
    const errors = {};
    if (!formData.identifier.trim()) {
      errors.identifier = 'Email or username is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
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

    const result = await login({
      identifier: formData.identifier.trim(),
      password: formData.password
    });

    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLocalError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="auth-wrapper">
      <Card className="auth-card" glow={true}>
        <div className="auth-header">
          <div
            style={{
              display: 'inline-flex',
              padding: '10px 18px',
              background: 'rgba(128, 0, 0, 0.25)',
              borderRadius: 30,
              border: '1px solid rgba(128, 0, 0, 0.45)',
              marginBottom: 16
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
              🚀 Rosetta Platform • CSE-JU (Week 1)
            </span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your Discord + Trello workspace</p>
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
          <Input
            label="Email or Username"
            id="identifier"
            name="identifier"
            type="text"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="e.g. tanjim@rosetta.local"
            required
            error={fieldErrors.identifier}
            autoComplete="username"
            disabled={isSubmitting}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••••••"
            required
            error={fieldErrors.password}
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 20,
              marginTop: -6
            }}
          >
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--dc-text-muted)',
                cursor: 'pointer'
              }}
              title="Default password is password123 for all seeded demo accounts"
            >
              Default password: <code style={{ color: '#fda4af', fontWeight: 600 }}>password123</code>
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            isLoading={isSubmitting}
          >
            Sign In to Rosetta
          </Button>
        </form>

        <div className="demo-accounts-box">
          <div className="demo-title">
            <span>⚡ 1-Click Demo Accounts</span>
            <span style={{ fontSize: '0.7rem', color: '#fecdd3' }}>Tap to Autofill</span>
          </div>
          <div className="demo-buttons-grid">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="demo-pill-btn"
                onClick={() => handleSelectDemo(acc)}
              >
                <div style={{ fontWeight: 600, color: '#ffffff' }}>
                  {acc.icon} {acc.name.split(' ')[0]}
                </div>
                <div className="demo-role">{acc.role}</div>
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--dc-text-muted)'
          }}
        >
          Need a new account?{' '}
          <Link
            to="/register"
            style={{
              color: '#fda4af',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Create an Account →
          </Link>
        </div>
      </Card>
    </div>
  );
}
