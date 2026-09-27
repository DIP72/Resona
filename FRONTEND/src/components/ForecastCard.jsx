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
  ArrowRight,
  Loader2,
  CloudOff,
  RefreshCw,
  Droplets
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

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
      <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-[#38BDF8] animate-spin mb-2" />
        <p className="text-xs text-slate-400 font-mono">Loading forecast...</p>
      </div>
    );
  }

  // Error state
  if (error && !forecast) {
    return (
      <div className="weather-card rounded-2xl border border-red-900/40 p-4 flex flex-col items-center justify-center min-h-[200px]">
        <CloudOff className="w-6 h-6 text-red-400 mb-2" />
        <p className="text-xs text-red-300 font-mono">Forecast unavailable</p>
        <button
          onClick={refresh}
          className="mt-2 text-[10px] text-[#38BDF8] hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  const days = forecast?.days || [];

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E2C4F] mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-white tracking-wide">
            5 Day Forecast
          </h3>
          {forecast?.city && (
            <span className="text-[10px] text-slate-500 font-mono">
              • {forecast.city}
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="text-slate-500 hover:text-[#38BDF8] transition-colors"
          title="Refresh forecast"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 5-Day List */}
      <div className="space-y-2">
        {days.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4 font-mono">No forecast data available</p>
        ) : (
          days.map((d) => {
            const Icon = getForecastIcon(d.condition);
            const color = getForecastColor(d.condition);
            return (
              <div 
                key={d.day + d.date}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#0D162E] transition-colors text-xs group"
              >
                <div className="w-20">
                  <span className="font-semibold text-white block">{d.day}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{d.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-[11px] text-white font-mono font-medium">
                    {d.high}° / {d.low}°
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right w-24 text-[11px] text-slate-400 truncate">
                    {d.condition}
                  </div>
                  {d.rain_mm > 0 && (
                    <span className="hidden group-hover:flex items-center gap-0.5 text-[9px] text-blue-400 font-mono" title="Expected rainfall">
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
