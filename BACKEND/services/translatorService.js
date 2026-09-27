/**
 * Multilingual Alert AI Engine for Vernacular Disaster Dispatches
 * Automatically maps Indian states/cities to their regional vernacular language
 * and generates high-fidelity emergency alerts in native scripts with speech & SMS formats.
 */

// Mapping of Indian states & Union Territories to their primary vernacular language
const STATE_LANGUAGE_MAP = {
  // Eastern India
  'odisha': { langCode: 'or', langName: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN', fallbackSpeech: 'hi-IN' },
  'west bengal': { langCode: 'bn', langName: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', fallbackSpeech: 'bn-IN' },
  'bihar': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'jharkhand': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },

  // Southern India
  'tamil nadu': { langCode: 'ta', langName: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', fallbackSpeech: 'ta-IN' },
  'andhra pradesh': { langCode: 'te', langName: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', fallbackSpeech: 'te-IN' },
  'telangana': { langCode: 'te', langName: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', fallbackSpeech: 'te-IN' },
  'karnataka': { langCode: 'kn', langName: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', fallbackSpeech: 'kn-IN' },
  'kerala': { langCode: 'ml', langName: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN', fallbackSpeech: 'ml-IN' },

  // Western India
  'maharashtra': { langCode: 'mr', langName: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', fallbackSpeech: 'mr-IN' },
  'gujarat': { langCode: 'gu', langName: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', fallbackSpeech: 'gu-IN' },
  'goa': { langCode: 'mr', langName: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', fallbackSpeech: 'mr-IN' },

  // Northern & Central India
  'delhi': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'delhi ncr': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'rajasthan': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'uttar pradesh': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'madhya pradesh': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'chhattisgarh': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'haryana': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'punjab': { langCode: 'pa', langName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', fallbackSpeech: 'hi-IN' },
  'punjab/haryana': { langCode: 'pa', langName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', fallbackSpeech: 'hi-IN' },
  'himachal pradesh': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'uttarakhand': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },
  'jammu & kashmir': { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', fallbackSpeech: 'hi-IN' },

  // Northeastern India
  'assam': { langCode: 'as', langName: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN', fallbackSpeech: 'bn-IN' },
  'meghalaya': { langCode: 'as', langName: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN', fallbackSpeech: 'en-IN' },
};

// City lookup mapping for quick resolution
const CITY_LANGUAGE_MAP = {
  'bhubaneswar': 'or',
  'puri': 'or',
  'cuttack': 'or',
  'balasore': 'or',
  'paradip': 'or',
  'kolkata': 'bn',
  'howrah': 'bn',
  'siliguri': 'bn',
  'chennai': 'ta',
  'coimbatore': 'ta',
  'madurai': 'ta',
  'hyderabad': 'te',
  'visakhapatnam': 'te',
  'vijayawada': 'te',
  'mumbai': 'mr',
  'pune': 'mr',
  'nagpur': 'mr',
  'ahmedabad': 'gu',
  'surat': 'gu',
  'vadodara': 'gu',
  'bengaluru': 'kn',
  'mysore': 'kn',
  'kochi': 'ml',
  'thiruvananthapuram': 'ml',
  'chandigarh': 'pa',
  'amritsar': 'pa',
  'guwahati': 'as',
  'shillong': 'as',
  'delhi': 'hi',
  'new delhi': 'hi',
  'jaipur': 'hi',
  'patna': 'hi',
  'lucknow': 'hi',
  'bhopal': 'hi',
  'ranchi': 'hi',
  'raipur': 'hi',
};

// All supported languages list with metadata
const SUPPORTED_LANGUAGES = [
  { langCode: 'or', langName: 'Odia', nativeName: 'ଓଡ଼ିଆ', state: 'Odisha', speechCode: 'or-IN' },
  { langCode: 'hi', langName: 'Hindi', nativeName: 'हिन्दी', state: 'National / North India', speechCode: 'hi-IN' },
  { langCode: 'bn', langName: 'Bengali', nativeName: 'বাংলা', state: 'West Bengal', speechCode: 'bn-IN' },
  { langCode: 'ta', langName: 'Tamil', nativeName: 'தமிழ்', state: 'Tamil Nadu', speechCode: 'ta-IN' },
  { langCode: 'te', langName: 'Telugu', nativeName: 'తెలుగు', state: 'Andhra Pradesh & Telangana', speechCode: 'te-IN' },
  { langCode: 'mr', langName: 'Marathi', nativeName: 'मराठी', state: 'Maharashtra', speechCode: 'mr-IN' },
  { langCode: 'gu', langName: 'Gujarati', nativeName: 'ગુજરાતી', state: 'Gujarat', speechCode: 'gu-IN' },
  { langCode: 'kn', langName: 'Kannada', nativeName: 'ಕನ್ನಡ', state: 'Karnataka', speechCode: 'kn-IN' },
  { langCode: 'ml', langName: 'Malayalam', nativeName: 'മലയാളം', state: 'Kerala', speechCode: 'ml-IN' },
  { langCode: 'as', langName: 'Assamese', nativeName: 'অসমীয়া', state: 'Assam & NE', speechCode: 'as-IN' },
  { langCode: 'pa', langName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', state: 'Punjab', speechCode: 'pa-IN' },
  { langCode: 'en', langName: 'English (Plain)', nativeName: 'English', state: 'All-India Universal', speechCode: 'en-IN' },
];

/**
 * Determine the primary vernacular language based on state or city name
 */
function resolveVernacularLanguage(city = '', state = '') {
  const normCity = (city || '').trim().toLowerCase();
  const normState = (state || '').trim().toLowerCase();

  // Try city first
  if (CITY_LANGUAGE_MAP[normCity]) {
    const code = CITY_LANGUAGE_MAP[normCity];
    return SUPPORTED_LANGUAGES.find(l => l.langCode === code) || SUPPORTED_LANGUAGES[0];
  }

  // Try state
  if (STATE_LANGUAGE_MAP[normState]) {
    const meta = STATE_LANGUAGE_MAP[normState];
    return SUPPORTED_LANGUAGES.find(l => l.langCode === meta.langCode) || SUPPORTED_LANGUAGES[0];
  }

  // Substring checks
  for (const [st, meta] of Object.entries(STATE_LANGUAGE_MAP)) {
    if (normState.includes(st) || st.includes(normState)) {
      return SUPPORTED_LANGUAGES.find(l => l.langCode === meta.langCode) || SUPPORTED_LANGUAGES[0];
    }
  }

  // Fallback to Hindi or Odia if coastal
  if (normCity.includes('puri') || normCity.includes('bhubaneswar') || normCity.includes('odisha')) {
    return SUPPORTED_LANGUAGES.find(l => l.langCode === 'or');
  }

  return SUPPORTED_LANGUAGES.find(l => l.langCode === 'hi') || SUPPORTED_LANGUAGES[0];
}

// Master Vernacular Knowledge Base for India Hazards
const VERNACULAR_TEMPLATES = {
  cyclone: {
    or: {
      hazardLabel: 'ଭୟଙ୍କର ବାତ୍ୟା ଓ ଝଡ଼',
      title: 'ଅତି ଭୟଙ୍କର ବାତ୍ୟା ଚେତାବନୀ — ତୁରନ୍ତ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ',
      threat: 'ଉପକୂଳରେ ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ଘଣ୍ଟାପ୍ରତି ୧୩୦–୧୫୦ କି.ମି. ବେଗରେ ଝଡ଼ ପବନ ଓ ପ୍ରବଳରୁ ଅତି ପ୍ରବଳ ବର୍ଷା ସମ୍ଭାବନା। ମାଟି ଘର, ଟିଣ ଛାତ ଭାଙ୍ଗିଯିବା ଆଶଙ୍କା।',
      actionableSteps: [
        'ତୁରନ୍ତ ନିକଟସ୍ଥ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀ କିମ୍ବା ପକ୍କା ଘରକୁ ଚାଲିଯାଆନ୍ତୁ।',
        'ସମୁଦ୍ର ଏବଂ ନଦୀ ନିକଟକୁ କଦାପି ଯାଆନ୍ତୁ ନାହିଁ; ଡଙ୍ଗାକୁ ସୁରକ୍ଷିତ ବାନ୍ଧି ରଖନ୍ତୁ।',
        '୩ ଦିନ ପାଇଁ ପିଇବା ପାଣି, ଶୁଖିଲା ଖାଦ୍ୟ, ଆବଶ୍ୟକୀୟ ଔଷଧ ଓ ଟର୍ଚ୍ଚ ଲାଇଟ୍ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ।',
        'ଘରର ମୁଖ୍ୟ ବିଦ୍ୟୁତ୍ ଏବଂ ଏଲ୍‌ପିଜି ଗ୍ୟାସ୍ ସଂଯୋଗ ତୁରନ୍ତ ବନ୍ଦ କରିଦିଅନ୍ତୁ।'
      ],
      smsText: '🚨 [NDMA-ଓଡ଼ିଶା ସତର୍କତା] ଭୟଙ୍କର ବାତ୍ୟା ଚେତାବନୀ! ତୁରନ୍ତ ନିକଟସ୍ଥ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ। ସମୁଦ୍ର କୂଳକୁ ଯାଆନ୍ତୁ ନାହିଁ। ଜରୁରୀ ସହାୟତା ପାଇଁ ୧୧୨ / ୧୦୭୦ ଡାଏଲ କରନ୍ତୁ।',
      whatsappHeader: '🚨 *ଓଡ଼ିଶା ରାଜ୍ୟ ଜରୁରୀକାଳୀନ ବାତ୍ୟା ବୁଲେଟିନ୍*',
      emergencyCallout: 'ସରକାରୀ ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ: ୧୧୨ (ସର୍ବଭାରତୀୟ), ୧୦୭୦ (ରାଜ୍ୟ କଣ୍ଟ୍ରୋଲ ରୁମ)',
      audioAnnouncement: 'ଧ୍ୟାନ ଦିଅନ୍ତୁ, ଏହା ଏକ ଜରୁରୀକାଳୀନ ସତର୍କତା। ଉପକୂଳ ଅଞ୍ଚଳରେ ଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ସମସ୍ତ ନାଗରିକ ତୁରନ୍ତ ସୁରକ୍ଷିତ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଚାଲିଯାଆନ୍ତୁ।'
    },
    hi: {
      hazardLabel: 'अत्यंत गंभीर चक्रवात',
      title: 'अत्यंत गंभीर चक्रवाती तूफ़ान चेतावनी — तुरंत सुरक्षित आश्रय में जाएं',
      threat: 'खतरनाक चक्रवाती तूफ़ान तेजी से तट की ओर बढ़ रहा है। 130–150 किमी/घंटा की गति से विनाशकारी हवाएं और मूसलाधार बारिश होगी। कच्चे मकानों और पेड़ों के गिरने की आशंका।',
      actionableSteps: [
        'तुरंत अपने नजदीकी पक्के चक्रवात आश्रय स्थल (Cyclone Shelter) में चले जाएं।',
        'समुद्र तट और नदियों से पूरी तरह दूर रहें। किसी भी हाल में बाहर न घूमें।',
        '3 दिनों के लिए पीने का साफ पानी, सूखा राशन, दवाइयां और टॉर्च तैयार रखें।',
        'घर का मुख्य बिजली स्विच और रसोई गैस सिलेंडर तुरंत बंद कर दें।'
      ],
      smsText: '🚨 [NDMA आपदा चेतावनी] अत्यंत गंभीर चक्रवात चेतावनी! तुरंत पक्के शेल्टर में जाएं। समुद्र तट से दूर रहें। आपातकालीन सहायता: 112 / 1070 पर संपर्क करें।',
      whatsappHeader: '🚨 *राष्ट्रीय आपदा प्रबंधन प्राधिकरण — आपातकालीन चक्रवात बुलेटिन*',
      emergencyCallout: 'आपातकालीन हेल्पलाइन: 112 (राष्ट्रीय), 1070 (राज्य आपदा नियंत्रण कक्ष)',
      audioAnnouncement: 'ध्यान दें, यह एक आपातकालीन चेतावनी है। आपके क्षेत्र में अत्यंत गंभीर चक्रवाती तूफान आने वाला है। कृपया तुरंत नजदीकी पक्के राहत शिविर में जाएं।'
    },
    bn: {
      hazardLabel: 'ভয়াবহ ঘূর্ণিঝড় সতর্কতা',
      title: 'ভয়াবহ ঘূর্ণিঝড় সতর্কতা — অবিলম্বে পাকা সাইক্লোন শেল্টারে যান',
      threat: 'ভয়াবহ ঘূর্ণিঝড় উপকূলে আছড়ে পড়ছে। অতি ভারী বৃষ্টিপাত এবং ঘণ্টায় ১৩০–১৫০ কিমি বেগে বিধ্বংসী ঝড়ো হাওয়া বইবে। কাঁচা বাড়ি ও বিদ্যুতের খুঁটি ভেঙে পড়ার আশঙ্কা।',
      actionableSteps: [
        'দেরি না করে অবিলম্বে নিকটবর্তী পাকা সাইক্লোন শেল্টারে আশ্রয় নিন।',
        'সমুদ্র উপকূল এবং নদী তট থেকে সম্পূর্ণ দূরে নিরাপদে অবস্থান করুন।',
        '৩ দিনের পানীয় জল, শুকনো খাবার, প্রয়োজনীয় ওষুধ ও টর্চ সঙ্গে রাখুন।',
        'বাড়ির প্রধান বিদ্যুৎ সংযোগ ও রান্নার গ্যাস সিলিন্ডার সাথে সাথে বন্ধ করুন।'
      ],
      smsText: '🚨 [NDMA দুর্যোগ সতর্কতা] ভয়াবহ ঘূর্ণিঝড় আসছে! অবিলম্বে নিকটস্থ সাইক্লোন শেল্টারে চলে যান। উপকূল থেকে দূরে থাকুন। জরুরি হেল্পলাইন: ১১২ / ১০৭০',
      whatsappHeader: '🚨 *পশ্চিমবঙ্গ রাজ্য জরুরি বিপর্যয় ব্যবস্থাপনা বুলেটিন*',
      emergencyCallout: 'জরুরি হেল্পলাইন: ১১২ (জাতীয় জরুরি নম্বর), ১০৭০ (রাজ্য বিপর্যয় সেল)',
      audioAnnouncement: 'দৃষ্টি আকর্ষণ করা হচ্ছে, এটি একটি জরুরি সতর্কতা। অতি তীব্র ঘূর্ণিঝড় ধেয়ে আসছে। আপনারা অনতিবিলম্বে নিরাপদ আশ্রয়ে চলে যান।'
    },
    ta: {
      hazardLabel: 'தீவிர புயல் எச்சரிக்கை',
      title: 'தீவிர புயல் எச்சரிக்கை — உடனடியாக கான்கிரீட் முகாமிற்கு செல்லவும்',
      threat: 'மிகவும் ஆபத்தான புயல் கரையை நெருங்குகிறது. மணிக்கு 130–150 கி.மீ வேகத்தில் பலத்த காற்று மற்றும் மிகக் கனமழை பெய்யும். மரங்கள் விழும் அபாயம்.',
      actionableSteps: [
        'உடனடியாக அருகிலுள்ள கான்கிரீட் புயல் நிவாரண முகாமுக்கு செல்லவும்.',
        'கடற்கரை மற்றும் நீர்நிலைகளுக்கு அருகில் செல்ல வேண்டாம்.',
        '3 நாட்களுக்கு தேவையான குடிநீர், உலர் உணவு மற்றும் டார்ச் லைட்டை தயார் செய்யவும்.',
        'மெயின் மின்சார சுவிட்ச் மற்றும் கேஸ் சிலிண்டரை உடனே அணைத்துவிடவும்.'
      ],
      smsText: '🚨 [NDMA எச்சரிக்கை] தீவிர புயல் நெருங்குகிறது! உடனடியாக பாதுகாப்பான புயல் முகாம்களுக்கு செல்லவும். அவசர உதவி எண்: 112 / 1070',
      whatsappHeader: '🚨 *தமிழ்நாடு மாநில பேரிடர் மேலாண்மை அவசர செய்தி*',
      emergencyCallout: 'அவசர உதவி எண்கள்: 112 (காவல்/ஆம்புலன்ஸ்), 1070 (மாநில கட்டுப்பாட்டு அறை)',
      audioAnnouncement: 'கவனிக்கவும், இது ஒரு அவசர பேரிடர் எச்சரிக்கை. தீவிர புயல் காரணமாக உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.'
    },
    te: {
      hazardLabel: 'తీవ్ర తుఫాను హెచ్చరిక',
      title: 'అతి తీవ్ర తుఫాను హెచ్చరిక — వెంటనే పునరావాస కేంద్రాలకు వెళ్లండి',
      threat: 'భయంకరమైన తుఫాను తీరం దాటబోతోంది. గంటకు 130–150 కి.మీ పెనుగాలులు, అత్యంత భారీ వర్షాలు కురుస్తాయి. లోతట్టు ప్రాంతాలు జలమయం అవుతాయి.',
      actionableSteps: [
        'వెంటనే సమీపంలోని పక్కా తుఫాను పునరావాస కేంద్రానికి తరలివెళ్లండి.',
        'సముద్ర తీరం, నదుల దగ్గరకు వెళ్లకండి. మత్స్యకారులు వేటకు వెళ్లరాదు.',
        '3 రోజులకు సరిపడా తాగునీరు, పొడి ఆహారం, మందులు మరియు టార్చ్ సిద్ధంగా ఉంచండి.',
        'ప్రధాన విద్యుత్ స్విచ్, గ్యాస్ సిలిండర్ వెంటనే ఆపివేయండి.'
      ],
      smsText: '🚨 [NDMA తుఫాను హెచ్చరిక] తీవ్ర తుఫాను తీరం దాటుతోంది! వెంటనే సమీపంలోని పునరావాస కేంద్రాలకు చేరుకోండి. అత్యవసర హెల్ప్‌లైన్: 112 / 1070',
      whatsappHeader: '🚨 *విపత్తు నిర్వహణ అత్యవసర తుఫాను బులిటెన్*',
      emergencyCallout: 'అత్యవసర సహాయ కేంద్రం: 112, రాష్ట్ర కంట్రోల్ రూమ్: 1070',
      audioAnnouncement: 'అత్యవసర హెచ్చరిక! మీ ప్రాంతంలో తీవ్ర తుఫాను ముప్పు పొంచి ఉంది. ప్రజలందరూ వెంటనే సురక్షిత ప్రాంతాలకు వెళ్లవలసిందిగా కోరుచున్నాము.'
    },
    mr: {
      hazardLabel: 'तीव्र चक्रीवादळ इशारा',
      title: 'अत्यंत तीव्र चक्रीवादळ इशारा — त्वरित सुरक्षित ठिकाणी आश्रय घ्या',
      threat: 'धोकादायक चक्रीवादळ किनारपट्टीवर धडकणार आहे. ताशी १३०–१५० किमी वेगाने वादळी वारे आणि मुसळधार पाऊस पडेल. कच्च्या घरांचे नुकसान होऊ शकते.',
      actionableSteps: [
        'तातडीने जवळच्या पक्क्या चक्रीवादळ निवारा केंद्रात आश्रय घ्या.',
        'समुद्रकिनारा आणि नद्यांपासून दूर राहा. घराबाहेर पडू नका.',
        '३ दिवसांसाठी पिण्याचे स्वच्छ पाणी, सुका खाऊ आणि टॉर्च सोबत ठेवा.',
        'घरातील मुख्य वीज पुरवठा आणि गॅस सिलिंडर त्वरित बंद करा.'
      ],
      smsText: '🚨 [NDMA चक्रीवादळ इशारा] तीव्र चक्रीवादळ धडकणार आहे! तातडीने पक्क्या निवारा केंद्रात जा. समुद्राजवळ जाऊ नका. मदत क्रमांक: 112 / 1070',
      whatsappHeader: '🚨 *महाराष्ट्र राज्य आपत्ती व्यवस्थापन तातडीचा इशारा*',
      emergencyCallout: 'आपत्कालीन संपर्क: 112 (राष्ट्रीय मदत कक्ष), 1070 (राज्य नियंत्रण कक्ष)',
      audioAnnouncement: 'कृपया लक्ष द्या! हे आपत्कालीन सतर्कतेचे आवाहन आहे. चक्रीवादळाचा धोका लक्षात घेऊन नागरिकांनी सुरक्षित ठिकाणी आश्रय घ्यावा.'
    },
    gu: {
      hazardLabel: 'અતિ ગંભીર વાવાઝોડું',
      title: 'અતિ ગંભીર વાવાઝોડાની ચેતવણી — તાત્કાલિક પાકા આશ્રયસ્થાનમાં જાઓ',
      threat: 'દરિયાકાંઠે ભયંકર વાવાઝોડું ત્રાટકવાની શક્યતા છે. ૧૩૦-૧૫૦ કિમી પ્રતિ કલાકની ઝડપે તોફાની પવન ફૂંકાશે. કાચા મકાનોને મોટું નુકસાન થઈ શકે છે.',
      actionableSteps: [
        'તરત જ નજીકના સરકારી વાવાઝોડા આશ્રયસ્થાનમાં પહોંચી જાઓ.',
        'દરિયાકાંઠે જવાનું બિલકુલ ટાળો, માછીમારો દરિયો ન ખેડે.',
        '૩ દિવસ માટે પીવાનું ચોખ્ખું પાણી, સૂકો ખોરાક અને ટોર્ચ તૈયાર રાખો.',
        'ઘરનું મેઈન પાવર સ્વિચ અને ગેસ સિલિન્ડર તરત બંધ કરો.'
      ],
      smsText: '🚨 [NDMA ગુજરાત] ભયંકર વાવાઝોડાની ચેતવણી! તાત્કાલિક સુરક્ષિત આશ્રયસ્થાને પહોંચો. દરિયાકિનારે ન જાઓ. હેલ્પલાઇન: 112 / 1070',
      whatsappHeader: '🚨 *ગુજરાત રાજ્ય આપત્તિ વ્યવસ્થાપન સત્તામંડળ*',
      emergencyCallout: 'કંટ્રોલ રૂમ હેલ્પલાઇન: 112, 1070',
      audioAnnouncement: 'ધ્યાન આપો, આ એક કટોકટી ચેતવણી છે. વિનાશક વાવાઝોડું આવી રહ્યું છે, બધા નાગરિકો સલામત પાકા મકાનોમાં આશ્રય લે.'
    },
    kn: {
      hazardLabel: 'ತೀವ್ರ ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆ',
      title: 'ತೀವ್ರ ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆ — ತಕ್ಷಣವೇ ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ತೆರಳಿ',
      threat: 'ಕರಾವಳಿಗೆ ತೀವ್ರ ಚಂಡಮಾರುತ ಅಪ್ಪಳಿಸಲಿದೆ. ಗಂಟೆಗೆ 130–150 ಕಿ.ಮೀ ವೇಗದಲ್ಲಿ ಬಿರುಗಾಳಿ ಮತ್ತು ಧಾರಾಕಾರ ಮಳೆ ಸುರಿಯಲಿದೆ. ಅಪಾಯಕಾರಿ ಪರಿಸ್ಥಿತಿ.',
      actionableSteps: [
        'ಕೂಡಲೇ ಹತ್ತಿರದ ಕಾಂಕ್ರೀಟ್ ಚಂಡಮಾರುತ ಆಶ್ರಯ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಿ.',
        'ಸಮುದ್ರ ತೀರ ಮತ್ತು ನದಿಗಳ ಬಳಿ ಹೋಗಬೇಡಿ. ಮನೆಯಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿರಿ.',
        '3 ದಿನಗಳಿಗೆ ಸಾಕಾಗುವ ಕುಡಿಯುವ ನೀರು, ಒಣ ಆಹಾರ, ಟಾರ್ಚ್ ಸಿದ್ಧವಾಗಿಡಿ.',
        'ಮುಖ್ಯ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಮತ್ತು ಅಡುಗೆ ಅನಿಲ ಸಿಲಿಂಡರ್ ಬಂದ್ ಮಾಡಿ.'
      ],
      smsText: '🚨 [NDMA ಎಚ್ಚರಿಕೆ] ತೀವ್ರ ಚಂಡಮಾರುತ ಮುನ್ನೆಚ್ಚರಿಕೆ! ತಕ್ಷಣವೇ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ತಾಣಕ್ಕೆ ತೆರಳಿ. ಸಮುದ್ರಕ್ಕೆ ಇಳಿಯಬೇಡಿ. ಸಹಾಯವಾಣಿ: 112 / 1070',
      whatsappHeader: '🚨 *ಕರ್ನಾಟಕ ರಾಜ್ಯ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ*',
      emergencyCallout: 'ತುರ್ತು ಸಹಾಯವಾಣಿ: 112, 1070',
      audioAnnouncement: 'ಗಮನಿಸಿ! ತೀವ್ರ ಚಂಡಮಾರುತ ಅಪ್ಪಳಿಸುತ್ತಿದೆ. ಎಲ್ಲ ನಾಗರಿಕರು ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಸ್ಥಳಗಳಿಗೆ ತೆರಳಲು ವಿನಂತಿಸಲಾಗಿದೆ.'
    },
    ml: {
      hazardLabel: 'തീവ്ര ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ്',
      title: 'അതീവ ഗുരുതര ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ് — സുരക്ഷിത കേന്ദ്രങ്ങളിലേക്ക് മാറുക',
      threat: 'തീരദേശത്തേക്ക് അതിശക്തമായ ചുഴലിക്കാറ്റ് അടുക്കുന്നു. മണിക്കൂറിൽ 130–150 കി.മീ വേഗത്തിൽ കാറ്റും അതിതീവ്ര മഴയും ഉണ്ടാകും.',
      actionableSteps: [
        'ഉടൻ തന്നെ അടുത്തുള്ള സൈക്ലോൺ റിലീഫ് ക്യാമ്പിലേക്ക് മാറുക.',
        'കടൽത്തീരത്തേക്കും പുഴക്കരയിലേക്കും പോകരുത്. കടലിൽ ഇറങ്ങരുത്.',
        '3 ദിവസത്തേക്ക് കുടിവെള്ളം, ഉണങ്ങിയ ഭക്ഷണം, ടോർച്ച് എന്നിവ കരുതുക.',
        'വീട്ടിലെ മെയിൻ സ്വിച്ചും ഗ്യാസ് സിലിണ്ടറും ഓഫ് ചെയ്യുക.'
      ],
      smsText: '🚨 [NDMA മുന്നറിയിപ്പ്] അതിതീവ്ര ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ്! ഉടനടി ദുരിതാശ്വാಸ ക്യാമ്പിലേക്ക് മാറുക. എമർജൻസി നമ്പർ: 112 / 1070',
      whatsappHeader: '🚨 *കേരള സംസ്ഥാന ദുരന്ത നിവാരണ അതോറിറ്റി*',
      emergencyCallout: 'അടിയന്തര സഹായത്തിന്: 112, 1070',
      audioAnnouncement: 'ശ്രദ്ധിക്കുക! അതിതീവ്ര ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ് പുറപ്പെടുവിച്ചിരിക്കുന്നു. എല്ലാവരും ഉടൻ സുരക്ഷിത കേന്ദ്രങ്ങളിലേക്ക് മാറുക.'
    },
    as: {
      hazardLabel: 'ভয়ংকৰ ধুমুহা-ঘূৰ্ণীবতাহ',
      title: 'অতি ভয়ংকৰ ঘূৰ্ণীবতাহৰ সতৰ্কবাণী — অবিলম্বে নিৰাপদ আশ্ৰয়লৈ যাওক',
      threat: 'উপকূলত ভয়ংকৰ ঘূৰ্ণীবতাহ আছাৰ খাই পৰাৰ সম্ভাৱনা। প্ৰচণ্ড বতাহ আৰু ধাৰাসাৰ বৰষুণৰ ফলত গছ-গছনি আৰু বিজুলীৰ খুঁটা ভাঙিব পাৰে।',
      actionableSteps: [
        'পলম নকৰি ওচৰৰ পকী আশ্ৰয় শিবিৰলৈ যাওক।',
        'নদী আৰু জলাশয়ৰ কাষৰ পৰা আঁতৰি থাকক।',
        '৩ দিনৰ বাবে খোৱাপানী, শুকান খাদ্য আৰু টৰ্চ সংগ্ৰহ কৰি ৰাখক।',
        'ঘৰৰ বিজুলী সংযোগ আৰু গেছ ছিলিণ্ডাৰ বন্ধ কৰক।'
      ],
      smsText: '🚨 [NDMA অসম] ভয়ংকৰ ধুমুহাৰ সতৰ্কতা! অনতিপলমে সুৰক্ষিত আশ্ৰয়লৈ যাওক। নদীৰ পাৰলৈ নাযাব। হেল্পলাইন: ১১২ / ১০৭০',
      whatsappHeader: '🚨 *অসম ৰাজ্যিক দুৰ্যোগ ব্যৱস্থাপনা কৰ্তৃপক্ষ*',
      emergencyCallout: 'জৰুৰীকালীন যোগাযোগ: ১১২, ১০৭০',
      audioAnnouncement: 'মনোযোগ দিয়ক! অতি ভয়ংকৰ ঘূৰ্ণীবতাহৰ আগমন ঘটিছে। সকলো ৰাইজে পলম নকৰি সুৰক্ষিত আশ্ৰয় স্থানলৈ যাওক।'
    },
    pa: {
      hazardLabel: 'ਭਿਆਨਕ ਚੱਕਰਵਾਤੀ ਤੂਫ਼ਾਨ',
      title: 'ਅਤਿ ਗੰਭੀਰ ਤੂਫ਼ਾਨ ਦੀ ਚੇਤਾਵਨੀ — ਤੁਰੰਤ ਪੱਕੇ ਸ਼ੈਲਟਰਾਂ ਵਿੱਚ ਜਾਓ',
      threat: 'ਤੇਜ਼ ਚੱਕਰਵਾਤੀ ਤੂਫ਼ਾਨ ਦਾ ਕਹਿਰ। 130–150 ਕਿਲੋਮੀਟਰ ਪ੍ਰਤੀ ਘੰਟਾ ਦੀ ਰਫ਼ਤਾਰ ਨਾਲ ਵਿਨਾਸ਼ਕਾਰੀ ਹਵਾਵਾਂ ਅਤੇ ਭਾਰੀ ਮੀਂਹ ਪਵੇਗਾ।',
      actionableSteps: [
        'ਤੁਰੰਤ ਆਪਣੇ ਨਜ਼ਦੀਕੀ ਪੱਕੇ ਆਫ਼ਤ ਸ਼ੈਲਟਰ ਵਿੱਚ ਪਹੁੰਚੋ।',
        'ਦਰਿਆਵਾਂ ਅਤੇ ਸਮੁੰਦਰ ਤੱਟਾਂ ਤੋਂ ਪੂਰੀ ਤਰ੍ਹਾਂ ਦੂਰ ਰਹੋ।',
        '3 ਦਿਨਾਂ ਲਈ ਪੀਣ ਦਾ ਸਾਫ਼ ਪਾਣੀ, ਸੁੱਕਾ ਰਾਸ਼ਨ ਅਤੇ ਟਾਰਚ ਤਿਆਰ ਰੱਖੋ।',
        'ਘਰ ਦਾ ਮੇਨ ਬਿਜਲੀ ਸਵਿੱਚ ਅਤੇ ਗੈਸ ਸਿਲੰਡਰ ਬੰਦ ਕਰੋ।'
      ],
      smsText: '🚨 [NDMA ਚੇਤਾਵਨੀ] ਭਿਆਨਕ ਤੂਫ਼ਾਨ ਦੀ ਚੇਤਾਵਨੀ! ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਸ਼ੈਲਟਰ ਵੱਲ ਜਾਓ। ਹੈਲਪਲਾਈਨ: 112 / 1070',
      whatsappHeader: '🚨 *ਪੰਜਾਬ ਆਫ਼ਤ ਪ੍ਰਬੰਧਨ ਅਥਾਰਟੀ*',
      emergencyCallout: 'ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ: 112, 1070',
      audioAnnouncement: 'ਧਿਆਨ ਦਿਓ! ਅਤਿ ਗੰਭੀਰ ਤੂਫ਼ਾਨ ਦੀ ਚੇਤਾਵਨੀ ਜਾਰੀ ਕੀਤੀ ਗਈ ਹੈ। ਸਾਰੇ ਲੋਕ ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਥਾਵਾਂ ਉੱਤੇ ਪਹੁੰਚਣ।'
    },
    en: {
      hazardLabel: 'Severe Cyclonic Storm',
      title: 'SEVERE CYCLONE WARNING — Evacuate to Concrete Shelter Immediately',
      threat: 'Extremely dangerous cyclonic storm approaching coastline. Destructive winds of 130–150 km/h and intense rainfall expected. High risk of structural damage and storm surge.',
      actionableSteps: [
        'Move immediately to your nearest concrete Cyclone Shelter or pucca building.',
        'Stay far away from sea beaches, riverbanks, and open coastal water.',
        'Keep 3 days of clean drinking water, ready-to-eat dry rations, and charged torches.',
        'Turn off the main electrical breaker and LPG cylinders immediately.'
      ],
      smsText: '🚨 [NDMA Emergency Alert] Severe Cyclone warning! Move to nearest concrete shelter immediately. Stay clear of coast. Helpline: 112 / 1070',
      whatsappHeader: '🚨 *NATIONAL DISASTER MANAGEMENT AUTHORITY — EMERGENCY BULLETIN*',
      emergencyCallout: 'Emergency Helplines: 112 (National Unified), 1070 (State EOC Control Room)',
      audioAnnouncement: 'Attention please. This is an urgent disaster warning. A severe cyclone is approaching your location. Please evacuate to the nearest safe shelter immediately.'
    }
  },

  flood: {
    or: {
      hazardLabel: 'ହଠାତ୍ ବନ୍ୟା ଓ ଜଳମଗ୍ନ',
      title: 'ହଠାତ୍ ପ୍ରଳୟଙ୍କରୀ ବନ୍ୟା ସତର୍କତା — ତୁରନ୍ତ ଉଚ୍ଚ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ',
      threat: 'ନଦୀରେ ବନ୍ୟା ଜଳ ଦ୍ରୁତ ଗତିରେ ବିପଦ ସଙ୍କେତ ଟପି ବୃଦ୍ଧି ପାଉଛି। ତଳିଆ ଅଞ୍ଚଳ ଓ ରାସ୍ତାଘାଟ ଜଳମଗ୍ନ ହୋଇଯିବ। ପ୍ରବଳ ସ୍ରୋତରେ ଭାସିଯିବା ଆଶଙ୍କା।',
      actionableSteps: [
        'ତୁରନ୍ତ ପକ୍କା ଉଚ୍ଚ କୋଠା କିମ୍ବା ଉଚ୍ଚ ବନ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଚାଲିଯାଆନ୍ତୁ।',
        'ପାଣି ପ୍ରବାହରେ କଦାପି ଚାଲନ୍ତୁ ନାହିଁ କି ଗାଡ଼ି ଚଳାନ୍ତୁ ନାହିଁ।',
        'ଗୃହପାଳିତ ପଶୁଙ୍କୁ ବାନ୍ଧି ନରଖି ଦଉଡ଼ି ଖୋଲି ଉଚ୍ଚ ସ୍ଥାନକୁ ଛାଡ଼ି ଦିଅନ୍ତୁ।',
        'ପିଇବା ପାଣି ଫୁଟାଇ ପିଅନ୍ତୁ ଓ ଜରୁରୀ କାଗଜପତ୍ର ପଲିଥିନ୍ରେ ସୁରକ୍ଷିତ ରଖନ୍ତୁ।'
      ],
      smsText: '🚨 [NDMA-ଓଡ଼ିଶା ବନ୍ୟା ସତର୍କତା] ନଦୀରେ ବନ୍ୟା ଜଳ ଦ୍ରୁତ ବୃଦ୍ଧି! ତୁରନ୍ତ ଉଚ୍ଚ ସ୍ଥାନ ବା ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ। ପ୍ରବାହିତ ପାଣିରେ ଚାଲନ୍ତୁ ନାହିଁ। ହେଲ୍ପଲାଇନ: ୧୧୨ / ୧୦୭୦',
      whatsappHeader: '🚨 *ଓଡ଼ିଶା ରାଜ୍ୟ ବନ୍ୟା ନିୟନ୍ତ୍ରଣ କକ୍ଷ ସତର୍କତା*',
      emergencyCallout: 'ଜରୁରୀ ସହାୟତା: ୧୧୨, ୧୦୭୦',
      audioAnnouncement: 'ଜରୁରୀକାଳୀନ ସତର୍କତା! ନଦୀରେ ବନ୍ୟା ପାଣି ବିପଦଜନକ ଭାବେ ବଢ଼ୁଛି। ସମସ୍ତେ ତୁରନ୍ତ ଉଚ୍ଚ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ।'
    },
    hi: {
      hazardLabel: 'आकस्मिक बाढ़ की गंभीर चेतावनी',
      title: 'आकस्मिक बाढ़ की गंभीर चेतावनी — तुरंत ऊंचे सुरक्षित स्थानों पर जाएं',
      threat: 'नदियों का जलस्तर खतरे के निशान को पार कर रहा है। निचले इलाके और गांव जलमग्न हो रहे हैं। पानी के तेज बहाव में बहने का भारी खतरा।',
      actionableSteps: [
        'तुरंत ऊंचे स्थानों, स्कूल या पक्के मकानों की छत पर चले जाएं।',
        'बहते हुए बाढ़ के पानी में पैदल या वाहन से जाने की गलती न करें।',
        'मवेशियों की रस्सियां खोल दें ताकि वे ऊंचे स्थान पर जा सकें।',
        'पीने के पानी को उबालकर पिएं और जरूरी दस्तावेज वाटरप्रूफ बैग में रखें।'
      ],
      smsText: '🚨 [NDMA बाढ़ चेतावनी] नदियों में भारी बाढ़! तुरंत ऊंचे स्थानों पर जाएं। बहते पानी में न उतरें। आपातकालीन हेल्पलाइन: 112 / 1070',
      whatsappHeader: '🚨 *राष्ट्रीय आपदा प्रबंधन प्राधिकरण — बाढ़ चेतावनी*',
      emergencyCallout: 'आपातकालीन हेल्पलाइन: 112 / 1070',
      audioAnnouncement: 'ध्यान दें! आपके इलाके में अचानक बाढ़ का भारी खतरा उत्पन्न हो गया है। कृपया तुरंत सुरक्षित ऊंचे स्थानों पर चले जाएं।'
    },
    bn: {
      hazardLabel: 'আকস্মিক বন্যা সতর্কতা',
      title: 'আকস্মিক বন্যা সতর্কতা — দ্রুত উঁচু নিরাপদ স্থানে আশ্রয় নিন',
      threat: 'নদীর জল দ্রুত বিপদসীমা অতিক্রম করছে। প্লাবিত অঞ্চল থেকে অবিলম্বে সরে যান। তীব্র স্রোতের কারণে দুর্ঘটনা ঘটার আশঙ্কা।',
      actionableSteps: [
        'অবিলম্বে নিরাপদ উঁচু ভবনে বা বাঁধের ওপর পাকা আশ্রয়ে যান।',
        'প্রবাহিত বন্যার জলে হাঁটার বা গাড়ি চালানোর চেষ্টা করবেন না।',
        'গবাদি পশুর বাঁধন খুলে দিন যাতে তারা উঁচুতে যেতে পারে।',
        'জল ফুটিয়ে খান এবং প্রয়োজনীয় ওষুধ সাথে রাখুন।'
      ],
      smsText: '🚨 [NDMA বন্যা সতর্কতা] নদীর জল বিপদসীমা পার করেছে! অবিলম্বে উঁচু নিরাপদ স্থানে চলে যান। জরুরি নম্বর: ১১২ / ১০৭০',
      whatsappHeader: '🚨 *পশ্চিমবঙ্গ বন্যা নিয়ন্ত্রণ জরুরি সতর্কতা*',
      emergencyCallout: 'জরুরি হেল্পলাইন: ১১২ / ১০৭০',
      audioAnnouncement: 'সতর্কতা! নদীর জলস্তর আশঙ্কাজনকভাবে বৃদ্ধি পাচ্ছে। অবিলম্বে সুরক্ষিত উঁচু স্থানে আশ্রয় নিন।'
    },
    ta: {
      hazardLabel: 'திடீர் வெள்ள அபாயம்',
      title: 'திடீர் வெள்ள அபாய எச்சரிக்கை — உடனடியாக மேடான இடத்திற்கு செல்லவும்',
      threat: 'ஆறுகளில் நீர்மட்டம் அபாய அளவைத் தாண்டியுள்ளது. தாழ்வான பகுதிகள் மூழ்கும் அபாயம். வெள்ள நீரில் யாரும் செல்ல வேண்டாம்.',
      actionableSteps: [
        'உடனடியாக மேடான பகுதிகள் அல்லது நிவாரண முகாம்களுக்கு செல்லவும்.',
        'ஓடும் வெள்ள நீரில் நடக்கவோ வாகனங்களை ஓட்டவோ வேண்டாம்.',
        'கால்நடைகளின் கயிறுகளை அவிழ்த்து மேடான பகுதிக்கு அனுப்பவும்.',
        'காய்ச்சி வடிகட்டிய நீரையே பருகவும்.'
      ],
      smsText: '🚨 [NDMA வெள்ள எச்சரிக்கை] ஆறுகளில் அபாய வெள்ளப்பெருக்கு! உடனடியாக மேடான பகுதிக்கு செல்லவும். உதவிக்கு: 112 / 1070',
      whatsappHeader: '🚨 *தமிழ்நாடு பேரிடர் மேலாண்மை வெள்ள எச்சரிக்கை*',
      emergencyCallout: 'உதவி எண்: 112, 1070',
      audioAnnouncement: 'எச்சரிக்கை! திடீர் வெள்ள அபாயம் ஏற்பட்டுள்ளது. அனைவரும் உடனடியாக மேடான பாதுகாப்பான இடத்திற்கு செல்லவும்.'
    },
    te: {
      hazardLabel: 'ఆకస్మిక వరద హెచ్చరిక',
      title: 'ఆకస్మిక వరద తీవ్ర హెచ్చరిక — వెంటనే ఎత్తైన ప్రదేశాలకు వెళ్లండి',
      threat: 'వరద నీరు వేగంగా ముంచెత్తుతోంది. లోతట్టు ప్రాంతాలు ప్రమాదకరంగా నీటమునుగుతున్నాయి. తీవ్ర ప్రవాహంలో కొట్టుకుపోయే ప్రమాదం.',
      actionableSteps: [
        'వెంటనే ఎత్తైన ప్రాంతాలు లేదా పునరావాస కేంద్రాలకు చేరుకోండి.',
        'ప్రవహించే వరద నీటిలో నడవడానికి లేదా వాహనాలు నడపడానికి ప్రయత్నించవద్దు.',
        'పశువుల తాళ్లను విప్పి వాటిని ఎత్తైన ప్రదేశాలకు పంపండి.',
        'కాచి చల్లార్చిన నీటిని మాత్రమే తాగండి.'
      ],
      smsText: '🚨 [NDMA వరద హెచ్చరిక] నదుల్లో వరద ఉధృతి! వెంటనే ఎత్తైన ప్రాంతాలకు వెళ్లండి. హెల్ప్‌లైన్: 112 / 1070',
      whatsappHeader: '🚨 *రాష్ట్ర విపత్తు నిర్వహణ వరద హెచ్చరిక*',
      emergencyCallout: 'హెల్ప్‌లైన్: 112, 1070',
      audioAnnouncement: 'అత్యవసర వరద హెచ్చరిక! నీటి ప్రవాహం వేగంగా పెరుగుతోంది. వెంటనే ఎత్తైన ప్రాంతాలకు తరలివెళ్లండి.'
    },
    mr: {
      hazardLabel: 'अचानक महापूर इशारा',
      title: 'अचानक महापूर इशारा — तातडीने उंच सुरक्षित ठिकाणी स्थળાंतर करा',
      threat: 'नद्यांची पाणीपातळी धोक्याची पातळी ओलांडत आहे. सखल भागांमध्ये पाणी शिरण्याची शक्यता. पाण्याच्या प्रवाहात वाहून जाण्याचा धोका.',
      actionableSteps: [
        'तातडीने उंचावरील इमारतीत किंवा सरकारी निवारा केंद्रात जा.',
        'वाहत्या पुराच्या पाण्यात चालण्याचा किंवा गाडी चालवण्याचा प्रयत्न करू नका.',
        'जनावरांना दोरीतून मोकळे करा जेणेकरून ती उंचावर जाऊ शकतील.',
        'पाणी उकळून प्या आणि कोरडे अन्न सोबत ठेवा.'
      ],
      smsText: '🚨 [NDMA महापूर इशारा] नद्यांना पूर! तातडीने उंचावर सुरक्षित ठिकाणी जा. वाहत्या पाण्यात जाऊ नका. हेल्पलाइन: 112 / 1070',
      whatsappHeader: '🚨 *महाराष्ट्र पूर नियंत्रण आपत्कालीन कक्ष*',
      emergencyCallout: 'आपत्कालीन संपर्क: 112, 1070',
      audioAnnouncement: 'सावधान! पुराचे पाणी वेगाने वाढत आहे. सर्व नागरिकांनी त्वरित उंच ठिकाणी स्थलांतर करावे.'
    },
    en: {
      hazardLabel: 'Flash Flood Emergency',
      title: 'FLASH FLOOD EMERGENCY — Evacuate to High Ground Immediately',
      threat: 'Rivers and drainage channels are overflowing hazard limits. Rapid inundation of low-lying urban sectors and coastal basins in progress.',
      actionableSteps: [
        'Move to higher ground, sturdy reinforced upper floors, or relief camps immediately.',
        'Never walk, swim, or drive into swift floodwaters.',
        'Untie livestock so they can climb to safety.',
        'Boil all drinking water or use water purification tablets.'
      ],
      smsText: '🚨 [NDMA Flood Alert] Flash flood danger! Move to high ground immediately. Never drive into flood waters. Call: 112 / 1070',
      whatsappHeader: '🚨 *CENTRAL FLOOD CONTROL ROOM EMERGENCY ALERT*',
      emergencyCallout: 'Emergency Helpline: 112, 1070',
      audioAnnouncement: 'Attention! Flash flood warning active in your zone. Move to high ground immediately.'
    }
  },

  thunderstorm: {
    hi: {
      hazardLabel: 'भीषण आंधी-तूफान व वज्रपात',
      title: 'भीषण आंधी-तूफान व बिजली गिरने की चेतावनी — पक्के मकान के अंदर रहें',
      threat: 'भयंकर गरज-चमक के साथ आकाशीय बिजली (Lightning) गिरने और 60–80 किमी/घंटा की गति से आंधी चलने की प्रबल संभावना। जानलेवा बिजली गिरने का खतरा।',
      actionableSteps: [
        'पेड़ों के नीचे, धातु के खंभों या खुले मैदान में बिल्कुल न खड़े हों।',
        'तुरंत पक्के कमरे के अंदर चले जाएं और खिड़कियों-दरवाजों से दूर रहें।',
        'बिजली के उपकरणों का प्लग निकाल दें और मोबाइल चार्जिंग बंद करें।',
        'खेतों में काम कर रहे किसान तुरंत सुरक्षित पक्के भवन में शरण लें।'
      ],
      smsText: '🚨 [NDMA वज्रपात चेतावनी] भारी बिजली गिरने की आशंका! खुले मैदान या पेड़ के नीचे न रहें। तुरंत पक्के मकान में जाएं। सहायता: 112',
      whatsappHeader: '🚨 *वज्रपात व आंधी-तूफान तत्काल चेतावनी*',
      emergencyCallout: 'हेल्पलाइन: 112',
      audioAnnouncement: 'सावधान! आपके क्षेत्र में भारी आकाशीय बिजली गिरने का खतरा है। कृपया खुले में या पेड़ों के नीचे न खड़े रहें।'
    },
    or: {
      hazardLabel: 'ଭୟଙ୍କର ବଜ୍ରପାତ ଓ କାଳବୈଶାଖୀ',
      title: 'ପ୍ରଚଣ୍ଡ ବଜ୍ରପାତ ଓ ଝଡ଼ବର୍ଷା ସତର୍କତା — ତୁରନ୍ତ ଘର ଭିତରେ ରୁହନ୍ତୁ',
      threat: 'ପ୍ରବଳ ବେଗରେ ଝଡ଼ ପବନ ଓ ଭୟଙ୍କର ବଜ୍ରପାତ ଆଶଙ୍କା। ଖୋଲା ସ୍ଥାନ କିମ୍ବା ଗଛ ତଳେ ରହିବା ଜୀବନ ପ୍ରତି ବିପଦ।',
      actionableSteps: [
        'କଦାପି ଖୋଲା ପଡ଼ିଆ କିମ୍ବା ଡେଙ୍ଗା ଗଛ ତଳେ ଆଶ୍ରୟ ନିଅନ୍ତୁ ନାହିଁ।',
        'ତୁରନ୍ତ ପକ୍କା ଘର ଭିତରକୁ ଚାଲିଯାଆନ୍ତୁ ଏବଂ କବାଟ-ଝରକା ବନ୍ଦ ରଖନ୍ତୁ।',
        'ବିଦ୍ୟୁତ୍ ଉପକରଣ ବନ୍ଦ କରନ୍ତୁ ଓ ଫୋନ୍ ଚାର୍ଜିଂରୁ ବାହାର କରିଦିଅନ୍ତୁ।',
        'ନଦୀ, ପୋଖରୀ ବା ପାଣି ଭିତରୁ ତୁରନ୍ତ ବାହାରି ଆସନ୍ତୁ।'
      ],
      smsText: '🚨 [NDMA ବଜ୍ରପାତ ସତର୍କତା] ପ୍ରଚଣ୍ଡ ବଜ୍ରପାତ ଆଶଙ୍କା! ଗଛ ତଳେ ବା ଖୋଲାରେ ରୁହନ୍ତୁ ନାହିଁ। ପକ୍କା ଘରେ ରୁହନ୍ତୁ। ସହାୟତା: ୧୧୨',
      whatsappHeader: '🚨 *ଓଡ଼ିଶା ବଜ୍ରପାତ ସତର୍କତା ବୁଲେଟିନ୍*',
      emergencyCallout: 'ଜରୁରୀ ସହାୟତା: ୧୧୨',
      audioAnnouncement: 'ସତର୍କ ରୁହନ୍ତୁ! ପ୍ରବଳ ବଜ୍ରପାତ ହେବାର ସମ୍ଭାବନା ଅଛି। କେହି ମଧ୍ୟ ଗଛ ତଳେ କିମ୍ବା ଖୋଲା ସ୍ଥାନରେ ଠିଆ ହୁଅନ୍ତୁ ନାହିଁ।'
    },
    en: {
      hazardLabel: 'Severe Thunderstorm & Lightning',
      title: 'SEVERE THUNDERSTORM & LIGHTNING STRIKE ALERT — Seek Indoor Shelter',
      threat: 'Violent thunderstorms with frequent deadly cloud-to-ground lightning strikes and gusts up to 75 km/h occurring in your sector.',
      actionableSteps: [
        'Do not take shelter under solitary trees, tin sheds, or metal poles.',
        'Stay indoors inside a fully enclosed concrete building.',
        'Unplug sensitive electronic devices; avoid using wired corded telephones.',
        'If caught in an open field, squat low on the balls of your feet with head down.'
      ],
      smsText: '🚨 [NDMA Thunderstorm Alert] Severe lightning strike hazard! Do not stand under trees. Stay indoors inside pucca structure. Call: 112',
      whatsappHeader: '🚨 *IMD / NDMA SEVERE THUNDERSTORM ADVISORY*',
      emergencyCallout: 'Emergency Helpline: 112',
      audioAnnouncement: 'Severe lightning alert! Stay indoors and avoid tall trees or open fields.'
    }
  },

  heatwave: {
    hi: {
      hazardLabel: 'भीषण लू व हीटवेव प्रकोप',
      title: 'घातक हीटवेव (लू) की रेड अलर्ट चेतावनी — दोपहर में बाहर निकलने से बचें',
      threat: 'तापमान 44°C से 46°C के पार पहुंच रहा है। गर्म झुलसाने वाली लू से हीट स्ट्रोक और डिहाइड्रेशन का अत्यधिक खतरा है।',
      actionableSteps: [
        'दोपहर 12:00 से 4:00 बजे के बीच धूप में बाहर निकलने से बचें।',
        'पर्याप्त मात्रा में पानी, नींबू पानी, छाछ और ओआरएस (ORS) का सेवन करें।',
        'हल्के रंग के ढीले सूती कपड़े पहनें और सिर को गीले कपड़े या गमछे से ढकें।',
        'बच्चों और बुजुर्गों को सीधी धूप और बंद गाड़ियों में अकेला न छोड़ें।'
      ],
      smsText: '🚨 [NDMA हीटवेव अलर्ट] भीषण लू का प्रकोप! दोपहर 12 से 4 धूप में न निकलें। खूब पानी व ORS पिएं। तबीयत बिगड़ने पर 108 डायल करें।',
      whatsappHeader: '🚨 *गंभीर लू (Heatwave) स्वास्थ्य चेतावनी*',
      emergencyCallout: 'एम्बुलेंस हेल्पलाइन: 108, आपातकालीन: 112',
      audioAnnouncement: 'ध्यान दें! भीषण गर्मी और लू का प्रकोप जारी है। दोपहर के समय धूप में न निकलें और अधिक से अधिक पानी पिएं।'
    },
    en: {
      hazardLabel: 'Extreme Heatwave Warning',
      title: 'EXTREME HEATWAVE RED ALERT — Avoid Direct Sun Exposure',
      threat: 'Dangerous ambient temperatures exceeding 45°C with severe scorching winds. High vulnerability to fatal heatstroke.',
      actionableSteps: [
        'Avoid outdoor exposure between 12:00 PM and 4:00 PM.',
        'Drink plenty of oral rehydration fluids, buttermilk, and water regularly.',
        'Wear loose lightweight cotton garments and cover head with cloth or umbrella.',
        'Never leave infants, elderly, or pets inside parked vehicles.'
      ],
      smsText: '🚨 [NDMA Heatwave Alert] Severe heatwave red alert! Avoid direct sun 12-4pm. Drink ORS and fluids. Ambulance: 108 / 112',
      whatsappHeader: '🚨 *HEATWAVE RED ALERT HEALTH ADVISORY*',
      emergencyCallout: 'Emergency Ambulance: 108, Control: 112',
      audioAnnouncement: 'Extreme heatwave warning in effect. Stay hydrated and avoid sun exposure between 12 and 4 PM.'
    }
  },

  wind: {
    ta: {
      hazardLabel: 'பலத்த சூறாவளிக் காற்று',
      title: 'பலத்த காற்று எச்சரிக்கை — மீனவர்கள் கடலுக்கு செல்ல வேண்டாம்',
      threat: 'கடற்கரையோரம் மணிக்கு 50–70 கி.மீ வேகத்தில் பலத்த காற்று வீசக்கூடும். கடல் சீற்றமாக காணப்படும்.',
      actionableSteps: [
        'மீனவர்கள் எக்காரணம் கொண்டும் கடலுக்குள் செல்ல வேண்டாம்.',
        'பழைய மரங்கள் மற்றும் மின்கம்பங்கள் அருகே நிற்பதை தவிர்க்கவும்.',
        'படகு மற்றும் வலைகளை பாதுகாப்பான இடத்திற்கு கொண்டு செல்லவும்.',
        'வீட்டின் கதவு மற்றும் ஜன்னல்களை பலமாக பூட்டி வைக்கவும்.'
      ],
      smsText: '🚨 [NDMA காற்று எச்சரிக்கை] பலத்த காற்று வீசக்கூடும்! மீனவர்கள் கடலுக்கு செல்ல வேண்டாம். உதவி எண்: 112',
      whatsappHeader: '🚨 *தமிழ்நாடு பலத்த காற்று மற்றும் கடல் சீற்ற எச்சரிக்கை*',
      emergencyCallout: 'அவசர எண்: 112',
      audioAnnouncement: 'பலத்த காற்று எச்சரிக்கை! மீனவர்கள் யாரும் கடலுக்கு செல்ல வேண்டாம் என அறிவுறுத்தப்படுகிறார்கள்.'
    },
    hi: {
      hazardLabel: 'तेज आंधी व विनाशकारी हवाएं',
      title: 'तेज आंधी व प्रचंड हवाओं की चेतावनी — कमजोर ढांचों से दूर रहें',
      threat: 'हवा की गति 50–75 किमी/घंटा तक पहुंचने की संभावना है। कमजोर शेड, साइनबोर्ड और पेड़ गिरने का खतरा।',
      actionableSteps: [
        'कमजोर टीन शेड, होर्डिंग्स और पुराने पेड़ों के नीचे न खड़े हों।',
        'मछुआरों को समुद्र या गहरी नदियों में न जाने की सख्त सलाह दी जाती है।',
        'खिड़कियां और बालकनी के दरवाजे मजबूती से बंद रखें।'
      ],
      smsText: '🚨 [NDMA आंधी चेतावनी] 50-70 किमी/घंटा की गति से तेज हवाएं! होर्डिंग्स व पेड़ों से दूर रहें। सहायता: 112',
      whatsappHeader: '🚨 *तेज आंधी व समुद्री तूफान चेतावनी*',
      emergencyCallout: 'हेल्पलाइन: 112',
      audioAnnouncement: 'तेज आंधी की चेतावनी जारी की गई है। कृपया पेड़ों और होर्डिंग्स से दूर सुरक्षित स्थानों पर रहें।'
    },
    en: {
      hazardLabel: 'Gale Wind Warning',
      title: 'STRONG GALE WIND WARNING — Fishermen Advised Not to Venture',
      threat: 'Squally winds reaching 55–75 km/h along coastal and inland zones. Rough sea conditions and high risk to temporary structures.',
      actionableSteps: [
        'Total suspension of maritime fishing and coastal small craft operations.',
        'Secure loose tin roofs, scaffolding, and commercial billboards.',
        'Stay indoors and park vehicles away from large trees or aged branches.'
      ],
      smsText: '🚨 [NDMA Wind Alert] Strong gale winds expected! Fishermen must not venture into sea. Helpline: 112',
      whatsappHeader: '🚨 *COASTAL GALE WARNING BULLETIN*',
      emergencyCallout: 'Helpline: 112',
      audioAnnouncement: 'Strong gale warning in effect. Fishermen are strictly advised not to venture into sea.'
    }
  }
};

/**
 * Generate a complete AI vernacular alert package for a given place, state, hazard, and language.
 */
// Vernacular dictionary for live weather conditions and descriptions
const VERNACULAR_LIVE_TERMS = {
  or: {
    station: 'ଭୁବନେଶ୍ୱର ପାଣିପାଗ କେନ୍ଦ୍ର ଲାଇଭ୍ ତଥ୍ୟ',
    title: (city, temp, cond) => `${city} ରିଅଲ-ଟାଇମ୍ ପାଣିପାଗ ସ୍ଥିତି — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `ଭୁବନେଶ୍ୱର ପାଣିପାଗ ବିଭାଗର ପ୍ରତ୍ୟକ୍ଷ ତଥ୍ୟ ଅନୁଯାୟୀ, ${city} ରେ ବର୍ତ୍ତମାନ ତାପମାତ୍ରା ${temp}°C ଏବଂ ${desc} ରହିଛି। ପବନର ବେଗ ଘଣ୍ଟାପ୍ରତି ${wind} କି.ମି. ଏବଂ ବାୟୁମଣ୍ଡଳୀୟ ଆର୍ଦ୍ରତା ${hum}% ରେକର୍ଡ କରାଯାଇଛି।${rain > 0 ? ` ବିଗତ ଏକ ଘଣ୍ଟାରେ ${rain} ମି.ମି. ବୃଷ୍ଟିପାତ ହୋଇଛି।` : ' ବର୍ତ୍ତମାନ ସ୍ଥିତି ସାଧାରଣ ଏବଂ ନିୟନ୍ତ୍ରଣାଧୀନ ଅଛି।' }`,
    steps: [
      'ପ୍ରତ୍ୟକ୍ଷ ପାଣିପାଗ ବୁଲେଟିନ୍ ଏବଂ ତାଜା ତଥ୍ୟ ଉପରେ ନଜର ରଖନ୍ତୁ।',
      'ଯଦି ହଠାତ୍ ପ୍ରବଳ ବର୍ଷା ବା ଝଡ଼ ପବନ ହୁଏ, ତେବେ ପକ୍କା ଛାତ ତଳେ ଆଶ୍ରୟ ନିଅନ୍ତୁ।',
      'ବିଜୁଳି ଚମକିବା ସମୟରେ ବିଦ୍ୟୁତ୍ ଖୁଣ୍ଟ କିମ୍ବା ଉଚ୍ଚ ଗଛ ନିକଟରୁ ଦୂରେଇ ରୁହନ୍ତୁ।',
      'ଜରୁରୀ ସହାୟତା ଏବଂ ପ୍ରଶ୍ନ ପାଇଁ ରାଜ୍ୟ ଡିଜାଷ୍ଟର କଣ୍ଟ୍ରୋଲ ରୁମ୍ ୧୧୨ / ୧୦୭୦ ଡାଏଲ କରନ୍ତୁ।'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD/NDMA ଲାଇଭ୍ ତଥ୍ୟ] ${city}: ତାପମାତ୍ରା ${temp}°C, ${desc}, ପବନ: ${wind} km/h, ଆର୍ଦ୍ରତା: ${hum}%। ଜରୁରୀ ସହାୟତା: ୧୧୨।`,
    whatsappHeader: '🌤️ *ଭାରତୀୟ ପାଣିପାଗ ବିଭାଗ — ଲାଇଭ୍ ରିଅଲ-ଟାଇମ୍ ବୁଲେଟିନ୍*',
    emergencyCallout: 'ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ: ୧୧୨ (ସର୍ବଭାରତୀୟ), ୧୦୭୦ (ରାଜ୍ୟ କଣ୍ଟ୍ରୋଲ ରୁମ୍)',
    audioAnnouncement: (city, temp, desc, wind) => `ଧ୍ୟାନ ଦିଅନ୍ତୁ, ଏହା ଓଡ଼ିଶା ଲାଇଭ୍ ପାଣିପାଗ ବୁଲେଟିନ୍। ${city} ରେ ବର୍ତ୍ତମାନ ତାପମାତ୍ରା ${temp} ଡିଗ୍ରୀ ସେଲସିୟସ ଏବଂ ${desc} ରହିଛି। ପବନର ବେଗ ଘଣ୍ଟାପ୍ରତି ${wind} କିଲୋମିଟର।`
  },
  hi: {
    station: 'मौसम विज्ञान केंद्र वास्तविक समय डेटा',
    title: (city, temp, cond) => `${city} रियल-टाइम मौसम स्थिति — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `मौसम विज्ञान केंद्र के सीधे सेंसर आंकड़ों के अनुसार, ${city} में वर्तमान तापमान ${temp}°C और स्थिति '${desc}' है। हवा की गति ${wind} किमी/घंटा और आर्द्रता ${hum}% दर्ज की गई है।${rain > 0 ? ` पिछले घंटे में ${rain} मिमी वर्षा दर्ज की गई है।` : ' वर्तमान में मौसमी परिस्थितियां स्थिर हैं।' }`,
    steps: [
      'स्थानीय मौसम बुलेटिन और आधिकारिक अपडेट पर नजर बनाए रखें।',
      'बारिश या तेज हवा के दौरान सुरक्षित इमारतों में शरण लें।',
      'बिजली गिरने की स्थिति में पेड़ों और धातु के खंभों से दूर रहें।',
      'आपातकालीन सहायता के लिए राष्ट्रीय हेल्पलाइन 112 / 1070 पर संपर्क करें।'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD/NDMA लाइव] ${city}: तापमान ${temp}°C, ${desc}, हवा: ${wind} km/h, नमी: ${hum}%। आपातकालीन सहायता: 112।`,
    whatsappHeader: '🌤️ *राष्ट्रीय मौसम व आपदा प्रबंधन प्राधिकरण — लाइव बुलेटिन*',
    emergencyCallout: 'आपातकालीन हेल्पलाइन: 112 (राष्ट्रीय), 1070 (राज्य नियंत्रण कक्ष)',
    audioAnnouncement: (city, temp, desc, wind) => `ध्यान दें, यह राष्ट्रीय मौसम सेवा का लाइव बुलेटिन है। ${city} में वर्तमान तापमान ${temp} डिग्री सेल्सियस और ${desc} है। हवा की गति ${wind} किलोमीटर प्रति घंटा है।`
  },
  bn: {
    station: 'আবহাওয়া দপ্তর লাইভ পর্যবেক্ষণ',
    title: (city, temp, cond) => `${city} রিয়েল-টাইম আবহাওয়া বুলেটিন — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `আবহাওয়া দপ্তরের লাইভ সেন্সর অনুযায়ী, ${city}-তে বর্তমান তাপমাত্রা ${temp}°C এবং আবহাওয়া '${desc}'। বাতাসের গতিবেগ ঘণ্টায় ${wind} কিমি এবং আর্দ্রতা ${hum}%।${rain > 0 ? ` বিগত এক ঘণ্টায় ${rain} মিমি বৃষ্টিপাত হয়েছে।` : ' সামগ্রিক পরিস্থিতি আপাতত নিয়ন্ত্রণে রয়েছে।' }`,
    steps: [
      'আবহাওয়ার নিয়মিত আপডেট ও স্থানীয় খবরের প্রতি নজর রাখুন।',
      'ভারী বৃষ্টি বা ঝড়ের সময় পাকা বাড়িতে নিরাপদে থাকুন।',
      'বিদ্যুৎ চমকানোর সময় খোলা মাঠ বা গাছপালা থেকে দূরে থাকুন।',
      'যেকোনো জরুরি প্রয়োজনে রাজ্য কন্ট্রোল রুম ১১২ / ১০৭০ নম্বরে ফোন করুন।'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD/NDMA লাইভ] ${city}: তাপমাত্রা ${temp}°C, ${desc}, বাতাস: ${wind} km/h, আর্দ্রতা: ${hum}%। হেল্পলাইন: ১১২।`,
    whatsappHeader: '🌤️ *আবহাওয়া দপ্তর জরুরি তথ্য পরিষেবা — লাইভ বুলেটিন*',
    emergencyCallout: 'জরুরি হেল্পলাইন: ১১২ (জাতীয় নম্বর), ১০৭০ (রাজ্য বিপর্যয় নিয়ন্ত্রণ)',
    audioAnnouncement: (city, temp, desc, wind) => `মনোযোগ দিন, এটি আবহাওয়া দপ্তরের লাইভ বার্তা। ${city}-তে বর্তমান তাপমাত্রা ${temp} ডিগ্রি সেলসিয়াস এবং ${desc}। বাতাসের গতি ঘণ্টায় ${wind} কিলোমিটার।`
  },
  ta: {
    station: 'வானிலை ஆய்வு மைய நேரடித் தரவு',
    title: (city, temp, cond) => `${city} நேரடி வானிலை அறிக்கை — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `வானிலை ஆய்வு மையத்தின் நேரடித் தகவல்களின்படி, ${city}-ல் தற்போதைய வெப்பநிலை ${temp}°C ஆகவும், நிலை '${desc}' ஆகவும் உள்ளது. காற்றின் வேகம் மணிக்கு ${wind} கி.மீ மற்றும் காற்றின் ஈரப்பதம் ${hum}% ஆகப் பதிவாகியுள்ளது.`,
    steps: [
      'வானிலை எச்சரிக்கைகள் மற்றும் செய்திகளைத் தொடர்ந்து கவனியுங்கள்.',
      'மழை அல்லது பலத்த காற்று வீசும்போது பாதுகாப்பான இடங்களில் தங்கவும்.',
      'மின்னல் தாக்கும் சமயங்களில் மரங்களின் அடியில் நிற்க வேண்டாம்.',
      'அவசர உதவிக்கு 112 / 1070 ஆகிய எண்களைத் தொடர்பு கொள்ளவும்.'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD நேரடி] ${city}: வெப்பநிலை ${temp}°C, ${desc}, காற்று: ${wind} km/h, ஈரப்பதம்: ${hum}%। உதவி எண்: 112।`,
    whatsappHeader: '🌤️ *வானிலை ஆய்வு மையம் — நேரடி வானிலை அறிக்கை*',
    emergencyCallout: 'அவசர உதவி எண்கள்: 112, 1070 (மாநில பேரிடர் மையம்)',
    audioAnnouncement: (city, temp, desc, wind) => `கவனிக்கவும், இது நேரடி வானிலை அறிக்கை. ${city}-ல் தற்போதைய வெப்பநிலை ${temp} டிகிரி செல்சியஸ் மற்றும் ${desc}. காற்றின் வேகம் மணிக்கு ${wind} கிலோமீட்டர்.`
  },
  te: {
    station: 'వాతావరణ శాఖ ప్రత్యక్ష సమాచారం',
    title: (city, temp, cond) => `${city} ప్రత్యక్ష వాతావరణ సమాచారం — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `వాతావరణ శాఖ ప్రత్యక్ష వివరాల ప్రకారం, ${city} లో ప్రస్తుత ఉష్ణోగ్రత ${temp}°C మరియు వాతావరణం '${desc}' గా ఉంది. గాలి వేగం గంటకు ${wind} కి.మీ మరియు తేమ ${hum}% నమోదైంది.`,
    steps: [
      'వాతావరణ సమాచారాన్ని ఎప్పటికప్పుడు గమనిస్తూ ఉండండి.',
      'వర్షం లేదా బలమైన గాలుల సమయంలో సురక్షితమైన ప్రదేశాలలో ఉండండి.',
      'ఉరుములు, మెరుపుల సమయంలో చెట్ల కింద నిలబడవద్దు.',
      'అత్యవసర సహాయం కోసం 112 లేదా 1070 నంబర్లను సంప్రదించండి.'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD లైవ్] ${city}: ఉష్ణోగ్రత ${temp}°C, ${desc}, గాలి: ${wind} km/h, తేమ: ${hum}%। హెల్ప్‌లైన్: 112।`,
    whatsappHeader: '🌤️ *విపత్తు నిర్వహణ సంస్థ — ప్రత్యక్ష వాతావరణ బులెటిన్*',
    emergencyCallout: 'అత్యవసర హెల్ప్‌లైన్: 112, 1070 (రాష్ట్ర కంట్రోల్ రూమ్)',
    audioAnnouncement: (city, temp, desc, wind) => `గమనించండి, ఇది ప్రత్యక్ష వాతావరణ నివేదిక. ${city} లో ప్రస్తుత ఉష్ణోగ్రత ${temp} డిగ్రీల సెల్సియస్ మరియు ${desc}. గాలి వేగం గంటకు ${wind} కిలోమీటర్లు.`
  },
  mr: {
    station: 'हवामान विभाग थेट डेटा',
    title: (city, temp, cond) => `${city} थेट हवामान स्थिती — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `हवामान विभागाच्या थेट नोंदींनुसार, ${city} मध्ये सध्याचे तापमान ${temp}°C आणि स्थिती '${desc}' आहे. वाऱ्याचा वेग ताशी ${wind} किमी आणि हवेतील आर्द्रता ${hum}% आहे.`,
    steps: [
      'हवामानाच्या ताज्या अंदाजावर लक्ष ठेवा.',
      'जोरदार पाऊस किंवा वाऱ्याच्या वेळी सुरक्षित इमारतीमध्ये थांबा.',
      'विजा चमकत असताना झाडांखाली किंवा विजेच्या खांबाजवळ उभे राहू नका.',
      'आपत्कालीन मदतीसाठी 112 / 1070 वर संपर्क साधा.'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [हवामान थेट] ${city}: तापमान ${temp}°C, ${desc}, वारा: ${wind} km/h, आर्द्रता: ${hum}%। मदत: 112।`,
    whatsappHeader: '🌤️ *महाराष्ट्र राज्य आपत्ती व्यवस्थापन — थेट हवामान बुलेटिन*',
    emergencyCallout: 'आपत्कालीन हेल्पलाइन: 112 (राष्ट्रीय), 1070 (राज्य कक्ष)',
    audioAnnouncement: (city, temp, desc, wind) => `लक्ष द्या, हे थेट हवामान बुलेटिन आहे. ${city} मध्ये सध्याचे तापमान ${temp} अंश सेल्सिअस आणि ${desc} आहे. वाऱ्याचा वेग ताशी ${wind} किलोमीटर आहे.`
  },
  gu: {
    station: 'હવામાન વિભાગ રીઅલ-ટાઇમ અપડેટ',
    title: (city, temp, cond) => `${city} લાઈવ હવામાન સ્થિતિ — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `હવામાન વિભાગના સીધા સેન્સર ડેટા અનુસાર, ${city} માં વર્તમાન તાપમાન ${temp}°C અને સ્થિતિ '${desc}' છે. પવનની ગતિ ${wind} કિમી/કલાક અને ભેજ ${hum}% નોંધાયેલ છે.`,
    steps: [
      'હવામાન અંગેની સરકારી સૂચનાઓ પર ધ્યાન આપો.',
      'ભારે વરસાદ કે પવન સમયે સુરક્ષિત મકાનમાં આશ્રય લો.',
      'વીજળી પડવાની સંભાવના હોય ત્યારે ખુલ્લા મેદાનમાં ન રહો.',
      'તાત્કાલિક સહાય માટે 112 / 1070 ડાયલ કરો.'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD લાઈવ] ${city}: તાપમાન ${temp}°C, ${desc}, પવન: ${wind} km/h, ભેજ: ${hum}%। હેલ્પલાઇન: 112।`,
    whatsappHeader: '🌤️ *ગુજરાત રાજ્ય આપત્તિ વ્યવસ્થાપન — લાઈવ બુલેટિન*',
    emergencyCallout: 'ઇમરજન્સી હેલ્પલાઇન: 112, 1070 (સ્ટેટ કંટ્રોલ રૂમ)',
    audioAnnouncement: (city, temp, desc, wind) => `ધ્યાન આપો, આ લાઈવ હવામાન બુલેટિન છે. ${city} માં વર્તમાન તાપમાન ${temp} ડિગ્રી સેલ્સિયસ અને ${desc} છે. પવનની ગતિ ${wind} કિલોમીટર પ્રતિ કલાક છે.`
  },
  kn: {
    station: 'ಹವಾಮಾನ ಇಲಾಖೆ ನೇರ ವರದಿ',
    title: (city, temp, cond) => `${city} ನೈಜ-ಸಮಯದ ಹವಾಮಾನ ಸ್ಥಿತಿ — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `ಹವಾಮಾನ ಇಲಾಖೆಯ ನೈಜ ಅಂಕಿಅಂಶಗಳ ಪ್ರಕಾರ, ${city} ನಲ್ಲಿ ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${temp}°C ಮತ್ತು ಸ್ಥಿತಿ '${desc}' ಆಗಿದೆ. ಗಾಳಿಯ ವೇಗ ಗಂಟೆಗೆ ${wind} ಕಿ.ಮೀ ಮತ್ತು ತೇವಾಂಶ ${hum}% ದಾಖಲಾಗಿದೆ.`,
    steps: [
      'ಹವಾಮಾನ ಇಲಾಖೆಯ ಮುನ್ಸೂಚನೆಗಳನ್ನು ಗಮನಿಸುತ್ತಿರಿ.',
      'ಮಳೆ ಅಥವಾ ಜೋರು ಗಾಳಿಯ ಸಮಯದಲ್ಲಿ ಸುರಕ್ಷಿತ ಕಟ್ಟಡಗಳಲ್ಲಿ ಇರಿ.',
      'ಮಿಂಚು ಸಂಭವಿಸುವಾಗ ಮರಗಳ ಕೆಳಗೆ ನಿಲ್ಲಬೇಡಿ.',
      'ತುರ್ತು ನೆರವಿಗಾಗಿ 112 / 1070 ಗೆ ಕರೆ ಮಾಡಿ.'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD ಲೈವ್] ${city}: ತಾಪಮಾನ ${temp}°C, ${desc}, ಗಾಳಿ: ${wind} km/h, ತೇವಾಂಶ: ${hum}%। ಸಹಾಯವಾಣಿ: 112।`,
    whatsappHeader: '🌤️ *ಕರ್ನಾಟಕ ರಾಜ್ಯ ವಿಪತ್ತು ನಿರ್ವಹಣೆ — ನೇರ ಹವಾಮಾನ ಬುಲೆಟಿನ್*',
    emergencyCallout: 'ತುರ್ತು ಸಹಾಯವಾಣಿ: 112, 1070 (ರಾಜ್ಯ ನಿಯಂತ್ರಣ ಕೊಠಡಿ)',
    audioAnnouncement: (city, temp, desc, wind) => `ಗಮನಿಸಿ, ಇದು ನೇರ ಹವಾಮಾನ ವರದಿ. ${city} ನಲ್ಲಿ ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${temp} ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್ ಮತ್ತು ${desc}. ಗಾಳಿಯ ವೇಗ ಗಂಟೆಗೆ ${wind} ಕಿಲೋಮೀಟರ್.`
  },
  ml: {
    station: 'കാലാവസ്ഥാ നിരീക്ഷണ കേന്ദ്രം തത്സമയ വിവരങ്ങൾ',
    title: (city, temp, cond) => `${city} തത്സമയ കാലാവസ്ഥാ ബുള്ളറ്റിൻ — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `കാലാവസ്ഥാ കേന്ദ്രത്തിന്റെ ഏറ്റവും പുതിയ വിവരങ്ങൾ പ്രകാരം, ${city}-ൽ ഇപ്പോഴത്തെ താപനില ${temp}°C ഉം അവസ്ഥ '${desc}' ഉം ആണ്. കാറ്റിന്റെ വേഗത മണിക്കൂറിൽ ${wind} കി.മീ ഉം അന്തരീക്ഷ ഈർപ്പം ${hum}% ഉം രേഖപ്പെടുത്തിയിട്ടുണ്ട്.`,
    steps: [
      'ഔദ്യോഗിക കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ ശ്രദ്ധിക്കുക.',
      'ശക്തമായ മഴയോ കാറ്റോ ഉള്ളപ്പോൾ സുരക്ഷിത സ്ഥാനങ്ങളിൽ തുടരുക.',
      'ഇടിമിന്നലുള്ളപ്പോൾ മരങ്ങളുടെ ചുവട്ടിൽ നിൽക്കരുത്.',
      'അടിയന്തര സഹായത്തിന് 112 / 1070 എന്ന നമ്പറുകളിൽ ബന്ധപ്പെടുക.'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD തത്സമയം] ${city}: താപനില ${temp}°C, ${desc}, കാറ്റ്: ${wind} km/h, ഈർപ്പം: ${hum}%। സഹായം: 112।`,
    whatsappHeader: '🌤️ *കേരള ദുരന്ത നിവാരണ അതോറിറ്റി — തത്സമയ ബുള്ളറ്റിൻ*',
    emergencyCallout: 'അടിയന്തര ഹെൽപ്പ്‌ലൈൻ: 112, 1070 (സ്റ്റേറ്റ് കൺട്രോൾ റൂം)',
    audioAnnouncement: (city, temp, desc, wind) => `ശ്രദ്ധിക്കുക, ഇത് തത്സമയ കാലാവസ്ഥാ വിവരമാണ്. ${city}-ൽ ഇപ്പോഴത്തെ താപനില ${temp} ഡിഗ്രി സെൽഷ്യസും ${desc} ഉം ആണ്. കാറ്റിന്റെ വേഗത മണിക്കൂറിൽ ${wind} കിലോമീറ്റർ.`
  },
  as: {
    station: 'বতৰ বিজ্ঞান কেন্দ্ৰৰ লাইভ তথ্য',
    title: (city, temp, cond) => `${city} লাইভ বতৰৰ বুলেটিন — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `বতৰ বিজ্ঞান কেন্দ্ৰৰ প্ৰত্যক্ষ তথ্য অনুসৰি, ${city} ত বৰ্তমান উষ্ণতা ${temp}°C আৰু অৱস্থা '${desc}'। বতাহৰ গতি ঘণ্টাত ${wind} কিমি আৰু আৰ্দ্ৰতা ${hum}% ৰেকৰ্ড কৰা হৈছে।`,
    steps: [
      'নিয়মিত বতৰৰ আগজাননী আৰু সতৰ্কবাণীসমূহ লক্ষ্য কৰক।',
      'ধুমুহা বা বৰষুণৰ সময়ত সুৰক্ষিত আশ্ৰয়ত থাকক।',
      'বজ্ৰপাতৰ সময়ত গছ বা বৈদ্যুতিক খুঁটাৰ ওচৰত নাথাকিব।',
      'জৰুৰী সাহায্যৰ বাবে 112 / 1070 নম্বৰত যোগাযোগ কৰক।'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD লাইভ] ${city}: উষ্ণতা ${temp}°C, ${desc}, বতাহ: ${wind} km/h, আৰ্দ্ৰতা: ${hum}%। হেল্পলাইন: 112।`,
    whatsappHeader: '🌤️ *অসম ৰাজ্যিক দুৰ্যোগ ব্যৱস্থাপনা — লাইভ বুলেটিন*',
    emergencyCallout: 'জৰুৰী হেল্পলাইন: 112, 1070 (ৰাজ্যিক কন্ট্ৰোল ৰুম)',
    audioAnnouncement: (city, temp, desc, wind) => `মন কৰক, এইটো লাইভ বতৰৰ বুলেটিন। ${city} ত বৰ্তমান উষ্ণতা ${temp} ডিগ্ৰী চেলচিয়াছ আৰু ${desc}। বতাহৰ গতি ঘণ্টাত ${wind} কিলোমিটাৰ।`
  },
  pa: {
    station: 'ਮੌਸਮ ਵਿਭਾਗ ਲਾਈਵ ਜਾਣਕਾਰੀ',
    title: (city, temp, cond) => `${city} ਰੀਅਲ-ਟਾਈਮ ਮੌਸਮ ਜਾਣਕਾਰੀ — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `ਮੌਸਮ ਵਿਭਾਗ ਦੇ ਲਾਈਵ ਸੈਂਸਰ ਮੁਤਾਬਕ, ${city} ਵਿੱਚ ਮੌਜੂਦਾ ਤਾਪਮਾਨ ${temp}°C ਅਤੇ ਹਾਲਤ '${desc}' ਹੈ। ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ${wind} ਕਿਮੀ/ਘੰਟਾ ਅਤੇ ਨਮੀ ${hum}% ਦਰਜ ਕੀਤੀ ਗਈ ਹੈ।`,
    steps: [
      'ਸਰਕਾਰੀ ਮੌਸਮ ਬੁਲੇਟਿਨਾਂ ਅਤੇ ਖ਼ਬਰਾਂ ਉੱਤੇ ਨਜ਼ਰ ਰੱਖੋ।',
      'ਤੇਜ਼ ਹਵਾਵਾਂ ਜਾਂ ਮੀਂਹ ਸਮੇਂ ਪੱਕੇ ਮਕਾਨਾਂ ਵਿੱਚ ਰਹੋ।',
      'ਅਸਮਾਨੀ ਬਿਜਲੀ ਚਮਕਣ ਵੇਲੇ ਰੁੱਖਾਂ ਹੇਠ ਨਾ ਖੜ੍ਹੋ।',
      'ਐਮਰਜੈਂਸੀ ਮਦਦ ਲਈ 112 / 1070 ਡਾਇਲ ਕਰੋ।'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD ਲਾਈਵ] ${city}: ਤਾਪਮਾਨ ${temp}°C, ${desc}, ਹਵਾ: ${wind} km/h, ਨਮੀ: ${hum}%। ਹੈਲਪਲਾਈਨ: 112।`,
    whatsappHeader: '🌤️ *ਪੰਜਾਬ ਰਾਜ ਆਫ਼ਤ ਪ੍ਰਬੰਧਨ ਅਥਾਰਟੀ — ਲਾਈਵ ਬੁਲੇਟਿਨ*',
    emergencyCallout: 'ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ: 112, 1070 (ਕੰਟਰੋਲ ਰੂਮ)',
    audioAnnouncement: (city, temp, desc, wind) => `ਧਿਆਨ ਦਿਓ, ਇਹ ਲਾਈਵ ਮੌਸਮ ਬੁਲੇਟਿਨ ਹੈ। ${city} ਵਿੱਚ ਮੌਜੂਦਾ ਤਾਪਮਾਨ ${temp} ਡਿਗਰੀ ਸੈਲਸੀਅਸ ਅਤੇ ${desc} ਹੈ। ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ${wind} ਕਿਲੋਮੀਟਰ ਪ੍ਰਤੀ ਘੰਟਾ ਹੈ।`
  },
  en: {
    station: 'OpenWeather Sensor Network Live Feed',
    title: (city, temp, cond) => `${city} Real-Time Meteorological Bulletin — ${temp}°C (${cond})`,
    threat: (city, temp, desc, wind, hum, rain) => `According to live OpenWeather sensor observations, ${city} currently records an ambient temperature of ${temp}°C with conditions reported as '${desc}'. Wind velocity is clocked at ${wind} km/h and relative atmospheric humidity is ${hum}%.${rain > 0 ? ` Precipitation of ${rain} mm observed in past hour.` : ' Regional atmospheric parameters remain within stable thresholds.' }`,
    steps: [
      'Monitor regular meteorological bulletins and local safety advisories.',
      'Seek shelter in sturdy structures during sudden convective squalls or rain bursts.',
      'Stay away from power lines, tall isolated trees, and metal towers during lightning.',
      'For emergency support or queries, contact the National Emergency Helpline: 112.'
    ],
    smsText: (city, temp, desc, wind, hum) => `🚨 [IMD/NDMA Live] ${city}: Temp ${temp}°C, ${desc}, Wind: ${wind} km/h, Humidity: ${hum}%. Helpline: 112.`,
    whatsappHeader: '🌤️ *National Disaster Management Authority — Live Sensor Bulletin*',
    emergencyCallout: 'National Emergency Helpline: 112 | State Disaster Cell: 1070',
    audioAnnouncement: (city, temp, desc, wind) => `Attention, this is the real-time weather bulletin. ${city} currently records a temperature of ${temp} degrees Celsius with ${desc}. Wind speed is ${wind} kilometers per hour.`
  }
};

/**
 * Generate a complete AI vernacular alert package for a given place, state, hazard, and language.
 * Seamlessly integrates genuine real-time OpenWeather measurements or emergency drill modes.
 */
function generateVernacularAlertAI({
  city = 'Bhubaneswar',
  state = 'Odisha',
  hazardType = 'cyclone',
  severity = 'Extreme',
  overrideLangCode = null,
  customTitle = null,
  liveWeather = null,
  isSimulation = false,
}) {
  // 1. Resolve language
  let langMeta = null;
  if (overrideLangCode) {
    langMeta = SUPPORTED_LANGUAGES.find(l => l.langCode === overrideLangCode);
  }
  if (!langMeta) {
    langMeta = resolveVernacularLanguage(city, state);
  }

  const langCode = langMeta.langCode;
  const normHazard = (hazardType || 'cyclone').toLowerCase();

  // 2. If liveWeather is provided and is NOT a drill simulation:
  if (liveWeather && !isSimulation) {
    const termDict = VERNACULAR_LIVE_TERMS[langCode] || VERNACULAR_LIVE_TERMS.hi || VERNACULAR_LIVE_TERMS.en;
    const temp = Math.round(liveWeather.temp ?? 25);
    const cond = liveWeather.condition || 'Clear';
    const desc = liveWeather.description || cond.toLowerCase();
    const windKm = Math.round(liveWeather.wind_speed ?? 10);
    const hum = Math.round(liveWeather.humidity ?? 80);
    const rain = liveWeather.rain_1h ?? 0;

    const title = customTitle || termDict.title(city, temp, cond);
    const threat = termDict.threat(city, temp, desc, windKm, hum, rain);
    const actionableSteps = termDict.steps;
    const smsText = termDict.smsText(city, temp, desc, windKm, hum);
    const whatsappText = `${termDict.whatsappHeader}\n📍 *स्थान / Location:* ${city}, ${state}\n🌡️ *तापमान / Temp:* ${temp}°C (${desc})\n💨 *हवा / Wind:* ${windKm} km/h | 💧 *नमी / Humidity:* ${hum}%\n\n📢 *विवरण / Live Report:* ${threat}\n\n🛡️ *सुरक्षा निर्देश / Safety Guidelines:*\n${actionableSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n📞 ${termDict.emergencyCallout}`;
    const audioScript = termDict.audioAnnouncement(city, temp, desc, windKm);

    return {
      success: true,
      isRealTime: true,
      metadata: {
        city,
        state,
        hazardType: normHazard,
        severity: liveWeather.riskLevel || 'Normal',
        autoDetected: !overrideLangCode,
        liveWeather: {
          temp,
          feels_like: liveWeather.feels_like,
          condition: cond,
          description: desc,
          windKm,
          humidity: hum,
          rain_1h: rain,
          riskScore: liveWeather.riskScore || 20,
          source: 'OpenWeatherMap Real-Time Sensor',
          fetchedAt: new Date().toISOString(),
        }
      },
      language: {
        langCode: langMeta.langCode,
        langName: langMeta.langName,
        nativeName: langMeta.nativeName,
        speechCode: langMeta.speechCode,
      },
      alertContent: {
        title,
        threat,
        actionableSteps,
        smsText,
        whatsappText,
        audioScript,
        callout: termDict.emergencyCallout,
      },
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }

  // 3. Fallback to hazard drill template
  const hazardGroup = VERNACULAR_TEMPLATES[normHazard] || VERNACULAR_TEMPLATES.cyclone;
  const vernacularContent = hazardGroup[langCode] || hazardGroup['hi'] || hazardGroup['en'] || VERNACULAR_TEMPLATES.cyclone.or;

  const title = customTitle || vernacularContent.title;
  const threat = vernacularContent.threat;
  const actionableSteps = vernacularContent.actionableSteps;
  const smsText = vernacularContent.smsText;
  const whatsappText = `${vernacularContent.whatsappHeader}\n📍 *स्थान / Location:* ${city}, ${state}\n⚠️ *खतरा / Threat:* ${vernacularContent.hazardLabel} (${severity})\n\n📢 *चेतावनी / Warning:* ${threat}\n\n🛡️ *तत्काल सुरक्षा कदम / Action Steps:*\n${actionableSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n📞 ${vernacularContent.emergencyCallout}`;
  const audioScript = vernacularContent.audioAnnouncement;

  return {
    success: true,
    isRealTime: false,
    metadata: {
      city,
      state,
      hazardType: normHazard,
      severity,
      autoDetected: !overrideLangCode,
      isSimulation: true,
    },
    language: {
      langCode: langMeta.langCode,
      langName: langMeta.langName,
      nativeName: langMeta.nativeName,
      speechCode: langMeta.speechCode,
    },
    alertContent: {
      title,
      threat,
      actionableSteps,
      smsText,
      whatsappText,
      audioScript,
      callout: vernacularContent.emergencyCallout,
    },
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

/**
 * Legacy compatibility export for preset alerts
 */
function getTranslationsForAlert(presetKey, plainLanguage) {
  const result = [];
  const normKey = (presetKey || 'cyclone').toLowerCase();
  const group = VERNACULAR_TEMPLATES[normKey] || VERNACULAR_TEMPLATES.cyclone;

  for (const [code, content] of Object.entries(group)) {
    const meta = SUPPORTED_LANGUAGES.find(l => l.langCode === code);
    if (meta) {
      result.push({
        langCode: code,
        langName: meta.langName,
        nativeName: meta.nativeName,
        translatedTitle: content.title,
        translatedThreat: content.threat,
        actionableSteps: content.actionableSteps,
        audioVoiceId: meta.speechCode,
      });
    }
  }

  return result;
}

module.exports = {
  STATE_LANGUAGE_MAP,
  CITY_LANGUAGE_MAP,
  SUPPORTED_LANGUAGES,
  resolveVernacularLanguage,
  generateVernacularAlertAI,
  getTranslationsForAlert,
  VERNACULAR_TEMPLATES,
};
