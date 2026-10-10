import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function RegisterPage() {
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'User'
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSpec, setShowSpec] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (localError) setLocalError('');
    if (authError) clearError();
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
      errors.email = 'Please enter a valid email format';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
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
      role: formData.role
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Account created successfully! Redirecting to workspace...');
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 1200);
    } else {
      setLocalError(result.error || 'Registration failed. Please try again.');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="auth-wrapper" style={{ padding: '40px 16px' }}>
      <Card className="auth-card" style={{ maxWidth: 540 }}>
        {/* Teammate Handoff Notice for Khadiza */}
        <div className="handoff-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="handoff-badge">Week 1 • Remaining 30% Task</span>
            <button
              type="button"
              onClick={() => setShowSpec(!showSpec)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fdba74',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showSpec ? 'Hide Task Spec' : 'Show Task Spec'}
            </button>
          </div>
          <div className="handoff-title">
            👤 Assigned To: Khadiza Akter (Roll 367 / Exam 231070)
          </div>
          <div className="handoff-desc">
            Complete the Register user interface, custom avatars, role toggle, and client-side validation rules.
          </div>

          {showSpec && (
            <div style={{ marginTop: 12, borderTop: '1px solid rgba(249, 115, 22, 0.2)', paddingTop: 10 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase' }}>
                📋 Acceptance Criteria Checklist:
              </div>
              <ul className="criteria-list">
                <li>✅ Validate email regex format & minimum 6 character password</li>
                <li>✅ Connect form to <code>useAuth().register()</code> hook</li>
                <li>✅ Handle <code>409 Conflict</code> (duplicate email error) gracefully</li>
                <li>✅ Role selection: <code>User</code> (default) vs <code>Admin</code></li>
                <li>✅ Auto-generate avatar seed or custom profile picture input</li>
                <li>✅ Redirect user seamlessly into <code>/app</code> workspace upon success</li>
              </ul>
            </div>
          )}
        </div>

        <div className="auth-header" style={{ marginBottom: 20 }}>
          <h1>Create an Account</h1>
          <p>Join the Rosetta Developer Workspace</p>
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

        {successMsg && <Alert type="success" message={successMsg} />}

        <form onSubmit={handleSubmit} noValidate>
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
              placeholder="e.g. khadiza"
              required
              error={fieldErrors.username}
              disabled={isSubmitting}
            />
          </div>

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
            helperText="At least 6 characters required for security"
            disabled={isSubmitting}
          />

          <div className="form-group">
            <label className="form-label">Role Selection</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: formData.role === 'User' ? 'rgba(128, 0, 0, 0.25)' : 'rgba(10, 10, 14, 0.8)',
                  border: `1px solid ${formData.role === 'User' ? 'var(--color-maroon-bright)' : 'rgba(255, 255, 255, 0.12)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="User"
                  checked={formData.role === 'User'}
                  onChange={handleChange}
                />
                <span>Member (User)</span>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: formData.role === 'Admin' ? 'rgba(128, 0, 0, 0.35)' : 'rgba(10, 10, 14, 0.8)',
                  border: `1px solid ${formData.role === 'Admin' ? 'var(--color-maroon-bright)' : 'rgba(255, 255, 255, 0.12)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={formData.role === 'Admin'}
                  onChange={handleChange}
                />
                <span>Administrator</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <Button
              type="submit"
              variant="primary"
              fullWidth={true}
              isLoading={isSubmitting}
            >
              Create Rosetta Account
            </Button>
          </div>
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
