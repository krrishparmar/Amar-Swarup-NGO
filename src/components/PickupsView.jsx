import { useState, useEffect } from 'react';
import { fetchPickups, updatePickupFull, deletePickup, fetchDrivers, updatePickup } from '../api';
import './PickupsView.css';

const statusColors = {
  Pending: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  Scheduled: { bg: 'rgba(96, 165, 250, 0.12)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
  Confirmed: { bg: 'rgba(13, 148, 136, 0.12)', text: '#2dd4bf', border: 'rgba(13, 148, 136, 0.3)' },
  'In Transit': { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
  'En Route': { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
  Completed: { bg: 'rgba(74, 222, 128, 0.12)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
};

const wasteTypeColors = {
  'E-Waste': '#f59e0b', 'Plastic': '#3b82f6', 'Paper': '#a78bfa', 'Metal': '#6b7280',
  'Mixed': '#0d9488', 'Organic': '#22c55e', 'Glass': '#06b6d4', 'Clothes': '#ec4899',
  'Cardboard': '#d97706', 'Tyres': '#78716c', 'Books': '#8b5cf6', 'Electronics': '#f59e0b', 'Other': '#94a3b8',
};

const WASTE_TYPES = ['E-Waste', 'Plastic', 'Paper', 'Metal', 'Mixed', 'Clothes', 'Cardboard', 'Tyres', 'Books', 'Electronics', 'Other'];
const STATUSES = ['Pending', 'Scheduled', 'Confirmed', 'In Transit', 'En Route', 'Completed', 'Cancelled'];
const TIMING_OPTIONS = ['', 'Morning (9 AM – 12 PM)', 'Afternoon (12 PM – 3 PM)', 'Evening (3 PM – 6 PM)'];

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
    <div className="toast-notification" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      <span className="toast-icon">{c.icon}</span><span>{message}</span>
    </div>
  );
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog fade-in-up" onClick={e => e.stopPropagation()}>
        <p style={{ marginBottom: '1.2rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn modal-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal ─── */
function EditModal({ pickup, onSave, onClose, saving, drivers }) {
  const [form, setForm] = useState({
    donor: pickup.donor || '',
    location: pickup.location || '',
    phone: pickup.phone || '',
    wasteType: pickup.wasteType || 'Plastic',
    date: pickup.date || '',
    time: pickup.time || '',
    weight: pickup.weight || 0,
    preferredTime: pickup.preferredTime || '',
    status: pickup.status || 'Pending',
    driverId: pickup.driverId || '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const driverId = form.driverId ? parseInt(form.driverId) : null;
    const selectedDriver = drivers.find(d => d.id === driverId);
    onSave({
      donor: form.donor,
      location: form.location,
      phone: form.phone,
      wasteType: form.wasteType,
      date: form.date,
      time: form.time,
      weight: parseFloat(form.weight) || 0,
      preferredTime: form.preferredTime,
      status: form.status,
      driverId: driverId,
      driver: selectedDriver ? selectedDriver.name : 'Unassigned',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>Edit Pickup #{pickup.id}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <div className="modal-field">
              <label>Donor</label>
              <input type="text" value={form.donor} onChange={e => set('donor', e.target.value)} required />
            </div>
            <div className="modal-field">
              <label>Location</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)} required />
            </div>
            <div className="modal-field">
              <label>Phone</label>
              <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
            <div className="modal-field">
              <label>Waste Type</label>
              <select value={form.wasteType} onChange={e => set('wasteType', e.target.value)}>
                {WASTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Time</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Weight (kg)</label>
              <input type="number" step="0.1" min="0" value={form.weight} onChange={e => set('weight', e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Preferred Timing</label>
              <select value={form.preferredTime} onChange={e => set('preferredTime', e.target.value)}>
                {TIMING_OPTIONS.map(t => <option key={t} value={t}>{t || 'Not specified'}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Assign Driver</label>
              <select value={form.driverId} onChange={e => set('driverId', e.target.value)}>
                <option value="">Unassigned</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.vehicleNumber || 'No vehicle'})</option>)}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ─── Main PickupsView ─── */
export default function PickupsView() {
  const [filter, setFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [allPickups, setAllPickups] = useState([]);
  const [pickupStats, setPickupStats] = useState([]);
  const [timingBreakdown, setTimingBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [editingPickup, setEditingPickup] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const statuses = ['All', 'Pending', 'Scheduled', 'Confirmed', 'In Transit', 'En Route', 'Completed', 'Cancelled'];

  const loadData = async () => {
    setLoading(true);
    try {
      const [pickupData, driverList] = await Promise.all([
        fetchPickups(),
        fetchDrivers('All'),
      ]);
      setAllPickups(pickupData.pickups);
      setPickupStats(pickupData.stats);
      setTimingBreakdown(pickupData.timingBreakdown || {});
      setDrivers(driverList);
    } catch (err) {
      console.error('Error loading pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const today = new Date().toISOString().split('T')[0];
  const filtered = allPickups.filter(p => {
    const matchStatus = filter === 'All' || p.status === filter;
    let matchDate = true;
    
    // Check if it's a standard YYYY-MM-DD format
    const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(p.date);
    
    if (dateFilter === 'Today') {
      matchDate = isIsoDate ? p.date === today : p.date?.toLowerCase() === 'today';
    } else if (dateFilter === 'Upcoming') {
      // Assume non-ISO dates like "Tomorrow", "Next week" are Upcoming
      matchDate = isIsoDate ? p.date > today : (p.date?.toLowerCase() !== 'today');
    } else if (dateFilter === 'Past') {
      matchDate = isIsoDate ? p.date < today : false;
    }
    
    return matchStatus && matchDate;
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  /* ── Quick assign driver ── */
  const handleQuickAssign = async (pickup, driverId) => {
    try {
      const driver = drivers.find(d => d.id === parseInt(driverId));
      await updatePickup(pickup.id, {
        driverId: driverId ? parseInt(driverId) : null,
        driver: driver ? driver.name : 'Unassigned',
      });
      showToast(driver ? `Assigned to ${driver.name}` : 'Driver unassigned');
      loadData();
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  };

  /* ── Save edit ── */
  const handleSaveEdit = async (data) => {
    setSaving(true);
    try {
      await updatePickupFull(editingPickup.id, data);
      setEditingPickup(null);
      showToast('Pickup updated successfully');
      loadData();
    } catch (err) {
      showToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      await deletePickup(deletingId);
      setDeletingId(null);
      showToast('Pickup deleted');
      loadData();
    } catch (err) {
      showToast(`Failed to delete: ${err.message}`, 'error');
      setDeletingId(null);
    }
  };

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
        <button className="refresh-btn" onClick={loadData}>🔄 Refresh</button>
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

      {/* Scheduled Pickup Timings Section */}
      {Object.keys(timingBreakdown).length > 0 && (
        <div className="timing-section">
          <h3 className="timing-title">🕐 Scheduled Pickup Timings</h3>
          <div className="timing-cards">
            {Object.entries(timingBreakdown).map(([timing, count]) => (
              <div key={timing} className="timing-card">
                <span className="timing-label">{timing}</span>
                <span className="timing-count">{count} pickup{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pickup-table-wrap">
        <div className="pickup-filter-row">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            {statuses.map(s => (
              <button key={s} className={`filter-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date:</span>
            {['All', 'Today', 'Upcoming', 'Past'].map(df => (
              <button key={df} className={`filter-pill ${dateFilter === df ? 'active' : ''}`} onClick={() => setDateFilter(df)}>
                {df}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No pickups found</h3>
            <p>
              {filter === 'All'
                ? 'Pickups will appear here once scheduled via WhatsApp or added manually.'
                : `No pickups with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="pickup-table-container">
            <table className="pickup-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Donor</th>
                  <th>Location</th>
                  <th>Waste</th>
                  <th>Date & Time</th>
                  <th>Pref. Timing</th>
                  <th>Weight</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="pickup-row" style={{ animationDelay: `${i * 0.04}s` }}>
                    <td className="td-id">#{String(p.id).padStart(3, '0')}</td>
                    <td className="td-name">{p.donor}</td>
                    <td><span className="location-tag">📍 {p.location}</span></td>
                    <td>
                      <span className="waste-badge" style={{
                        background: `${wasteTypeColors[p.wasteType] || '#94a3b8'}18`,
                        color: wasteTypeColors[p.wasteType] || '#94a3b8',
                        border: `1px solid ${wasteTypeColors[p.wasteType] || '#94a3b8'}40`,
                      }}>{p.wasteType}</span>
                    </td>
                    <td className="td-date">{p.date} · {p.time}</td>
                    <td className="td-timing">{p.preferredTime || '—'}</td>
                    <td className="td-weight">
                      {typeof p.weight === 'number'
                        ? `${p.weight} kg`
                        : String(p.weight).includes('kg') ? p.weight : `${p.weight} kg`}
                    </td>
                    <td>
                      <select
                        className={`driver-select ${!p.driverId ? 'unassigned' : ''}`}
                        value={p.driverId || ''}
                        onChange={(e) => handleQuickAssign(p, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className="status-pill" style={{
                        background: statusColors[p.status]?.bg,
                        color: statusColors[p.status]?.text,
                        border: `1px solid ${statusColors[p.status]?.border}`,
                      }}>{p.status}</span>
                    </td>
                    <td className="td-actions">
                      <button className="action-icon edit-icon" title="Edit" onClick={() => setEditingPickup(p)}>✏️</button>
                      <button className="action-icon delete-icon" title="Delete" onClick={() => setDeletingId(p.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingPickup && (
        <EditModal
          pickup={editingPickup}
          onSave={handleSaveEdit}
          onClose={() => setEditingPickup(null)}
          saving={saving}
          drivers={drivers}
        />
      )}

      {deletingId && (
        <ConfirmDialog
          message="Are you sure you want to delete this pickup? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
