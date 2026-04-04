import { useState, useEffect } from 'react';
import { fetchReports } from '../api';
import './ReportsView.css';

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
        setMonthlyData(data.monthlyData);
        setWasteBreakdown(data.wasteBreakdown);
        setTopAreas(data.topAreas);
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

  const maxWaste = Math.max(...monthlyData.map(d => d.waste));

  return (
    <div className="reports-view fade-in-up">
      <div className="view-header">
        <div>
          <h2 className="view-title">📊 Reports &amp; Analytics</h2>
          <p className="view-subtitle">Performance overview and waste collection analytics</p>
        </div>
        <div className="report-period">
          <span className="period-label">Oct 2024 – Mar 2025</span>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="report-card chart-card">
        <h3 className="report-card-title">Monthly Waste Collection Trend</h3>
        <div className="bar-chart">
          {monthlyData.map((d, i) => (
            <div key={d.month} className="bar-group" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="bar-value">{d.waste.toLocaleString()} kg</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${(d.waste / maxWaste) * 100}%` }}
                ></div>
              </div>
              <div className="bar-label">{d.month.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports-grid">
        {/* Waste Breakdown */}
        <div className="report-card">
          <h3 className="report-card-title">Waste Type Breakdown</h3>
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
        </div>

        {/* Top Areas */}
        <div className="report-card">
          <h3 className="report-card-title">Top Collection Areas</h3>
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
        </div>

        {/* Monthly summary table */}
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
      </div>
    </div>
  );
}
