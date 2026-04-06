import { useState, useEffect } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import LeadsTable from './components/LeadsTable';
import Leaderboard from './components/Leaderboard';
import ActivityFeed from './components/ActivityFeed';
import PickupsView from './components/PickupsView';
import DonorsView from './components/DonorsView';
import ReportsView from './components/ReportsView';
import Footer from './components/Footer';
import LoginView from './components/LoginView';
import DriverLoginView from './components/DriverLoginView';
import DriverDashboard from './components/DriverDashboard';
import DataEntryModal from './components/DataEntryModal';
import DataImportModal from './components/DataImportModal';
import ChatbotWidget from './components/ChatbotWidget';
import { fetchKPI, fetchLeads, fetchLeaderboard, fetchActivity } from './api';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function App() {
  // Portal: 'admin' or 'driver'
  const [portalType, setPortalType] = useState(() => localStorage.getItem('portalType') || 'admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isDataImportOpen, setIsDataImportOpen] = useState(false);
  
  const defaultLayout = [
    { id: 'kpi', title: 'KPI Summary', visible: true },
    { id: 'leads', title: 'Recent Leads', visible: true },
    { id: 'bottom', title: 'Leaderboard & Activity', visible: true }
  ];
  const [dashboardLayout, setDashboardLayout] = useState(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : defaultLayout;
  });
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
  }, [dashboardLayout]);

  useEffect(() => {
    localStorage.setItem('portalType', portalType);
  }, [portalType]);

  // Check for stored sessions on mount
  useEffect(() => {
    const storedDriver = localStorage.getItem('driverProfile');
    if (storedDriver && portalType === 'driver') {
      setDriverProfile(JSON.parse(storedDriver));
      setIsAuthenticated(true);
    }
    const storedUser = localStorage.getItem('userProfile');
    if (storedUser && portalType === 'admin') {
      setUserProfile(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Dashboard data from API
  const [kpiData, setKpiData] = useState([]);
  const [whatsappLeads, setWhatsappLeads] = useState([]);
  const [donors, setDonors] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLoginSuccess = (credentialResponse) => {
    try {
      const decodedUser = jwtDecode(credentialResponse.credential);
      setUserProfile(decodedUser);
      setIsAuthenticated(true);
      setPortalType('admin');
      localStorage.setItem('userProfile', JSON.stringify(decodedUser));
    } catch (error) {
      console.error('Error decoding JWT', error);
    }
  };

  const handleEmailLogin = (user) => {
    const profile = {
      name: user.name,
      email: user.email,
      picture: null,
    };
    setUserProfile(profile);
    setIsAuthenticated(true);
    setPortalType('admin');
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleDriverLogin = (driver) => {
    setDriverProfile(driver);
    setIsAuthenticated(true);
    setPortalType('driver');
    localStorage.setItem('driverProfile', JSON.stringify(driver));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setDriverProfile(null);
    setActiveTab('Dashboard');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('driverProfile');
  };

  // Fetch dashboard data when authenticated as admin
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [kpi, leads, leaderboard, activity] = await Promise.all([
        fetchKPI(),
        fetchLeads(),
        fetchLeaderboard(),
        fetchActivity(),
      ]);
      setKpiData(kpi);
      setWhatsappLeads(leads);
      setDonors(leaderboard);
      setActivityFeed(activity);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshLeads = async () => {
    try {
      const [kpi, leads, leaderboard, activity] = await Promise.all([
        fetchKPI(),
        fetchLeads(),
        fetchLeaderboard(),
        fetchActivity(),
      ]);
      setKpiData(kpi);
      setWhatsappLeads(leads);
      setDonors(leaderboard);
      setActivityFeed(activity);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || portalType !== 'admin') return;
    loadDashboardData();
  }, [isAuthenticated, portalType]);

  const renderContent = () => {
    if (loading && activeTab === 'Dashboard') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading dashboard...</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'Dashboard':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button 
                onClick={() => setIsCustomizeOpen(true)}
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
              >
                ⚙️ Customize Layout
              </button>
            </div>
            {dashboardLayout.filter(l => l.visible).map(layout => {
              if (layout.id === 'kpi') return <KPICards key="kpi" data={kpiData} onTabChange={setActiveTab} />;
              if (layout.id === 'leads') return <LeadsTable key="leads" leads={whatsappLeads} onLeadsChange={refreshLeads} />;
              if (layout.id === 'bottom') return (
                <div key="bottom" className="bottom-section">
                  <Leaderboard donors={donors} />
                  <ActivityFeed activities={activityFeed} />
                </div>
              );
              return null;
            })}
          </>
        );
      case 'Pickups':
        return <PickupsView />;
      case 'Donors':
        return <DonorsView />;
      case 'Leaderboard':
        return <Leaderboard donors={donors} />;
      case 'Reports':
        return <ReportsView />;
      default:
        return null;
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('sourceIndex', index);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetIndex) => {
    const sourceIndex = e.dataTransfer.getData('sourceIndex');
    if (sourceIndex === '') return;
    const items = [...dashboardLayout];
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, reorderedItem);
    setDashboardLayout(items);
  };
  const toggleVisibility = (index) => {
    const items = [...dashboardLayout];
    items[index].visible = !items[index].visible;
    setDashboardLayout(items);
  };

  // ── Not authenticated ──
  if (!isAuthenticated) {
    if (portalType === 'driver') {
      return (
        <DriverLoginView
          onDriverLogin={handleDriverLogin}
          onSwitchToAdmin={() => setPortalType('admin')}
        />
      );
    }
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onEmailLogin={handleEmailLogin}
        onSwitchToDriver={() => setPortalType('driver')}
      />
    );
  }

  // ── Authenticated as driver ──
  if (portalType === 'driver' && driverProfile) {
    return <DriverDashboard driver={driverProfile} onLogout={handleLogout} />;
  }

  // ── Authenticated as admin ──
  return (
    <div className="dashboard">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userProfile={userProfile}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        onAddDataClick={() => setIsDataEntryOpen(true)}
        onImportDataClick={() => setIsDataImportOpen(true)}
      />
      <main className="dashboard-main" key={activeTab}>
        {renderContent()}
      </main>

      {/* Customize Layout Modal */}
      {isCustomizeOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', width: '300px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Customize Dashboard</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Drag to reorder. Toggle eye icon for visibility.</p>
            {dashboardLayout.map((item, index) => (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: 'var(--bg-primary)', marginBottom: '0.5rem', borderRadius: '6px', cursor: 'move', border: '1px solid var(--border)' }}
              >
                <span>{item.title}</span>
                <button onClick={() => toggleVisibility(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                  {item.visible ? '👁️' : '🚫'}
                </button>
              </div>
            ))}
            <button onClick={() => setIsCustomizeOpen(false)} style={{ width: '100%', padding: '0.8rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', marginTop: '1rem', cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}

      {isDataEntryOpen && <DataEntryModal onClose={() => setIsDataEntryOpen(false)} onSubmit={() => { setIsDataEntryOpen(false); refreshLeads(); }} />}
      {isDataImportOpen && <DataImportModal onClose={() => setIsDataImportOpen(false)} onSubmit={() => { setIsDataImportOpen(false); refreshLeads(); }} />}

      <Footer />
      <ChatbotWidget theme={theme} />
    </div>
  );
}

export default App;
