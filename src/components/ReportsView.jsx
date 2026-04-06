import { useState, useEffect } from 'react';
import { fetchReports } from '../api';
import './ReportsView.css';

function EmptySection({ icon, title, message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
      <span style={{ fontSize: '2rem', opacity: 0.4, marginBottom: '0.5rem' }}>{icon}</span>
      <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.3rem' }}>{title}</h4>
      <p style={{ fontSize: '0.82rem', textAlign: 'center', maxWidth: '300px' }}>{message}</p>
    </div>
  );
}

export default function ReportsView() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [wasteBreakdown, setWasteBreakdown] = useState([]);
  const [topAreas, setTopAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchReports();
        setMonthlyData(data.monthlyData || []);
        setWasteBreakdown(data.wasteBreakdown || []);
        setTopAreas(data.topAreas || []);
      } catch (err) {
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="reports-view fade-in-up" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading reports...</div>
      </div>
    );
  }

  const hasMonthly = monthlyData.length > 0;
  const hasWaste = wasteBreakdown.length > 0;
  const hasAreas = topAreas.length > 0;
  const maxWaste = hasMonthly ? Math.max(...monthlyData.map(d => d.waste)) : 0;

  // If completely empty
  if (!hasMonthly && !hasWaste && !hasAreas) {
    return (
      <div className="reports-view fade-in-up">
        <div className="view-header">
          <div>
            <h2 className="view-title">📊 Reports &amp; Analytics</h2>
            <p className="view-subtitle">Performance overview and waste collection analytics</p>
          </div>
        </div>
        <EmptySection
          icon="📊"
          title="No report data yet"
          message="Reports will generate automatically as waste collection data accumulates from WhatsApp pickups and manual entries."
        />
      </div>
    );
  }

  return (
    <div className="reports-view fade-in-up">
      <div className="view-header">
        <div>
          <h2 className="view-title">📊 Reports &amp; Analytics</h2>
          <p className="view-subtitle">Performance overview and waste collection analytics</p>
        </div>
        {hasMonthly && (
          <div className="report-period">
            <span className="period-label">{monthlyData[0]?.month} – {monthlyData[monthlyData.length - 1]?.month}</span>
          </div>
        )}
      </div>

      {/* Monthly Trend Chart */}
      {hasMonthly ? (
        <div className="report-card chart-card">
          <h3 className="report-card-title">Monthly Waste Collection Trend</h3>
          <div className="bar-chart">
            {monthlyData.map((d, i) => (
              <div key={d.month} className="bar-group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="bar-value">{d.waste.toLocaleString()} kg</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${maxWaste > 0 ? (d.waste / maxWaste) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="bar-label">{d.month.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="report-card">
          <h3 className="report-card-title">Monthly Waste Collection Trend</h3>
          <EmptySection icon="📈" title="No monthly data" message="Monthly trends will appear once waste is collected." />
        </div>
      )}

      <div className="reports-grid">
        {/* Waste Breakdown */}
        <div className="report-card">
          <h3 className="report-card-title">Waste Type Breakdown</h3>
          {hasWaste ? (
            <div className="breakdown-list">
              {wasteBreakdown.map(w => (
                <div key={w.type} className="breakdown-item">
                  <div className="breakdown-header">
                    <div className="breakdown-dot" style={{ background: w.color }}></div>
                    <span className="breakdown-type">{w.type}</span>
                    <span className="breakdown-kg">{w.kg.toLocaleString()} kg</span>
                    <span className="breakdown-pct">{w.percent}%</span>
                  </div>
                  <div className="breakdown-bar-track">
                    <div className="breakdown-bar-fill" style={{ width: `${w.percent}%`, background: w.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptySection icon="🗂️" title="No breakdown data" message="Waste type distribution will appear as data comes in." />
          )}
        </div>

        {/* Top Areas */}
        <div className="report-card">
          <h3 className="report-card-title">Top Collection Areas</h3>
          {hasAreas ? (
            <div className="areas-list">
              {topAreas.map((a, i) => (
                <div key={a.area} className="area-item">
                  <span className="area-rank">#{i + 1}</span>
                  <div className="area-info">
                    <span className="area-name">📍 {a.area}</span>
                    <span className="area-details">{a.pickups} pickups · {a.kg} kg</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptySection icon="📍" title="No area data" message="Top areas will populate as pickups are completed across Nagpur." />
          )}
        </div>

        {/* Monthly summary table */}
        {hasMonthly && (
          <div className="report-card full-width">
            <h3 className="report-card-title">Monthly Summary</h3>
            <div className="summary-table-wrap">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Waste Collected</th>
                    <th>Pickups</th>
                    <th>New Donors</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((d, i) => {
                    const prev = monthlyData[i - 1];
                    const trend = prev ? ((d.waste - prev.waste) / prev.waste * 100).toFixed(1) : '—';
                    const isUp = prev && d.waste > prev.waste;
                    return (
                      <tr key={d.month} className="summary-row">
                        <td className="td-month">{d.month}</td>
                        <td className="td-weight">{d.waste.toLocaleString()} kg</td>
                        <td>{d.pickups}</td>
                        <td>{d.donors}</td>
                        <td className={`td-trend ${isUp ? 'up' : 'down'}`}>
                          {trend === '—' ? '—' : `${isUp ? '↑' : '↓'} ${Math.abs(trend)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
