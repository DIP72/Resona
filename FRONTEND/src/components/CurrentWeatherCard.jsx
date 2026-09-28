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
  Loader2,
  RefreshCw,
  CloudOff
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
    'Thunderstorm': 'text-yellow-400',
    'Drizzle': 'text-blue-300',
    'Rain': 'text-sky-400',
    'Snow': 'text-white',
    'Clear': 'text-amber-400',
    'Clouds': 'text-slate-300',
    'Mist': 'text-slate-400',
    'Haze': 'text-amber-300',
    'Dust': 'text-amber-500',
    'Fog': 'text-slate-400',
  };
  return map[condition] || 'text-sky-400';
}

export default function CurrentWeatherCard({ location }) {
  const { current, loading, error, lastUpdated, refresh } = useWeather();

  // Format last updated time
  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  // Loading state
  if (loading && !current) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center min-h-[260px] shadow-xl">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-3" />
        <p className="text-sm text-slate-300 font-bold tracking-wide">Fetching telemetry...</p>
        <p className="text-[11px] text-slate-500 mt-1 font-mono uppercase tracking-widest">{location.city}</p>
      </div>
    );
  }

  // Error / fallback state
  if (error && !current) {
    return (
      <div className="bg-rose-950/30 backdrop-blur-2xl rounded-2xl border border-rose-500/20 p-6 flex flex-col items-center justify-center min-h-[260px] shadow-xl">
        <CloudOff className="w-8 h-8 text-rose-400 mb-3" />
        <p className="text-sm text-rose-300 font-bold tracking-wide text-center">Telemetry feed unavailable</p>
        <p className="text-[11px] text-rose-400/70 mt-1">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2 font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Stream
        </button>
      </div>
    );
  }

  // Use live OpenWeather sensor data
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
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
      
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/10 transition-colors duration-500"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-0.5">
            Ground Station
          </h3>
          <p className="text-[11px] text-sky-400 font-mono font-medium">
            {cityName}, {location.state}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={refresh}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
            <span>Live Stream</span>
          </span>
        </div>
      </div>

      {/* Main Temperature and Icon display */}
      <div className="py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
            <WeatherIcon className={`w-8 h-8 ${iconColor} drop-shadow-md ${condition === 'Clear' ? 'animate-[spin_20s_linear_infinite]' : ''}`} />
          </div>
          <div className="flex flex-col">
            <div className="text-4xl font-black text-white tracking-tighter drop-shadow-lg flex items-start">
              <AnimatedCounter value={temp} />
              <span className="text-2xl mt-1 text-slate-300">°C</span>
            </div>
            <p className="text-[13px] font-bold text-sky-300 capitalize tracking-wide drop-shadow">
              {description || condition}
            </p>
            <p className="text-[11px] text-slate-400 font-mono font-medium mt-1">
              Feels like: <span className="text-slate-200"><AnimatedCounter value={feelsLike} />°</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4-Metric Grid with Monospace Telemetry and Hover Lift */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 relative z-10">
        <div className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-white/20 flex items-center gap-3 transition-all duration-300">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Humidity</span>
            <span className="font-bold text-white font-mono text-[13px]">
              <AnimatedCounter value={humidity} /><span className="text-slate-400 text-[10px] ml-0.5">%</span>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-white/20 flex items-center gap-3 transition-all duration-300">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Wind</span>
            <span className="font-bold text-white font-mono text-[13px]">
              <AnimatedCounter value={windSpeed} /><span className="text-slate-400 text-[10px] ml-0.5">km/h</span>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-white/20 flex items-center gap-3 transition-all duration-300">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Pressure</span>
            <span className="font-bold text-white font-mono text-[13px]">
              <AnimatedCounter value={pressure} /><span className="text-slate-400 text-[10px] ml-0.5">hPa</span>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-white/20 flex items-center gap-3 transition-all duration-300">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Visibility</span>
            <span className="font-bold text-white font-mono text-[13px]">
              <AnimatedCounter value={visibility} /><span className="text-slate-400 text-[10px] ml-0.5">km</span>
            </span>
          </div>
        </div>
      </div>

      {/* Last updated footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase relative z-10">
        <span>Station Sync: {cityName}</span>
        <span className="text-sky-500/70">
          Telemetry: {updatedStr}
        </span>
      </div>

    </div>
  );
}
