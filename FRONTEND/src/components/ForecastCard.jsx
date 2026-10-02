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
  CloudOff, 
  RefreshCw, 
  Droplets,
  Calendar
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
    'Thunderstorm': 'text-amber-400',
    'Drizzle': 'text-teal-300',
    'Rain': 'text-teal-400',
    'Snow': 'text-slate-100',
    'Clear': 'text-amber-400',
    'Clouds': 'text-slate-300',
    'Mist': 'text-slate-400',
    'Haze': 'text-amber-300',
  };
  return map[condition] || 'text-amber-400';
}

export default function ForecastCard() {
  const { forecast, loading, error, refresh } = useWeather();

  // Skeleton Loading state (replaces spinner)
  if (loading && !forecast) {
    return (
      <div className="weather-card p-5 flex flex-col justify-between min-h-[260px] animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="h-4 w-36 bg-white/10 rounded-lg"></div>
          <div className="h-6 w-6 bg-white/10 rounded-lg"></div>
        </div>
        <div className="space-y-2 py-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !forecast) {
    return (
      <div className="weather-card p-6 flex flex-col items-center justify-center min-h-[260px] text-center space-y-2">
        <CloudOff className="w-8 h-8 text-amber-400 mb-1" />
        <p className="text-sm font-medium text-slate-200">5-day forecast temporarily unavailable</p>
        <button
          onClick={refresh}
          className="mt-3 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Check again</span>
        </button>
      </div>
    );
  }

  const days = forecast?.days || [];

  return (
    <div className="weather-card p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-white tracking-normal font-sans">
            5-day weather forecast
          </h3>
          {forecast?.city && (
            <span className="text-[11px] text-teal-300 font-medium bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/20">
              {forecast.city}
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="w-7 h-7 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
          title="Refresh forecast"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 5-Day List */}
      <div className="space-y-2 relative z-10 flex-1 overflow-y-auto no-scrollbar">
        {days.length === 0 ? (
          <div className="h-full flex items-center justify-center py-6">
            <p className="text-xs text-slate-400 font-sans">Upcoming forecast will appear here soon.</p>
          </div>
        ) : (
          days.map((d) => {
            const Icon = getForecastIcon(d.condition);
            const color = getForecastColor(d.condition);
            return (
              <div 
                key={d.day + d.date}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all duration-200 text-xs cursor-default"
              >
                <div className="w-24 flex flex-col">
                  <span className="font-medium text-slate-100">{d.day}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">{d.date}</span>
                </div>

                <div className="flex items-center gap-2.5 flex-1 justify-center">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-slate-300 capitalize font-sans truncate max-w-[120px] text-left">
                    {d.description || d.condition}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className="text-white font-medium text-sm">
                    <AnimatedCounter value={d.temp_max ?? d.temp} />°
                  </span>
                  <span className="text-slate-400 text-xs">
                    {d.temp_min ?? d.temp - 3}°
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
