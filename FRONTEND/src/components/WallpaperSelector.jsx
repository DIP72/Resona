import React, { useState, useEffect } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  Sliders, 
  Link as LinkIcon, 
  Check, 
  RefreshCw,
  Camera,
  ExternalLink,
  Search,
  CheckCircle2,
  Zap,
  Globe
} from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { 
  fetchPexelsWallpapersList, 
  PEXELS_WEATHER_QUERIES 
} from '../services/pexelsService';

export const WALLPAPER_PRESETS = [
  {
    id: 'cyclone-satellite',
    name: 'Supercyclone Orbital Vortex',
    tag: 'NASA / Satellite 8K',
    url: '/cyclone_satellite_bg.jpg',
    thumbnail: '/cyclone_satellite_bg.jpg',
    description: 'Swirling hurricane vortex with internal blue lightning over deep dark space and ocean.'
  },
  {
    id: 'thunderstorm-night',
    name: 'Midnight Thunderstorm',
    tag: 'Dramatic Lightning',
    url: '/thunderstorm_clouds_bg.jpg',
    thumbnail: '/thunderstorm_clouds_bg.jpg',
    description: 'Rolling violet-navy cumulonimbus clouds with glowing electric lightning bolts.'
  },
  {
    id: 'coastal-tempest',
    name: 'Coastal Tempest & Sea Surge',
    tag: 'Coastal Storm',
    url: '/storm_bg.jpg',
    thumbnail: '/storm_bg.jpg',
    description: 'Dark stormy clouds over turbulent crashing waves and rocky shoreline with distant lightning.'
  },
  {
    id: 'deep-space-navy',
    name: 'Minimal Deep Cyber Navy',
    tag: 'Clean Minimalist',
    url: '',
    thumbnail: '',
    description: 'Original high-tech dark navy gradient mesh with subtle cyan and rose ambient glows.'
  }
];

