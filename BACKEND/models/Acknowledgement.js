const mongoose = require('mongoose');

const AcknowledgementSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    index: true,
  },
  citizenId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    default: 'Local Citizen',
  },
  sectorId: {
    type: String,
    required: true,
  },
  sectorName: {
    type: String,
    default: 'Coastal Sector A',
  },
  deviceType: {
    type: String,
    enum: ['FEATURE_PHONE_SMS', 'SMARTPHONE_APP', 'LORA_HANDHELD', 'COMMUNITY_RELAY'],
    default: 'FEATURE_PHONE_SMS',
  },
  status: {
    type: String,
    enum: ['SAFE', 'SOS', 'EVACUATING', 'DELIVERED_UNREAD'],
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  sosType: {
    type: String,
    enum: ['NONE', 'MEDICAL_EMERGENCY', 'TRAPPED_WATER', 'INFANT_CARE', 'STRUCTURAL_COLLAPSE'],
    default: 'NONE',
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  batteryLevel: {
    type: Number,
    default: 85,
  },
  networkHopCount: {
    type: Number,
    default: 2,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Acknowledgement', AcknowledgementSchema);
