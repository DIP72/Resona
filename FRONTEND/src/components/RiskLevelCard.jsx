import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

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

  // Exact color-coded hazard system matching prompt
  const hazards = [
    { name: 'Cyclone / Storm', color: '#EF4444', percent: pCyclone },
    { name: 'Flood & Rain', color: '#3B82F6', percent: pRain },
    { name: 'Squally Wind', color: '#14B8A6', percent: pWind },
    { name: 'Heat Stress', color: '#F97316', percent: pHeat },
    { name: 'Thunderstorm', color: '#FACC15', percent: pThunder },
  ];

  const badgeColor = level === 'Very High' 
    ? 'text-rose-400 bg-rose-950/60 border-rose-600/40' 
    : level === 'High' 
    ? 'text-orange-400 bg-orange-950/60 border-orange-600/40' 
    : level === 'Moderate'
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/40' 
    : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4.5 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="pb-2.5 border-b border-[#1E2C4F]/80 mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
          Composite Threat Index
        </h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border font-mono ${badgeColor}`}>
          Score: <AnimatedCounter value={score} />/100
        </span>
      </div>

      {/* Donut Gauge & Legend Display */}
      <div className="flex items-center justify-around gap-2 my-2">
        
        {/* SVG Circular Donut Chart */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#1A284D"
              strokeWidth="9"
            />
            {/* Dynamic gauge segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={level === 'Very High' ? '#EF4444' : level === 'High' ? '#F97316' : level === 'Moderate' ? '#FACC15' : '#10B981'}
              strokeWidth="9"
              strokeDasharray={`${Math.round(score * 2.512)} 251.2`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-extrabold text-white leading-tight font-mono">
              {level}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">
              Risk Level
            </span>
          </div>
        </div>

        {/* Hazard Legend Breakdown with color-coded markers */}
        <div className="space-y-1.5 text-[11px]">
          {hazards.map((h) => (
            <div key={h.name} className="flex items-center gap-2 group cursor-default">
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-125" 
                style={{ backgroundColor: h.color }}
              />
              <span className="text-slate-300 font-medium text-[10px]">{h.name}:</span>
              <span className="text-slate-400 text-[10px] font-mono">
                <AnimatedCounter value={h.percent} suffix="%" />
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Guidance Summary Box */}
      <div className="pt-2.5 border-t border-[#1E2C4F]/80">
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-white">Assessment:</span>
            <span className={`text-xs font-bold font-mono ${level === 'Very High' ? 'text-rose-400' : level === 'High' ? 'text-orange-400' : 'text-amber-400'}`}>
              {level} Severity
            </span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
            Telemetry Synced
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-snug font-sans">
          {level === 'Very High' ? 'Severe hazard alert active. Follow emergency relocation advisories.' :
           level === 'High' ? 'Significant weather alert. Maintain indoor shelter.' :
           'Atmospheric index within operational safety parameters.'}
        </p>
      </div>

    </div>
  );
}
