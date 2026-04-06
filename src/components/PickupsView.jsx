import { useState, useEffect } from 'react';
import { fetchPickups } from '../api';
import './PickupsView.css';

const statusColors = {
  Pending: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  Scheduled: { bg: 'rgba(96, 165, 250, 0.12)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
  Confirmed: { bg: 'rgba(13, 148, 136, 0.12)', text: '#2dd4bf', border: 'rgba(13, 148, 136, 0.3)' },
  'In Transit': { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
  Completed: { bg: 'rgba(74, 222, 128, 0.12)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
};

export default function PickupsView() {
  const [filter, setFilter] = useState('All');
  const [allPickups, setAllPickups] = useState([]);
  const [pickupStats, setPickupStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const statuses = ['All', 'Pending', 'Scheduled', 'Confirmed', 'In Transit', 'Completed', 'Cancelled'];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPickups();
        setAllPickups(data.pickups);
        setPickupStats(data.stats);
      } catch (err) {
        console.error('Error loading pickups:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter === 'All' ? allPickups : allPickups.filter(p => p.status === filter);

  if (loading) {
    return (
      <div className="pickups-view fade-in-up" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading pickups...</div>
      </div>
    );
  }

  return (
    <div className="pickups-view fade-in-up">
      <div className="view-header">
        <div>
          <h2 className="view-title">📦 Pickup Management</h2>
          <p className="view-subtitle">Schedule, track, and manage all waste collection pickups</p>
        </div>
      </div>

      <div className="pickup-stats-row">
        {pickupStats.map((stat, i) => (
          <div key={stat.label} className="pickup-stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="pickup-stat-icon">{stat.icon}</span>
            <span className="pickup-stat-value">{stat.value}</span>
            <span className="pickup-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="pickup-table-wrap">
        <div className="pickup-filter-row">
          {statuses.map(s => (
            <button
              key={s}
              className={`filter-pill ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="pickup-table-container">
          <table className="pickup-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor</th>
                <th>Location</th>
                <th>Waste</th>
                <th>Date &amp; Time</th>
                <th>Weight</th>
                <th>Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className="pickup-row" style={{ animationDelay: `${i * 0.04}s` }}>
                  <td className="td-id">#{String(p.id).padStart(3, '0')}</td>
                  <td className="td-name">{p.donor}</td>
                  <td><span className="location-tag">📍 {p.location}</span></td>
                  <td><span className="waste-badge">{p.wasteType}</span></td>
                  <td className="td-date">{p.date} · {p.time}</td>
                  <td className="td-weight">
                    {typeof p.weight === 'number' 
                      ? (p.weight < 5 ? '<5 kg' : p.weight <= 10 ? '5-10 kg' : p.weight <= 20 ? '10-20 kg' : '>20 kg') 
                      : String(p.weight).includes('kg') ? p.weight : `${p.weight} kg`}
                  </td>
                  <td className={`td-driver ${p.driver === 'Unassigned' ? 'unassigned' : ''}`}>{p.driver}</td>
                  <td>
                    <span className="status-pill" style={{
                      background: statusColors[p.status]?.bg,
                      color: statusColors[p.status]?.text,
                      border: `1px solid ${statusColors[p.status]?.border}`,
                    }}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
