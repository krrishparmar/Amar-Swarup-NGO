import { useState } from 'react';
import { driverSignIn, driverSignUp, driverGoogleSignIn } from '../api';
import { GoogleLogin } from '@react-oauth/google';
import './DriverLoginView.css';

export default function DriverLoginView({ onDriverLogin, onSwitchToAdmin }) {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const passwordRequirements = [
    { label: '8+ characters', test: password.length >= 8 },
    { label: 'Uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Number', test: /[0-9]/.test(password) },
    { label: 'Special character', test: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\\/~`]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await driverSignUp({ name, email, phone, password, vehicleNumber });
        setSuccess('Account created! Signing you in…');
        setTimeout(() => onDriverLogin(res.driver), 800);
      } else {
        const res = await driverSignIn(email, password);
        onDriverLogin(res.driver);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await driverGoogleSignIn(credentialResponse.credential);
      onDriverLogin(res.driver);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-login-container fade-in">
      <div className="driver-login-card">
        <div className="driver-login-header">
          <div className="driver-login-logo">
            <span className="logo-icon">🚛</span>
            <div className="logo-text">
              <h1>Amar Swarup</h1>
              <span className="logo-subtitle">Driver Portal</span>
            </div>
          </div>
          <h2>Driver Login</h2>
          <p>Sign in to view and manage your assigned pickups.</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
          >Sign In</button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
          >Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="auth-field">
                <label>Full Name</label>
                <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 98XXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Vehicle Number (Optional)</label>
                <input type="text" placeholder="MH-31 AB 1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="driver@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
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
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {mode === 'signup' && password.length > 0 && (
            <div className="password-requirements">
              {passwordRequirements.map(req => (
                <span key={req.label} className={`req-item ${req.test ? 'met' : ''}`}>
                  {req.test ? '✓' : '○'} {req.label}
                </span>
              ))}
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="auth-submit driver-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="login-action" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed')}
            useOneTap={false}
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
            size="large"
          />
        </div>

        <div className="driver-switch">
          <button className="switch-portal-btn" onClick={onSwitchToAdmin}>
            ← Back to Admin Portal
          </button>
        </div>

        <div className="login-footer">
          <p>Amar Swarup Foundation — Driver Management System</p>
        </div>
      </div>
    </div>
  );
}
