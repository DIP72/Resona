const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Telemetry = require('../models/Telemetry');
const Acknowledgement = require('../models/Acknowledgement');
const BroadcastLog = require('../models/BroadcastLog');
const { PRESETS } = require('../data/presets');
const { simplifyBureaucraticAlert } = require('../services/simplifierService');
const { 
  getTranslationsForAlert, 
  generateVernacularAlertAI, 
  resolveVernacularLanguage,
  SUPPORTED_LANGUAGES 
} = require('../services/translatorService');
const { generateCapXml, generateCompressedSms, generateUssdString, generateLoraHexPayload } = require('../services/capGenerator');
const { generateInitialTelemetry } = require('../services/telemetrySimulator');

// In-memory fallback in case MongoDB server ever has intermittent connectivity
let memoryAlerts = new Map();
let memoryTelemetry = new Map();
let memoryAcks = [];
let memoryBroadcastLogs = [];

// GET /api/health
router.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  res.json({
    status: 'ONLINE',
    service: 'LastMile Alert System API',
    mongoDb: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/presets
router.get('/presets', (req, res) => {
  res.json({
    presets: PRESETS,
  });
});

// GET /api/alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(20);
    if (alerts && alerts.length > 0) {
      return res.json({ alerts });
    }
  } catch (err) {
    console.warn('MongoDB fetch fallback to memory:', err.message);
  }
  const list = Array.from(memoryAlerts.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ alerts: list });
});

// ==========================================
// MULTILINGUAL ALERT AI ENGINE ROUTES
// ==========================================

// GET /api/alerts/supported-languages
router.get('/alerts/supported-languages', (req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
  });
});

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';

async function fetchLiveWeatherForCity(cityName) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)},IN&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const r = await fetch(url);
    if (r.ok) {
      const d = await r.json();
      return {
        temp: Math.round(d.main.temp),
        feels_like: Math.round(d.main.feels_like),
        humidity: d.main.humidity,
        wind_speed: Math.round((d.wind?.speed || 0) * 3.6),
        pressure: d.main.pressure,
        condition: d.weather?.[0]?.main || 'Clear',
        description: d.weather?.[0]?.description || '',
        rain_1h: d.rain?.['1h'] || 0,
        riskScore: (d.main.temp >= 38 ? 40 : 20) + (d.rain?.['1h'] ? 25 : 0),
        riskLevel: d.rain?.['1h'] > 5 ? 'High' : (d.rain?.['1h'] > 0 ? 'Moderate' : 'Low')
      };
    }
  } catch (e) {
    console.warn('Failed to fetch live weather for multilingual alert:', e.message);
  }
  return null;
}

