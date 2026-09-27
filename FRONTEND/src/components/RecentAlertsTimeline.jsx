import React from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Flame, 
  Wind,
  Clock,
  CloudRain
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function RecentAlertsTimeline({ onSelectAlert }) {
  const { liveAlerts, eonetEvents, lastUpdated } = useWeather();

  const getCategoryDetails = (category) => {
    switch (category) {
      case 'flood':
        return { icon: Waves, tint: 'bg-blue-500/15 text-blue-400' };
      case 'thunderstorm':
        return { icon: CloudLightning, tint: 'bg-amber-500/15 text-amber-400' };
      case 'heatwave':
        return { icon: Flame, tint: 'bg-orange-500/15 text-orange-400' };
      case 'wind':
        return { icon: Wind, tint: 'bg-teal-500/15 text-teal-400' };
      case 'cyclone':
      default:
        return { icon: Disc, tint: 'bg-red-500/15 text-red-400' };
    }
  };

  const timeAgoStr = lastUpdated
    ? `${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    : 'Live';

  // Combine recent NASA events and local alerts for a rich timeline
  const combined = [
    ...(eonetEvents || []).slice(0, 3).map(e => ({
      id: e.id,
      title: `${e.title}`,
      time: e.date ? new Date(e.date).toLocaleDateString() : 'Live',
      category: 'cyclone',
      source: 'NASA EONET'
    })),
    ...(liveAlerts || []).slice(0, 3).map(a => ({
      id: a.id,
      title: a.title,
      time: 'Live Feed',
      category: a.category,
      city: a.city,
      temp: a.temp,
      source: 'IMD Station'
    }))
  ];

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] p-4.5 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2C4F]/80 mb-2.5">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
          Recent Ingestion Timeline
        </h3>
        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
          Live Ingest
        </span>
      </div>

      {/* Timeline List with micro-motion */}
      <div className="space-y-1.5">
        {combined.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4 font-mono">No recent bulletins recorded</p>
        ) : (
          combined.slice(0, 5).map((item, idx) => {
            const { icon: Icon, tint } = getCategoryDetails(item.category);
            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectAlert && onSelectAlert(item)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#0D162E]/90 hover:border-[#1E2C4F] border border-transparent transition-all duration-200 cursor-pointer group hover:translate-x-1"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${tint}`}>
                    <Icon className={`w-3.5 h-3.5 ${item.category === 'cyclone' ? 'animate-cyclone-bob' : ''}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-[#38BDF8] transition-colors block truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{item.time}</span>
                      <span>•</span>
                      <span className="text-cyan-400/80">{item.source}</span>
                    </span>
                  </div>
                </div>

                <span className="text-[9px] text-emerald-400 font-mono shrink-0 font-medium bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
