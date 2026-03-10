import './Footer.css';

export default function Footer() {
  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        <div className="footer-tagline">
          🌿 Building a cleaner, greener Nagpur — one pickup at a time.
        </div>
        <div className="footer-bottom">
          <span>© 2025 Amar Swarup Foundation, Nagpur</span>
          <span className="footer-divider">|</span>
          <a href="#privacy" className="footer-link">Privacy Policy</a>
          <span className="footer-divider">|</span>
          <a href="#terms" className="footer-link">Terms</a>
        </div>
      </div>
    </footer>
  );
}
