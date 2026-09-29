import React, { useState, useEffect } from 'react';
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
import AuthPage from './components/AuthPage';
import MobileBottomNav from './components/MobileBottomNav';
import MultilingualAlertAI from './components/MultilingualAlertAI';
import WallpaperSelector, { WALLPAPER_PRESETS } from './components/WallpaperSelector';
import { 
  fetchRandomPexelsWallpaper, 
  isPexelsAutoRefreshEnabled, 
  setPexelsAutoRefreshEnabled,
  getCachedFallbackWallpaper 
} from './services/pexelsService';
import { sound } from './utils/audioSynth';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState(INDIAN_LOCATIONS[0]); // Bhubaneswar, Odisha
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'multilingual' | 'map' | 'alerts' | 'forecast' | 'reports' | 'resources' | 'settings'
  const [activeHazardFilter, setActiveHazardFilter] = useState(null); // 'cyclone' | 'flood' | etc.
  
  // Dynamic Pexels Auto-Refresh State
  const [isAutoRefresh, setIsAutoRefresh] = useState(isPexelsAutoRefreshEnabled);

  // Atmospheric Wallpaper State - Always ensure a valid photographic wallpaper is active
  const [currentBg, setCurrentBg] = useState(() => {
    try {
      const saved = localStorage.getItem('resona_dashboard_bg');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.url && parsed.url.trim().length > 0) {
          return parsed;
        }
      }
      return getCachedFallbackWallpaper();
    } catch {
      return getCachedFallbackWallpaper();
    }
  });

  const [bgOpacity, setBgOpacity] = useState(() => {
    try {
      const saved = localStorage.getItem('resona_bg_opacity');
      const parsed = saved ? parseFloat(saved) : 0.35;
      return parsed > 0.6 ? 0.35 : parsed;
    } catch {
      return 0.35;
    }
  });

  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  // AUTOMATIC DYNAMIC PEXELS ROTATION:
  // Every time the user opens the website or refreshes (F5), automatically fetch a fresh Pexels storm photo
  useEffect(() => {
    let isMounted = true;
    fetchRandomPexelsWallpaper().then((newBg) => {
      if (isMounted && newBg && newBg.url) {
        setCurrentBg(newBg);
        try {
          localStorage.setItem('resona_dashboard_bg', JSON.stringify(newBg));
        } catch {}
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleSelectBg = (bg) => {
    setCurrentBg(bg);
    try {
      localStorage.setItem('resona_dashboard_bg', JSON.stringify(bg));
    } catch {}
  };

  const handleShuffleWallpaper = async () => {
    try {
      const newBg = await fetchRandomPexelsWallpaper();
      if (newBg && newBg.url) {
        setCurrentBg(newBg);
        try {
          localStorage.setItem('resona_dashboard_bg', JSON.stringify(newBg));
        } catch {}
        return newBg;
      }
    } catch (err) {
      console.warn('Error shuffling wallpaper:', err);
    }
  };

  const handleToggleAutoRefresh = (enabled) => {
    setIsAutoRefresh(enabled);
    setPexelsAutoRefreshEnabled(enabled);
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
      <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-[#38BDF8]/30 selection:text-[#38BDF8] relative overflow-x-hidden bg-[#070D1E]">
        
        {/* Dynamic High-Resolution Wallpaper Background Layer */}
        {currentBg?.url && (
          <div 
            key={currentBg.url}
            className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 pointer-events-none z-0 scale-100 animate-in fade-in"
            style={{ backgroundImage: `url("${currentBg.url}")` }}
          />
        )}

        {/* Dynamic Atmospheric Tint Overlay - Balances vivid wallpaper visibility with perfect UI readability */}
        {currentBg?.url && (
          <div 
            className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
            style={{ 
              background: 'linear-gradient(180deg, rgba(7, 13, 30, 0.42) 0%, rgba(7, 13, 30, 0.70) 100%)',
              backdropFilter: 'blur(1px)'
            }}
          />
        )}

        {/* Ambient Highlights for Glassmorphism Depth */}
        <div className="fixed top-24 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="fixed bottom-24 right-1/4 w-[32rem] h-[32rem] bg-rose-500/5 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Interactive App Content Layer (z-10 on top of wallpaper) */}
        <div className="relative z-10 flex flex-col min-h-screen">

        {/* 1. Top Modern Disaster Command Navbar */}
        <TopNavbar
          currentLocation={currentLocation}
          onSelectLocation={(loc) => {
            sound.playBlip();
            setCurrentLocation(loc);
          }}
          onOpenSafetyModal={handleOpenSafety}
          onOpenAuthModal={handleOpenAuth}
          onNavigateToAuth={() => {
            sound.playBlip();
            setActiveTab('auth');
          }}
          onOpenWallpaperModal={() => {
            sound.playBlip();
            setIsWallpaperModalOpen(true);
          }}
          onShuffleWallpaper={handleShuffleWallpaper}
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
              <div className="space-y-4 animate-page-enter">
                
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
                  <div className="lg:col-span-12 xl:col-span-4 flex flex-col">
                    {/* Live Hazard Feed */}
                    <ActiveAlertsList
                      activeFilter={activeHazardFilter}
                      onSelectAlert={(alert) => handleOpenSafety()}
                    />
                  </div>

                </section>

              </div>
            )}

            {/* VIEW 2: VERNACULAR AI ALERT ENGINE */}
            {activeTab === 'multilingual' && (
              <div className="space-y-4 animate-page-enter">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-normal flex items-center gap-2 font-sans">
                      <Globe className="w-5 h-5 text-cyan-400 stroke-[1.8]" />
                      <span>Vernacular AI alert engine</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Multi-tier language translation, audio synthesis, visual infographic cards, and simulated citizen dispatch.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Back to dashboard
                  </button>
                </div>

                <MultilingualAlertAI
                  currentLocation={currentLocation}
                  activeHazard={activeHazardFilter || 'cyclone'}
                  severity={currentLocation.risk === 'Very High' ? 'Extreme' : currentLocation.risk === 'High' ? 'Severe' : 'Moderate'}
                  onOpenAuthModal={handleOpenAuth}
                  onOpenReportModal={handleOpenReport}
                />
              </div>
            )}

            {/* VIEW 3: LIVE MAP (FULL-WIDTH IMMERSIVE) */}
            {activeTab === 'map' && (
              <div className="space-y-4 animate-page-enter">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-normal flex items-center gap-2 font-sans">
                      <Map className="w-5 h-5 text-cyan-400 stroke-[1.8]" />
                      <span>Geospatial disaster map</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Full-viewport interactive Web-GIS with NASA EONET events and Doppler precipitation layers.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Back to dashboard
                  </button>
                </div>

                <div className="w-full h-[720px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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
              <div className="space-y-4 animate-page-enter">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-normal flex items-center gap-2 font-sans">
                      <Bell className="w-5 h-5 text-rose-400 stroke-[1.8]" />
                      <span>Alerts & threat assessment</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Real-time NASA satellite events, IMD warnings, and composite danger index gauges.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Back to dashboard
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
              <div className="space-y-4 animate-page-enter">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-normal flex items-center gap-2 font-sans">
                      <CloudRain className="w-5 h-5 text-cyan-400 stroke-[1.8]" />
                      <span>Atmospheric telemetry & 5-day outlook</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Live ground station sensor measurements and 5-day predictive weather forecasting for {currentLocation.city}, {currentLocation.state}.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Back to dashboard
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
              <div className="space-y-4 animate-page-enter">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-normal flex items-center gap-2 font-sans">
                      <FileText className="w-5 h-5 text-amber-400 stroke-[1.8]" />
                      <span>Disaster incident reports & logs</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      File citizen SOS reports, inspect emergency logs, or download PDF bulletins for administrative record.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Back to dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="weather-card p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-rose-600/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <h3 className="font-semibold text-white text-sm font-sans">Citizen incident & SOS</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                        Submit real-time ground observations, road blockages, flash floods, or power outages directly to emergency dispatch.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenReport}
                      className="mt-4 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-xl transition-all shadow-md shadow-rose-950/40 cursor-pointer"
                    >
                      Report incident now
                    </button>
                  </div>

                  <div className="weather-card p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3">
                        <Download className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <h3 className="font-semibold text-white text-sm font-sans">Download bulletin</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                        Generate and download a formatted PDF summary of all active warnings for offline transmission.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadAlerts}
                      className="mt-4 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[1.8]" /> Download summary
                    </button>
                  </div>

                  <div className="weather-card p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                        <ShieldAlert className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <h3 className="font-semibold text-white text-sm font-sans">Emergency safety protocols</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                        Review NDMA and Odisha Disaster Management Authority safety guidelines, evacuation procedures, and shelter maps.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenSafety}
                      className="mt-4 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
                    >
                      View instructions
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 7: RESOURCES & SHELTERS */}
            {activeTab === 'resources' && (
              <div className="space-y-4 animate-page-enter">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-normal flex items-center gap-2 font-sans">
                      <Layers className="w-5 h-5 text-indigo-400 stroke-[1.8]" />
                      <span>Emergency resources & safe shelters</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Nearest certified cyclone shelters, medical response contacts, and survival supplies checklist.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Back to dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Emergency Helplines */}
                  <div className="weather-card p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-semibold text-white font-sans flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
                      <span>National emergency helplines (24x7)</span>
                    </h3>
                    <div className="space-y-2 text-xs font-sans">
                      {[
                        { label: 'NDMA central control room', num: '1070', desc: 'National Disaster Management Toll-Free' },
                        { label: 'NDRF disaster response force', num: '1078', desc: 'Search and Rescue Dispatch' },
                        { label: 'All-in-one emergency responder', num: '112', desc: 'Police, Fire, Ambulance' },
                        { label: 'Medical emergency & trauma', num: '108', desc: 'Government Ambulance Dispatch' },
                        { label: 'Indian coast guard SAR', num: '1554', desc: 'Maritime & Sea Rescue' },
                      ].map((h) => (
                        <div key={h.num} className="p-2.5 rounded-xl bg-[#0D162E]/70 border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-white block">{h.label}</span>
                            <span className="text-[11px] text-slate-400">{h.desc}</span>
                          </div>
                          <a href={`tel:${h.num}`} className="font-mono text-cyan-300 font-semibold text-sm hover:underline bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                            {h.num}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Multipurpose Cyclone Shelters Directory */}
                  <div className="weather-card p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-semibold text-white font-sans flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-cyan-400 stroke-[1.8]" />
                      <span>Certified coastal cyclone shelters</span>
                    </h3>
                    <div className="space-y-2 text-xs font-sans">
                      {[
                        { name: 'Puri District Multipurpose Cyclone Center', cap: '2,500 Capacity', dist: '1.2 km away', status: 'Open' },
                        { name: 'Bhubaneswar EOC Community Center', cap: '1,800 Capacity', dist: '3.4 km away', status: 'Open' },
                        { name: 'Paradip Port High-Elevation Pucca Shelter', cap: '3,200 Capacity', dist: '5.1 km away', status: 'Open' },
                        { name: 'Ganjam Coastal Community Safe Complex', cap: '1,500 Capacity', dist: '7.8 km away', status: 'Open' },
                      ].map((s) => (
                        <div key={s.name} className="p-2.5 rounded-xl bg-[#0D162E]/70 border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-white block">{s.name}</span>
                            <span className="text-[11px] text-slate-400">{s.cap} • {s.dist}</span>
                          </div>
                          <span className="text-xs font-sans text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
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
              <div className="space-y-4 animate-page-enter">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white tracking-normal flex items-center gap-2 font-sans">
                      <Settings className="w-5 h-5 text-slate-400 stroke-[1.8]" />
                      <span>System settings & data connection</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Configure telemetry ingest sources, MongoDB backend connections, and audio alerts.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Back to dashboard
                  </button>
                </div>

                <div className="weather-card p-5 rounded-2xl max-w-2xl space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#0B132B] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white font-sans">MongoDB data store</span>
                      <span className="text-xs font-sans text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                        Connected
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      mongodb://localhost:27017/resona_db
                    </p>
                    <button
                      onClick={() => handleOpenAuth('database')}
                      className="text-xs text-cyan-400 hover:underline font-sans cursor-pointer"
                    >
                      Inspect database users collection →
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B132B] border border-white/10 space-y-2">
                    <span className="text-xs font-medium text-white block font-sans">Telemetry API feeds</span>
                    <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                      <li className="flex items-center justify-between">
                        <span>NASA Earth Observatory (EONET v3):</span>
                        <span className="text-cyan-400 font-medium font-mono text-[11px]">Active live stream</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>OpenWeatherMap sensor network:</span>
                        <span className="text-cyan-400 font-medium font-mono text-[11px]">Real-time ingestion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 9: IDENTITY & ROLE PORTAL (CITIZEN VS VOLUNTEER) */}
            {activeTab === 'auth' && (
              <div className="animate-page-enter">
                <AuthPage
                  onNavigateToTab={(tab) => {
                    sound.playBlip();
                    setActiveTab(tab);
                  }}
                  onOpenSafety={handleOpenSafety}
                />
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
          onShufflePexels={handleShuffleWallpaper}
          isAutoRefresh={isAutoRefresh}
          onToggleAutoRefresh={handleToggleAutoRefresh}
        />

        </div>
      </div>
    </WeatherProvider>
  );
}
