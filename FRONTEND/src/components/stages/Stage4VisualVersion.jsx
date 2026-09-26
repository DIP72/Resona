import React, { useState } from 'react';
import { 
  MapPin, 
  ShieldAlert, 
  Wind, 
  Waves, 
  Biohazard, 
  Home, 
  PhoneCall, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Download,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { sound } from '../../utils/audioSynth';

export default function Stage4VisualVersion({
  alertData,
  onProceedToNext,
  onBackToPrevious
}) {
  const shelters = alertData.visualAssets?.evacuationShelters || [];
  const [selectedShelterId, setSelectedShelterId] = useState(shelters[0]?.id || 'SHELTER-01');

  const selectedShelter = shelters.find(s => s.id === selectedShelterId) || shelters[0];

  const handleNext = () => {
    sound.playBlip();
    onProceedToNext();
  };

  const handleBack = () => {
    sound.playBlip();
    onBackToPrevious();
  };

  const isCyclone = alertData.category === 'Meteorological';
  const isFlood = alertData.category === 'Hydrological';
  const isChemical = alertData.category === 'Industrial';

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Stage Overview */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40">
              STAGE 04 OF 06
            </span>
            <h3 className="text-base font-bold font-display text-white tracking-wide">
              MULTIMODAL VISUAL ALERTS & INTERACTIVE SHELTER RADAR
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Non-verbal and high-contrast graphical iconography for deaf, low-literacy, and hurried citizens.
            Includes interactive radar map showing hazard rings and nearby safe pucca shelters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F2FE] hover:bg-[#00d0de] text-slate-950 text-xs font-mono font-bold transition-all shadow-neon-cyan hover:scale-[1.02]"
          >
            <span>PROCEED TO DELIVERY (STAGE 5)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: High-Contrast Infographic Visual Card (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl border-2 border-rose-500/60 bg-gradient-to-b from-[#160b17] via-[#0C1327] to-[#070B19] shadow-neon-red flex flex-col justify-between relative overflow-hidden">
          {/* Danger Stripe Top Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

          <div className="space-y-4">
            
            {/* Severity Pill & Universal Danger Icon */}
            <div className="flex items-center justify-between mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-600 text-white shadow-neon-red flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="w-4 h-4" />
                RED ALERT - EVACUATE NOW
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                SIZE: 28.4 KB (OPTIMIZED)
              </span>
            </div>

            {/* Giant Hazard Pictogram Badge */}
            <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mb-3 animate-pulse">
                {isCyclone && <Wind className="w-10 h-10 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />}
                {isFlood && <Waves className="w-10 h-10 text-cyan-400 animate-pulse" />}
                {isChemical && <Biohazard className="w-10 h-10 text-amber-400 animate-bounce" />}
              </div>

              <h4 className="text-xl font-black font-display text-white uppercase tracking-wider">
                {alertData.category?.toUpperCase()} THREAT
              </h4>
              <p className="text-xs font-mono text-rose-300 mt-1">
                {alertData.affectedArea?.name || 'Coastal Sector'}
              </p>
            </div>

            {/* Pictographic Action Grid (3 Icons for non-literate comprehension) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
                <Home className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-[10px] font-bold text-white uppercase">MOVE INDOORS</span>
                <span className="text-[9px] text-slate-400 font-mono">Pucca Shelter</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
                <Waves className="w-6 h-6 text-cyan-400 mb-1" />
                <span className="text-[10px] font-bold text-white uppercase">NO BEACH</span>
                <span className="text-[9px] text-slate-400 font-mono">Stay Away</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
                <PhoneCall className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-[10px] font-bold text-white uppercase">CALL 112</span>
                <span className="text-[9px] text-slate-400 font-mono">Toll-Free Help</span>
              </div>
            </div>

            {/* Emergency Contacts Banner */}
            <div className="p-3 rounded-xl bg-[#070B19] border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>State Control Room:</span>
              </div>
              <span className="text-emerald-400 font-bold tracking-wider">1077 / 112</span>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>High Contrast Standard (WCAG AAA)</span>
            <span className="text-emerald-400 font-semibold">Deaf Accessible</span>
          </div>
        </div>

        {/* Right: Interactive Evacuation Mini-Map & Radar (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-800 bg-[#0C1327]/90 flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00F2FE]" />
                <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                  TACTICAL EVACUATION RADAR // SAFE SHELTERS
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                GEO-RADIUS: {alertData.affectedArea?.radiusKm || 45} KM
              </span>
            </div>

            {/* Simulated Canvas / SVG Radar View */}
            <div className="relative w-full h-64 sm:h-72 bg-[#050813] rounded-xl border border-cyan-500/30 overflow-hidden flex items-center justify-center">
              
              {/* Radar Grid Circles */}
              <div className="absolute w-56 h-56 rounded-full border border-cyan-500/20" />
              <div className="absolute w-40 h-40 rounded-full border border-cyan-500/25" />
              <div className="absolute w-24 h-24 rounded-full border border-cyan-500/30" />
              
              {/* Radar Crosshairs */}
              <div className="absolute w-full h-[1px] bg-cyan-500/15" />
              <div className="absolute h-full w-[1px] bg-cyan-500/15" />

              {/* Sweeping Radar Line */}
              <div className="absolute w-28 h-28 border-r border-t border-cyan-400/50 rounded-tr-full origin-bottom-left bottom-1/2 left-1/2 animate-radar-sweep pointer-events-none" 
                   style={{
                     background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25) 0%, transparent 80%)'
                   }}
              />

              {/* Storm Epicenter (Red Pulsing Pin) */}
              <div className="absolute z-10 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full bg-rose-500/30 animate-ping absolute" />
                  <span className="w-4 h-4 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow-neon-red">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-300 mt-1 bg-black/70 px-1.5 py-0.5 rounded border border-rose-500/30">
                  EPICENTER ({alertData.affectedArea?.coordinates?.lat.toFixed(2)}°, {alertData.affectedArea?.coordinates?.lng.toFixed(2)}°)
                </span>
              </div>

              {/* Safe Shelter Markers positioned around */}
              {shelters.map((shelter, idx) => {
                const isSelected = selectedShelterId === shelter.id;
                // Offsets based on index
                const positions = [
                  { top: '24%', left: '26%' },
                  { top: '30%', right: '22%' },
                  { bottom: '26%', right: '32%' },
                ];
                const pos = positions[idx % positions.length];

                return (
                  <button
                    key={shelter.id}
                    onClick={() => {
                      sound.playBlip();
                      setSelectedShelterId(shelter.id);
                    }}
                    style={pos}
                    className={`absolute z-20 flex flex-col items-center transition-all group ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 opacity-85'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border flex items-center justify-center ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-950 border-white shadow-neon-green' 
                        : 'bg-[#070B19] text-emerald-400 border-emerald-500/60'
                    }`}>
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-mono text-emerald-300 bg-black/80 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap border border-emerald-500/30">
                      {shelter.distanceKm} km
                    </span>
                  </button>
                );
              })}

              {/* Compass Ring & Distance Label */}
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/20">
                10 km / Ring
              </div>
            </div>

            {/* Selected Shelter Details Card */}
            {selectedShelter && (
              <div className="p-3.5 rounded-xl bg-[#070B19] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h5 className="text-xs font-bold font-sans text-white">
                      {selectedShelter.name}
                    </h5>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span>Distance: <b className="text-cyan-300">{selectedShelter.distanceKm} km</b></span>
                    <span>Capacity: <b className="text-emerald-300">{selectedShelter.occupied} / {selectedShelter.capacity}</b></span>
                    <span>Status: <b className="text-emerald-400">{selectedShelter.status}</b></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => sound.playSuccessChime()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>ROUTE GUIDANCE</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Offline Map Vector Tiles Cached</span>
            <span className="text-[#00F2FE]">All Shelters Reinforced Concrete (Pucca)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
