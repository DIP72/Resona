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
    'Rain': 'text-[#38BDF8]',
    'Snow': 'text-white',
    'Clear': 'text-amber-400',
    'Clouds': 'text-slate-300',
    'Mist': 'text-slate-400',
    'Haze': 'text-amber-300',
    'Dust': 'text-amber-500',
    'Fog': 'text-slate-400',
  };
  return map[condition] || 'text-[#38BDF8]';
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
      <div className="weather-card rounded-2xl border border-[#1E2C4F] p-5 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin mb-2" />
        <p className="text-xs text-slate-400 font-mono">Fetching live telemetry...</p>
        <p className="text-[10px] text-slate-500 mt-1">{location.city}, {location.state}</p>
      </div>
    );
  }

  // Error / fallback state
  if (error && !current) {
    return (
      <div className="weather-card rounded-2xl border border-red-900/40 p-5 flex flex-col items-center justify-center min-h-[200px]">
        <CloudOff className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-xs text-red-300 font-mono text-center">Telemetry feed unavailable</p>
        <p className="text-[10px] text-slate-500 mt-1">{error}</p>
        <button
          onClick={refresh}
          className="mt-3 text-[10px] text-[#38BDF8] hover:underline flex items-center gap-1 font-mono"
        >
          <RefreshCw className="w-3 h-3" /> Retry Stream
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
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4.5 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2C4F]/80">
        <div>
          <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            Ground Station Telemetry
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {cityName}, {location.state}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="text-slate-400 hover:text-[#38BDF8] transition-colors p-1"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
            <span>Live Stream</span>
          </span>
        </div>
      </div>

      {/* Main Temperature and Icon display */}
      <div className="my-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-blue-950/30`}>
            <WeatherIcon className={`w-8 h-8 ${iconColor} ${condition === 'Clear' ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              <AnimatedCounter value={temp} suffix="°C" />
            </div>
            <p className="text-xs font-semibold text-slate-200 capitalize">
              {description || condition}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Feels like: <AnimatedCounter value={feelsLike} suffix="°C" />
            </p>
          </div>
        </div>
      </div>

      {/* 4-Metric Grid with Monospace Telemetry and Hover Lift */}
      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#1E2C4F]/80 text-xs">
        <div className="p-2.5 rounded-xl bg-[#0D162E]/80 border border-[#1E2C4F]/60 flex items-center gap-2.5 card-hover-lift">
          <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Humidity</span>
            <span className="font-semibold text-white font-mono text-xs">
              <AnimatedCounter value={humidity} suffix="%" />
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0D162E]/80 border border-[#1E2C4F]/60 flex items-center gap-2.5 card-hover-lift">
          <Wind className="w-4 h-4 text-teal-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Wind</span>
            <span className="font-semibold text-white font-mono text-xs">
              <AnimatedCounter value={windSpeed} suffix=" km/h" />
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0D162E]/80 border border-[#1E2C4F]/60 flex items-center gap-2.5 card-hover-lift">
          <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Pressure</span>
            <span className="font-semibold text-white font-mono text-xs">
              <AnimatedCounter value={pressure} suffix=" hPa" />
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0D162E]/80 border border-[#1E2C4F]/60 flex items-center gap-2.5 card-hover-lift">
          <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Visibility</span>
            <span className="font-semibold text-white font-mono text-xs">
              <AnimatedCounter value={visibility} suffix=" km" />
            </span>
          </div>
        </div>
      </div>

      {/* Last updated footer */}
      <div className="mt-2.5 pt-2 border-t border-[#1E2C4F]/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Station Sync: {cityName}</span>
        <span className="text-slate-500">
          Telemetry: {updatedStr}
        </span>
      </div>

    </div>
  );
}
