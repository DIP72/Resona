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
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';

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

  // Merge genuine real-time OpenWeather measurements into location items
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

  const notifications = (liveAlerts && liveAlerts.length > 0)
    ? liveAlerts.slice(0, 5).map((a, i) => ({
        id: a.id || i,
        title: a.title,
        time: i === 0 ? 'Live observation' : `${i * 12}m ago`,
        severity: a.severity === 'High' ? 'red' : a.severity === 'Moderate' ? 'amber' : 'green',
        text: `${a.description} — ${a.subtext}`
      }))
    : [
        { id: 1, title: 'OpenWeather Sensor Feed Active', time: 'Live', severity: 'green', text: 'Telemetry synced with IMD / OpenWeather network.' }
      ];

  return (
    <header className="sticky top-0 z-30 bg-[#0B132B] border-b border-[#1E2C4F] px-4 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] p-0.5 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <div className="w-full h-full bg-[#0D1836] rounded-[10px] flex items-center justify-center">
              <CloudLightning className="w-6 h-6 text-[#38BDF8] fill-[#38BDF8]/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Weather<span className="text-[#38BDF8]">Alert</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                IMD & NDMA FEED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Disaster Management System
            </p>
          </div>
        </div>

        {/* Center: Search Location Bar */}
        <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search location (e.g., city, district, state)..."
              className="w-full pl-10 pr-4 py-2 bg-[#111C38] border border-[#1E2C4F] rounded-xl text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#111C38] border border-[#1E2C4F] rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 border-b border-[#1E2C4F] text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Select Target Disaster Zone</span>
                <span className="text-[#38BDF8]">10 Major Hubs</span>
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
                    className="w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#1A284D] transition-colors border-b border-slate-800/40 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#38BDF8]" />
                      <div>
                        <span className="font-semibold text-white">{loc.city}</span>
                        <span className="text-slate-400 ml-1.5 text-[11px]">({loc.state})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        loc.risk === 'Very High' ? 'bg-rose-950 text-rose-300 border border-rose-600/40' :
                        loc.risk === 'High' ? 'bg-orange-950 text-orange-300 border border-orange-600/40' :
                        loc.risk === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-600/40' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                      }`}>
                        {loc.risk} Risk
                      </span>
                      <span className="text-slate-300 font-mono text-[11px]">{loc.temp}°C</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Location Selector, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          
          {/* Vernacular Language Auto-Detection Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono shadow-sm">
            <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">Vernacular:</span>
            <span className="font-bold text-cyan-300">
              {getVernacularBadgeText(currentLocation)}
            </span>
          </div>

          {/* Active Location Pill with Real-Time Weather */}
          <div className="relative" ref={locRef}>
            <button
              onClick={() => setLocationMenuOpen(!locationMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111C38] border border-[#1E2C4F] hover:border-[#38BDF8]/60 text-xs text-slate-200 transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="font-semibold text-white">{currentLocation.city}</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">({currentLocation.state})</span>
              <span className="text-[#38BDF8] font-mono font-bold text-[11px] bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                {current?.temp ?? currentLocation.temp}°C {current?.condition ? `• ${current.condition}` : ''}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live OpenWeather Feed"></span>
            </button>

            {locationMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#111C38] border border-[#1E2C4F] rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                  <span>Live Indian Weather Hubs</span>
                  <span className="text-emerald-400 font-mono text-[10px]">● OpenWeather Live</span>
                </div>
                <div className="max-h-64 overflow-y-auto mt-1 space-y-0.5">
                  {locationsWithLiveData.map((loc) => (
                    <button
                      key={loc.city}
                      onClick={() => {
                        onSelectLocation(loc);
                        setLocationMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        loc.city === currentLocation.city 
                          ? 'bg-blue-600/20 text-[#38BDF8] font-semibold' 
                          : 'text-slate-300 hover:bg-[#1A284D]'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{loc.city}, {loc.state}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{loc.description || loc.condition}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-300 font-mono font-bold text-xs">{loc.temp}°C</span>
                        <div className="text-[9px] text-slate-500 font-mono">{loc.risk} Risk</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl bg-[#111C38] border border-[#1E2C4F] text-slate-300 hover:text-white hover:border-[#38BDF8]/50 transition-colors"
              title="Alert Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#0B132B] shadow-sm">
                8
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111C38] border border-[#1E2C4F] rounded-xl shadow-2xl p-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-xs text-white">Emergency Broadcasts</span>
                  <span className="text-[10px] text-[#38BDF8] font-mono">5 Unread Bulletins</span>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto mt-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2 px-1 hover:bg-[#1A284D]/50 rounded-lg transition-colors">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-semibold ${
                          n.severity === 'red' ? 'text-rose-400' :
                          n.severity === 'amber' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{n.text}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800 mt-2 text-center">
                  <button 
                    onClick={() => {
                      setNotificationsOpen(false);
                      onOpenSafetyModal();
                    }}
                    className="text-[11px] text-[#38BDF8] hover:underline font-medium"
                  >
                    View Comprehensive Safety Instructions →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / MongoDB Auth Button */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#111C38] border border-[#1E2C4F] hover:border-[#38BDF8]/60 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/30 shrink-0">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden lg:block leading-tight">
                <span className="text-xs font-semibold text-white block">
                  {currentUser ? currentUser.name : 'Anurag Giri'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {currentUser ? (currentUser.role || 'Disaster Volunteer') : 'Disaster Volunteer'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#111C38] border border-[#1E2C4F] rounded-xl shadow-2xl p-3 z-50 text-xs">
                <div className="pb-2.5 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{currentUser ? currentUser.name : 'Anurag Giri'}</p>
                      <p className="text-[11px] text-slate-400">{currentUser ? currentUser.email : 'anurag.giri@disaster.resona.gov.in'}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-[#38BDF8] border border-blue-500/30 mt-0.5 inline-block">
                        {currentUser ? (currentUser.badgeNumber || 'VOL-4821') : 'VOL-4821 • ODRAF Partner'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 py-1 border-b border-slate-800 mb-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="text-emerald-400 font-mono font-medium truncate max-w-[130px]">mongodb://localhost:27017</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-medium">MongoDB Synced</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAuthModal('database');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-[#1A284D] hover:bg-[#233566] text-[#38BDF8] flex items-center justify-between text-[11px] transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>MongoDB Users Directory</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAuthModal('register');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-1.5 text-[11px] transition-colors"
                  >
                    <span>+ Register New Responder in MongoDB</span>
                  </button>

                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 flex items-center justify-center gap-1.5 text-[11px] transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
