import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudLightning, 
  Search, 
  MapPin, 
  Bell, 
  User, 
  AlertTriangle, 
  Check, 
  LogOut, 
  Database,
  X,
  Radio,
  ExternalLink,
  Globe,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

export const INDIAN_LOCATIONS = [
  { city: 'Bhubaneswar', state: 'Odisha', risk: 'Low', temp: 24, condition: 'Clouds', wind: '10 km/h' },
  { city: 'Puri', state: 'Odisha', risk: 'Low', temp: 25, condition: 'Clouds', wind: '16 km/h' },
  { city: 'Cuttack', state: 'Odisha', risk: 'Low', temp: 24, condition: 'Clouds', wind: '11 km/h' },
  { city: 'Kolkata', state: 'West Bengal', risk: 'Low', temp: 28, condition: 'Clouds', wind: '5 km/h' },
  { city: 'Patna', state: 'Bihar', risk: 'Moderate', temp: 24, condition: 'Rain', wind: '8 km/h' },
  { city: 'Jaipur', state: 'Rajasthan', risk: 'Low', temp: 24, condition: 'Clouds', wind: '6 km/h' },
  { city: 'Chennai', state: 'Tamil Nadu', risk: 'Low', temp: 29, condition: 'Clouds', wind: '11 km/h' },
  { city: 'Mumbai', state: 'Maharashtra', risk: 'Low', temp: 28, condition: 'Clouds', wind: '13 km/h' },
  { city: 'Guwahati', state: 'Assam', risk: 'Moderate', temp: 24, condition: 'Rain', wind: '6 km/h' },
  { city: 'Delhi', state: 'Delhi NCR', risk: 'Low', temp: 23, condition: 'Clouds', wind: '11 km/h' }
];

export function getVernacularBadgeText(loc) {
  if (!loc) return 'Odia (ଓଡ଼ିଆ)';
  const s = ((loc.state || '') + ' ' + (loc.city || '')).toLowerCase();
  if (s.includes('odisha') || s.includes('puri') || s.includes('bhubaneswar') || s.includes('cuttack')) return 'Odia (ଓଡ଼ିଆ)';
  if (s.includes('bengal') || s.includes('kolkata')) return 'Bengali (বাংলা)';
  if (s.includes('tamil') || s.includes('chennai')) return 'Tamil (தமிழ்)';
  if (s.includes('andhra') || s.includes('telangana') || s.includes('hyderabad') || s.includes('visakhapatnam')) return 'Telugu (తెలుగు)';
  if (s.includes('maharashtra') || s.includes('mumbai') || s.includes('pune')) return 'Marathi (मराठी)';
  if (s.includes('gujarat') || s.includes('ahmedabad')) return 'Gujarati (ગુજરાતી)';
  if (s.includes('karnataka') || s.includes('bengaluru')) return 'Kannada (ಕನ್ನಡ)';
  if (s.includes('kerala') || s.includes('kochi')) return 'Malayalam (മലയാളം)';
  if (s.includes('assam') || s.includes('guwahati')) return 'Assamese (অসমীয়া)';
  if (s.includes('punjab') || s.includes('chandigarh')) return 'Punjabi (ਪੰਜਾਬੀ)';
  return 'Hindi (हिन्दी)';
}

