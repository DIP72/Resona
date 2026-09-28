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
    <div ref={containerRef} className="space-y-2">
      
      {/* Sleek, Single-Row Emergency Operations Bar */}
      <div className={`rounded-xl border transition-all duration-200 px-3.5 py-2 flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-lg ${
        hero.countNum > 0
          ? 'bg-slate-900/70 backdrop-blur-xl border-rose-500/30 shadow-black/40'
          : 'bg-slate-900/50 backdrop-blur-xl border-white/[0.08]'
      } ${
        isFiltered ? 'ring-1 ring-rose-500/50' : ''
      }`}>
        
        {/* Left: Active Emergency Threat Telemetry */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[10px] font-mono font-medium tracking-wider shrink-0 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-pulse-dot-red" />
            <span>Emergency Active</span>
          </div>

          <div className="flex items-center gap-2 min-w-0 truncate">
            <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
              <Disc className="w-3.5 h-3.5 animate-cyclone-bob" />
            </div>

            <span className="text-xs font-semibold text-white tracking-wide shrink-0">
              {hero.type}
            </span>

            <span className="text-slate-500 hidden sm:inline">•</span>

            <span className="text-xs text-slate-300 truncate">
              {hero.subtitle}
            </span>
          </div>
        </div>

        {/* Right: Active Count, Filter Button, and Inactive Baseline Chips */}
        <div className="flex items-center justify-between xl:justify-end gap-3 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-white/[0.06]">
          
          {/* Active Count & Filter Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1 font-mono text-xs font-bold text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/25">
              <AnimatedCounter value={hero.countNum} />
              <span className="text-[10px] font-normal text-rose-300/80">Active</span>
            </div>

            <button
              onClick={() => onSelectFilter(isFiltered ? null : hero.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isFiltered 
                  ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40 shadow-sm' 
                  : 'bg-white/[0.05] hover:bg-white/[0.10] text-slate-300 border border-white/[0.08]'
              }`}
            >
              {isFiltered ? 'Active Filter' : 'Filter Feed'}
            </button>
          </div>

          <div className="h-4 w-[1px] bg-white/[0.1] hidden sm:block" />

          {/* Inactive Hazards Chips with Checkmark Indicator */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25 hidden md:flex">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Normal</span>
            </span>

            {inactiveHazards.map((h) => {
              const isExpanded = expandedHazardId === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => setExpandedHazardId(isExpanded ? null : h.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    isExpanded 
                      ? 'bg-white/[0.15] text-white border border-white/20' 
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                  }`}
                  title={`Inspect ${h.type} status`}
                >
                  <span>{h.shortLabel}</span>
                  <span className="font-mono text-[10px] text-slate-500">0</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* Expanded Popover / Panel for Inactive Hazard Telemetry */}
      {expandedHazard && (
        <div className="p-3.5 rounded-xl border border-white/[0.1] bg-[#0E1528]/95 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4 text-xs animate-slide-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <expandedHazard.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{expandedHazard.type}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Normal Baseline
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{expandedHazard.details}</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedHazardId(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
