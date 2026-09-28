import React from 'react';
import { Home, Map, Bell, Globe, MoreHorizontal, UserCheck } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { useWeather } from '../context/WeatherContext';

export default function MobileBottomNav({ activeTab, onSelectTab, onOpenSafetyModal, onOpenAuthModal }) {
  const { liveAlerts } = useWeather();
  const alertCount = liveAlerts?.length || 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-t border-white/10 px-6 py-3 flex items-center justify-between shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]">
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-1.5 text-[11px] font-bold transition-all duration-300 relative ${
          activeTab === 'dashboard' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === 'dashboard' ? 'bg-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : ''}`}>
          <Home className="w-5 h-5" />
        </div>
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('multilingual')}
        className={`flex flex-col items-center gap-1.5 text-[11px] font-bold transition-all duration-300 relative ${
          activeTab === 'multilingual' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === 'multilingual' ? 'bg-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : ''}`}>
          <Globe className="w-5 h-5" />
        </div>
        <span>AI Voice</span>
      </button>

      <button
        onClick={() => onSelectTab('map')}
        className={`flex flex-col items-center gap-1.5 text-[11px] font-bold transition-all duration-300 relative ${
          activeTab === 'map' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === 'map' ? 'bg-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : ''}`}>
          <Map className="w-5 h-5" />
        </div>
        <span>Map</span>
      </button>

      <button
        onClick={() => onSelectTab('alerts')}
        className={`flex flex-col items-center gap-1.5 text-[11px] font-bold transition-all duration-300 relative ${
          activeTab === 'alerts' ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === 'alerts' ? 'bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : ''}`}>
          <Bell className="w-5 h-5" />
        </div>
        <span>Alerts</span>
        {alertCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center border-2 border-slate-950 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse">
            <AnimatedCounter value={alertCount} />
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('auth')}
        className={`flex flex-col items-center gap-1.5 text-[11px] font-bold transition-all duration-300 relative ${
          activeTab === 'auth' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === 'auth' ? 'bg-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : ''}`}>
          <UserCheck className="w-5 h-5" />
        </div>
        <span>Roles</span>
      </button>
    </nav>
  );
}
