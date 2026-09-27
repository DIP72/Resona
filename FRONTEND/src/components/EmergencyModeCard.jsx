import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function EmergencyModeCard({ onOpenSafetyModal, isActive = true }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#3D0A14] to-[#25070D] border border-rose-600/70 p-4 shadow-xl shadow-rose-950/40 relative overflow-hidden">
      
      {/* Background Soft Pulse Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/60 flex items-center justify-center shrink-0 text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold tracking-wider text-rose-200 uppercase font-mono">
              EMERGENCY MODE
            </h3>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <p className="text-[11px] text-rose-100/90 leading-snug mt-1">
            Critical weather situation detected in your region.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenSafetyModal}
        className="w-full mt-3 py-2.5 px-4 bg-[#EF4444] hover:bg-rose-600 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/50 transition-all flex items-center justify-center gap-2 tracking-wide"
      >
        <ShieldAlert className="w-4 h-4" />
        <span>View Safety Instructions</span>
      </button>

    </div>
  );
}