export default function WallpaperSelector({ 
  isOpen, 
  onClose, 
  currentBg, 
  onSelectBg,
  bgOpacity = 0.48,
  onChangeOpacity,
  onShufflePexels,
  isAutoRefresh = true,
  onToggleAutoRefresh
}) {
  const [activeTab, setActiveTab] = useState('pexels'); // 'pexels' | 'presets' | 'custom'
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [pexelsList, setPexelsList] = useState([]);
  const [loadingPexels, setLoadingPexels] = useState(false);
  const [pexelsSearchQuery, setPexelsSearchQuery] = useState('storm lightning');
  const [isShuffling, setIsShuffling] = useState(false);

  // Fetch initial Pexels gallery when opened
  useEffect(() => {
    if (isOpen && pexelsList.length === 0) {
      loadPexelsGallery('storm lightning');
    }
  }, [isOpen]);

  const loadPexelsGallery = async (query) => {
    setLoadingPexels(true);
    try {
      const photos = await fetchPexelsWallpapersList(query, 8);
      setPexelsList(photos);
    } catch (err) {
      console.warn('Pexels load error:', err);
    } finally {
      setLoadingPexels(false);
    }
  };

  if (!isOpen) return null;

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    
    try {
      new URL(customUrl.trim());
      sound.playSuccessChime();
      onSelectBg({
        id: 'custom',
        name: 'Custom Web Wallpaper',
        tag: 'Custom URL',
        url: customUrl.trim(),
        description: 'User-specified atmospheric background wallpaper.'
      });
      setUrlError('');
      onClose();
    } catch (err) {
      setUrlError('Please enter a valid image URL (e.g. from Pexels, Unsplash, or Imgur).');
    }
  };

  const handleTriggerShuffle = async () => {
    if (onShufflePexels) {
      setIsShuffling(true);
      sound.playBlip();
      await onShufflePexels();
      setTimeout(() => setIsShuffling(false), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-3xl bg-[#090F24]/95 border border-[#1E2C4F] rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Glow Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-rose-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2C4F] flex items-center justify-between bg-[#0B132B]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
              <Camera className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Dynamic Atmospheric Wallpapers
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  PEXELS API CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically fetches fresh 4K weather and storm photographs on every visit or refresh.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Auto-Refresh Command Card */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#0C1736] to-[#0A1024] border-b border-[#1E2C4F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pexelsAutoRefresh"
                checked={isAutoRefresh}
                onChange={(e) => onToggleAutoRefresh && onToggleAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="pexelsAutoRefresh" className="text-xs font-bold text-white cursor-pointer flex items-center gap-1.5">
                <span>Dynamic Auto-Refresh on Refresh</span>
                {isAutoRefresh && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Active
                  </span>
                )}
              </label>
              <p className="text-[11px] text-slate-400">
                Picks a new storm/cyclone photo from Pexels every time the page loads.
              </p>
            </div>
          </div>

          {/* Quick Shuffle Button */}
          <button
            onClick={handleTriggerShuffle}
            disabled={isShuffling}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/60 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Shuffle Background Now</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-5 pt-3 flex items-center gap-2 border-b border-white/[0.06] bg-[#090F20]">
          <button
            onClick={() => setActiveTab('pexels')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'pexels' 
                ? 'border-cyan-400 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Pexels 4K Gallery</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'presets' 
                ? 'border-cyan-400 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Curated Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'custom' 
                ? 'border-cyan-400 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Custom URL</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: PEXELS LIVE GALLERY */}
          {activeTab === 'pexels' && (
            <div className="space-y-3">
              {/* Search Bar & Quick Categories */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Pexels (e.g. cyclone, thunder)..."
                    value={pexelsSearchQuery}
                    onChange={(e) => setPexelsSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadPexelsGallery(pexelsSearchQuery)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#070D1E] border border-[#1E2C4F] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Quick Query Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-[11px]">
                  {['storm lightning', 'cyclone ocean', 'supercell', 'monsoon dark'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => {
                        sound.playBlip();
                        setPexelsSearchQuery(theme);
                        loadPexelsGallery(theme);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 shrink-0 capitalize"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Cards Grid */}
              {loadingPexels ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-cyan-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-mono">Gathering high-resolution wallpapers from Pexels API...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {pexelsList.map(photo => {
                    const isSelected = currentBg?.id === photo.id || currentBg?.url === photo.url;
                    return (
                      <button
                        key={photo.id}
                        onClick={() => {
                          sound.playBlip();
                          onSelectBg(photo);
                        }}
                        className={`group relative rounded-xl overflow-hidden border text-left transition-all h-36 flex flex-col justify-between p-2.5 ${
                          isSelected
                            ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/60'
                            : 'border-[#1E2C4F] hover:border-slate-400'
                        }`}
                      >
                        {/* Image Layer */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundImage: `url("${photo.thumbnail}")` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Top Badges */}
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 border border-white/10">
                            Pexels 4K
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Bottom Description */}
                        <div className="relative z-10">
                          <p className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-cyan-300">
                            {photo.name}
                          </p>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                            By {photo.photographer}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CURATED PRESETS */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WALLPAPER_PRESETS.map((preset) => {
                const isSelected = currentBg?.id === preset.id || (!preset.url && !currentBg?.url);
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      sound.playBlip();
                      onSelectBg(preset);
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left transition-all p-3 flex flex-col justify-between h-36 group ${
                      isSelected 
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/60' 
                        : 'border-[#1E2C4F] hover:border-slate-500'
                    }`}
                  >
                    {preset.url ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url("${preset.thumbnail}")` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#070D1E] via-[#0B132B] to-[#111A38]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1E] via-[#070D1E]/60 to-transparent" />

                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/70 text-cyan-300 border border-white/10">
                        {preset.tag}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="relative z-10">
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: CUSTOM URL */}
          {activeTab === 'custom' && (
            <div className="p-4 rounded-xl bg-[#0B132B] border border-[#1E2C4F] space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Paste Custom Pexels / Web Image URL
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Right-click any image on Pexels, Unsplash, or Pinterest & select "Copy image address", then paste it here:
              </p>
              
              <form onSubmit={handleApplyCustom} className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://images.pexels.com/photos/... or https://images.unsplash.com/..."
                  className="flex-1 bg-[#070D1E] border border-[#1E2C4F] focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0"
                >
                  Apply Image
                </button>
              </form>
              {urlError && <p className="text-xs text-rose-400 mt-1">{urlError}</p>}
            </div>
          )}

          {/* Dimming & Contrast Slider */}
          <div className="p-3.5 rounded-xl bg-[#0B132B] border border-[#1E2C4F] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Glass Contrast & Dimming Overlay
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {Math.round(bgOpacity * 100)}% Darkness
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.90"
              step="0.02"
              value={bgOpacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Vibrant Photo (30%)</span>
              <span>Balanced Contrast (50%)</span>
              <span>Stealth Dark (90%)</span>
            </div>
          </div>

        </div>

        {/* Footer with Active Wallpaper & Attribution */}
        <div className="p-3 sm:p-4 border-t border-[#1E2C4F] bg-[#0B132B]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-300 truncate">
            <span className="text-slate-400">Active:</span>
            <strong className="text-white truncate">{currentBg?.name || 'Default Wallpaper'}</strong>
            {currentBg?.photographer && (
              <span className="text-cyan-400 font-mono text-[10px]">
                (Photo: {currentBg.photographer})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-colors self-end sm:self-auto"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
}