export default function TopNavbar({ 
  currentLocation, 
  onSelectLocation, 
  onOpenSafetyModal,
  onOpenAuthModal,
  onNavigateToAuth,
  onOpenWallpaperModal,
  onShuffleWallpaper,
  emergencyModeActive,
  onToggleEmergencyMode
}) {
  const { currentUser, isAuthenticated, logout, mongoUri } = useAuth();
  const { current, allCities, liveAlerts, lastUpdated, refresh, loading: weatherLoading } = useWeather();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const locRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (locRef.current && !locRef.current.contains(e.target)) setLocationMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const locationsWithLiveData = INDIAN_LOCATIONS.map(loc => {
    const liveMatch = (allCities || []).find(c => 
      c.city.toLowerCase() === loc.city.toLowerCase() ||
      c.city.toLowerCase().includes(loc.city.toLowerCase()) ||
      loc.city.toLowerCase().includes(c.city.toLowerCase())
    );
    if (liveMatch) {
      return {
        ...loc,
        temp: liveMatch.temp,
        condition: liveMatch.condition,
        description: liveMatch.description,
        risk: liveMatch.riskLevel || loc.risk,
        wind: `${liveMatch.wind_speed} km/h`,
        isRealTime: true,
      };
    }
    return loc;
  });

  const filteredLocations = locationsWithLiveData.filter(loc =>
    loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const notifications = liveAlerts?.length > 0 
    ? liveAlerts.slice(0, 5).map(a => ({
        id: a.id,
        title: a.title,
        time: 'Just now',
        severity: a.category === 'cyclone' ? 'red' : 'amber',
        text: a.description
      }))
    : [
        { id: 1, title: 'OpenWeather Sensor Feed Active', time: 'Live', severity: 'green', text: 'Telemetry synced with IMD / OpenWeather network.' }
      ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 px-6 flex items-center justify-between gap-6 transition-all duration-300">
      
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-600/20 border border-sky-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/0 via-white/10 to-sky-400/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <CloudLightning className="w-5 h-5 text-sky-400 relative z-10 drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-white">
              Resona<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Alert</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" title="IMD & NASA Telemetry Online" />
          </div>
          <div className="text-[11px] text-slate-400 font-sans font-medium mt-0.5">Emergency response platform</div>
        </div>
      </div>

      {/* Center: Search Location Bar */}
      <div className="flex-1 max-w-xl relative hidden lg:block" ref={searchRef}>
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-hover:text-sky-400 stroke-[1.8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search monitoring zone or station..."
            className="w-full pl-10 pr-12 py-2 bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-sky-500/50 focus:bg-slate-900/80 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all duration-300 shadow-inner"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
            ⌘K
          </kbd>
        </div>

        {/* Search Dropdown Results */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3.5 py-2.5 bg-slate-800/40 border-b border-white/5 text-xs font-medium text-slate-300 font-sans flex justify-between items-center">
              <span>Target disaster hubs</span>
              <span className="text-sky-300 bg-sky-400/10 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-sky-400/20">10 cities</span>
            </div>
            <div className="max-h-64 overflow-y-auto no-scrollbar">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.city}
                  onClick={() => {
                    onSelectLocation(loc);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 stroke-[1.8]" />
                    </div>
                    <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{loc.city}</span>
                    <span className="text-slate-400 text-xs font-normal">({loc.state})</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-white/5">
                    <span className="text-slate-300 font-mono text-xs">{loc.temp}°C</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Location Pill, Atmosphere, Notifications, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Active Location Pill */}
        <div className="relative" ref={locRef}>
          <button
            onClick={() => setLocationMenuOpen(!locationMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 text-sm text-slate-200 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-sky-400 stroke-[1.8]" />
            <span className="font-medium text-white">{currentLocation.city}</span>
            <span className="font-mono text-sky-300 text-xs font-medium bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
              {current?.temp ?? currentLocation.temp}°C
            </span>
          </button>

          {locationMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3.5 py-2.5 bg-slate-800/40 border-b border-white/5 text-xs font-medium text-slate-300 font-sans flex items-center justify-between">
                <span>Active ground stations</span>
                <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Live</span>
              </div>
              <div className="max-h-64 overflow-y-auto no-scrollbar py-1">
                {locationsWithLiveData.map((loc) => (
                  <button
                    key={loc.city}
                    onClick={() => {
                      onSelectLocation(loc);
                      setLocationMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                      loc.city === currentLocation.city 
                        ? 'bg-sky-500/15 text-sky-300 font-semibold' 
                        : 'text-slate-300 hover:bg-white/5 font-medium'
                    }`}
                  >
                    <span>{loc.city}</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-md ${loc.city === currentLocation.city ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-950/50 text-slate-400'}`}>{loc.temp}°C</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Atmosphere Wallpaper Switcher & Quick Pexels Shuffle */}
        <div className="flex items-center bg-slate-900/50 rounded-xl border border-white/10 p-1 shadow-sm h-[38px]">
          <button
            onClick={onOpenWallpaperModal}
            className="flex items-center gap-2 px-2.5 h-full text-xs font-semibold text-slate-300 hover:text-white transition-all rounded-lg hover:bg-white/10"
            title="Atmospheric Wallpaper Settings (Pexels 4K)"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Atmosphere</span>
          </button>
          {onShuffleWallpaper && (
            <button
              onClick={() => {
                onShuffleWallpaper();
              }}
              className="px-2 h-full text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-all border-l border-white/10 flex items-center justify-center"
              title="Shuffle to a new Pexels background now"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-[38px] h-[38px] flex items-center justify-center rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all relative shadow-sm"
            title="Alert Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 bg-slate-800/40 border-b border-white/5 flex items-center justify-between">
                <span className="font-semibold text-sm text-white">Emergency broadcasts</span>
                <span className="text-[10px] text-rose-300 font-sans font-bold bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">LIVE</span>
              </div>
              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto no-scrollbar">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-white/5 transition-colors group cursor-default">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-rose-200 group-hover:text-rose-100 transition-colors">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Status Badge & Profile Avatar */}
        {isAuthenticated && currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              onClick={() => onNavigateToAuth ? onNavigateToAuth() : onOpenAuthModal('login')}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 shadow-sm cursor-pointer ${
                currentUser?.role === 'Volunteer' || currentUser?.role === 'Emergency Responder' || currentUser?.role === 'Citizen / Volunteer'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.08)]'
                  : currentUser?.role === 'Disaster Management Officer'
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-200 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.08)]'
                  : 'bg-sky-500/10 border-sky-500/25 text-sky-200 hover:bg-sky-500/20 shadow-[0_0_10px_rgba(56,189,248,0.08)]'
              }`}
              title="Click to view Identity & Roles portal"
            >
              {currentUser?.role === 'Volunteer' || currentUser?.role === 'Emergency Responder' || currentUser?.role === 'Citizen / Volunteer' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                  <span>Volunteer</span>
                  <span className="text-[10px] text-emerald-400/80 font-normal">Relief Corps</span>
                </>
              ) : currentUser?.role === 'Disaster Management Officer' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                  <span>Commander</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-sky-400 stroke-[1.8]" />
                  <span>Citizen</span>
                  <span className="text-[10px] text-sky-400/80 font-normal">Resident</span>
                </>
              )}
            </button>

            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-white/15 text-white flex items-center justify-center text-xs font-semibold transition-all shadow-md cursor-pointer"
                title={currentUser?.name}
              >
                {currentUser?.name?.[0]?.toUpperCase() || 'U'}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-slate-800/40 border-b border-white/5">
                    <div className="font-semibold text-sm text-white truncate">{currentUser?.name}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser?.email}</div>
                    <div className="mt-2 inline-block">
                      <span className="text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {currentUser?.role || 'Citizen'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    {onNavigateToAuth && (
                      <button
                        onClick={() => {
                          onNavigateToAuth();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-sky-400" /> Identity & Roles
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => onNavigateToAuth ? onNavigateToAuth() : onOpenAuthModal('login')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] cursor-pointer"
            title="Sign in as Citizen or Relief Volunteer"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}

      </div>

    </header>
  );
}
