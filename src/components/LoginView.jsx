import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { signIn, signUp } from '../api';
import './LoginView.css';

export default function LoginView({ onLoginSuccess, onEmailLogin }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors([]);
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await signUp(name, email, password);
        setSuccess('Account created! Signing you in…');
        // Auto-sign in after signup
        setTimeout(() => {
          onEmailLogin(res.user);
        }, 800);
      } else {
        const res = await signIn(email, password);
        onEmailLogin(res.user);
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong';
      // Check for multiple error details
      if (msg.includes(',')) {
        setErrors(msg.split(',').map(s => s.trim()));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { label: '8+ characters', test: password.length >= 8 },
    { label: 'Uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Number', test: /[0-9]/.test(password) },
    { label: 'Special character', test: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password) },
  ];

  return (
    <div className="login-container fade-in">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🌿</span>
            <div className="logo-text">
              <h1>Amar Swarup</h1>
              <span className="logo-subtitle">Foundation</span>
            </div>
          </div>
          <h2>Admin Portal</h2>
          <p>Sign in to access the waste management dashboard.</p>
        </div>

        {/* Mode Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); setErrors([]); setSuccess(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setErrors([]); setSuccess(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Password strength indicator during signup */}
          {mode === 'signup' && password.length > 0 && (
            <div className="password-requirements">
              {passwordRequirements.map((req) => (
                <span key={req.label} className={`req-item ${req.test ? 'met' : ''}`}>
                  {req.test ? '✓' : '○'} {req.label}
                </span>
              ))}
            </div>
          )}

          {/* Error messages */}
          {error && <div className="auth-error">{error}</div>}
          {errors.length > 0 && (
            <div className="auth-error">
              {errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}

          {/* Success message */}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Google Sign In */}
        <div className="login-action">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={() => {
              setError('Google sign-in failed. Try email/password instead.');
            }}
            useOneTap
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
            size="large"
          />
        </div>

        <div className="login-footer">
          <p>Secure access restricted to Amar Swarup Administration.</p>
        </div>
      </div>
    </div>
  );
}
