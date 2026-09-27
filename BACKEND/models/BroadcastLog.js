const mongoose = require('mongoose');

const BroadcastLogSchema = new mongoose.Schema({
  broadcastId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  alertTitle: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  hazardType: {
    type: String,
    default: 'cyclone',
  },
  severity: {
    type: String,
    default: 'Extreme',
  },
  langCode: {
    type: String,
    required: true,
  },
  langName: {
    type: String,
    required: true,
  },
  nativeName: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    enum: ['SMS', 'WHATSAPP', 'VOICE_IVR', 'CAP_BROADCAST', 'ALL_CHANNELS'],
    default: 'SMS',
  },
  recipientsCount: {
    type: Number,
    default: 150000,
  },
  deliveredCount: {
    type: Number,
    default: 148500,
  },
  deliveryRate: {
    type: String,
    default: '99.2%',
  },
  messageText: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    default: 'State Emergency Operation Centre (SEOC)',
  },
  status: {
    type: String,
    enum: ['QUEUED', 'TRANSMITTING', 'DELIVERED', 'FAILED'],
    default: 'DELIVERED',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BroadcastLog', BroadcastLogSchema);
