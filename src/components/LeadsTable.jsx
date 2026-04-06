import { useState, useEffect } from 'react';
import { updateLeadFull, updateLeadStatus, deleteLead } from '../api';
import './LeadsTable.css';

const statusColors = {
  Pending: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  Confirmed: { bg: 'rgba(74, 222, 128, 0.12)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  Completed: { bg: 'rgba(13, 148, 136, 0.12)', text: '#2dd4bf', border: 'rgba(13, 148, 136, 0.3)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
};

const wasteTypeColors = {
  'E-Waste': '#f59e0b',
  'Plastic': '#3b82f6',
  'Paper': '#a78bfa',
  'Metal': '#6b7280',
  'Mixed': '#0d9488',
  'Organic': '#22c55e',
  'Glass': '#06b6d4',
  'Clothes': '#ec4899',
  'Cardboard': '#d97706',
  'Tyres': '#78716c',
  'Books': '#8b5cf6',
  'Electronics': '#f59e0b',
  'Other': '#94a3b8',
};

const WASTE_TYPES = ['E-Waste', 'Plastic', 'Paper', 'Metal', 'Mixed', 'Organic', 'Glass'];
const WEIGHT_RANGES = ['<5 kg', '5-10 kg', '10-20 kg', '>20 kg'];
const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

function weightToRange(w) {
  if (typeof w === 'string' && WEIGHT_RANGES.includes(w)) return w;
  const n = typeof w === 'number' ? w : parseFloat(w) || 0;
  if (n < 5) return '<5 kg';
  if (n <= 10) return '5-10 kg';
  if (n <= 20) return '10-20 kg';
  return '>20 kg';
}

function rangeToWeight(range) {
  switch (range) {
    case '<5 kg': return 3;
    case '5-10 kg': return 7;
    case '10-20 kg': return 15;
    case '>20 kg': return 25;
    default: return 0;
  }
}

function displayWeight(w) {
  if (typeof w === 'number') {
    if (w < 5) return '<5 kg';
    if (w <= 10) return '5-10 kg';
    if (w <= 20) return '10-20 kg';
    return '>20 kg';
  }
  return String(w).includes('kg') ? w : `${w} kg`;
}

/* ─── Toast Component ─── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.4)', text: '#4ade80', icon: '✓' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', icon: '✕' },
    info: { bg: 'rgba(108, 142, 239, 0.15)', border: 'rgba(108, 142, 239, 0.4)', text: '#6C8EEF', icon: 'ℹ' },
  };
  const c = colors[type] || colors.info;

  return (
    <div className="toast-notification" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      <span className="toast-icon">{c.icon}</span>
      <span>{message}</span>
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
function EditModal({ lead, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    name: lead.name || '',
    location: lead.location || '',
    phone: lead.phone || '',
    wasteType: lead.wasteType || 'Plastic',
    date: lead.date || '',
    time: lead.time || '',
    weightRange: weightToRange(lead.weight),
    status: lead.status || 'Pending',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name,
      location: form.location,
      phone: form.phone,
      wasteType: form.wasteType,
      date: form.date,
      time: form.time,
      weight: rangeToWeight(form.weightRange),
      status: form.status,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>Edit Lead #{lead.id}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <div className="modal-field">
              <label>Name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required />
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
              <label>Weight</label>
              <select value={form.weightRange} onChange={e => set('weightRange', e.target.value)}>
                {WEIGHT_RANGES.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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

/* ─── Main LeadsTable ─── */
export default function LeadsTable({ leads, onLeadsChange }) {
  const [filter, setFilter] = useState('All');
  const [editingLead, setEditingLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [localLeads, setLocalLeads] = useState(leads);

  useEffect(() => { setLocalLeads(leads); }, [leads]);

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const filtered = filter === 'All' ? localLeads : localLeads.filter(l => l.status === filter);

  const showToast = (message, type = 'success') => setToast({ message, type });

  /* ── Quick Status ── */
  const handleQuickStatus = async (lead, newStatus) => {
    // Optimistic update
    setLocalLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
    try {
      await updateLeadStatus(lead.id, newStatus);
      showToast(`Status updated to ${newStatus}`, 'success');
      if (onLeadsChange) onLeadsChange();
    } catch (err) {
      // Rollback
      setLocalLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: lead.status } : l));
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  /* ── Save Edit ── */
  const handleSaveEdit = async (data) => {
    setSaving(true);
    try {
      const updated = await updateLeadFull(editingLead.id, data);
      setLocalLeads(prev => prev.map(l => l.id === editingLead.id ? updated : l));
      setEditingLead(null);
      showToast('Lead updated successfully', 'success');
      if (onLeadsChange) onLeadsChange();
    } catch (err) {
      showToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      await deleteLead(deletingId);
      setLocalLeads(prev => prev.filter(l => l.id !== deletingId));
      setDeletingId(null);
      showToast('Lead deleted successfully', 'success');
      if (onLeadsChange) onLeadsChange();
    } catch (err) {
      showToast(`Failed to delete: ${err.message}`, 'error');
      setDeletingId(null);
    }
  };

  return (
    <section className="leads-section fade-in-up" style={{ animationDelay: '0.5s' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <span className="title-icon">💬</span>
            WhatsApp Chatbot Leads
          </h2>
          <p className="section-subtitle">{localLeads.length} total leads from WhatsApp bot interactions</p>
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
              <th>Actions</th>
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
                      background: `${wasteTypeColors[lead.wasteType] || '#94a3b8'}18`,
                      color: wasteTypeColors[lead.wasteType] || '#94a3b8',
                      border: `1px solid ${wasteTypeColors[lead.wasteType] || '#94a3b8'}40`,
                    }}
                  >
                    {lead.wasteType}
                  </span>
                </td>
                <td className="td-date">{lead.date} · {lead.time}</td>
                <td className="td-weight">{displayWeight(lead.weight)}</td>
                <td>
                  {lead.status === 'Pending' ? (
                    <select
                      className="status-select status-pending"
                      value={lead.status}
                      onChange={(e) => handleQuickStatus(lead, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span
                      className="status-pill"
                      style={{
                        background: (statusColors[lead.status] || statusColors.Pending).bg,
                        color: (statusColors[lead.status] || statusColors.Pending).text,
                        border: `1px solid ${(statusColors[lead.status] || statusColors.Pending).border}`,
                      }}
                    >
                      {lead.status}
                    </span>
                  )}
                </td>
                <td className="td-actions">
                  <button
                    className="action-icon edit-icon"
                    title="Edit"
                    onClick={() => setEditingLead(lead)}
                  >
                    ✏️
                  </button>
                  <button
                    className="action-icon delete-icon"
                    title="Delete"
                    onClick={() => setDeletingId(lead.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingLead && (
        <EditModal
          lead={editingLead}
          onSave={handleSaveEdit}
          onClose={() => setEditingLead(null)}
          saving={saving}
        />
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <ConfirmDialog
          message="Are you sure you want to delete this lead? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
