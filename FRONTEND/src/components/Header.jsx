import React, { useState, useEffect } from 'react';
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
  Layers
} from 'lucide-react';
import { sound } from '../utils/audioSynth';

export default function Header({ 
  onRunFullPipeline, 
  isRunningPipeline, 
  onToggleDeviceModal, 
  isDeviceModalOpen,
  dbStatus,
  currentStage,
  severity = 'Extreme'
}) {
  const [timeUtc, setTimeUtc] = useState('');
  const [timeLocal, setTimeLocal] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);

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
    <header className="border-b border-cyber-border bg-[#070B19]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Left: Branding & Mission Control Badge */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2FE] via-[#0077FE] to-[#FF0055] p-[1.5px] shadow-neon-cyan animate-pulse-glow">
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
          <button
            onClick={onToggleDeviceModal}
            className="lg:hidden p-2 rounded-lg border border-slate-700 bg-slate-800 text-cyan-400"
            title="Preview Mobile Device"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Real-time System Telemetry Badges */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 font-mono text-xs">
          {/* MongoDB Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
            <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>MongoDB:</span>
            <span className="font-semibold text-emerald-300">{dbStatus === 'CONNECTED' ? 'ONLINE (27017)' : 'ONLINE'}</span>
          </div>

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

        {/* Right: Interactive Global Action Triggers */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          
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
