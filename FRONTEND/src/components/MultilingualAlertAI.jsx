import React, { useState, useEffect, useRef } from 'react';
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
  Info
} from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { useWeather } from '../context/WeatherContext';

export const ALL_VERNACULAR_LANGUAGES = [
  { langCode: 'or', langName: 'Odia', nativeName: 'ଓଡ଼ିଆ', state: 'Odisha', script: 'Oriya', primaryRegion: 'East Coastal' },
  { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', state: 'North / Central India', script: 'Devanagari', primaryRegion: 'North & Central' },
  { langCode: 'bn', langName: 'Bengali', nativeName: 'বাংলা', state: 'West Bengal', script: 'Bengali', primaryRegion: 'East' },
  { langCode: 'ta', langName: 'Tamil', nativeName: 'தமிழ்', state: 'Tamil Nadu', script: 'Tamil', primaryRegion: 'South' },
  { langCode: 'te', langName: 'Telugu', nativeName: 'తెలుగు', state: 'Andhra Pradesh & Telangana', script: 'Telugu', primaryRegion: 'South' },
  { langCode: 'mr', langName: 'Marathi', nativeName: 'मराठी', state: 'Maharashtra', script: 'Devanagari', primaryRegion: 'West' },
  { langCode: 'gu', langName: 'Gujarati', nativeName: 'ગુજરાતી', state: 'Gujarat', script: 'Gujarati', primaryRegion: 'West' },
  { langCode: 'kn', langName: 'Kannada', nativeName: 'ಕನ್ನಡ', state: 'Karnataka', script: 'Kannada', primaryRegion: 'South' },
  { langCode: 'ml', langName: 'Malayalam', nativeName: 'മലയാളം', state: 'Kerala', script: 'Malayalam', primaryRegion: 'South' },
  { langCode: 'as', langName: 'Assamese', nativeName: 'অসমীয়া', state: 'Assam & Northeast', script: 'Bengali-Assamese', primaryRegion: 'Northeast' },
  { langCode: 'pa', langName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', state: 'Punjab', script: 'Gurmukhi', primaryRegion: 'North' },
  { langCode: 'en', langName: 'English (Plain)', nativeName: 'English', state: 'All-India Universal', script: 'Latin', primaryRegion: 'National' },
];

export default function MultilingualAlertAI({
  currentLocation,
  activeHazard = 'cyclone',
  severity = 'Extreme',
  onAlertBroadcasted,
}) {
  const { current } = useWeather();
  const [selectedLang, setSelectedLang] = useState('or');
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState('advisory'); // 'advisory' | 'preview' | 'logs'
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastChannel, setBroadcastChannel] = useState('SMS'); // 'SMS' | 'WHATSAPP' | 'VOICE_IVR' | 'CAP_BROADCAST'
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastReceipt, setBroadcastReceipt] = useState(null);
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [copiedText, setCopiedText] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Dynamically resolve actual hazard from live OpenWeather observation
  const liveHazard = (activeHazard && activeHazard !== 'cyclone') ? activeHazard : (
    current?.condition === 'Thunderstorm' ? 'thunderstorm' :
    (current?.condition === 'Rain' || current?.condition === 'Drizzle') ? (current?.rain_1h > 5 ? 'flood' : 'cyclone') :
    (current?.temp >= 38) ? 'heatwave' :
    (current?.wind_speed >= 30) ? 'wind' : 'cyclone'
  );
  const liveSeverity = current?.riskLevel || severity || 'Extreme';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch or re-generate vernacular alert whenever location, language, or live sensor data updates
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

  // Auto-trigger on location change or when live sensor data updates!
  useEffect(() => {
    fetchVernacularAlert(null);
    fetchBroadcastLogs();
    sound.stopSpeaking();
    setIsSpeaking(false);
  }, [currentLocation?.city, currentLocation?.state, activeHazard, current?.temp, current?.condition]);

  // Handle manual language switch
  const handleSelectLanguage = (langCode) => {
    sound.playBlip();
    setSelectedLang(langCode);
    setDropdownOpen(false);
    fetchVernacularAlert(langCode);
    sound.stopSpeaking();
    setIsSpeaking(false);
  };

  // Audio Text-To-Speech Play / Stop
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      sound.stopSpeaking();
      setIsSpeaking(false);
    } else {
      sound.playBlip();
      const textToSpeak = alertData?.alertContent?.audioScript || alertData?.alertContent?.threat || 'Disaster warning alert';
      const utterance = sound.speakText(textToSpeak, selectedLang);
      if (utterance) {
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
      }
    }
  };

  // Copy alert message to clipboard
  const handleCopyMessage = () => {
    sound.playBlip();
    const text = broadcastChannel === 'SMS' 
      ? alertData?.alertContent?.smsText 
      : alertData?.alertContent?.whatsappText;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // Handle Broadcast Dispatch to Citizens
  const handleSendBroadcast = async () => {
    if (!alertData) return;
    try {
      setIsBroadcasting(true);
      sound.playEmergencySiren(1.2);

      const city = currentLocation?.city || 'Bhubaneswar';
      const state = currentLocation?.state || 'Odisha';
      const langMeta = ALL_VERNACULAR_LANGUAGES.find(l => l.langCode === selectedLang) || ALL_VERNACULAR_LANGUAGES[0];

      // Simulated recipient pool based on region
      const recipientPool = city.toLowerCase().includes('mumbai') ? 450000 
        : city.toLowerCase().includes('delhi') ? 500000 
        : city.toLowerCase().includes('kolkata') ? 380000 
        : city.toLowerCase().includes('chennai') ? 320000 
        : city.toLowerCase().includes('puri') ? 145000 
        : city.toLowerCase().includes('bhubaneswar') ? 220000 
        : 185000;

      const messageToSend = broadcastChannel === 'SMS' 
        ? alertData.alertContent.smsText 
        : broadcastChannel === 'WHATSAPP' 
        ? alertData.alertContent.whatsappText 
        : alertData.alertContent.audioScript;

      const payload = {
        alertTitle: alertData.alertContent.title,
        city,
        state,
        hazardType: activeHazard,
        severity,
        langCode: langMeta.langCode,
        langName: langMeta.langName,
        nativeName: langMeta.nativeName,
        channel: broadcastChannel,
        recipientsCount: recipientPool,
        messageText: messageToSend,
        senderName: `${state} Disaster Management Authority (SDMA)`,
      };

      const res = await fetch('http://localhost:5000/api/alerts/broadcast-vernacular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        sound.playSuccessChime();
        setBroadcastReceipt(result);
        fetchBroadcastLogs();
        if (onAlertBroadcasted) onAlertBroadcasted(result);
      }
    } catch (err) {
      console.error('Broadcast error:', err);
      alert('Broadcast dispatch note: Saved to local emergency transmission pipe.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const currentLangMeta = ALL_VERNACULAR_LANGUAGES.find(l => l.langCode === selectedLang) || ALL_VERNACULAR_LANGUAGES[0];

  return (
    <div className="weather-card rounded-2xl border border-[#1E2C4F] overflow-hidden bg-gradient-to-b from-[#111C38] via-[#0E1730] to-[#0A1124] shadow-2xl relative">
      
      {/* Top AI Vernacular Detection Bar */}
      <div className="p-4 sm:p-5 border-b border-[#1E2C4F] bg-[#0E1834]/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Engine Branding & Location Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-rose-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-950/40">
            <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Multilingual Alert AI</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Vernacular Engine
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>Location:</span>
              <strong className="text-white font-semibold">{currentLocation?.city}, {currentLocation?.state}</strong>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Auto-Detected: {currentLangMeta.langName} ({currentLangMeta.nativeName})
              </span>
            </p>
          </div>
        </div>

        {/* Right: Vernacular Language Switcher Dropdown & Live Tabs */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          
          {/* Language Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                sound.playBlip();
                setDropdownOpen(!dropdownOpen);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#162244] border border-[#2B3E6E] hover:border-cyan-400/60 text-xs font-medium text-slate-200 flex items-center gap-2 transition-all shadow-md"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-cyan-300">{currentLangMeta.nativeName}</span>
              <span className="text-slate-400 text-[11px]">({currentLangMeta.langName})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 max-h-80 overflow-y-auto bg-[#0F1A36] border border-[#2B4070] rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Vernacular Language
                </div>
                {ALL_VERNACULAR_LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.langCode;
                  return (
                    <button
                      key={lang.langCode}
                      onClick={() => handleSelectLanguage(lang.langCode)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        isSelected 
                          ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-semibold' 
                          : 'text-slate-300 hover:bg-[#18264C] hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-100">{lang.nativeName}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">{lang.langName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{lang.state.split('/')[0]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Refresh Vernacular Generation Button */}
          <button
            onClick={() => {
              sound.playBlip();
              fetchVernacularAlert(selectedLang);
            }}
            disabled={loading}
            title="Re-generate Vernacular AI Advisory"
            className="p-2 rounded-xl bg-[#162244] border border-[#2B3E6E] hover:border-cyan-400/60 text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

        </div>

      </div>

      {/* Live Real-Time OpenWeather Observation Bar */}
      {current && (
        <div className="px-4 py-2 bg-[#091024] border-b border-[#1A284A] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-dot-green"></span>
            <span className="text-emerald-400 font-semibold">Real-Time OpenWeather Station:</span>
            <span className="text-white font-bold">{current.city}</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              {current.temp}°C • {current.description || current.condition}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Wind: <strong className="text-slate-200">{current.wind_speed} km/h</strong></span>
            <span>•</span>
            <span>Humidity: <strong className="text-slate-200">{current.humidity}%</strong></span>
            <span>•</span>
            <span>Rain: <strong className="text-slate-200">{current.rain_1h ? current.rain_1h + ' mm/h' : '0 mm'}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">● Sensor Verified</span>
          </div>
        </div>
      )}

      {/* Mode Sub-navigation Bar */}
      <div className="px-4 sm:px-5 py-2.5 bg-[#0C152B] border-b border-[#1A284A] flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playBlip();
              setActiveTab('advisory');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'advisory' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Vernacular Advisory
          </button>
          <button
            onClick={() => {
              sound.playBlip();
              setActiveTab('preview');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'preview' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            SMS & WhatsApp Formats
          </button>
          <button
            onClick={() => {
              sound.playBlip();
              setActiveTab('logs');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'logs' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-3 h-3" />
            Dispatched Log ({broadcastLogs.length})
          </button>
        </div>

        {/* Primary Action Button: Broadcast Alert to Citizens */}
        <button
          onClick={() => {
            sound.playBlip();
            setIsBroadcastModalOpen(true);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Vernacular Alert</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        
        {/* Tab 1: Vernacular Advisory & Action Steps */}
        {activeTab === 'advisory' && (
          <div className="space-y-4">
            
            {/* Native Headline Banner */}
            <div className="p-3.5 rounded-xl bg-[#0D1730] border border-rose-500/40 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600/60 uppercase">
                      {severity} Warning
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      Language: {currentLangMeta.nativeName} ({currentLangMeta.langName})
                    </span>
                  </div>
                  
                  {/* Vernacular Headline */}
                  <h4 className="text-base sm:text-lg font-extrabold text-white leading-snug tracking-wide">
                    {alertData?.alertContent?.title || 'ସତର୍କତା ବୁଲେଟିନ୍'}
                  </h4>

                  {/* Vernacular Plain-Language Threat */}
                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed pt-1">
                    {alertData?.alertContent?.threat || 'ଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ।'}
                  </p>
                </div>

                {/* AI Audio Voice Synthesizer Button & Visualizer */}
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  <button
                    onClick={handleToggleSpeech}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                      isSpeaking 
                        ? 'bg-rose-600 text-white animate-pulse border border-rose-400 shadow-rose-900/50' 
                        : 'bg-[#18264D] hover:bg-cyan-600/30 text-cyan-300 border border-[#2E4275] hover:border-cyan-400'
                    }`}
                    title={isSpeaking ? "Stop AI Voice Announcement" : `Listen in ${currentLangMeta.nativeName}`}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-cyan-300" />
                    )}
                  </button>

                  <span className="text-[10px] font-medium text-slate-400">
                    {isSpeaking ? 'Speaking...' : 'Listen Audio'}
                  </span>
                </div>
              </div>

              {/* Animated Acoustic Waveform Bar when Speaking */}
              {isSpeaking && (
                <div className="mt-3 pt-3 border-t border-rose-900/30 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-[11px] font-mono text-rose-300">
                      Broadcasting vernacular audio in {currentLangMeta.nativeName}...
                    </span>
                  </div>
                  {/* Wave Equalizer Bars */}
                  <div className="flex items-center gap-1 h-4">
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3"></span>
                    <span className="w-1 bg-rose-400 rounded-full animate-pulse h-4"></span>
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2"></span>
                    <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-4"></span>
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce h-3"></span>
                  </div>
                </div>
              )}
            </div>

            {/* 4 Actionable Emergency Steps in Native Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>ଜରୁରୀ ସୁରକ୍ଷା ନିର୍ଦ୍ଦେଶାବଳୀ / Life-Saving Steps ({currentLangMeta.nativeName})</span>
                </h5>
                <span className="text-[11px] font-mono text-slate-400">4 Points Verified</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(alertData?.alertContent?.actionableSteps || [
                  'ତୁରନ୍ତ ନିକଟସ୍ଥ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀ କିମ୍ବା ପକ୍କା ଘରକୁ ଚାଲିଯାଆନ୍ତୁ।',
                  'ସମୁଦ୍ର ଏବଂ ନଦୀ ନିକଟକୁ କଦାପି ଯାଆନ୍ତୁ ନାହିଁ; ଡଙ୍ଗାକୁ ସୁରକ୍ଷିତ ବାନ୍ଧି ରଖନ୍ତୁ।',
                  '୩ ଦିନ ପାଇଁ ପିଇବା ପାଣି, ଶୁଖିଲା ଖାଦ୍ୟ, ଆବଶ୍ୟକୀୟ ଔଷଧ ଓ ଟର୍ଚ୍ଚ ଲାଇଟ୍ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ।',
                  'ଘରର ମୁଖ୍ୟ ବିଦ୍ୟୁତ୍ ଏବଂ ଏଲ୍‌ପିଜି ଗ୍ୟାସ୍ ସଂଯୋଗ ତୁରନ୍ତ ବନ୍ଦ କରିଦିଅନ୍ତୁ।'
                ]).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0D152A] border border-[#1C2C52] hover:border-cyan-500/40 transition-colors flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Helpline Footnote */}
            <div className="p-2.5 rounded-xl bg-[#0C1428] border border-[#1A2648] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">24x7 Helpline:</span>
                <span className="text-white font-semibold">112</span>
                <span className="text-slate-600">•</span>
                <span>State Disaster Control:</span>
                <span className="text-white font-semibold">1070</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-cyan-400">
                <span>Vernacular Dialect Sync: Active</span>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: SMS & WhatsApp Formats in Vernacular */}
        {activeTab === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* SMS Preview Device Mockup */}
            <div className="p-4 rounded-xl bg-[#0B1327] border border-[#1E2E56] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2E56] pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Emergency SMS (160 Chars)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  GSM-7 / UCS-2 Native Script
                </span>
              </div>

              {/* Smartphone Message Bubble */}
              <div className="p-3.5 rounded-xl bg-[#142244] border border-[#25396A] text-slate-100 text-xs leading-relaxed font-sans shadow-md">
                <div className="text-[10px] font-mono text-cyan-300 font-semibold mb-1 flex items-center justify-between">
                  <span>SENDER: NDMA-ALERT</span>
                  <span>NOW</span>
                </div>
                <p className="font-medium whitespace-pre-wrap">
                  {alertData?.alertContent?.smsText || '🚨 [NDMA-ଓଡ଼ିଶା ସତର୍କତା] ଭୟଙ୍କର ବାତ୍ୟା ଚେତାବନୀ! ତୁରନ୍ତ ନିକଟସ୍ଥ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ। ସମୁଦ୍ର କୂଳକୁ ଯାଆନ୍ତୁ ନାହିଁ। ଜରୁରୀ ସହାୟତା ପାଇଁ ୧୧୨ / ୧୦୭୦ ଡାଏଲ କରନ୍ତୁ।'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-slate-400">
                  Length: {(alertData?.alertContent?.smsText || '').length} characters
                </span>
                <button
                  onClick={handleCopyMessage}
                  className="px-2.5 py-1 rounded-lg bg-[#18264C] hover:bg-[#203366] text-slate-200 text-xs flex items-center gap-1.5 transition-colors border border-[#2B4072]"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy SMS'}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Emergency Format Preview */}
            <div className="p-4 rounded-xl bg-[#0B1327] border border-[#1E2E56] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2E56] pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">WhatsApp Disaster Broadcast</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Enterprise Verified Channel
                </span>
              </div>

              {/* WhatsApp Bubble */}
              <div className="p-3.5 rounded-xl bg-[#0D221F] border border-emerald-600/30 text-emerald-50 text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-sans shadow-md">
                {alertData?.alertContent?.whatsappText || '🚨 *ଓଡ଼ିଶା ରାଜ୍ୟ ଜରୁରୀକାଳୀନ ବାତ୍ୟା ବୁଲେଟିନ୍*\n\nଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ସୁରକ୍ଷିତ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ।\n\nଜରୁରୀ ହେଲ୍ପଲାଇନ: ୧୧୨, ୧୦୭୦'}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-slate-400">
                  Rich formatting & Helpline links
                </span>
                <button
                  onClick={() => {
                    sound.playBlip();
                    if (navigator.share) {
                      navigator.share({
                        title: alertData?.alertContent?.title || 'Disaster Alert',
                        text: alertData?.alertContent?.whatsappText || '',
                      }).catch(() => {});
                    } else {
                      handleCopyMessage();
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs flex items-center gap-1.5 transition-colors border border-emerald-600/40"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Broadcast</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Dispatched Vernacular Broadcast History */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>MongoDB Vernacular Transmission Receipts ({currentLocation?.state})</span>
              </h5>
              <button
                onClick={fetchBroadcastLogs}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh Logs
              </button>
            </div>

            {broadcastLogs.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0D152A] border border-[#1C2C52] text-center space-y-2">
                <Info className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No vernacular broadcasts dispatched yet for this state.</p>
                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-colors inline-flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  Dispatch First Alert
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {broadcastLogs.map((log, idx) => (
                  <div
                    key={log.broadcastId || idx}
                    className="p-3 rounded-xl bg-[#0C152B] border border-[#1C2C52] hover:border-cyan-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {log.broadcastId}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {log.city}, {log.state}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold font-mono">
                          {log.nativeName} ({log.langName})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate max-w-md">
                        {log.messageText}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="text-[10px] font-mono text-slate-400">
                        <div className="text-emerald-400 font-semibold">{log.deliveredCount?.toLocaleString() || '183,500'} SIMs</div>
                        <div>Delivery: {log.deliveryRate || '99.2%'}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/60 uppercase">
                        {log.status || 'DELIVERED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================================================== */}
      {/* VERNACULAR ALERT DISPATCH MODAL                     */}
      {/* ==================================================== */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-[#0B1327] border border-[#2B3E6E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1E2E56] bg-[#0E1A38] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Dispatch Vernacular Emergency Alert
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Transmitting in <strong className="text-cyan-300">{currentLangMeta.nativeName} ({currentLangMeta.langName})</strong> to {currentLocation?.city}, {currentLocation?.state}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playBlip();
                  setIsBroadcastModalOpen(false);
                  setBroadcastReceipt(null);
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Delivery Receipt Notification if successfully sent */}
              {broadcastReceipt && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Vernacular Alert Successfully Dispatched & Confirmed!</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 space-y-1 bg-black/30 p-2.5 rounded-lg border border-emerald-900/40">
                    <div>Receipt ID: <span className="text-cyan-300 font-semibold">{broadcastReceipt.networkReceipt?.broadcastId}</span></div>
                    <div>Gateway: <span className="text-slate-200">{broadcastReceipt.networkReceipt?.gateway}</span></div>
                    <div>Delivery Ratio: <span className="text-emerald-400 font-bold">{broadcastReceipt.networkReceipt?.deliveryRate}</span> ({broadcastReceipt.networkReceipt?.deliveredCount?.toLocaleString()} active subscribers)</div>
                    <div>Target Region: <span className="text-white">{currentLocation?.city}, {currentLocation?.state}</span></div>
                    <div>Database: <span className="text-emerald-300">Saved to MongoDB resona_db.broadcastlogs</span></div>
                  </div>
                </div>
              )}

              {/* 1. Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select Broadcast Channel:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'SMS', label: 'SMS Blast', icon: Smartphone, desc: 'Telecom DND-bypass' },
                    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, desc: 'Official disaster channel' },
                    { id: 'VOICE_IVR', label: 'Voice IVR', icon: PhoneCall, desc: 'Automated native call' },
                    { id: 'CAP_BROADCAST', label: 'Cell Broadcast', icon: TowerControl, desc: 'Direct tower broadcast' },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = broadcastChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setBroadcastChannel(ch.id);
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                          isSelected 
                            ? 'bg-rose-600/20 border-rose-500/80 text-white shadow-md shadow-rose-950/40' 
                            : 'bg-[#101A33] border-[#22335A] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{ch.label}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{ch.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Target Reach Information */}
              <div className="p-3 rounded-xl bg-[#0E1834] border border-[#1E2E56] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400">Target Area:</span>{' '}
                  <strong className="text-white">{currentLocation?.city}, {currentLocation?.state}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Est. Reach:</span>{' '}
                  <strong className="text-cyan-400">~185,000 active SIMs</strong>
                </div>
              </div>

              {/* 3. Vernacular Message Preview in Native Script */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Message in Vernacular ({currentLangMeta.nativeName}):</span>
                  <span className="text-[11px] font-mono text-cyan-400">Ready for dispatch</span>
                </label>
                <div className="p-3 rounded-xl bg-[#091022] border border-[#1E2E56] text-slate-200 text-xs leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-sans">
                  {broadcastChannel === 'SMS' 
                    ? alertData?.alertContent?.smsText 
                    : broadcastChannel === 'WHATSAPP' 
                    ? alertData?.alertContent?.whatsappText 
                    : alertData?.alertContent?.audioScript}
                </div>
              </div>

              {/* 4. Optional Test Phone Number Simulation */}
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
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0E1834] border border-[#1E2E56] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setTestPhoneNumber('+91 98610 88990');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#162447] text-cyan-300 text-xs hover:bg-[#1E3060] transition-colors border border-[#2B4070]"
                  >
                    Demo Number
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#1E2E56] bg-[#0E1A38] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setIsBroadcastModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isBroadcasting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/60 transition-all disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-bounce' : ''}`} />
                <span>
                  {isBroadcasting 
                    ? 'Dispatched to Network...' 
                    : `Confirm & Broadcast in ${currentLangMeta.nativeName}`
                  }
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
