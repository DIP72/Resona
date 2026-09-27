import React, { useState } from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Flame, 
  Wind,
  CloudRain,
  Satellite
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

export default function ActiveAlertsList({ onSelectAlert, activeFilter }) {
  const { liveAlerts, eonetEvents, loading } = useWeather();
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'nasa' | 'imd'

  // Helper to map category to icon & color-coded hazard accents
  const getCategoryDetails = (category) => {
    switch (category) {
      case 'flood':
        return { 
          icon: Waves, 
          accentBorder: 'border-t-2 border-t-blue-500',
          tint: 'bg-blue-500/15 text-blue-400' 
        };
      case 'thunderstorm':
        return { 
          icon: CloudLightning, 
          accentBorder: 'border-t-2 border-t-amber-400',
          tint: 'bg-amber-500/15 text-amber-400' 
        };
      case 'heatwave':
        return { 
          icon: Flame, 
          accentBorder: 'border-t-2 border-t-orange-500',
          tint: 'bg-orange-500/15 text-orange-400' 
        };
      case 'wind':
        return { 
          icon: Wind, 
          accentBorder: 'border-t-2 border-t-teal-400',
          tint: 'bg-teal-500/15 text-teal-400' 
        };
      case 'cyclone':
      default:
        return { 
          icon: Disc, 
          accentBorder: 'border-t-2 border-t-red-500',
          tint: 'bg-red-500/15 text-red-400' 
        };
    }
  };

  // Format NASA EONET events as first-class live alerts
  const nasaAlerts = (eonetEvents || []).map((e) => {
    const isSevereStorm = e.categoryId === 'severeStorms' || (e.category || '').toLowerCase().includes('storm') || (e.title || '').toLowerCase().includes('cyclone') || (e.title || '').toLowerCase().includes('typhoon') || (e.title || '').toLowerCase().includes('hurricane');
    const isWildfire = e.categoryId === 'wildfires' || (e.category || '').toLowerCase().includes('fire');
    const isFlood = e.categoryId === 'floods' || (e.category || '').toLowerCase().includes('flood');
    
    let cat = 'cyclone';
    let sevColor = 'bg-rose-950/80 text-rose-300 border border-rose-500/50';
    let sev = 'Extreme';
    let isEmergency = true;
    if (isWildfire) {
      cat = 'heatwave';
      sevColor = 'bg-orange-950/80 text-orange-300 border border-orange-500/50';
      sev = 'High';
      isEmergency = false;
    } else if (isFlood) {
      cat = 'flood';
      sevColor = 'bg-blue-950/80 text-blue-300 border border-blue-500/50';
      sev = 'Severe';
      isEmergency = true;
    }

    const lon = e.coordinates?.longitude;
    const lat = e.coordinates?.latitude;
    const locStr = (lat != null && lon != null) 
      ? `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E` 
      : 'Global Orbit';

    return {
      id: e.id,
      category: cat,
      hazardType: cat,
      title: `${e.title}`,
      severity: sev,
      severityColor: sevColor,
      isEmergency,
      description: `NASA Live Event: ${e.category}`,
      coordinatesStr: locStr,
      subtext: `Satellite Date: ${e.date ? new Date(e.date).toLocaleDateString() : 'Active'}`,
      validity: 'NASA Earth Observatory (Real-Time)',
      isNasaEonet: true,
      coordinates: e.coordinates,
      link: e.link,
      magnitude: e.magnitudeValue ? `${e.magnitudeValue} ${e.magnitudeUnit || ''}` : null
    };
  });

  const combinedAlerts = [...nasaAlerts, ...(liveAlerts || [])];

  // Filter by hazard type (activeFilter) and source tab (sourceFilter)
  const filtered = combinedAlerts.filter(a => {
    // 1. Source filter
    if (sourceFilter === 'nasa' && !a.isNasaEonet) return false;
    if (sourceFilter === 'imd' && a.isNasaEonet) return false;

    // 2. Hazard filter
    if (!activeFilter) return true;
    if (activeFilter === 'cyclone') {
      return a.category === 'cyclone' || a.category === 'flood' || a.hazardType === 'flood' || a.cond === 'Rain';
    }
    return a.category === activeFilter || a.hazardType === activeFilter;
  });

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4 sm:p-4.5 flex flex-col h-[500px] shadow-2xl relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F]/80 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Live Hazard Feed
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 font-mono font-bold border border-slate-700/50 animate-scale-bounce">
            <AnimatedCounter value={filtered.length} /> Active
          </span>
        </div>
        
        {/* Continuous live pulsing status indicators */}
        <div className="flex items-center gap-2">
          {nasaAlerts.length > 0 && (
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-rose-300 bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-500/40 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-pulse-dot-red"></span>
              <span>NASA LIVE</span>
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
            <span>FEED SYNC</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: All / NASA Events / Regional Weather */}
      <div className="flex items-center gap-1.5 mb-3 bg-[#0B132B]/80 backdrop-blur-md p-1 rounded-xl border border-[#1E2C4F]/60 text-[10px] font-medium">
        <button
          onClick={() => setSourceFilter('all')}
          className={`flex-1 py-1.5 rounded-lg text-center tab-transition ${
            sourceFilter === 'all' 
              ? 'bg-[#38BDF8] text-slate-950 font-bold shadow-md shadow-sky-950/40' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All (<AnimatedCounter value={combinedAlerts.length} />)
        </button>
        <button
          onClick={() => setSourceFilter('nasa')}
          className={`flex-1 py-1.5 rounded-lg text-center tab-transition flex items-center justify-center gap-1 ${
            sourceFilter === 'nasa' 
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Satellite className="w-3 h-3 text-rose-400" />
          <span>NASA (<AnimatedCounter value={nasaAlerts.length} />)</span>
        </button>
        <button
          onClick={() => setSourceFilter('imd')}
          className={`flex-1 py-1.5 rounded-lg text-center tab-transition ${
            sourceFilter === 'imd' 
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Weather (<AnimatedCounter value={liveAlerts?.length || 0} />)
        </button>
      </div>

      {/* Alert Cards List with slide/fade micro-motion */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Disc className="w-9 h-9 text-emerald-500/40 mb-2 animate-soft-pulse" />
            <p className="text-xs font-semibold text-slate-300">All Parameters Normal</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
              No active warnings detected matching current filter criteria.
            </p>
          </div>
        ) : (
          filtered.map((alert, index) => {
            const { icon: Icon, accentBorder, tint } = getCategoryDetails(alert.category);
            const isRedEmergency = alert.isEmergency || alert.severity === 'Extreme' || alert.severity === 'Very High';

            return (
              <div
                key={alert.id || index}
                onClick={() => onSelectAlert && onSelectAlert(alert)}
                style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer group card-hover-lift animate-slide-in relative overflow-hidden ${
                  accentBorder
                } ${
                  isRedEmergency
                    ? 'animate-breathing-red bg-[#160C1F]/80 backdrop-blur-md'
                    : 'bg-[#0D162E]/75 backdrop-blur-md border-[#1E2C4F] hover:border-[#38BDF8]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    
                    {/* Category Icon with tint even when inactive */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110 ${tint}`}>
                      <Icon className={`w-4 h-4 ${alert.category === 'cyclone' ? 'animate-cyclone-bob' : ''}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Wrapped title without ellipsis */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-[#38BDF8] transition-colors leading-snug break-words">
                          {alert.title}
                        </h4>
                        {alert.isNasaEonet && (
                          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                            NASA EONET
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {alert.description}
                      </p>

                      {/* Monospace telemetry readout for coordinates and timestamps */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] font-mono text-slate-400">
                        {alert.coordinatesStr && (
                          <span className="text-cyan-300 bg-cyan-950/40 px-1 rounded border border-cyan-500/20">
                            {alert.coordinatesStr}
                          </span>
                        )}
                        <span>{alert.subtext}</span>
                        {alert.magnitude && (
                          <span className="text-rose-400 font-bold">
                            Intensity: {alert.magnitude}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                    alert.severityColor || 'bg-blue-950 text-blue-300 border border-blue-600/50'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
