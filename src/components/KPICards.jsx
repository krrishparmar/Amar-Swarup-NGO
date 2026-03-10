import { useEffect, useState, useRef } from 'react';
import './KPICards.css';

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
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
    <span ref={ref} className="kpi-value">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function KPICards({ data, onTabChange }) {
  const tabMap = {
    'Total Waste Collected': 'Reports',
    "Today's Scheduled Pickups": 'Pickups',
    'Active WhatsApp Leads': 'Dashboard',
    'Total Donors Registered': 'Donors',
    'Pickups Completed This Month': 'Pickups',
  };

  return (
    <section className="kpi-section">
      {data.map((kpi, index) => (
        <div
          key={kpi.label}
          className="kpi-card fade-in-up"
          style={{ animationDelay: `${index * 0.08}s` }}
          onClick={() => onTabChange && onTabChange(tabMap[kpi.label] || 'Dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onTabChange && onTabChange(tabMap[kpi.label] || 'Dashboard')}
        >
          <div className="kpi-icon">{kpi.icon}</div>
          <AnimatedCounter end={kpi.value} suffix={kpi.suffix} />
          <span className="kpi-label">{kpi.label}</span>
          <div className="kpi-shine"></div>
        </div>
      ))}
    </section>
  );
}
