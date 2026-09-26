import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Gauge, 
  Zap, 
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { sound } from '../../utils/audioSynth';

export default function Stage2PlainLanguage({
  alertData,
  onProceedToNext,
  onBackToPrevious
}) {
  const plain = alertData.plainLanguage || {};
  const before = plain.readabilityBefore || { gradeLevel: 14.8, fleschScore: 26.4, status: 'College Level' };
  const after = plain.readabilityAfter || { gradeLevel: 4.6, fleschScore: 91.2, status: '5th Grade Universal' };

  const handleNext = () => {
    sound.playBlip();
    onProceedToNext();
  };

  const handleBack = () => {
    sound.playBlip();
    onBackToPrevious();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Stage Overview */}
      <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-400/20 text-sky-400 border border-sky-400/40">
              STAGE 02 OF 06
            </span>
            <h3 className="text-base font-bold font-display text-white tracking-wide">
              PLAIN LANGUAGE REFRAMING // 5TH-GRADE ACCESSIBILITY
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Transformation of bureaucratic technical jargon into crystal-clear, actionable survival instructions.
            Eliminating cognitive overload in panic situations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F2FE] hover:bg-[#00d0de] text-slate-950 text-xs font-mono font-bold transition-all shadow-neon-cyan hover:scale-[1.02]"
          >
            <span>PROCEED TO TRANSLATION (STAGE 3)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Readability Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Reading Grade Level Reduction */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0C1327]/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Reading Grade Level</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-display text-rose-400 line-through opacity-80">{before.gradeLevel}</span>
              <span className="text-xs text-slate-400 font-mono">→</span>
              <span className="text-2xl font-bold font-display text-[#00F59B]">{after.gradeLevel}</span>
              <span className="text-[10px] font-mono text-[#00F59B] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                -68% Complexity
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Understood by 98.4% of rural population</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6 text-[#00F59B]" />
          </div>
        </div>

        {/* Metric 2: Flesch Reading Ease */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0C1327]/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Flesch Reading Ease Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-display text-rose-400 line-through opacity-80">{before.fleschScore}</span>
              <span className="text-xs text-slate-400 font-mono">→</span>
              <span className="text-2xl font-bold font-display text-cyan-400">{after.fleschScore} / 100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Status: Universal Public Access</p>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Gauge className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Metric 3: Actionable Steps Extracted */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0C1327]/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Actionable Checklist</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-display text-amber-400">
                {(plain.actionableSteps || []).length} Life-Saving Steps
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Direct instructions: where, what, and how</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
        </div>

      </div>

      {/* Main Before & After Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: BEFORE (Official Bureaucratic Bulletin) */}
        <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-950/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="text-xs font-mono uppercase font-bold text-rose-300 tracking-wider">
                  BEFORE: RAW TECHNICAL BULLETIN
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-500/40">
                GRADE {before.gradeLevel} (COMPLEX)
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Issuing Agency & Text:</div>
              <div className="p-3.5 rounded-lg bg-[#070B19]/80 border border-slate-800 font-mono text-xs text-rose-200/90 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                {alertData.rawTechnicalBulletin || 'No raw bulletin loaded.'}
              </div>

              {/* Jargon Highlighter Tags */}
              <div className="pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                  Complex Jargon Identified & Removed:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['convective cyclogenesis', 'isobaric pressure minima', 'inundation coupling', 'squally wind speed', 'riparian communities'].map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 line-through">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-500/20 text-[11px] font-mono text-rose-400/80 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Problem: Citizens freeze or misinterpret terms during rapid escalation.</span>
          </div>
        </div>

        {/* Right Card: AFTER (Reframed 5th-Grade Plain Language) */}
        <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/10 flex flex-col justify-between shadow-neon-green/20">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F59B] animate-pulse" />
                <h4 className="text-xs font-mono uppercase font-bold text-emerald-300 tracking-wider">
                  AFTER: SIMPLIFIED PLAIN LANGUAGE (5TH GRADE)
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                GRADE {after.gradeLevel} (UNIVERSAL)
              </span>
            </div>

            <div className="space-y-4">
              
              {/* 1. Core Threat */}
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block mb-1">
                  1. The Threat (Clear & Direct):
                </span>
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-medium text-white leading-relaxed">
                  {plain.threat || 'Dangerous emergency situation. Immediate action required.'}
                </div>
              </div>

              {/* 2. Impact Zone */}
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block mb-1">
                  2. Exact Impact Zone:
                </span>
                <div className="p-2.5 rounded-lg bg-[#070B19]/80 border border-slate-800 text-xs font-mono text-cyan-300">
                  📍 {plain.impactZone || `${alertData.affectedArea?.name} area`}
                </div>
              </div>

              {/* 3. Actionable Checklist */}
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block mb-1.5">
                  3. Immediate Actionable Checklist:
                </span>
                <div className="space-y-2">
                  {(plain.actionableSteps || []).map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#070B19]/90 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <CheckCircle className="w-4 h-4 text-[#00F59B] shrink-0 mt-0.5" />
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F59B]" />
              Cognitive accessibility maximized for last-mile citizens.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
