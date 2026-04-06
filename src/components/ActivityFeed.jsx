import './ActivityFeed.css';

const wasteTypeColors = {
  'E-Waste': '#f59e0b',
  'Plastic': '#3b82f6',
  'Paper': '#a78bfa',
  'Metal': '#6b7280',
  'Mixed': '#0d9488',
  'Clothes': '#ec4899',
  'Cardboard': '#d97706',
  'Tyres': '#78716c',
  'Books': '#8b5cf6',
  'Electronics': '#f59e0b',
  'Other': '#94a3b8',
};

export default function ActivityFeed({ activities }) {
  return (
    <aside className="activity-feed fade-in-up" style={{ animationDelay: '0.7s' }}>
      <div className="feed-header">
        <h3 className="feed-title">
          <span className="pulse-dot"></span>
          Live Pickup Feed
        </h3>
        <span className="feed-count">{activities.length} recent</span>
      </div>
      <div className="feed-list">
        {activities.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '2rem', opacity: 0.4, marginBottom: '0.5rem' }}>📡</span>
            <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>No recent activity. Pickups will appear here in real time.</p>
          </div>
        ) : (
          activities.map((item, i) => (
            <div
              key={item.id}
              className="feed-item"
              style={{ animationDelay: `${0.8 + i * 0.06}s` }}
            >
              <div className="feed-item-top">
                <span className="feed-donor">{item.donor}</span>
                <span className="feed-time">{item.time}</span>
              </div>
              <div className="feed-item-bottom">
                <span className="feed-location">📍 {item.location}</span>
                <span
                  className="feed-waste"
                  style={{
                    color: wasteTypeColors[item.wasteType] || '#94a3b8',
                    background: `${wasteTypeColors[item.wasteType] || '#94a3b8'}18`,
                    border: `1px solid ${wasteTypeColors[item.wasteType] || '#94a3b8'}40`,
                  }}
                >
                  {item.wasteType}
                </span>
                <span className="feed-weight">{item.weight}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
