import { useState, useEffect } from 'react';
import { fetchDonors } from '../api';
import { getTierInfo } from '../data/utils';
import './DonorsView.css';

export default function DonorsView() {
  const [search, setSearch] = useState('');
  const [allDonors, setAllDonors] = useState([]);
  const [donorStats, setDonorStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchDonors();
        setAllDonors(data.donors);
        setDonorStats(data.stats);
      } catch (err) {
        console.error('Error loading donors:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = allDonors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="donors-view fade-in-up" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading donors...</div>
      </div>
    );
  }

  return (
    <div className="donors-view fade-in-up">
      <div className="view-header">
        <div>
          <h2 className="view-title">🤝 Donor Management</h2>
          <p className="view-subtitle">View and manage all registered donors across Nagpur</p>
        </div>
      </div>

      <div className="donor-stats-row">
        {donorStats.map((stat, i) => (
          <div key={stat.label} className="donor-stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="donor-stat-icon">{stat.icon}</span>
            <span className="donor-stat-value">{stat.value}</span>
            <span className="donor-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="donor-table-wrap">
        <div className="donor-search-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search donors by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <span className="donor-count">{filtered.length} donors</span>
        </div>
        <div className="donor-table-container">
          <table className="donor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Joined</th>
                <th>Total Donated</th>
                <th>Pickups</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const tier = getTierInfo(d.tier);
                return (
                  <tr key={d.id} className="donor-row" style={{ animationDelay: `${i * 0.04}s` }}>
                    <td className="td-name">{d.name}</td>
                    <td className="td-email">{d.email}</td>
                    <td className="td-phone">{d.phone}</td>
                    <td><span className="location-tag">📍 {d.location}</span></td>
                    <td className="td-date">{d.joinDate}</td>
                    <td className="td-weight">{d.totalKg} kg</td>
                    <td className="td-pickups">{d.pickups}</td>
                    <td>
                      <span className="tier-pill" style={{
                        color: tier.color,
                        background: `${tier.color}18`,
                        border: `1px solid ${tier.color}40`,
                      }}>{tier.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
