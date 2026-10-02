import React from 'react';
import { 
  Home, 
  PhoneCall, 
  Download, 
  Share2, 
  AlertCircle, 
  ChevronRight,
  Phone,
  HeartHandshake
} from 'lucide-react';

export default function QuickActionsCard({ 
  onFindShelter, 
  onEmergencyContacts, 
  onDownloadAlerts, 
  onShareLocation, 
  onReportIncident 
}) {
  const actions = [
    { id: 'shelter', label: 'Find nearby safe shelter', icon: Home, onClick: onFindShelter },
    { id: 'contacts', label: 'Emergency helplines', icon: PhoneCall, onClick: onEmergencyContacts },
    { id: 'download', label: 'Download alert summary', icon: Download, onClick: onDownloadAlerts },
    { id: 'share', label: 'Share your location with family', icon: Share2, onClick: onShareLocation },
    { id: 'report', label: 'Report an issue or ask for help', icon: AlertCircle, onClick: onReportIncident },
  ];

  return (
    <div className="weather-card p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
      
      <div>
        <h3 className="text-sm font-semibold text-white tracking-normal font-sans mb-3 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-teal-400" />
          <span>Helpful actions</span>
        </h3>

        <div className="space-y-1.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.onClick}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/10 text-slate-200 transition-all duration-200 text-xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-300 flex items-center justify-center transition-transform group-hover:scale-105">
                    <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                  </div>
                  <span className="font-normal group-hover:text-white transition-colors font-sans text-xs">
                    {act.label}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300 transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Helpline Box at Bottom with Live Pulse Dot */}
      <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-300 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 block font-sans">National helpline</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            </div>
            <span className="text-xs font-medium text-white block">NDMA 24x7 Support</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('resona-open-contact-modal', {
                detail: {
                  contact: { name: 'NDMA 24x7 Control Room', phone: '1070', role: 'National Disaster Helpline' },
                  defaultMessage: 'EMERGENCY SOS: Immediate assistance required.'
                }
              }));
            }}
            className="px-2 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/30 text-xs flex items-center gap-1 cursor-pointer"
            title="Send Emergency SMS"
          >
            <span className="text-[11px] font-medium">SMS</span>
          </button>
          <div className="text-right">
            <a 
              href="tel:1070" 
              className="text-sm font-semibold text-teal-300 hover:text-teal-200 block"
              title="Call 1070"
            >
              1070
            </a>
            <span className="text-[9px] text-slate-400 block">Toll-free</span>
          </div>
        </div>
      </div>

    </div>
  );
}
