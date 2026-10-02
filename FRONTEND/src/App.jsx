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
import ContactActionModal from './components/ContactActionModal';
import { notificationService } from './utils/notificationService';
import { openDeviceSms, openWhatsAppChat } from './utils/directDispatch';
import { MessageSquare, X as CloseIcon, Smartphone, BellRing } from 'lucide-react';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState(INDIAN_LOCATIONS[0]); // Bhubaneswar, Odisha
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'multilingual' | 'map' | 'alerts' | 'forecast' | 'reports' | 'resources' | 'settings'
  const [activeHazardFilter, setActiveHazardFilter] = useState(null); // 'cyclone' | 'flood' | etc.

  const [contactModalState, setContactModalState] = useState({
    isOpen: false,
    contact: null,
    defaultMessage: ''
  });
  const [activeBroadcastToast, setActiveBroadcastToast] = useState(null);

  useEffect(() => {
    const handleOpenContact = (e) => {
      if (e.detail?.contact) {
        setContactModalState({
          isOpen: true,
          contact: e.detail.contact,
          defaultMessage: e.detail.defaultMessage || ''
        });
      }
    };

    const handleBroadcastEvent = (e) => {
      if (e.detail) {
        setActiveBroadcastToast(e.detail);
      }
    };

    window.addEventListener('resona-open-contact-modal', handleOpenContact);
    window.addEventListener('resona-emergency-broadcast', handleBroadcastEvent);
    return () => {
      window.removeEventListener('resona-open-contact-modal', handleOpenContact);
      window.removeEventListener('resona-emergency-broadcast', handleBroadcastEvent);
    };
  }, []);
  
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

        {/* Ambient Aurora Gradient Mesh Motion Behind All Panels */}
        <div className="aurora-mesh-bg">
          <div className="aurora-orb-cyan" />
          <div className="aurora-orb-indigo" />
          <div className="aurora-orb-rose" />
        </div>

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
                    currentLocation={currentLocation}
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
                      currentLocation={currentLocation}
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
                      currentLocation={currentLocation}
                      activeFilter={activeHazardFilter}
                      onSelectAlert={(alert) => handleOpenSafety()}
                      onOpenSafety={handleOpenSafety}
                      onExplainInLanguage={() => setActiveTab('multilingual')}
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
                      <span>Multilingual Voice & Community Safety</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Live weather advisories and spoken audio in 27 Indian mother tongues — helping families, elders, and neighbors stay safe together.
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
                      <Map className="w-5 h-5 text-teal-400 stroke-[1.8]" />
                      <span>Live interactive map</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Live weather observations, rain zones, and monitored oceanic storm tracks across India.
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
                    currentLocation={currentLocation}
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
                      <Bell className="w-5 h-5 text-amber-400 stroke-[1.8]" />
                      <span>Alerts & regional safety</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Verified weather warnings, oceanic storm tracking, and plain-language community guidance.
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
                      currentLocation={currentLocation}
                      activeFilter={activeHazardFilter}
                      onSelectAlert={(alert) => handleOpenSafety()}
                      onOpenSafety={handleOpenSafety}
                      onExplainInLanguage={() => setActiveTab('multilingual')}
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
                      <CloudRain className="w-5 h-5 text-teal-400 stroke-[1.8]" />
                      <span>Weather & 5-day forecast</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Live weather observations and 5-day forecast for {currentLocation.city}, {currentLocation.state}.
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
                      <FileText className="w-5 h-5 text-teal-400 stroke-[1.8]" />
                      <span>Citizen reports & community help</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Report road blockages or power cuts, ask for assistance, or download safety bulletins.
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
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <h3 className="font-semibold text-white text-sm font-sans">Report an issue or ask help</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                        Share ground observations such as waterlogged roads, fallen trees, or elder assistance needs with response teams.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenReport}
                      className="mt-4 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Report issue now
                    </button>
                  </div>

                  <div className="weather-card p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-600/15 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-3">
                        <Download className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <h3 className="font-semibold text-white text-sm font-sans">Download bulletin</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                        Save a formatted PDF summary of all active warnings to keep on hand offline.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadAlerts}
                      className="mt-4 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[1.8]" /> Download summary
                    </button>
                  </div>

                  <div className="weather-card p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                        <ShieldAlert className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <h3 className="font-semibold text-white text-sm font-sans">Emergency safety guide</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                        Review NDMA and Odisha Disaster Management safety guidelines, evacuation steps, and shelter maps.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenSafety}
                      className="mt-4 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-xl transition-all shadow-md cursor-pointer"
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
                      <Layers className="w-5 h-5 text-teal-400 stroke-[1.8]" />
                      <span>Shelters & emergency helplines</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Nearby certified cyclone shelters, medical response contacts, and essential supplies checklist.
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
                          <a href={`tel:${h.num}`} className="text-teal-300 font-semibold text-sm hover:underline bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-500/20">
                            {h.num}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Multipurpose Cyclone Shelters Directory */}
                  <div className="weather-card p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-semibold text-white font-sans flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-teal-400 stroke-[1.8]" />
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
                      <span>Settings & preferences</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Preferences, data sync status, and audio notifications.
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

        {/* Global Floating Emergency Broadcast Notification Toast */}
        {activeBroadcastToast && (
          <div className="fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-2xl bg-[#0b1022]/95 border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)] backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <BellRing className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                      EMERGENCY BROADCAST
                    </span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {activeBroadcastToast.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setActiveBroadcastToast(null)}
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-200 mt-2 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
              {activeBroadcastToast.body}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Dispatched to cellular phones
              </span>

              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveTab('multilingual');
                  setActiveBroadcastToast(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                View Broadcast Hub
              </button>
            </div>
          </div>
        )}

        {/* Global Interactive Contact Dispatch Modal */}
        <ContactActionModal
          isOpen={contactModalState.isOpen}
          contact={contactModalState.contact}
          defaultMessage={contactModalState.defaultMessage}
          onClose={() => setContactModalState({ isOpen: false, contact: null, defaultMessage: '' })}
        />

        </div>
      </div>
    </WeatherProvider>
  );
}
