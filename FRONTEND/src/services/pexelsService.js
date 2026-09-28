// Service to interact with Pexels API for dynamic atmospheric weather & storm wallpapers

const PEXELS_API_KEY = 
  import.meta.env.VITE_PEXELS_API || 
  import.meta.env.PEXELS_API || 
  '';

// Curated search themes reflecting emergency weather, cyclones, thunderstorms, and dramatic atmospheric skies
export const PEXELS_WEATHER_QUERIES = [
  'dark storm clouds lightning',
  'cyclone storm ocean tempest',
  'atmospheric thunderstorm night',
  'dramatic stormy sea waves',
  'monsoon dark sky rain',
  'supercell storm vortex',
  'hurricane satellite atmosphere',
  'dramatic lightning thunderstorm clouds',
  'ocean tempest stormy weather'
];

const CACHE_KEY = 'resona_pexels_cache_pool';
const CURRENT_BG_KEY = 'resona_dashboard_bg';
const AUTO_REFRESH_KEY = 'resona_pexels_auto_refresh';

/**
 * Check if dynamic Pexels auto-refresh is active (defaults to true)
 */
export function isPexelsAutoRefreshEnabled() {
  try {
    const val = localStorage.getItem(AUTO_REFRESH_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Set dynamic auto-refresh toggle
 */
export function setPexelsAutoRefreshEnabled(enabled) {
  try {
    localStorage.setItem(AUTO_REFRESH_KEY, String(enabled));
  } catch {}
}

/**
 * Format a raw Pexels photo object into the Resona wallpaper schema
 */
export function formatPexelsWallpaper(photo) {
  if (!photo || !photo.src) return null;
  return {
    id: `pexels-${photo.id}`,
    name: photo.alt ? photo.alt.slice(0, 48) : 'Atmospheric Storm Wallpaper',
    tag: 'Pexels 4K Dynamic',
    url: photo.src.large2x || photo.src.original || photo.src.large,
    thumbnail: photo.src.medium || photo.src.large || photo.src.tiny,
    photographer: photo.photographer || 'Pexels Contributor',
    photographerUrl: photo.photographer_url || 'https://www.pexels.com',
    pexelsUrl: photo.url,
    description: `Photo by ${photo.photographer || 'Contributor'} via Pexels.`
  };
}

/**
 * Fetch a fresh, random atmospheric wallpaper from Pexels API
 */
export async function fetchRandomPexelsWallpaper(customQuery = null) {
  if (!PEXELS_API_KEY) {
    console.warn('Pexels API key not configured.');
    return getCachedFallbackWallpaper();
  }

  try {
    const query = customQuery || PEXELS_WEATHER_QUERIES[Math.floor(Math.random() * PEXELS_WEATHER_QUERIES.length)];
    const page = Math.floor(Math.random() * 6) + 1; // Random page 1-6 for immense variety

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=15&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!res.ok) {
      console.warn('Pexels API responded with status:', res.status);
      return getCachedFallbackWallpaper();
    }

    const data = await res.json();
    if (!data.photos || data.photos.length === 0) {
      return getCachedFallbackWallpaper();
    }

    // Pick a random photo from the 15 fetched
    const chosenRaw = data.photos[Math.floor(Math.random() * data.photos.length)];
    const chosenWallpaper = formatPexelsWallpaper(chosenRaw);

    // Save into cache pool for offline / instant load fallback
    cachePexelsPhotos(data.photos);

    return chosenWallpaper;
  } catch (err) {
    console.warn('Failed to fetch from Pexels API:', err.message);
    return getCachedFallbackWallpaper();
  }
}

/**
 * Fetch a list of wallpapers from Pexels for gallery view in WallpaperSelector
 */
export async function fetchPexelsWallpapersList(query = 'storm clouds', perPage = 8) {
  if (!PEXELS_API_KEY) return [];

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${perPage}`;
    const res = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data.photos || []).map(formatPexelsWallpaper).filter(Boolean);
  } catch (err) {
    console.warn('Pexels list fetch error:', err.message);
    return [];
  }
}

/**
 * Cache photos in localStorage to provide instant background loading on refresh before network returns
 */
function cachePexelsPhotos(rawPhotos) {
  try {
    const formatted = rawPhotos.slice(0, 10).map(formatPexelsWallpaper).filter(Boolean);
    localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
  } catch {}
}

/**
 * Get a cached Pexels photo or default
 */
export function getCachedFallbackWallpaper() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length > 0) {
        return list[Math.floor(Math.random() * list.length)];
      }
    }
  } catch {}

  // Fallback to high-resolution storm visual
  return {
    id: 'pexels-fallback',
    name: 'Supercyclone Orbital Vortex',
    tag: 'Pexels Dynamic Fallback',
    url: '/cyclone_satellite_bg.jpg',
    thumbnail: '/cyclone_satellite_bg.jpg',
    description: 'Dynamic atmospheric cyclone vortex background.'
  };
}
