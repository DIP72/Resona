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
          accentBorder: 'border-l-4 border-l-blue-500',
          tint: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
        };
      case 'thunderstorm':
        return { 
          icon: CloudLightning, 
          accentBorder: 'border-l-4 border-l-purple-500',
          tint: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
        };
      case 'heatwave':
        return { 
          icon: Flame, 
          accentBorder: 'border-l-4 border-l-orange-500',
          tint: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
        };
      case 'wind':
        return { 
          icon: Wind, 
          accentBorder: 'border-l-4 border-l-teal-500',
          tint: 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
        };
      case 'cyclone':
      default:
        return { 
          icon: Disc, 
          accentBorder: 'border-l-4 border-l-rose-500',
          tint: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
        };
    }
  };

  // Format NASA EONET events as first-class live alerts
  const nasaAlerts = (eonetEvents || []).map((e) => {
    const isSevereStorm = e.categoryId === 'severeStorms' || (e.category || '').toLowerCase().includes('storm') || (e.title || '').toLowerCase().includes('cyclone') || (e.title || '').toLowerCase().includes('typhoon') || (e.title || '').toLowerCase().includes('hurricane');
    const isWildfire = e.categoryId === 'wildfires' || (e.category || '').toLowerCase().includes('fire');
    const isFlood = e.categoryId === 'floods' || (e.category || '').toLowerCase().includes('flood');
    
    let cat = 'cyclone';
    let sevColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
    let sev = 'Extreme';
    let isEmergency = true;
    if (isWildfire) {
      cat = 'heatwave';
      sevColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      sev = 'High';
      isEmergency = false;
    } else if (isFlood) {
      cat = 'flood';
      sevColor = 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
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
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-5 flex flex-col h-[560px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
      
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-white tracking-widest uppercase">
            Live Hazard Feed
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 font-mono font-bold border border-white/20 shadow-sm">
            <AnimatedCounter value={filtered.length} /> Active
          </span>
        </div>
        
        {/* Continuous live pulsing status indicators */}
        <div className="flex items-center gap-2.5">
          {nasaAlerts.length > 0 && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_5px_rgba(244,63,94,0.8)]"></span>
              <span>NASA LIVE</span>
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
            <span>SYNCED</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Harmonious Segmented Control */}
      <div className="flex items-center gap-1.5 mb-4 bg-slate-950/50 p-1.5 rounded-xl border border-white/10 text-xs font-bold relative z-10 shadow-inner">
        <button
          onClick={() => setSourceFilter('all')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-300 ${
            sourceFilter === 'all' 
              ? 'bg-white/15 text-white shadow-md' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          All (<AnimatedCounter value={combinedAlerts.length} />)
        </button>
        <button
          onClick={() => setSourceFilter('nasa')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-300 flex items-center justify-center gap-2 ${
            sourceFilter === 'nasa' 
              ? 'bg-rose-500/20 text-rose-300 shadow-md border border-rose-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>NASA (<AnimatedCounter value={nasaAlerts.length} />)</span>
        </button>
        <button
          onClick={() => setSourceFilter('imd')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-300 ${
            sourceFilter === 'imd' 
              ? 'bg-white/15 text-white shadow-md' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          Weather (<AnimatedCounter value={liveAlerts?.length || 0} />)
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar relative z-10">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Disc className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>
            <p className="text-sm font-bold text-slate-200 tracking-wide">All Parameters Normal</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
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
                className={`p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group bg-slate-800/40 hover:bg-slate-700/60 backdrop-blur-xl relative overflow-hidden shadow-lg hover:shadow-xl ${
                  accentBorder
                }`}
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    
                    {/* Category Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110 shadow-inner ${tint}`}>
                      <Icon className={`w-5 h-5 ${alert.category === 'cyclone' ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Title & Tag */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors leading-snug break-words tracking-wide">
                          {alert.title}
                        </h4>
                        {alert.isNasaEonet && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/20 uppercase tracking-widest">
                            NASA EONET
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed opacity-90">
                        {alert.description}
                      </p>

                      {/* Technical Telemetry Readout */}
                      <div className="flex items-center gap-2.5 mt-2.5 flex-wrap text-[10px] font-mono font-medium text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-white/5">
                        {alert.coordinatesStr && (
                          <span className="text-sky-300">
                            {alert.coordinatesStr}
                          </span>
                        )}
                        <span className="opacity-50">•</span>
                        <span>{alert.subtext}</span>
                        {alert.magnitude && (
                          <>
                            <span className="opacity-50">•</span>
                            <span className="text-rose-300 font-bold">
                              INTENSITY: {alert.magnitude}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md font-mono shrink-0 uppercase tracking-widest ${
                    alert.severityColor || 'bg-white/10 text-slate-300 border border-white/20'
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
