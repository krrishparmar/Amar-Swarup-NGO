import { getTierInfo, getTierProgress } from '../data/utils';
import './Leaderboard.css';

const medalEmojis = ['🥇', '🥈', '🥉'];

function DonorCard({ donor, index }) {
  const tier = getTierInfo(donor.tier);
  const progress = getTierProgress(donor.totalKg);
  const progressPercent = progress.next ? (progress.current / progress.max) * 100 : 100;
  const isTop3 = index < 3;

  return (
    <div
      className={`donor-card ${isTop3 ? `top-${index + 1}` : ''} fade-in-up`}
      style={{ animationDelay: `${0.6 + index * 0.08}s` }}
    >
      <div className="donor-rank">
        {isTop3 ? (
          <span className="medal">{medalEmojis[index]}</span>
        ) : (
          <span className="rank-number">#{donor.rank}</span>
        )}
      </div>
      <div className="donor-info">
        <div className="donor-name-row">
          <span className="donor-name">{donor.name}</span>
          <span className="tier-badge" style={{ color: tier.color, background: `${tier.color}18`, border: `1px solid ${tier.color}40` }}>
            {tier.label}
          </span>
        </div>
        <span className="donor-city">{donor.city}</span>
        <div className="donor-stats">
          <span className="stat-kg">{donor.totalKg} kg</span>
          <span className="stat-points">{donor.points} pts</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`,
              }}
            ></div>
          </div>
          {progress.next && (
            <span className="progress-label">
              {Math.round(progressPercent)}% to {progress.next}
            </span>
          )}
          {!progress.next && (
            <span className="progress-label max-tier">Max tier reached! ⚡</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard({ donors }) {
  // Empty state guard
  if (!donors || donors.length === 0) {
    return (
      <section className="leaderboard-section fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <span className="title-icon">🏆</span>
              Donor Leaderboard
            </h2>
            <p className="section-subtitle">Gamified ranking by total waste donated</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '2.5rem', opacity: 0.4, marginBottom: '0.6rem' }}>🏆</span>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.3rem' }}>No donors yet</h3>
          <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>Donors will appear on the leaderboard once they donate waste via WhatsApp.</p>
        </div>
      </section>
    );
  }

  const mvp = donors[0];
  const mvpTier = getTierInfo(mvp.tier);

  return (
    <section className="leaderboard-section fade-in-up" style={{ animationDelay: '0.6s' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <span className="title-icon">🏆</span>
            Donor Leaderboard
          </h2>
          <p className="section-subtitle">Gamified ranking by total waste donated</p>
        </div>
      </div>

      <div className="mvp-card">
        <div className="mvp-badge">⭐ This Month&apos;s MVP</div>
        <div className="mvp-content">
          <span className="mvp-medal">🥇</span>
          <div>
            <div className="mvp-name">{mvp.name}</div>
            <div className="mvp-stats">
              <span>{mvp.totalKg} kg donated</span>
              <span>·</span>
              <span>{mvp.points} points</span>
              <span>·</span>
              <span style={{ color: mvpTier.color }}>{mvpTier.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="leaderboard-list">
        {donors.map((donor, i) => (
          <DonorCard key={donor.rank} donor={donor} index={i} />
        ))}
      </div>
    </section>
  );
}
