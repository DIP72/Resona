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
    { id: 'multilingual', label: 'Multilingual guide', icon: Globe, badge: '27 langs' },
    { id: 'map', label: 'Live map', icon: Map },
    { id: 'alerts', label: 'Weather alerts', icon: Bell, badgeCount: 3 },
    { id: 'forecast', label: '5-day forecast', icon: CloudRain },
    { id: 'reports', label: 'Citizen reports & SOS', icon: FileText },
    { id: 'resources', label: 'Shelters & helplines', icon: Layers },
    { id: 'auth', label: 'Community & roles', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0D121F]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-64px)] z-20 relative">
      
      {/* Navigation Links */}
      <div className="space-y-1 p-3.5 relative z-10 overflow-y-auto no-scrollbar">
        <div className="px-3 py-1.5 text-xs font-medium text-slate-400 font-sans tracking-normal mb-1">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden cursor-pointer ${
                isActive
                  ? 'text-white font-medium bg-teal-500/15 border border-teal-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-teal-300' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                </div>
                <span className="text-[13px]">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 relative z-10">
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                    isActive ? 'bg-teal-500/20 text-teal-200' : 'bg-white/5 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.badgeCount && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center justify-center ${
                    isActive ? 'bg-amber-500/20 text-amber-200' : 'bg-white/5 text-slate-400'
                  }`}>
                    <AnimatedCounter value={item.badgeCount} />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Promo / Safety Card */}
      <div className="p-3.5 relative z-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-3.5 shadow-lg relative group hover:border-white/20 transition-all duration-200">
          <div className="flex items-center gap-2.5 relative z-10 mb-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Community guide</h4>
              <p className="text-[11px] text-slate-400 font-sans">Verified safety steps</p>
            </div>
          </div>
          <button
            onClick={onOpenSafetyModal}
            className="w-full py-1.5 px-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-xl text-xs font-medium text-slate-200 transition-all cursor-pointer"
          >
            <span>What to do in an alert</span>
          </button>
        </div>
      </div>

    </aside>
  );
}
