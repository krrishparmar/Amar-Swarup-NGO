import { useState } from 'react';
import './LeadsTable.css';

const statusColors = {
  Pending: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  Confirmed: { bg: 'rgba(13, 148, 136, 0.12)', text: '#2dd4bf', border: 'rgba(13, 148, 136, 0.3)' },
  Completed: { bg: 'rgba(74, 222, 128, 0.12)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
};

const wasteTypeColors = {
  'E-Waste': '#f59e0b',
  'Plastic': '#3b82f6',
  'Paper': '#a78bfa',
  'Metal': '#6b7280',
  'Mixed': '#0d9488',
};

export default function LeadsTable({ leads }) {
  const [filter, setFilter] = useState('All');
  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const filtered = filter === 'All' ? leads : leads.filter(l => l.status === filter);

  return (
    <section className="leads-section fade-in-up" style={{ animationDelay: '0.5s' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <span className="title-icon">💬</span>
            WhatsApp Chatbot Leads
          </h2>
          <p className="section-subtitle">{leads.length} total leads from WhatsApp bot interactions</p>
        </div>
        <div className="filter-pills">
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
      </div>
      <div className="table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Waste Type</th>
              <th>Date &amp; Time</th>
              <th>Weight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => (
              <tr key={lead.id} className="table-row" style={{ animationDelay: `${i * 0.04}s` }}>
                <td className="td-name">{lead.name}</td>
                <td>
                  <span className="location-tag">📍 {lead.location}</span>
                </td>
                <td className="td-phone">{lead.phone}</td>
                <td>
                  <span
                    className="waste-pill"
                    style={{
                      background: `${wasteTypeColors[lead.wasteType]}18`,
                      color: wasteTypeColors[lead.wasteType],
                      border: `1px solid ${wasteTypeColors[lead.wasteType]}40`,
                    }}
                  >
                    {lead.wasteType}
                  </span>
                </td>
                <td className="td-date">{lead.date} · {lead.time}</td>
                <td className="td-weight">{lead.weight} kg</td>
                <td>
                  <span
                    className="status-pill"
                    style={{
                      background: statusColors[lead.status].bg,
                      color: statusColors[lead.status].text,
                      border: `1px solid ${statusColors[lead.status].border}`,
                    }}
                  >
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
