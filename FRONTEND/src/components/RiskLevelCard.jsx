import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function RiskLevelCard({ riskScore: propScore, riskLevel: propLevel }) {
  const { current } = useWeather();

  // Use live OpenWeather-calculated score, or fallback to props
  const score = current?.riskScore ?? propScore ?? 65;
  const level = current?.riskLevel ?? propLevel ?? 'Moderate';

  // Dynamic hazard weights computed from current live weather readings
  const rainWeight = current?.rain_1h ? Math.min(50, Math.round(current.rain_1h * 15) + 20) : (current?.condition === 'Rain' ? 35 : 15);
  const windWeight = current?.wind_speed ? Math.min(40, Math.round(current.wind_speed * 0.8)) : 15;
  const heatWeight = current?.temp ? (current.temp >= 38 ? 40 : current.temp >= 32 ? 20 : 10) : 10;
  const thunderWeight = current?.condition === 'Thunderstorm' ? 35 : 10;
  const cycloneWeight = (current?.condition === 'Rain' && (current?.wind_speed || 0) > 30) ? 40 : 15;

  const total = rainWeight + windWeight + heatWeight + thunderWeight + cycloneWeight;
  const pRain = Math.round((rainWeight / total) * 100);
  const pWind = Math.round((windWeight / total) * 100);
  const pHeat = Math.round((heatWeight / total) * 100);
  const pThunder = Math.round((thunderWeight / total) * 100);
  const pCyclone = 100 - (pRain + pWind + pHeat + pThunder);

  const hazards = [
    { name: 'Rain / Flood', color: '#38BDF8', percent: pRain },
    { name: 'High Wind', color: '#10B981', percent: pWind },
    { name: 'Thermal Stress', color: '#EC4899', percent: pHeat },
    { name: 'Thunderstorm', color: '#FACC15', percent: pThunder },
    { name: 'Storm Threat', color: '#EF4444', percent: pCyclone },
  ];

  const badgeColor = level === 'Very High' 
    ? 'text-rose-400 bg-rose-950/60 border-rose-600/40' 
    : level === 'High' 
    ? 'text-orange-400 bg-orange-950/60 border-orange-600/40' 
    : level === 'Moderate'
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
    : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4 flex flex-col justify-between">
      
      {/* Header */}
      <div className="pb-2 border-b border-[#1E2C4F] mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white tracking-wide">
          Real-Time Risk Index
        </h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border font-mono ${badgeColor}`}>
          Score: {score}/100
        </span>
      </div>

      {/* Donut Gauge & Legend Display */}
      <div className="flex items-center justify-around gap-2 my-1">
        
        {/* SVG Circular Donut Chart */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#1A284D"
              strokeWidth="10"
            />
            {/* Dynamic gauge segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={level === 'Very High' ? '#EF4444' : level === 'High' ? '#F97316' : level === 'Moderate' ? '#FACC15' : '#10B981'}
              strokeWidth="10"
              strokeDasharray={`${Math.round(score * 2.512)} 251.2`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-extrabold text-white leading-tight font-display">
              {level}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">
              Live Index
            </span>
          </div>
        </div>

        {/* Hazard Legend Breakdown */}
        <div className="space-y-1 text-[11px]">
          {hazards.map((h) => (
            <div key={h.name} className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: h.color }}
              />
              <span className="text-slate-300 font-medium text-[10px]">{h.name}:</span>
              <span className="text-slate-400 text-[10px] font-mono">{h.percent}%</span>
            </div>
          ))}
        </div>

      </div>

      {/* Guidance Summary Box */}
      <div className="pt-2 border-t border-[#1E2C4F]">
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-white">Live Assessment:</span>
            <span className={`text-xs font-bold ${level === 'Very High' ? 'text-rose-400' : level === 'High' ? 'text-orange-400' : 'text-amber-400'}`}>
              {level} Risk
            </span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400">● OpenWeather Live</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
          {level === 'Very High' ? 'Severe hazard alert active. Follow evacuation advisories.' :
           level === 'High' ? 'Significant weather alert. Maintain indoor shelter.' :
           'Moderate atmospheric variation. Normal alert precautions apply.'}
        </p>
      </div>

    </div>
  );
}
