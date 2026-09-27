import React from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Thermometer, 
  Wind 
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function AlertBannerRow({ activeFilter, onSelectFilter }) {
  const { liveAlerts, allCities } = useWeather();

  // Dynamically compute real-time counts and active regions from live OpenWeather observation stream
  const rainCities = (allCities || []).filter(c => (c.condition === 'Rain' || c.condition === 'Drizzle' || (c.rain_1h || 0) > 0)).map(c => c.city);
  const windCities = (allCities || []).filter(c => ((c.wind_speed || 0) >= 20)).map(c => c.city);
  const thunderCities = (allCities || []).filter(c => (c.condition === 'Thunderstorm')).map(c => c.city);
  const heatCities = (allCities || []).filter(c => ((c.temp || 0) >= 36)).map(c => c.city);
  const floodCount = (liveAlerts || []).filter(a => a.category === 'flood').length;

  const alertsSummary = [
    {
      id: 'cyclone',
      type: 'Rain & Precipitation',
      count: rainCities.length > 0 ? `${rainCities.length} Active` : '0 Active (Dry)',
      regions: rainCities.length > 0 ? `(${rainCities.slice(0, 3).join(', ')})` : '(No Active Rain)',
      icon: Disc,
      iconBg: rainCities.length > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400',
      cardBg: rainCities.length > 0 ? 'bg-gradient-to-br from-[#0B2545] to-[#07172B] border-blue-900/60 hover:border-blue-500' : 'bg-[#0E1730] border-[#1E2C4F]',
      activeRing: 'ring-2 ring-blue-500',
      textAccent: rainCities.length > 0 ? 'text-blue-400' : 'text-slate-300',
      countColor: rainCities.length > 0 ? 'text-blue-300' : 'text-slate-400'
    },
    {
      id: 'flood',
      type: 'Flood & Inundation',
      count: floodCount > 0 ? `${floodCount} Monitored` : (rainCities.length > 0 ? `${rainCities.length} Rain Watch` : '0 Active'),
      regions: rainCities.length > 0 ? `(${rainCities.slice(0, 2).join(', ')} Basins)` : '(Normal Levels)',
      icon: Waves,
      iconBg: floodCount > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400',
      cardBg: floodCount > 0 ? 'bg-gradient-to-br from-[#2B1309] to-[#1D0C05] border-orange-900/60 hover:border-orange-500' : 'bg-[#0E1730] border-[#1E2C4F]',
      activeRing: 'ring-2 ring-orange-500',
      textAccent: floodCount > 0 ? 'text-orange-400' : 'text-slate-300',
      countColor: floodCount > 0 ? 'text-orange-300' : 'text-slate-400'
    },
    {
      id: 'thunderstorm',
      type: 'Thunderstorm Watch',
      count: thunderCities.length > 0 ? `${thunderCities.length} Active` : '0 Active (Clear)',
      regions: thunderCities.length > 0 ? `(${thunderCities.slice(0, 2).join(', ')})` : '(No Active Cells)',
      icon: CloudLightning,
      iconBg: thunderCities.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400',
      cardBg: thunderCities.length > 0 ? 'bg-gradient-to-br from-[#291A07] to-[#1C1204] border-amber-900/60 hover:border-amber-500' : 'bg-[#0E1730] border-[#1E2C4F]',
      activeRing: 'ring-2 ring-amber-500',
      textAccent: thunderCities.length > 0 ? 'text-amber-400' : 'text-slate-300',
      countColor: thunderCities.length > 0 ? 'text-amber-300' : 'text-slate-400'
    },
    {
      id: 'heatwave',
      type: 'Heatwave Alert',
      count: heatCities.length > 0 ? `${heatCities.length} Active` : '0 Active (<36°C)',
      regions: heatCities.length > 0 ? `(${heatCities.slice(0, 2).join(', ')})` : '(Normal Thermal)',
      icon: Thermometer,
      iconBg: heatCities.length > 0 ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-800 text-slate-400',
      cardBg: heatCities.length > 0 ? 'bg-gradient-to-br from-[#2D0B1C] to-[#1F0713] border-pink-900/60 hover:border-pink-500' : 'bg-[#0E1730] border-[#1E2C4F]',
      activeRing: 'ring-2 ring-pink-500',
      textAccent: heatCities.length > 0 ? 'text-pink-400' : 'text-slate-300',
      countColor: heatCities.length > 0 ? 'text-pink-300' : 'text-slate-400'
    },
    {
      id: 'wind',
      type: 'Squally Wind & Gale',
      count: windCities.length > 0 ? `${windCities.length} Active` : '0 Active (<20 km/h)',
      regions: windCities.length > 0 ? `(${windCities.slice(0, 2).join(', ')})` : '(Gentle Breeze)',
      icon: Wind,
      iconBg: windCities.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400',
      cardBg: windCities.length > 0 ? 'bg-gradient-to-br from-[#0A261D] to-[#061812] border-emerald-900/60 hover:border-emerald-500' : 'bg-[#0E1730] border-[#1E2C4F]',
      activeRing: 'ring-2 ring-emerald-500',
      textAccent: windCities.length > 0 ? 'text-emerald-400' : 'text-slate-300',
      countColor: windCities.length > 0 ? 'text-emerald-300' : 'text-slate-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {alertsSummary.map((item) => {
        const Icon = item.icon;
        const isSelected = activeFilter === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectFilter(isSelected ? null : item.id)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${item.cardBg} ${
              isSelected ? item.activeRing : ''
            } shadow-lg`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                <Icon className={`w-5 h-5 ${item.id === 'cyclone' ? 'animate-spin-slow' : ''}`} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-200 truncate">
                  {item.type}
                </h4>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className={`text-xs font-bold ${item.countColor}`}>
                    {item.count}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {item.regions}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
