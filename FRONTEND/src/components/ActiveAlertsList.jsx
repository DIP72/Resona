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
          accentBorder: 'border-l-2 border-l-sky-400',
          tint: 'bg-sky-500/10 text-sky-400' 
        };
      case 'thunderstorm':
        return { 
          icon: CloudLightning, 
          accentBorder: 'border-l-2 border-l-amber-400',
          tint: 'bg-amber-500/10 text-amber-400' 
        };
      case 'heatwave':
        return { 
          icon: Flame, 
          accentBorder: 'border-l-2 border-l-orange-400',
          tint: 'bg-orange-500/10 text-orange-400' 
        };
      case 'wind':
        return { 
          icon: Wind, 
          accentBorder: 'border-l-2 border-l-teal-400',
          tint: 'bg-teal-500/10 text-teal-400' 
        };
      case 'cyclone':
      default:
        return { 
          icon: Disc, 
          accentBorder: 'border-l-2 border-l-rose-500',
          tint: 'bg-rose-500/10 text-rose-400' 
        };
    }
  };

  // Format NASA EONET events as first-class live alerts
  const nasaAlerts = (eonetEvents || []).map((e) => {
    const isSevereStorm = e.categoryId === 'severeStorms' || (e.category || '').toLowerCase().includes('storm') || (e.title || '').toLowerCase().includes('cyclone') || (e.title || '').toLowerCase().includes('typhoon') || (e.title || '').toLowerCase().includes('hurricane');
    const isWildfire = e.categoryId === 'wildfires' || (e.category || '').toLowerCase().includes('fire');
    const isFlood = e.categoryId === 'floods' || (e.category || '').toLowerCase().includes('flood');
    
    let cat = 'cyclone';
    let sevColor = 'bg-rose-500/10 text-rose-300 border border-rose-500/25';
    let sev = 'Extreme';
    let isEmergency = true;
    if (isWildfire) {
      cat = 'heatwave';
      sevColor = 'bg-amber-500/10 text-amber-300 border border-amber-500/25';
      sev = 'High';
      isEmergency = false;
    } else if (isFlood) {
      cat = 'flood';
      sevColor = 'bg-sky-500/10 text-sky-300 border border-sky-500/25';
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
      subtext: `Date: ${e.date ? new Date(e.date).toLocaleDateString() : 'Active'}`,
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
    <div className="weather-card rounded-2xl border border-white/[0.08] p-4 flex flex-col h-[560px] shadow-2xl relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06] mb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-white tracking-wide">
            Live Hazard Feed
          </h3>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/[0.05] text-slate-300 font-mono font-medium border border-white/[0.08]">
            <AnimatedCounter value={filtered.length} /> Active
          </span>
        </div>
        
        {/* Continuous live pulsing status indicators */}
        <div className="flex items-center gap-2">
          {nasaAlerts.length > 0 && (
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-pulse-dot-red"></span>
              <span>NASA LIVE</span>
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
            <span>SYNCED</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Harmonious Segmented Control */}
      <div className="flex items-center gap-1 mb-2.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] text-[10px] font-medium">
        <button
          onClick={() => setSourceFilter('all')}
          className={`flex-1 py-1 rounded-lg text-center transition-all ${
            sourceFilter === 'all' 
              ? 'bg-white/10 text-white font-semibold shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All (<AnimatedCounter value={combinedAlerts.length} />)
        </button>
        <button
          onClick={() => setSourceFilter('nasa')}
          className={`flex-1 py-1 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            sourceFilter === 'nasa' 
              ? 'bg-white/10 text-white font-semibold shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Satellite className="w-3 h-3 text-rose-400" />
          <span>NASA (<AnimatedCounter value={nasaAlerts.length} />)</span>
        </button>
        <button
          onClick={() => setSourceFilter('imd')}
          className={`flex-1 py-1 rounded-lg text-center transition-all ${
            sourceFilter === 'imd' 
              ? 'bg-white/10 text-white font-semibold shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Weather (<AnimatedCounter value={liveAlerts?.length || 0} />)
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Disc className="w-8 h-8 text-emerald-500/40 mb-2" />
            <p className="text-xs font-semibold text-slate-300">All Parameters Normal</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
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
                className={`p-3 rounded-xl border border-white/[0.07] hover:border-white/[0.14] transition-all duration-150 cursor-pointer group bg-slate-900/50 hover:bg-slate-800/50 backdrop-blur-md relative overflow-hidden ${
                  accentBorder
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    
                    {/* Category Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105 ${tint}`}>
                      <Icon className={`w-4 h-4 ${alert.category === 'cyclone' ? 'animate-cyclone-bob' : ''}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Title & Tag */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug break-words">
                          {alert.title}
                        </h4>
                        {alert.isNasaEonet && (
                          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-400 border border-white/10">
                            NASA EONET
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {alert.description}
                      </p>

                      {/* Technical Telemetry Readout */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] font-mono text-slate-400">
                        {alert.coordinatesStr && (
                          <span className="text-slate-300 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                            {alert.coordinatesStr}
                          </span>
                        )}
                        <span>{alert.subtext}</span>
                        {alert.magnitude && (
                          <span className="text-rose-300 font-medium">
                            Intensity: {alert.magnitude}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded font-mono shrink-0 ${
                    alert.severityColor || 'bg-white/[0.06] text-slate-300 border border-white/10'
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
