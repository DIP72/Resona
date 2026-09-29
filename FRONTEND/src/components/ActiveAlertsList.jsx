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
          cardBorder: 'border border-blue-500/20 hover:border-blue-500/40 shadow-[0_4px_24px_-4px_rgba(59,130,246,0.12)]',
          tint: 'bg-blue-500/15 text-blue-300 border border-blue-500/20' 
        };
      case 'thunderstorm':
        return { 
          icon: CloudLightning, 
          cardBorder: 'border border-purple-500/20 hover:border-purple-500/40 shadow-[0_4px_24px_-4px_rgba(168,85,247,0.12)]',
          tint: 'bg-purple-500/15 text-purple-300 border border-purple-500/20' 
        };
      case 'heatwave':
        return { 
          icon: Flame, 
          cardBorder: 'border border-orange-500/20 hover:border-orange-500/40 shadow-[0_4px_24px_-4px_rgba(249,115,22,0.12)]',
          tint: 'bg-orange-500/15 text-orange-300 border border-orange-500/20' 
        };
      case 'wind':
        return { 
          icon: Wind, 
          cardBorder: 'border border-teal-500/20 hover:border-teal-500/40 shadow-[0_4px_24px_-4px_rgba(20,184,166,0.12)]',
          tint: 'bg-teal-500/15 text-teal-300 border border-teal-500/20' 
        };
      case 'cyclone':
      default:
        return { 
          icon: Disc, 
          cardBorder: 'border border-rose-500/25 hover:border-rose-500/45 shadow-[0_4px_24px_-4px_rgba(244,63,94,0.16)]',
          tint: 'bg-rose-500/15 text-rose-300 border border-rose-500/25' 
        };
    }
  };

  // Format NASA EONET events as first-class live alerts
  const nasaAlerts = (eonetEvents || []).map((e) => {
    const isSevereStorm = e.categoryId === 'severeStorms' || (e.category || '').toLowerCase().includes('storm') || (e.title || '').toLowerCase().includes('cyclone') || (e.title || '').toLowerCase().includes('typhoon') || (e.title || '').toLowerCase().includes('hurricane');
    const isWildfire = e.categoryId === 'wildfires' || (e.category || '').toLowerCase().includes('fire');
    const isFlood = e.categoryId === 'floods' || (e.category || '').toLowerCase().includes('flood');
    
    let cat = 'cyclone';
    let sevColor = 'bg-rose-500/15 text-rose-200 border border-rose-500/30';
    let sev = 'EXTREME';
    let isEmergency = true;
    if (isWildfire) {
      cat = 'heatwave';
      sevColor = 'bg-amber-500/15 text-amber-200 border border-amber-500/30';
      sev = 'HIGH';
      isEmergency = false;
    } else if (isFlood) {
      cat = 'flood';
      sevColor = 'bg-blue-500/15 text-blue-200 border border-blue-500/30';
      sev = 'SEVERE';
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
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col h-[560px] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
      
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-medium text-white tracking-normal font-sans">
            Live hazard feed
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.08] text-slate-200 font-sans font-medium border border-white/15 shadow-sm">
            <AnimatedCounter value={filtered.length} /> active
          </span>
        </div>
        
        {/* Continuous live pulsing status indicators */}
        <div className="flex items-center gap-2">
          {nasaAlerts.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>NASA live</span>
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live connected</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Harmonious Segmented Control */}
      <div className="flex items-center gap-1 mb-3.5 bg-slate-950/40 p-1 rounded-xl border border-white/10 text-xs font-medium relative z-10 shadow-inner">
        <button
          onClick={() => setSourceFilter('all')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-300 cursor-pointer ${
            sourceFilter === 'all' 
              ? 'bg-white/15 text-white shadow-sm font-medium' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          All (<AnimatedCounter value={combinedAlerts.length} />)
        </button>
        <button
          onClick={() => setSourceFilter('nasa')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
            sourceFilter === 'nasa' 
              ? 'bg-rose-500/15 text-rose-200 shadow-sm border border-rose-500/25 font-medium' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Satellite className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>NASA (<AnimatedCounter value={nasaAlerts.length} />)</span>
        </button>
        <button
          onClick={() => setSourceFilter('imd')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-300 cursor-pointer ${
            sourceFilter === 'imd' 
              ? 'bg-white/15 text-white shadow-sm font-medium' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          Weather (<AnimatedCounter value={liveAlerts?.length || 0} />)
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 no-scrollbar relative z-10">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <Disc className="w-7 h-7 text-emerald-400 opacity-80" />
            </div>
            <p className="text-sm font-semibold text-slate-200 tracking-normal">All conditions normal</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              No active warnings detected matching current filter criteria.
            </p>
          </div>
        ) : (
          filtered.map((alert, index) => {
            const { icon: Icon, cardBorder, tint } = getCategoryDetails(alert.category);

            return (
              <div
                key={alert.id || index}
                onClick={() => onSelectAlert && onSelectAlert(alert)}
                style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
                className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer group bg-slate-800/30 hover:bg-slate-800/50 backdrop-blur-xl relative overflow-hidden ${
                  cardBorder
                }`}
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.03] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="flex items-start justify-between gap-3.5 relative z-10">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    
                    {/* Category Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-105 shadow-inner ${tint}`}>
                      <Icon className={`w-4 h-4 stroke-[1.8] ${alert.category === 'cyclone' ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Title & Tag */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-[13px] font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug break-words">
                          {alert.title}
                        </h4>
                        {alert.isNasaEonet && (
                          <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                            NASA EONET
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        {alert.description}
                      </p>

                      {/* Technical Telemetry Readout */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-slate-400 bg-slate-950/40 px-2.5 py-1.5 rounded-xl border border-white/[0.06]">
                        {alert.coordinatesStr && (
                          <span className="text-cyan-300 font-mono text-[10px]">
                            {alert.coordinatesStr}
                          </span>
                        )}
                        <span className="opacity-40">•</span>
                        <span className="text-[10px]">{alert.subtext}</span>
                        {alert.magnitude && (
                          <>
                            <span className="opacity-40">•</span>
                            <span className="text-rose-300 font-medium text-[10px]">
                              Magnitude: {alert.magnitude}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 uppercase ${
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
