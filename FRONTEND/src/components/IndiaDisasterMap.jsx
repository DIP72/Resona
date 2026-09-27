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
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center cursor-pointer relative group';
      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-[#0E1730]/90 backdrop-blur border-2 ${getRiskColor(city.risk)} flex items-center justify-center text-base shadow-lg">
            ${getWeatherIcon(city.condition)}
          </div>
          <span class="text-[9px] font-bold text-white bg-[#0E1730]/90 px-1 rounded mt-0.5 whitespace-nowrap shadow">
            ${city.temp || '--'}°C
          </span>
        </div>
      `;

      el.addEventListener('click', () => {
        if (onSelectLocation) {
          onSelectLocation(city);
        }
      });

      const popup = new mapboxgl.Popup({ offset: 18, maxWidth: '230px' })
        .setHTML(`
          <div class="text-xs p-1.5 space-y-1 min-w-[180px]">
            <div class="font-bold text-white border-b border-[#1E2C4F] pb-0.5 flex items-center justify-between">
              <span>${city.city}, ${city.state}</span>
              <span class="text-[9px] px-1 py-0.5 rounded ${
                city.isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }">${city.isLive ? 'LIVE' : 'Cached'}</span>
            </div>
            <div class="text-slate-300">Temp: <strong class="text-white">${city.temp || '--'}°C</strong></div>
            <div class="text-slate-300">Condition: <strong class="text-white">${city.description || city.condition || '--'}</strong></div>
            <div class="text-slate-300">Wind: <strong class="text-white">${city.wind_speed || 0} km/h</strong></div>
            <div class="text-slate-300">Humidity: <strong class="text-white">${city.humidity || '--'}%</strong></div>
            <div class="text-slate-300">Risk: <strong class="${
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
      let ringColor = 'border-rose-500 shadow-rose-500/60 bg-rose-950/90 text-rose-400';
      let pulseColor = 'bg-rose-500/30';
      if (isFire) {
        icon = '🔥';
        ringColor = 'border-amber-500 shadow-amber-500/60 bg-amber-950/90 text-amber-400';
        pulseColor = 'bg-amber-500/30';
      } else if (isVolcano) {
        icon = '🌋';
        ringColor = 'border-orange-500 shadow-orange-500/60 bg-orange-950/90 text-orange-400';
        pulseColor = 'bg-orange-500/30';
      }

      const el = document.createElement('div');
      el.className = 'flex flex-col items-center cursor-pointer group z-30';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-10 h-10 rounded-full ${pulseColor} animate-ping"></span>
          <div class="w-9 h-9 rounded-full ${ringColor} border-2 flex items-center justify-center text-base shadow-xl backdrop-blur transition-transform group-hover:scale-125">
            ${icon}
          </div>
          <span class="absolute -top-2.5 -right-2.5 text-[8px] font-mono px-1 rounded bg-black/90 text-cyan-300 border border-cyan-500/40">
            NASA
          </span>
        </div>
        <span class="text-[9px] font-bold text-white bg-black/85 px-1.5 py-0.5 rounded shadow mt-1 max-w-[130px] truncate text-center border border-white/10">
          ${event.title}
        </span>
      `;

      const popup = new mapboxgl.Popup({ offset: 20, maxWidth: '280px' })
        .setHTML(`
          <div class="text-xs p-2 space-y-1.5 min-w-[210px] bg-[#0E1730] text-slate-200">
            <div class="font-bold text-white border-b border-[#1E2C4F] pb-1 flex items-center justify-between">
              <span class="flex items-center gap-1 text-cyan-400 font-semibold">
                🛰️ NASA EONET Live
              </span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 font-mono">
                REAL-TIME
              </span>
            </div>
            <div class="font-bold text-sm text-white">${event.title}</div>
            <div class="text-slate-300">Category: <strong class="text-amber-400">${event.category}</strong></div>
            <div class="text-slate-300">Coordinates: <strong class="text-cyan-300 font-mono">${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</strong></div>
            <div class="text-slate-300">Observation Date: <strong class="text-white">${event.date ? new Date(event.date).toLocaleDateString() : 'Live'}</strong></div>
            ${event.magnitudeValue ? `<div class="text-slate-300">Wind/Intensity: <strong class="text-rose-400">${event.magnitudeValue} ${event.magnitudeUnit || ''}</strong></div>` : ''}
            <div class="pt-1.5 flex items-center justify-between border-t border-[#1E2C4F]">
              <span class="text-[9px] text-slate-400 font-mono">Source: NASA GSFC</span>
              <a href="${event.link || '#'}" target="_blank" rel="noreferrer" class="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono">
                NASA Registry ↗
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
    <div className="weather-card rounded-2xl border border-[#1E2C4F] overflow-hidden flex flex-col relative h-[500px]">
      
      {/* Top Map Header Controls */}
      <div className="px-4 py-3 bg-[#0E1730]/95 backdrop-blur-md border-b border-[#1E2C4F] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            India Live Disaster & Weather Map
          </h3>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Mapbox GL Live
          </span>
          {isLoadingLiveWeather && (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-[#38BDF8]" />
              Syncing India Feeds...
            </span>
          )}
        </div>

        {/* Region Quick Selectors & Layer Filter */}
        <div className="flex items-center gap-2">
          {/* Region Jump Pills */}
          <div className="hidden md:flex items-center gap-1 bg-[#111C38] p-0.5 rounded-lg border border-[#1E2C4F] text-[10px] font-medium">
            {[
              { id: 'all', label: 'All India' },
              { id: 'east', label: 'East/Odisha' },
              { id: 'north', label: 'North' },
              { id: 'south', label: 'South' },
              { id: 'west', label: 'West' },
              { id: 'northeast', label: 'NE' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => handleFlyToRegion(r.id)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeRegion === r.id ? 'bg-[#38BDF8] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Layer Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#111C38] p-0.5 rounded-lg border border-[#1E2C4F] text-[10px] font-medium">
            <button
              onClick={() => handleToggleLayer('all')}
              className={`px-2 py-0.5 rounded ${activeLayer === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => handleToggleLayer('cyclone')}
              className={`px-2 py-0.5 rounded ${activeLayer === 'cyclone' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Cyclone
            </button>
            <button
              onClick={() => handleToggleLayer('flood')}
              className={`px-2 py-0.5 rounded ${activeLayer === 'flood' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Flood
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
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                showNasaLayer ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle NASA EONET Live Natural Events"
            >
              <Satellite className="w-3 h-3" />
              <span>NASA ({eonetEvents?.length || 0})</span>
            </button>
          </div>

          <button
            onClick={() => handleFlyToRegion('all')}
            className="p-1.5 rounded-lg bg-[#111C38] border border-[#1E2C4F] text-slate-300 hover:text-white hover:border-[#38BDF8] transition-colors"
            title="Reset Map to All India"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Mapbox WebGL Canvas */}
      <div className="flex-1 relative w-full h-full bg-[#070B19]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Hazard Details Card (When clicked) */}
        {selectedHazardInfo && (
          <div className="absolute top-3 left-3 z-10 max-w-xs bg-[#0E1730]/95 backdrop-blur-md border border-[#1E2C4F] rounded-xl p-3 shadow-2xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#1E2C4F] pb-1">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
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
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400 border-t border-[#1E2C4F]">
              <span>Severity: <strong className="text-rose-400">{selectedHazardInfo.severity}</strong></span>
              <span>Winds: <strong className="text-white">{selectedHazardInfo.wind}</strong></span>
            </div>
          </div>
        )}

        {/* Legend Overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-3 z-10 bg-[#0E1730]/90 backdrop-blur-md border border-[#1E2C4F] rounded-xl p-2.5 text-[10px] space-y-1.5 hidden sm:block shadow-lg">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px] mb-1">
            Real-Time Map Layers
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-sky-500/50 border border-sky-500"></span>
            <span>Precipitation & Rain (Live)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500"></span>
            <span>Heavy Rain / Flood Risk</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-rose-500/50 border border-rose-500"></span>
            <span>Severe Wind / Cyclone / Thunderstorm</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-pink-500/50 border border-pink-500"></span>
            <span>Heatwave Zone</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600/80 border border-rose-400 flex items-center justify-center text-[8px] animate-pulse">🛰️</span>
            <span>NASA EONET Live Events ({eonetEvents?.length || 0})</span>
          </div>
        </div>

        {/* Live Stations Count Badge (Bottom Right) */}
        <div className="absolute bottom-4 right-3 z-10 bg-[#0E1730]/90 backdrop-blur-md border border-[#1E2C4F] rounded-xl px-2.5 py-1 text-[10px] font-mono text-slate-400 shadow-lg flex items-center gap-2">
          <span><strong className="text-emerald-400">{liveCities.length || ALL_INDIA_CITIES.length}</strong> Cities Online</span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">{eonetEvents?.length || 0} NASA Disasters</span>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-4 py-2.5 bg-[#0E1730]/95 backdrop-blur-md border-t border-[#1E2C4F] flex flex-wrap items-center justify-between gap-3 z-10">
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Live Weather & Natural Disaster Intelligence</span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">(Auto-Sync)</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 flex-wrap">
              <span>
                {activeAlertCount > 0 
                  ? `${activeAlertCount} active regional hazard zone${activeAlertCount !== 1 ? 's' : ''}`
                  : 'Regional stations reporting normal conditions'}
              </span>
              <span>•</span>
              <span className="text-rose-400 flex items-center gap-1">
                <Satellite className="w-3 h-3" />
                NASA EONET: {eonetEvents?.length || 0} real-time active global disasters
              </span>
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {activeAlertCount === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              All Clear — No Active Disasters
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 text-[11px] font-medium animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              {activeAlertCount} Active Hazard{activeAlertCount !== 1 ? 's' : ''} Detected
            </div>
          )}
          <button
            onClick={fetchLiveIndiaWeather}
            className="p-1.5 rounded-lg bg-[#111C38] border border-[#1E2C4F] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLiveWeather ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

    </div>
  );
}
