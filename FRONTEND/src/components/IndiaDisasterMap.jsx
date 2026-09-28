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
import AnimatedCounter from './AnimatedCounter';

/**
 * Build hazard zones GeoJSON dynamically from live city weather data.
 * Only generates zones around cities with ACTIVE severe weather (rain, high wind, thunderstorm, heatwave).
 */
function buildLiveHazardZones(cities) {
  const features = [];
  const R = 0.8; // approximate radius in degrees (~80 km)

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
          coordinates: [[
            [lon - R, lat - R * 0.7],
            [lon + R, lat - R * 0.7],
            [lon + R, lat + R * 0.7],
            [lon - R, lat + R * 0.7],
            [lon - R, lat - R * 0.7],
          ]]
        }
      });
    }
  });

  return { type: 'FeatureCollection', features };
}

export default function IndiaDisasterMap({ onSelectAlertZone, onSelectLocation }) {
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
          'fill-opacity': 0.28
        }
      });

      map.addLayer({
        id: 'hazard-zones-line',
        type: 'line',
        source: 'hazard-zones',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.9,
          'line-dasharray': [2, 1]
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

    liveCities.forEach(city => {
      const isKeyHub = ['Bhubaneswar', 'New Delhi', 'Kolkata', 'Mumbai', 'Chennai', 'Puri'].includes(city.city);
      const isSevere = city.risk === 'Very High' || city.risk === 'High' || city.condition === 'Thunderstorm' || (city.rain_1h || 0) > 0;
      
      const el = document.createElement('div');
      el.style.width = '0px';
      el.style.height = '0px';
      el.className = 'cursor-pointer z-10';
      
      const dotColor = isSevere ? 'bg-rose-400 ring-rose-400/40' : 'bg-sky-400 ring-sky-400/30';
      
      el.innerHTML = `
        <div class="absolute -left-1.5 -top-1.5 w-3 h-3 group flex items-center justify-center">
          <span class="absolute w-2.5 h-2.5 rounded-full ${dotColor} ring-4 shadow-md transition-transform duration-150 group-hover:scale-110"></span>
          ${(isKeyHub || isSevere) ? `
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-200 bg-slate-950/80 backdrop-blur border border-white/10 px-1.5 py-0.5 rounded shadow whitespace-nowrap hidden sm:inline">
              ${city.city} <strong class="text-white">${city.temp || '--'}°</strong>
            </span>
          ` : `
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-200 bg-slate-950/90 backdrop-blur border border-white/10 px-1.5 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              ${city.city} ${city.temp || '--'}°
            </span>
          `}
        </div>
      `;

      el.addEventListener('click', () => {
        if (onSelectLocation) {
          onSelectLocation(city);
        }
      });

      const popup = new mapboxgl.Popup({ offset: 14, maxWidth: '240px' })
        .setHTML(`
          <div class="text-xs p-2 space-y-1 min-w-[180px] bg-[#0E1528] text-slate-200 border border-white/10 rounded-lg">
            <div class="font-semibold text-white border-b border-white/10 pb-1 flex items-center justify-between">
              <span>${city.city}, ${city.state}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded font-mono ${
                city.isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }">${city.isLive ? 'LIVE' : 'Forecast'}</span>
            </div>
            <div class="text-slate-300 pt-0.5">Temperature: <strong class="text-white">${city.temp || '--'}°C</strong></div>
            <div class="text-slate-300">Conditions: <strong class="text-white">${city.description || city.condition || '--'}</strong></div>
            <div class="text-slate-300">Wind: <strong class="text-white">${city.wind_speed || 0} km/h</strong></div>
            <div class="text-slate-300">Humidity: <strong class="text-white">${city.humidity || '--'}%</strong></div>
            <div class="text-slate-300">Threat Index: <strong class="${
              (city.risk === 'Very High' || city.risk === 'High') ? 'text-rose-400' : 'text-emerald-400'
            }">${city.risk || 'Low'} ${city.riskScore ? `(${city.riskScore})` : ''}</strong></div>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([city.lon, city.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [liveCities, mapLoaded, onSelectLocation]);

  // 4. Render NASA EONET Live Natural Disaster Markers on Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // Clear old NASA markers
    nasaMarkersRef.current.forEach(m => m.remove());
    nasaMarkersRef.current = [];

    if (!showNasaLayer || !eonetEvents || eonetEvents.length === 0) return;

    eonetEvents.forEach(event => {
      const lon = event.coordinates?.longitude;
      const lat = event.coordinates?.latitude;
      if (lon == null || lat == null) return;

      const isSevereStorm = event.categoryId === 'severeStorms' || (event.category || '').toLowerCase().includes('storm') || (event.title || '').toLowerCase().includes('cyclone') || (event.title || '').toLowerCase().includes('typhoon') || (event.title || '').toLowerCase().includes('hurricane');
      const isFire = event.categoryId === 'wildfires' || (event.category || '').toLowerCase().includes('fire');
      const isVolcano = event.categoryId === 'volcanoes' || (event.category || '').toLowerCase().includes('volcano');

      let icon = '🌀';
      let ringColor = 'border-rose-500/70 bg-rose-950/80 text-rose-300 shadow-rose-950/50';
      if (isFire) {
        icon = '🔥';
        ringColor = 'border-amber-500/70 bg-amber-950/80 text-amber-300';
      } else if (isVolcano) {
        icon = '🌋';
        ringColor = 'border-orange-500/70 bg-orange-950/80 text-orange-300';
      }

      const el = document.createElement('div');
      el.style.width = '0px';
      el.style.height = '0px';
      el.className = 'cursor-pointer z-30';
      el.innerHTML = `
        <div class="absolute -left-4 -top-4 w-8 h-8 group flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full bg-rose-500/25 animate-ping"></span>
          <div class="absolute w-8 h-8 rounded-full ${ringColor} border flex items-center justify-center text-sm shadow-xl backdrop-blur-md transition-transform group-hover:scale-125 ${isSevereStorm ? 'animate-cyclone-bob' : ''}">
            ${icon}
          </div>
          <span class="absolute -top-2 -right-2 text-[8px] font-mono px-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 z-10">
            NASA
          </span>
          <span class="text-[9px] font-medium text-white bg-slate-950/90 px-1.5 py-0.5 rounded shadow mt-1 max-w-[120px] truncate text-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-30">
            ${event.title}
          </span>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 16, maxWidth: '280px' })
        .setHTML(`
          <div class="text-xs p-2.5 space-y-1.5 min-w-[210px] bg-[#0B1020] text-slate-200 border border-white/10 rounded-xl shadow-2xl">
            <div class="font-semibold text-white border-b border-white/10 pb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-sky-400 font-medium">
                🛰️ NASA EONET Ingest
              </span>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40 font-mono">
                REAL-TIME
              </span>
            </div>
            <div class="font-bold text-sm text-white">${event.title}</div>
            <div class="text-slate-300">Category: <strong class="text-amber-300">${event.category}</strong></div>
            <div class="text-slate-300">Coordinates: <strong class="text-sky-300 font-mono">${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</strong></div>
            <div class="text-slate-300">Date: <strong class="text-white">${event.date ? new Date(event.date).toLocaleDateString() : 'Live'}</strong></div>
            ${event.magnitudeValue ? `<div class="text-slate-300">Intensity: <strong class="text-rose-400">${event.magnitudeValue} ${event.magnitudeUnit || ''}</strong></div>` : ''}
            <div class="pt-1.5 flex items-center justify-between border-t border-white/10">
              <span class="text-[9px] text-slate-500">Source: NASA GSFC</span>
              <a href="${event.link || '#'}" target="_blank" rel="noreferrer" class="text-[10px] text-sky-400 hover:underline flex items-center gap-1 font-mono">
                Official NASA Registry ↗
              </a>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lon, lat])
        .setPopup(popup)
        .addTo(map);

      nasaMarkersRef.current.push(marker);
    });
  }, [eonetEvents, mapLoaded, showNasaLayer]);

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
      map.setFilter('hazard-zones-line', null);
    } else if (layerType === 'cyclone') {
      map.setFilter('hazard-zones-fill', ['==', ['get', 'type'], 'cyclone']);
      map.setFilter('hazard-zones-line', ['==', ['get', 'type'], 'cyclone']);
    } else if (layerType === 'flood') {
      map.setFilter('hazard-zones-fill', ['any', ['==', ['get', 'type'], 'rain'], ['==', ['get', 'type'], 'flood']]);
      map.setFilter('hazard-zones-line', ['any', ['==', ['get', 'type'], 'rain'], ['==', ['get', 'type'], 'flood']]);
    } else if (layerType === 'weather') {
      map.setFilter('hazard-zones-fill', ['any', ['==', ['get', 'type'], 'thunderstorm'], ['==', ['get', 'type'], 'heatwave']]);
      map.setFilter('hazard-zones-line', ['any', ['==', ['get', 'type'], 'thunderstorm'], ['==', ['get', 'type'], 'heatwave']]);
    }
  };

  return (
    <div className="weather-card rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col relative h-[560px] shadow-2xl">
      
      {/* Top Map Header Controls */}
      <div className="px-4 py-2.5 bg-[#0A0F1F]/85 backdrop-blur-xl border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
            Geospatial Threat Radar
          </h3>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
            <span>Live WebGL</span>
          </span>
          {isLoadingLiveWeather && (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 hidden sm:flex">
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
            className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-2 py-1 text-[11px] text-slate-300 font-medium outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0D1324] text-white">All India</option>
            <option value="east" className="bg-[#0D1324] text-white">East / Odisha</option>
            <option value="north" className="bg-[#0D1324] text-white">North India</option>
            <option value="south" className="bg-[#0D1324] text-white">South India</option>
            <option value="west" className="bg-[#0D1324] text-white">West Coast</option>
            <option value="northeast" className="bg-[#0D1324] text-white">North East</option>
          </select>

          {/* Layer Filter Buttons - Harmonious Segmented Control */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06] text-[10px] font-medium">
            <button
              onClick={() => handleToggleLayer('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeLayer === 'all' 
                  ? 'bg-white/15 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleToggleLayer('cyclone')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeLayer === 'cyclone' 
                  ? 'bg-white/15 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Storms</span>
            </button>
            <button
              onClick={() => handleToggleLayer('flood')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeLayer === 'flood' 
                  ? 'bg-white/15 text-white font-semibold shadow-sm' 
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
                  const cycloneOrStorm = eonetEvents.find(e => 
                    e.categoryId === 'severeStorms' || (e.title || '').toLowerCase().includes('cyclone')
                  ) || eonetEvents[0];
                  if (cycloneOrStorm && cycloneOrStorm.coordinates?.longitude != null) {
                    mapRef.current.flyTo({ 
                      center: [cycloneOrStorm.coordinates.longitude, cycloneOrStorm.coordinates.latitude], 
                      zoom: 5.5, 
                      duration: 1500 
                    });
                  }
                }
              }}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                showNasaLayer 
                  ? 'bg-white/15 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle NASA EONET Live Natural Events"
            >
              <Satellite className="w-3 h-3 text-rose-400" />
              <span>NASA ({eonetEvents?.length || 0})</span>
            </button>
          </div>

          <button
            onClick={() => handleFlyToRegion('all')}
            className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
            title="Reset Map to All India"
          >
            <Crosshair className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Mapbox WebGL Canvas */}
      <div className="flex-1 relative w-full h-full bg-[#070B19]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Hazard Details Card (When clicked) */}
        {selectedHazardInfo && (
          <div className="absolute top-3 left-3 z-10 max-w-xs bg-[#0B1020]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {selectedHazardInfo.name}
              </span>
              <button 
                onClick={() => setSelectedHazardInfo(null)}
                className="text-slate-400 hover:text-white text-sm leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{selectedHazardInfo.details}</p>
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400 border-t border-white/10">
              <span>Severity: <strong className="text-rose-400">{selectedHazardInfo.severity}</strong></span>
              <span>Winds: <strong className="text-white">{selectedHazardInfo.wind}</strong></span>
            </div>
          </div>
        )}

        {/* Legend Overlay (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 bg-[#0B1020]/80 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 text-[10px] space-y-1.5 hidden sm:block shadow-lg">
          <div className="font-semibold text-slate-300 uppercase tracking-wider text-[9px] mb-1">
            Active Radar Layers
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Precipitation & Rain</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
            <span>Heavy Rain / Flood Risk</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>Severe Cyclone & Wind</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-rose-600/80 border border-rose-400 flex items-center justify-center text-[8px]">🛰️</span>
            <span>NASA EONET Events (<AnimatedCounter value={eonetEvents?.length || 0} />)</span>
          </div>
        </div>

        {/* Live Stations Count Badge (Bottom Right) */}
        <div className="absolute bottom-3 right-3 z-10 bg-[#0B1020]/80 backdrop-blur-xl border border-white/10 rounded-xl px-2.5 py-1 text-[10px] font-mono text-slate-400 shadow-xl flex items-center gap-2">
          <span><strong className="text-emerald-400 font-bold"><AnimatedCounter value={liveCities.length || ALL_INDIA_CITIES.length} /></strong> Cities Online</span>
          <span>•</span>
          <span className="text-sky-400 font-bold"><AnimatedCounter value={eonetEvents?.length || 0} /> NASA Events</span>
        </div>
      </div>

    </div>
  );
}
