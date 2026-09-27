"""
DEMO-mode translation vocabulary.

This is NOT a general purpose dictionary/MT engine. It is a small, curated
set of emergency-communication phrases and templates for the 6 supported
languages, used to compose grammatically valid alert messages in DEMO mode
without requiring any model download.

Design principle: numbers/units/locations are NEVER looked up here - they are
substituted in verbatim by the caller (translation.py) via placeholders, so
they are byte-for-byte identical to the source in every output language.

To move to REAL MODEL mode, none of this file is used; see
app/models/translation_model.py -> RealTranslationModel.
"""

from __future__ import annotations

SEVERITY = {
    "en": {"Critical": "Critical", "High": "High", "Moderate": "Moderate", "Low": "Low", "Unspecified": "Alert"},
    "hi": {"Critical": "अति गंभीर", "High": "उच्च", "Moderate": "मध्यम", "Low": "निम्न", "Unspecified": "चेतावनी"},
    "or": {"Critical": "ଅତ୍ୟନ୍ତ ଗୁରୁତର", "High": "ଉଚ୍ଚ", "Moderate": "ମଧ୍ୟମ", "Low": "ନିମ୍ନ", "Unspecified": "ଚେତାବନୀ"},
    "bn": {"Critical": "অতি গুরুতর", "High": "উচ্চ", "Moderate": "মাঝারি", "Low": "নিম্ন", "Unspecified": "সতর্কতা"},
    "te": {"Critical": "అత్యంత తీవ్రమైన", "High": "అధిక", "Moderate": "మధ్యస్థ", "Low": "తక్కువ", "Unspecified": "హెచ్చరిక"},
    "ta": {"Critical": "மிக கடுமையான", "High": "அதிக", "Moderate": "மிதமான", "Low": "குறைந்த", "Unspecified": "எச்சரிக்கை"},
}

ALERT_TYPE = {
    "en": {
        "Cyclone": "Cyclone", "Flood": "Flood", "Earthquake": "Earthquake", "Tsunami": "Tsunami",
        "Heatwave": "Heatwave", "Wildfire": "Wildfire", "Landslide": "Landslide", "Storm": "Storm",
        "Tornado": "Tornado", "Drought": "Drought", "Pandemic": "Pandemic",
        "Chemical Hazard": "Chemical Hazard", "Fire": "Fire", "General Emergency": "Emergency",
    },
    "hi": {
        "Cyclone": "चक्रवात", "Flood": "बाढ़", "Earthquake": "भूकंप", "Tsunami": "सुनामी",
        "Heatwave": "लू", "Wildfire": "जंगल की आग", "Landslide": "भूस्खलन", "Storm": "तूफान",
        "Tornado": "बवंडर", "Drought": "सूखा", "Pandemic": "महामारी",
        "Chemical Hazard": "रासायनिक खतरा", "Fire": "आग", "General Emergency": "आपातकाल",
    },
    "or": {
        "Cyclone": "ଘୂର୍ଣ୍ଣିବାତ୍ୟା", "Flood": "ବନ୍ୟା", "Earthquake": "ଭୂକମ୍ପ", "Tsunami": "ସୁନାମି",
        "Heatwave": "ଉତ୍କଟ ଗରମ", "Wildfire": "ଜଙ୍ଗଲ ନିଆଁ", "Landslide": "ଭୂସ୍ଖଳନ", "Storm": "ଝଡ଼",
        "Tornado": "ବାତ୍ୟା", "Drought": "ମରୁଡ଼ି", "Pandemic": "ମହାମାରୀ",
        "Chemical Hazard": "ରାସାୟନିକ ବିପଦ", "Fire": "ଅଗ୍ନିକାଣ୍ଡ", "General Emergency": "ଜରୁରୀକାଳୀନ ପରିସ୍ଥିତି",
    },
    "bn": {
        "Cyclone": "ঘূর্ণিঝড়", "Flood": "বন্যা", "Earthquake": "ভূমিকম্প", "Tsunami": "সুনামি",
        "Heatwave": "তাপপ্রবাহ", "Wildfire": "দাবানল", "Landslide": "ভূমিধস", "Storm": "ঝড়",
        "Tornado": "টর্নেডো", "Drought": "খরা", "Pandemic": "মহামারী",
        "Chemical Hazard": "রাসায়নিক বিপদ", "Fire": "অগ্নিকাণ্ড", "General Emergency": "জরুরি অবস্থা",
    },
    "te": {
        "Cyclone": "తుఫాను", "Flood": "వరద", "Earthquake": "భూకంపం", "Tsunami": "సునామి",
        "Heatwave": "వడగాలులు", "Wildfire": "అడవి మంటలు", "Landslide": "కొండచరియలు విరిగిపడటం", "Storm": "తుఫాను గాలులు",
        "Tornado": "సుడిగాలి", "Drought": "కరువు", "Pandemic": "మహమ్మారి",
        "Chemical Hazard": "రసాయన ప్రమాదం", "Fire": "అగ్నిప్రమాదం", "General Emergency": "అత్యవసర పరిస్థితి",
    },
    "ta": {
        "Cyclone": "புயல்", "Flood": "வெள்ளம்", "Earthquake": "நிலநடுக்கம்", "Tsunami": "சுனாமி",
        "Heatwave": "வெப்ப அலை", "Wildfire": "காட்டுத் தீ", "Landslide": "நிலச்சரிவு", "Storm": "புயல்",
        "Tornado": "சூறாவளி", "Drought": "வறட்சி", "Pandemic": "தொற்றுநோய்",
        "Chemical Hazard": "இரசாயன ஆபத்து", "Fire": "தீ விபத்து", "General Emergency": "அவசரநிலை",
    },
}

