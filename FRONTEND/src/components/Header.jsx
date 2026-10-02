import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Database, 
  Volume2, 
  VolumeX, 
  Play, 
  Smartphone, 
  Clock, 
  BellRing,
  Activity,
  Layers,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { useAuth } from '../context/AuthContext';

export default function Header({ 
  onRunFullPipeline, 
  isRunningPipeline, 
  onToggleDeviceModal, 
  isDeviceModalOpen,
  dbStatus,
  currentStage,
  severity = 'Extreme',
  onOpenAuthModal
}) {
  const { currentUser, isAuthenticated, logout, usersCount, mongoUri } = useAuth();
  const [timeUtc, setTimeUtc] = useState('');
  const [timeLocal, setTimeLocal] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
      setTimeLocal(now.toLocaleTimeString('en-US', { hour12: false }) + ' LOCAL');
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
    if (!next) sound.playBlip();
  };

  const handleTriggerSiren = () => {
    sound.playEmergencySiren(3.5);
    setSirenActive(true);
    setTimeout(() => setSirenActive(false), 3500);
  };

  return (
    <header className="border-b border-cyan-500/20 bg-[#070B19]/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Left: Branding & Mission Control Badge */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2FE] via-[#0077FE] to-[#FF0055] p-[1.5px] shadow-[0_0_15px_rgba(0,242,254,0.3)] animate-pulse-glow">
                <div className="w-full h-full bg-[#070B19] rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#00F2FE]" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0055] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF0055]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-wider font-display bg-gradient-to-r from-white via-cyan-200 to-[#00F2FE] bg-clip-text text-transparent">
                  LASTMILE ALERT SYSTEM
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-[#00F2FE] border border-[#00F2FE]/40">
                  DEFCON 1
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00F59B]"></span>
                Making Emergency Warnings Reach the Last Mile
              </p>
            </div>
          </div>

          {/* Quick mobile trigger button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => {
                sound.playBlip();
                onOpenAuthModal && onOpenAuthModal();
              }}
              className="p-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
              title="Auth"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleDeviceModal}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-cyan-400"
              title="Preview Mobile Device"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Real-time System Telemetry Badges */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 font-mono text-xs">
          {/* MongoDB Status (Clickable to inspect) */}
          <button
            onClick={() => {
              sound.playBlip();
              onOpenAuthModal && onOpenAuthModal('database');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:border-emerald-400 transition-colors"
            title="Inspect MongoDB Database at mongodb://localhost:27017/"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>MongoDB:</span>
            <span className="font-semibold text-emerald-300">ONLINE (27017)</span>
          </button>

          {/* LoRa Mesh Radio */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-3.5 h-3.5 text-[#00F2FE] animate-pulse" />
            <span>LoRa 868MHz:</span>
            <span className="font-semibold text-[#00F2FE]">MESH RELAY</span>
          </div>

          {/* Clocks */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeUtc}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-semibold">{timeLocal}</span>
          </div>
        </div>

        {/* Right: User Authentication & Interactive Action Triggers */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* USER AUTH STATUS / LOGIN BUTTON */}
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  sound.playBlip();
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-xs font-mono text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/60 transition-all shadow-[0_0_10px_rgba(0,242,254,0.15)]"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-[#00F2FE]">
                  <User className="w-3 h-3" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-semibold text-white block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-cyan-400 block leading-none">{currentUser.badgeNumber || currentUser.role}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0A122C] border border-cyan-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-3 text-xs font-mono z-50 animate-fadeIn">
                  <div className="border-b border-slate-800 pb-2.5 mb-2">
                    <p className="text-white font-bold">{currentUser.name}</p>
                    <a href={`mailto:${currentUser.email}`} className="text-slate-400 text-[11px] block hover:text-cyan-400 hover:underline">{currentUser.email}</a>
                    <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Agency:</span>
                      <span className="text-right text-slate-300 truncate max-w-[150px]">{currentUser.organization || 'ODRAF'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Badge ID:</span>
                      <span className="text-cyan-400 font-bold">{currentUser.badgeNumber || 'CMD-1011'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Database:</span>
                      <span className="text-emerald-400 font-semibold truncate max-w-[140px]">localhost:27017</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        sound.playBlip();
                        setUserMenuOpen(false);
                        onOpenAuthModal && onOpenAuthModal('database');
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 flex items-center justify-between text-[11px]"
                    >
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Inspect MongoDB Users</span>
                      </span>
                      <span className="text-emerald-400">({usersCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playBlip();
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 text-[11px] justify-center"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playBlip();
                onOpenAuthModal && onOpenAuthModal('login');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-400 text-[#00F2FE] hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>LOGIN / REGISTER</span>
            </button>
          )}

          {/* Audio EAS Siren Button */}
          <button
            onClick={handleTriggerSiren}
            disabled={sirenActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all border ${
              sirenActive 
                ? 'bg-rose-600 text-white border-rose-400 shadow-neon-red animate-pulse'
                : 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border-rose-500/40'
            }`}
            title="Broadcast EAS Audio Chime"
          >
            <BellRing className={`w-3.5 h-3.5 ${sirenActive ? 'animate-bounce' : 'text-rose-400'}`} />
            <span className="hidden sm:inline">{sirenActive ? 'SIREN ACTIVE' : 'EAS SIREN'}</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            title={isMuted ? 'Unmute Synthesizer Audio' : 'Mute Synthesizer Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#00F2FE]" />}
          </button>

          {/* Device Simulator Toggle */}
          <button
            onClick={onToggleDeviceModal}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all border ${
              isDeviceModalOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-neon-cyan'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:border-cyan-500/40'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>DEVICE PREVIEW</span>
          </button>

          {/* ⚡ Full Pipeline 1-Click Simulation Button */}
          <button
            onClick={onRunFullPipeline}
            disabled={isRunningPipeline}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all border ${
              isRunningPipeline
                ? 'bg-cyan-900/60 text-cyan-300 border-cyan-500 animate-pulse'
                : 'bg-gradient-to-r from-[#00F2FE] via-[#00C2FE] to-[#00F59B] text-slate-950 border-[#00F2FE] hover:shadow-neon-cyan hover:scale-[1.02]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningPipeline ? 'animate-spin' : 'fill-slate-950'}`} />
            <span>{isRunningPipeline ? 'DISPATCHING...' : 'RUN PIPELINE'}</span>
          </button>

        </div>
      </div>
    </header>
  );
}
