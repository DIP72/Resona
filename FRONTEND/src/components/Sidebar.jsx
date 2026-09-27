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
  Globe
} from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

export default function Sidebar({ activeTab, onSelectTab, onOpenSafetyModal }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'multilingual', label: 'Vernacular AI Alert', icon: Globe, badge: 'AI', isAi: true },
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: Bell, badgeCount: 5 },
    { id: 'forecast', label: 'Forecast', icon: CloudRain },
    { id: 'reports', label: 'Disaster Reports', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B132B]/85 backdrop-blur-xl border-r border-[#1E2C4F]/60 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-61px)] shadow-2xl z-20">
      
      {/* Navigation Links */}
      <div className="space-y-1.5">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Main Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-950/50 border-l-4 border-white'
                  : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-rose-500/15 hover:via-rose-600/5 hover:to-transparent hover:border-l-4 hover:border-rose-400/80 hover:shadow-md hover:shadow-rose-950/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-400'
                }`} />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-transform duration-200 group-hover:scale-105 ${
                  isActive 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                }`}>
                  {item.badge}
                </span>
              )}

              {item.badgeCount && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-transform duration-200 group-hover:scale-105 ${
                  isActive 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-scale-bounce'
                }`}>
                  <AnimatedCounter value={item.badgeCount} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Promo / Safety Widget with Storm Image */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1E2C4F] shadow-xl mt-6 group card-hover-lift">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: 'url("/storm_bg.jpg")' }}
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/80 to-transparent backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative p-4 text-left space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/80 backdrop-blur-md border border-blue-400/40 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">
              Stay Alert Stay Safe
            </h4>
            <p className="text-[11px] text-slate-300 leading-snug mt-1">
              Real-time weather updates for a safer tomorrow.
            </p>
          </div>
          <button
            onClick={onOpenSafetyModal}
            className="w-full mt-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-[10px] font-semibold text-white tracking-wider uppercase transition-all duration-200 hover:shadow-lg hover:border-white/40"
          >
            Emergency Protocols
          </button>
        </div>
      </div>

    </aside>
  );
}