# Title template: {severity} {alert_type} Warning
TITLE_TEMPLATE = {
    "en": "{severity} {alert_type} Warning",
    "hi": "{severity} {alert_type} चेतावनी",
    "or": "{severity} {alert_type} ଚେତାବନୀ",
    "bn": "{severity} {alert_type} সতর্কতা",
    "te": "{severity} {alert_type} హెచ్చరిక",
    "ta": "{severity} {alert_type} எச்சரிக்கை",
}

# "Warning for <location>" connective sentence.
FOR_LOCATION = {
    "en": "{alert_type} warning for {location}.",
    "hi": "{location} के लिए {alert_type} चेतावनी।",
    "or": "{location} ପାଇଁ {alert_type} ଚେତାବନୀ।",
    "bn": "{location}-এর জন্য {alert_type} সতর্কতা।",
    "te": "{location} కోసం {alert_type} హెచ్చరిక.",
    "ta": "{location} பகுதிக்கான {alert_type} எச்சரிக்கை.",
}

# Known hazard phrase templates. Key = canonical hazard label produced by
# alert_parser.py. "{rest}" (if present) is the verbatim numeric remainder,
# e.g. for "Wind speeds up to 120 km/h" -> label "Wind speeds up to" + number.
HAZARD_PHRASES = {
    "Heavy rainfall": {
        "en": "Heavy rainfall", "hi": "भारी वर्षा", "or": "ପ୍ରବଳ ବର୍ଷା", "bn": "ভারী বৃষ্টিপাত",
        "te": "భారీ వర్షం", "ta": "கனமழை",
    },
    "Storm surge": {
        "en": "Storm surge", "hi": "तूफानी लहरें", "or": "ଝଡ଼ ଲହରୀ", "bn": "ঝড়ের জলোচ্ছ্বাস",
        "te": "తుఫాను అలలు", "ta": "புயல் அலைகள்",
    },
    "Flash flooding": {
        "en": "Flash flooding", "hi": "अचानक बाढ़", "or": "ହଠାତ୍ ବନ୍ୟା", "bn": "আকস্মিক বন্যা",
        "te": "ఆకస్మిక వరదలు", "ta": "திடீர் வெள்ளம்",
    },
    "Landslide risk": {
        "en": "Landslide risk", "hi": "भूस्खलन का खतरा", "or": "ଭୂସ୍ଖଳନ ବିପଦ", "bn": "ভূমিধসের ঝুঁকি",
        "te": "కొండచరియలు విరిగిపడే ప్రమాదం", "ta": "நிலச்சரிவு அபாயம்",
    },
    "High waves": {
        "en": "High waves", "hi": "ऊंची लहरें", "or": "ଉଚ୍ଚ ତରଙ୍ଗ", "bn": "উচ্চ ঢেউ",
        "te": "ఎత్తైన అలలు", "ta": "உயரமான அலைகள்",
    },
    "Lightning": {
        "en": "Lightning", "hi": "बिजली गिरना", "or": "ବଜ୍ରପାତ", "bn": "বজ্রপাত",
        "te": "పిడుగులు", "ta": "இடி",
    },
    "Power outages": {
        "en": "Power outages", "hi": "बिजली कटौती", "or": "ବିଦ୍ୟୁତ ବିଚ୍ଛିନ୍ନତା", "bn": "বিদ্যুৎ বিভ্রাট",
        "te": "విద్యుత్ అంతరాయాలు", "ta": "மின்தடை",
    },
    "Road closures": {
        "en": "Road closures", "hi": "सड़क बंद", "or": "ରାସ୍ତା ବନ୍ଦ", "bn": "রাস্তা বন্ধ",
        "te": "రహదారుల మూసివేత", "ta": "சாலை மூடல்",
    },
}

