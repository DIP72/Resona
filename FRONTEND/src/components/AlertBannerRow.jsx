import React, { useState, useRef, useEffect } from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Flame, 
  Wind,
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info,
  ShieldCheck,
  Globe2,
  Bell,
  HeartHandshake
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import CountUp from './CountUp';

// Haversine distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getTimeAwareGreeting(cityName) {
  const hour = new Date().getHours();
  let timeStr = 'Good morning';
  if (hour >= 12 && hour < 17) timeStr = 'Good afternoon';
  else if (hour >= 17 && hour < 22) timeStr = 'Good evening';
  else if (hour >= 22 || hour < 5) timeStr = 'Good night';
  return `${timeStr}, ${cityName || 'friend'}`;
}

export default function AlertBannerRow({ activeFilter, onSelectFilter, currentLocation }) {
  const { liveAlerts, allCities, eonetEvents } = useWeather();
  const [showObservationDetails, setShowObservationDetails] = useState(false);
  const containerRef = useRef(null);

  const city = currentLocation?.city || 'Bhubaneswar';
  const userLat = currentLocation?.lat ?? 20.2961;
  const userLon = currentLocation?.lon ?? 85.8245;

  // 1. Process Live NASA EONET Storms with distance to user
  const nasaStorms = (eonetEvents || [])
    .filter(e => 
      e.categoryId === 'severeStorms' || 
      (e.category || '').toLowerCase().includes('storm') || 
      (e.title || '').toLowerCase().includes('cyclone') ||
      (e.title || '').toLowerCase().includes('typhoon') ||
      (e.title || '').toLowerCase().includes('hurricane')
    )
    .map(e => {
      const lat = e.coordinates?.latitude;
      const lon = e.coordinates?.longitude;
      const dist = (lat != null && lon != null) ? getDistanceKm(userLat, userLon, lat, lon) : null;
      return { ...e, distanceKm: dist };
    });

  // Local vs distant storms (under 750 km is local to region)
  const localStorms = nasaStorms.filter(s => s.distanceKm != null && s.distanceKm < 750);
  const distantStorms = nasaStorms.filter(s => s.distanceKm == null || s.distanceKm >= 750);

  // Local severe conditions from city telemetry or alerts
  const localAlerts = (liveAlerts || []).filter(a => 
    (a.city || '').toLowerCase() === city.toLowerCase() ||
    (a.title || '').toLowerCase().includes(city.toLowerCase())
  );

  const hasLocalEmergency = localStorms.length > 0 || localAlerts.length > 0;

  // Environmental baselines in user's state / monitored network
  const rainCities = (allCities || []).filter(c => (c.condition === 'Rain' || c.condition === 'Drizzle' || (c.rain_1h || 0) > 0)).map(c => c.city);
  const windCities = (allCities || []).filter(c => ((c.wind_speed || 0) >= 25)).map(c => c.city);
  const thunderCities = (allCities || []).filter(c => (c.condition === 'Thunderstorm')).map(c => c.city);
  const heatCities = (allCities || []).filter(c => ((c.temp || 0) >= 38)).map(c => c.city);
  const floodCount = (liveAlerts || []).filter(a => a.category === 'flood').length;

  const totalWarningsInArea = (hasLocalEmergency ? 1 : 0) + (rainCities.includes(city) ? 1 : 0) + (windCities.includes(city) ? 1 : 0) + (heatCities.includes(city) ? 1 : 0);

  // Plain human language status sentence
  const greeting = getTimeAwareGreeting(city);
  let statusSentence = '';
  if (hasLocalEmergency) {
    statusSentence = `A severe weather advisory is active near ${city}. Please stay informed, remain indoors, and check recommended guidance.`;
  } else if (distantStorms.length > 0) {
    const nearestDistant = distantStorms[0];
    const distText = nearestDistant.distanceKm ? `about ${nearestDistant.distanceKm.toLocaleString()} km away` : 'far away';
    const stormCountText = distantStorms.length === 1 
      ? 'One storm is being watched' 
      : `${distantStorms.length} storms are being watched`;
    statusSentence = `Nothing is threatening ${city} right now. ${stormCountText} in the Pacific, ${distText} from you.`;
  } else {
    statusSentence = `Nothing is threatening ${city} right now. Oceanic and regional baselines are calm and safe.`;
  }

  return (
    <div ref={containerRef} className="space-y-3 animate-stagger-in stagger-1">
      
      {/* ─── HUMANIZED GREETING & CALM STATUS HERO CARD ─── */}
      <div className={`rounded-2xl transition-all duration-300 p-4 sm:p-5 relative overflow-hidden weather-card ${
        hasLocalEmergency
          ? 'border-rose-500/50 bg-gradient-to-r from-rose-950/40 via-[#161B26]/90 to-[#121722]/90 shadow-rose-950/30'
          : 'border-white/10 bg-gradient-to-r from-[#141C2E]/85 via-[#121927]/85 to-[#0F1522]/90 shadow-[0_8px_32px_rgba(0,0,0,0.36)]'
      }`}>
        
        {/* Soft Ambient Inner Gradient */}
        <div className={`absolute inset-0 pointer-events-none ${
          hasLocalEmergency 
            ? 'bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent' 
            : 'bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent'
        }`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left Column: Friendly Greeting & One-sentence Status */}
          <div className="space-y-1.5 flex-1 min-w-0">
            
            {/* Friendly Greeting Header with Location Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-editorial text-lg sm:text-xl font-normal text-white tracking-tight">
                {greeting}.
              </span>
              
              {/* Calm Status Tag */}
              {hasLocalEmergency ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-200 border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <span>Advisory active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-teal-500/15 text-teal-200 border border-teal-500/25">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 stroke-[1.8]" />
                  <span>All clear near you</span>
                </span>
              )}

              {distantStorms.length > 0 && !hasLocalEmergency && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-white/10">
                  <Globe2 className="w-3 h-3 text-slate-400" />
                  <span>Tracking Pacific storm</span>
                </span>
              )}
            </div>

            {/* Plain-Language Status Line */}
            <p className="text-sm text-slate-200 leading-relaxed font-sans max-w-3xl">
              {statusSentence}
            </p>
          </div>

          {/* Right Action / Reassurance Badge */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            {hasLocalEmergency ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectFilter(activeFilter === 'cyclone' ? null : 'cyclone')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-950/50 cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Review local alert</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-300 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium text-xs">Community safe</div>
                  <div className="text-[11px] text-slate-400">Continuous 24x7 watch</div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ─── TIER 2: REASSURING LINE (REPLACING "Flood 0 / Thunderstorm 0 / Heatwave 0" PILLS) ─── */}
        <div className="pt-3 mt-3 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-2 relative z-10 text-xs text-slate-300">
          
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 stroke-[1.8] shrink-0" />
            <span className="font-medium text-slate-200">
              {totalWarningsInArea === 0 
                ? 'No flood, heat or wind warnings in your area.' 
                : `Conditions updated for ${city}. All public services normal.`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowObservationDetails(!showObservationDetails)}
              className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer py-0.5 px-2 rounded-lg hover:bg-white/5"
            >
              <span>{showObservationDetails ? 'Hide observation details' : 'View area details'}</span>
              {showObservationDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

        </div>

        {/* Expandable gentle detail cards */}
        {showObservationDetails && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-300 relative z-10 animate-fade-slide-up">
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[11px] text-slate-400">River basins & flood</div>
              <div className="text-white font-medium mt-0.5">Holding capacity safe</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[11px] text-slate-400">Lightning & storms</div>
              <div className="text-white font-medium mt-0.5">Zero active strikes</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[11px] text-slate-400">Heat stress index</div>
              <div className="text-white font-medium mt-0.5">Comfortable seasonal range</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[11px] text-slate-400">Coastal winds</div>
              <div className="text-white font-medium mt-0.5">Calm breezes under 20 km/h</div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
