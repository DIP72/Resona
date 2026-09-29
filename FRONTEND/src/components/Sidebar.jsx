import React from 'react';
import { 
  Home, 
  Map, 
  Bell, 
  CloudRain, 
  FileText, 
  Layers, 
  Settings, 
  ShieldCheck,
  Globe,
  UserCheck
} from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

export default function Sidebar({ activeTab, onSelectTab, onOpenSafetyModal }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'multilingual', label: 'Vernacular AI', icon: Globe, badge: 'AI' },
    { id: 'auth', label: 'Identity & Roles', icon: UserCheck, badge: 'Roles' },
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: Bell, badgeCount: 7 },
    { id: 'forecast', label: 'Forecast', icon: CloudRain },
    { id: 'reports', label: 'Disaster Reports', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950/40 backdrop-blur-2xl border-r border-white/5 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-64px)] z-20 relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.02] before:to-transparent before:pointer-events-none">
      
      {/* Navigation Links */}
      <div className="space-y-1.5 p-4 relative z-10 overflow-y-auto no-scrollbar">
        <div className="px-3 py-1.5 text-xs font-medium text-slate-400 font-sans tracking-normal mb-1">
          Operations console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {/* Active Background & Indicator */}
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/15 via-sky-500/5 to-transparent rounded-xl transition-all duration-300"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-sky-400 rounded-r-full shadow-[0_0_12px_rgba(56,189,248,0.6)]"></div>
                </>
              )}
              
              {/* Hover Background - Smooth gradient extended from active treatment */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.06] via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              )}

              <div className="flex items-center gap-3 relative z-10">
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-sky-500/20 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]' : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.06]'}`}>
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                </div>
                <span className="text-[13px]">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 relative z-10">
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-medium transition-colors ${isActive ? 'bg-sky-500/20 text-sky-200 border border-sky-500/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 group-hover:border-slate-600'}`}>
                      {item.badge}
                    </span>
                  )}

                  {item.badgeCount && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-medium flex items-center justify-center ${isActive ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.25)]' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                      <AnimatedCounter value={item.badgeCount} />
                    </span>
                  )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Promo / Safety Widget */}
      <div className="p-4 relative z-10">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 shadow-xl relative group hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10 mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-white">Emergency hub</h4>
                <p className="text-[11px] text-slate-400 font-sans">NDMA verified feed</p>
              </div>
            </div>
            <button
              onClick={onOpenSafetyModal}
              className="relative w-full py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-xl text-xs font-medium text-slate-200 transition-all duration-300"
            >
              <span>View safety protocols</span>
            </button>
          </div>
      </div>

    </aside>
  );
}