# "Wind speeds up to" is handled specially because it carries a live number.
WIND_PREFIX = {
    "en": "Winds up to", "hi": "हवाएं", "or": "ପବନ", "bn": "বাতাসের গতি",
    "te": "గాలుల వేగం", "ta": "காற்று வேகம்",
}
WIND_SUFFIX = {
    "en": "expected", "hi": "तक चलने की संभावना", "or": "ପର୍ଯ୍ୟନ୍ତ ଆଶା କରାଯାଉଛି", "bn": "পর্যন্ত প্রত্যাশিত",
    "te": "వరకు ఉండే అవకాశం ఉంది", "ta": "வரை வீசக்கூடும்",
}

# Common affected-area phrases, so they don't leak through untranslated
# inside an otherwise-translated recommended_action sentence.
AREA_PHRASES = {
    "low-lying areas": {
        "en": "low-lying areas", "hi": "निचले इलाकों", "or": "ନିମ୍ନ ଅଞ୍ଚଳ", "bn": "নিচু এলাকা",
        "te": "లోతట్టు ప్రాంతాలు", "ta": "பள்ளம் நிலப்பகுதிகள்",
    },
    "coastal areas": {
        "en": "coastal areas", "hi": "तटीय क्षेत्रों", "or": "ଉପକୂଳ ଅଞ୍ଚଳ", "bn": "উপকূলীয় এলাকা",
        "te": "తీర ప్రాంతాలు", "ta": "கடலோர பகுதிகள்",
    },
    "riverbanks": {
        "en": "riverbanks", "hi": "नदी किनारों", "or": "ନଦୀ କୂଳ", "bn": "নদীর তীরবর্তী এলাকা",
        "te": "నదీ తీరాలు", "ta": "ஆற்றங்கரைகள்",
    },
    "hilly regions": {
        "en": "hilly regions", "hi": "पहाड़ी क्षेत्रों", "or": "ପାହାଡ଼ିଆ ଅଞ୍ଚଳ", "bn": "পাহাড়ি অঞ্চল",
        "te": "కొండ ప్రాంతాలు", "ta": "மலைப் பகுதிகள்",
    },
    "urban areas": {
        "en": "urban areas", "hi": "शहरी क्षेत्रों", "or": "ସହରାଞ୍ଚଳ", "bn": "শহুরে এলাকা",
        "te": "పట్టణ ప్రాంతాలు", "ta": "நகர்ப்புற பகுதிகள்",
    },
    "the affected area": {
        "en": "the affected area", "hi": "प्रभावित क्षेत्र", "or": "ପ୍ରଭାବିତ ଅଞ୍ଚଳ", "bn": "ক্ষতিগ্রস্ত এলাকা",
        "te": "ప్రభావిత ప్రాంతం", "ta": "பாதிக்கப்பட்ட பகுதி",
    },
}

