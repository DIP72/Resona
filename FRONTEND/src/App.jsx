import React, { useState } from 'react';
import { WeatherProvider } from './context/WeatherContext';
import TopNavbar, { INDIAN_LOCATIONS } from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import AlertBannerRow from './components/AlertBannerRow';
import IndiaDisasterMap from './components/IndiaDisasterMap';
import ActiveAlertsList from './components/ActiveAlertsList';
import EmergencyModeCard from './components/EmergencyModeCard';
import QuickActionsCard from './components/QuickActionsCard';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastCard from './components/ForecastCard';
import RiskLevelCard from './components/RiskLevelCard';
import RecentAlertsTimeline from './components/RecentAlertsTimeline';
import SafetyInstructionsModal from './components/SafetyInstructionsModal';
import IncidentReportModal from './components/IncidentReportModal';
import AuthModal from './components/AuthModal';
import MobileBottomNav from './components/MobileBottomNav';
import MultilingualAlertAI from './components/MultilingualAlertAI';
import { sound } from './utils/audioSynth';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState(INDIAN_LOCATIONS[0]); // Bhubaneswar, Odisha
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'map' | 'alerts' | 'forecast' | 'reports' | 'resources' | 'settings'
  const [activeHazardFilter, setActiveHazardFilter] = useState(null); // 'cyclone' | 'flood' | etc.
  
  // Modals state
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [emergencyModeActive, setEmergencyModeActive] = useState(true);

  // Quick actions handlers
  const handleOpenAuth = (mode = 'login') => {
    sound.playBlip();
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenSafety = () => {
    sound.playBlip();
    setIsSafetyModalOpen(true);
  };

  const handleOpenReport = () => {
    sound.playBlip();
    setIsReportModalOpen(true);
  };

  const handleDownloadAlerts = () => {
    sound.playSuccessChime();
    window.print();
  };

  const handleShareLocation = () => {
    sound.playBlip();
    if (navigator.share) {
      navigator.share({
        title: `Disaster Alert: ${currentLocation.city}, ${currentLocation.state}`,
        text: `Severe weather alert active for ${currentLocation.city}. Risk Level: ${currentLocation.risk}.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Disaster Alert for ${currentLocation.city}, ${currentLocation.state}: Emergency situation active. Check https://weatheralert.gov.in`
      );
      alert('Location Emergency Alert link copied to clipboard!');
    }
  };

  return (
    <WeatherProvider city={currentLocation.city}>
      <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans selection:bg-[#38BDF8]/30 selection:text-[#38BDF8] relative overflow-x-hidden">
        
        {/* Ambient Background Glow Highlights for Glassmorphism Depth */}
        <div className="fixed top-24 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed bottom-24 right-1/4 w-[32rem] h-[32rem] bg-rose-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 1. Top Modern Disaster Command Navbar */}
        <TopNavbar
          currentLocation={currentLocation}
          onSelectLocation={(loc) => {
            sound.playBlip();
            setCurrentLocation(loc);
          }}
          onOpenSafetyModal={handleOpenSafety}
          onOpenAuthModal={handleOpenAuth}
          emergencyModeActive={emergencyModeActive}
          onToggleEmergencyMode={() => setEmergencyModeActive(!emergencyModeActive)}
        />

        {/* 2. Main Layout Body with Left Sidebar & Content Canvas */}
        <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
          
          {/* Left Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tabId) => {
              sound.playBlip();
              setActiveTab(tabId);
              if (tabId === 'multilingual') {
                const el = document.getElementById('multilingual-alert-ai');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            onOpenSafetyModal={handleOpenSafety}
          />

          {/* Right Main Dashboard Workspace */}
          <main className="flex-1 p-3.5 sm:p-5 lg:p-6 space-y-4 lg:space-y-5 overflow-x-hidden pb-20 md:pb-6">
          
          {/* Row 1: Top Hazard Alert Banner Cards (Cyclone, Flood, Thunderstorm, Heatwave, Wind) */}
          <section>
            <AlertBannerRow
              activeFilter={activeHazardFilter}
              onSelectFilter={(cat) => {
                sound.playBlip();
                setActiveHazardFilter(cat);
              }}
            />
          </section>

          {/* Row 2: Central Map & Alert Command Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* India Disaster Risk Map (6 cols on xl, 6 cols on lg) */}
            <div className="lg:col-span-12 xl:col-span-6">
              <IndiaDisasterMap
                onSelectAlertZone={(zone) => {
                  sound.playBlip();
                }}
                onSelectLocation={(loc) => {
                  sound.playBlip();
                  setCurrentLocation(loc);
                }}
              />
            </div>

            {/* Active Alerts List (3 cols on xl, 6 cols on lg) */}
            <div className="lg:col-span-6 xl:col-span-3">
              <ActiveAlertsList
                activeFilter={activeHazardFilter}
                onSelectAlert={(alert) => {
                  handleOpenSafety();
                }}
              />
            </div>

            {/* Emergency Mode Card & Quick Actions (3 cols on xl, 6 cols on lg) */}
            <div className="lg:col-span-6 xl:col-span-3 flex flex-col gap-3.5">
              <EmergencyModeCard
                onOpenSafetyModal={handleOpenSafety}
                isActive={emergencyModeActive}
              />

              <QuickActionsCard
                onFindShelter={handleOpenSafety}
                onEmergencyContacts={handleOpenSafety}
                onDownloadAlerts={handleDownloadAlerts}
                onShareLocation={handleShareLocation}
                onReportIncident={handleOpenReport}
              />
            </div>

          </section>

          {/* Row 2.5: Multilingual Alert AI Engine (Vernacular Language Auto-Detection & Citizen Dispatch) */}
          <section id="multilingual-alert-ai">
            <MultilingualAlertAI
              currentLocation={currentLocation}
              activeHazard={activeHazardFilter || 'cyclone'}
              severity={currentLocation.risk === 'Very High' ? 'Extreme' : currentLocation.risk === 'High' ? 'Severe' : 'Moderate'}
            />
          </section>

          {/* Row 3: Bottom Analytics & Forecast Cards (4-column grid matching screenshot) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Current Weather */}
            <CurrentWeatherCard
              location={currentLocation}
            />

            {/* Card 2: 5 Day Forecast */}
            <ForecastCard />

            {/* Card 3: Risk Level Donut Gauge */}
            <RiskLevelCard />

            {/* Card 4: Recent Alerts Timeline */}
            <RecentAlertsTimeline
              onSelectAlert={(a) => handleOpenSafety()}
            />

          </section>

          {/* MongoDB Verification & Operational Data Strip */}
          <section className="p-3.5 rounded-2xl bg-[#0E1730]/75 backdrop-blur-md border border-[#1E2C4F] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400 shadow-xl card-hover-lift">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
              <span>Backend & Database:</span>
              <span className="text-emerald-300 font-semibold">mongodb://localhost:27017/resona_db</span>
              <span className="hidden md:inline text-slate-600">• users & alerts synced</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenAuth('database')}
                className="text-[#38BDF8] hover:underline"
              >
                Inspect MongoDB Users
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => handleOpenAuth('login')}
                className="text-slate-300 hover:text-white"
              >
                Switch Account
              </button>
            </div>
          </section>

        </main>

      </div>

      {/* 3. Safety & Evacuation Modal */}
      <SafetyInstructionsModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      {/* 4. Incident Report Modal */}
      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        location={currentLocation}
      />

      {/* 5. MongoDB Authentication Modal (Login / Register / User Directory) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* 6. Responsive Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          sound.playBlip();
          setActiveTab(tab);
        }}
        onOpenSafetyModal={handleOpenSafety}
        onOpenAuthModal={() => handleOpenAuth('login')}
      />

      </div>
    </WeatherProvider>
  );
}
