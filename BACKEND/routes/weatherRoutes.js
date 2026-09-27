const express = require('express');
const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY || '';
const BASE = 'https://api.openweathermap.org/data/2.5';

// Real-time cache: 60 seconds TTL (short cache to ensure fresh real-time data)
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

/**
 * Mathematically calculate a real-time risk index based on live OpenWeatherMap physical measurements
 */
function calculateLiveRisk(data) {
  let score = 20; // baseline ambient risk
  const temp = data.main?.temp || 25;
  const windKm = (data.wind?.speed || 0) * 3.6;
  const rain = data.rain?.['1h'] || data.rain?.['3h'] || 0;
  const cond = (data.weather?.[0]?.main || '').toLowerCase();
  const desc = (data.weather?.[0]?.description || '').toLowerCase();

  // Precipitation factor
  if (rain >= 15) score += 45;
  else if (rain >= 5) score += 30;
  else if (rain >= 1) score += 20;
  else if (rain > 0) score += 10;

  // Storm and convective activity
  if (cond.includes('thunderstorm') || desc.includes('thunder')) score += 35;
  if (cond.includes('squall') || cond.includes('tornado')) score += 50;

  // Wind speed factor
  if (windKm >= 80) score += 45;
  else if (windKm >= 50) score += 30;
  else if (windKm >= 30) score += 15;
  else if (windKm >= 15) score += 8;

  // Extreme thermal stress
  if (temp >= 44) score += 45;
  else if (temp >= 40) score += 30;
  else if (temp >= 36) score += 15;
  else if (temp <= 4) score += 25;

  score = Math.min(98, Math.max(15, Math.round(score)));
  let level = 'Low';
  if (score >= 80) level = 'Very High';
  else if (score >= 60) level = 'High';
  else if (score >= 40) level = 'Moderate';

  return { riskScore: score, riskLevel: level };
}

