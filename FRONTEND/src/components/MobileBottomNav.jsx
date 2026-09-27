import React from 'react';
import { Home, Map, Bell, MoreHorizontal } from 'lucide-react';

export default function MobileBottomNav({ activeTab, onSelectTab, onOpenSafetyModal, onOpenAuthModal }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B132B]/95 backdrop-blur-md border-t border-[#1E2C4F] px-4 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          activeTab === 'dashboard' ? 'text-[#EF4444]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('map')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          activeTab === 'map' ? 'text-[#EF4444]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Map className="w-5 h-5" />
        <span>Map</span>
      </button>

      <button
        onClick={() => onSelectTab('alerts')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors relative ${
          activeTab === 'alerts' ? 'text-[#EF4444]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Bell className="w-5 h-5" />
        <span>Alerts</span>
        <span className="absolute -top-1 right-2 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-[9px] font-bold text-white flex items-center justify-center">
          5
        </span>
      </button>

      <button
        onClick={onOpenSafetyModal}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span>More</span>
      </button>
    </nav>
  );
}
