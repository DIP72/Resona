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
    { id: 'multilingual', label: 'Vernacular AI Alert', icon: Globe, badge: 'AI' },
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: Bell, badgeCount: 7 },
    { id: 'forecast', label: 'Forecast', icon: CloudRain },
    { id: 'reports', label: 'Disaster Reports', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#090D18]/85 backdrop-blur-xl border-r border-white/[0.06] flex flex-col justify-between p-3.5 shrink-0 hidden md:flex min-h-[calc(100vh-56px)] z-20">
      
      {/* Navigation Links */}
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Operations Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.09]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {item.badge}
                </span>
              )}

              {item.badgeCount && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AnimatedCounter value={item.badgeCount} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Promo / Safety Widget with Storm Image */}
      <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0E1528]/80 p-3.5 space-y-2 mt-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide">Emergency Hub</h4>
            <p className="text-[10px] text-slate-400 font-mono">NDMA Live Feed</p>
          </div>
        </div>
        <button
          onClick={onOpenSafetyModal}
          className="w-full py-1.5 px-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] rounded-lg text-[10px] font-semibold text-slate-200 tracking-wider uppercase transition-colors"
        >
          View Protocols
        </button>
      </div>

    </aside>
  );
}
