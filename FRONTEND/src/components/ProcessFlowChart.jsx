import React from 'react';
import { 
  Megaphone, 
  MessageSquareQuote, 
  Languages, 
  MapPin, 
  Radio, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/audioSynth';

export const PIPELINE_STAGES = [
  {
    id: 1,
    title: 'OFFICIAL ALERT',
    subtitle: 'Initial creation and formal issuance of the warning message.',
    icon: Megaphone,
    color: '#00F2FE',
    borderClass: 'border-cyan-500/40 hover:border-cyan-400',
    activeBg: 'bg-cyan-500/15',
    activeGlow: 'shadow-neon-cyan',
    badge: 'Stage 01'
  },
  {
    id: 2,
    title: 'PLAIN LANGUAGE',
    subtitle: 'Reframing content to be clear, simple, and jargon-free for accessibility.',
    icon: MessageSquareQuote,
    color: '#38BDF8',
    borderClass: 'border-sky-500/40 hover:border-sky-400',
    activeBg: 'bg-sky-500/15',
    activeGlow: 'shadow-[0_0_15px_rgba(56,189,248,0.4)]',
    badge: 'Stage 02'
  },
  {
    id: 3,
    title: 'TRANSLATION',
    subtitle: 'Converting the simplified message into all required and local languages.',
    icon: Languages,
    color: '#00F59B',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    activeBg: 'bg-emerald-500/15',
    activeGlow: 'shadow-neon-green',
    badge: 'Stage 03'
  },
  {
    id: 4,
    title: 'VISUAL VERSION',
    subtitle: 'Generating illustrated versions, maps, and infographics of the alert.',
    icon: MapPin,
    color: '#FFB703',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    activeBg: 'bg-amber-500/15',
    activeGlow: 'shadow-neon-amber',
    badge: 'Stage 04'
  },
  {
    id: 5,
    title: 'SIMULATED DELIVERY',
    subtitle: 'Testing message transmission and reception through network simulation models.',
    icon: Radio,
    color: '#FF6B00',
    borderClass: 'border-orange-500/40 hover:border-orange-400',
    activeBg: 'bg-orange-500/15',
    activeGlow: 'shadow-[0_0_15px_rgba(255,107,0,0.4)]',
    badge: 'Stage 05'
  },
  {
    id: 6,
    title: 'ACKNOWLEDGEMENT',
    subtitle: 'Monitoring and documenting the receipt and read status by all targets.',
    icon: CheckCircle2,
    color: '#FF0055',
    borderClass: 'border-rose-500/40 hover:border-rose-400',
    activeBg: 'bg-rose-500/15',
    activeGlow: 'shadow-neon-red',
    badge: 'Stage 06'
  }
];

export default function ProcessFlowChart({ activeStage, onSelectStage, completedStages = [] }) {
  const handleStageClick = (id) => {
    sound.playBlip();
    onSelectStage(id);
  };

  return (
    <div className="w-full">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] animate-ping" />
          <h2 className="text-sm font-mono tracking-widest uppercase text-cyan-400 font-bold">
            PROCESS FLOW CHART // 6-STAGE DISPATCH PIPELINE
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Active Step:</span>
          <span className="text-white font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
            {activeStage} of 6
          </span>
        </div>
      </div>

      {/* Grid of the 6 Flow Chart Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.id;
          const isCompleted = completedStages.includes(stage.id);

          return (
            <div key={stage.id} className="relative group">
              <button
                onClick={() => handleStageClick(stage.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[140px] ${
                  isActive
                    ? `${stage.activeBg} border-[2px] ${stage.activeGlow}`
                    : 'bg-[#0C1327]/80 hover:bg-[#111A38] border-slate-800/80 hover:border-slate-750'
                }`}
                style={{
                  borderColor: isActive ? stage.color : undefined
                }}
              >
                {/* Active Indicator Top Glow Line */}
                {isActive && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-[3px] animate-pulse"
                    style={{ backgroundColor: stage.color }}
                  />
                )}

                {/* Card Top: Badge & Icon */}
                <div className="flex items-center justify-between w-full mb-2">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: isActive ? `${stage.color}25` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive ? stage.color : 'rgba(255,255,255,0.1)'}`
                    }}
                  >
                    <Icon 
                      className="w-5 h-5 transition-colors"
                      style={{ color: isActive ? stage.color : '#94A3B8' }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCompleted && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#00F59B]" />
                    )}
                    <span 
                      className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold tracking-wider"
                      style={{
                        backgroundColor: isActive ? `${stage.color}20` : 'rgba(15,23,42,0.8)',
                        color: isActive ? stage.color : '#64748B',
                        border: `1px solid ${isActive ? `${stage.color}40` : 'rgba(100,116,139,0.2)'}`
                      }}
                    >
                      {stage.badge}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Title & Subtitle */}
                <div>
                  <h3 
                    className="text-xs font-bold font-display tracking-wider mb-1"
                    style={{ color: isActive ? '#FFFFFF' : '#CBD5E1' }}
                  >
                    {stage.title}
                  </h3>
                  <p className="text-[11px] leading-tight text-slate-400 line-clamp-2">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Card Bottom status indicator */}
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span style={{ color: isActive ? stage.color : '#64748B' }}>
                    {isActive ? '● ACTIVE WORKSPACE' : isCompleted ? '✓ COMPLETED' : 'PENDING'}
                  </span>
                  <ChevronRight 
                    className="w-3 h-3 transition-transform group-hover:translate-x-1" 
                    style={{ color: isActive ? stage.color : '#64748B' }}
                  />
                </div>
              </button>

              {/* Connecting circuit line for large screens */}
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <div 
                    className={`w-3 h-[2px] transition-colors ${
                      completedStages.includes(stage.id) ? 'bg-[#00F2FE]' : 'bg-slate-800'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
