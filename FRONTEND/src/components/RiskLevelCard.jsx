import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

export default function RiskLevelCard({ riskScore: propScore, riskLevel: propLevel }) {
  const { current } = useWeather();

  // Use live OpenWeather-calculated score, or fallback to props
  const score = current?.riskScore ?? propScore ?? 25;
  const level = current?.riskLevel ?? propLevel ?? 'Normal';

  // Dynamic hazard weights computed from current live weather readings
  const rainWeight = current?.rain_1h ? Math.min(50, Math.round(current.rain_1h * 15) + 20) : (current?.condition === 'Rain' ? 30 : 10);
  const windWeight = current?.wind_speed ? Math.min(40, Math.round(current.wind_speed * 0.8)) : 10;
  const heatWeight = current?.temp ? (current.temp >= 38 ? 40 : current.temp >= 32 ? 20 : 10) : 10;
  const thunderWeight = current?.condition === 'Thunderstorm' ? 35 : 10;
  const cycloneWeight = (current?.condition === 'Rain' && (current?.wind_speed || 0) > 30) ? 40 : 10;

  const total = rainWeight + windWeight + heatWeight + thunderWeight + cycloneWeight;
  const pRain = Math.round((rainWeight / total) * 100);
  const pWind = Math.round((windWeight / total) * 100);
  const pHeat = Math.round((heatWeight / total) * 100);
  const pThunder = Math.round((thunderWeight / total) * 100);
  const pCyclone = 100 - (pRain + pWind + pHeat + pThunder);

  const hazards = [
    { name: 'Rain & flood watch', color: '#38BDF8', percent: pRain },
    { name: 'Wind conditions', color: '#14B8A6', percent: pWind },
    { name: 'Heat index', color: '#F59E0B', percent: pHeat },
    { name: 'Thunderstorm', color: '#A855F7', percent: pThunder },
    { name: 'Oceanic storms', color: '#F43F5E', percent: pCyclone },
  ];

  const badgeColor = level === 'Very High' 
    ? 'text-rose-200 bg-rose-500/15 border-rose-500/30' 
    : level === 'High' 
    ? 'text-amber-200 bg-amber-500/15 border-amber-500/30' 
    : level === 'Moderate'
    ? 'text-teal-200 bg-teal-500/15 border-teal-500/30' 
    : 'text-teal-200 bg-teal-500/10 border-teal-500/20';

  return (
    <div className="weather-card p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="pb-2.5 border-b border-white/10 mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-normal font-sans">
          Area safety assessment
        </h3>
        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
          Status: {level}
        </span>
      </div>

      {/* Donut Gauge & Legend Display */}
      <div className="flex items-center justify-around gap-2 my-2">
        
        {/* SVG Circular Donut Chart */}
        <div className="relative w-26 h-26 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="8"
            />
            {/* Dynamic gauge segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={level === 'Very High' ? '#F43F5E' : level === 'High' ? '#F59E0B' : level === 'Moderate' ? '#14B8A6' : '#10B981'}
              strokeWidth="8"
              strokeDasharray={`${Math.round(score * 2.512)} 251.2`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-semibold text-white leading-tight font-sans">
              {level}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              Safety level
            </span>
          </div>
        </div>

        {/* Hazard Legend Breakdown */}
        <div className="space-y-1.5 text-xs">
          {hazards.map((h) => (
            <div key={h.name} className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full shrink-0 shadow-sm" 
                style={{ backgroundColor: h.color }}
              />
              <span className="text-slate-300 font-normal text-xs">{h.name}:</span>
              <span className="text-slate-400 text-xs">
                <AnimatedCounter value={h.percent} suffix="%" />
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Guidance Summary Box */}
      <div className="pt-2.5 border-t border-white/10 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Community safety guidance</span>
          </span>
          <span className="text-[11px] text-teal-300">Updated 24x7</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
          {level === 'Very High' ? 'Severe weather conditions active. Please follow district safety advisories and stay indoors.' :
           level === 'High' ? 'Elevated weather notice. Keep emergency kit handy and limit non-essential travel.' :
           'Local weather conditions are safe and comfortable for daily activities.'}
        </p>
      </div>

    </div>
  );
}
