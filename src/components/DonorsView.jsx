import { useState } from 'react';
import { getTierInfo } from '../data/mockData';
import './DonorsView.css';

const allDonors = [
  { id: 1, name: 'Rajesh Deshmukh', email: 'rajesh.d@email.com', phone: '+91 98XXX XX234', location: 'Dharampeth', joinDate: '2024-06-15', totalKg: 185.4, pickups: 24, tier: 'champion' },
  { id: 2, name: 'Deepa Khandelwal', email: 'deepa.k@email.com', phone: '+91 85XXX XX543', location: 'Laxmi Nagar', joinDate: '2024-07-02', totalKg: 162.0, pickups: 19, tier: 'champion' },
  { id: 3, name: 'Nikhil Dongre', email: 'nikhil.d@email.com', phone: '+91 82XXX XX145', location: 'Bajaj Nagar', joinDate: '2024-05-20', totalKg: 148.7, pickups: 22, tier: 'guardian' },
  { id: 4, name: 'Anita Borkar', email: 'anita.b@email.com', phone: '+91 81XXX XX112', location: 'Ramdaspeth', joinDate: '2024-08-10', totalKg: 124.3, pickups: 17, tier: 'guardian' },
  { id: 5, name: 'Sneha Raut', email: 'sneha.r@email.com', phone: '+91 88XXX XX321', location: 'Sadar', joinDate: '2024-09-01', totalKg: 98.5, pickups: 14, tier: 'guardian' },
  { id: 6, name: 'Amit Gajbhiye', email: 'amit.g@email.com', phone: '+91 77XXX XX456', location: 'Manewada', joinDate: '2024-10-18', totalKg: 76.2, pickups: 11, tier: 'guardian' },
  { id: 7, name: 'Suresh Yadav', email: 'suresh.y@email.com', phone: '+91 96XXX XX876', location: 'Trimurti Nagar', joinDate: '2024-11-05', totalKg: 45.8, pickups: 8, tier: 'recycler' },
  { id: 8, name: 'Priya Wankhede', email: 'priya.w@email.com', phone: '+91 90XXX XX891', location: 'Sitabuldi', joinDate: '2024-12-12', totalKg: 38.1, pickups: 6, tier: 'recycler' },
  { id: 9, name: 'Kavita Pande', email: 'kavita.p@email.com', phone: '+91 73XXX XX998', location: 'Pratap Nagar', joinDate: '2025-01-08', totalKg: 22.9, pickups: 4, tier: 'recycler' },
  { id: 10, name: 'Vikram Thakre', email: 'vikram.t@email.com', phone: '+91 93XXX XX789', location: 'Civil Lines', joinDate: '2025-02-14', totalKg: 8.4, pickups: 2, tier: 'seedling' },
  { id: 11, name: 'Meena Wasnik', email: 'meena.w@email.com', phone: '+91 91XXX XX332', location: 'Hingna', joinDate: '2025-02-20', totalKg: 11.8, pickups: 3, tier: 'recycler' },
  { id: 12, name: 'Rahul Meshram', email: 'rahul.m@email.com', phone: '+91 70XXX XX667', location: 'Wardhaman Nagar', joinDate: '2025-03-01', totalKg: 9.4, pickups: 2, tier: 'seedling' },
];

const donorStats = [
  { label: 'Total Donors', value: 1287, icon: '🤝' },
  { label: 'New This Month', value: 43, icon: '🆕' },
  { label: 'Active Donors', value: 892, icon: '💚' },
  { label: 'Avg. Donation', value: '19.3 kg', icon: '📊' },
];

export default function DonorsView() {
  const [search, setSearch] = useState('');
  const filtered = allDonors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.location.toLowerCase().includes(search.toLowerCase())
  );

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
