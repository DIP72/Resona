import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  Sliders, 
  Link as LinkIcon, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { sound } from '../utils/audioSynth';

export const WALLPAPER_PRESETS = [
  {
    id: 'cyclone-satellite',
    name: 'Supercyclone Orbital Vortex',
    tag: 'NASA / Pinterest 8K',
    url: '/cyclone_satellite_bg.jpg',
    thumbnail: '/cyclone_satellite_bg.jpg',
    description: 'Swirling hurricane vortex with internal blue lightning over deep dark space and ocean.'
  },
  {
    id: 'thunderstorm-night',
    name: 'Midnight Thunderstorm',
    tag: 'Dramatic Pinterest Aesthetic',
    url: '/thunderstorm_clouds_bg.jpg',
    thumbnail: '/thunderstorm_clouds_bg.jpg',
    description: 'Rolling violet-navy cumulonimbus clouds with glowing electric lightning bolts.'
  },
  {
    id: 'coastal-tempest',
    name: 'Coastal Tempest & Sea Surge',
    tag: 'Odisha Coast Line',
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
  bgOpacity = 0.82,
  onChangeOpacity
}) {
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  if (!isOpen) return null;

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    
    // Quick validation
    try {
      new URL(customUrl.trim());
      sound.playSuccessChime();
      onSelectBg({
        id: 'custom',
        name: 'Custom Pinterest / Web Wallpaper',
        tag: 'Custom URL',
        url: customUrl.trim(),
        description: 'User-specified atmospheric background wallpaper.'
      });
      setUrlError('');
      onClose();
    } catch (err) {
      setUrlError('Please enter a valid image URL (e.g. from Pinterest, Unsplash, or Imgur).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-2xl bg-[#090F24]/95 border border-[#1E2C4F] rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Glow Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-rose-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2C4F] flex items-center justify-between bg-[#0B132B]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Atmospheric Wallpaper & Aesthetics
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  PINTEREST CURATED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select high-resolution atmospheric storm wallpapers or paste any Pinterest image URL.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Preset Cards Grid */}
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
              Curated Atmospheric Storm Wallpapers
            </label>
            
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
                    className={`relative rounded-xl overflow-hidden border text-left transition-all duration-200 p-3 flex flex-col justify-between h-36 group ${
                      isSelected 
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/60' 
                        : 'border-[#1E2C4F] hover:border-slate-500'
                    }`}
                  >
                    {/* Background Preview */}
                    {preset.url ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url("${preset.thumbnail}")` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#070D1E] via-[#0B132B] to-[#111A38]" />
                    )}

                    {/* Dark Gradient Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1E] via-[#070D1E]/60 to-transparent" />

                    {/* Top Row in Card */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-cyan-300 border border-white/10">
                        {preset.tag}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Bottom Title & Description */}
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
          </div>

          {/* Paste Custom Pinterest / Web Image URL */}
          <div className="p-3.5 rounded-xl bg-[#0B132B] border border-[#1E2C4F] space-y-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Use Any Pinterest / Web Image URL
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              Right-click any image on Pinterest, Unsplash, or Pexels & select "Copy image address", then paste it here:
            </p>
            
            <form onSubmit={handleApplyCustom} className="flex gap-2 mt-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://i.pinimg.com/..."
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

          {/* Glassmorphism Darkness / Dimming Slider */}
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
            <p className="text-[11px] text-slate-400">
              Adjust how strongly the background image shines through the translucent glass cards:
            </p>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.02"
              value={bgOpacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Vibrant & Visible (50%)</span>
              <span>Balanced Contrast (80%)</span>
              <span>Ultra Stealth Dark (95%)</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#1E2C4F] bg-[#0B132B]/80 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Current: <strong className="text-white">{currentBg?.name || 'Default Navy'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
}