# Known recommended-action phrase templates.
ACTION_PHRASES = {
    "evacuate": {
        "en": "Evacuate {area} immediately.", "hi": "{area} को तुरंत खाली करें।",
        "or": "{area} କୁ ତୁରନ୍ତ ଖାଲି କରନ୍ତୁ।", "bn": "অবিলম্বে {area} খালি করুন।",
        "te": "{area} ను వెంటనే ఖాళీ చేయండి.", "ta": "{area} ஐ உடனடியாக காலி செய்யவும்.",
    },
    "stay_indoors": {
        "en": "Stay indoors and avoid unnecessary travel.", "hi": "घर के अंदर रहें और अनावश्यक यात्रा से बचें।",
        "or": "ଘର ଭିତରେ ରୁହନ୍ତୁ ଏବଂ ଅନାବଶ୍ୟକ ଯାତ୍ରାରୁ ଦୂରେଇ ରୁହନ୍ତୁ।", "bn": "ঘরের ভিতরে থাকুন এবং অপ্রয়োজনীয় ভ্রমণ এড়িয়ে চলুন।",
        "te": "ఇంటి లోపల ఉండండి మరియు అనవసర ప్రయాణాన్ని నివారించండి.", "ta": "வீட்டிற்குள் இருங்கள், தேவையற்ற பயணத்தைத் தவிர்க்கவும்.",
    },
    "higher_ground": {
        "en": "Move to higher ground immediately.", "hi": "तुरंत ऊंचे स्थान पर चले जाएं।",
        "or": "ତୁରନ୍ତ ଉଚ୍ଚ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ।", "bn": "অবিলম্বে উঁচু স্থানে চলে যান।",
        "te": "వెంటనే ఎత్తైన ప్రదేశానికి వెళ్లండి.", "ta": "உடனடியாக உயரமான இடத்திற்குச் செல்லவும்.",
    },
    "follow_authority": {
        "en": "Follow instructions from local authorities.", "hi": "स्थानीय अधिकारियों के निर्देशों का पालन करें।",
        "or": "ସ୍ଥାନୀୟ ପ୍ରଶାସନଙ୍କ ନିର୍ଦ୍ଦେଶ ପାଳନ କରନ୍ତୁ।", "bn": "স্থানীয় কর্তৃপক্ষের নির্দেশ মেনে চলুন।",
        "te": "స్థానిక అధికారుల సూచనలను పాటించండి.", "ta": "உள்ளூர் அதிகாரிகளின் அறிவுரைகளைப் பின்பற்றவும்.",
    },
}

# Low-bandwidth (SMS) label prefixes, kept short and in caps for visibility.
SMS_PREFIX = {
    "en": "{alert_type} WARNING", "hi": "{alert_type} चेतावनी", "or": "{alert_type} ଚେତାବନୀ",
    "bn": "{alert_type} সতর্কতা", "te": "{alert_type} హెచ్చరిక", "ta": "{alert_type} எச்சரிக்கை",
}

GENERIC_ACTION_FALLBACK_PREFIX = {
    "en": "Recommended action:", "hi": "अनुशंसित कार्रवाई:", "or": "ସୁପାରିଶ କରାଯାଇଥିବା ପଦକ୍ଷେପ:",
    "bn": "প্রস্তাবিত পদক্ষেপ:", "te": "సిఫార్సు చేయబడిన చర్య:", "ta": "பரிந்துரைக்கப்பட்ட நடவடிக்கை:",
}
