/**
 * Multilingual Translation Engine for Last-Mile Emergency Alerts
 * Provides high-accuracy regional translations for critical alerts.
 */

const PRESET_TRANSLATIONS = {
  cyclone: {
    or: {
      langCode: 'or',
      langName: 'Odia',
      nativeName: 'ଓଡ଼ିଆ',
      translatedTitle: 'ଭୟଙ୍କର ବାତ୍ୟା ସତର୍କତା - ତୁରନ୍ତ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ',
      translatedThreat: 'ଅତି ଭୟଙ୍କର ବାତ୍ୟା ମାଡ଼ି ଆସୁଛି। ପ୍ରବଳ ପବନ ଓ ପ୍ରଚଣ୍ଡ ବର୍ଷା ହେବ। ମାଟି ଘର, ଟିଣ ଛାତ ଭାଙ୍ଗିଯିବ। ସମୁଦ୍ର କୂଳକୁ ଯାଆନ୍ତୁ ନାହିଁ।',
      actionableSteps: [
        'ନିକଟସ୍ଥ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ତୁରନ୍ତ ଚାଲିଯାଆନ୍ତୁ।',
        'ସମୁଦ୍ର ଏବଂ ନଦୀ ନିକଟରୁ ସମ୍ପୂର୍ଣ୍ଣ ଦୂରେଇ ରୁହନ୍ତୁ।',
        '୩ ଦିନ ପାଇଁ ପିଇବା ପାଣି, ଶୁଖିଲା ଖାଦ୍ୟ ଓ ଟର୍ଚ୍ଚ ଲାଇଟ୍ ରଖନ୍ତୁ।',
        'ଘରର ମୁଖ୍ୟ ବିଦ୍ୟୁତ୍ ଏବଂ ଗ୍ୟାସ୍ ସଂଯୋଗ ବନ୍ଦ କରିଦିଅନ୍ତୁ।'
      ],
      audioVoiceId: 'hi-IN-Wavenet-D',
    },
    hi: {
      langCode: 'hi',
      langName: 'Hindi',
      nativeName: 'हिन्दी',
      translatedTitle: 'अत्यंत गंभीर चक्रवात चेतावनी - तुरंत सुरक्षित स्थान पर जाएं',
      translatedThreat: 'खतरनाक चक्रवाती तूफ़ान आ रहा है। बहुत तेज़ हवाएं और भारी बारिश होगी। कच्चे घर और पेड़ गिर सकते हैं। समुद्र किनारे बिल्कुल न जाएं।',
      actionableSteps: [
        'तुरंत अपने नजदीकी पक्के चक्रवात आश्रय स्थल (Cyclone Shelter) में जाएं।',
        'समुद्र तट और नदियों से पूरी तरह दूर रहें। बाहर न घूमें।',
        '3 दिनों के लिए पीने का पानी, सूखा खाना और टॉर्च तैयार रखें।',
        'घर का मुख्य बिजली स्विच और गैस सिलिंडर बंद कर दें।'
      ],
      audioVoiceId: 'hi-IN-Neural2-A',
    },
    bn: {
      langCode: 'bn',
      langName: 'Bengali',
      nativeName: 'বাংলা',
      translatedTitle: 'ভয়াবহ ঘূর্ণিঝড় সতর্কতা - অবিলম্বে নিরাপদ আশ্রয়ে যান',
      translatedThreat: 'ভয়াবহ ঘূর্ণিঝড় আছড়ে পড়ছে। অতি ভারী বৃষ্টি ও প্রবল ঝোড়ো হাওয়া বইবে। মাটির বাড়ি ও বিদ্যুতের খুঁটি ভেঙে পড়ার প্রবল আশঙ্কা।',
      actionableSteps: [
        'বিলম্ব না করে নিকটবর্তী পাকা সাইক্লোন শেল্টারে চলে যান।',
        'সমুদ্র উপকূল এবং নদী তট থেকে দূরে নিরাপদে থাকুন।',
        '৩ দিনের পানীয় জল, শুকনো খাবার এবং টর্চ সঙ্গে রাখুন।',
        'বাড়ির প্রধান বিদ্যুৎ সুইচ এবং রান্নার গ্যাস সিলিন্ডার বন্ধ রাখুন।'
      ],
      audioVoiceId: 'bn-IN-Wavenet-A',
    },
    te: {
      langCode: 'te',
      langName: 'Telugu',
      nativeName: 'తెలుగు',
      translatedTitle: 'తీవ్ర తుఫాను హెచ్చరిక - వెంటనే సురక్షిత ప్రాంతాలకు వెళ్లండి',
      translatedThreat: 'భయంకరమైన తుఫాను తీరం దాటబోతోంది. పెనుగాలులు, భారీ వర్షాలు కురుస్తాయి. సముద్రం వైపు ఎట్టి పరిస్థితుల్లోనూ వెళ్లవద్దు.',
      actionableSteps: [
        'వెంటనే సమీపంలోని పక్కా తుఫాను పునరావాస కేంద్రానికి తరలివెళ్లండి.',
        'సముద్ర తీరం, నదుల దగ్గరకు వెళ్లకండి. ఇంట్లోనే భద్రంగా ఉండండి.',
        '3 రోజులకు సరిపడా తాగునీరు, పొడి ఆహారం, టార్చ్ లైట్ నిల్వ ఉంచండి.',
        'ప్రధాన విద్యుత్ స్విచ్, గ్యాస్ సిలిండర్ వెంటనే ఆపివేయండి.'
      ],
      audioVoiceId: 'te-IN-Standard-A',
    },
    ta: {
      langCode: 'ta',
      langName: 'Tamil',
      nativeName: 'தமிழ்',
      translatedTitle: 'தீவிர புயல் எச்சரிக்கை - உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்',
      translatedThreat: 'மிகவும் ஆபத்தான புயல் நெருங்குகிறது. பலத்த காற்று மற்றும் கனமழை பெய்யும். மரங்கள் மற்றும் மின் கம்பங்கள் விழக்கூடும்.',
      actionableSteps: [
        'உடனடியாக அருகிலுள்ள கான்கிரீட் புயல் நிவாரண முகாமுக்கு செல்லவும்.',
        'கடற்கரை மற்றும் நீர்நிலைகளுக்கு அருகில் செல்ல வேண்டாம்.',
        '3 நாட்களுக்கு தேவையான குடிநீர், உலர் உணவு மற்றும் டார்ச் லைட்டை தயார் செய்யவும்.',
        'மெயின் மின்சார சுவிட்ச் மற்றும் கேஸ் சிலிண்டரை அணைத்துவிடவும்.'
      ],
      audioVoiceId: 'ta-IN-Wavenet-B',
    },
    mr: {
      langCode: 'mr',
      langName: 'Marathi',
      nativeName: 'मराठी',
      translatedTitle: 'तीव्र चक्रीवादळ इशारा - तातडीने सुरक्षित ठिकाणी हलवा',
      translatedThreat: 'अत्यंत धोकादायक चक्रीवादळ धडकणार आहे. प्रचंड वादळी वारे आणि मुसळधार पाऊस पडेल. कच्च्या घरांचे नुकसान होऊ शकते.',
      actionableSteps: [
        'तातडीने जवळच्या पक्क्या चक्रीवादळ निवारा केंद्रात जा.',
        'समुद्रकिनारा आणि नद्यांपासून दूर राहा.',
        '३ दिवसांसाठी पिण्याचे पाणी, सुका खाऊ आणि टॉर्च सोबत ठेवा.',
        'घरातील मुख्य वीज पुरवठा आणि गॅस सिलिंडर बंद करा.'
      ],
      audioVoiceId: 'mr-IN-Wavenet-A',
    },
    es: {
      langCode: 'es',
      langName: 'Spanish',
      nativeName: 'Español',
      translatedTitle: 'ALERTA DE CICLÓN SEVERO - Evacúe a un refugio de inmediato',
      translatedThreat: 'Peligroso ciclón tocando tierra. Vientos destructivos y lluvias torrenciales inminentes. No se acerque al mar.',
      actionableSteps: [
        'Muévase inmediatamente al refugio de concreto más cercano.',
        'Manténgase alejado de playas, ríos y postes de electricidad.',
        'Guarde agua potable para 3 días, comida enlatada y linternas.',
        'Corte el suministro principal de electricidad y gas.'
      ],
      audioVoiceId: 'es-ES-Neural2-A',
    },
    en: {
      langCode: 'en',
      langName: 'English (Plain)',
      nativeName: 'English',
      translatedTitle: 'SEVERE CYCLONE WARNING - Move to Shelter Immediately',
      translatedThreat: 'A dangerous cyclonic storm is hitting your area. Destructive winds and heavy rainfall expected. High risk of falling trees and power outages.',
      actionableSteps: [
        'Move to your nearest concrete Cyclone Shelter or pucca building immediately.',
        'Stay far away from sea beaches and rivers.',
        'Keep 3 days of clean drinking water, dry food, and a charged torch ready.',
        'Turn off main electricity breaker and gas cylinders now.'
      ],
      audioVoiceId: 'en-US-Neural2-F',
    },
  },
  flood: {
    or: {
      langCode: 'or',
      langName: 'Odia',
      nativeName: 'ଓଡ଼ିଆ',
      translatedTitle: 'ହଠାତ୍ ବନ୍ୟା ସତର୍କତା - ଉଚ୍ଚ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ',
      translatedThreat: 'ନଦୀରେ ବନ୍ୟା ଜଳ ଦ୍ରୁତ ଗତିରେ ବୃଦ୍ଧି ପାଉଛି। ତଳିଆ ଅଞ୍ଚଳ ଏବଂ ରାସ୍ତାଘାଟ ଜଳମଗ୍ନ ହୋଇଯିବ।',
      actionableSteps: [
        'ତୁରନ୍ତ ଉଚ୍ଚ କୋଠା ବା ଉଚ୍ଚ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ।',
        'ପାଣି ପ୍ରବାହରେ କଦାପି ଚାଲନ୍ତୁ ନାହିଁ କି ଗାଡ଼ି ଚଳାନ୍ତୁ ନାହିଁ।',
        'ଗୃହପାଳିତ ପଶୁଙ୍କୁ ବାନ୍ଧି ରଖନ୍ତୁ ନାହିଁ, ଛାଡ଼ି ଦିଅନ୍ତୁ।',
        'ଜରୁରୀ କାଗଜପତ୍ର ଓ ମୋବାଇଲ୍କୁ ପ୍ଲାଷ୍ଟିକ୍ ପଲିଥିନ୍ରେ ସୁରକ୍ଷିତ ରଖନ୍ତୁ।'
      ],
      audioVoiceId: 'hi-IN-Wavenet-D',
    },
    hi: {
      langCode: 'hi',
      langName: 'Hindi',
      nativeName: 'हिन्दी',
      translatedTitle: 'आकस्मिक बाढ़ की गंभीर चेतावनी - तुरंत ऊंचे स्थानों पर जाएं',
      translatedThreat: 'नदी का जलस्तर तेजी से बढ़ रहा है। निचले इलाके और गांव पानी में डूब सकते हैं।',
      actionableSteps: [
        'तुरंत ऊंचे स्थानों, स्कूल या पक्के मकानों की छत पर चले जाएं।',
        'बहते हुए बाढ़ के पानी में पैदल या वाहन से जाने की गलती न करें।',
        'मवेशियों की रस्सियां खोल दें ताकि वे ऊंचे स्थान पर जा सकें।',
        'ज़रूरी दवाएं, पहचान पत्र और मोबाइल वाटरप्रूफ बैग में सुरक्षित रखें।'
      ],
      audioVoiceId: 'hi-IN-Neural2-A',
    },
    en: {
      langCode: 'en',
      langName: 'English (Plain)',
      nativeName: 'English',
      translatedTitle: 'FLASH FLOOD ALERT - Move to High Ground Immediately',
      translatedThreat: 'Deep flood waters are rising rapidly. Low-lying roads and houses will be submerged under strong currents.',
      actionableSteps: [
        'Move to higher ground, sturdy second floors, or safe relief camps immediately.',
        'Never drive, walk, or swim into moving flood water.',
        'Untie domestic animals so they can climb to safety.',
        'Keep medicines and important documents sealed in waterproof bags.'
      ],
      audioVoiceId: 'en-US-Neural2-F',
    },
    bn: {
      langCode: 'bn',
      langName: 'Bengali',
      nativeName: 'বাংলা',
      translatedTitle: 'আকস্মিক বন্যা সতর্কতা - দ্রুত উঁচু স্থানে আশ্রয় নিন',
      translatedThreat: 'নদীর জল দ্রুত বিপদসীমা অতিক্রম করছে। প্লাবিত অঞ্চল থেকে অবিলম্বে সরে যান।',
      actionableSteps: [
        'অবিলম্বে নিরাপদ উঁচু ভবনে বা বাঁধের ওপর আশ্রয় নিন।',
        'প্রবাহিত বন্যার জলে হাঁটার বা গাড়ি চালানোর চেষ্টা করবেন না।',
        'গবাদি পশুর বাঁধন খুলে দিন যাতে তারা উঁচুতে যেতে পারে।',
        'ওষুধ ও জরুরি নথিপত্র প্লাস্টিকে মুড়ে কাছে রাখুন।'
      ],
      audioVoiceId: 'bn-IN-Wavenet-A',
    },
    te: {
      langCode: 'te',
      langName: 'Telugu',
      nativeName: 'తెలుగు',
      translatedTitle: 'ఆకస్మిక వరద హెచ్చరిక - వెంటనే ఎత్తైన ప్రదేశాలకు వెళ్లండి',
      translatedThreat: 'వరద నీరు వేగంగా ముంచెత్తుతోంది. లోతట్టు ప్రాంతాలు ప్రమాదకరంగా నీటమునుగుతున్నాయి.',
      actionableSteps: [
        'వెంటనే ఎత్తైన ప్రాంతాలు లేదా పునరావాస కేంద్రాలకు చేరుకోండి.',
        'ప్రవహించే వరద నీటిలో నడవడానికి లేదా డ్రైవింగ్ చేయడానికి ప్రయత్నించవద్దు.',
        'పశువుల తాళ్లను విప్పి వాటిని ఎత్తైన ప్రదేశాలకు పంపండి.',
        'ముఖ్యమైన పత్రాలు, మందులు వాటర్‌ప్రూఫ్ కవర్లలో భద్రపరుచుకోండి.'
      ],
      audioVoiceId: 'te-IN-Standard-A',
    },
  },
  chemical: {
    or: {
      langCode: 'or',
      langName: 'Odia',
      nativeName: 'ଓଡ଼ିଆ',
      translatedTitle: 'ବିଷାକ୍ତ ଗ୍ୟାସ୍ ଲିକ୍ ସତର୍କତା - ନାକ ମୁହଁ ଓଦା କପଡ଼ାରେ ଘୋଡ଼ାନ୍ତୁ',
      translatedThreat: 'ବାୟୁମଣ୍ଡଳରେ ବିଷାକ୍ତ ରାସାୟନିକ ଗ୍ୟାସ୍ ବ୍ୟାପୁଛି। ଏହି ପବନ ଶ୍ୱାସକ୍ରିୟା ପାଇଁ ଅତ୍ୟନ୍ତ କ୍ଷତିକାରକ।',
      actionableSteps: [
        'ଓଦା କପଡ଼ା ବା ମାସ୍କ ଦ୍ୱାରା ନାକ ଏବଂ ପାଟିକୁ ତୁରନ୍ତ ଘୋଡ଼ାଇ ଦିଅନ୍ତୁ।',
        'ଘର ଭିତରେ ରହି କବାଟ ଝରକା ବନ୍ଦ କରି ଦିଅନ୍ତୁ, ପଙ୍ଖା ବନ୍ଦ ରଖନ୍ତୁ।',
        'ପବନ ଯେଉଁ ଦିଗକୁ ବହୁଛି, ତାହାର ବିପରୀତ କିମ୍ବା ଆଡ଼ୁଆ ଦିଗକୁ ଯାଆନ୍ତୁ।',
        'ଆଖି କିମ୍ବା ଚର୍ମରେ ପୋଡ଼ାଜଳା ହେଲେ ପରିଷ୍କାର ପାଣିରେ ଧୁଅନ୍ତୁ।'
      ],
      audioVoiceId: 'hi-IN-Wavenet-D',
    },
    hi: {
      langCode: 'hi',
      langName: 'Hindi',
      nativeName: 'हिन्दी',
      translatedTitle: 'ज़हरीली गैस रिसाव चेतावनी - गीले कपड़े से मुंह और नाक ढकें',
      translatedThreat: 'हवा में खतरनाक ज़हरीली गैस फैल रही है। सांस लेने में गंभीर तकलीफ हो सकती है।',
      actionableSteps: [
        'तुरंत गीले कपड़े या मास्क से अपनी नाक और मुंह को पूरी तरह ढक लें।',
        'कमरे के अंदर चले जाएं, खिड़की-दरवाजे बंद कर लें और पंखा-AC बंद रखें।',
        'हवा के बहाव की विपरीत दिशा (Crosswind) में सुरक्षित स्थान की ओर जाएं।',
        'आंखों या त्वचा में जलन होने पर तुरंत साफ ठंडे पानी से धोएं।'
      ],
      audioVoiceId: 'hi-IN-Neural2-A',
    },
    en: {
      langCode: 'en',
      langName: 'English (Plain)',
      nativeName: 'English',
      translatedTitle: 'TOXIC CHEMICAL LEAK ALERT - Cover Face with Wet Cloth',
      translatedThreat: 'Hazardous chemical vapor is dispersing in the air. Inhaling this vapor can cause severe lung and eye damage.',
      actionableSteps: [
        'Immediately cover nose and mouth with a damp cloth or particulate mask.',
        'Shelter indoors: seal doors and windows, turn off exhaust fans and ACs.',
        'Evacuate perpendicular (crosswind) away from the vapor plume source.',
        'Rinse burning eyes or skin immediately with abundant clean water.'
      ],
      audioVoiceId: 'en-US-Neural2-F',
    },
  },
};

function getTranslationsForAlert(presetKey, plainLanguage) {
  const key = (presetKey && PRESET_TRANSLATIONS[presetKey]) ? presetKey : 'cyclone';
  const translationsMap = PRESET_TRANSLATIONS[key] || PRESET_TRANSLATIONS.cyclone;

  const results = Object.values(translationsMap);
  return results;
}

module.exports = {
  getTranslationsForAlert,
  PRESET_TRANSLATIONS,
};
