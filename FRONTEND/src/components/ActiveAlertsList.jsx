import React, { useState } from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Thermometer, 
  Wind,
  Flame,
  Radio,
  CloudRain,
  ExternalLink,
  Satellite
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function ActiveAlertsList({ onSelectAlert, activeFilter }) {
  const { liveAlerts, eonetEvents, loading } = useWeather();
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'nasa' | 'imd'

  // Helper to map category to icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'flood': return Waves;
      case 'thunderstorm': return CloudLightning;
      case 'heatwave': return Flame;
      case 'wind': return Wind;
      case 'cyclone': return Disc;
      default: return CloudRain;
    }
  };

  // Format NASA EONET events as first-class live alerts
  const nasaAlerts = (eonetEvents || []).map((e) => {
    const isSevereStorm = e.categoryId === 'severeStorms' || (e.category || '').toLowerCase().includes('storm') || (e.title || '').toLowerCase().includes('cyclone') || (e.title || '').toLowerCase().includes('typhoon') || (e.title || '').toLowerCase().includes('hurricane');
    const isWildfire = e.categoryId === 'wildfires' || (e.category || '').toLowerCase().includes('fire');
    const isFlood = e.categoryId === 'floods' || (e.category || '').toLowerCase().includes('flood');
    
    let cat = 'cyclone';
    let sevColor = 'bg-rose-950 text-rose-300 border border-rose-600/50';
    let sev = 'Extreme';
    if (isWildfire) {
      cat = 'heatwave';
      sevColor = 'bg-orange-950 text-orange-300 border border-orange-600/50';
      sev = 'High';
    } else if (isFlood) {
      cat = 'flood';
      sevColor = 'bg-blue-950 text-blue-300 border border-blue-500/50';
      sev = 'Severe';
    }

    const lon = e.coordinates?.longitude;
    const lat = e.coordinates?.latitude;
    const locStr = (lat != null && lon != null) 
      ? `${lat.toFixed(1)}°N, ${lon.toFixed(1)}°E` 
      : 'Global Satellite Orbit';

    return {
      id: e.id,
      category: cat,
      hazardType: cat,
      title: `${e.title}`,
      severity: sev,
      severityColor: sevColor,
      description: `NASA Live Event: ${e.category} | ${locStr}`,
      subtext: `Satellite Date: ${e.date ? new Date(e.date).toLocaleDateString() : 'Live'} | Verified Open Source`,
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
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4 flex flex-col h-[470px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2C4F] mb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Live Hazard Alerts
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
            {filtered.length} Active
          </span>
        </div>
        
        {/* Real-time badges */}
        <div className="flex items-center gap-1.5">
          {nasaAlerts.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-400 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-500/30">
              <Satellite className="w-2.5 h-2.5 animate-pulse" />
              <span>NASA EONET</span>
            </span>
          )}
          <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Sync</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: All / NASA Events / Regional Weather */}
      <div className="flex items-center gap-1 mb-2.5 bg-[#0B132B] p-1 rounded-lg border border-[#1E2C4F] text-[10px] font-medium">
        <button
          onClick={() => setSourceFilter('all')}
          className={`flex-1 py-1 rounded text-center transition-colors ${
            sourceFilter === 'all' ? 'bg-[#38BDF8] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({combinedAlerts.length})
        </button>
        <button
          onClick={() => setSourceFilter('nasa')}
          className={`flex-1 py-1 rounded text-center transition-colors flex items-center justify-center gap-1 ${
            sourceFilter === 'nasa' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🛰️ NASA</span>
          <span className="text-[9px] px-1 rounded bg-black/40 font-mono">{nasaAlerts.length}</span>
        </button>
        <button
          onClick={() => setSourceFilter('imd')}
          className={`flex-1 py-1 rounded text-center transition-colors ${
            sourceFilter === 'imd' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Weather ({liveAlerts?.length || 0})
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Disc className="w-8 h-8 text-emerald-500/50 mb-2" />
            <p className="text-xs font-semibold text-slate-300">No Active Alerts</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Atmospheric conditions are calm in the filtered category.</p>
          </div>
        ) : (
          filtered.map((alert) => {
            const Icon = getCategoryIcon(alert.category);
            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert && onSelectAlert(alert)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  alert.isNasaEonet 
                    ? 'bg-gradient-to-r from-[#170C1E] to-[#0D162E] border-rose-900/50 hover:border-rose-500' 
                    : 'bg-[#0D162E] border-[#1E2C4F] hover:border-[#38BDF8]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.isNasaEonet ? 'bg-rose-500/20 text-rose-400' :
                      alert.category === 'cyclone' ? 'bg-blue-500/20 text-cyan-400' :
                      alert.category === 'flood' ? 'bg-orange-500/20 text-orange-400' :
                      alert.category === 'thunderstorm' ? 'bg-amber-500/20 text-amber-400' :
                      alert.category === 'heatwave' ? 'bg-pink-500/20 text-pink-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${alert.category === 'cyclone' ? 'animate-spin-slow' : ''}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-[#38BDF8] transition-colors leading-snug truncate">
                          {alert.title}
                        </h4>
                        {alert.isNasaEonet && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                            NASA EONET
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        {alert.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {alert.subtext} {alert.magnitude ? `| Magnitude: ${alert.magnitude}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
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
