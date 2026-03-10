import { useState } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import LeadsTable from './components/LeadsTable';
import Leaderboard from './components/Leaderboard';
import ActivityFeed from './components/ActivityFeed';
import PickupsView from './components/PickupsView';
import DonorsView from './components/DonorsView';
import ReportsView from './components/ReportsView';
import Footer from './components/Footer';
import { kpiData, whatsappLeads, donors, activityFeed } from './data/mockData';
import LoginView from './components/LoginView';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');

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

  const renderContent = () => {
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
