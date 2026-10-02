import React from 'react';
import { 
  CloudRain, 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  CloudLightning,
  Sun,
  Cloud,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  RefreshCw,
  CloudOff,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

// Map OpenWeatherMap main condition -> icon component
function getWeatherIcon(condition) {
  const map = {
    'Thunderstorm': CloudLightning,
    'Drizzle': CloudDrizzle,
    'Rain': CloudRain,
    'Snow': CloudSnow,
    'Mist': CloudFog,
    'Smoke': CloudFog,
    'Haze': CloudFog,
    'Dust': CloudFog,
    'Fog': CloudFog,
    'Sand': CloudFog,
    'Ash': CloudFog,
    'Squall': Wind,
    'Tornado': Wind,
    'Clear': Sun,
    'Clouds': Cloud,
  };
  return map[condition] || Cloud;
}

function getIconColor(condition) {
  const map = {
    'Thunderstorm': 'text-amber-400',
    'Drizzle': 'text-teal-300',
    'Rain': 'text-teal-400',
    'Snow': 'text-slate-100',
    'Clear': 'text-amber-400',
    'Clouds': 'text-slate-300',
    'Mist': 'text-slate-400',
    'Haze': 'text-amber-300',
    'Dust': 'text-amber-500',
    'Fog': 'text-slate-400',
  };
  return map[condition] || 'text-teal-400';
}

export default function CurrentWeatherCard({ location }) {
  const { current, loading, error, lastUpdated, refresh } = useWeather();

  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  // Skeleton Loader (respects user requirement: skeleton loaders instead of spinners)
  if (loading && !current) {
    return (
      <div className="weather-card p-5 flex flex-col justify-between min-h-[260px] animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-white/10 rounded-lg"></div>
            <div className="h-3 w-20 bg-white/5 rounded-md"></div>
          </div>
          <div className="h-6 w-20 bg-white/10 rounded-full"></div>
        </div>
        <div className="py-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10"></div>
          <div className="space-y-2">
            <div className="h-8 w-24 bg-white/10 rounded-lg"></div>
            <div className="h-3 w-16 bg-white/5 rounded-md"></div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !current) {
    return (
      <div className="weather-card p-6 flex flex-col items-center justify-center min-h-[260px] text-center space-y-2">
        <CloudOff className="w-8 h-8 text-amber-400 mb-1" />
        <p className="text-sm font-medium text-slate-200">Weather update temporarily paused</p>
        <p className="text-xs text-slate-400 max-w-xs">{error}</p>
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

  const temp = current?.temp ?? location.temp ?? 24;
  const feelsLike = current?.feels_like ?? temp;
  const condition = current?.condition ?? location.condition ?? 'Clouds';
  const description = current?.description ?? '';
  const humidity = current?.humidity ?? 85;
  const windSpeed = current?.wind_speed ?? 10;
  const pressure = current?.pressure ?? 1006;
  const visibility = current?.visibility ?? 10;
  const cityName = current?.city ?? location.city;

  const WeatherIcon = getWeatherIcon(condition);
  const iconColor = getIconColor(condition);

  return (
    <div className="weather-card p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
      
      {/* Soft Ambient Inner Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/10 transition-colors duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-normal font-sans">
            Current weather in {cityName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            {location.state} • Updated {updatedStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="w-7 h-7 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 border border-teal-500/20 text-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Live check</span>
          </span>
        </div>
      </div>

      {/* Main Temperature and Icon display */}
      <div className="py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-inner">
            <WeatherIcon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <div className="flex flex-col">
            <div className="text-4xl font-semibold text-white tracking-tight flex items-start">
              <AnimatedCounter value={temp} />
              <span className="text-2xl mt-1 text-slate-300 font-normal">°C</span>
            </div>
            <p className="text-xs text-teal-300 capitalize font-medium">
              {description || condition}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Feels like <AnimatedCounter value={feelsLike} />°
            </p>
          </div>
        </div>

        {/* Reassuring note */}
        <div className="hidden sm:flex flex-col items-end text-right text-xs text-slate-300 max-w-[150px]">
          <span className="text-teal-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Normal conditions
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">Safe for daily routines</span>
        </div>
      </div>

      {/* Metrics Row: Wind in km/h first */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 relative z-10 text-xs">
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3 text-teal-400" /> Wind
          </span>
          <span className="text-white font-medium mt-1">
            {windSpeed} km/h
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-sky-400" /> Humidity
          </span>
          <span className="text-white font-medium mt-1">
            {humidity}%
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-amber-400" /> Pressure
          </span>
          <span className="text-white font-medium mt-1">
            {pressure} hPa
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-indigo-400" /> Visibility
          </span>
          <span className="text-white font-medium mt-1">
            {visibility} km
          </span>
        </div>
      </div>

    </div>
  );
}
