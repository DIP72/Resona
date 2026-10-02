import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function EmergencyModeCard({ onOpenSafetyModal, isActive = true }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#2D1219]/90 to-[#1A0B10]/90 backdrop-blur-xl border border-rose-500/40 p-4 sm:p-4.5 shadow-xl relative overflow-hidden">
      
      {/* Background Soft Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold tracking-normal text-rose-200 font-sans">
              Severe weather alert
            </h3>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          </div>
          <p className="text-xs text-rose-100/90 leading-relaxed mt-1 font-sans">
            A severe advisory is active for your area. Please stay indoors, charge essential devices, and review safety guidance.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenSafetyModal}
        className="w-full mt-3 py-2 px-3 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
      >
        <ShieldAlert className="w-4 h-4" />
        <span>What should I do? View guidance</span>
      </button>

    </div>
  );
}
