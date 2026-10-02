import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Layers, 
  Radio, 
  Crosshair, 
  Info,
  CloudRain,
  CloudLightning,
  Sun,
  Wind,
  Compass,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  ShieldCheck,
  Satellite,
  Flame
} from 'lucide-react';

// Set Mapbox Public Token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

import { ALL_INDIA_CITIES } from '../data/indiaCities';
import { useWeather } from '../context/WeatherContext';
import CountUp from './CountUp';

function makeCirclePolygon(lon, lat, radiusKm = 65, points = 32) {
  const coords = [];
  const kmPerDegLat = 111.32;
  const kmPerDegLon = 111.32 * Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const dx = (radiusKm * Math.cos(angle)) / kmPerDegLon;
    const dy = (radiusKm * Math.sin(angle)) / kmPerDegLat;
    coords.push([lon + dx, lat + dy]);
  }
  return [coords];
}

/**
 * Build hazard zones GeoJSON dynamically from live city weather data.
 * Only generates zones around cities with ACTIVE severe weather (rain, high wind, thunderstorm, heatwave).
 */
function buildLiveHazardZones(cities) {
  const features = [];

  cities.forEach(city => {
    const cond = (city.condition || '').toLowerCase();
    const wind = city.wind_speed || 0;
    const rain = city.rain_1h || 0;
    const temp = city.temp || 25;

    let hazardType = null;
    let severity = 'Normal';
    let color = '#10B981'; // green
    let details = '';

    // Heavy rain / flood risk
    if (cond.includes('rain') || cond.includes('drizzle') || rain > 0) {
      hazardType = 'rain';
      severity = rain >= 5 ? 'High / Orange Watch' : 'Moderate / Yellow Watch';
      color = rain >= 5 ? '#F97316' : '#38BDF8';
      details = `Live: ${city.description || cond} | Rain: ${rain > 0 ? rain + ' mm/h' : 'Active'} | Humidity: ${city.humidity || '--'}%`;
    }
    // Thunderstorm
    if (cond.includes('thunderstorm') || cond.includes('thunder')) {
      hazardType = 'thunderstorm';
      severity = 'High / Red Watch';
      color = '#EF4444';
      details = `Live: Active thunderstorm convection | Wind: ${wind} km/h | Temp: ${temp}°C`;
    }
    // High wind / cyclone-grade
    if (wind >= 50) {
      hazardType = 'cyclone';
      severity = wind >= 80 ? 'Extreme / Red Alert' : 'High / Orange Alert';
      color = wind >= 80 ? '#DC2626' : '#F97316';
      details = `Live: Sustained wind ${wind} km/h | Gale conditions active`;
    }
    // Heatwave
    if (temp >= 40) {
      hazardType = 'heatwave';
      severity = temp >= 44 ? 'Extreme / Red Alert' : 'High / Orange Alert';
      color = '#EC4899';
      details = `Live: Ambient temperature ${temp}°C | Heat stress risk`;
    }

    if (hazardType) {
      const lon = city.lon;
      const lat = city.lat;
      features.push({
        type: 'Feature',
        properties: {
          id: `live-${city.city.toLowerCase().replace(/\s/g, '-')}`,
          name: `${city.city} — ${hazardType.charAt(0).toUpperCase() + hazardType.slice(1)} Zone`,
          type: hazardType,
          severity,
          wind: `${wind} km/h`,
          color,
          details: details || `Live observation for ${city.city}`
        },
        geometry: {
          type: 'Polygon',
          coordinates: makeCirclePolygon(lon, lat, hazardType === 'cyclone' ? 95 : 65)
        }
      });
    }
  });

  return { type: 'FeatureCollection', features };
}

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

