import React from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Flame, 
  Wind,
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function RecentAlertsTimeline({ onSelectAlert }) {
  const { liveAlerts, eonetEvents, lastUpdated } = useWeather();

  const getCategoryDetails = (category) => {
    switch (category) {
      case 'flood':
        return { icon: Waves, tint: 'bg-blue-500/15 text-blue-300' };
      case 'thunderstorm':
        return { icon: CloudLightning, tint: 'bg-purple-500/15 text-purple-300' };
      case 'heatwave':
        return { icon: Flame, tint: 'bg-orange-500/15 text-orange-300' };
      case 'wind':
        return { icon: Wind, tint: 'bg-teal-500/15 text-teal-300' };
      case 'cyclone':
      default:
        return { icon: Disc, tint: 'bg-amber-500/15 text-amber-300' };
    }
  };

  const timeAgoStr = lastUpdated
    ? `${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    : 'Just now';

  // Combine recent NASA events and local alerts for a rich timeline
  const combined = [
    ...(liveAlerts || []).slice(0, 3).map(a => ({
      id: a.id,
      title: a.title,
      time: 'Recent update',
      category: a.category,
      city: a.city,
      temp: a.temp,
      source: 'Regional station'
    })),
    ...(eonetEvents || []).slice(0, 3).map(e => ({
      id: e.id,
      title: `${e.title}`,
      time: e.date ? new Date(e.date).toLocaleDateString() : 'Live observation',
      category: 'cyclone',
      source: 'Global watch'
    }))
  ];

  return (
    <div className="weather-card p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5">
        <h3 className="text-sm font-semibold text-white tracking-normal font-sans">
          Recent weather updates
        </h3>
        <span className="text-[11px] text-teal-300 flex items-center gap-1.5 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          <span>Live feed</span>
        </span>
      </div>

      {/* Timeline List */}
      <div className="space-y-1.5 flex-1">
        {combined.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 font-sans">
            No recent alerts or storm warnings recorded.
          </p>
        ) : (
          combined.slice(0, 5).map((item, idx) => {
            const { icon: Icon, tint } = getCategoryDetails(item.category);
            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectAlert && onSelectAlert(item)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
                    <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-200 group-hover:text-teal-200 transition-colors block truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.time}</span>
                      <span>•</span>
                      <span className="text-slate-400">{item.source}</span>
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-teal-300 shrink-0 font-medium bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                  Recorded
                </span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
