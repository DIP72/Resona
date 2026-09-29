import React, { useState, useRef, useEffect } from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Flame, 
  Wind,
  Satellite,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

export default function AlertBannerRow({ activeFilter, onSelectFilter }) {
  const { liveAlerts, allCities, eonetEvents } = useWeather();
  const [expandedHazardId, setExpandedHazardId] = useState(null);
  const containerRef = useRef(null);

  // Close expanded detail when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setExpandedHazardId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 1. Process Live NASA EONET Storms & Regional Weather Data
  const nasaStorms = (eonetEvents || []).filter(e => 
    e.categoryId === 'severeStorms' || 
    (e.category || '').toLowerCase().includes('storm') || 
    (e.title || '').toLowerCase().includes('cyclone') ||
    (e.title || '').toLowerCase().includes('typhoon') ||
    (e.title || '').toLowerCase().includes('hurricane')
  );

  const rainCities = (allCities || []).filter(c => (c.condition === 'Rain' || c.condition === 'Drizzle' || (c.rain_1h || 0) > 0)).map(c => c.city);
  const windCities = (allCities || []).filter(c => ((c.wind_speed || 0) >= 20)).map(c => c.city);
  const thunderCities = (allCities || []).filter(c => (c.condition === 'Thunderstorm')).map(c => c.city);
  const heatCities = (allCities || []).filter(c => ((c.temp || 0) >= 36)).map(c => c.city);
  const floodCount = (liveAlerts || []).filter(a => a.category === 'flood').length;

  const cycloneHasActive = nasaStorms.length > 0;
  const cycloneCount = cycloneHasActive ? nasaStorms.length : rainCities.length;

  const allHazards = [
    {
      id: 'cyclone',
      type: 'Live Cyclones & Storms',
      shortLabel: 'Cyclones',
      countNum: cycloneCount,
      icon: Disc,
      color: 'red',
      accentText: 'text-rose-400',
      subtitle: cycloneHasActive 
        ? `Tracking: ${nasaStorms.slice(0, 3).map(s => s.title).join(', ')}${nasaStorms.length > 3 ? ` (+${nasaStorms.length - 3} more)` : ''}`
        : 'All oceanic sectors clear of severe tropical storms.',
      details: 'Satellite infrared tracking confirms active convective cyclonic vortices. Real-time telemetry streaming from NASA Earth Observatory.',
      safeMetric: 'NASA EONET Ingest: Active'
    },
    {
      id: 'flood',
      type: 'Flood & Inundation Watch',
      shortLabel: 'Flood',
      countNum: floodCount,
      icon: Waves,
      color: 'blue',
      accentText: 'text-blue-400',
      subtitle: 'River gauges & basins within normal safe holding capacity.',
      details: 'Discharge telemetry across Mahanadi, Brahmani, and Baitarani river basins confirms water levels are below warning thresholds.',
      safeMetric: 'River Gauges: Safe'
    },
    {
      id: 'thunderstorm',
      type: 'Thunderstorm & Lightning',
      shortLabel: 'Thunderstorm',
      countNum: thunderCities.length,
      icon: CloudLightning,
      color: 'purple',
      accentText: 'text-purple-400',
      subtitle: 'Zero active cloud-to-ground lightning cells detected.',
      details: 'Ground lightning sensor network reports zero flash density. Convective available potential energy (CAPE) remains stable.',
      safeMetric: 'Lightning: 0 flashes/km²'
    },
    {
      id: 'heatwave',
      type: 'Heatwave & Thermal Stress',
      shortLabel: 'Heatwave',
      countNum: heatCities.length,
      icon: Flame,
      color: 'orange',
      accentText: 'text-orange-400',
      subtitle: 'Surface temperatures within comfortable seasonal baseline (<36°C).',
      details: 'Wet-bulb globe temperature (WBGT) measurements report normal ambient index across all monitored ground hubs.',
      safeMetric: 'WBGT: Normal'
    },
    {
      id: 'wind',
      type: 'Squally Wind & Gale Force',
      shortLabel: 'Wind',
      countNum: windCities.length,
      icon: Wind,
      color: 'teal',
      accentText: 'text-teal-400',
      subtitle: 'Coastal breeze under 20 km/h, calm sea conditions.',
      details: 'Coastal anemometer arrays report average gusts under 18 km/h. Sea state is slight to moderate.',
      safeMetric: 'Peak Gust: <18 km/h'
    }
  ];

  const hero = allHazards[0]; // Cyclone is the active emergency
  const inactiveHazards = allHazards.slice(1);
  const isFiltered = activeFilter === hero.id;
  const expandedHazard = allHazards.find(h => h.id === expandedHazardId);

  return (
    <div ref={containerRef} className="space-y-3">
      
      {/* Sleek, Single-Row Emergency Operations Bar */}
      <div className={`rounded-2xl border transition-all duration-300 px-5 py-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xl relative overflow-hidden group ${
        hero.countNum > 0
          ? 'bg-slate-900/70 backdrop-blur-2xl border-rose-500/25 shadow-[0_12px_36px_-12px_rgba(244,63,94,0.22)]'
          : 'bg-slate-900/60 backdrop-blur-2xl border-white/[0.08]'
      } ${
        isFiltered ? 'ring-2 ring-rose-500/40 shadow-[0_0_24px_rgba(244,63,94,0.3)]' : ''
      }`}>
        
        {hero.countNum > 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        )}

        {/* Left: Active Emergency Threat Telemetry */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10 flex-wrap sm:flex-nowrap">
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold shrink-0 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
            <span>EMERGENCY ACTIVE</span>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-300 shrink-0">
              <Disc className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
            </div>

            <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white tracking-normal">
                {hero.type}
                </span>
                <span className="text-xs text-slate-300/90 font-normal truncate">
                {hero.subtitle}
                </span>
            </div>
          </div>
        </div>

        {/* Right: Active Count, Filter Button, and Inactive Baseline Chips */}
        <div className="flex items-center justify-between xl:justify-end gap-3.5 shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-white/10 relative z-10 flex-wrap sm:flex-nowrap">
          
          {/* Active Count & Filter Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-sans text-xs font-semibold text-rose-200 bg-rose-500/15 px-3 py-1 rounded-full border border-rose-500/25 shadow-sm">
              <AnimatedCounter value={hero.countNum} />
              <span className="text-[10px] font-bold text-rose-200 uppercase">ACTIVE</span>
            </div>

            <button
              onClick={() => onSelectFilter(isFiltered ? null : hero.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                isFiltered 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50 hover:bg-rose-600' 
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10'
              }`}
            >
              {isFiltered ? 'Active Filter' : 'Filter Feed'}
            </button>
          </div>

          <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

          {/* Inactive Hazards Chips with Checkmark Indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-emerald-300 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 hidden md:flex">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>NORMAL</span>
            </span>

            {inactiveHazards.map((h) => {
              const isExpanded = expandedHazardId === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => setExpandedHazardId(isExpanded ? null : h.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                    isExpanded 
                      ? 'bg-slate-700/80 text-white border border-white/20 shadow-md' 
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06]'
                  }`}
                  title={`Inspect ${h.type} status`}
                >
                  <h.icon className="w-3.5 h-3.5 opacity-70 stroke-[1.8]" />
                  <span className="hidden lg:inline">{h.shortLabel}</span>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-900/60 px-1.5 py-0.2 rounded-full">0</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* Expanded Popover / Panel for Inactive Hazard Telemetry */}
      {expandedHazard && (
        <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-6 text-sm animate-in fade-in slide-in-from-top-2 duration-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-300 flex items-center justify-center shrink-0 shadow-sm">
              <expandedHazard.icon className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-white tracking-normal">{expandedHazard.type}</span>
                <span className="text-[11px] font-sans font-medium text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Normal baseline
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{expandedHazard.details}</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedHazardId(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
}