export default function IndiaDisasterMap({ onSelectAlertZone, onSelectLocation, currentLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const nasaMarkersRef = useRef([]);

  const { eonetEvents } = useWeather();
  const [showNasaLayer, setShowNasaLayer] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState('all');
  const [liveCities, setLiveCities] = useState([]);
  const [isLoadingLiveWeather, setIsLoadingLiveWeather] = useState(true);
  const [selectedHazardInfo, setSelectedHazardInfo] = useState(null);
  const [activeRegion, setActiveRegion] = useState('all');
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  // Fetch Live Weather for All India Cities
  const fetchLiveIndiaWeather = useCallback(async () => {
    try {
      setIsLoadingLiveWeather(true);
      const cityNames = ALL_INDIA_CITIES.map(c => c.city).join(',');
      const res = await fetch(`http://localhost:5000/api/weather/multi?cities=${encodeURIComponent(cityNames)}&fresh=true`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.cities?.length) {
          const merged = ALL_INDIA_CITIES.map(baseCity => {
            const liveMatch = data.cities.find(c => 
              c.city.toLowerCase() === baseCity.city.toLowerCase() ||
              c.city.toLowerCase().includes(baseCity.city.toLowerCase()) ||
              baseCity.city.toLowerCase().includes(c.city.toLowerCase())
            );
            if (liveMatch) {
              return {
                ...baseCity,
                temp: liveMatch.temp,
                feels_like: liveMatch.feels_like,
                condition: liveMatch.condition,
                description: liveMatch.description,
                wind_speed: liveMatch.wind_speed,
                humidity: liveMatch.humidity,
                pressure: liveMatch.pressure,
                visibility: liveMatch.visibility,
                icon: liveMatch.icon,
                rain_1h: liveMatch.rain_1h || 0,
                risk: liveMatch.riskLevel || baseCity.risk,
                riskScore: liveMatch.riskScore,
                isLive: true
              };
            }
            return {
              ...baseCity,
              temp: baseCity.defaultTemp,
              condition: baseCity.defaultCond,
              wind_speed: 18,
              humidity: 80,
              isLive: false
            };
          });
          setLiveCities(merged);
          return;
        }
      }
      // Fallback
      setLiveCities(ALL_INDIA_CITIES.map(c => ({
        ...c,
        temp: c.defaultTemp,
        condition: c.defaultCond,
        wind_speed: 18,
        humidity: 80,
        isLive: false
      })));
    } catch (err) {
      console.warn('Live weather batch note:', err.message);
      setLiveCities(ALL_INDIA_CITIES.map(c => ({
        ...c,
        temp: c.defaultTemp,
        condition: c.defaultCond,
        wind_speed: 18,
        humidity: 80,
        isLive: false
      })));
    } finally {
      setIsLoadingLiveWeather(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveIndiaWeather();
    // Re-fetch every 2 minutes for continuous live sync
    const interval = setInterval(fetchLiveIndiaWeather, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLiveIndiaWeather]);

  // 1. Initialize Mapbox Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [79.2, 22.4],
      zoom: 4.1,
      minZoom: 3.5,
      maxZoom: 12,
      projection: 'mercator',
      attributionControl: false
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      // Add empty hazard source — will be updated dynamically
      map.addSource('hazard-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'hazard-zones-fill',
        type: 'fill',
        source: 'hazard-zones',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.22
        }
      });

      // Interactive click on hazard zones
      map.on('click', 'hazard-zones-fill', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setSelectedHazardInfo(props);
          if (onSelectAlertZone) {
            onSelectAlertZone(props);
          }
        }
      });

      map.on('mouseenter', 'hazard-zones-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'hazard-zones-fill', () => { map.getCanvas().style.cursor = ''; });

      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onSelectAlertZone]);

  // 2. Update hazard zones dynamically from live weather data
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || liveCities.length === 0) return;
    const map = mapRef.current;
    const source = map.getSource('hazard-zones');
    if (!source) return;

    const liveHazards = buildLiveHazardZones(liveCities);
    source.setData(liveHazards);
    setActiveAlertCount(liveHazards.features.length);
  }, [liveCities, mapLoaded]);

  // 3. Render city weather markers on map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || liveCities.length === 0) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const getWeatherIcon = (cond) => {
      const c = (cond || '').toLowerCase();
      if (c.includes('thunder')) return '⛈️';
      if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
      if (c.includes('snow')) return '❄️';
      if (c.includes('cloud') || c.includes('overcast')) return '☁️';
      if (c.includes('mist') || c.includes('haze') || c.includes('fog')) return '🌫️';
      if (c.includes('clear')) return '☀️';
      return '🌤️';
    };

    const getRiskColor = (risk) => {
      if (risk === 'Very High') return 'border-rose-500 shadow-rose-500/40';
      if (risk === 'High') return 'border-orange-500 shadow-orange-500/30';
      if (risk === 'Moderate') return 'border-amber-500 shadow-amber-500/20';
      return 'border-emerald-500 shadow-emerald-500/20';
    };

    const userCityName = currentLocation?.city || 'Bhubaneswar';
    const userLat = currentLocation?.lat ?? 20.2961;
    const userLon = currentLocation?.lon ?? 85.8245;

    liveCities.forEach(city => {
      const isUserCity = (city.city || '').toLowerCase() === userCityName.toLowerCase();
      const isSevere = city.risk === 'Very High' || city.risk === 'High' || city.condition === 'Thunderstorm' || (city.rain_1h || 0) > 0;
      
      const el = document.createElement('div');
      el.style.width = '0px';
      el.style.height = '0px';
      el.className = isUserCity ? 'cursor-pointer z-30' : 'cursor-pointer z-10';
      
      if (isUserCity) {
        // Distinct, friendly user location pin with a gentle, soft pulse
        el.innerHTML = `
          <div class="absolute -left-3.5 -top-3.5 w-7 h-7 group flex items-center justify-center">
            <span class="absolute -left-2 -top-2 w-11 h-11 rounded-full bg-teal-400/20 animate-ping pointer-events-none"></span>
            <div class="relative w-5 h-5 rounded-full bg-teal-400 border-2 border-white shadow-[0_2px_12px_rgba(20,184,166,0.6)] flex items-center justify-center text-[10px] text-slate-900 font-bold">
              📍
            </div>
            <span class="absolute left-7 top-1/2 -translate-y-1/2 text-xs font-medium text-white bg-slate-900/95 backdrop-blur-md border border-teal-400/40 px-3 py-1 rounded-full shadow-xl whitespace-nowrap z-40 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              <span>You are here • ${city.city} (${city.temp || '--'}°)</span>
            </span>
          </div>
        `;
      } else {
        // Decluttered calm city dot; label appears ONLY on hover
        const dotBg = isSevere ? 'bg-amber-400' : 'bg-slate-400/70';
        el.innerHTML = `
          <div class="absolute -left-1.5 -top-1.5 w-3 h-3 group flex items-center justify-center">
            <span class="w-2 h-2 rounded-full ${dotBg} ring-2 ring-white/10 shadow-sm transition-transform duration-150 group-hover:scale-150"></span>
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-200 bg-[#0E1528]/95 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              ${city.city} ${city.temp || '--'}°
            </span>
          </div>
        `;
      }

      el.addEventListener('click', () => {
        if (onSelectLocation) {
          onSelectLocation(city);
        }
      });

      const popup = new mapboxgl.Popup({ offset: 14, maxWidth: '240px' })
        .setHTML(`
          <div class="text-xs p-3 space-y-1.5 min-w-[180px] bg-[#0E1528] text-slate-200 border border-white/10 rounded-xl shadow-xl font-sans">
            <div class="font-semibold text-white border-b border-white/10 pb-1 flex items-center justify-between">
              <span>${city.city}, ${city.state}</span>
              <span class="text-[9px] px-2 py-0.5 rounded-full font-medium ${
                city.isLive ? 'bg-teal-950/80 text-teal-300 border border-teal-500/30' : 'bg-slate-800 text-slate-400'
              }">${city.isLive ? 'Live' : 'Forecast'}</span>
            </div>
            <div class="text-slate-300 pt-0.5">Temperature: <strong class="text-white">${city.temp || '--'}°C</strong></div>
            <div class="text-slate-300">Conditions: <strong class="text-white">${city.description || city.condition || '--'}</strong></div>
            <div class="text-slate-300">Wind: <strong class="text-white">${city.wind_speed || 0} km/h</strong></div>
            <div class="text-slate-300">Humidity: <strong class="text-white">${city.humidity || '--'}%</strong></div>
            <div class="text-slate-300">Safety Status: <strong class="${
              (city.risk === 'Very High' || city.risk === 'High') ? 'text-amber-400' : 'text-teal-400'
            }">${city.risk || 'Normal'}</strong></div>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([city.lon, city.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [liveCities, mapLoaded, onSelectLocation, currentLocation]);

  // 4. Render NASA EONET Live Natural Disaster Markers on Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // Clear old NASA markers
    nasaMarkersRef.current.forEach(m => m.remove());
    nasaMarkersRef.current = [];

    if (!showNasaLayer || !eonetEvents || eonetEvents.length === 0) return;

    const userLat = currentLocation?.lat ?? 20.2961;
    const userLon = currentLocation?.lon ?? 85.8245;
    const userCityName = currentLocation?.city || 'Bhubaneswar';

    eonetEvents.forEach(event => {
      const lon = event.coordinates?.longitude;
      const lat = event.coordinates?.latitude;
      if (lon == null || lat == null) return;

      const isFire = event.categoryId === 'wildfires' || (event.category || '').toLowerCase().includes('fire');
      const isVolcano = event.categoryId === 'volcanoes' || (event.category || '').toLowerCase().includes('volcano');

      const dist = getDistanceKm(userLat, userLon, lat, lon);
      const isDistant = dist != null && dist > 1200;

      let icon = '🌀';
      if (isFire) icon = '🔥';
      else if (isVolcano) icon = '🌋';

      const el = document.createElement('div');
      el.style.width = '0px';
      el.style.height = '0px';
      el.className = isDistant ? 'cursor-pointer z-15 opacity-80' : 'cursor-pointer z-25';

      if (isDistant) {
        // Quieter, smaller marker for distant Pacific events
        el.innerHTML = `
          <div class="absolute -left-3 -top-3 w-6 h-6 group flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-slate-900/90 border border-slate-600/50 flex items-center justify-center text-xs shadow-md backdrop-blur-sm transition-transform group-hover:scale-110">
              ${icon}
            </div>
            <span class="text-[10px] font-sans font-medium text-slate-200 bg-[#091124]/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-md mt-1 max-w-[160px] truncate text-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity absolute top-7 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-30">
              ${event.title} (Distant • ${dist ? Math.round(dist).toLocaleString() + ' km' : ''})
            </span>
          </div>
        `;
      } else {
        // Closer regional event
        el.innerHTML = `
          <div class="absolute -left-3.5 -top-3.5 w-7 h-7 group flex items-center justify-center">
            <span class="radiating-status-ring bg-amber-500/30 w-9 h-9 -left-1 -top-1 pointer-events-none"></span>
            <div class="w-7 h-7 rounded-full bg-amber-950/90 border border-amber-500/60 flex items-center justify-center text-xs shadow-lg backdrop-blur-md transition-transform group-hover:scale-110">
              ${icon}
            </div>
            <span class="text-[10px] font-sans font-medium text-white bg-[#091124]/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-lg mt-1 max-w-[150px] truncate text-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity absolute top-7 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-30">
              ${event.title}
            </span>
          </div>
        `;
      }

      const distMsg = isDistant 
        ? `<div class="text-teal-300 text-[11px] pt-1">Distance: ~${dist?.toLocaleString()} km away. No impact on ${userCityName}.</div>`
        : `<div class="text-amber-300 text-[11px] pt-1">Active regional event (${dist?.toLocaleString()} km away).</div>`;

      const popup = new mapboxgl.Popup({ offset: 16, maxWidth: '280px' })
        .setHTML(`
          <div class="text-xs p-3 space-y-1.5 min-w-[210px] bg-[#0B1020] text-slate-200 border border-white/10 rounded-2xl shadow-2xl font-sans">
            <div class="font-semibold text-white border-b border-white/10 pb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-teal-300 font-medium">
                🛰️ Global satellite observation
              </span>
              <span class="text-[9px] px-2 py-0.5 rounded-full ${isDistant ? 'bg-slate-800 text-slate-300' : 'bg-amber-950 text-amber-300'} font-medium">
                ${isDistant ? 'Distant' : 'Active'}
              </span>
            </div>
            <div class="font-medium text-sm text-white">${event.title}</div>
            <div class="text-slate-300">Category: <strong class="text-slate-200">${event.category}</strong></div>
            <div class="text-slate-300">Coordinates: <strong class="text-slate-300">${lat.toFixed(1)}°N, ${lon.toFixed(1)}°E</strong></div>
            ${distMsg}
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lon, lat])
        .setPopup(popup)
        .addTo(map);

      nasaMarkersRef.current.push(marker);
    });
  }, [eonetEvents, mapLoaded, showNasaLayer, currentLocation]);

  // Region Quick-Fly Controller
  const handleFlyToRegion = (region) => {
    setActiveRegion(region);
    if (!mapRef.current) return;
    const map = mapRef.current;

    switch (region) {
      case 'all':
        map.flyTo({ center: [79.2, 22.4], zoom: 4.1, duration: 1500 });
        break;
      case 'east':
        map.flyTo({ center: [86.2, 20.2], zoom: 6.8, duration: 1600 });
        break;
      case 'north':
        map.flyTo({ center: [77.2, 28.6], zoom: 6.2, duration: 1600 });
        break;
      case 'south':
        map.flyTo({ center: [78.5, 12.5], zoom: 6.2, duration: 1600 });
        break;
      case 'west':
        map.flyTo({ center: [73.0, 19.2], zoom: 6.2, duration: 1600 });
        break;
      case 'northeast':
        map.flyTo({ center: [91.8, 26.0], zoom: 7.0, duration: 1600 });
        break;
      default:
        map.flyTo({ center: [79.2, 22.4], zoom: 4.1, duration: 1500 });
    }
  };

  // Layer filter handler
  const handleToggleLayer = (layerType) => {
    setActiveLayer(layerType);
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (layerType === 'all') {
      map.setFilter('hazard-zones-fill', null);
    } else if (layerType === 'cyclone') {
      map.setFilter('hazard-zones-fill', ['==', ['get', 'type'], 'cyclone']);
    } else if (layerType === 'flood') {
      map.setFilter('hazard-zones-fill', ['any', ['==', ['get', 'type'], 'rain'], ['==', ['get', 'type'], 'flood']]);
    } else if (layerType === 'weather') {
      map.setFilter('hazard-zones-fill', ['any', ['==', ['get', 'type'], 'thunderstorm'], ['==', ['get', 'type'], 'heatwave']]);
    }
  };

  return (
    <div className="weather-card rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col relative h-[560px] shadow-2xl">
      
      {/* Top Map Header Controls */}
      <div className="px-4 py-2.5 bg-[#0A0F1F]/85 backdrop-blur-xl border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xs font-medium text-slate-200 tracking-normal flex items-center gap-2">
            Live map
          </h3>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium bg-teal-500/10 border border-teal-500/20 text-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Live observation</span>
          </span>
          {isLoadingLiveWeather && (
            <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5 hidden sm:flex">
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-sky-400" />
              Syncing
            </span>
          )}
        </div>

        {/* Streamlined HUD Controls: Layers & Region Selector */}
        <div className="flex items-center gap-2">
          
          {/* Region Dropdown Selector */}
          <select
            value={activeRegion}
            onChange={(e) => handleFlyToRegion(e.target.value)}
            className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 font-medium outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0D1324] text-white">All India</option>
            <option value="east" className="bg-[#0D1324] text-white">East / Odisha</option>
            <option value="north" className="bg-[#0D1324] text-white">North India</option>
            <option value="south" className="bg-[#0D1324] text-white">South India</option>
            <option value="west" className="bg-[#0D1324] text-white">West Coast</option>
            <option value="northeast" className="bg-[#0D1324] text-white">North East</option>
          </select>

          {/* Layer Filter Buttons - Harmonious Segmented Control */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs font-medium">
            <button
              onClick={() => handleToggleLayer('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeLayer === 'all' 
                  ? 'bg-white/15 text-white font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleToggleLayer('cyclone')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeLayer === 'cyclone' 
                  ? 'bg-white/15 text-white font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Storms</span>
            </button>
            <button
              onClick={() => handleToggleLayer('flood')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeLayer === 'flood' 
                  ? 'bg-white/15 text-white font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>Floods</span>
            </button>
            <button
              onClick={() => {
                const next = !showNasaLayer;
                setShowNasaLayer(next);
                if (next && eonetEvents?.length && mapRef.current) {
                  // Only fly if there is a severe event in or near the Indian subcontinent / Indian Ocean basin
                  const regionalEvent = eonetEvents.find(e => {
                    const lon = e.coordinates?.longitude;
                    const lat = e.coordinates?.latitude;
                    return lon != null && lat != null && lon >= 50 && lon <= 100 && lat >= 0 && lat <= 36;
                  });
                  if (regionalEvent && regionalEvent.coordinates?.longitude != null) {
                    mapRef.current.flyTo({ 
                      center: [regionalEvent.coordinates.longitude, regionalEvent.coordinates.latitude], 
                      zoom: 5.5, 
                      duration: 1500 
                    });
                  }
                  // Otherwise retain the current India map view
                }
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                showNasaLayer 
                  ? 'bg-white/15 text-white font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle NASA EONET Live Natural Events"
            >
              <Satellite className="w-3.5 h-3.5 text-rose-300 stroke-[1.8]" />
              <span>NASA ({eonetEvents?.length || 0})</span>
            </button>
          </div>

          <button
            onClick={() => handleFlyToRegion('all')}
            className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Reset Map to All India"
          >
            <Crosshair className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* Main Mapbox WebGL Canvas with Live Animated Radar Sweep Overlay */}
      <div className="flex-1 relative w-full h-full bg-[#070B19] overflow-hidden">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />



        {/* Floating Hazard Details Card (When clicked) */}
        {selectedHazardInfo && (
          <div className="absolute top-3 left-3 z-10 max-w-xs bg-[#0B1020]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-semibold text-white text-xs flex items-center gap-1.5 font-sans">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 stroke-[1.8]" />
                {selectedHazardInfo.name}
              </span>
              <button 
                onClick={() => setSelectedHazardInfo(null)}
                className="text-slate-400 hover:text-white text-base leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{selectedHazardInfo.details}</p>
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-white/10 font-sans">
              <span>Severity: <strong className="text-rose-300 font-semibold">{selectedHazardInfo.severity}</strong></span>
              <span>Winds: <strong className="text-white font-mono">{selectedHazardInfo.wind}</strong></span>
            </div>
          </div>
        )}

        {/* Legend Overlay (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 bg-[#0B1020]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 text-xs space-y-2 hidden sm:block shadow-xl">
          <div className="font-medium text-slate-300 text-[11px] tracking-normal font-sans mb-1">
            Active radar layers
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Precipitation & Rain</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Heavy Rain / Flood Risk</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>Severe Cyclone & Wind</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-sans">
            <span className="w-3 h-3 rounded-full bg-rose-600/80 border border-rose-400 flex items-center justify-center text-[8px]">🛰️</span>
            <span>NASA EONET Events (<CountUp value={eonetEvents?.length || 0} />)</span>
          </div>
        </div>

        {/* Live Stations Count Badge (Bottom Right) */}
        <div className="absolute bottom-3 right-3 z-10 bg-[#0B1020]/85 backdrop-blur-xl border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-sans text-slate-400 shadow-xl flex items-center gap-2">
          <span><strong className="text-emerald-400 font-semibold"><CountUp value={liveCities.length || ALL_INDIA_CITIES.length} /></strong> Cities Online</span>
          <span>•</span>
          <span className="text-cyan-300 font-semibold"><CountUp value={eonetEvents?.length || 0} /> NASA Events</span>
        </div>
      </div>

    </div>
  );
}