// POST /api/alerts/multilingual-generate (AI-generated vernacular emergency alert)
router.post('/alerts/multilingual-generate', async (req, res) => {
  try {
    const {
      city = 'Bhubaneswar',
      state = 'Odisha',
      hazardType = 'cyclone',
      severity = 'Normal',
      overrideLangCode = null,
      customTitle = null,
      liveWeather = null,
      isSimulation = false,
    } = req.body;

    let weather = liveWeather;
    if (!weather && !isSimulation) {
      weather = await fetchLiveWeatherForCity(city);
    }

    const alertAI = generateVernacularAlertAI({
      city,
      state,
      hazardType,
      severity,
      overrideLangCode,
      customTitle,
      liveWeather: weather,
      isSimulation,
    });

    res.json(alertAI);
  } catch (err) {
    console.error('Error generating multilingual alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alerts/multilingual-generate
router.get('/alerts/multilingual-generate', async (req, res) => {
  try {
    const {
      city = 'Bhubaneswar',
      state = 'Odisha',
      hazardType = 'cyclone',
      severity = 'Normal',
      lang = null,
      isSimulation = 'false',
    } = req.query;

    const sim = isSimulation === 'true';
    let weather = null;
    if (!sim) {
      weather = await fetchLiveWeatherForCity(city);
    }

    const alertAI = generateVernacularAlertAI({
      city,
      state,
      hazardType,
      severity,
      overrideLangCode: lang,
      liveWeather: weather,
      isSimulation: sim,
    });

    res.json(alertAI);
  } catch (err) {
    console.error('Error generating multilingual alert query:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts/broadcast-vernacular (Broadcast alert message in native language to state/place)
router.post('/alerts/broadcast-vernacular', async (req, res) => {
  try {
    const {
      alertTitle,
      city = 'Bhubaneswar',
      state = 'Odisha',
      hazardType = 'cyclone',
      severity = 'Extreme',
      langCode = 'or',
      langName = 'Odia',
      nativeName = 'ଓଡ଼ିଆ',
      channel = 'SMS',
      recipientsCount = 185000,
      messageText,
      senderName = 'State Disaster Management Authority (SDMA)',
    } = req.body;

    const statePrefix = (state || 'IN').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const broadcastId = `VBCST-${statePrefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const deliveredCount = Math.floor(recipientsCount * (0.982 + Math.random() * 0.015));
    const deliveryRate = ((deliveredCount / recipientsCount) * 100).toFixed(1) + '%';

    const logEntry = {
      broadcastId,
      alertTitle: alertTitle || `Emergency Disaster Warning — ${city}`,
      city,
      state,
      hazardType,
      severity,
      langCode,
      langName,
      nativeName,
      channel,
      recipientsCount,
      deliveredCount,
      deliveryRate,
      messageText: messageText || 'Emergency alert dispatched in vernacular language.',
      senderName,
      status: 'DELIVERED',
      createdAt: new Date(),
    };

    memoryBroadcastLogs.unshift(logEntry);

    try {
      const saved = await BroadcastLog.create(logEntry);
      return res.status(201).json({
        success: true,
        broadcast: saved,
        networkReceipt: {
          broadcastId,
          gateway: channel === 'SMS' ? 'TRAI-National-SMS-Emergency-Pipe' : channel === 'WHATSAPP' ? 'Meta-Disaster-Enterprise-Webhook' : channel === 'VOICE_IVR' ? 'BSNL-DoT-Emergency-Voice-Trunk' : 'DoT-CAP-Cell-Broadcast-Gateway',
          timestamp: new Date().toISOString(),
          deliveryRate,
          deliveredCount,
          totalTargeted: recipientsCount,
          status: 'TRANSMITTED_DELIVERED',
        },
      });
    } catch (dbErr) {
      console.warn('MongoDB broadcast save note (saved to memory):', dbErr.message);
      return res.status(201).json({
        success: true,
        broadcast: logEntry,
        networkReceipt: {
          broadcastId,
          gateway: 'Local-Resilient-Emergency-Pipe',
          timestamp: new Date().toISOString(),
          deliveryRate,
          deliveredCount,
          totalTargeted: recipientsCount,
          status: 'TRANSMITTED_DELIVERED',
        },
      });
    }
  } catch (err) {
    console.error('Error broadcasting vernacular alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alerts/broadcast-logs (Fetch state or national vernacular broadcast history)
router.get('/alerts/broadcast-logs', async (req, res) => {
  const { state, limit = 15 } = req.query;
  const query = state ? { state: new RegExp(state, 'i') } : {};

  try {
    const logs = await BroadcastLog.find(query).sort({ createdAt: -1 }).limit(parseInt(limit));
    if (logs && logs.length > 0) {
      return res.json({ broadcasts: logs });
    }
  } catch (err) {
    console.warn('MongoDB broadcast logs fetch note:', err.message);
  }

  const filtered = state
    ? memoryBroadcastLogs.filter(b => b.state.toLowerCase().includes(state.toLowerCase()))
    : memoryBroadcastLogs;
  res.json({ broadcasts: filtered.slice(0, parseInt(limit)) });
});

// GET /api/alerts/:id
router.get('/alerts/:id', async (req, res) => {
  const alertId = req.params.id;
  try {
    const alert = await Alert.findOne({ alertId });
    if (alert) return res.json({ alert });
  } catch (err) {
    console.warn('MongoDB single fetch fallback:', err.message);
  }

  const mem = memoryAlerts.get(alertId);
  if (mem) return res.json({ alert: mem });

  res.status(404).json({ error: 'Alert not found' });
});

// POST /api/alerts/simplify (Dry run simplification)
router.post('/alerts/simplify', (req, res) => {
  const { rawTechnicalBulletin, category, severity, affectedArea } = req.body;
  if (!rawTechnicalBulletin) {
    return res.status(400).json({ error: 'rawTechnicalBulletin is required' });
  }
  const result = simplifyBureaucraticAlert(rawTechnicalBulletin, category, severity, affectedArea);
  res.json(result);
});

// POST /api/alerts (Create full multi-stage pipeline alert)
router.post('/alerts', async (req, res) => {
  try {
    const {
      presetKey = 'cyclone',
      title,
      category = 'Meteorological',
      severity = 'Extreme',
      urgency = 'Immediate',
      issuingAuthority = 'NDMA / IMD India',
      rawTechnicalBulletin,
      affectedArea,
      pipelineStage = 1,
    } = req.body;

    const alertId = `ALERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Plain Language transformation
    const plainLanguage = simplifyBureaucraticAlert(
      rawTechnicalBulletin,
      category,
      severity,
      affectedArea
    );

    // 2. Multilingual Translations
    const translations = getTranslationsForAlert(presetKey, plainLanguage);

    // 3. Visual Assets & Shelters
    let visualAssets = {
      colorCode: severity === 'Extreme' ? '#FF0055' : severity === 'Severe' ? '#FFB703' : '#00F2FE',
      iconType: category === 'Meteorological' ? 'cyclone' : category === 'Hydrological' ? 'flood' : 'chemical',
      evacuationShelters: [],
    };

    const matchingPreset = PRESETS.find(p => p.key === presetKey);
    if (matchingPreset && matchingPreset.visualAssets?.evacuationShelters) {
      visualAssets.evacuationShelters = matchingPreset.visualAssets.evacuationShelters;
    } else {
      visualAssets.evacuationShelters = [
        {
          id: 'SHELTER-GEN-1',
          name: `${affectedArea?.name || 'Local'} Community Evacuation Bunker`,
          distanceKm: 2.1,
          capacity: 1000,
          occupied: 450,
          lat: (affectedArea?.coordinates?.lat || 19.81) + 0.015,
          lng: (affectedArea?.coordinates?.lng || 85.83) + 0.012,
          status: 'Open',
        },
      ];
    }

    // 4. Low-Bandwidth Encodings
    const alertDataForEnc = {
      alertId,
      title: title || matchingPreset?.title || 'Emergency Warning',
      category,
      severity,
      urgency,
      affectedArea,
      plainLanguage,
    };

    const capXml = generateCapXml(alertDataForEnc);
    const sms140 = generateCompressedSms(alertDataForEnc);
    const ussdCode = generateUssdString(alertDataForEnc);
    const loraPayloadHex = generateLoraHexPayload(alertDataForEnc);

    const transmissionData = {
      capXml,
      capPacketSizeBytes: Buffer.byteLength(capXml, 'utf8'),
      sms140,
      ussdCode,
      loraPayloadHex,
      loraBytes: 48,
    };

    const alertDoc = {
      alertId,
      presetKey,
      title: title || matchingPreset?.title || 'Severe Disaster Warning',
      category,
      severity,
      urgency,
      issuingAuthority,
      rawTechnicalBulletin,
      affectedArea,
      plainLanguage,
      translations,
      visualAssets,
      transmissionData,
      pipelineStage: pipelineStage || 6,
      status: 'BROADCAST_ACTIVE',
      createdAt: new Date(),
    };

    // Initialize telemetry
    const initialTelemetry = generateInitialTelemetry(alertId, alertDoc);

    // Save in memory first
    memoryAlerts.set(alertId, alertDoc);
    memoryTelemetry.set(alertId, initialTelemetry);

    // Persist to MongoDB
    try {
      const savedAlert = await Alert.create(alertDoc);
      await Telemetry.create(initialTelemetry);
      return res.status(201).json({
        success: true,
        alert: savedAlert,
        telemetry: initialTelemetry,
      });
    } catch (dbErr) {
      console.warn('MongoDB save error, stored in memory:', dbErr.message);
      return res.status(201).json({
        success: true,
        alert: alertDoc,
        telemetry: initialTelemetry,
        warning: 'Saved to in-memory store',
      });
    }
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts/:id/telemetry
router.get('/alerts/:id/telemetry', async (req, res) => {
  const alertId = req.params.id;
  try {
    const telem = await Telemetry.findOne({ alertId });
    if (telem) return res.json({ telemetry: telem });
  } catch (err) {
    console.warn('MongoDB telemetry fetch fallback:', err.message);
  }

  const mem = memoryTelemetry.get(alertId);
  if (mem) return res.json({ telemetry: mem });

  // Generate dynamic telemetry if not found
  const fallback = generateInitialTelemetry(alertId, { affectedArea: { name: 'Coastal District' } });
  memoryTelemetry.set(alertId, fallback);
  res.json({ telemetry: fallback });
});

// POST /api/alerts/:id/ack (Simulate citizen ACK or SOS message)
router.post('/alerts/:id/ack', async (req, res) => {
  const alertId = req.params.id;
  const {
    citizenId = `CITIZEN-${Math.floor(1000 + Math.random() * 9000)}`,
    senderName = 'Local Resident',
    sectorId = 'SEC-A',
    sectorName = 'Coastal Fishermen Belt A',
    deviceType = 'FEATURE_PHONE_SMS',
    status = 'SAFE', // 'SAFE' or 'SOS'
    sosType = 'NONE',
    message = '',
  } = req.body;

  const ackRecord = {
    alertId,
    citizenId,
    senderName,
    sectorId,
    sectorName,
    deviceType,
    status,
    sosType,
    message: message || (status === 'SAFE' ? 'Safe inside cyclone shelter.' : 'Water rising fast, boat required.'),
    timestamp: new Date(),
  };

  memoryAcks.unshift(ackRecord);

  // Update telemetry
  let telem = memoryTelemetry.get(alertId);
  if (telem) {
    if (status === 'SAFE') {
      telem.acknowledgedCount += 1;
    } else if (status === 'SOS') {
      telem.sosCount += 1;
    }
    const sec = telem.sectorReach.find(s => s.sectorId === sectorId);
    if (sec) {
      if (status === 'SAFE') sec.ackCount += 1;
      if (status === 'SOS') sec.sosCount += 1;
    }
    memoryTelemetry.set(alertId, telem);
  }

  try {
    await Acknowledgement.create(ackRecord);
    if (telem) {
      await Telemetry.findOneAndUpdate({ alertId }, telem, { upsert: true });
    }
  } catch (dbErr) {
    console.warn('MongoDB ack save warning:', dbErr.message);
  }

  res.json({
    success: true,
    acknowledgement: ackRecord,
    updatedTelemetry: telem,
  });
});

// GET /api/alerts/:id/acks
router.get('/alerts/:id/acks', async (req, res) => {
  const alertId = req.params.id;
  try {
    const acks = await Acknowledgement.find({ alertId }).sort({ timestamp: -1 }).limit(30);
    if (acks && acks.length > 0) return res.json({ acknowledgements: acks });
  } catch (err) {
    console.warn('MongoDB acks fetch fallback:', err.message);
  }

  const filtered = memoryAcks.filter(a => a.alertId === alertId);
  res.json({ acknowledgements: filtered });
});

module.exports = router;
