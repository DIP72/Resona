import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Globe, 
  CloudRain, 
  Bell, 
  Map, 
  FileText, 
  Layers, 
  Settings, 
  ShieldAlert, 
  PhoneCall, 
  Download, 
  AlertTriangle,
  Database,
  CheckCircle2,
  Phone
} from 'lucide-react';
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
import WallpaperSelector, { WALLPAPER_PRESETS } from './components/WallpaperSelector';
import { sound } from './utils/audioSynth';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState(INDIAN_LOCATIONS[0]); // Bhubaneswar, Odisha
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'multilingual' | 'map' | 'alerts' | 'forecast' | 'reports' | 'resources' | 'settings'
  const [activeHazardFilter, setActiveHazardFilter] = useState(null); // 'cyclone' | 'flood' | etc.
  
  // Atmospheric Wallpaper State
  const [currentBg, setCurrentBg] = useState(() => {
    try {
      const saved = localStorage.getItem('resona_dashboard_bg');
      return saved ? JSON.parse(saved) : WALLPAPER_PRESETS[0];
    } catch {
      return WALLPAPER_PRESETS[0];
    }
  });

  const [bgOpacity, setBgOpacity] = useState(() => {
    try {
      const saved = localStorage.getItem('resona_bg_opacity');
      return saved ? parseFloat(saved) : 0.82;
    } catch {
      return 0.82;
    }
  });

  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  const handleSelectBg = (bg) => {
    setCurrentBg(bg);
    try {
      localStorage.setItem('resona_dashboard_bg', JSON.stringify(bg));
    } catch {}
  };

  const handleChangeOpacity = (val) => {
    setBgOpacity(val);
    try {
      localStorage.setItem('resona_bg_opacity', val.toString());
    } catch {}
  };

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
        
        {/* Atmospheric Wallpaper Background Layer (Pinterest / Satellite / Coastal Storm) */}
        {currentBg?.url && (
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none -z-20 transform scale-105"
            style={{ backgroundImage: `url("${currentBg.url}")` }}
          />
        )}

        {/* Dynamic Dark Vignette & Glass Blending Overlay */}
        <div 
          className="fixed inset-0 pointer-events-none -z-10 transition-opacity duration-300"
          style={{ 
            backgroundColor: '#070D1E',
            opacity: currentBg?.url ? bgOpacity : 1,
            backdropFilter: currentBg?.url ? 'blur(1.5px)' : 'none'
          }}
        />

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
          onOpenWallpaperModal={() => {
            sound.playBlip();
            setIsWallpaperModalOpen(true);
          }}
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
            }}
            onOpenSafetyModal={handleOpenSafety}
          />

          {/* Right Main Dashboard Workspace (Driven by Tab Navigation) */}
          <main className="flex-1 p-3.5 sm:p-5 lg:p-6 space-y-4 lg:space-y-5 overflow-x-hidden pb-20 md:pb-6">
            
            {/* VIEW 1: MAIN DASHBOARD (Only Map & Live Feed Cockpit, Clean & Uncluttered) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Top Hazard Alert Banner (Hero Card for Active Emergency + Slim Status Strip for Inactive) */}
                <section>
                  <AlertBannerRow
                    activeFilter={activeHazardFilter}
                    onSelectFilter={(cat) => {
                      sound.playBlip();
                      setActiveHazardFilter(cat);
                    }}
                  />
                </section>

                {/* Central Map & Live Feed Cockpit (8 cols Map + 4 cols Feed & Actions) */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* Dominant Mapbox Web-GIS Centerpiece */}
                  <div className="lg:col-span-12 xl:col-span-8">
                    <IndiaDisasterMap
                      onSelectAlertZone={(zone) => sound.playBlip()}
                      onSelectLocation={(loc) => {
                        sound.playBlip();
                        setCurrentLocation(loc);
                      }}
                    />
                  </div>

                  {/* Docked Live Operations Column */}
                  <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-3.5">
                    
                    {/* Live Hazard Feed */}
                    <ActiveAlertsList
                      activeFilter={activeHazardFilter}
                      onSelectAlert={(alert) => handleOpenSafety()}
                    />

                    {/* Emergency Mode Protocol Card */}
                    <EmergencyModeCard
                      onOpenSafetyModal={handleOpenSafety}
                      isActive={emergencyModeActive}
                    />

                    {/* Tactical Quick Operations Card */}
                    <QuickActionsCard
                      onFindShelter={handleOpenSafety}
                      onEmergencyContacts={handleOpenSafety}
                      onDownloadAlerts={handleDownloadAlerts}
                      onShareLocation={handleShareLocation}
                      onReportIncident={handleOpenReport}
                    />
                  </div>

                </section>

                {/* Database Verification Strip */}
                <section className="p-3 rounded-xl bg-[#0E1730]/75 backdrop-blur-md border border-[#1E2C4F] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400 shadow-xl card-hover-lift">
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

              </div>
            )}

            {/* VIEW 2: VERNACULAR AI ALERT ENGINE */}
            {activeTab === 'multilingual' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                      <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span>Vernacular AI Disaster Alert Engine</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Multi-tier language translation, audio synthesis, visual infographic cards, and simulated citizen dispatch.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>

                <MultilingualAlertAI
                  currentLocation={currentLocation}
                  activeHazard={activeHazardFilter || 'cyclone'}
                  severity={currentLocation.risk === 'Very High' ? 'Extreme' : currentLocation.risk === 'High' ? 'Severe' : 'Moderate'}
                />
              </div>
            )}

            {/* VIEW 3: LIVE MAP (FULL-WIDTH IMMERSIVE) */}
            {activeTab === 'map' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                      <Map className="w-5 h-5 text-cyan-400" />
                      <span>Geospatial Disaster Command Map</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Full-viewport interactive Web-GIS with NASA EONET events and Doppler precipitation layers.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>

                <div className="w-full h-[720px] rounded-2xl overflow-hidden border border-[#1E2C4F] shadow-2xl">
                  <IndiaDisasterMap
                    onSelectAlertZone={(zone) => sound.playBlip()}
                    onSelectLocation={(loc) => {
                      sound.playBlip();
                      setCurrentLocation(loc);
                    }}
                  />
                </div>
              </div>
            )}

            {/* VIEW 4: ALERTS & THREAT ASSESSMENT CENTER */}
            {activeTab === 'alerts' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                      <Bell className="w-5 h-5 text-rose-400" />
                      <span>Alert Command & Threat Assessment Center</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time NASA satellite events, IMD warnings, and composite danger index gauges.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7">
                    <ActiveAlertsList
                      activeFilter={activeHazardFilter}
                      onSelectAlert={(alert) => handleOpenSafety()}
                    />
                  </div>
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <RiskLevelCard />
                    <RecentAlertsTimeline onSelectAlert={(a) => handleOpenSafety()} />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 5: FORECAST & METEOROLOGICAL INTELLIGENCE */}
            {activeTab === 'forecast' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                      <CloudRain className="w-5 h-5 text-[#38BDF8]" />
                      <span>Atmospheric Telemetry & 5-Day Outlook</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live ground station sensor measurements and 5-day predictive weather forecasting for {currentLocation.city}, {currentLocation.state}.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <CurrentWeatherCard location={currentLocation} />
                  <ForecastCard />
                </div>
              </div>
            )}

            {/* VIEW 6: DISASTER REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <span>Disaster Incident Reports & Situation Logs</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      File citizen SOS reports, inspect emergency logs, or download PDF bulletins for administrative record.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="weather-card p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">Citizen Incident / SOS</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Submit real-time ground observations, road blockages, flash floods, or power outages directly to emergency dispatch.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenReport}
                      className="mt-4 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-rose-950/50"
                    >
                      Report Incident Now
                    </button>
                  </div>

                  <div className="weather-card p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-3">
                        <Download className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">Download PDF Bulletin</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Generate and download an official formatted PDF summary of all active warnings for offline transmission.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadAlerts}
                      className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>

                  <div className="weather-card p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">Emergency Protocols</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Review NDMA and Odisha Disaster Management Authority safety dos & don'ts, evacuation guidelines, and shelter maps.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenSafety}
                      className="mt-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/50"
                    >
                      View Instructions
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 7: RESOURCES & SHELTERS */}
            {activeTab === 'resources' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-400" />
                      <span>Emergency Resources & Safe Shelters</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Nearest certified cyclone shelters, medical response contacts, and survival supplies checklist.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Emergency Helplines */}
                  <div className="weather-card p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-400" />
                      <span>National Emergency Helplines (24x7)</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      {[
                        { label: 'NDMA Central Control Room', num: '1070', desc: 'National Disaster Management Toll-Free' },
                        { label: 'NDRF Disaster Response Force', num: '1078', desc: 'Search and Rescue Dispatch' },
                        { label: 'All-in-One Emergency Responder', num: '112', desc: 'Police, Fire, Ambulance' },
                        { label: 'Medical Emergency & Trauma', num: '108', desc: 'Government Ambulance Dispatch' },
                        { label: 'Indian Coast Guard SAR', num: '1554', desc: 'Maritime & Sea Rescue' },
                      ].map((h) => (
                        <div key={h.num} className="p-2.5 rounded-xl bg-[#0D162E]/70 border border-[#1E2C4F] flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-white block">{h.label}</span>
                            <span className="text-[10px] text-slate-400">{h.desc}</span>
                          </div>
                          <a href={`tel:${h.num}`} className="font-mono text-cyan-300 font-bold text-sm hover:underline bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                            {h.num}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Multipurpose Cyclone Shelters Directory */}
                  <div className="weather-card p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-blue-400" />
                      <span>Certified Coastal Cyclone Shelters</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      {[
                        { name: 'Puri District Multipurpose Cyclone Center', cap: '2,500 Capacity', dist: '1.2 km away', status: 'Open' },
                        { name: 'Bhubaneswar EOC Community Center', cap: '1,800 Capacity', dist: '3.4 km away', status: 'Open' },
                        { name: 'Paradip Port High-Elevation Pucca Shelter', cap: '3,200 Capacity', dist: '5.1 km away', status: 'Open' },
                        { name: 'Ganjam Coastal Community Safe Complex', cap: '1,500 Capacity', dist: '7.8 km away', status: 'Open' },
                      ].map((s) => (
                        <div key={s.name} className="p-2.5 rounded-xl bg-[#0D162E]/70 border border-[#1E2C4F] flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-white block">{s.name}</span>
                            <span className="text-[10px] text-slate-400">{s.cap} • {s.dist}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 8: SETTINGS & SYSTEM PREFERENCES */}
            {activeTab === 'settings' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                      <Settings className="w-5 h-5 text-slate-400" />
                      <span>System Settings & Data Sync</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure telemetry ingest sources, MongoDB backend connections, and audio alerts.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>

                <div className="weather-card p-5 rounded-2xl max-w-2xl space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#0B132B] border border-[#1E2C4F] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">MongoDB Data Store</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                        Connected
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      mongodb://localhost:27017/resona_db
                    </p>
                    <button
                      onClick={() => handleOpenAuth('database')}
                      className="text-xs text-[#38BDF8] hover:underline font-mono"
                    >
                      Inspect Database Users Collection →
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B132B] border border-[#1E2C4F] space-y-2">
                    <span className="text-xs font-semibold text-white block">Telemetry API Feeds</span>
                    <ul className="text-xs text-slate-300 space-y-1.5 font-mono text-[11px]">
                      <li className="flex items-center justify-between">
                        <span>NASA Earth Observatory (EONET v3):</span>
                        <span className="text-cyan-400 font-bold">Active Live Stream</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>OpenWeatherMap Sensor Network:</span>
                        <span className="text-cyan-400 font-bold">Real-Time Ingestion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

        {/* 3. Mobile Navigation Bottom Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            sound.playBlip();
            setActiveTab(tabId);
          }}
          onOpenSafetyModal={handleOpenSafety}
          onOpenAuthModal={() => handleOpenAuth('login')}
        />

        {/* Modals & Popups */}
        <SafetyInstructionsModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
        />

        <IncidentReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <WallpaperSelector
          isOpen={isWallpaperModalOpen}
          onClose={() => setIsWallpaperModalOpen(false)}
          currentBg={currentBg}
          onSelectBg={handleSelectBg}
          bgOpacity={bgOpacity}
          onChangeOpacity={handleChangeOpacity}
        />

      </div>
    </WeatherProvider>
  );
}
