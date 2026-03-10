import { useState } from 'react';
import './PickupsView.css';

const allPickups = [
  { id: 1, donor: 'Rajesh Deshmukh', location: 'Dharampeth', phone: '+91 98XXX XX234', wasteType: 'E-Waste', date: '2025-03-10', time: '10:00 AM', weight: 12.5, status: 'Confirmed', driver: 'Sunil K.' },
  { id: 2, donor: 'Priya Wankhede', location: 'Sitabuldi', phone: '+91 90XXX XX891', wasteType: 'Plastic', date: '2025-03-10', time: '11:30 AM', weight: 8.2, status: 'In Transit', driver: 'Rahul P.' },
  { id: 3, donor: 'Amit Gajbhiye', location: 'Manewada', phone: '+91 77XXX XX456', wasteType: 'Paper', date: '2025-03-10', time: '02:00 PM', weight: 22.0, status: 'Completed', driver: 'Vinay M.' },
  { id: 4, donor: 'Sneha Raut', location: 'Sadar', phone: '+91 88XXX XX321', wasteType: 'Metal', date: '2025-03-10', time: '03:30 PM', weight: 15.7, status: 'Confirmed', driver: 'Amit D.' },
  { id: 5, donor: 'Vikram Thakre', location: 'Civil Lines', phone: '+91 93XXX XX789', wasteType: 'E-Waste', date: '2025-03-10', time: '04:00 PM', weight: 5.3, status: 'Pending', driver: 'Unassigned' },
  { id: 6, donor: 'Anita Borkar', location: 'Ramdaspeth', phone: '+91 81XXX XX112', wasteType: 'Mixed', date: '2025-03-11', time: '09:00 AM', weight: 18.9, status: 'Scheduled', driver: 'Sunil K.' },
  { id: 7, donor: 'Rahul Meshram', location: 'Wardhaman Nagar', phone: '+91 70XXX XX667', wasteType: 'Plastic', date: '2025-03-11', time: '10:30 AM', weight: 9.4, status: 'Cancelled', driver: '—' },
  { id: 8, donor: 'Deepa Khandelwal', location: 'Laxmi Nagar', phone: '+91 85XXX XX543', wasteType: 'Paper', date: '2025-03-11', time: '01:00 PM', weight: 30.0, status: 'Completed', driver: 'Vinay M.' },
  { id: 9, donor: 'Suresh Yadav', location: 'Trimurti Nagar', phone: '+91 96XXX XX876', wasteType: 'Metal', date: '2025-03-12', time: '11:00 AM', weight: 7.1, status: 'Scheduled', driver: 'Rahul P.' },
  { id: 10, donor: 'Kavita Pande', location: 'Pratap Nagar', phone: '+91 73XXX XX998', wasteType: 'E-Waste', date: '2025-03-12', time: '12:30 PM', weight: 14.6, status: 'Pending', driver: 'Unassigned' },
  { id: 11, donor: 'Nikhil Dongre', location: 'Bajaj Nagar', phone: '+91 82XXX XX145', wasteType: 'Mixed', date: '2025-03-12', time: '03:00 PM', weight: 25.3, status: 'Completed', driver: 'Amit D.' },
  { id: 12, donor: 'Meena Wasnik', location: 'Hingna', phone: '+91 91XXX XX332', wasteType: 'Plastic', date: '2025-03-13', time: '09:30 AM', weight: 11.8, status: 'Pending', driver: 'Unassigned' },
];

const statusColors = {
  Pending: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  Scheduled: { bg: 'rgba(96, 165, 250, 0.12)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
  Confirmed: { bg: 'rgba(13, 148, 136, 0.12)', text: '#2dd4bf', border: 'rgba(13, 148, 136, 0.3)' },
  'In Transit': { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
  Completed: { bg: 'rgba(74, 222, 128, 0.12)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
};

const pickupStats = [
  { label: "Today's Pickups", value: 18, icon: '📅' },
  { label: 'In Transit', value: 4, icon: '🚛' },
  { label: 'Completed Today', value: 11, icon: '✅' },
  { label: 'Pending Assignment', value: 3, icon: '⏳' },
];

export default function PickupsView() {
  const [filter, setFilter] = useState('All');
  const statuses = ['All', 'Pending', 'Scheduled', 'Confirmed', 'In Transit', 'Completed', 'Cancelled'];
  const filtered = filter === 'All' ? allPickups : allPickups.filter(p => p.status === filter);

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
                  <td className="td-weight">{p.weight} kg</td>
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
