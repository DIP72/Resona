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
  Sparkles
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
    <header className="sticky top-0 z-30 h-14 bg-[#090D18]/85 backdrop-blur-xl border-b border-white/[0.06] px-4 lg:px-6 flex items-center justify-between gap-4 transition-colors">
      
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-400/20 flex items-center justify-center shadow-md">
          <CloudLightning className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">
              Resona<span className="text-sky-400">Alert</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot-green" title="IMD & NASA Telemetry Online" />
          </div>
        </div>
      </div>

      {/* Center: Search Location Bar */}
      <div className="flex-1 max-w-md relative hidden md:block" ref={searchRef}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search monitoring zone or station..."
            className="w-full pl-9 pr-12 py-1.5 bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] focus:border-cyan-400/50 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all"
          />
          <kbd className="absolute right-2.5 top-1.5 text-[9px] font-mono text-slate-500 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">
            ⌘K
          </kbd>
        </div>

        {/* Search Dropdown Results */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0D1324] border border-white/[0.09] rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="p-2 border-b border-white/[0.06] text-[10px] font-mono text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Target Disaster Hubs</span>
              <span className="text-cyan-400">10 Cities</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.city}
                  onClick={() => {
                    onSelectLocation(loc);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-medium text-white">{loc.city}</span>
                    <span className="text-slate-500 text-[10px]">({loc.state})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-mono text-xs">{loc.temp}°C</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Location Pill, Atmosphere, Notifications, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Active Location Pill */}
        <div className="relative" ref={locRef}>
          <button
            onClick={() => setLocationMenuOpen(!locationMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-200 transition-all shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium text-white">{currentLocation.city}</span>
            <span className="font-mono text-sky-300 text-[11px] font-semibold">
              {current?.temp ?? currentLocation.temp}°C
            </span>
          </button>

          {locationMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0D1324] border border-white/[0.09] rounded-xl shadow-2xl p-2 z-50">
              <div className="text-[10px] font-mono text-slate-400 px-2 py-1 border-b border-white/[0.06] flex items-center justify-between">
                <span>Active Ground Stations</span>
                <span className="text-emerald-400 text-[10px]">● Live</span>
              </div>
              <div className="max-h-60 overflow-y-auto mt-1 space-y-0.5">
                {locationsWithLiveData.map((loc) => (
                  <button
                    key={loc.city}
                    onClick={() => {
                      onSelectLocation(loc);
                      setLocationMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      loc.city === currentLocation.city 
                        ? 'bg-cyan-500/15 text-cyan-300 font-medium' 
                        : 'text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{loc.city}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{loc.temp}°C</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Atmosphere Wallpaper Switcher & Quick Pexels Shuffle */}
        <div className="flex items-center bg-white/[0.04] rounded-lg border border-white/[0.08] p-0.5 shadow-sm">
          <button
            onClick={onOpenWallpaperModal}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300 hover:text-white transition-all rounded-md hover:bg-white/[0.06]"
            title="Atmospheric Wallpaper Settings (Pexels 4K)"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline text-xs font-medium">Atmosphere</span>
          </button>
          {onShuffleWallpaper && (
            <button
              onClick={() => {
                sound.playBlip();
                onShuffleWallpaper();
              }}
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] rounded-md transition-all border-l border-white/[0.06]"
              title="Shuffle to a new Pexels background now"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all relative"
            title="Alert Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090D18]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0D1324] border border-white/[0.09] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="font-semibold text-xs text-white">Emergency Broadcasts</span>
                <span className="text-[10px] text-cyan-400 font-mono">Real-Time</span>
              </div>
              <div className="divide-y divide-white/[0.04] max-h-60 overflow-y-auto mt-1">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 px-1 hover:bg-white/[0.02] transition-colors">
                    <span className="text-xs font-semibold text-rose-300 block">{n.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              if (isAuthenticated) setUserMenuOpen(!userMenuOpen);
              else onOpenAuthModal('login');
            }}
            className="w-7 h-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white flex items-center justify-center text-xs font-medium transition-all shadow-sm"
            title={isAuthenticated ? currentUser?.name : 'Login to Command Center'}
          >
            {isAuthenticated ? currentUser?.name?.[0]?.toUpperCase() || 'A' : <User className="w-3.5 h-3.5 text-slate-300" />}
          </button>

          {userMenuOpen && isAuthenticated && (
            <div className="absolute right-0 mt-2 w-52 bg-[#0D1324] border border-white/[0.09] rounded-xl shadow-2xl p-2 z-50">
              <div className="px-2 py-1.5 border-b border-white/[0.06]">
                <div className="font-semibold text-xs text-white truncate">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{currentUser?.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 mt-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-2 font-mono"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
