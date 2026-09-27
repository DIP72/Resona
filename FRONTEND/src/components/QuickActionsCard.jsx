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
    { id: 'shelter', label: 'Find Nearest Shelter', icon: Home, onClick: onFindShelter },
    { id: 'contacts', label: 'Emergency Contacts', icon: PhoneCall, onClick: onEmergencyContacts },
    { id: 'download', label: 'Download Alerts (PDF)', icon: Download, onClick: onDownloadAlerts },
    { id: 'share', label: 'Share Location', icon: Share2, onClick: onShareLocation },
    { id: 'report', label: 'Report Incident', icon: AlertOctagon, onClick: onReportIncident },
  ];

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4 flex flex-col justify-between">
      
      <div>
        <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono mb-3">
          Quick Actions
        </h3>

        <div className="space-y-1.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.onClick}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D162E] hover:bg-[#1A284D] border border-transparent hover:border-[#1E2C4F] text-slate-200 transition-all text-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-[#38BDF8] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium group-hover:text-white transition-colors">
                    {act.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#38BDF8] transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Helpline Box at Bottom */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-600/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-[#38BDF8] flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Need Help?</span>
            <span className="text-xs font-bold text-white block">Disaster Helpline</span>
          </div>
        </div>
        <div className="text-right">
          <a 
            href="tel:1070" 
            className="text-sm font-bold text-[#38BDF8] hover:underline font-mono block"
          >
            1070
          </a>
          <span className="text-[9px] text-slate-400 block">(Toll Free)</span>
        </div>
      </div>

    </div>
  );
}
