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
import { fetchKPI, fetchLeads, fetchLeaderboard, fetchActivity } from './api';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');

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
    } catch (error) {
      console.error('Error decoding JWT', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setActiveTab('Dashboard');
  };

  // Fetch dashboard data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadDashboardData() {
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
    }

    loadDashboardData();
  }, [isAuthenticated]);

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
            <KPICards data={kpiData} onTabChange={setActiveTab} />
            <LeadsTable leads={whatsappLeads} />
            <div className="bottom-section">
              <Leaderboard donors={donors} />
              <ActivityFeed activities={activityFeed} />
            </div>
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

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userProfile={userProfile}
        onLogout={handleLogout}
      />
      <main className="dashboard-main" key={activeTab}>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
