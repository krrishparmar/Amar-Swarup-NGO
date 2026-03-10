import { GoogleLogin } from '@react-oauth/google';
import './LoginView.css';

export default function LoginView({ onLoginSuccess }) {
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
          <p>Please sign in with your authorized Google account to access the dashboard.</p>
        </div>

        <div className="login-action">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={() => {
              console.error('Login Failed');
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
