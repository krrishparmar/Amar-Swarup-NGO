import { useState, useEffect } from 'react';
import { fetchDriverPickups, driverUpdatePickup } from '../api';
import './DriverDashboard.css';

const statusColors = {
  Pending: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  Confirmed: { bg: 'rgba(13, 148, 136, 0.12)', text: '#2dd4bf', border: 'rgba(13, 148, 136, 0.3)' },
  'En Route': { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
  Completed: { bg: 'rgba(74, 222, 128, 0.12)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
};

const DRIVER_STATUSES = ['Confirmed', 'En Route', 'Pending', 'Cancelled', 'Completed'];

/* ─── Toast ─── */
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = {
    success: { bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.4)', text: '#4ade80', icon: '✓' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', icon: '✕' },
    info: { bg: 'rgba(108, 142, 239, 0.15)', border: 'rgba(108, 142, 239, 0.4)', text: '#6C8EEF', icon: 'ℹ' },
  };
  const c = colors[type] || colors.info;
  return (
    <div className="driver-toast" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      <span style={{ fontWeight: 700 }}>{c.icon}</span><span>{message}</span>
    </div>
  );
}

/* ─── Edit Location/Time Modal ─── */
function EditPickupModal({ pickup, onSave, onClose, saving }) {
  const [location, setLocation] = useState(pickup.location || '');
  const [time, setTime] = useState(pickup.time || '');
  const [preferredTime, setPreferredTime] = useState(pickup.preferredTime || '');

  return (
    <div className="driver-modal-overlay" onClick={onClose}>
      <div className="driver-modal fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="driver-modal-header">
          <h3>Update Pickup #{pickup.id}</h3>
          <button className="driver-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="driver-modal-body">
          <div className="driver-field">
            <label>Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="driver-field">
            <label>Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div className="driver-field">
            <label>Preferred Timing</label>
            <select value={preferredTime} onChange={e => setPreferredTime(e.target.value)}>
              <option value="">Not specified</option>
              <option value="Morning (9 AM – 12 PM)">Morning (9 AM – 12 PM)</option>
              <option value="Afternoon (12 PM – 3 PM)">Afternoon (12 PM – 3 PM)</option>
              <option value="Evening (3 PM – 6 PM)">Evening (3 PM – 6 PM)</option>
            </select>
          </div>
        </div>
        <div className="driver-modal-actions">
          <button className="driver-btn driver-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="driver-btn driver-btn-save" disabled={saving} onClick={() => onSave({ location, time, preferredTime })}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function DriverDashboard({ driver, onLogout }) {
  const [pickups, setPickups] = useState([]);
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [editingPickup, setEditingPickup] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const loadPickups = async () => {
    setLoading(true);
    try {
      const data = await fetchDriverPickups(driver.id);
      setPickups(data.pickups);
      setStats(data.stats);
    } catch (err) {
      console.error('Error loading driver pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPickups(); }, [driver.id]);

  const filtered = filter === 'All' ? pickups : pickups.filter(p => p.status === filter);
  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const handleStatusChange = async (pickup, newStatus) => {
    try {
      await driverUpdatePickup(pickup.id, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      loadPickups();
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  };

  const handleEditSave = async (data) => {
    setSaving(true);
    try {
      await driverUpdatePickup(editingPickup.id, data);
      setEditingPickup(null);
      showToast('Pickup updated');
      loadPickups();
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="driver-dashboard">
      {/* Header */}
      <header className="driver-header">
        <div className="driver-header-left">
          <span className="driver-header-icon">🚛</span>
          <div>
            <h1 className="driver-header-title">Driver Dashboard</h1>
            <span className="driver-header-name">Welcome, {driver.name}</span>
          </div>
        </div>
        <div className="driver-header-right">
          <button className="driver-refresh-btn" onClick={loadPickups}>🔄 Refresh</button>
          <button className="driver-logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <main className="driver-main">
        {/* Stats */}
        <div className="driver-stats-row">
          {stats.map((stat, i) => (
            <div key={stat.label} className="driver-stat-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="driver-stat-icon">{stat.icon}</span>
              <span className="driver-stat-value">{stat.value}</span>
              <span className="driver-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="driver-filter-row">
          {['All', ...DRIVER_STATUSES].map(s => (
            <button key={s} className={`driver-filter-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Pickups List */}
        {loading ? (
          <div className="driver-loading">Loading your pickups...</div>
        ) : filtered.length === 0 ? (
          <div className="driver-empty">
            <span className="driver-empty-icon">📦</span>
            <h3>No pickups {filter !== 'All' ? `with status "${filter}"` : 'assigned yet'}</h3>
            <p>Your admin will assign pickups to you. Refresh to check for new assignments.</p>
          </div>
        ) : (
          <div className="driver-pickups-list">
            {filtered.map((p, i) => (
              <div key={p.id} className="driver-pickup-card fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="driver-pickup-top">
                  <span className="driver-pickup-id">#{String(p.id).padStart(3, '0')}</span>
                  <span className="driver-pickup-status" style={{
                    background: statusColors[p.status]?.bg,
                    color: statusColors[p.status]?.text,
                    border: `1px solid ${statusColors[p.status]?.border}`,
                  }}>{p.status}</span>
                </div>

                <div className="driver-pickup-info">
                  <div className="driver-pickup-row">
                    <span className="driver-pickup-label">👤 Donor</span>
                    <span className="driver-pickup-value">{p.donor}</span>
                  </div>
                  <div className="driver-pickup-row">
                    <span className="driver-pickup-label">📍 Location</span>
                    <span className="driver-pickup-value">{p.location}</span>
                  </div>
                  <div className="driver-pickup-row">
                    <span className="driver-pickup-label">📞 Phone</span>
                    <span className="driver-pickup-value">{p.phone}</span>
                  </div>
                  <div className="driver-pickup-row">
                    <span className="driver-pickup-label">🗑️ Waste</span>
                    <span className="driver-pickup-value">{p.wasteType} — {p.weight} kg</span>
                  </div>
                  <div className="driver-pickup-row">
                    <span className="driver-pickup-label">📅 Date</span>
                    <span className="driver-pickup-value">{p.date} · {p.time}</span>
                  </div>
                  {p.preferredTime && (
                    <div className="driver-pickup-row">
                      <span className="driver-pickup-label">🕐 Preferred</span>
                      <span className="driver-pickup-value driver-preferred">{p.preferredTime}</span>
                    </div>
                  )}
                </div>

                <div className="driver-pickup-actions">
                  <div className="driver-status-group">
                    <label>Update Status:</label>
                    <select value={p.status} onChange={e => handleStatusChange(p, e.target.value)} className="driver-status-select">
                      {DRIVER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <button className="driver-edit-btn" onClick={() => setEditingPickup(p)}>
                    ✏️ Edit Location/Time
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editingPickup && (
        <EditPickupModal
          pickup={editingPickup}
          onSave={handleEditSave}
          onClose={() => setEditingPickup(null)}
          saving={saving}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
