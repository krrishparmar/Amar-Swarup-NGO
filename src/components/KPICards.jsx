import { useEffect, useState, useRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import useTilt from '../hooks/useTilt';
import './KPICards.css';

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setDone(false);
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDone(true);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={`kpi-value${done ? ' counting-done' : ''}`}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function KPICard({ kpi, index, filter, getFilteredValue, getFilteredLabel, onTabChange, tabMap }) {
  const tilt = useTilt({ maxTilt: 4, scale: 1.03, speed: 500 });

  return (
    <div
      className="kpi-card fade-in-up"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => onTabChange && onTabChange(tabMap[kpi.label] || 'Dashboard')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onTabChange && onTabChange(tabMap[kpi.label] || 'Dashboard')}
      onMouseMove={tilt.onMouseMove}
      onMouseEnter={tilt.onMouseEnter}
      onMouseLeave={tilt.onMouseLeave}
    >
      <div className="kpi-icon">{kpi.icon}</div>
      <AnimatedCounter end={getFilteredValue(kpi.value)} suffix={kpi.suffix} key={filter + kpi.value} />
      <span className="kpi-label">{getFilteredLabel(kpi.label)}</span>
      <div className="kpi-shine"></div>
    </div>
  );
}

export default function KPICards({ data, onTabChange }) {
  const [filter, setFilter] = useState('Monthly');
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  if (!data || data.length === 0) {
    return (
      <section className="kpi-section">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', gridColumn: '1 / -1' }}>
          No KPI data available yet.
        </div>
      </section>
    );
  }

  const tabMap = {
    'Total Waste Collected': 'Reports',
    "Today's Scheduled Pickups": 'Pickups',
    'Active WhatsApp Leads': 'Dashboard',
    'Total Donors Registered': 'Donors',
    'Pickups Completed': 'Pickups',
  };

  const getFilteredValue = (val) => {
    if (filter === 'Daily') return Math.floor(val / 30) || 1;
    if (filter === 'Yearly') return val * 12;
    return val;
  };

  const getFilteredLabel = (label) => {
    if (label.includes('This Month')) return label.replace('This Month', `This ${filter.replace('ly', '')}`);
    return label;
  };

  return (
    <div
      ref={sectionRef}
      className={`scroll-reveal${isVisible ? ' is-visible' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer', outline: 'none' }}
        >
          <option value="Daily">Daily</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>
      <section className="kpi-section">
        {data.map((kpi, index) => (
          <KPICard
            key={kpi.label}
            kpi={kpi}
            index={index}
            filter={filter}
            getFilteredValue={getFilteredValue}
            getFilteredLabel={getFilteredLabel}
            onTabChange={onTabChange}
            tabMap={tabMap}
          />
        ))}
      </section>
    </div>
  );
}
