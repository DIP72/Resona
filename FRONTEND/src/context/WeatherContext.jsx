import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const WeatherContext = createContext(null);
const API_BASE = 'http://localhost:5000/api/weather';

// Polling interval (ms) – re-fetch every 60 seconds to ensure fresh real-time data
const POLL_INTERVAL = 60 * 1000;

const DEFAULT_INDIAN_HUBS = [
  'Bhubaneswar', 'Puri', 'Cuttack', 'Kolkata', 'Patna', 
  'Jaipur', 'Chennai', 'Mumbai', 'Guwahati', 'Delhi', 'Hyderabad', 'Bengaluru'
];

export function WeatherProvider({ children, city }) {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchWeather = useCallback(async (cityName, isFresh = false) => {
    if (!cityName) return;
    try {
      setLoading(true);
      setError(null);

      const freshParam = isFresh ? '&fresh=true' : '';
      const [currentRes, forecastRes, multiRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/current?city=${encodeURIComponent(cityName)}${freshParam}`),
        fetch(`${API_BASE}/forecast?city=${encodeURIComponent(cityName)}${freshParam}`),
        fetch(`${API_BASE}/multi?cities=${DEFAULT_INDIAN_HUBS.join(',')}${freshParam}`),
        fetch(`${API_BASE}/live-alerts`)
      ]);

      if (currentRes.ok) {
        const currentData = await currentRes.json();
        if (currentData.success) {
          setCurrent(currentData);
        }
      }

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        if (forecastData.success) {
          setForecast(forecastData);
        }
      }

      if (multiRes.ok) {
        const multiData = await multiRes.json();
        if (multiData.success && multiData.cities) {
          setAllCities(multiData.cities);
        }
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success && alertsData.alerts) {
          setLiveAlerts(alertsData.alerts);
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('WeatherContext fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when city changes
  useEffect(() => {
    fetchWeather(city);

    // Set up polling every 60s for continuous real-time sync
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchWeather(city), POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [city, fetchWeather]);

  const refresh = useCallback((isFresh = true) => fetchWeather(city, isFresh), [city, fetchWeather]);

  return (
    <WeatherContext.Provider value={{ 
      current, 
      forecast, 
      allCities, 
      liveAlerts, 
      loading, 
      error, 
      lastUpdated, 
      refresh 
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within a <WeatherProvider>');
  return ctx;
}
