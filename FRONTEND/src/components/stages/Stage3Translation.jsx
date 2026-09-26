import React, { useState } from 'react';
import { 
  Languages, 
  Volume2, 
  Square, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  Radio,
  Sparkles,
  Headphones
} from 'lucide-react';
import { sound } from '../../utils/audioSynth';

export default function Stage3Translation({
  alertData,
  onProceedToNext,
  onBackToPrevious
}) {
  const translations = alertData.translations || [];
  const [selectedLangCode, setSelectedLangCode] = useState('or'); // default to Odia
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentTranslation = translations.find(t => t.langCode === selectedLangCode) || translations[0] || {
    langCode: 'or',
    langName: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    translatedTitle: 'ଭୟଙ୍କର ବାତ୍ୟା ସତର୍କତା',
    translatedThreat: 'ଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି।',
    actionableSteps: ['ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ।']
  };

  const handleSelectLanguage = (code) => {
    sound.playBlip();
    sound.stopSpeaking();
    setIsPlayingAudio(false);
    setSelectedLangCode(code);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      sound.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const speechText = `${currentTranslation.translatedTitle}. ${currentTranslation.translatedThreat}. ${(currentTranslation.actionableSteps || []).join('. ')}`;
      sound.speakText(speechText, currentTranslation.langCode);
      setIsPlayingAudio(true);
      // Auto-reset state after speaking duration
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 10000);
    }
  };

  const handleCopy = () => {
    const text = `${currentTranslation.translatedTitle}\n\n${currentTranslation.translatedThreat}\n\n${(currentTranslation.actionableSteps || []).map((s, i) => `${i+1}. ${s}`).join('\n')}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    sound.playBlip();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    sound.stopSpeaking();
    sound.playBlip();
    onProceedToNext();
  };

  const handleBack = () => {
    sound.stopSpeaking();
    sound.playBlip();
    onBackToPrevious();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Stage Overview */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-400/20 text-emerald-400 border border-emerald-400/40">
              STAGE 03 OF 06
            </span>
            <h3 className="text-base font-bold font-display text-white tracking-wide">
              MULTILINGUAL LOCALIZATION & REGIONAL TTS AUDIO
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Simulated high-fidelity translation into regional native scripts and localized text-to-speech audio
            for non-English and vernacular communities.
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
            <span>PROCEED TO VISUAL ALERTS (STAGE 4)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Language Selector Chips */}
      <div>
        <label className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider block mb-2">
          Select Regional Language / Dialect:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {translations.map((lang) => {
            const isSelected = selectedLangCode === lang.langCode;
            return (
              <button
                key={lang.langCode}
                onClick={() => handleSelectLanguage(lang.langCode)}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-neon-green'
                    : 'bg-[#0C1327]/80 hover:bg-[#111A38] border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-base font-bold font-sans">{lang.nativeName}</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">{lang.langName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Language Translation Preview & Audio TTS Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Translated Alert Card */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-emerald-500/30 bg-[#0C1327]/90 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F59B] animate-pulse" />
                <h4 className="text-xs font-mono uppercase font-bold text-emerald-300 tracking-wider">
                  {currentTranslation.langName} ({currentTranslation.nativeName}) Broadcast Card
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Translated Headline */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Headline (Official Title Translated):
              </span>
              <div className="text-lg font-bold text-white font-sans tracking-wide leading-snug p-3 rounded-lg bg-[#070B19]/80 border border-slate-800">
                {currentTranslation.translatedTitle}
              </div>
            </div>

            {/* Translated Threat Description */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Core Danger Statement:
              </span>
              <p className="text-sm text-emerald-100/90 leading-relaxed font-sans p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                {currentTranslation.translatedThreat}
              </p>
            </div>

            {/* Actionable Steps in Regional Language */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                Survival Guidelines:
              </span>
              <div className="space-y-2">
                {(currentTranslation.actionableSteps || []).map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#070B19]/90 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200 font-sans"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#00F59B] flex items-center justify-center text-[11px] font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Encoding: UTF-8 Unicode Standard</span>
            <span className="text-emerald-400">Target Readability: 100% Native Comprehension</span>
          </div>
        </div>

        {/* Right 1 Col: Audio TTS Simulator & Waveform */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0C1327]/90 flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Headphones className="w-4 h-4 text-[#00F2FE]" />
              <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                AUDIO / SPEECH SYNTHESIS (TTS)
              </h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Provides emergency loudspeaker broadcast audio and IVR audio phone call alerts for illiterate, elderly, and visually impaired citizens.
            </p>

            {/* Visualizer Equalizer Box */}
            <div className="p-4 rounded-xl bg-[#070B19] border border-cyan-500/30 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden">
              <div className="flex items-end gap-1.5 h-10 mb-2">
                <div className={`w-2 bg-[#00F2FE] rounded-full ${isPlayingAudio ? 'animate-wave-1' : 'h-1.5'}`} />
                <div className={`w-2 bg-[#00F59B] rounded-full ${isPlayingAudio ? 'animate-wave-2' : 'h-2'}`} />
                <div className={`w-2 bg-[#00F2FE] rounded-full ${isPlayingAudio ? 'animate-wave-3' : 'h-3'}`} />
                <div className={`w-2 bg-amber-400 rounded-full ${isPlayingAudio ? 'animate-wave-4' : 'h-1.5'}`} />
                <div className={`w-2 bg-rose-500 rounded-full ${isPlayingAudio ? 'animate-wave-5' : 'h-2.5'}`} />
                <div className={`w-2 bg-[#00F2FE] rounded-full ${isPlayingAudio ? 'animate-wave-2' : 'h-1'}`} />
                <div className={`w-2 bg-[#00F59B] rounded-full ${isPlayingAudio ? 'animate-wave-4' : 'h-2'}`} />
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                {isPlayingAudio ? 'BROADCASTING AUDIO STREAM...' : 'AUDIO READY'}
              </span>
            </div>

            {/* Voice Engine Metadata */}
            <div className="p-3 rounded-lg bg-[#070B19]/80 border border-slate-800 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Language:</span>
                <span className="text-white">{currentTranslation.langName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Audio Codec:</span>
                <span className="text-cyan-400">Opus 16kHz (Low Bandwidth)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Speech Engine:</span>
                <span className="text-emerald-400">Web Speech API</span>
              </div>
            </div>

          </div>

          {/* Audio Controls */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={handleToggleAudio}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all ${
                isPlayingAudio
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-neon-red animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-slate-950 shadow-neon-green'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>STOP AUDIO BROADCAST</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>PLAY {currentTranslation.langName.toUpperCase()} SPEECH</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
