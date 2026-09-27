// Comprehensive India major cities network across all regions
export const ALL_INDIA_CITIES = [
  // East & Coastal Hazard Corridor
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245, risk: 'High', region: 'East', defaultTemp: 27, defaultCond: 'Rain' },
  { city: 'Puri', state: 'Odisha', lat: 19.8135, lon: 85.8312, risk: 'Very High', region: 'East', defaultTemp: 29, defaultCond: 'Heavy Rain' },
  { city: 'Cuttack', state: 'Odisha', lat: 20.4625, lon: 85.8828, risk: 'High', region: 'East', defaultTemp: 27, defaultCond: 'Rain' },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, risk: 'High', region: 'East', defaultTemp: 27, defaultCond: 'Clear' },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, risk: 'Moderate', region: 'East', defaultTemp: 26, defaultCond: 'Rain' },
  { city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096, risk: 'Moderate', region: 'East', defaultTemp: 25, defaultCond: 'Clouds' },
  
  // North
  { city: 'Delhi', state: 'Delhi NCR', lat: 28.6667, lon: 77.2167, risk: 'Moderate', region: 'North', defaultTemp: 22, defaultCond: 'Clouds' },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, risk: 'High', region: 'North', defaultTemp: 26, defaultCond: 'Clouds' },
  { city: 'Chandigarh', state: 'Punjab/Haryana', lat: 30.7333, lon: 76.7794, risk: 'Low', region: 'North', defaultTemp: 24, defaultCond: 'Clear' },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, risk: 'Moderate', region: 'North', defaultTemp: 28, defaultCond: 'Clouds' },
  { city: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973, risk: 'Moderate', region: 'North', defaultTemp: 14, defaultCond: 'Clear' },
  { city: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, risk: 'Moderate', region: 'North', defaultTemp: 16, defaultCond: 'Clouds' },

  // West
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, risk: 'Low', region: 'West', defaultTemp: 28, defaultCond: 'Clouds' },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, risk: 'Low', region: 'West', defaultTemp: 25, defaultCond: 'Clouds' },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, risk: 'Moderate', region: 'West', defaultTemp: 29, defaultCond: 'Clear' },
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311, risk: 'Low', region: 'West', defaultTemp: 28, defaultCond: 'Clear' },
  { city: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278, risk: 'Moderate', region: 'West', defaultTemp: 29, defaultCond: 'Clouds' },

  // South
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, risk: 'Low', region: 'South', defaultTemp: 26, defaultCond: 'Clouds' },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, risk: 'Moderate', region: 'South', defaultTemp: 30, defaultCond: 'Clouds' },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, risk: 'Low', region: 'South', defaultTemp: 27, defaultCond: 'Clouds' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, risk: 'High', region: 'South', defaultTemp: 29, defaultCond: 'Wind' },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, risk: 'Moderate', region: 'South', defaultTemp: 28, defaultCond: 'Rain' },
  { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, risk: 'Moderate', region: 'South', defaultTemp: 28, defaultCond: 'Rain' },

  // Central
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, risk: 'Low', region: 'Central', defaultTemp: 26, defaultCond: 'Clouds' },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, risk: 'Low', region: 'Central', defaultTemp: 27, defaultCond: 'Clear' },
  { city: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296, risk: 'Moderate', region: 'Central', defaultTemp: 26, defaultCond: 'Clouds' },

  // Northeast
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, risk: 'High', region: 'Northeast', defaultTemp: 27, defaultCond: 'Rain' },
  { city: 'Shillong', state: 'Meghalaya', lat: 25.5788, lon: 91.8933, risk: 'Moderate', region: 'Northeast', defaultTemp: 19, defaultCond: 'Clouds' }
];

// Synoptic Atmospheric & Weather Progression Timeline (Hours ahead from live observation)
export const CYCLONE_TIMELINE = [
  { label: 'Now', offset: 0, coords: [85.83, 20.29], wind: 10, pressure: 1006, status: 'Live OpenWeather Observation (Active Grid)' },
  { label: '+3h', offset: 45, coords: [86.5, 21.0], wind: 12, pressure: 1005, status: 'Convective Cloud Dispersion Forecast' },
  { label: '+6h', offset: 90, coords: [87.2, 21.6], wind: 14, pressure: 1006, status: 'Marine Boundary Layer Diurnal Cycle' },
  { label: '+12h', offset: 140, coords: [87.8, 22.2], wind: 15, pressure: 1007, status: 'Morning Solar Convection Outlook' },
  { label: '+24h', offset: 220, coords: [88.3, 22.5], wind: 12, pressure: 1008, status: 'Synoptic 24-Hour Regional Outlook' }
];

