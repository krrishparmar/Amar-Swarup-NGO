import './ActivityFeed.css';

const wasteTypeColors = {
  'E-Waste': '#f59e0b',
  'Plastic': '#3b82f6',
  'Paper': '#a78bfa',
  'Metal': '#6b7280',
  'Mixed': '#0d9488',
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
        {activities.map((item, i) => (
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
                  color: wasteTypeColors[item.wasteType],
                  background: `${wasteTypeColors[item.wasteType]}18`,
                  border: `1px solid ${wasteTypeColors[item.wasteType]}40`,
                }}
              >
                {item.wasteType}
              </span>
              <span className="feed-weight">{item.weight}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
