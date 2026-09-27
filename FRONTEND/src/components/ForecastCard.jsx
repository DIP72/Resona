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
    'Rain': 'text-blue-400',
    'Snow': 'text-white',
    'Clear': 'text-yellow-400',
    'Clouds': 'text-slate-400',
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
      <div className="weather-card rounded-2xl border border-[#1E2C4F] p-5 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-[#38BDF8] animate-spin mb-2" />
        <p className="text-xs text-slate-400 font-mono">Loading atmospheric forecast...</p>
      </div>
    );
  }

  // Error state
  if (error && !forecast) {
    return (
      <div className="weather-card rounded-2xl border border-red-900/40 p-5 flex flex-col items-center justify-center min-h-[200px]">
        <CloudOff className="w-6 h-6 text-red-400 mb-2" />
        <p className="text-xs text-red-300 font-mono">Forecast unavailable</p>
        <button
          onClick={refresh}
          className="mt-2 text-[10px] text-[#38BDF8] hover:underline flex items-center gap-1 font-mono"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  const days = forecast?.days || [];

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4.5 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2C4F]/80 mb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            5-Day Atmospheric Outlook
          </h3>
          {forecast?.city && (
            <span className="text-[10px] text-slate-400 font-mono">
              • {forecast.city}
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="text-slate-400 hover:text-[#38BDF8] transition-colors p-1"
          title="Refresh forecast"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 5-Day List with Micro-Motion Hover Lift */}
      <div className="space-y-1.5">
        {days.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4 font-mono">No forecast telemetry available</p>
        ) : (
          days.map((d, idx) => {
            const Icon = getForecastIcon(d.condition);
            const color = getForecastColor(d.condition);
            return (
              <div 
                key={d.day + d.date}
                className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-[#0D162E]/90 hover:border-[#1E2C4F] border border-transparent transition-all duration-200 text-xs group cursor-default"
              >
                <div className="w-20">
                  <span className="font-semibold text-white block group-hover:text-cyan-300 transition-colors">{d.day}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{d.date}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800/40 flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-[11px] text-white font-mono font-medium tracking-tight">
                    <AnimatedCounter value={d.high} suffix="°" /> / <AnimatedCounter value={d.low} suffix="°" />
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right w-24 text-[11px] text-slate-300 capitalize truncate font-sans">
                    {d.condition}
                  </div>
                  {d.rain_mm > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] text-blue-400 font-mono bg-blue-950/40 px-1 py-0.5 rounded border border-blue-500/20" title="Expected rainfall">
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
