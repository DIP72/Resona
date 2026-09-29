import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Globe, 
  Volume2, 
  VolumeX, 
  Send, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  MessageSquare, 
  PhoneCall, 
  TowerControl, 
  ChevronDown, 
  RefreshCw, 
  Copy, 
  Check, 
  Share2, 
  Clock, 
  ShieldAlert,
  Sliders,
  ExternalLink,
  Info,
  Play,
  Square,
  ShieldCheck,
  Zap,
  Activity,
  Waves,
  Wifi,
  Signal,
  Columns,
  Eye,
  Search,
  ArrowRight,
  Flame,
  CloudRain,
  Wind,
  PhoneForwarded,
  Cpu,
  Layers,
  ChevronRight,
  CheckCircle,
  Lock,
  User,
  Users
} from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';

// Comprehensive Indic Language Matrix with script details & cultural region tags
export const ALL_VERNACULAR_LANGUAGES = [
  { 
    langCode: 'or', 
    langName: 'Odia', 
    nativeName: 'ଓଡ଼ିଆ', 
    state: 'Odisha', 
    script: 'Oriya', 
    region: 'east', 
    regionLabel: 'East Coastal',
    flag: '🌊',
    sampleGreeting: 'ସତର୍କ ରୁହନ୍ତୁ' 
  },
  { 
    langCode: 'hi', 
    langName: 'Hindi', 
    nativeName: 'हिन्दी', 
    state: 'North / Central India', 
    script: 'Devanagari', 
    region: 'north', 
    regionLabel: 'North & Central',
    flag: '🏛️',
    sampleGreeting: 'सावधान रहें' 
  },
  { 
    langCode: 'bn', 
    langName: 'Bengali', 
    nativeName: 'বাংলা', 
    state: 'West Bengal', 
    script: 'Bengali', 
    region: 'east', 
    regionLabel: 'East & Delta',
    flag: '🌿',
    sampleGreeting: 'সতর্ক থাকুন' 
  },
  { 
    langCode: 'ta', 
    langName: 'Tamil', 
    nativeName: 'தமிழ்', 
    state: 'Tamil Nadu', 
    script: 'Tamil', 
    region: 'south', 
    regionLabel: 'South Coastal',
    flag: '🛕',
    sampleGreeting: 'எச்சரிக்கையாக இருங்கள்' 
  },
  { 
    langCode: 'te', 
    langName: 'Telugu', 
    nativeName: 'తెలుగు', 
    state: 'Andhra Pradesh & Telangana', 
    script: 'Telugu', 
    region: 'south', 
    regionLabel: 'South Coastal',
    flag: '🌅',
    sampleGreeting: 'జాగ్రత్తగా ఉండండి' 
  },
  { 
    langCode: 'mr', 
    langName: 'Marathi', 
    nativeName: 'मराठी', 
    state: 'Maharashtra', 
    script: 'Devanagari', 
    region: 'west', 
    regionLabel: 'West Coast',
    flag: '🏰',
    sampleGreeting: 'सतर्क राहा' 
  },
  { 
    langCode: 'gu', 
    langName: 'Gujarati', 
    nativeName: 'ગુજરાતી', 
    state: 'Gujarat', 
    script: 'Gujarati', 
    region: 'west', 
    regionLabel: 'West Coast',
    flag: '🦁',
    sampleGreeting: 'સાવચેત રહો' 
  },
  { 
    langCode: 'kn', 
    langName: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    state: 'Karnataka', 
    script: 'Kannada', 
    region: 'south', 
    regionLabel: 'South Deccan',
    flag: '🐘',
    sampleGreeting: 'ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ' 
  },
  { 
    langCode: 'ml', 
    langName: 'Malayalam', 
    nativeName: 'മലയാളം', 
    state: 'Kerala', 
    script: 'Malayalam', 
    region: 'south', 
    regionLabel: 'South Coast',
    flag: '🌴',
    sampleGreeting: 'ജാഗ്രത പാലിക്കുക' 
  },
  { 
    langCode: 'as', 
    langName: 'Assamese', 
    nativeName: 'অসমীয়া', 
    state: 'Assam & Northeast', 
    script: 'Bengali-Assamese', 
    region: 'northeast', 
    regionLabel: 'Northeast River Basin',
    flag: '🦏',
    sampleGreeting: 'সাৱধান হওক' 
  },
  { 
    langCode: 'pa', 
    langName: 'Punjabi', 
    nativeName: 'ਪੰਜਾਬੀ', 
    state: 'Punjab', 
    script: 'Gurmukhi', 
    region: 'north', 
    regionLabel: 'North Plains',
    flag: '🌾',
    sampleGreeting: 'ਸੁਚੇਤ ਰਹੋ' 
  },
  { 
    langCode: 'en', 
    langName: 'English (Plain)', 
    nativeName: 'English', 
    state: 'All-India Universal', 
    script: 'Latin', 
    region: 'all', 
    regionLabel: 'Universal Standard',
    flag: '🇮🇳',
    sampleGreeting: 'Stay Alert' 
  },
];

