import React from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Thermometer, 
  Wind,
  ArrowRight,
  Clock,
  CloudRain
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function RecentAlertsTimeline({ onSelectAlert }) {
  const { liveAlerts, lastUpdated } = useWeather();

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'flood': return Waves;
      case 'thunderstorm': return CloudLightning;
      case 'heatwave': return Thermometer;
      case 'wind': return Wind;
      case 'cyclone': return Disc;
      default: return CloudRain;
    }
  };

  const timeAgoStr = lastUpdated
    ? `${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    : 'Live';

  const defaultTimeline = [
    {
      id: 'r1',
      title: 'Precipitation Advisory — Patna',
      time: timeAgoStr,
      category: 'flood',
      city: 'Patna',
      temp: 24,
    },
    {
      id: 'r2',
      title: 'Live Weather Status — Bhubaneswar',
      time: '10m ago',
      category: 'wind',
      city: 'Bhubaneswar',
      temp: 24,
    },
    {
      id: 'r3',
      title: 'Live Weather Status — Kolkata',
      time: '25m ago',
      category: 'wind',
      city: 'Kolkata',
      temp: 28,
    },
    {
      id: 'r4',
      title: 'Marine Weather — Mumbai',
      time: '45m ago',
      category: 'wind',
      city: 'Mumbai',
      temp: 28,
    }
  ];

  const displayList = (liveAlerts && liveAlerts.length > 0)
    ? liveAlerts.slice(0, 5).map((a, i) => ({
        id: a.id || `live-${i}`,
        title: a.title,
        time: i === 0 ? 'Just now' : `${i * 12}m ago`,
        category: a.category,
        city: a.city,
        temp: a.temp,
        description: a.description
      }))
    : defaultTimeline;

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E2C4F] mb-2">
        <h3 className="text-xs font-bold text-white tracking-wide">
          Recent Alerts Timeline
        </h3>
        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Feed
        </span>
      </div>

      {/* Timeline List */}
      <div className="space-y-2">
        {displayList.map((item) => {
          const Icon = getCategoryIcon(item.category);
          return (
            <div
              key={item.id}
              onClick={() => onSelectAlert && onSelectAlert(item)}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#0D162E] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  item.category === 'cyclone' ? 'bg-blue-500/20 text-cyan-400' :
                  item.category === 'flood' ? 'bg-orange-500/20 text-orange-400' :
                  item.category === 'thunderstorm' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${item.category === 'cyclone' ? 'animate-spin-slow' : ''}`} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-[#38BDF8] transition-colors block truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{item.time}</span>
                    {item.temp && <span>• {item.temp}°C</span>}
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-emerald-400 font-mono shrink-0 font-medium">
                Live
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