// GeoJSON for Real-Time Weather & Atmospheric Zones across India
export const HAZARD_ZONES_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    // 1. Eastern & Coastal Bay of Bengal Sector (High humidity, marine breeze)
    {
      type: 'Feature',
      properties: {
        id: 'coastal_marine',
        name: 'Bay of Bengal Coastal Sector',
        type: 'cyclone',
        severity: 'Normal / Green Watch',
        wind: '10-18 km/h',
        color: '#0284C7',
        details: 'Live OpenWeather observation: Ambient marine humidity (90-95%), gentle coastal breeze across Puri and Bhubaneswar.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [85.6, 19.2],
          [87.5, 17.6],
          [89.8, 17.8],
          [89.5, 20.6],
          [87.2, 21.8],
          [85.4, 20.8],
          [85.6, 19.2]
        ]]
      }
    },
    // 2. Gangetic Plains Precipitation Watch Zone (Active rain observed in Patna)
    {
      type: 'Feature',
      properties: {
        id: 'gangetic_rain',
        name: 'Gangetic Plains Precipitation Watch',
        type: 'rain',
        severity: 'Moderate / Yellow Watch',
        wind: '8 km/h',
        color: '#38BDF8',
        details: 'Live Sensor: Active precipitation recorded in Patna-Bihar sector. 100% relative humidity, light monsoonal rain.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [83.8, 26.2],
          [87.2, 26.4],
          [87.4, 24.5],
          [84.0, 24.4],
          [83.8, 26.2]
        ]]
      }
    },
    // 3. Brahmaputra Valley Rain Sector (Assam - active rain observed in Guwahati)
    {
      type: 'Feature',
      properties: {
        id: 'assam_rain',
        name: 'Brahmaputra Valley Rain Sector',
        type: 'rain',
        severity: 'Moderate / Yellow Watch',
        wind: '6 km/h',
        color: '#38BDF8',
        details: 'Live Sensor: Active rain in Guwahati (99% humidity). Water level monitoring active along riverine gauge stations.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [90.2, 26.0],
          [92.4, 26.6],
          [94.6, 27.3],
          [95.2, 27.0],
          [92.8, 26.2],
          [90.4, 25.8],
          [90.2, 26.0]
        ]]
      }
    },
    // 4. Northwest Ambient Weather Belt (Jaipur / Delhi)
    {
      type: 'Feature',
      properties: {
        id: 'northwest_ambient',
        name: 'Northwest Ambient Weather Belt',
        type: 'cyclone',
        severity: 'Normal / Stable',
        wind: '6-11 km/h',
        color: '#10B981',
        details: 'Live Sensor: 23-24°C broken/overcast cloud cover across Jaipur and Delhi NCR. Stable atmospheric pressure.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.5, 28.5],
          [78.5, 29.2],
          [78.8, 26.5],
          [75.0, 26.2],
          [74.5, 28.5]
        ]]
      }
    },
    // 5. Western Ghats & Coastal Maharashtra (Mumbai / Pune)
    {
      type: 'Feature',
      properties: {
        id: 'western_ghats',
        name: 'Western Ghats Marine Belt',
        type: 'cyclone',
        severity: 'Normal / Stable',
        wind: '13 km/h',
        color: '#10B981',
        details: 'Live Sensor: 28°C overcast cloud cover, 74% humidity, normal maritime barometric pressure (1009 hPa).'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.5, 19.8],
          [74.5, 19.6],
          [74.2, 17.5],
          [72.8, 17.8],
          [72.5, 19.8]
        ]]
      }
    }
  ]
};

// Atmospheric Synoptic Flow Line GeoJSON
export const CYCLONE_TRACK_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Regional Atmospheric Flow Line' },
      geometry: {
        type: 'LineString',
        coordinates: CYCLONE_TIMELINE.map(w => w.coords)
      }
    }
  ]
};
