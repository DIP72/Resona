import React from 'react';
import { 
  CloudRain, 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudLightning,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  Wind,
  Loader2,
  CloudOff,
  RefreshCw,
  Droplets
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

// Map OpenWeatherMap condition -> icon
function getForecastIcon(condition) {
  const map = {
    'Thunderstorm': CloudLightning,
    'Drizzle': CloudDrizzle,
    'Rain': CloudRain,
    'Snow': CloudSnow,
    'Mist': CloudFog,
    'Haze': CloudFog,
    'Fog': CloudFog,
    'Dust': Wind,
    'Clear': Sun,
    'Clouds': Cloud,
  };
  return map[condition] || CloudSun;
}

function getForecastColor(condition) {
  const map = {
    'Thunderstorm': 'text-yellow-400',
    'Drizzle': 'text-blue-300',
    'Rain': 'text-sky-400',
    'Snow': 'text-white',
    'Clear': 'text-amber-400',
    'Clouds': 'text-slate-300',
    'Mist': 'text-slate-400',
    'Haze': 'text-amber-300',
  };
  return map[condition] || 'text-amber-400';
}

export default function ForecastCard() {
  const { forecast, loading, error, refresh } = useWeather();

  // Loading state
  if (loading && !forecast) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center min-h-[260px] shadow-xl">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-3" />
        <p className="text-sm text-slate-300 font-bold tracking-wide">Loading outlook...</p>
      </div>
    );
  }

  // Error state
  if (error && !forecast) {
    return (
      <div className="bg-rose-950/30 backdrop-blur-2xl rounded-2xl border border-rose-500/20 p-6 flex flex-col items-center justify-center min-h-[260px] shadow-xl">
        <CloudOff className="w-8 h-8 text-rose-400 mb-3" />
        <p className="text-sm text-rose-300 font-bold tracking-wide">Forecast unavailable</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2 font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const days = forecast?.days || [];

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
      
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-500"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-white tracking-widest uppercase">
            5-Day Outlook
          </h3>
          {forecast?.city && (
            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {forecast.city}
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
          title="Refresh forecast"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 5-Day List with Micro-Motion Hover Lift */}
      <div className="space-y-2 relative z-10 flex-1 overflow-y-auto no-scrollbar">
        {days.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-slate-500 font-mono font-bold uppercase tracking-widest">No forecast telemetry</p>
          </div>
        ) : (
          days.map((d, idx) => {
            const Icon = getForecastIcon(d.condition);
            const color = getForecastColor(d.condition);
            return (
              <div 
                key={d.day + d.date}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 border border-white/5 hover:border-white/10 transition-all duration-300 text-xs group/item cursor-default"
              >
                <div className="w-24 flex flex-col">
                  <span className="font-bold text-slate-200 group-hover/item:text-white tracking-wide transition-colors">{d.day}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 group-hover/item:text-slate-400 transition-colors">{d.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110 shadow-inner">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-xs text-white font-mono font-bold tracking-tight">
                    <AnimatedCounter value={d.high} suffix="°" /> <span className="text-slate-500 font-normal">/</span> <AnimatedCounter value={d.low} suffix="°" />
                  </span>
                </div>

                <div className="flex flex-col items-end w-28 gap-1">
                  <span className="text-[11px] font-bold text-slate-300 capitalize truncate w-full text-right">
                    {d.condition}
                  </span>
                  {d.rain_mm > 0 && (
                    <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-blue-400 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20" title="Expected rainfall">
                      <Droplets className="w-2.5 h-2.5" />
                      {d.rain_mm}mm
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
