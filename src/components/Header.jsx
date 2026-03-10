import { useState } from 'react';
import './Header.css';

export default function Header({ activeTab, onTabChange, userProfile, onLogout }) {
  const [isLogoutMenuOpen, setIsLogoutMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-mark">
          <span className="logo-icon">🌿</span>
          <div className="logo-text">
            <h1>Amar Swarup</h1>
            <span className="logo-subtitle">Foundation</span>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        {['Dashboard', 'Pickups', 'Donors', 'Leaderboard', 'Reports'].map((tab) => (
          <button 
            key={tab}
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="header-right">
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span>System Live</span>
        </div>
        
        <div className="admin-profile-container">
          <div 
            className="admin-profile" 
            onClick={() => setIsLogoutMenuOpen(!isLogoutMenuOpen)}
          >
            {userProfile?.picture ? (
              <img src={userProfile.picture} alt="Avatar" className="admin-avatar-img" />
            ) : (
              <div className="admin-avatar">
                {userProfile?.name?.charAt(0) || 'AS'}
              </div>
            )}
            <span className="admin-name">{userProfile?.name || 'Admin'}</span>
          </div>

          {isLogoutMenuOpen && (
            <div className="logout-menu fade-in">
              <button className="logout-btn" onClick={onLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