export default function MultilingualAlertAI({
  currentLocation,
  activeHazard = 'cyclone',
  severity = 'Extreme',
  onAlertBroadcasted,
  onOpenAuthModal,
  onOpenReportModal,
}) {
  const { current } = useWeather();
  const { currentUser, isAuthenticated, quickLogin } = useAuth();

  // Role permissions: Volunteer has broadcast dispatch authorization; normal citizens do not
  const isVolunteer = currentUser?.role === 'Volunteer' || 
    currentUser?.role === 'Emergency Responder' || 
    currentUser?.role === 'Disaster Management Officer' || 
    currentUser?.role === 'Administrator' ||
    currentUser?.role === 'Citizen / Volunteer';
  const isCitizen = currentUser?.role === 'Citizen' || currentUser?.role === 'Normal User';
  const canBroadcast = isAuthenticated && isVolunteer;

  // Citizen broadcast restriction notice modal
  const [isCitizenRestrictedModalOpen, setIsCitizenRestrictedModalOpen] = useState(false);

  const [selectedLang, setSelectedLang] = useState('or');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [langSearch, setLangSearch] = useState('');
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [currentSpeakingStep, setCurrentSpeakingStep] = useState(null);
  const [dualView, setDualView] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);

  // Channels: 'SMS' | 'WHATSAPP' | 'CAP_CELL' | 'VOICE_IVR'
  const [activeChannel, setActiveChannel] = useState('SMS');
  const [completedSteps, setCompletedSteps] = useState({});
  const [copiedItem, setCopiedItem] = useState(null);

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastReceipt, setBroadcastReceipt] = useState(null);
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // Resolved dynamic hazard from weather telemetry
  const liveHazard = (activeHazard && activeHazard !== 'cyclone') ? activeHazard : (
    current?.condition === 'Thunderstorm' ? 'thunderstorm' :
    (current?.condition === 'Rain' || current?.condition === 'Drizzle') ? (current?.rain_1h > 5 ? 'flood' : 'cyclone') :
    (current?.temp >= 38) ? 'heatwave' :
    (current?.wind_speed >= 30) ? 'wind' : 'cyclone'
  );
  const liveSeverity = current?.riskLevel || severity || 'Extreme';

  // Fetch or re-generate vernacular alert
  const fetchVernacularAlert = async (langOverride = null) => {
    if (!currentLocation) return;
    try {
      setLoading(true);
      const city = currentLocation.city || 'Bhubaneswar';
      const state = currentLocation.state || 'Odisha';
      const targetLang = langOverride || selectedLang;

      const res = await fetch(`http://localhost:5000/api/alerts/multilingual-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          state,
          hazardType: liveHazard,
          severity: liveSeverity,
          overrideLangCode: targetLang,
          liveWeather: current,
          isSimulation: false,
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAlertData(data);
          if (data.language && data.language.langCode) {
            setSelectedLang(data.language.langCode);
          }
        }
      }
    } catch (err) {
      console.warn('Multilingual Alert AI fetch fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent broadcast logs from MongoDB
  const fetchBroadcastLogs = async () => {
    try {
      const state = currentLocation?.state || '';
      const res = await fetch(`http://localhost:5000/api/alerts/broadcast-logs?limit=10&state=${encodeURIComponent(state)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.broadcasts) {
          setBroadcastLogs(data.broadcasts);
        }
      }
    } catch (err) {
      console.warn('Error fetching broadcast logs:', err.message);
    }
  };

  // Sync on location, hazard, or live weather updates
  useEffect(() => {
    fetchVernacularAlert(null);
    fetchBroadcastLogs();
    sound.stopSpeaking();
    setIsSpeaking(false);
    setCurrentSpeakingStep(null);
  }, [currentLocation?.city, currentLocation?.state, activeHazard, current?.temp, current?.condition]);

  // Language switch handler
  const handleSelectLanguage = (langCode) => {
    sound.playBlip();
    setSelectedLang(langCode);
    fetchVernacularAlert(langCode);
    sound.stopSpeaking();
    setIsSpeaking(false);
    setCurrentSpeakingStep(null);
  };

  // Toggle main speech synthesis
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      sound.stopSpeaking();
      setIsSpeaking(false);
      setCurrentSpeakingStep(null);
    } else {
      sound.playBlip();
      const textToSpeak = alertData?.alertContent?.audioScript || alertData?.alertContent?.threat || 'Disaster warning alert';
      const utterance = sound.speakText(textToSpeak, selectedLang);
      if (utterance) {
        utterance.rate = speechRate;
        setIsSpeaking(true);
        setCurrentSpeakingStep(null);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
      }
    }
  };

  // Play a single actionable step's voice
  const handlePlayStepAudio = (stepText, idx) => {
    sound.playBlip();
    if (isSpeaking && currentSpeakingStep === idx) {
      sound.stopSpeaking();
      setIsSpeaking(false);
      setCurrentSpeakingStep(null);
      return;
    }

    sound.stopSpeaking();
    const utterance = sound.speakText(stepText, selectedLang);
    if (utterance) {
      utterance.rate = speechRate;
      setIsSpeaking(true);
      setCurrentSpeakingStep(idx);
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeakingStep(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentSpeakingStep(null);
      };
    }
  };

  // Toggle Emergency EAS Siren Test
  const handleTestSiren = () => {
    if (isSirenActive) {
      setIsSirenActive(false);
    } else {
      setIsSirenActive(true);
      sound.playEmergencySiren(2.8);
      setTimeout(() => setIsSirenActive(false), 2800);
    }
  };

  // Copy helper
  const handleCopy = (text, key) => {
    sound.playBlip();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Toggle step completion
  const handleToggleStepCheck = (idx) => {
    sound.playBlip();
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Simulated Dispatch Broadcast Action
  const handleExecuteBroadcast = async () => {
    if (!alertData) return;

    // Security Gate: Normal citizens cannot send broadcasts
    if (isCitizen) {
      sound.playEmergencySiren(0.8);
      setIsCitizenRestrictedModalOpen(true);
      setIsBroadcastModalOpen(false);
      return;
    }

    try {
      setIsBroadcasting(true);
      setBroadcastProgress(10);
      sound.playEmergencySiren(1.2);

      const city = currentLocation?.city || 'Bhubaneswar';
      const state = currentLocation?.state || 'Odisha';
      const langMeta = ALL_VERNACULAR_LANGUAGES.find(l => l.langCode === selectedLang) || ALL_VERNACULAR_LANGUAGES[0];

      // Simulated recipient estimation based on city density
      const recipientPool = city.toLowerCase().includes('mumbai') ? 520000 
        : city.toLowerCase().includes('delhi') ? 610000 
        : city.toLowerCase().includes('kolkata') ? 430000 
        : city.toLowerCase().includes('chennai') ? 390000 
        : city.toLowerCase().includes('puri') ? 165000 
        : city.toLowerCase().includes('bhubaneswar') ? 245000 
        : 195000;

      const messageToSend = activeChannel === 'SMS' 
        ? alertData.alertContent.smsText 
        : activeChannel === 'WHATSAPP' 
        ? alertData.alertContent.whatsappText 
        : alertData.alertContent.audioScript;

      const payload = {
        alertTitle: alertData.alertContent.title,
        city,
        state,
        hazardType: liveHazard,
        severity: liveSeverity,
        langCode: langMeta.langCode,
        langName: langMeta.langName,
        nativeName: langMeta.nativeName,
        channel: activeChannel,
        recipientsCount: recipientPool,
        messageText: messageToSend,
        senderName: currentUser?.name || `${state} Disaster Management Volunteer`,
        senderRole: currentUser?.role || 'Volunteer',
        senderBadge: currentUser?.badgeNumber || 'VOL-4022',
      };

      // Progress animation
      const pInterval = setInterval(() => {
        setBroadcastProgress(p => {
          if (p >= 90) {
            clearInterval(pInterval);
            return 90;
          }
          return p + 25;
        });
      }, 300);

      const res = await fetch('http://localhost:5000/api/alerts/broadcast-vernacular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      clearInterval(pInterval);
      setBroadcastProgress(100);

      if (res.ok) {
        const result = await res.json();
        sound.playSuccessChime();
        setBroadcastReceipt(result);
        fetchBroadcastLogs();
        if (onAlertBroadcasted) onAlertBroadcasted(result);

        // Confetti celebration
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Broadcast dispatch error:', err);
    } finally {
      setTimeout(() => {
        setIsBroadcasting(false);
      }, 500);
    }
  };

  const currentLangMeta = ALL_VERNACULAR_LANGUAGES.find(l => l.langCode === selectedLang) || ALL_VERNACULAR_LANGUAGES[0];

  // Filter languages by region and search
  const filteredLanguages = ALL_VERNACULAR_LANGUAGES.filter(lang => {
    const matchesRegion = selectedRegion === 'all' || lang.region === selectedRegion || lang.langCode === 'en';
    const matchesSearch = !langSearch.trim() || 
      lang.langName.toLowerCase().includes(langSearch.toLowerCase()) ||
      lang.nativeName.includes(langSearch) ||
      lang.state.toLowerCase().includes(langSearch.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Calculate danger accent styles
  const isExtreme = liveSeverity.toLowerCase().includes('extreme') || liveSeverity.toLowerCase().includes('high');
  const accentGlow = isExtreme ? 'from-rose-500/20 via-orange-500/10 to-amber-500/5' : 'from-cyan-500/20 via-blue-500/10 to-indigo-500/5';

  return (
    <div className="space-y-4">

      {/* =================================================================== */}
      {/* 1. TOP AI TELEMETRY HUD & COMMAND RIBBON                           */}
      {/* =================================================================== */}
      <div className="relative rounded-2xl p-4 sm:p-5 overflow-hidden border border-white/10 bg-[#090F22]/90 backdrop-blur-2xl shadow-2xl">
        {/* Ambient Top Glow */}
        <div className={`absolute -top-24 left-1/4 w-96 h-48 bg-gradient-to-r ${accentGlow} blur-3xl pointer-events-none opacity-70`} />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Engine Branding & Geo-Context */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full rounded-[14px] bg-[#070D1E] flex items-center justify-center">
                  <Globe className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#070D1E] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-normal flex items-center gap-2.5">
                  <span>Vernacular Alert AI</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-sans font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400 stroke-[1.8]" />
                    AI Translation Engine
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap font-sans">
                <span className="flex items-center gap-1.5 text-slate-400 font-normal">
                  <TowerControl className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                  Target:
                </span>
                <span className="font-medium text-white bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  {currentLocation?.city || 'Bhubaneswar'}, {currentLocation?.state || 'Odisha'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-dot-green" />
                  Language: <strong className="text-white font-semibold">{currentLangMeta.nativeName} ({currentLangMeta.langName})</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Command Actions & Telemetry Gauges */}
          <div className="flex items-center gap-2.5 flex-wrap">

            {/* Dual View Toggle */}
            <button
              onClick={() => {
                sound.playBlip();
                setDualView(!dualView);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
                dualView 
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 shadow-sm' 
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
              title="Compare English and Vernacular text side-by-side"
            >
              <Columns className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{dualView ? 'Dual view active' : 'Side-by-side'}</span>
            </button>

            {/* Siren Alert Sound Test Button - Soft Rounded Pill */}
            <button
              onClick={handleTestSiren}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
                isSirenActive 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-md shadow-rose-950/80' 
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/25'
              }`}
              title="Test emergency warning acoustic tone"
            >
              <Zap className={`w-3.5 h-3.5 stroke-[1.8] ${isSirenActive ? 'animate-bounce' : 'text-rose-400'}`} />
              <span>{isSirenActive ? 'Siren playing...' : 'Emergency siren'}</span>
            </button>

            {/* Speech Rate Cycle */}
            <div className="flex items-center bg-white/5 rounded-full border border-white/10 p-0.5 text-xs font-sans">
              {[0.9, 1.0, 1.25].map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    sound.playBlip();
                    setSpeechRate(rate);
                  }}
                  className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                    speechRate === rate 
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/30' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Re-synthesize Refresh Button */}
            <button
              onClick={() => {
                sound.playBlip();
                fetchVernacularAlert(selectedLang);
              }}
              disabled={loading}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              title="Re-synthesize vernacular alert from live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[1.8] ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Direct Dispatch Launch CTA - Role Gated */}
            {canBroadcast ? (
              <button
                onClick={() => {
                  sound.playBlip();
                  setIsBroadcastModalOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium text-xs flex items-center gap-2 shadow-md shadow-emerald-950/50 transition-all cursor-pointer border border-emerald-400/30"
                title="Verified Volunteer Dispatch Authorization Active"
              >
                <Send className="w-3.5 h-3.5 stroke-[1.8]" />
                <span>Dispatch alert (Volunteer)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </button>
            ) : isCitizen ? (
              <button
                onClick={() => {
                  sound.playEmergencySiren(0.8);
                  setIsCitizenRestrictedModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Broadcast transmission is restricted for normal citizens"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                <span>Citizen view • Broadcast restricted</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playBlip();
                  if (onOpenAuthModal) {
                    onOpenAuthModal('login');
                  } else {
                    setIsCitizenRestrictedModalOpen(true);
                  }
                }}
                className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Volunteer sign in required to broadcast emergency alerts"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                <span>Volunteer login to broadcast</span>
              </button>
            )}

          </div>
        </div>

        {/* Live OpenWeather Atmosphere Ribbon */}
        {current && (
          <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live radar
              </span>
              <span className="text-white font-medium flex items-center gap-1.5 font-sans">
                <span>{current.city}:</span>
                <span className="text-cyan-300 font-semibold">{current.temp}°C</span>
                <span className="text-slate-400 font-normal">({current.description || current.condition})</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5 text-xs text-slate-300 flex-wrap font-sans">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Wind className="w-3.5 h-3.5 text-cyan-400 stroke-[1.8]" />
                Wind: <strong className="text-white font-medium">{current.wind_speed} km/h</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Waves className="w-3.5 h-3.5 text-blue-400 stroke-[1.8]" />
                Humidity: <strong className="text-white font-medium">{current.humidity}%</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <CloudRain className="w-3.5 h-3.5 text-indigo-400 stroke-[1.8]" />
                Rain: <strong className="text-white font-medium">{current.rain_1h ? current.rain_1h + ' mm/h' : '0 mm/h'}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                Live Data Connected
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. INTERACTIVE INDIC DIALECT MATRIX & SELECTOR STRIP               */}
      {/* =================================================================== */}
      <div className="rounded-2xl p-3.5 sm:p-4 border border-white/10 bg-[#090F20]/70 backdrop-blur-xl space-y-3">
        
        {/* Matrix Header & Region Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400 stroke-[1.8]" />
            <span className="text-xs font-semibold text-white tracking-normal font-sans">
              Regional languages
            </span>
            <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
              {ALL_VERNACULAR_LANGUAGES.length} languages
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Region Pill Filters */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08] text-xs">
              {[
                { id: 'all', label: 'All India' },
                { id: 'east', label: 'East' },
                { id: 'north', label: 'North' },
                { id: 'south', label: 'South' },
                { id: 'west', label: 'West' },
                { id: 'northeast', label: 'Northeast' },
              ].map(reg => (
                <button
                  key={reg.id}
                  onClick={() => {
                    sound.playBlip();
                    setSelectedRegion(reg.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedRegion === reg.id 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.8]" />
              <input
                type="text"
                placeholder="Search language..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-44 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Language Chips Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {filteredLanguages.map(lang => {
            const isSelected = selectedLang === lang.langCode;
            return (
              <button
                key={lang.langCode}
                onClick={() => handleSelectLanguage(lang.langCode)}
                className={`flex-shrink-0 group relative p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 min-w-[140px] cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600/25 to-blue-600/15 border-cyan-400/50 shadow-md shadow-cyan-950/40 scale-[1.01]'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-sm shrink-0">
                  <span>{lang.flag}</span>
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-semibold tracking-normal truncate ${isSelected ? 'text-cyan-200' : 'text-white'}`}>
                      {lang.nativeName}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-sans">
                    <span>{lang.langName}</span>
                    <span>•</span>
                    <span className="text-slate-500">{lang.state.split('/')[0]}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. MAIN COMMAND TWO-COLUMN GRID                                    */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ----------------------------------------------------------------- */}
        {/* LEFT / PRIMARY COLUMN: ADVISORY & ACOUSTIC STUDIO (7 COLS)        */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-4">

          {/* CRITICAL BULLETIN HERO CARD */}
          <div className="relative rounded-2xl p-5 sm:p-6 border border-rose-500/25 bg-gradient-to-b from-[#131128] via-[#0E1326] to-[#0A0E1E] shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge Strip */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08] relative z-10 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/15 text-rose-200 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {liveSeverity.toUpperCase()} Warning bulletin
                </span>
                <span className="text-xs font-sans text-cyan-300 bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-800/40 font-medium">
                  Language: {currentLangMeta.nativeName} ({currentLangMeta.script})
                </span>
              </div>

              <div className="text-xs font-sans text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                <span>Issued: Live synced</span>
              </div>
            </div>

            {/* Headline and Threat Text */}
            <div className="pt-4 space-y-3 relative z-10">

              {/* If Dual-View is Enabled: Show English vs. Vernacular Comparison */}
              {dualView ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  
                  {/* Left: Original English Input */}
                  <div className="space-y-1.5 border-r md:border-white/10 md:pr-3">
                    <div className="flex items-center justify-between text-xs font-sans text-slate-400 font-medium">
                      <span>Original alert (English)</span>
                      <span className="text-cyan-400 text-[11px]">IMD / NDMA live feed</span>
                    </div>
                    <h5 className="text-sm font-semibold text-slate-100">
                      Severe Weather Warning for {currentLocation?.city || 'Bhubaneswar'}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Continuous monitoring indicates incoming {liveHazard} threat with elevated gusts and precipitation. Immediate protective measures required across all coastal sectors.
                    </p>
                  </div>

                  {/* Right: Neural Vernacular Translation */}
                  <div className="space-y-1.5 md:pl-2">
                    <div className="flex items-center justify-between text-xs font-sans text-cyan-300 font-medium">
                      <span>Translated alert ({currentLangMeta.nativeName})</span>
                      <span className="text-emerald-400 font-medium text-[11px]">{currentLangMeta.nativeName}</span>
                    </div>
                    <h5 className="text-sm font-semibold text-white">
                      {alertData?.alertContent?.title || 'ସତର୍କତା ବୁଲେଟିନ୍'}
                    </h5>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      {alertData?.alertContent?.threat || 'ଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ।'}
                    </p>
                  </div>

                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-lg sm:text-xl font-bold text-white tracking-normal leading-snug">
                    {alertData?.alertContent?.title || 'ସତର୍କତା ବୁଲେଟିନ୍'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    {alertData?.alertContent?.threat || 'ଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ।'}
                  </p>
                </div>
              )}

            </div>

            {/* ACOUSTIC VOICE SYNTHESIZER DECK */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] relative z-10">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#080D1D]/90 border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/50">
                
                {/* Audio Play/Stop Button & Details */}
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={handleToggleSpeech}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer ${
                      isSpeaking 
                        ? 'bg-rose-600 text-white animate-pulse border-2 border-rose-300 shadow-rose-950/80 scale-105' 
                        : 'bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border border-cyan-300/30 shadow-cyan-950/50 hover:scale-105 active:scale-95'
                    }`}
                    title={isSpeaking ? "Stop Voice Playback" : `Listen audio announcement in ${currentLangMeta.nativeName}`}
                  >
                    {isSpeaking ? (
                      <Square className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-sans">
                        <Volume2 className="w-4 h-4 text-cyan-400 stroke-[1.8]" />
                        Spoken alert audio
                      </span>
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-medium">
                        {currentLangMeta.nativeName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                      {isSpeaking 
                        ? `Playing clear voice audio in ${currentLangMeta.langName}...` 
                        : 'Clear Indian language voice synthesis for accessibility'}
                    </p>
                  </div>
                </div>

                {/* Animated 7-band Equalizer Visualizer */}
                <div className="flex items-center gap-1.5 h-8 bg-black/40 px-3 py-1.5 rounded-full border border-white/[0.08] self-end sm:self-center">
                  <div className={`w-1 bg-cyan-400 rounded-full transition-all ${isSpeaking ? 'eq-bar-1' : 'h-2'}`} />
                  <div className={`w-1 bg-rose-400 rounded-full transition-all ${isSpeaking ? 'eq-bar-2' : 'h-3'}`} />
                  <div className={`w-1 bg-amber-400 rounded-full transition-all ${isSpeaking ? 'eq-bar-3' : 'h-1.5'}`} />
                  <div className={`w-1 bg-emerald-400 rounded-full transition-all ${isSpeaking ? 'eq-bar-4' : 'h-4'}`} />
                  <div className={`w-1 bg-cyan-400 rounded-full transition-all ${isSpeaking ? 'eq-bar-5' : 'h-2'}`} />
                  <div className={`w-1 bg-indigo-400 rounded-full transition-all ${isSpeaking ? 'eq-bar-6' : 'h-3'}`} />
                  <div className={`w-1 bg-pink-400 rounded-full transition-all ${isSpeaking ? 'eq-bar-7' : 'h-1.5'}`} />
                  <span className="text-[10px] font-sans font-bold text-cyan-300 ml-1.5">
                    {isSpeaking ? 'ACTIVE' : 'READY'}
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* 4 ACTIONABLE LIFE-SAVING EMERGENCY PROTOCOLS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <h5 className="text-xs font-semibold text-white tracking-normal font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 stroke-[1.8]" />
                <span>Life-saving safety guidelines</span>
              </h5>
              <span className="text-xs font-sans text-slate-400">
                4 protocols verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(alertData?.alertContent?.actionableSteps || [
                'ତୁରନ୍ତ ନିକଟସ୍ଥ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀ କିମ୍ବା ପକ୍କା ଘରକୁ ଚାଲିଯାଆନ୍ତୁ।',
                'ସମୁଦ୍ର ଏବଂ ନଦୀ ନିକଟକୁ କଦାପି ଯାଆନ୍ତୁ ନାହିଁ; ଡଙ୍ଗାକୁ ସୁରକ୍ଷିତ ବାନ୍ଧି ରଖନ୍ତୁ।',
                '୩ ଦିନ ପାଇଁ ପିଇବା ପାଣି, ଶୁଖିଲା ଖାଦ୍ୟ, ଆବଶ୍ୟକୀୟ ଔଷଧ ଓ ଟର୍ଚ୍ଚ ଲାଇଟ୍ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ।',
                'ଘରର ମୁଖ୍ୟ ବିଦ୍ୟୁତ୍ ଏବଂ ଏଲ୍‌ପିଜି ଗ୍ୟାସ୍ ସଂଯୋଗ ତୁରନ୍ତ ବନ୍ଦ କରିଦିଅନ୍ତୁ।'
              ]).map((step, idx) => {
                const isChecked = !!completedSteps[idx];
                const isThisStepSpeaking = isSpeaking && currentSpeakingStep === idx;
                
                // Contextual protocol tag
                const protocolTags = [
                  { label: 'Shelter Evacuation', icon: ShieldAlert },
                  { label: 'Coastal Safety', icon: Waves },
                  { label: 'Emergency Kit', icon: CloudRain },
                  { label: 'Grid / Gas Safety', icon: Zap },
                ];
                const pTag = protocolTags[idx % protocolTags.length];
                const TagIcon = pTag.icon;

                return (
                  <div
                    key={idx}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 group ${
                      isChecked
                        ? 'bg-[#0B1A1E]/80 border-emerald-500/35'
                        : 'bg-[#0A1024]/80 border-white/[0.08] hover:border-cyan-500/35 hover:bg-[#0D1530]'
                    }`}
                  >
                    <div>
                      {/* Step Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-sans font-bold flex items-center justify-center ${
                            isChecked 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            0{idx + 1}
                          </span>
                          <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
                            <TagIcon className="w-3 h-3 text-cyan-400 stroke-[1.8]" />
                            {pTag.label}
                          </span>
                        </div>

                        {/* Step Audio Voice Button */}
                        <button
                          onClick={() => handlePlayStepAudio(step, idx)}
                          className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                            isThisStepSpeaking 
                              ? 'bg-rose-600 text-white animate-pulse' 
                              : 'text-slate-400 hover:text-cyan-300 hover:bg-white/10'
                          }`}
                          title="Listen to this instruction in native language"
                        >
                          <Volume2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                      </div>

                      {/* Native Script Step Content */}
                      <p className={`text-xs leading-relaxed font-normal transition-colors ${
                        isChecked ? 'text-emerald-200 line-through opacity-80' : 'text-slate-100'
                      }`}>
                        {step}
                      </p>
                    </div>

                    {/* Completion Checklist Action */}
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleToggleStepCheck(idx)}
                        className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                          isChecked ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <CheckCircle className={`w-3.5 h-3.5 stroke-[1.8] ${isChecked ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-500'}`} />
                        <span>{isChecked ? 'Protocol verified' : 'Mark as done'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(step, `step-${idx}`)}
                        className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                        title="Copy instruction"
                      >
                        {copiedItem === `step-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 stroke-[1.8]" />
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* EMERGENCY 24x7 HELPLINE PILL ROW */}
          <div className="p-3.5 rounded-2xl bg-[#080D1D]/90 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5 font-sans">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                24x7 Emergency hotlines:
              </span>
              
              <button
                onClick={() => handleCopy('112', '112')}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="text-slate-300 text-xs">National:</span>
                <strong className="text-cyan-300 font-mono">112</strong>
              </button>

              <button
                onClick={() => handleCopy('1070', '1070')}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="text-slate-300 text-xs">State SDMA:</span>
                <strong className="text-rose-300 font-mono">1070</strong>
              </button>

              <button
                onClick={() => handleCopy('1077', '1077')}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="text-slate-300 text-xs">District Relief:</span>
                <strong className="text-amber-300 font-mono">1077</strong>
              </button>
            </div>

            <div className="text-xs font-sans text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
              <span>Language sync: Active</span>
            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------------- */}
        {/* RIGHT / SECONDARY COLUMN: MULTI-CHANNEL DISPATCH STUDIO (5 COLS)  */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-4">

          {/* CHANNEL SELECTOR TABS */}
          <div className="p-1 bg-[#090F20] rounded-2xl border border-white/10 grid grid-cols-4 gap-1 text-xs">
            {[
              { id: 'SMS', label: 'SMS Blast', icon: Smartphone },
              { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
              { id: 'CAP_CELL', label: 'Cell Broadcast', icon: TowerControl },
              { id: 'VOICE_IVR', label: 'Voice Call', icon: PhoneCall },
            ].map(ch => {
              const Icon = ch.icon;
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    sound.playBlip();
                    setActiveChannel(ch.id);
                  }}
                  className={`py-2 px-1 rounded-xl font-medium text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-b from-cyan-500/20 to-blue-600/30 text-white border border-cyan-400/40 shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 stroke-[1.8] ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] truncate w-full">{ch.label}</span>
                </button>
              );
            })}
          </div>

          {/* REALISTIC SMARTPHONE DEVICE SIMULATOR */}
          <div className="relative rounded-[32px] p-4 bg-gradient-to-b from-[#141E34] to-[#0A1020] border-2 border-white/15 shadow-2xl overflow-hidden">
            
            {/* Phone Top Notch / Dynamic Island */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-white/[0.08] text-xs font-sans text-slate-400">
              <span className="font-semibold text-white font-mono">09:41</span>
              <div className="w-20 h-4 bg-black/60 rounded-full border border-white/10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-cyan-400/80 animate-ping" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Signal className="w-3 h-3 text-cyan-400 stroke-[1.8]" />
                <Wifi className="w-3 h-3 text-cyan-400 stroke-[1.8]" />
                <span className="text-[11px] font-mono">5G</span>
              </div>
            </div>

            {/* CHANNEL CONTENT PREVIEW INSIDE PHONE */}
            <div className="my-3 min-h-[220px] flex flex-col justify-between">
              
              {/* 1. SMS FORMAT */}
              {activeChannel === 'SMS' && (
                <div className="space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-sans text-slate-400 px-1">
                    <span className="text-cyan-300 font-medium">From: NDMA Emergency Alert</span>
                    <span className="text-[11px] text-slate-400">Standard mobile format</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1B294B] border border-cyan-500/25 text-white text-xs leading-relaxed shadow-lg">
                    <div className="text-xs font-sans text-cyan-300 font-semibold mb-1 flex items-center justify-between">
                      <span>🚨 Government emergency advisory</span>
                      <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                    </div>
                    <p className="font-sans font-normal whitespace-pre-wrap text-slate-100">
                      {alertData?.alertContent?.smsText || '🚨 [NDMA-ଓଡ଼ିଶା ସତର୍କତା] ଭୟଙ୍କର ବାତ୍ୟା ଚେତାବନୀ! ତୁରନ୍ତ ନିକଟସ୍ଥ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ। ସମୁଦ୍ର କୂଳକୁ ଯାଆନ୍ତୁ ନାହିଁ। ଜରୁରୀ ସହାୟତା ପାଇଁ ୧୧୨ / ୧୦୭୦ ଡାଏଲ କରନ୍ତୁ।'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-sans">
                    <span>
                      {(alertData?.alertContent?.smsText || '').length} / 160 chars (1 SMS)
                    </span>
                    <button
                      onClick={() => handleCopy(alertData?.alertContent?.smsText, 'sms-text')}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                    >
                      {copiedItem === 'sms-text' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedItem === 'sms-text' ? 'Copied' : 'Copy SMS'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. WHATSAPP FORMAT */}
              {activeChannel === 'WHATSAPP' && (
                <div className="space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-sans text-slate-400 px-1">
                    <div className="flex items-center gap-1 text-emerald-300 font-medium">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                      <span>Odisha SDMA Disaster Control</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-500/20" />
                    </div>
                    <span className="text-emerald-400 text-[11px]">Verified channel</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0F2823] border border-emerald-500/35 text-emerald-100 text-xs leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto shadow-lg font-sans font-normal">
                    {alertData?.alertContent?.whatsappText || '🚨 *ଓଡ଼ିଶା ରାଜ୍ୟ ଜରୁରୀକାଳୀନ ବାତ୍ୟା ବୁଲେଟିନ୍*\n\nଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ସୁରକ୍ଷିତ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ।\n\nଜରୁରୀ ହେଲ୍ପଲାଇନ: ୧୧୨, ୧୦୭୦'}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-sans">
                    <span className="text-emerald-300/80">Includes helpline links</span>
                    <button
                      onClick={() => {
                        sound.playBlip();
                        if (navigator.share) {
                          navigator.share({
                            title: alertData?.alertContent?.title || 'Disaster Alert',
                            text: alertData?.alertContent?.whatsappText || '',
                          }).catch(() => {});
                        } else {
                          handleCopy(alertData?.alertContent?.whatsappText, 'whatsapp-text');
                        }
                      }}
                      className="px-3 py-1 rounded-full bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 text-xs flex items-center gap-1.5 transition-colors border border-emerald-500/30 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3 stroke-[1.8]" />
                      <span>Share alert</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. CELL BROADCAST (CAP EMERGENCY POPUP) */}
              {activeChannel === 'CAP_CELL' && (
                <div className="space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-sans text-rose-300 px-1 font-medium">
                    <span>Cell Broadcast System</span>
                    <span>High-priority alert</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-white space-y-2 shadow-2xl shadow-rose-950">
                    <div className="flex items-center gap-2 text-rose-200 font-semibold text-xs tracking-normal">
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce stroke-[1.8]" />
                      <span>EMERGENCY ALERT • SEVERE THREAT</span>
                    </div>
                    <p className="text-xs text-rose-100 font-semibold leading-relaxed">
                      {alertData?.alertContent?.title || 'ସତର୍କତା ବୁଲେଟିନ୍'}
                    </p>
                    <p className="text-xs text-slate-200 leading-normal font-normal">
                      {alertData?.alertContent?.threat || 'ଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ।'}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-medium cursor-pointer">
                        Acknowledge (OK)
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 px-1 flex items-center justify-between font-sans">
                    <span>EAS audio tone included</span>
                    <span className="text-rose-300 font-medium">Priority: P1 Extreme</span>
                  </div>
                </div>
              )}

              {/* 4. VOICE IVR CALL SIMULATOR */}
              {activeChannel === 'VOICE_IVR' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-sans text-cyan-300 px-1 font-medium">
                    <span>Automated Voice Call</span>
                    <span>Outbound emergency IVR</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#101A36] border border-cyan-500/30 text-center space-y-3 shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 mx-auto flex items-center justify-center">
                      <PhoneForwarded className="w-6 h-6 text-cyan-400 stroke-[1.8]" />
                    </div>
                    <div>
                      <h6 className="text-sm font-semibold text-white font-sans">State Disaster Response</h6>
                      <p className="text-xs font-mono text-cyan-300">+91 (112) DISASTER-HOTLINE</p>
                    </div>
                    <p className="text-xs text-slate-300 italic px-2 font-normal">
                      "{alertData?.alertContent?.audioScript || alertData?.alertContent?.threat}"
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <button
                        onClick={handleToggleSpeech}
                        className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        <span>{isSpeaking ? 'Listening...' : 'Simulate call audio'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* TRANSMISSION TELEMETRY HUD INSIDE PHONE */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-sans text-slate-400 px-1">
              <div>
                <span>Reach: </span>
                <strong className="text-cyan-300 font-medium">~220,000 citizens</strong>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>142 towers connected</span>
              </div>
            </div>

          </div>

          {/* BROADCAST DISPATCH OPERATIONS CONSOLE CARD */}
          <div className="p-5 rounded-2xl bg-[#090F22]/90 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white tracking-normal font-sans flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-rose-400 stroke-[1.8]" />
                Citizen alert gateway
              </span>
              <button
                onClick={() => setShowLogsDrawer(!showLogsDrawer)}
                className="text-xs font-sans text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3 h-3 stroke-[1.8]" />
                Logs ({broadcastLogs.length})
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Broadcasts this emergency advisory in <strong className="text-cyan-300 font-medium">{currentLangMeta.nativeName} ({currentLangMeta.langName})</strong> to all registered cellular endpoints in {currentLocation?.city}, {currentLocation?.state}.
            </p>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4 text-white stroke-[1.8]" />
              <span>Send emergency broadcast</span>
            </button>
          </div>

          {/* RECENT MONGODB TRANSMISSION LOGS STREAM (COLLAPSIBLE / DRAWER) */}
          {showLogsDrawer && (
            <div className="p-4 rounded-2xl bg-[#080D1D] border border-cyan-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MongoDB Audit Log ({currentLocation?.state})</span>
                </div>
                <button
                  onClick={fetchBroadcastLogs}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300"
                >
                  Refresh
                </button>
              </div>

              {broadcastLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">No recent transmissions recorded.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {broadcastLogs.map((log, idx) => (
                    <div
                      key={log.broadcastId || idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/40 transition-colors text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-cyan-300">{log.broadcastId}</span>
                        <span className="text-emerald-400 font-bold">{log.deliveryRate || '99.4%'} delivered</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-bold text-white">{log.city}, {log.state}</span>
                        <span className="text-[10px] font-mono text-cyan-300">{log.nativeName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* =================================================================== */}
      {/* 4. MODAL: VERNACULAR ALERT DISPATCH CONFIRMATION                   */}
      {/* =================================================================== */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-[#090F24] border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0C1530] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    Dispatch Vernacular Emergency Alert
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Transmitting in <strong className="text-cyan-300">{currentLangMeta.nativeName} ({currentLangMeta.langName})</strong> to {currentLocation?.city}, {currentLocation?.state}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Authorized Volunteer: {currentUser?.name || 'Ramesh Das'} ({currentUser?.badgeNumber || 'VOL-4022'})
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playBlip();
                  setIsBroadcastModalOpen(false);
                  setBroadcastReceipt(null);
                }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">

              {/* Delivery Receipt Notification */}
              {broadcastReceipt && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Vernacular Alert Successfully Dispatched & Confirmed!</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 space-y-1 bg-black/40 p-3 rounded-xl border border-emerald-900/40">
                    <div>Receipt ID: <span className="text-cyan-300 font-semibold">{broadcastReceipt.networkReceipt?.broadcastId}</span></div>
                    <div>Gateway: <span className="text-slate-200">{broadcastReceipt.networkReceipt?.gateway}</span></div>
                    <div>Delivery Ratio: <span className="text-emerald-400 font-bold">{broadcastReceipt.networkReceipt?.deliveryRate}</span> ({broadcastReceipt.networkReceipt?.deliveredCount?.toLocaleString()} active subscribers)</div>
                    <div>Target Region: <span className="text-white">{currentLocation?.city}, {currentLocation?.state}</span></div>
                    <div>Database: <span className="text-emerald-300">Saved to MongoDB resona_db.broadcastlogs</span></div>
                  </div>
                </div>
              )}

              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select Broadcast Channel:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'SMS', label: 'SMS Blast', icon: Smartphone, desc: 'Telecom DND-bypass' },
                    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, desc: 'Verified channel' },
                    { id: 'CAP_CELL', label: 'Cell Broadcast', icon: TowerControl, desc: 'Tower override' },
                    { id: 'VOICE_IVR', label: 'Voice IVR', icon: PhoneCall, desc: 'Native audio call' },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = activeChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setActiveChannel(ch.id);
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                          isSelected 
                            ? 'bg-rose-600/20 border-rose-500/80 text-white shadow-md shadow-rose-950/40' 
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{ch.label}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{ch.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Reach Information */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400">Target Area:</span>{' '}
                  <strong className="text-white">{currentLocation?.city}, {currentLocation?.state}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Est. Reach:</span>{' '}
                  <strong className="text-cyan-400">~220,000 active SIMs</strong>
                </div>
              </div>

              {/* Vernacular Message Preview in Native Script */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Message in Vernacular ({currentLangMeta.nativeName}):</span>
                  <span className="text-[11px] font-mono text-cyan-400">Ready for dispatch</span>
                </label>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 text-xs leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-sans">
                  {activeChannel === 'SMS' 
                    ? alertData?.alertContent?.smsText 
                    : activeChannel === 'WHATSAPP' 
                    ? alertData?.alertContent?.whatsappText 
                    : alertData?.alertContent?.audioScript}
                </div>
              </div>

              {/* Optional Test Phone Number Simulation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Test Mobile Number (Optional):</span>
                  <span className="text-[10px] text-slate-500">Leave blank for full regional broadcast</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+91 94370 12345 (Enter test mobile)"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setTestPhoneNumber('+91 98610 88990');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 text-xs hover:bg-cyan-600/30 transition-colors border border-cyan-500/40"
                  >
                    Demo Number
                  </button>
                </div>
              </div>

              {/* Broadcasting Progress Bar */}
              {isBroadcasting && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                    <span>Transmitting to cellular gateways...</span>
                    <span>{broadcastProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${broadcastProgress}%` }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0C1530] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setIsBroadcastModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleExecuteBroadcast}
                disabled={isBroadcasting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/60 transition-all disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-bounce' : ''}`} />
                <span>
                  {isBroadcasting 
                    ? `Transmitting (${broadcastProgress}%)...` 
                    : `Confirm & Broadcast in ${currentLangMeta.nativeName}`
                  }
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. MODAL: CITIZEN BROADCAST RESTRICTION NOTICE                     */}
      {/* =================================================================== */}
      {isCitizenRestrictedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#090F24] border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-amber-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                    <span>Broadcast Restricted for Citizens</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                      Public Safety
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Emergency messaging policy for citizen profiles
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playBlip();
                  setIsCitizenRestrictedModalOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs leading-relaxed text-slate-300">
                <p className="font-semibold text-white">
                  Why can't normal citizens send broadcasts?
                </p>
                <p>
                  To protect our communities from unverified alarms, duplicate alert spam, and communication gridlock, mass emergency messaging (SMS, WhatsApp, Cell Tower overrides) is <strong className="text-amber-300">strictly reserved for verified Disaster Relief Volunteers and Government Command</strong>.
                </p>
              </div>

              {/* Citizen Capabilities Checklist */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">
                  Your Available Citizen Capabilities:
                </span>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time vernacular weather warnings in 12+ Indic dialects</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Locate nearest cyclone shelters and emergency relief supplies</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Direct ground incident & SOS distress beacon reporting</span>
                  </div>
                </div>
              </div>

              {/* Actions: Switch to Volunteer or File SOS */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    sound.playBlip();
                    setIsCitizenRestrictedModalOpen(false);
                    await quickLogin('volunteer@resona.org', 'Password123!');
                    sound.playSuccessChime();
                    try {
                      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                    } catch {}
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Switch to Volunteer Account (Ramesh Das • VOL-4022)</span>
                </button>

                {onOpenReportModal && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setIsCitizenRestrictedModalOpen(false);
                      onOpenReportModal();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Report Citizen SOS / Ground Incident</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0C1530] flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Resona Public Safety Policy</span>
              <button
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setIsCitizenRestrictedModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors"
              >
                Understood
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
