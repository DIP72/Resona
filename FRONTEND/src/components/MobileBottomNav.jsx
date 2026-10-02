import React from 'react';
import { Home, Map, Bell, Globe, UserCheck } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { useWeather } from '../context/WeatherContext';

export default function MobileBottomNav({ activeTab, onSelectTab }) {
  const { liveAlerts } = useWeather();
  const alertCount = liveAlerts?.length || 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C111C]/90 backdrop-blur-2xl border-t border-white/10 px-5 py-2.5 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          activeTab === 'dashboard' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-teal-500/20 text-teal-300' : ''}`}>
          <Home className="w-5 h-5 stroke-[1.8]" />
        </div>
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('multilingual')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          activeTab === 'multilingual' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'multilingual' ? 'bg-teal-500/20 text-teal-300' : ''}`}>
          <Globe className="w-5 h-5 stroke-[1.8]" />
        </div>
        <span>Languages</span>
      </button>

      <button
        onClick={() => onSelectTab('map')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          activeTab === 'map' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'map' ? 'bg-teal-500/20 text-teal-300' : ''}`}>
          <Map className="w-5 h-5 stroke-[1.8]" />
        </div>
        <span>Live map</span>
      </button>

      <button
        onClick={() => onSelectTab('alerts')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors relative ${
          activeTab === 'alerts' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'alerts' ? 'bg-amber-500/20 text-amber-300' : ''}`}>
          <Bell className="w-5 h-5 stroke-[1.8]" />
        </div>
        <span>Alerts</span>
        {alertCount > 0 && (
          <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-medium text-slate-950 flex items-center justify-center border-2 border-slate-950">
            <AnimatedCounter value={alertCount} />
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('auth')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          activeTab === 'auth' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'auth' ? 'bg-teal-500/20 text-teal-300' : ''}`}>
          <UserCheck className="w-5 h-5 stroke-[1.8]" />
        </div>
        <span>Community</span>
      </button>
    </nav>
  );
}
