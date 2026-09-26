const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const alertRoutes = require('./routes/alertRoutes');
const { PRESETS } = require('./data/presets');
const Alert = require('./models/Alert');
const Telemetry = require('./models/Telemetry');
const { simplifyBureaucraticAlert } = require('./services/simplifierService');
const { getTranslationsForAlert } = require('./services/translatorService');
const { generateCapXml, generateCompressedSms, generateUssdString, generateLoraHexPayload } = require('./services/capGenerator');
const { generateInitialTelemetry } = require('./services/telemetrySimulator');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lastmile_alert_db';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', alertRoutes);

// Seed initial default alert into MongoDB
async function seedDefaultAlert() {
  try {
    const existing = await Alert.findOne({ presetKey: 'cyclone' });
    if (!existing) {
      console.log('Seeding initial Cyclone Dana emergency alert into MongoDB...');
      const p = PRESETS[0];
      const alertId = 'ALERT-INITIAL-DANA';
      const plainLanguage = simplifyBureaucraticAlert(p.rawTechnicalBulletin, p.category, p.severity, p.affectedArea);
      const translations = getTranslationsForAlert('cyclone', plainLanguage);

      const alertDataForEnc = {
        alertId,
        title: p.title,
        category: p.category,
        severity: p.severity,
        urgency: p.urgency,
        affectedArea: p.affectedArea,
        plainLanguage,
      };

      const capXml = generateCapXml(alertDataForEnc);
      const sms140 = generateCompressedSms(alertDataForEnc);
      const ussdCode = generateUssdString(alertDataForEnc);
      const loraPayloadHex = generateLoraHexPayload(alertDataForEnc);

      const alertDoc = {
        alertId,
        presetKey: 'cyclone',
        title: p.title,
        category: p.category,
        severity: p.severity,
        urgency: p.urgency,
        issuingAuthority: p.issuingAuthority,
        rawTechnicalBulletin: p.rawTechnicalBulletin,
        affectedArea: p.affectedArea,
        plainLanguage,
        translations,
        visualAssets: p.visualAssets,
        transmissionData: {
          capXml,
          capPacketSizeBytes: Buffer.byteLength(capXml, 'utf8'),
          sms140,
          ussdCode,
          loraPayloadHex,
          loraBytes: 48,
        },
        pipelineStage: 6,
        status: 'BROADCAST_ACTIVE',
        createdAt: new Date(),
      };

      await Alert.create(alertDoc);
      const telemDoc = generateInitialTelemetry(alertId, alertDoc);
      await Telemetry.create(telemDoc);
      console.log('Initial Cyclone alert seeded successfully!');
    }
  } catch (err) {
    console.warn('Seeding note:', err.message);
  }
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(async () => {
  console.log(`>>> Connected to MongoDB database successfully at ${MONGODB_URI}`);
  await seedDefaultAlert();
})
.catch((err) => {
  console.error('>>> MongoDB Connection Notice:', err.message);
  console.log('>>> Server will operate with in-memory resilient fallback cache.');
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚨 LASTMILE ALERT SYSTEM BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 Presets:    http://localhost:${PORT}/api/presets`);
  console.log(`====================================================`);
});
