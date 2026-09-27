# AI-Powered Multilingual Emergency Alert System

The AI/model layer for a hackathon project that takes **one official
emergency alert**, understands it, and produces **one validated translation
per required language** — never one translation per recipient.

```
10,000 recipients, 5 preferred languages  ->  5 AI translations, not 10,000
```

The AI is responsible for language processing/translation. Recipient
selection and message delivery belong to the backend (e.g. a MERN stack) —
see [MERN integration](#mern-backend-integration) below.

---

## 1. Pipeline

```
        OFFICIAL ALERT
              |
              v
      LANGUAGE DETECTION        (app/services/language_detection.py)
              |
              v
     ALERT UNDERSTANDING        (app/services/alert_parser.py)
              |
              v
     ALERT STRUCTURING          -> StructuredAlert (language-independent)
              |
              v
   MULTILINGUAL TRANSLATION     (app/services/translation.py, batch_processor.py)
              |
              v
  TRANSLATION VALIDATION        (app/services/validation.py)
              |
              v
FULL + LOW-BANDWIDTH + TTS OUTPUT
              |
              v
           FINAL JSON
```

Every stage is a separate, independently testable module (see `tests/`).

## 2. Two run modes, same API

| | DEMO mode (default) | REAL MODEL mode |
|---|---|---|
| `DEMO_MODE` | `true` | `false` |
| Engine | Curated phrase/template dictionaries (`app/services/translation_dictionaries.py`) | Hugging Face seq2seq model (default: `ai4bharat/indictrans2-en-indic-1B`), loaded once at startup |
| Needs internet/GPU? | No | Yes (model download + ideally GPU) |
| API/response shape | Identical | Identical |

The frontend/backend **never needs to know** which mode is active — the
response schema is exactly the same. If REAL MODEL mode fails to load (no
internet, out of RAM, missing `torch`/`transformers`), the service
automatically falls back to DEMO mode instead of crashing (see
`app/models/translation_model.py::load_translation_model`).

Both modes protect every number, unit, date, time, and helpline number with a
placeholder **before** any translation happens, and restore the exact
original text **after** translation (`app/utils/text_utils.py`). This is why
`120 km/h` can never become `1200 km/h` or `120 mph` — the translator (demo
dictionary or neural model) never actually sees the raw digits, only a
placeholder token it has to carry through untouched.

## 3. Folder structure

```
multilingual-alert-ai/
├── app/
│   ├── main.py                     # FastAPI app + startup model loading
│   ├── config.py                   # env-driven settings, DEMO_MODE switch
│   ├── api/
│   │   ├── routes.py                # POST /process-alert, /batch-translate
│   │   └── health.py                # GET /health
│   ├── models/
│   │   ├── language_model.py        # LanguageDetector (loaded once)
│   │   └── translation_model.py     # Demo + Real translation backends
│   ├── services/
│   │   ├── language_detection.py    # Stage 1
│   │   ├── alert_parser.py          # Stage 2 + 3
│   │   ├── translation.py           # Stage 4 (+ low-bandwidth/TTS)
│   │   ├── translation_dictionaries.py  # DEMO mode phrase tables
│   │   ├── validation.py            # Stage 6
│   │   ├── caching.py               # Stage 5 (spec §15)
│   │   └── batch_processor.py       # N-languages-not-N-recipients logic
│   ├── schemas/
│   │   └── alert_schema.py          # Pydantic request/response models
│   └── utils/
│       └── text_utils.py            # number/unit protection, SMS, TTS cleanup
├── tests/
│   ├── test_language.py
│   ├── test_translation.py
│   ├── test_validation.py
│   └── test_batch.py
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

## 4. Setup

```bash
cd multilingual-alert-ai
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # DEMO_MODE=true by default

uvicorn app.main:app --reload --port 8000
```

Open http://127.0.0.1:8000/docs for interactive Swagger docs.

Run the test suite (16 required test cases, all in DEMO mode so no model
download is needed to grade/demo this):

```bash
pytest tests/ -v
```

### Enabling REAL MODEL mode (optional)

```bash
pip install torch transformers sentencepiece accelerate
# IndicTrans2 also needs its pre/post-processing toolkit:
pip install git+https://github.com/VarunGumma/IndicTransToolkit.git
```

Then in `.env`:

```
DEMO_MODE=false
REAL_TRANSLATION_MODEL_ID=ai4bharat/indictrans2-en-indic-1B
REAL_MODEL_DEVICE=cuda   # or cpu
```

The model downloads from Hugging Face **once**, the first time the service
starts (cached under `~/.cache/huggingface` afterwards), and is loaded into
memory **once** — never per-request (`app/main.py` lifespan hook). If you
swap in a different multilingual model (e.g. `facebook/nllb-200-distilled-600M`),
adjust `RealTranslationModel.translate_text()` in
`app/models/translation_model.py` to match that model's tokenizer API
(language tag conventions differ between IndicTrans2 and NLLB).

## 5. Main API

### `POST /process-alert`

Request:

```json
{
  "alert_id": "ALT001",
  "title": "Severe Cyclone Warning",
  "message": "Severe cyclone warning for Odisha. Heavy rainfall and winds up to 120 km/h are expected. Residents in low-lying areas should evacuate immediately.",
  "source_language": "auto",
  "target_languages": ["en", "hi", "or", "bn", "te"],
  "alert_type": "Cyclone",
  "severity": "Critical",
  "location": "Odisha",
  "recommended_action": "Evacuate low-lying areas immediately"
}
```

Response (abridged):

```json
{
  "alert_id": "ALT001",
  "source_language": {"code": "en", "language": "en", "language_name": "English", "confidence": 1.0},
  "structured_alert": {
    "alert_type": "Cyclone",
    "severity": "Critical",
    "location": "Odisha",
    "hazards": ["Heavy rainfall", "Winds up to 120 km/h are expected"],
    "recommended_action": "Evacuate low-lying areas immediately",
    "numbers": ["120 km/h"]
  },
  "translations": {
    "en": {"title": "...", "message": "...", "recommended_action": "...", "low_bandwidth_message": "...", "tts_text": "..."},
    "hi": {"title": "अति गंभीर चक्रवात चेतावनी", "message": "Odisha के लिए चक्रवात चेतावनी। भारी वर्षा. हवाएं 120 km/h तक चलने की संभावना. निचले इलाकों को तुरंत खाली करें।", "...": "..."},
    "or": {"...": "..."},
    "bn": {"...": "..."},
    "te": {"...": "..."}
  },
  "validation": {"status": "passed", "per_language": {"en": {"status": "passed", "issues": []}, "...": "..."}},
  "mode": "demo"
}
```

### `POST /batch-translate`

Same idea, but takes an already-built `StructuredAlert` directly (skips
Stage 1-3) — useful if another service already parsed the alert.

### `GET /languages`

Lists the currently supported language codes/names.

### `GET /health`

Returns service status, active mode (`demo` / `real_model`), and supported
languages.

## 6. cURL examples

```bash
curl -X POST http://localhost:8000/process-alert \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "ALT001",
    "title": "Severe Cyclone Warning",
    "message": "Severe cyclone warning for Odisha. Heavy rainfall and winds up to 120 km/h are expected. Residents in low-lying areas should evacuate immediately.",
    "source_language": "auto",
    "target_languages": ["en", "hi", "or", "bn", "te"],
    "alert_type": "Cyclone",
    "severity": "Critical",
    "location": "Odisha",
    "recommended_action": "Evacuate low-lying areas immediately"
  }'
