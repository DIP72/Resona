import React from 'react';
import { 
  Home, 
  PhoneCall, 
  Download, 
  Share2, 
  AlertOctagon, 
  ChevronRight,
  Phone
} from 'lucide-react';

export default function QuickActionsCard({ 
  onFindShelter, 
  onEmergencyContacts, 
  onDownloadAlerts, 
  onShareLocation, 
  onReportIncident 
}) {
  const actions = [
    { id: 'shelter', label: 'Find Nearest Safe Shelter', icon: Home, onClick: onFindShelter },
    { id: 'contacts', label: 'Emergency Response Contacts', icon: PhoneCall, onClick: onEmergencyContacts },
    { id: 'download', label: 'Download Alert Summary (PDF)', icon: Download, onClick: onDownloadAlerts },
    { id: 'share', label: 'Share Geo-Location', icon: Share2, onClick: onShareLocation },
    { id: 'report', label: 'Report Incident / SOS', icon: AlertOctagon, onClick: onReportIncident },
  ];

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4.5 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
      
      <div>
        <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono mb-3">
          Tactical Operations
        </h3>

        <div className="space-y-1.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.onClick}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D162E]/75 hover:bg-[#1A284D]/90 border border-transparent hover:border-[#38BDF8]/40 text-slate-200 transition-all duration-200 text-xs group hover:translate-x-1 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-[#38BDF8] flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium group-hover:text-white transition-colors font-sans">
                    {act.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#38BDF8] transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Helpline Box at Bottom with Live Pulse Dot */}
      <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/80 to-slate-900/80 backdrop-blur-md border border-blue-500/30 flex items-center justify-between shadow-lg card-hover-lift">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-[#38BDF8] flex items-center justify-center">
            <Phone className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 block font-sans">Emergency Line</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
            </div>
            <span className="text-xs font-bold text-white block">NDMA 24x7 Control</span>
          </div>
        </div>
        <div className="text-right">
          <a 
            href="tel:1070" 
            className="text-base font-bold text-cyan-300 hover:text-cyan-200 font-mono tracking-wider block"
          >
            1070
          </a>
          <span className="text-[9px] text-slate-400 font-mono block">Toll-Free</span>
        </div>
      </div>

    </div>
  );
}
