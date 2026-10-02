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
  Users,
  Bell,
  BellRing,
  Mail,
  Heart,
  Headphones,
  HelpCircle
} from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';
import CountUp from './CountUp';
import { notificationService } from '../utils/notificationService';
import { cleanPhoneNumber, openDeviceSms, openWhatsAppChat } from '../utils/directDispatch';
import ContactActionModal from './ContactActionModal';

// Comprehensive Pan-India & Vernacular Language Matrix (All 22 Eighth Schedule Languages + Regional Dialects)
export const ALL_VERNACULAR_LANGUAGES = [
  { 
    langCode: 'or', 
    langName: 'Odia', 
    nativeName: 'ଓଡ଼ିଆ', 
    state: 'Odisha', 
    script: 'Odia', 
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
    state: 'West Bengal & Tripura', 
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
    state: 'Tamil Nadu & Puducherry', 
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
    state: 'Kerala & Lakshadweep', 
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
    state: 'Punjab & Delhi', 
    script: 'Gurmukhi', 
    region: 'north', 
    regionLabel: 'North Plains',
    flag: '🌾',
    sampleGreeting: 'ਸੁਚੇਤ ਰਹੋ' 
  },
  { 
    langCode: 'ur', 
    langName: 'Urdu', 
    nativeName: 'اردو', 
    state: 'Pan-India & Telangana', 
    script: 'Nastaliq / Perso-Arabic', 
    region: 'all', 
    regionLabel: 'Pan-India Standard',
    flag: '🌙',
    sampleGreeting: 'محفوظ رہیں' 
  },
  { 
    langCode: 'ks', 
    langName: 'Kashmiri', 
    nativeName: 'کٲشُر', 
    state: 'Jammu & Kashmir', 
    script: 'Perso-Arabic', 
    region: 'north', 
    regionLabel: 'Kashmir Valley & Himalayas',
    flag: '❄️',
    sampleGreeting: 'خبردار روزِیو' 
  },
  { 
    langCode: 'ne', 
    langName: 'Nepali', 
    nativeName: 'नेपाली', 
    state: 'Sikkim & West Bengal', 
    script: 'Devanagari', 
    region: 'northeast', 
    regionLabel: 'Himalayan Foothills',
    flag: '🏔️',
    sampleGreeting: 'सचेत रहनुहोस्' 
  },
  { 
    langCode: 'kok', 
    langName: 'Konkani', 
    nativeName: 'कोंकणी', 
    state: 'Goa & West Coast', 
    script: 'Devanagari', 
    region: 'west', 
    regionLabel: 'Goa & Konkan Coast',
    flag: '🏖️',
    sampleGreeting: 'सावध रावात' 
  },
  { 
    langCode: 'mai', 
    langName: 'Maithili', 
    nativeName: 'मैथिली', 
    state: 'Bihar & Jharkhand', 
    script: 'Devanagari', 
    region: 'east', 
    regionLabel: 'Mithila & Eastern Plains',
    flag: '🌾',
    sampleGreeting: 'सचेत रहू' 
  },
  { 
    langCode: 'sat', 
    langName: 'Santali', 
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', 
    state: 'Jharkhand & Odisha', 
    script: 'Ol Chiki', 
    region: 'east', 
    regionLabel: 'Chota Nagpur Plateau',
    flag: '🏹',
    sampleGreeting: 'ᱥᱟᱛᱟᱨ ᱛᱟᱦᱮᱸᱱ ᱯᱮ' 
  },
  { 
    langCode: 'brx', 
    langName: 'Bodo', 
    nativeName: 'बड़ो', 
    state: 'Bodoland & Assam', 
    script: 'Devanagari', 
    region: 'northeast', 
    regionLabel: 'Brahmaputra Valley',
    flag: '🌳',
    sampleGreeting: 'सांग्रां जा' 
  },
  { 
    langCode: 'mni', 
    langName: 'Manipuri', 
    nativeName: 'মৈতৈলোন্', 
    state: 'Manipur & Northeast', 
    script: 'Bengali / Meetei', 
    region: 'northeast', 
    regionLabel: 'Manipur Valley & Hills',
    flag: '🌺',
    sampleGreeting: 'চেকশিনবীয়ু' 
  },
  { 
    langCode: 'doi', 
    langName: 'Dogri', 
    nativeName: 'डोगरी', 
    state: 'Jammu & Himachal', 
    script: 'Devanagari', 
    region: 'north', 
    regionLabel: 'Shivalik & Pir Panjal',
    flag: '⛰️',
    sampleGreeting: 'सुचेत रओ' 
  },
  { 
    langCode: 'sd', 
    langName: 'Sindhi', 
    nativeName: 'سنڌي', 
    state: 'Gujarat & Maharashtra', 
    script: 'Perso-Arabic', 
    region: 'west', 
    regionLabel: 'Western India Diaspora',
    flag: '🪔',
    sampleGreeting: 'حوشيار رهو' 
  },
  { 
    langCode: 'sa', 
    langName: 'Sanskrit', 
    nativeName: 'संस्कृतम्', 
    state: 'All-India Classical', 
    script: 'Devanagari', 
    region: 'all', 
    regionLabel: 'Classical National Heritage',
    flag: '🕉️',
    sampleGreeting: 'सावधानाः भवन्तु' 
  },
  { 
    langCode: 'bho', 
    langName: 'Bhojpuri', 
    nativeName: 'भोजपुरी', 
    state: 'Bihar & Eastern UP', 
    script: 'Devanagari', 
    region: 'east', 
    regionLabel: 'Purvanchal & Bhojpur',
    flag: '🌱',
    sampleGreeting: 'सावधान रहीं' 
  },
  { 
    langCode: 'mwr', 
    langName: 'Marwari', 
    nativeName: 'मारवाड़ी', 
    state: 'Rajasthan', 
    script: 'Devanagari', 
    region: 'west', 
    regionLabel: 'Thar Desert & Aravalli',
    flag: '🐪',
    sampleGreeting: 'साचेत रेवो' 
  },
  { 
    langCode: 'lus', 
    langName: 'Mizo', 
    nativeName: 'Mizo ṭawng', 
    state: 'Mizoram', 
    script: 'Latin', 
    region: 'northeast', 
    regionLabel: 'Lushai Hills',
    flag: '🎋',
    sampleGreeting: 'Fimkhur rawh u' 
  },
  { 
    langCode: 'kha', 
    langName: 'Khasi', 
    nativeName: 'Ka Ktien Khasi', 
    state: 'Meghalaya', 
    script: 'Latin', 
    region: 'northeast', 
    regionLabel: 'Khasi & Jaintia Hills',
    flag: '🌧️',
    sampleGreeting: 'Sumar bha' 
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
  const { currentUser, isAuthenticated, quickLogin, mongoUsers } = useAuth();

  // Desktop / Mobile system notification permission status
  const [notifPermission, setNotifPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  const handleEnableNotifications = async () => {
    sound.playBlip();
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      sound.playSuccessChime();
    }
  };

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


  // Channels: 'WHATSAPP' | 'SMS' | 'CAP_CELL' | 'VOICE_IVR'
  const [activeChannel, setActiveChannel] = useState('WHATSAPP');
  const [completedSteps, setCompletedSteps] = useState({});
  const [copiedItem, setCopiedItem] = useState(null);

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testEmail, setTestEmail] = useState('');
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
      const endpoint = `/api/alerts/broadcast-logs?limit=10&state=${encodeURIComponent(state)}`;
      let res = await fetch(endpoint).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:5000${endpoint}`);
      }
      if (res && res.ok) {
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

  // Toggle step completion with family safety celebration
  const handleToggleStepCheck = (idx) => {
    sound.playBlip();
    setCompletedSteps(prev => {
      const next = {
        ...prev,
        [idx]: !prev[idx]
      };
      const checkedCount = Object.values(next).filter(Boolean).length;
      if (checkedCount === 4 && !prev[idx]) {
        sound.playSuccessChime();
        try {
          confetti({ particleCount: 65, spread: 75, origin: { y: 0.65 } });
        } catch {}
      }
      return next;
    });
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
        : activeChannel === 'EMAIL'
        ? `🚨 [RESONA EMERGENCY WARNING: ${alertData.alertContent.title}]\n\nThreat Level: ${liveSeverity.toUpperCase()}\nRegion: ${city}, ${state}\n\nThreat Assessment:\n${alertData.alertContent.threat}\n\nMandatory Safety Protocol:\n${alertData.alertContent.actions?.map((a, i) => `${i + 1}. ${a}`).join('\n') || alertData.alertContent.audioScript}\n\nHelpline: Dial 1070 for State Disaster Command.`
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
        targetPhone: testPhoneNumber || null,
        testPhoneNumber: testPhoneNumber || null,
        targetEmail: testEmail || null,
        testEmail: testEmail || null,
        broadcastToRegisteredUsers: true,
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

      let res;
      try {
        res = await fetch('/api/alerts/broadcast-vernacular', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (fErr) {
        res = await fetch('http://localhost:5000/api/alerts/broadcast-vernacular', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      clearInterval(pInterval);
      setBroadcastProgress(100);

      if (res && res.ok) {
        const result = await res.json();
        sound.playSuccessChime();
        setBroadcastReceipt(result);
        fetchBroadcastLogs();
        if (onAlertBroadcasted) onAlertBroadcasted(result);

        // DISPATCH REAL NATIVE SYSTEM OS NOTIFICATION
        notificationService.showLocalNotification(`🚨 [${liveHazard.toUpperCase()} BROADCAST] ${city}`, {
          body: `Vernacular (${langMeta.nativeName}): ${messageToSend.slice(0, 150)}...`,
          data: result,
          playAudio: true
        });

        // If target phone was provided and on mobile device, trigger direct device SMS
        if (testPhoneNumber && testPhoneNumber.trim()) {
          if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
            openDeviceSms(testPhoneNumber, messageToSend);
          }
        }

        // Confetti celebration
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        const errData = await res?.json().catch(() => ({}));
        sound.playEmergencySiren(0.8);
        console.error('Broadcast failed:', errData);
        alert(`Broadcast Failed: ${errData?.message || errData?.error || 'Server error during broadcast transmission'}`);
      }
    } catch (err) {
      console.error('Broadcast dispatch error:', err);
      alert(`Broadcast dispatch error: ${err.message}`);
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
      lang.state.toLowerCase().includes(langSearch.toLowerCase()) ||
      (lang.sampleGreeting && lang.sampleGreeting.toLowerCase().includes(langSearch.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  // Calculate danger accent styles
  const isExtreme = liveSeverity.toLowerCase().includes('extreme') || liveSeverity.toLowerCase().includes('high');
  const accentGlow = isExtreme ? 'from-rose-500/20 via-orange-500/10 to-amber-500/5' : 'from-cyan-500/20 via-blue-500/10 to-indigo-500/5';

  return (
    <div className="space-y-4">

      {/* =================================================================== */}
      {/* 1. TOP COMMUNITY SAFETY & VOICE COMMAND RIBBON                     */}
      {/* =================================================================== */}
      <div className="relative rounded-2xl p-4 sm:p-5 overflow-hidden border border-white/10 bg-[#090F22]/90 backdrop-blur-2xl shadow-2xl ai-shimmer-card glass-morphism">
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
                  <span>Community Safety & Voice Alert</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-sans font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30 stroke-[1.8]" />
                    Mother Tongue Protection
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap font-sans">
                <span className="flex items-center gap-1.5 text-slate-400 font-normal">
                  <TowerControl className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                  Neighborhood:
                </span>
                <span className="font-medium text-white bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  {currentLocation?.city || 'Bhubaneswar'}, {currentLocation?.state || 'Odisha'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 radiating-status-ring" />
                  Speaking: <strong className="text-white font-semibold">{currentLangMeta.nativeName} ({currentLangMeta.langName})</strong>
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-300 border cursor-pointer ${
                dualView 
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
              title="Compare English and Mother Tongue side-by-side"
            >
              <Columns className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{dualView ? 'Dual Language (EN + Native)' : 'Side-by-side View'}</span>
            </button>

            {/* Siren Alert Sound Test Button - Soft Rounded Pill */}
            <button
              onClick={handleTestSiren}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-300 border cursor-pointer ${
                isSirenActive 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-md shadow-rose-950/80' 
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/25'
              }`}
              title="Test emergency warning acoustic tone"
            >
              <Zap className={`w-3.5 h-3.5 stroke-[1.8] ${isSirenActive ? 'animate-bounce' : 'text-rose-400'}`} />
              <span>{isSirenActive ? 'Siren playing...' : '🚨 Test Warning Tone'}</span>
            </button>

            {/* Speech Rate Cycle with Friendly Label */}
            <div className="flex items-center gap-1.5 bg-white/5 rounded-full border border-white/10 px-2 py-0.5 text-xs font-sans">
              <span className="text-[10px] text-slate-400 font-medium">Speed:</span>
              {[0.9, 1.0, 1.25].map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    sound.playBlip();
                    setSpeechRate(rate);
                  }}
                  className={`px-2 py-0.5 rounded-full font-medium transition-all duration-300 cursor-pointer text-xs ${
                    speechRate === rate 
                      ? 'bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-cyan-200 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
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
              title="Refresh warning with live weather advisory"
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
                <span>Volunteer broadcast</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </button>
            ) : isCitizen ? (
              <button
                onClick={() => {
                  sound.playBlip();
                  openWhatsAppChat('', alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat);
                }}
                className="px-3.5 py-2 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                title="Share this alert directly to protect your family and neighbors on WhatsApp"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40 stroke-[1.8]" />
                <span>Share with Loved Ones</span>
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
                Live local weather
              </span>
              <span className="text-white font-medium flex items-center gap-1.5 font-sans">
                <span>{current.city}:</span>
                <span className="text-cyan-300 font-semibold"><CountUp end={current.temp} duration={700} />°C</span>
                <span className="text-slate-400 font-normal">({current.description || current.condition})</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5 text-xs text-slate-300 flex-wrap font-sans">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Wind className="w-3.5 h-3.5 text-cyan-400 stroke-[1.8] icon-wind-wave" />
                Wind: <strong className="text-white font-medium"><CountUp end={current.wind_speed} duration={700} /> km/h</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Waves className="w-3.5 h-3.5 text-blue-400 stroke-[1.8] icon-flood-ripple" />
                Humidity: <strong className="text-white font-medium"><CountUp end={current.humidity} duration={800} />%</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <CloudRain className="w-3.5 h-3.5 text-indigo-400 stroke-[1.8]" />
                Rain: <strong className="text-white font-medium"><CountUp end={current.rain_1h || 0} decimals={1} duration={600} /> mm/h</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300/90 text-xs font-medium flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                <span>Family Tip: Keep devices charged & stay indoors</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. INTERACTIVE INDIC DIALECT MATRIX & SELECTOR STRIP               */}
      {/* =================================================================== */}
      <div className="rounded-2xl p-3.5 sm:p-4 border border-white/10 bg-[#090F20]/70 backdrop-blur-xl space-y-3 glass-morphism">
        
        {/* Matrix Header & Region Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400 stroke-[1.8]" />
            <span className="text-xs font-semibold text-white tracking-normal font-sans">
              Choose Mother Tongue / अपनी मातृभाषा चुनें
            </span>
            <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
              {ALL_VERNACULAR_LANGUAGES.length} Indian Languages & Dialects
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
                placeholder="Search mother tongue (e.g. Hindi, Odia, বাংলা)..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-44 sm:w-56 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Language Chips Strip */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1.5 pt-1">
          {filteredLanguages.map((lang, idx) => {
            const isSelected = selectedLang === lang.langCode;
            const staggerClass = `stagger-${(idx % 12) + 1}`;
            return (
              <button
                key={lang.langCode}
                onClick={() => handleSelectLanguage(lang.langCode)}
                className={`animate-stagger-in ${staggerClass} flex-shrink-0 group relative p-3 rounded-2xl border transition-all duration-300 text-left flex items-center gap-2.5 min-w-[165px] cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600/35 to-blue-600/25 border-cyan-400 ring-2 ring-cyan-400/80 ring-offset-2 ring-offset-[#070D1E] shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.02]'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-cyan-500/30 hover:shadow-cyan-950/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border transition-transform duration-300 group-hover:scale-110 ${
                  isSelected ? 'bg-cyan-500/20 border-cyan-400/40' : 'bg-black/40 border-white/10'
                }`}>
                  <span>{lang.flag}</span>
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-semibold tracking-normal truncate ${isSelected ? 'text-cyan-200' : 'text-white'}`}>
                      {lang.nativeName}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 radiating-status-ring shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-sans">
                    <span>{lang.langName}</span>
                    <span>•</span>
                    <span className="text-slate-500">{lang.state.split('/')[0]}</span>
                  </div>
                  {lang.sampleGreeting && (
                    <div className="text-[10px] text-cyan-300/85 italic font-serif truncate mt-0.5">
                      "{lang.sampleGreeting}"
                    </div>
                  )}
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
          <div className="relative rounded-2xl p-5 sm:p-6 border border-rose-500/25 bg-gradient-to-b from-[#131128] via-[#0E1326] to-[#0A0E1E] shadow-2xl overflow-hidden glass-morphism animate-emergency-breathe">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge Strip */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08] relative z-10 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/15 text-rose-200 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500 radiating-status-ring" />
                  🚨 Urgent Safety Warning for Your Family
                </span>
                <span className="text-xs font-sans text-cyan-300 bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-800/40 font-medium">
                  Spoken in: {currentLangMeta.nativeName} ({currentLangMeta.script} Script)
                </span>
              </div>

              <div className="text-xs font-sans text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                <span>Issued: Live Forecast Synced</span>
              </div>
            </div>

            {/* Headline and Threat Text */}
            <div key={`${selectedLang}-${alertData?.alertContent?.title || 'bulletin'}`} className="pt-4 space-y-3 relative z-10 animate-page-enter">

              {/* If Dual-View is Enabled: Show English vs. Vernacular Comparison */}
              {dualView ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 glass-morphism">
                  
                  {/* Left: Original English Input */}
                  <div className="space-y-1.5 border-r md:border-white/10 md:pr-3">
                    <div className="flex items-center justify-between text-xs font-sans text-slate-400 font-medium">
                      <span>Original advisory (English)</span>
                      <span className="text-cyan-400 text-[11px]">IMD & Disaster Command Feed</span>
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
                      <span>In your mother tongue ({currentLangMeta.nativeName})</span>
                      <span className="text-emerald-400 font-medium text-[11px]">Written for local families</span>
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

              {/* Caregiver & Family Helper Notice */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-slate-300 mt-2">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">Caregiver & Family Notice: </strong>
                  <span>Please share or read this notice aloud to senior citizens, young children, and neighbors who may not read English or screen alerts.</span>
                </div>
              </div>

            </div>

            {/* ACOUSTIC VOICE SYNTHESIZER DECK */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] relative z-10">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#080D1D]/90 border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/50">
                
                {/* Audio Play/Stop Button & Details */}
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={handleToggleSpeech}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer ${
                      isSpeaking 
                        ? 'bg-rose-600 text-white animate-pulse border-2 border-rose-300 shadow-rose-950/80 scale-105' 
                        : 'bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border border-cyan-300/30 shadow-cyan-950/50 hover:scale-105 active:scale-95'
                    }`}
                    title={isSpeaking ? "Stop Voice Playback" : `Listen aloud in ${currentLangMeta.nativeName}`}
                  >
                    {isSpeaking ? (
                      <Square className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5 font-sans">
                        <Headphones className="w-4 h-4 text-cyan-400 stroke-[1.8] shrink-0" />
                        Spoken Voice Message for Families
                      </span>
                      <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-semibold shrink-0">
                        {currentLangMeta.nativeName} ({currentLangMeta.langName})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                      {isSpeaking 
                        ? `Speaking clearly now in gentle ${currentLangMeta.langName} voice...` 
                        : `Tap to listen aloud in ${currentLangMeta.nativeName} — ideal for elders, children & noisy surroundings`}
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
                    {isSpeaking ? 'SPEAKING' : 'AUDIO READY'}
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* 4 ACTIONABLE LIFE-SAVING EMERGENCY PROTOCOLS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <h5 className="text-xs sm:text-sm font-semibold text-white tracking-normal font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
                <span>🏡 4 Immediate Steps to Protect Your Home & Family</span>
              </h5>
              <span className="text-xs font-sans text-cyan-300 font-medium">
                {Object.values(completedSteps).filter(Boolean).length}/4 completed
              </span>
            </div>

            {/* Celebration banner when all 4 completed */}
            {Object.values(completedSteps).filter(Boolean).length === 4 && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 flex items-center justify-between gap-2 text-xs text-emerald-200 animate-in fade-in shadow-md">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400/40 shrink-0" />
                  <span className="font-semibold text-white">Wonderful job! Your family is prepared and secured.</span>
                </div>
                <span className="text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  All 4 Prepared ✓
                </span>
              </div>
            )}

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
                  { label: '🏡 Safe Shelter First', icon: ShieldAlert },
                  { label: '🌊 Stay Clear of Water', icon: Waves },
                  { label: '🎒 Family Emergency Bag', icon: CloudRain },
                  { label: '⚡ Home Power & Gas Safety', icon: Zap },
                ];
                const pTag = protocolTags[idx % protocolTags.length];
                const TagIcon = pTag.icon;

                return (
                  <div
                    key={idx}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 group ${
                      isChecked
                        ? 'bg-[#0B1A1E]/80 border-emerald-500/35 shadow-sm'
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
                          <span className="text-[11px] font-sans text-slate-300 font-medium flex items-center gap-1.5">
                            <TagIcon className="w-3.5 h-3.5 text-cyan-400 stroke-[1.8]" />
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
                          title={`Listen to this step in ${currentLangMeta.nativeName}`}
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
                          isChecked ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <CheckCircle className={`w-3.5 h-3.5 stroke-[1.8] ${isChecked ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-500'}`} />
                        <span>{isChecked ? '✓ Done for my family' : 'Mark as completed'}</span>
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
                Free 24x7 Emergency Helplines:
              </span>
              
              <a
                href="tel:112"
                onClick={(e) => {
                  handleCopy('112', '112');
                }}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tap to call National Emergency (Police, Fire, Medical)"
              >
                <span className="text-slate-300 text-xs">National:</span>
                <strong className="text-cyan-300 font-mono">112</strong>
              </a>

              <a
                href="tel:1070"
                onClick={(e) => {
                  handleCopy('1070', '1070');
                }}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tap to call State Disaster Relief"
              >
                <span className="text-slate-300 text-xs">State SDMA:</span>
                <strong className="text-rose-300 font-mono">1070</strong>
              </a>

              <a
                href="tel:1077"
                onClick={(e) => {
                  handleCopy('1077', '1077');
                }}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tap to call District Relief Control"
              >
                <span className="text-slate-300 text-xs">District Relief:</span>
                <strong className="text-amber-300 font-mono">1077</strong>
              </a>
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
          <div className="p-1.5 bg-[#090F20]/80 backdrop-blur-xl rounded-2xl border border-white/10 grid grid-cols-4 gap-1.5 text-xs glass-morphism">
            {[
              { id: 'WHATSAPP', label: 'Family WhatsApp', icon: MessageSquare },
              { id: 'SMS', label: 'SMS to Relatives', icon: Smartphone },
              { id: 'CAP_CELL', label: 'Community Alert', icon: TowerControl },
              { id: 'VOICE_IVR', label: 'Elder Voice Call', icon: PhoneCall },
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
                  className={`group py-2.5 px-1 rounded-xl font-medium text-center flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-b from-cyan-500/25 to-blue-600/35 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[1.8] transition-transform duration-300 group-hover:scale-110 active:scale-95 ${isActive ? 'text-cyan-300 animate-bounce' : 'text-slate-400'}`} style={{ animationIterationCount: isActive ? 2 : 0 }} />
                  <span className="text-[11px] truncate w-full font-sans">{ch.label}</span>
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
              
              {/* 1. WHATSAPP FORMAT (FAMILY FIRST) */}
              {activeChannel === 'WHATSAPP' && (
                <div className="space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-sans text-slate-400 px-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                      <span>Family & Community Safety Group</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-500/20" />
                    </div>
                    <span className="text-emerald-400 text-[11px]">Live Verified</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0F2823] border border-emerald-500/35 text-emerald-100 text-xs leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto shadow-lg font-sans font-normal relative">
                    {alertData?.alertContent?.whatsappText || '🚨 *ଓଡ଼ିଶା ରାଜ୍ୟ ଜରୁରୀକାଳୀନ ବାତ୍ୟା ବୁଲେଟିନ୍*\n\nଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ସୁରକ୍ଷିତ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ।\n\nଜରୁରୀ ହେଲ୍ପଲାଇନ: ୧୧୨, ୧୦୭୦'}
                    <div className="text-[10px] text-emerald-400/80 flex items-center justify-end gap-1 mt-2 font-mono">
                      <span>Just now</span>
                      <span className="text-cyan-400 font-bold">✓✓</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        sound.playBlip();
                        openWhatsAppChat('', alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/60 transition-all cursor-pointer border border-emerald-400/30"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-200" />
                      <span>Share Directly with Family on WhatsApp</span>
                    </button>
                    <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-sans">
                      <span className="text-emerald-300/80">Includes emergency helplines</span>
                      <button
                        onClick={() => handleCopy(alertData?.alertContent?.whatsappText, 'whatsapp-text')}
                        className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
                      >
                        {copiedItem === 'whatsapp-text' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedItem === 'whatsapp-text' ? 'Copied' : 'Copy WhatsApp Text'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SMS FORMAT */}
              {activeChannel === 'SMS' && (
                <div className="space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-sans text-slate-400 px-1">
                    <span className="text-cyan-300 font-medium">From: State Emergency Disaster Relief</span>
                    <span className="text-[11px] text-slate-400">Mobile SMS text</span>
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
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openDeviceSms('', alertData?.alertContent?.smsText)}
                        className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
                        title="Open in default SMS app"
                      >
                        <Smartphone className="w-3 h-3 text-cyan-300" />
                        <span>Send SMS</span>
                      </button>
                      <button
                        onClick={() => handleCopy(alertData?.alertContent?.smsText, 'sms-text')}
                        className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
                      >
                        {copiedItem === 'sms-text' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedItem === 'sms-text' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. CELL BROADCAST (CAP EMERGENCY POPUP) */}
              {activeChannel === 'CAP_CELL' && (
                <div className="space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-sans text-rose-300 px-1 font-medium">
                    <span>Neighborhood Area Alert</span>
                    <span>High-priority alert</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-white space-y-2 shadow-2xl shadow-rose-950">
                    <div className="flex items-center gap-2 text-rose-200 font-semibold text-xs tracking-normal">
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce stroke-[1.8]" />
                      <span>EMERGENCY ALERT • SEVERE WEATHER</span>
                    </div>
                    <p className="text-xs text-rose-100 font-semibold leading-relaxed">
                      {alertData?.alertContent?.title || 'ସତର୍କତା ବୁଲେଟିନ୍'}
                    </p>
                    <p className="text-xs text-slate-200 leading-normal font-normal">
                      {alertData?.alertContent?.threat || 'ଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ।'}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-medium cursor-pointer">
                        I Am Prepared & Safe
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 px-1 flex items-center justify-between font-sans">
                    <span>Acoustic siren included</span>
                    <span className="text-rose-300 font-medium">Neighborhood Coverage</span>
                  </div>
                </div>
              )}

              {/* 4. VOICE IVR CALL SIMULATOR */}
              {activeChannel === 'VOICE_IVR' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-sans text-cyan-300 px-1 font-medium">
                    <span>Automated Voice Call</span>
                    <span>For Elders & Parents</span>
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
                        <span>{isSpeaking ? 'Listening to voice call...' : 'Listen to call voice'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* TRANSMISSION TELEMETRY HUD INSIDE PHONE */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-sans text-slate-400 px-1">
              <div>
                <span>Community Reach: </span>
                <strong className="text-cyan-300 font-medium">~220,000 citizens</strong>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>142 towers connected</span>
              </div>
            </div>

          </div>

          {/* PROTECT LOVED ONES & DISPATCH OPERATIONS CARD */}
          <div className="p-5 rounded-2xl bg-[#090F22]/90 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white tracking-normal font-sans flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20 stroke-[1.8]" />
                Protect Your Loved Ones
              </span>
              <button
                onClick={() => setShowLogsDrawer(!showLogsDrawer)}
                className="text-xs font-sans text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3 h-3 stroke-[1.8]" />
                History ({broadcastLogs.length})
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Send this verified safety advisory in <strong className="text-cyan-300 font-medium">{currentLangMeta.nativeName} ({currentLangMeta.langName})</strong> directly to your family members, elders, or local neighborhood groups.
            </p>

            {/* Primary Citizen Action: 1-Tap WhatsApp Share */}
            <button
              onClick={() => {
                sound.playBlip();
                openWhatsAppChat('', alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-200" />
              <span>Share with Family on WhatsApp</span>
            </button>

            {/* Secondary Action: Volunteer Mass Broadcast if Authorized */}
            {canBroadcast ? (
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Volunteer Mass Dispatch Console</span>
              </button>
            ) : (
              <button
                onClick={() => handleCopy(alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat, 'native-advisory')}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedItem === 'native-advisory' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedItem === 'native-advisory' ? 'Copied to Clipboard' : `Copy Advisory in ${currentLangMeta.nativeName}`}</span>
              </button>
            )}
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

              {/* Browser & OS Notification Permission Status */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {notifPermission === 'granted' ? (
                    <BellRing className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-white font-medium">Desktop & Mobile Notifications: </span>
                    <span className={notifPermission === 'granted' ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'}>
                      {notifPermission === 'granted' ? 'Active (Popups Enabled)' : 'Click to Enable'}
                    </span>
                  </div>
                </div>

                {notifPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-medium transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Enable Notifications
                  </button>
                )}
              </div>

              {/* Delivery Receipt Notification */}
              {broadcastReceipt && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 space-y-3 animate-in fade-in">
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

                  {/* Telecom Gateway Notice if not configured */}
                  {broadcastReceipt.networkReceipt?.isLiveCarrier === false && activeChannel === 'SMS' && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Why physical SMS didn't arrive on the SIM card:</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        A laptop or web server cannot transmit over-the-air cellular signals without an SMS telecom gateway. To deliver automated telecom SMS to the SIM card, add <strong>FAST2SMS_API_KEY</strong> or <strong>TWILIO</strong> credentials in <code>Backend/.env</code>.
                      </p>
                      <p className="text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                        <span>👉 Click the green <strong>WhatsApp</strong> button below to deliver directly to their phone right now for FREE!</span>
                      </p>
                    </div>
                  )}

                  {/* Direct Phone Deliveries Actionable List */}
                  {broadcastReceipt.networkReceipt?.phoneDeliveries?.length > 0 && (
                    <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 space-y-2">
                      <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        Direct Mobile Transmissions ({broadcastReceipt.networkReceipt.phoneDeliveries.length} endpoints):
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {broadcastReceipt.networkReceipt.phoneDeliveries.map((pd, pidx) => (
                          <div key={pidx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.04] text-xs">
                            <div>
                              <span className="font-semibold text-white">{pd.name || 'Recipient'}: </span>
                              <span className="font-mono text-cyan-300">{pd.recipient}</span>
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                pd.isLiveCarrier 
                                  ? 'bg-emerald-500/20 text-emerald-300' 
                                  : 'bg-cyan-500/20 text-cyan-300'
                              }`}>
                                {pd.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openWhatsAppChat(pd.recipient, activeChannel === 'SMS' ? alertData?.alertContent?.smsText : alertData?.alertContent?.whatsappText)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-emerald-400/40"
                                title="Send directly to recipient's phone via WhatsApp for free"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-200" />
                                <span>WhatsApp (Direct to Phone)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeviceSms(pd.recipient, activeChannel === 'SMS' ? alertData?.alertContent?.smsText : alertData?.alertContent?.whatsappText)}
                                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 font-medium text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-white/10"
                                title="Open in default SMS / Phone Link app"
                              >
                                <Smartphone className="w-3 h-3 text-slate-300" />
                                <span>OS SMS</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Email Deliveries Actionable List */}
                  {broadcastReceipt.networkReceipt?.emailDeliveries?.length > 0 && (
                    <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/40 space-y-2">
                      <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        Direct Email Transmissions ({broadcastReceipt.networkReceipt.emailDeliveries.length} recipients):
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {broadcastReceipt.networkReceipt.emailDeliveries.map((ed, eidx) => (
                          <div key={eidx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.04] text-xs">
                            <div>
                              <span className="font-semibold text-white">{ed.name || 'Recipient'}: </span>
                              <span className="font-mono text-cyan-300">{ed.recipient}</span>
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                ed.isLiveCarrier || ed.status === 'DELIVERED'
                                  ? 'bg-emerald-500/20 text-emerald-300' 
                                  : 'bg-cyan-500/20 text-cyan-300'
                              }`}>
                                {ed.status || 'DELIVERED'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {ed.gmailIntent && (
                                <a
                                  href={ed.gmailIntent}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-rose-400/40"
                                  title="Send directly in Gmail Web"
                                >
                                  <Mail className="w-3 h-3 text-rose-200" />
                                  <span>Open in Gmail</span>
                                </a>
                              )}
                              <a
                                href={ed.mailtoIntent || `mailto:${ed.recipient}?subject=${encodeURIComponent(alertData?.alertContent?.title || 'Emergency Warning')}&body=${encodeURIComponent(alertData?.alertContent?.threat || '')}`}
                                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 font-medium text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-white/10"
                                title="Open default OS email client"
                              >
                                <ExternalLink className="w-3 h-3 text-slate-300" />
                                <span>Mail Client</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select Broadcast Channel:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'EMAIL', label: 'Email Broadcast', icon: Mail, desc: 'SMTP & Webmail' },
                    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, desc: 'Verified direct' },
                    { id: 'SMS', label: 'SMS Blast', icon: Smartphone, desc: 'Telecom DND-bypass' },
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
                  <strong className="text-cyan-400">
                    {activeChannel === 'EMAIL' ? `~${mongoUsers?.length || 8} registered inboxes` : '~220,000 active SIMs'}
                  </strong>
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
                    : activeChannel === 'EMAIL'
                    ? `🚨 [RESONA EMERGENCY WARNING: ${alertData?.alertContent?.title}]\n\nThreat Level: ${liveSeverity.toUpperCase()}\nRegion: ${currentLocation?.city}, ${currentLocation?.state}\n\nThreat Assessment:\n${alertData?.alertContent?.threat}\n\nMandatory Safety Protocol:\n${alertData?.alertContent?.actions?.map((a, i) => `${i + 1}. ${a}`).join('\n') || alertData?.alertContent?.audioScript}\n\nHelpline: Dial 1070 for State Disaster Command.`
                    : alertData?.alertContent?.audioScript}
                </div>
              </div>

              {/* Dynamic Target Input: Email vs Phone */}
              {activeChannel === 'EMAIL' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Target Email Address (Direct Inbox Delivery):</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Sends directly to this email</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter recipient email (e.g. anuragdevops956@gmail.com)"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    {testEmail && (
                      <button
                        type="button"
                        onClick={() => setTestEmail('')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Quick Email Selector Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 self-center mr-1">Quick Select:</span>
                    {currentUser?.email && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setTestEmail(currentUser.email);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors"
                      >
                        My Email ({currentUser.email})
                      </button>
                    )}
                    {mongoUsers?.slice(0, 4).map((u, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setTestEmail(u.email);
                        }}
                        className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-colors truncate max-w-[200px]"
                        title={u.email}
                      >
                        {u.name} ({u.email})
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Also broadcasting to all {mongoUsers?.length || 8} registered users in MongoDB database</span>
                    </span>
                    <span className="text-cyan-400 font-bold text-[10px] uppercase font-mono">Auto-Sync</span>
                  </div>
                </div>
              ) : (
                /* Target Mobile Phone Number Input with Quick Selectors */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Target Phone Number (Direct Mobile Delivery):</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Sends directly to this phone</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Enter phone number (e.g. +91 94370 12345)"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    {testPhoneNumber && (
                      <button
                        type="button"
                        onClick={() => setTestPhoneNumber('')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Quick Recipient Selector Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 self-center mr-1">Quick Select:</span>
                    {currentUser?.phone && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setTestPhoneNumber(currentUser.phone);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors"
                      >
                        My Phone ({currentUser.phone})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBlip();
                        setTestPhoneNumber('+91 94370 22334');
                      }}
                      className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-colors"
                    >
                      Sunita Nayak (+91 94370 22334)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBlip();
                        setTestPhoneNumber('+91 70081 99887');
                      }}
                      className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-colors"
                    >
                      Ramesh Das (+91 70081 99887)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBlip();
                        setTestPhoneNumber('+91 98765 43210');
                      }}
                      className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-colors"
                    >
                      Cmdr Patel (+91 98765 43210)
                    </button>
                  </div>
                </div>
              )}

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
      {/* 5. MODAL: CITIZEN BROADCAST & COMMUNITY GUIDE                      */}
      {/* =================================================================== */}
      {isCitizenRestrictedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#090F24] border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-emerald-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                    <span>Protecting Community Communications</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                      Public Safety
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    How you can help your family and neighbors right now
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
                  Why are mass cell-tower broadcasts reserved for relief teams?
                </p>
                <p>
                  To protect our communities from unverified alarms, duplicate alert spam, and communication gridlock, mass emergency messaging (cell tower overrides & automated blasts) is coordinated by <strong className="text-emerald-300">authorized Disaster Relief Volunteers and Government Command</strong>.
                </p>
              </div>

              {/* Citizen Capabilities Checklist */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-300 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                  <span>Immediate actions you can take right now:</span>
                </span>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Share this verified advisory directly to family WhatsApp & SMS groups</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Play the spoken mother tongue voice message for elders at home</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Complete the 4 immediate home safety steps (shelter, water, kit, power)</span>
                  </div>
                </div>
              </div>

              {/* Actions: One-Tap WhatsApp Share or Switch to Volunteer */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBlip();
                    setIsCitizenRestrictedModalOpen(false);
                    openWhatsAppChat('', alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-200" />
                  <span>Share with Family on WhatsApp Now</span>
                </button>

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
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
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
