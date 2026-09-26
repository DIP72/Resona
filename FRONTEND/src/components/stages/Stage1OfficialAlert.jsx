import React from 'react';
import { 
  FileText, 
  MapPin, 
  AlertTriangle, 
  Wind, 
  Waves, 
  Biohazard, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Sliders,
  Send
} from 'lucide-react';
import { sound } from '../../utils/audioSynth';

export default function Stage1OfficialAlert({
  alertData,
  onChangeAlertData,
  onSelectPreset,
  onProceedToNext,
  presets = [],
  loading
}) {
  const handlePresetClick = (presetKey) => {
    sound.playBlip();
    onSelectPreset(presetKey);
  };

  const handleNext = () => {
    sound.playBlip();
    onProceedToNext();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Stage Overview */}
      <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40">
              STAGE 01 OF 06
            </span>
            <h3 className="text-base font-bold font-display text-white tracking-wide">
              OFFICIAL ALERT INGESTION & TECHNICAL BULLETIN
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Formal issuance of the emergency bulletin directly from meteorological and disaster management authorities.
            Select a real-world scenario preset or ingest custom technical data.
          </p>
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F2FE] hover:bg-[#00d0de] text-slate-950 text-xs font-mono font-bold transition-all shadow-neon-cyan hover:scale-[1.02]"
        >
          <span>PROCEED TO STAGE 2 (SIMPLIFY)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scenario Presets Row */}
      <div>
        <label className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider block mb-2">
          Scenario Presets (Fast-Load Disaster Prototypes):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            onClick={() => handlePresetClick('cyclone')}
            className={`p-3 rounded-xl border text-left transition-all ${
              alertData.presetKey === 'cyclone'
                ? 'bg-rose-950/40 border-rose-500 shadow-neon-red'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-display">
                <Wind className="w-4 h-4 text-rose-400" />
                Cyclone DANA (Severe)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                145 km/h
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Deep depression Bay of Bengal; landfall near Puri / Dhamra coast with 2.0m storm surge.
            </p>
          </button>

          <button
            onClick={() => handlePresetClick('flood')}
            className={`p-3 rounded-xl border text-left transition-all ${
              alertData.presetKey === 'flood'
                ? 'bg-sky-950/40 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-sky-400 font-display">
                <Waves className="w-4 h-4 text-sky-400" />
                Mahanadi Flash Flood
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                1.15M Cusecs
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Embankment breach at right dyke chainage; sheet inundation across low-gradient panchayats.
            </p>
          </button>

          <button
            onClick={() => handlePresetClick('chemical')}
            className={`p-3 rounded-xl border text-left transition-all ${
              alertData.presetKey === 'chemical'
                ? 'bg-amber-950/40 border-amber-400 shadow-neon-amber'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-display">
                <Biohazard className="w-4 h-4 text-amber-400" />
                Industrial Gas Rupture
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                350 PPM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              High-pressure ammonia tank rupture in Paradeep industrial port; toxic plume downwind.
            </p>
          </button>

        </div>
      </div>

      {/* Main Form: Technical Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metadata & Impact Geometry (1 Col) */}
        <div className="space-y-4">
          
          {/* Severity & Urgency */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Hazard Classification
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 font-mono block mb-1">Severity Level</label>
              <select
                value={alertData.severity || 'Extreme'}
                onChange={(e) => onChangeAlertData('severity', e.target.value)}
                className="w-full bg-[#070B19] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#00F2FE] outline-none"
              >
                <option value="Extreme">EXTREME (Red Alert - Immediate Threat)</option>
                <option value="Severe">SEVERE (Orange Alert - High Damage)</option>
                <option value="Moderate">MODERATE (Yellow Alert - Be Updated)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-mono block mb-1">Issuing Authority</label>
              <input
                type="text"
                value={alertData.issuingAuthority || ''}
                onChange={(e) => onChangeAlertData('issuingAuthority', e.target.value)}
                className="w-full bg-[#070B19] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#00F2FE] outline-none"
              />
            </div>
          </div>

          {/* Affected Area & Coordinates */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00F2FE]" />
              Geographic Perimeter
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 font-mono block mb-1">Target Zone / District</label>
              <input
                type="text"
                value={alertData.affectedArea?.name || ''}
                onChange={(e) => onChangeAlertData('affectedArea', {
                  ...alertData.affectedArea,
                  name: e.target.value
                })}
                className="w-full bg-[#070B19] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#00F2FE] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={alertData.affectedArea?.coordinates?.lat || 19.8135}
                  onChange={(e) => onChangeAlertData('affectedArea', {
                    ...alertData.affectedArea,
                    coordinates: {
                      ...alertData.affectedArea.coordinates,
                      lat: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full bg-[#070B19] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#00F2FE] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={alertData.affectedArea?.coordinates?.lng || 85.8312}
                  onChange={(e) => onChangeAlertData('affectedArea', {
                    ...alertData.affectedArea,
                    coordinates: {
                      ...alertData.affectedArea.coordinates,
                      lng: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full bg-[#070B19] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#00F2FE] outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Hazard Radius:</span>
                <span className="text-cyan-300 font-bold">{alertData.affectedArea?.radiusKm || 45} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={alertData.affectedArea?.radiusKm || 45}
                onChange={(e) => onChangeAlertData('affectedArea', {
                  ...alertData.affectedArea,
                  radiusKm: parseInt(e.target.value)
                })}
                className="w-full accent-[#00F2FE]"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Raw Technical Bureaucratic Text Bulletin (2 Cols) */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                Raw Bureaucratic Technical Bulletin (Pre-Transformation)
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">
                HIGH JARGON DENSITY
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Official bulletins are historically drafted in complex meteorological and legal jargon.
              Notice words like <em>"convective cyclogenesis"</em>, <em>"isobaric pressure minima"</em>, and <em>"inundation coupling"</em>.
              In Stage 2, our engine translates this into life-saving 5th-grade plain language!
            </p>

            <div className="relative">
              <textarea
                rows={11}
                value={alertData.rawTechnicalBulletin || ''}
                onChange={(e) => onChangeAlertData('rawTechnicalBulletin', e.target.value)}
                className="w-full bg-[#070B19] border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-slate-200 leading-relaxed focus:border-[#00F2FE] outline-none cyber-scanline"
                placeholder="Paste official weather or emergency bulletin here..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500">
                {(alertData.rawTechnicalBulletin || '').length} characters | {(alertData.rawTechnicalBulletin || '').split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Complexity Level: 14.8 (College Graduate Level)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#00F59B] text-slate-950 text-xs font-mono font-bold hover:shadow-neon-cyan transition-all"
              >
                <span>RUN PLAIN LANGUAGE ENGINE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
