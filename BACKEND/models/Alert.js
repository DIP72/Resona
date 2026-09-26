const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  presetKey: {
    type: String,
    default: 'custom',
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Meteorological', 'Hydrological', 'Industrial', 'Geophysical', 'Biological'],
    default: 'Meteorological',
  },
  severity: {
    type: String,
    enum: ['Extreme', 'Severe', 'Moderate', 'Minor'],
    default: 'Severe',
  },
  urgency: {
    type: String,
    enum: ['Immediate', 'Expected', 'Future', 'Past'],
    default: 'Immediate',
  },
  issuingAuthority: {
    type: String,
    default: 'National Disaster Management Authority (NDMA)',
  },
  rawTechnicalBulletin: {
    type: String,
    required: true,
  },
  affectedArea: {
    name: { type: String, required: true },
    state: { type: String, default: 'Odisha' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    radiusKm: { type: Number, default: 45 },
  },
  // Stage 2: Plain Language Transformation
  plainLanguage: {
    threat: { type: String, default: '' },
    impactZone: { type: String, default: '' },
    actionableSteps: [{ type: String }],
    readabilityBefore: {
      gradeLevel: { type: Number, default: 14.5 },
      fleschScore: { type: Number, default: 28.2 },
      status: { type: String, default: 'College Level - Complex' },
    },
    readabilityAfter: {
      gradeLevel: { type: Number, default: 4.8 },
      fleschScore: { type: Number, default: 89.4 },
      status: { type: String, default: '5th Grade - Universal' },
    },
  },
  // Stage 3: Translations
  translations: [
    {
      langCode: { type: String, required: true },
      langName: { type: String, required: true },
      nativeName: { type: String, required: true },
      translatedTitle: { type: String, required: true },
      translatedThreat: { type: String, required: true },
      actionableSteps: [{ type: String }],
      audioVoiceId: { type: String, default: '' },
    },
  ],
  // Stage 4: Visual Metadata & Shelters
  visualAssets: {
    colorCode: { type: String, default: '#FF0055' },
    iconType: { type: String, default: 'cyclone' },
    evacuationShelters: [
      {
        id: { type: String },
        name: { type: String },
        distanceKm: { type: Number },
        capacity: { type: Number },
        occupied: { type: Number },
        lat: { type: Number },
        lng: { type: Number },
        status: { type: String, default: 'Open' },
      },
    ],
  },
  // Stage 5: Low-Bandwidth Encodings
  transmissionData: {
    capXml: { type: String },
    capPacketSizeBytes: { type: Number, default: 864 },
    ussdCode: { type: String },
    sms140: { type: String },
    loraPayloadHex: { type: String },
    loraBytes: { type: Number, default: 58 },
  },
  // Current active pipeline stage (1-6)
  pipelineStage: {
    type: Number,
    default: 1,
    min: 1,
    max: 6,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SIMPLIFIED', 'TRANSLATED', 'VISUALIZED', 'TRANSMITTING', 'BROADCAST_ACTIVE'],
    default: 'DRAFT',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', AlertSchema);
