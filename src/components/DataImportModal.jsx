import { useState, useEffect } from 'react';
import { bulkImportLeads } from '../api';

// Column mapping from common CSV headers to our schema
const COLUMN_MAP = {
  name: ['name', 'full name', 'fullname', 'donor', 'contact'],
  location: ['location', 'address', 'area', 'zone', 'city'],
  phone: ['phone', 'mobile', 'contact number', 'phone number', 'cell'],
  wasteType: ['waste type', 'wastetype', 'waste_type', 'type', 'waste'],
  date: ['date', 'pickup date', 'collection date'],
  time: ['time', 'pickup time'],
  weight: ['weight', 'kg', 'weight (kg)', 'weight_kg'],
  status: ['status'],
};

function mapHeaders(headers) {
  const mapping = {};
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

  for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
    const idx = normalizedHeaders.findIndex(h => aliases.includes(h));
    if (idx !== -1) {
      mapping[field] = idx;
    }
  }
  return mapping;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(parseCSVLine);
  return { headers, rows };
}

/* ─── Toast Component ─── */
function ImportToast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.4)', text: '#4ade80', icon: '✓' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', icon: '✕' },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.8rem 1.2rem', border: `1px solid ${c.border}`,
      borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
      fontFamily: "'Inter', sans-serif", zIndex: 2000,
      background: c.bg, color: c.text,
      boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(12px)',
      animation: 'fadeInUp 0.35s ease forwards',
    }}>
      <span style={{ fontWeight: 800 }}>{c.icon}</span>
      <span>{message}</span>
    </div>
  );
}

export default function DataImportModal({ onClose, onSubmit }) {
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [colMapping, setColMapping] = useState({});
  const [previewRecords, setPreviewRecords] = useState([]);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [step, setStep] = useState('upload'); // upload | preview | done

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv' || ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { headers, rows } = parseCSV(event.target.result);
        processData(headers, rows);
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      // Try dynamic import of SheetJS
      import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs')
        .then((XLSX) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const wb = XLSX.read(new Uint8Array(event.target.result), { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
            if (jsonData.length > 0) {
              const headers = jsonData[0].map(String);
              const rows = jsonData.slice(1).map(r => r.map(c => String(c ?? '')));
              processData(headers, rows);
            }
          };
          reader.readAsArrayBuffer(file);
        })
        .catch(() => {
          // Fallback: try reading as CSV
          const reader = new FileReader();
          reader.onload = (event) => {
            const { headers, rows } = parseCSV(event.target.result);
            processData(headers, rows);
          };
          reader.readAsText(file);
        });
    }
  };

  const processData = (headers, rows) => {
    setRawHeaders(headers);
    setRawRows(rows);
    setAllRows(rows);
    const mapping = mapHeaders(headers);
    setColMapping(mapping);

    // Build preview records
    const records = rows.map(row => buildRecord(row, mapping));
    setPreviewRecords(records);
    setStep('preview');
  };

  const buildRecord = (row, mapping) => {
    const now = new Date();
    return {
      name: mapping.name !== undefined ? row[mapping.name] || 'Unknown' : 'Unknown',
      location: mapping.location !== undefined ? row[mapping.location] || '' : '',
      phone: mapping.phone !== undefined ? row[mapping.phone] || '' : '',
      wasteType: mapping.wasteType !== undefined ? row[mapping.wasteType] || 'Other' : 'Other',
      date: mapping.date !== undefined ? row[mapping.date] || now.toISOString().split('T')[0] : now.toISOString().split('T')[0],
      time: mapping.time !== undefined ? row[mapping.time] || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      weight: mapping.weight !== undefined ? parseFloat(row[mapping.weight]) || 0 : 0,
      status: mapping.status !== undefined ? row[mapping.status] || 'Pending' : 'Pending',
    };
  };

  const handleImport = async () => {
    if (previewRecords.length === 0) return;
    setImporting(true);
    try {
      const result = await bulkImportLeads(previewRecords);
      setToast({ message: `${result.count} records imported successfully`, type: 'success' });
      setStep('done');
      setTimeout(() => {
        onSubmit();
      }, 1500);
    } catch (err) {
      setToast({ message: `Import failed: ${err.message}`, type: 'error' });
    } finally {
      setImporting(false);
    }
  };

  const modalStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const contentStyle = {
    background: 'var(--bg-card)',
    padding: '2rem',
    borderRadius: '16px',
    width: '720px',
    maxWidth: '92vw',
    maxHeight: '85vh',
    overflowY: 'auto',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '0.6rem 0.8rem',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-muted)',
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 600,
  };

  const tdStyle = {
    padding: '0.55rem 0.8rem',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem',
  };

  const mappedFields = Object.keys(colMapping);
  const unmappedFields = Object.keys(COLUMN_MAP).filter(f => !mappedFields.includes(f));

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} className="fade-in-up" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", margin: 0 }}>📥 Import CSV / XLSX Data</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>

        {step === 'upload' && (
          <>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file. Columns will be auto-mapped to the database schema.
            </p>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: '12px',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.8rem', fontSize: '2rem' }}>📄</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.6rem', fontSize: '0.85rem' }}>Drag & drop or click to select</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{ ...inputStyle, cursor: 'pointer' }}
              />
            </div>
          </>
        )}

        {step === 'preview' && (
          <>
            {/* Mapping info */}
            <div style={{
              display: 'flex', gap: '0.6rem', flexWrap: 'wrap',
              marginBottom: '1rem', padding: '0.8rem',
              background: 'rgba(74, 222, 128, 0.06)',
              border: '1px solid rgba(74, 222, 128, 0.15)',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>
                ✓ Mapped: {mappedFields.join(', ')}
              </span>
              {unmappedFields.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
                  ⚠ Unmapped (defaults used): {unmappedFields.join(', ')}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
              Preview: <strong>{previewRecords.length}</strong> records found
            </p>

            <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Waste Type</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Weight</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRecords.slice(0, 20).map((rec, i) => (
                    <tr key={i} style={{ transition: 'background 0.15s' }}>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)' }}>{rec.name}</td>
                      <td style={tdStyle}>{rec.location}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.72rem' }}>{rec.phone}</td>
                      <td style={tdStyle}>{rec.wasteType}</td>
                      <td style={tdStyle}>{rec.date}</td>
                      <td style={{ ...tdStyle, color: 'var(--accent)', fontWeight: 600 }}>{rec.weight} kg</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          background: 'rgba(251, 191, 36, 0.12)',
                          color: '#fbbf24',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                        }}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewRecords.length > 20 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.6rem' }}>
                  ...and {previewRecords.length - 20} more records
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setStep('upload'); setRawHeaders([]); setRawRows([]); setPreviewRecords([]); }}
                style={{
                  flex: 1, padding: '0.75rem', background: 'transparent',
                  border: '1px solid var(--border)', color: 'var(--text-primary)',
                  borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                  fontFamily: "'Inter', sans-serif", fontSize: '0.82rem',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: importing ? 'var(--bg-primary)' : 'var(--accent)',
                  border: 'none',
                  color: importing ? 'var(--text-muted)' : '#fff',
                  borderRadius: '8px',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  fontWeight: 600, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem',
                }}
              >
                {importing ? 'Importing…' : `Import ${previewRecords.length} Records`}
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>✅</p>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Import Complete!</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              {previewRecords.length} records have been saved to the database.
            </p>
          </div>
        )}
      </div>

      {toast && (
        <ImportToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