```

## 7. MERN backend integration

The AI never touches individual recipients. The Node/Express backend calls
`/process-alert` **once per alert**, then fans the returned `translations`
object out to however many recipients prefer each language:

```javascript
// Node/Express example
const axios = require("axios");

async function broadcastAlert(alert, recipients) {
  // recipients = [{ id, phone, preferredLanguage }, ...]  (thousands of rows)

  const { data } = await axios.post("http://ai-service:8000/process-alert", {
    alert_id: alert.id,
    title: alert.title,
    message: alert.message,
    source_language: "auto",
    target_languages: [...new Set(recipients.map(r => r.preferredLanguage))],
    alert_type: alert.type,
    severity: alert.severity,
    location: alert.location,
    recommended_action: alert.action,
  });

  if (data.validation.status !== "passed") {
    console.warn("Translation validation warnings:", data.validation.per_language);
    // Still deliver, but flag for a human reviewer - never silently drop
    // an alert because of a validation warning.
  }

  // ONE translation package per language, reused for every matching recipient:
  const jobs = recipients.map(r => {
    const pkg = data.translations[r.preferredLanguage];
    return sendSms(r.phone, pkg.low_bandwidth_message); // or push notification, IVR/TTS call, etc.
  });

  await Promise.all(jobs);
}
```

The AI performed `target_languages.length` translations total — the
`recipients.length` fan-out happens entirely on the Node side using plain
object lookups, no additional AI calls.

## 8. The multi-recipient architecture, explained

```
                INPUT ALERT
                     |
                     v
             Language Detector
                     |
                     v
              Alert Parser
                     |
                     v
            Structured Alert
                     |
                     v
          Translation Model
          /      |       \
        HI      OR       BN
         \       |       /
          \      |      /
           Translation
             Validator
                 |
                 v
          Final Alert JSON
                 |
                 v
             MERN Backend
                 |
     ___________|___________
    /       |        |       \
 User1   User2    User3   ... User_N (per language, same package reused)
```

- The AI's unit of work is a **language**, not a **recipient**.
- `app/services/batch_processor.py::process_batch` produces exactly
  `len(target_languages)` translation packages (fewer if some are already
  cached).
- `app/services/caching.py` additionally deduplicates *across alerts*: if the
  same `alert_id` + `alert_version` + `source_language` + `target_language`
  combination has already been translated (e.g. a retry, or a second batch of
  recipients preferring the same language), the cached result is reused and
  the translation model is not invoked again.
- `tests/test_batch.py::test_10000_recipients_5_languages_only_5_translations_generated`
  proves this end-to-end: it patches the translation function to count
  invocations, sends 10,000 simulated recipients across 5 languages through
  the pipeline, and asserts the AI ran **exactly 5 times**, then confirms
  every recipient in a given language received the byte-identical cached
  message object.

## 9. Preserving critical emergency information

Every numeric/unit/date/time/helpline-style token in the source alert is
extracted (`app/utils/text_utils.py::protect_critical_tokens`) and swapped
back in verbatim after composition/translation — it is never re-typed by a
dictionary lookup or a neural model. `app/services/validation.py` then
independently re-extracts numeric tokens from each translated output and
flags a `"warning"` status with the specific missing/altered value if
anything doesn't match, exactly as specified:

```json
{
  "status": "warning",
  "language": "or",
  "issues": ["Missing or altered numeric/unit value(s): 120km/h"]
}
```

Nothing is ever silently accepted.
