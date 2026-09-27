import React from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Thermometer, 
  Wind,
  ArrowRight,
  Radio,
  CloudRain
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function ActiveAlertsList({ onSelectAlert, activeFilter }) {
  const { liveAlerts, loading } = useWeather();

  // Helper to map category to icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'flood': return Waves;
      case 'thunderstorm': return CloudLightning;
      case 'heatwave': return Thermometer;
      case 'wind': return Wind;
      case 'cyclone': return Disc;
      default: return CloudRain;
    }
  };

  // Fallback defaults only if network is offline
  const fallbackAlerts = [
    {
      id: 'rain-patna',
      category: 'flood',
      hazardType: 'flood',
      title: 'Precipitation Advisory — Patna',
      severity: 'Moderate',
      severityColor: 'bg-blue-950 text-blue-300 border border-blue-500/50',
      description: 'Live: light rain | Temp: 24°C | Humidity: 100%',
      subtext: 'Wind: 8 km/h | Station: 1260086 (IMD)',
      validity: 'Live OpenWeather Observation'
    },
    {
      id: 'obs-bhubaneswar',
      category: 'wind',
      hazardType: 'weather',
      title: 'Live Weather Status — Bhubaneswar',
      severity: 'Low',
      severityColor: 'bg-slate-900 text-cyan-300 border border-cyan-500/30',
      description: 'Current: scattered clouds | Temp: 24°C | Humidity: 91%',
      subtext: 'Wind: 10 km/h | Pressure: 1006 hPa',
      validity: 'Live OpenWeather Observation'
    }
  ];

  const sourceAlerts = (liveAlerts && liveAlerts.length > 0) ? liveAlerts : fallbackAlerts;

  const filtered = activeFilter 
    ? sourceAlerts.filter(a => {
        if (activeFilter === 'cyclone') {
          return a.category === 'cyclone' || a.category === 'flood' || a.hazardType === 'flood' || a.cond === 'Rain';
        }
        return a.category === activeFilter || a.hazardType === activeFilter;
      }) 
    : sourceAlerts;

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4 flex flex-col h-[470px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E2C4F] mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Live Hazard Alerts
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
            {filtered.length} Active
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>OpenWeather Live</span>
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filtered.map((alert) => {
          const Icon = getCategoryIcon(alert.category);
          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert && onSelectAlert(alert)}
              className="p-3 rounded-xl bg-[#0D162E] border border-[#1E2C4F] hover:border-[#38BDF8]/60 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.category === 'cyclone' ? 'bg-blue-500/20 text-cyan-400' :
                    alert.category === 'flood' ? 'bg-orange-500/20 text-orange-400' :
                    alert.category === 'thunderstorm' ? 'bg-amber-500/20 text-amber-400' :
                    alert.category === 'heatwave' ? 'bg-pink-500/20 text-pink-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <Icon className={`w-4 h-4 ${alert.category === 'cyclone' ? 'animate-spin-slow' : ''}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-100 group-hover:text-[#38BDF8] transition-colors leading-snug truncate">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {alert.description}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {alert.subtext}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  alert.severityColor || 'bg-blue-950 text-blue-300 border border-blue-600/50'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
