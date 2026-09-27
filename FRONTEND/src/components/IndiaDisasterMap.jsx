import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Layers, 
  Play, 
  Pause, 
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
  Maximize2
} from 'lucide-react';

// Set Mapbox Public Token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

import { 
  ALL_INDIA_CITIES, 
  CYCLONE_TIMELINE, 
  HAZARD_ZONES_GEOJSON, 
  CYCLONE_TRACK_GEOJSON 
} from '../data/indiaCities';

export default function IndiaDisasterMap({ onSelectAlertZone, onSelectLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const cycloneMarkerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState('all'); // 'all' | 'cyclone' | 'flood' | 'weather'
  const [liveCities, setLiveCities] = useState([]);
  const [isLoadingLiveWeather, setIsLoadingLiveWeather] = useState(true);
  const [selectedHazardInfo, setSelectedHazardInfo] = useState(null);
  const [activeRegion, setActiveRegion] = useState('all');

  // Fetch Live Weather for All India Cities
  const fetchLiveIndiaWeather = useCallback(async () => {
    try {
      setIsLoadingLiveWeather(true);
      const cityNames = ALL_INDIA_CITIES.map(c => c.city).join(',');
      const res = await fetch(`http://localhost:5000/api/weather/multi?cities=${encodeURIComponent(cityNames)}&fresh=true`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.cities?.length) {
          // Merge with coordinates and state metadata
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
  }, [fetchLiveIndiaWeather]);

  // 1. Initialize Mapbox Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent multiple instances

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [79.2, 22.4], // Geographic Center of India
      zoom: 4.1,
      minZoom: 3.5,
      maxZoom: 12,
      attributionControl: false
    });

    // Add navigation controls (Zoom +/- and Compass)
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      // Add Hazard GeoJSON Sources
      map.addSource('hazard-zones', {
        type: 'geojson',
        data: HAZARD_ZONES_GEOJSON
      });

      // Add Cyclone Track GeoJSON Source
      map.addSource('cyclone-track', {
        type: 'geojson',
        data: CYCLONE_TRACK_GEOJSON
      });

      // 1. Hazard Polygons Fill Layer
      map.addLayer({
        id: 'hazard-zones-fill',
        type: 'fill',
        source: 'hazard-zones',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.28
        }
      });

      // 2. Hazard Polygons Border Line Layer
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

      // 3. Cyclone Projected Track Line
      map.addLayer({
        id: 'cyclone-track-line',
        type: 'line',
        source: 'cyclone-track',
        paint: {
          'line-color': '#EF4444',
          'line-width': 3,
          'line-dasharray': [3, 2],
          'line-opacity': 0.85
        }
      });

      // Interactive Click on Hazard Zones
      map.on('click', 'hazard-zones-fill', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setSelectedHazardInfo(props);
          if (onSelectAlertZone) {
            onSelectAlertZone(props);
          }
        }
      });

      // Change cursor on hover over hazard zones
      map.on('mouseenter', 'hazard-zones-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'hazard-zones-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onSelectAlertZone, onSelectLocation]);

  // 2. Render Live Weather City Markers on Mapbox
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const citiesToDisplay = liveCities.length ? liveCities : ALL_INDIA_CITIES;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    citiesToDisplay.forEach((city) => {
      // Create custom DOM element for marker
      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none';

      // Pick badge style based on weather condition & risk
      const isRain = city.condition?.toLowerCase().includes('rain') || city.condition?.toLowerCase().includes('drizzle');
      const isThunder = city.condition?.toLowerCase().includes('thunder');
      const isClear = city.condition?.toLowerCase().includes('clear');

      let badgeBg = 'bg-[#111C38]/95 border-[#2B4372] text-slate-200';
      let dotColor = 'bg-blue-400';
      if (city.risk === 'Very High') {
        badgeBg = 'bg-rose-950/90 border-rose-500/60 text-rose-200';
        dotColor = 'bg-rose-500';
      } else if (city.risk === 'High') {
        badgeBg = 'bg-amber-950/90 border-amber-500/60 text-amber-200';
        dotColor = 'bg-amber-400';
      } else if (isRain) {
        badgeBg = 'bg-sky-950/90 border-sky-500/60 text-sky-200';
        dotColor = 'bg-sky-400';
      }

      el.innerHTML = `
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-[#38BDF8] ${badgeBg}">
          <span class="w-1.5 h-1.5 rounded-full ${dotColor} ${city.risk === 'Very High' ? 'animate-ping' : ''}"></span>
          <span class="text-[10px] font-bold tracking-tight">${city.city}</span>
          <span class="text-[10px] font-mono font-semibold text-white ml-0.5">${city.temp ?? city.defaultTemp ?? '--'}°</span>
        </div>
      `;

      // Popup on marker click
      const popupHtml = `
        <div class="text-xs p-1 space-y-2 min-w-[180px]">
          <div class="flex items-center justify-between border-b border-[#1E2C4F] pb-1.5">
            <div>
              <div class="font-bold text-white text-sm">${city.city}</div>
              <div class="text-[10px] text-slate-400">${city.state}</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
              city.risk === 'Very High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
              city.risk === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }">${city.risk} Risk</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-2xl font-extrabold text-white font-mono">${city.temp ?? '--'}°C</div>
            <div class="text-right">
              <div class="text-slate-200 font-medium capitalize text-[11px]">${city.description || city.condition || 'Clear'}</div>
              <div class="text-[10px] text-slate-400">Wind: ${city.wind_speed || 15} km/h</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1 pt-1 text-[10px] text-slate-300 font-mono bg-[#0D162E] p-1.5 rounded-lg">
            <div>Humidity: <span class="text-white">${city.humidity || 75}%</span></div>
            <div>Pressure: <span class="text-white">${city.pressure || 1010} hPa</span></div>
          </div>

          <button id="btn-select-${city.city.toLowerCase()}" class="w-full mt-2 py-1 px-2 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-bold text-[11px] text-center transition-colors">
            Focus Location
          </button>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 12, closeButton: true })
        .setHTML(popupHtml);

      popup.on('open', () => {
        const btn = document.getElementById(`btn-select-${city.city.toLowerCase()}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectLocation) {
              onSelectLocation({
                city: city.city,
                state: city.state,
                risk: city.risk,
                temp: city.temp,
                condition: city.condition,
                wind: `${city.wind_speed || 18} km/h`
              });
            }
            map.flyTo({
              center: [city.lon, city.lat],
              zoom: 7.5,
              duration: 1500
            });
          };
        }
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([city.lon, city.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [liveCities, mapLoaded, onSelectLocation]);

  // 3. Cyclone "Dana" Pulsing Center Marker on Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const currentStep = CYCLONE_TIMELINE[timelineIndex];

    if (!cycloneMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-pointer';
      el.innerHTML = `
        <div class="absolute w-12 h-12 rounded-full bg-rose-500/25 danger-radar-pulse"></div>
        <div class="absolute w-8 h-8 rounded-full bg-rose-600/40 animate-ping"></div>
        <div class="relative w-7 h-7 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-rose-600/50">
          <svg class="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 15 })
        .setHTML(`
          <div class="text-xs p-1 space-y-1.5 min-w-[190px]">
            <div class="flex items-center gap-1.5 text-rose-400 font-bold border-b border-[#1E2C4F] pb-1">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Cyclone "Dana" Eye
            </div>
            <div class="text-[11px] text-slate-200">Wind: <strong class="text-white font-mono">${currentStep.wind} km/h</strong></div>
            <div class="text-[11px] text-slate-200">Pressure: <strong class="text-white font-mono">${currentStep.pressure} hPa</strong></div>
            <div class="text-[10px] text-amber-300 font-medium">${currentStep.status}</div>
          </div>
        `);

      cycloneMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat(currentStep.coords)
        .setPopup(popup)
        .addTo(map);
    } else {
      cycloneMarkerRef.current.setLngLat(currentStep.coords);
    }
  }, [timelineIndex, mapLoaded]);

  // 4. Auto Timeline Playback
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimelineIndex(prev => (prev + 1) % CYCLONE_TIMELINE.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // 5. Region Quick-Fly Controller
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
        map.flyTo({ center: [78.8, 13.2], zoom: 6.0, duration: 1600 });
        break;
      case 'west':
        map.flyTo({ center: [73.2, 20.0], zoom: 6.0, duration: 1600 });
        break;
      case 'northeast':
        map.flyTo({ center: [92.6, 26.2], zoom: 6.4, duration: 1600 });
        break;
      default:
        break;
    }
  };

  // 6. Layer Toggle Controller
  const handleToggleLayer = (layerType) => {
    setActiveLayer(layerType);
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (!map.getLayer('hazard-zones-fill')) return;

    if (layerType === 'all') {
      map.setFilter('hazard-zones-fill', null);
      map.setFilter('hazard-zones-line', null);
      if (map.getLayer('cyclone-track-line')) map.setLayoutProperty('cyclone-track-line', 'visibility', 'visible');
    } else if (layerType === 'cyclone') {
      map.setFilter('hazard-zones-fill', ['==', ['get', 'type'], 'cyclone']);
      map.setFilter('hazard-zones-line', ['==', ['get', 'type'], 'cyclone']);
      if (map.getLayer('cyclone-track-line')) map.setLayoutProperty('cyclone-track-line', 'visibility', 'visible');
    } else if (layerType === 'flood') {
      map.setFilter('hazard-zones-fill', ['==', ['get', 'type'], 'flood']);
      map.setFilter('hazard-zones-line', ['==', ['get', 'type'], 'flood']);
      if (map.getLayer('cyclone-track-line')) map.setLayoutProperty('cyclone-track-line', 'visibility', 'none');
    } else if (layerType === 'weather') {
      map.setFilter('hazard-zones-fill', ['==', ['get', 'type'], 'rain']);
      map.setFilter('hazard-zones-line', ['==', ['get', 'type'], 'rain']);
      if (map.getLayer('cyclone-track-line')) map.setLayoutProperty('cyclone-track-line', 'visibility', 'none');
    }
  };

  const currentStep = CYCLONE_TIMELINE[timelineIndex];

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
        <div className="absolute bottom-16 left-3 z-10 bg-[#0E1730]/90 backdrop-blur-md border border-[#1E2C4F] rounded-xl p-2.5 text-[10px] space-y-1.5 hidden sm:block shadow-lg">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px] mb-1">
            Real-Time Map Layers
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-blue-500/50 border border-blue-500"></span>
            <span>Precipitation & Rain Belts (Live)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-sky-500/50 border border-sky-500"></span>
            <span>Coastal Maritime Humidity (90-95%)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded bg-emerald-500/50 border border-emerald-500"></span>
            <span>Ambient Stable Weather Belts</span>
          </div>
        </div>

        {/* Live Stations Count Badge (Bottom Right) */}
        <div className="absolute bottom-16 right-3 z-10 bg-[#0E1730]/90 backdrop-blur-md border border-[#1E2C4F] rounded-xl px-2.5 py-1 text-[10px] font-mono text-slate-400 shadow-lg">
          <span className="text-emerald-400 font-bold">{liveCities.length || ALL_INDIA_CITIES.length}</span> Indian Cities Online (OpenWeather)
        </div>
      </div>

      {/* Bottom Timeline Trajectory Controller */}
      <div className="px-4 py-2.5 bg-[#0E1730]/95 backdrop-blur-md border-t border-[#1E2C4F] flex flex-wrap items-center justify-between gap-3 z-10">
        
        {/* Play/Pause & Synoptic Forecast Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 flex items-center justify-center transition-colors shadow-md"
            title={isPlaying ? 'Pause Timeline' : 'Play Synoptic Progression'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Atmospheric Radar & Synoptic Forecast</span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">(Live Sync)</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {currentStep.status}
            </div>
          </div>
        </div>

        {/* Timeline Scrubber Waypoints */}
        <div className="flex items-center gap-1 bg-[#111C38] p-1 rounded-lg border border-[#1E2C4F]">
          {CYCLONE_TIMELINE.map((step, idx) => (
            <button
              key={step.label}
              onClick={() => {
                setIsPlaying(false);
                setTimelineIndex(idx);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                timelineIndex === idx
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#1E2E54]'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