// -------------------------------------------------------------------
// GET /api/weather/current?city=Bhubaneswar   OR   ?lat=19.8&lon=85.8
// Returns real-time current weather for a city or coordinate pair.
// -------------------------------------------------------------------
router.get('/current', async (req, res) => {
  try {
    const { city, lat, lon, fresh } = req.query;
    let url;
    if (lat && lon) {
      url = `${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    } else if (city) {
      url = `${BASE}/weather?q=${encodeURIComponent(city)},IN&units=metric&appid=${API_KEY}`;
    } else {
      return res.status(400).json({ success: false, message: 'Provide ?city= or ?lat=&lon=' });
    }

    const cacheKey = `current:${city || `${lat},${lon}`}`;
    if (fresh !== 'true') {
      const cached = getCached(cacheKey);
      if (cached) return res.json({ success: true, source: 'cache', isRealTime: true, ...cached });
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errBody = await response.text();
      return res.status(response.status).json({ success: false, message: errBody });
    }
    const data = await response.json();
    const liveRisk = calculateLiveRisk(data);

    const result = {
      city: data.name,
      country: data.sys?.country,
      coord: data.coord,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      temp_min: Math.round(data.main.temp_min),
      temp_max: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
      wind_speed: data.wind?.speed ? Math.round(data.wind.speed * 3.6) : 0,  // m/s -> km/h
      wind_deg: data.wind?.deg,
      wind_gust: data.wind?.gust ? Math.round(data.wind.gust * 3.6) : null,
      condition: data.weather?.[0]?.main || 'Unknown',
      description: data.weather?.[0]?.description || '',
      icon: data.weather?.[0]?.icon || '01d',
      clouds: data.clouds?.all,
      rain_1h: data.rain?.['1h'] || 0,
      rain_3h: data.rain?.['3h'] || 0,
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
      dt: data.dt,
      timezone: data.timezone,
      owm_id: data.id,
      riskScore: liveRisk.riskScore,
      riskLevel: liveRisk.riskLevel,
      fetchedAt: new Date().toISOString(),
    };

    setCache(cacheKey, result);
    res.json({ success: true, source: 'openweathermap_live', isRealTime: true, ...result });
  } catch (err) {
    console.error('Weather current error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------------
// GET /api/weather/forecast?city=Bhubaneswar   OR   ?lat=19.8&lon=85.8
// Returns 5-day / 3-hour forecast, distilled into daily summaries.
// -------------------------------------------------------------------
router.get('/forecast', async (req, res) => {
  try {
    const { city, lat, lon, fresh } = req.query;
    let url;
    if (lat && lon) {
      url = `${BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    } else if (city) {
      url = `${BASE}/forecast?q=${encodeURIComponent(city)},IN&units=metric&appid=${API_KEY}`;
    } else {
      return res.status(400).json({ success: false, message: 'Provide ?city= or ?lat=&lon=' });
    }

    const cacheKey = `forecast:${city || `${lat},${lon}`}`;
    if (fresh !== 'true') {
      const cached = getCached(cacheKey);
      if (cached) return res.json({ success: true, source: 'cache', isRealTime: true, ...cached });
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errBody = await response.text();
      return res.status(response.status).json({ success: false, message: errBody });
    }
    const data = await response.json();

    // Group the 3-hour snapshots into daily buckets
    const dailyMap = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const item of data.list) {
      const d = new Date((item.dt + (data.city?.timezone || 19800)) * 1000);
      const dateKey = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;

      if (!dailyMap[dateKey]) {
        const shifted = new Date((item.dt + (data.city?.timezone || 19800)) * 1000);
        const now = new Date();
        const isToday = now.getDate() === shifted.getUTCDate() && now.getMonth() === shifted.getUTCMonth();

        dailyMap[dateKey] = {
          day: isToday ? 'Today' : dayNames[d.getUTCDay()],
          date: `${d.getUTCDate()} ${monthNames[d.getUTCMonth()]}`,
          temps: [],
          conditions: [],
          icons: [],
          rain_total: 0,
          wind_max: 0
        };
      }

      dailyMap[dateKey].temps.push(item.main.temp);
      dailyMap[dateKey].conditions.push(item.weather?.[0]?.main || 'Clear');
      dailyMap[dateKey].icons.push(item.weather?.[0]?.icon || '01d');
      dailyMap[dateKey].rain_total += (item.rain?.['3h'] || 0);
      dailyMap[dateKey].wind_max = Math.max(dailyMap[dateKey].wind_max, (item.wind?.speed || 0) * 3.6);
    }

    const days = Object.values(dailyMap).slice(0, 5).map((bucket) => {
      const freq = {};
      bucket.conditions.forEach(c => { freq[c] = (freq[c] || 0) + 1; });
      const dominantCondition = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clear';
      const middayIdx = Math.floor(bucket.icons.length / 2);

      return {
        day: bucket.day,
        date: bucket.date,
        high: Math.round(Math.max(...bucket.temps)),
        low: Math.round(Math.min(...bucket.temps)),
        condition: dominantCondition,
        icon: bucket.icons[middayIdx] || bucket.icons[0],
        rain_mm: Math.round(bucket.rain_total * 10) / 10,
        wind_max_kmh: Math.round(bucket.wind_max)
      };
    });

    const result = {
      city: data.city?.name,
      country: data.city?.country,
      days,
      fetchedAt: new Date().toISOString(),
    };

    setCache(cacheKey, result);
    res.json({ success: true, source: 'openweathermap_live', isRealTime: true, ...result });
  } catch (err) {
    console.error('Weather forecast error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------------
// GET /api/weather/multi?cities=Bhubaneswar,Puri,Kolkata,Patna,Jaipur
// Batch-fetches current weather for multiple Indian cities from live OpenWeather
// -------------------------------------------------------------------
router.get('/multi', async (req, res) => {
  try {
    const { cities, fresh } = req.query;
    if (!cities) return res.status(400).json({ success: false, message: 'Provide ?cities=City1,City2,...' });

    const cityList = cities.split(',').map(c => c.trim()).filter(Boolean).slice(0, 30);
    const results = await Promise.all(cityList.map(async (city) => {
      const cacheKey = `current:${city}`;
      if (fresh !== 'true') {
        let cached = getCached(cacheKey);
        if (cached) return cached;
      }

      try {
        const url = `${BASE}/weather?q=${encodeURIComponent(city)},IN&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const liveRisk = calculateLiveRisk(data);

          const liveData = {
            city: data.name,
            country: data.sys?.country || 'IN',
            coord: data.coord,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
            wind_speed: data.wind?.speed ? Math.round(data.wind.speed * 3.6) : 0,
            condition: data.weather?.[0]?.main || 'Unknown',
            description: data.weather?.[0]?.description || '',
            icon: data.weather?.[0]?.icon || '01d',
            clouds: data.clouds?.all,
            rain_1h: data.rain?.['1h'] || 0,
            riskScore: liveRisk.riskScore,
            riskLevel: liveRisk.riskLevel,
            owm_id: data.id,
            isLive: true,
          };
          setCache(cacheKey, liveData);
          return liveData;
        }
      } catch {
        return null;
      }
      return null;
    }));

    const validResults = results.filter(Boolean);
    res.json({ success: true, count: validResults.length, cities: validResults, isRealTime: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------------
// GET /api/weather/live-alerts
// Dynamically generates disaster & weather hazard alerts strictly from real-time OpenWeather readings across India!
// -------------------------------------------------------------------
router.get('/live-alerts', async (req, res) => {
  try {
    const keyIndianHubs = [
      'Bhubaneswar', 'Puri', 'Cuttack', 'Kolkata', 'Mumbai', 
      'Chennai', 'Jaipur', 'Patna', 'Delhi', 'Guwahati', 'Hyderabad'
    ];

    const alerts = [];
    const weatherData = await Promise.all(keyIndianHubs.map(async (city) => {
      try {
        const url = `${BASE}/weather?q=${encodeURIComponent(city)},IN&units=metric&appid=${API_KEY}`;
        const r = await fetch(url);
        if (r.ok) return await r.json();
      } catch {}
      return null;
    }));

    weatherData.filter(Boolean).forEach((data) => {
      const city = data.name;
      const temp = Math.round(data.main.temp);
      const windKm = Math.round((data.wind?.speed || 0) * 3.6);
      const rain = data.rain?.['1h'] || 0;
      const cond = data.weather?.[0]?.main || 'Clear';
      const desc = data.weather?.[0]?.description || '';
      const humidity = data.main.humidity;

      // 1. Rain & Flood hazard
      if (cond === 'Rain' || cond === 'Drizzle' || rain > 0) {
        alerts.push({
          id: `rain-${city.toLowerCase()}`,
          category: rain >= 5 ? 'flood' : 'flood',
          hazardType: 'flood',
          title: `${rain >= 5 ? 'Heavy Rainfall Flood Watch' : 'Precipitation Advisory'} — ${city}`,
          severity: rain >= 5 ? 'High' : 'Moderate',
          severityColor: rain >= 5 ? 'bg-orange-950 text-orange-300 border border-orange-600/50' : 'bg-blue-950 text-blue-300 border border-blue-500/50',
          description: `Live: ${desc} | Temp: ${temp}°C | Humidity: ${humidity}%`,
          subtext: `Wind: ${windKm} km/h | Rainfall: ${rain > 0 ? rain + ' mm/h' : 'Active Observation'}`,
          validity: 'Live OpenWeather Observation',
          city,
          temp,
          humidity,
          windKm,
          cond,
          rain,
        });
      }

      // 2. High wind & gale
      if (windKm >= 25) {
        const isCycloneWind = windKm >= 60;
        alerts.push({
          id: `wind-${city.toLowerCase()}`,
          category: isCycloneWind ? 'cyclone' : 'wind',
          hazardType: isCycloneWind ? 'cyclone' : 'wind',
          title: `${isCycloneWind ? 'Severe Gale / Squall Warning' : 'Squally Wind Advisory'} — ${city}`,
          severity: windKm >= 50 ? 'High' : 'Moderate',
          severityColor: isCycloneWind ? 'bg-rose-950 text-rose-300 border border-rose-600/50' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50',
          description: `Wind speed reaching ${windKm} km/h (Live OpenWeather Sensor)`,
          subtext: `Condition: ${desc} | Temp: ${temp}°C | Humidity: ${humidity}%`,
          validity: 'Live OpenWeather Observation',
          city,
          temp,
          windKm,
          cond,
        });
      }

      // 3. Thunderstorm
      if (cond === 'Thunderstorm' || desc.includes('thunder')) {
        alerts.push({
          id: `thunder-${city.toLowerCase()}`,
          category: 'thunderstorm',
          hazardType: 'thunderstorm',
          title: `Thunderstorm & Lightning Warning — ${city}`,
          severity: 'High',
          severityColor: 'bg-amber-950 text-amber-300 border border-amber-500/50',
          description: `Active convective thunder activity: ${desc}`,
          subtext: `Wind gusts up to ${windKm} km/h | Temp: ${temp}°C`,
          validity: 'Live OpenWeather Observation',
          city,
          temp,
          windKm,
          cond,
        });
      }

      // 4. Heatwave
      if (temp >= 38) {
        alerts.push({
          id: `heat-${city.toLowerCase()}`,
          category: 'heatwave',
          hazardType: 'heatwave',
          title: `Elevated Heat Advisory — ${city}`,
          severity: temp >= 42 ? 'High' : 'Moderate',
          severityColor: 'bg-pink-950 text-pink-300 border border-pink-500/50',
          description: `Ambient temperature: ${temp}°C`,
          subtext: `Feels like: ${Math.round(data.main.feels_like)}°C | Humidity: ${humidity}%`,
          validity: 'Live OpenWeather Observation',
          city,
          temp,
          windKm,
          cond,
        });
      }
    });

    // Provide live regional atmospheric observation bulletins for key hubs
    const keyRegions = weatherData.filter(Boolean);
    keyRegions.forEach(d => {
      const city = d.name;
      const alreadyHasAlert = alerts.some(a => a.city.toLowerCase() === city.toLowerCase());
      if (!alreadyHasAlert) {
        const temp = Math.round(d.main.temp);
        const windKm = Math.round((d.wind?.speed || 0) * 3.6);
        const cond = d.weather?.[0]?.main || 'Clear';
        const desc = d.weather?.[0]?.description || 'clear';
        const hum = d.main.humidity;

        alerts.push({
          id: `obs-${city.toLowerCase()}`,
          category: 'wind',
          hazardType: 'weather',
          title: `Live Weather Status — ${city}`,
          severity: 'Low',
          severityColor: 'bg-slate-900/80 text-cyan-300 border border-cyan-500/30',
          description: `Current: ${desc} | Temp: ${temp}°C | Humidity: ${hum}%`,
          subtext: `Wind: ${windKm} km/h | Pressure: ${d.main.pressure} hPa | Live Station`,
          validity: 'Live OpenWeather Observation',
          city,
          temp,
          humidity: hum,
          windKm,
          cond,
        });
      }
    });

    res.json({ success: true, count: alerts.length, alerts, isRealTime: true, source: 'openweathermap' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
