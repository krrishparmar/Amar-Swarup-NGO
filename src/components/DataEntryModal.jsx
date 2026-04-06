import { useState } from 'react';
import { createLead } from '../api';

export default function DataEntryModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    wasteType: 'Plastic',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    weight: 5,
    preferredTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createLead({
        ...formData,
        weight: parseFloat(formData.weight) || 0,
      });
      onSubmit();
    } catch (err) {
      setError(err.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const modalStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    overflowY: 'auto',
    padding: '2rem 1rem',
  };

  const contentStyle = {
    background: 'var(--bg-card)',
    padding: '2rem',
    borderRadius: '16px',
    width: '450px',
    margin: 'auto',
    flexShrink: 0,
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    marginBottom: '1rem',
    marginTop: '0.4rem',
    fontSize: '0.9rem'
  };

  const labelStyle = {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle} className="fade-in-up">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Add Manual Entry</h3>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={labelStyle}>Donor Name</label>
              <input type="text" placeholder="E.g. Rajesh Kumar" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" placeholder="+91 98XXX XXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} required />
            </div>
          </div>

          <label style={labelStyle}>Location / Address</label>
          <input type="text" placeholder="E.g. Dharampeth, Nagpur" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={inputStyle} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={labelStyle}>Waste Type</label>
              <select value={formData.wasteType} onChange={e => setFormData({ ...formData, wasteType: e.target.value })} style={inputStyle}>
                <option>Plastic</option>
                <option>E-Waste</option>
                <option>Paper</option>
                <option>Metal</option>
                <option>Mixed</option>
                <option>Clothes</option>
                <option>Cardboard</option>
                <option>Tyres</option>
                <option>Books</option>
                <option>Electronics</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Weight (kg)</label>
              <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', background: 'var(--accent)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
              {loading ? 'Submitting...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
