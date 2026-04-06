import { useState } from 'react';

export default function DataEntryModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    wasteType: 'Plastic',
    weightRange: '10-20 kg',
    collectorName: '',
    location: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log('Submitted Entry:', formData);
    onSubmit();
  };

  const modalStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const contentStyle = {
    background: 'var(--bg-card)',
    padding: '2rem',
    borderRadius: '12px',
    width: '400px',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '6px',
    marginBottom: '1rem',
    marginTop: '0.3rem'
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle} className="fade-in-up">
        <h3 style={{ marginBottom: '1.5rem' }}>Add Manual Entry</h3>
        <form onSubmit={handleSubmit}>
          <label>Date</label>
          <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={inputStyle} required />

          <label>Waste Type</label>
          <select value={formData.wasteType} onChange={e => setFormData({ ...formData, wasteType: e.target.value })} style={inputStyle}>
            <option>Plastic</option>
            <option>E-Waste</option>
            <option>Paper</option>
            <option>Metal</option>
            <option>Mixed</option>
          </select>

          <label>Weight Range</label>
          <select value={formData.weightRange} onChange={e => setFormData({ ...formData, weightRange: e.target.value })} style={inputStyle}>
            <option>&lt;5 kg</option>
            <option>5-10 kg</option>
            <option>10-20 kg</option>
            <option>&gt;20 kg</option>
          </select>

          <label>Collector Name</label>
          <input type="text" placeholder="E.g. Rajesh Kumar" value={formData.collectorName} onChange={e => setFormData({ ...formData, collectorName: e.target.value })} style={inputStyle} required />

          <label>Location / Zone</label>
          <input type="text" placeholder="E.g. Dharampeth" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={inputStyle} required />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '0.8rem', background: 'var(--accent)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
