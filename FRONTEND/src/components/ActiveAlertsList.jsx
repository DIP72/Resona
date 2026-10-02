import React, { useState } from 'react';
import { 
  Disc, 
  Waves, 
  CloudLightning, 
  Flame, 
  Wind,
  Globe, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  HelpCircle, 
  Share2, 
  Languages, 
  MessageSquare, 
  ArrowRight,
  ExternalLink
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

// Convert knots to km/h with secondary knots text
function formatWindSpeed(magStr) {
  if (!magStr) return null;
  const match = magStr.match(/(\d+)\s*(kts|knots|kt)/i);
  if (match) {
    const knots = parseInt(match[1], 10);
    const kmh = Math.round(knots * 1.852);
    return `${kmh} km/h (${knots} kts)`;
  }
  const kmhMatch = magStr.match(/(\d+)\s*(km\/h|kmh)/i);
  if (kmhMatch) return `${kmhMatch[1]} km/h`;
  return magStr;
}

// Humanize raw titles and descriptions
function humanizeAlertText(alert, distKm, cityName) {
  const title = alert.title || '';
  const isPacific = title.toLowerCase().includes('pacific') || (alert.coordinates?.longitude || 0) > 110;
  const windText = formatWindSpeed(alert.magnitude);

  let plainTitle = title;
  let plainDesc = alert.description;
  let impactLine = '';

  if (alert.isNasaEonet) {
    if (title.toLowerCase().includes('storm') || title.toLowerCase().includes('cyclone') || title.toLowerCase().includes('typhoon')) {
      plainTitle = title.replace(/^Tropical Storm\s*/i, 'Tropical storm ')
                        .replace(/^Typhoon\s*/i, 'Typhoon ')
                        .replace(/^Cyclone\s*/i, 'Cyclone ');
      
      const regionName = isPacific ? 'the western Pacific' : 'open ocean';
      plainDesc = windText 
        ? `A severe storm is moving over ${regionName}, with winds near ${windText}.`
        : `A tropical storm system is active over ${regionName}.`;
    } else if (title.toLowerCase().includes('fire')) {
      plainDesc = 'Monitored thermal hotspot recorded by satellite sensors.';
    }
  }

  if (distKm != null) {
    if (distKm > 1000) {
      impactLine = `About ${distKm.toLocaleString()} km away. No action needed for you.`;
    } else if (distKm > 400) {
      impactLine = `About ${distKm.toLocaleString()} km away. Monitoring trajectory — no immediate threat.`;
    } else {
      impactLine = `Near ${cityName} (about ${distKm} km away). Stay alert and review guidance below.`;
    }
  } else {
    impactLine = 'No immediate action needed for your area.';
  }

  return { plainTitle, plainDesc, impactLine };
}

export default function ActiveAlertsList({ 
  onSelectAlert, 
  activeFilter, 
  currentLocation,
  onExplainInLanguage,
  onOpenSafety
}) {
  const { liveAlerts, eonetEvents } = useWeather();
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'near' | 'world'
  const [expandedActionId, setExpandedActionId] = useState(null);
  const [isElsewhereOpen, setIsElsewhereOpen] = useState(false);

  const cityName = currentLocation?.city || 'Bhubaneswar';
  const userLat = currentLocation?.lat ?? 20.2961;
  const userLon = currentLocation?.lon ?? 85.8245;

  // Process NASA events
  const nasaAlerts = (eonetEvents || []).map((e) => {
    const isSevereStorm = e.categoryId === 'severeStorms' || (e.category || '').toLowerCase().includes('storm') || (e.title || '').toLowerCase().includes('cyclone') || (e.title || '').toLowerCase().includes('typhoon') || (e.title || '').toLowerCase().includes('hurricane');
    const isWildfire = e.categoryId === 'wildfires' || (e.category || '').toLowerCase().includes('fire');
    const isFlood = e.categoryId === 'floods' || (e.category || '').toLowerCase().includes('flood');
    
    let cat = 'cyclone';
    let sev = 'Advisory';
    let sevColor = 'bg-amber-500/15 text-amber-200 border-amber-500/30';
    if (isWildfire) {
      cat = 'heatwave';
      sev = 'Notice';
      sevColor = 'bg-orange-500/15 text-orange-200 border-orange-500/30';
    } else if (isFlood) {
      cat = 'flood';
      sev = 'Caution';
      sevColor = 'bg-blue-500/15 text-blue-200 border-blue-500/30';
    } else if (isSevereStorm) {
      sev = 'Watched';
      sevColor = 'bg-slate-700/60 text-slate-300 border-white/10';
    }

    const lon = e.coordinates?.longitude;
    const lat = e.coordinates?.latitude;
    const distKm = (lat != null && lon != null) ? getDistanceKm(userLat, userLon, lat, lon) : null;
    const locStr = (lat != null && lon != null) ? `${lat.toFixed(1)}°N, ${lon.toFixed(1)}°E` : 'Global';

    return {
      id: e.id,
      category: cat,
      hazardType: cat,
      title: e.title,
      severity: sev,
      severityColor: sevColor,
      isEmergency: false,
      description: `Active satellite observation (${e.category})`,
      coordinatesStr: locStr,
      subtext: e.date ? new Date(e.date).toLocaleDateString() : 'Active',
      validity: 'NASA Earth Observatory',
      isNasaEonet: true,
      coordinates: e.coordinates,
      link: e.link,
      magnitude: e.magnitudeValue ? `${e.magnitudeValue} ${e.magnitudeUnit || ''}` : null,
      distanceKm: distKm
    };
  });

  // Local weather alerts from IMD
  const localFormattedAlerts = (liveAlerts || []).map(a => {
    return {
      ...a,
      severity: a.severity || 'Advisory',
      severityColor: 'bg-teal-500/15 text-teal-200 border-teal-500/30',
      distanceKm: (a.city || '').toLowerCase() === cityName.toLowerCase() ? 0 : 45
    };
  });

  const allAlerts = [...localFormattedAlerts, ...nasaAlerts];

  // Partition into: Near you (< 750 km) vs Elsewhere in the world (>= 750 km)
  const nearYouAlerts = allAlerts.filter(a => a.distanceKm != null && a.distanceKm < 750);
  const elsewhereAlerts = allAlerts.filter(a => a.distanceKm == null || a.distanceKm >= 750);

  // Filter based on active hazard filter
  const filterPredicate = (a) => {
    if (!activeFilter) return true;
    if (activeFilter === 'cyclone') {
      return a.category === 'cyclone' || a.category === 'flood' || a.hazardType === 'flood';
    }
    return a.category === activeFilter || a.hazardType === activeFilter;
  };

  const filteredNear = nearYouAlerts.filter(filterPredicate);
  const filteredElsewhere = elsewhereAlerts.filter(filterPredicate);

  const handleShareFamily = (alert, humanText) => {
    const text = `Weather Update for ${cityName}: ${humanText.plainTitle}. ${humanText.impactLine} Verified via ResonaAlert.`;
    if (navigator.share) {
      navigator.share({ title: `Weather Safety: ${cityName}`, text }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const renderAlertCard = (alert, isDistant = false) => {
    const distKm = alert.distanceKm;
    const { plainTitle, plainDesc, impactLine } = humanizeAlertText(alert, distKm, cityName);
    const isActionOpen = expandedActionId === alert.id;

    return (
      <div
        key={alert.id}
        className={`p-4 rounded-2xl transition-all duration-200 relative overflow-hidden ${
          isDistant 
            ? 'bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] opacity-90' 
            : 'bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            
            {/* Title & Tag */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="text-sm font-medium text-slate-100 leading-snug">
                {plainTitle}
              </h4>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${alert.severityColor}`}>
                {alert.severity}
              </span>
            </div>

            {/* Plain Human Description */}
            <p className="text-xs text-slate-300 leading-relaxed font-normal mt-0.5">
              {plainDesc}
            </p>

            {/* Reassuring Distance & Impact Line */}
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-teal-300/90">
              <Compass className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{impactLine}</span>
            </div>

            {/* Actions Toolbar */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
              
              {/* "What should I do?" button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedActionId(isActionOpen ? null : alert.id);
                }}
                className="text-xs font-medium text-teal-300 hover:text-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>What should I do?</span>
                {isActionOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <div className="flex items-center gap-2">
                {/* Explain in my language */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onExplainInLanguage) {
                      onExplainInLanguage();
                    } else {
                      window.dispatchEvent(new CustomEvent('resona-switch-tab', { detail: 'multilingual' }));
                    }
                  }}
                  className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 py-1 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/5"
                  title="Explain in Odia, Hindi, Bengali, or English"
                >
                  <Languages className="w-3 h-3 text-cyan-400" />
                  <span>Explain in my language</span>
                </button>

                {/* Notify family (only for local or near events) */}
                {!isDistant && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareFamily(alert, { plainTitle, impactLine });
                    }}
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 py-1 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/5"
                    title="Send safety alert to family on WhatsApp"
                  >
                    <Share2 className="w-3 h-3 text-emerald-400" />
                    <span>Notify family</span>
                  </button>
                )}
              </div>

            </div>

            {/* Expandable "What should I do?" Guidance Panel */}
            {isActionOpen && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-teal-500/20 text-xs text-slate-300 space-y-2 animate-fade-slide-up">
                <div className="flex items-center gap-1.5 font-medium text-teal-300">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Recommended guidance for {cityName} residents:</span>
                </div>
                {isDistant ? (
                  <p className="text-slate-300 leading-relaxed">
                    This event is thousands of kilometers away in the Pacific. It poses zero danger to your community. Normal day-to-day routines can continue without interruption.
                  </p>
                ) : (
                  <ul className="space-y-1.5 list-disc list-inside text-slate-200">
                    <li>Keep a clean bottle of drinking water and fully charged mobile phone handy.</li>
                    <li>Avoid unnecessary travel during peak rain or squally winds.</li>
                    <li>Follow verified announcements from Odisha Disaster Management (OSDMA).</li>
                  </ul>
                )}
                {onOpenSafety && (
                  <button
                    onClick={onOpenSafety}
                    className="text-[11px] text-teal-400 hover:underline flex items-center gap-1 pt-1 font-medium cursor-pointer"
                  >
                    <span>View full district evacuation checklist</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="weather-card p-4 sm:p-5 flex flex-col h-[560px] shadow-[0_8px_32px_rgba(0,0,0,0.36)] relative overflow-hidden animate-stagger-in stagger-2">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white tracking-normal font-sans">
            Weather & storm alerts
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-medium border border-white/10">
            {filteredNear.length} near you
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-teal-300 font-medium bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Live check</span>
          </span>
        </div>
      </div>

      {/* Alert Feed Content */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar relative z-10">
        
        {/* GROUP 1: NEAR YOU */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>Near {cityName}</span>
            <span className="text-[11px] text-slate-500">{filteredNear.length} active</span>
          </div>

          {filteredNear.length === 0 ? (
            <div className="p-4 rounded-xl bg-teal-500/[0.04] border border-teal-500/15 text-center space-y-1">
              <ShieldCheck className="w-6 h-6 text-teal-400 mx-auto opacity-80" />
              <p className="text-xs font-medium text-slate-200">No active warnings in your area</p>
              <p className="text-[11px] text-slate-400">Everything is calm in {cityName} right now.</p>
            </div>
          ) : (
            filteredNear.map(alert => renderAlertCard(alert, false))
          )}
        </div>

        {/* GROUP 2: ELSEWHERE IN THE WORLD (COLLAPSED BY DEFAULT) */}
        {filteredElsewhere.length > 0 && (
          <div className="pt-2 border-t border-white/[0.08] space-y-2">
            <button
              onClick={() => setIsElsewhereOpen(!isElsewhereOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-xs font-medium text-slate-300 transition-colors cursor-pointer border border-white/5"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Elsewhere in the world ({filteredElsewhere.length})</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>{isElsewhereOpen ? 'Hide distant events' : 'Show distant events'}</span>
                {isElsewhereOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {isElsewhereOpen && (
              <div className="space-y-2.5 pt-1 animate-fade-slide-up">
                <p className="text-[11px] text-slate-400 px-1">
                  These tropical storms are being tracked globally and do not impact {cityName}.
                </p>
                {filteredElsewhere.map(alert => renderAlertCard(alert, true))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
