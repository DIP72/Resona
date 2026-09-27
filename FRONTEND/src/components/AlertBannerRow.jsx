import React from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Flame, 
  Wind,
  Satellite
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

export default function AlertBannerRow({ activeFilter, onSelectFilter }) {
  const { liveAlerts, allCities, eonetEvents } = useWeather();

  // Real NASA EONET live storms & cyclones
  const nasaStorms = (eonetEvents || []).filter(e => 
    e.categoryId === 'severeStorms' || 
    (e.category || '').toLowerCase().includes('storm') || 
    (e.title || '').toLowerCase().includes('cyclone') ||
    (e.title || '').toLowerCase().includes('typhoon') ||
    (e.title || '').toLowerCase().includes('hurricane')
  );

  const rainCities = (allCities || []).filter(c => (c.condition === 'Rain' || c.condition === 'Drizzle' || (c.rain_1h || 0) > 0)).map(c => c.city);
  const windCities = (allCities || []).filter(c => ((c.wind_speed || 0) >= 20)).map(c => c.city);
  const thunderCities = (allCities || []).filter(c => (c.condition === 'Thunderstorm')).map(c => c.city);
  const heatCities = (allCities || []).filter(c => ((c.temp || 0) >= 36)).map(c => c.city);
  const floodCount = (liveAlerts || []).filter(a => a.category === 'flood').length;

  const cycloneHasActive = nasaStorms.length > 0;
  const cycloneCount = cycloneHasActive ? nasaStorms.length : rainCities.length;

  const alertsSummary = [
    {
      id: 'cyclone',
      type: cycloneHasActive ? 'Live Cyclones & Storms' : 'Cyclone Alert',
      countNum: cycloneCount,
      countLabel: cycloneHasActive ? 'Active (NASA)' : (rainCities.length > 0 ? 'Rain Watch' : 'Clear'),
      regions: cycloneHasActive 
        ? `(${nasaStorms[0].title}${nasaStorms.length > 1 ? ` +${nasaStorms.length - 1}` : ''})` 
        : (rainCities.length > 0 ? `(${rainCities.slice(0, 2).join(', ')})` : '(No Active Storms)'),
      icon: Disc,
      accentBorder: 'border-t-2 border-t-red-500',
      iconTint: cycloneHasActive ? 'bg-red-500/25 text-red-400' : 'bg-red-500/10 text-red-400/70',
      activeCardBg: 'bg-gradient-to-br from-[#2D0B1C]/90 to-[#1F0713]/80 border-red-500/50 shadow-lg shadow-red-950/40',
      inactiveCardBg: 'bg-[#0E1730]/75 backdrop-blur-md border-[#1E2C4F]',
      activeRing: 'ring-2 ring-red-500',
      textAccent: 'text-red-400',
      countColor: cycloneHasActive ? 'text-red-300' : 'text-slate-300',
      isNasa: cycloneHasActive
    },
    {
      id: 'flood',
      type: 'Flood & Inundation Watch',
      countNum: floodCount > 0 ? floodCount : rainCities.length,
      countLabel: floodCount > 0 ? 'Monitored' : (rainCities.length > 0 ? 'Rain Watch' : 'Normal'),
      regions: rainCities.length > 0 ? `(${rainCities.slice(0, 2).join(', ')} Basins)` : '(Normal Levels)',
      icon: Waves,
      accentBorder: 'border-t-2 border-t-blue-500',
      iconTint: floodCount > 0 ? 'bg-blue-500/25 text-blue-400' : 'bg-blue-500/10 text-blue-400/70',
      activeCardBg: 'bg-gradient-to-br from-[#0B2545]/90 to-[#07172B]/80 border-blue-500/50 shadow-lg shadow-blue-950/40',
      inactiveCardBg: 'bg-[#0E1730]/75 backdrop-blur-md border-[#1E2C4F]',
      activeRing: 'ring-2 ring-blue-500',
      textAccent: 'text-blue-400',
      countColor: floodCount > 0 ? 'text-blue-300' : 'text-slate-300'
    },
    {
      id: 'thunderstorm',
      type: 'Thunderstorm & Lightning',
      countNum: thunderCities.length,
      countLabel: thunderCities.length > 0 ? 'Active' : 'Clear',
      regions: thunderCities.length > 0 ? `(${thunderCities.slice(0, 2).join(', ')})` : '(No Active Cells)',
      icon: CloudLightning,
      accentBorder: 'border-t-2 border-t-amber-400',
      iconTint: thunderCities.length > 0 ? 'bg-amber-500/25 text-amber-400' : 'bg-amber-500/10 text-amber-400/70',
      activeCardBg: 'bg-gradient-to-br from-[#291A07]/90 to-[#1C1204]/80 border-amber-500/50 shadow-lg shadow-amber-950/40',
      inactiveCardBg: 'bg-[#0E1730]/75 backdrop-blur-md border-[#1E2C4F]',
      activeRing: 'ring-2 ring-amber-500',
      textAccent: 'text-amber-400',
      countColor: thunderCities.length > 0 ? 'text-amber-300' : 'text-slate-300'
    },
    {
      id: 'heatwave',
      type: 'Heatwave & Thermal Stress',
      countNum: heatCities.length,
      countLabel: heatCities.length > 0 ? 'Active' : 'Normal',
      regions: heatCities.length > 0 ? `(${heatCities.slice(0, 2).join(', ')})` : '(<36°C Ambient)',
      icon: Flame,
      accentBorder: 'border-t-2 border-t-orange-500',
      iconTint: heatCities.length > 0 ? 'bg-orange-500/25 text-orange-400' : 'bg-orange-500/10 text-orange-400/70',
      activeCardBg: 'bg-gradient-to-br from-[#2D1408]/90 to-[#1F0D05]/80 border-orange-500/50 shadow-lg shadow-orange-950/40',
      inactiveCardBg: 'bg-[#0E1730]/75 backdrop-blur-md border-[#1E2C4F]',
      activeRing: 'ring-2 ring-orange-500',
      textAccent: 'text-orange-400',
      countColor: heatCities.length > 0 ? 'text-orange-300' : 'text-slate-300'
    },
    {
      id: 'wind',
      type: 'Squally Wind & Gale Force',
      countNum: windCities.length,
      countLabel: windCities.length > 0 ? 'Active' : 'Calm',
      regions: windCities.length > 0 ? `(${windCities.slice(0, 2).join(', ')})` : '(Gentle Breeze)',
      icon: Wind,
      accentBorder: 'border-t-2 border-t-teal-400',
      iconTint: windCities.length > 0 ? 'bg-teal-500/25 text-teal-400' : 'bg-teal-500/10 text-teal-400/70',
      activeCardBg: 'bg-gradient-to-br from-[#072421]/90 to-[#041614]/80 border-teal-500/50 shadow-lg shadow-teal-950/40',
      inactiveCardBg: 'bg-[#0E1730]/75 backdrop-blur-md border-[#1E2C4F]',
      activeRing: 'ring-2 ring-teal-500',
      textAccent: 'text-teal-400',
      countColor: windCities.length > 0 ? 'text-teal-300' : 'text-slate-300'
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
            className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all duration-200 card-hover-lift ${
              item.accentBorder
            } ${
              isSelected ? `${item.activeCardBg} ${item.activeRing}` : item.inactiveCardBg
            } shadow-lg relative overflow-hidden group`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${item.iconTint}`}>
                <Icon className={`w-5 h-5 ${item.id === 'cyclone' ? 'animate-cyclone-bob' : ''}`} />
              </div>

              <div className="min-w-0 flex-1">
                {/* Wrapped title without ellipsis truncate */}
                <h4 className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2 min-h-[32px] flex items-center group-hover:text-white transition-colors">
                  {item.type}
                </h4>

                {/* Numerical Readout with smooth Animated Counter */}
                <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                  <div className={`text-xs font-bold font-mono flex items-center gap-1 ${item.countColor}`}>
                    <AnimatedCounter value={item.countNum} />
                    <span>{item.countLabel}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                    {item.regions}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle glow highlight on bottom */}
            {isSelected && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
