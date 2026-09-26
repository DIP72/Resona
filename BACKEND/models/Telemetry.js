const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    index: true,
  },
  totalTargeted: {
    type: Number,
    default: 125000,
  },
  sentCount: {
    type: Number,
    default: 0,
  },
  deliveredCount: {
    type: Number,
    default: 0,
  },
  acknowledgedCount: {
    type: Number,
    default: 0,
  },
  sosCount: {
    type: Number,
    default: 0,
  },
  packetLossRate: {
    type: Number,
    default: 4.2, // percentage
  },
  simulatedBandwidthKbps: {
    type: Number,
    default: 9.6, // 2G speed
  },
  networkMode: {
    type: String,
    enum: ['2G_GSM', 'LoRa_MESH', 'EDGE', 'CAP_BROADCAST'],
    default: 'LoRa_MESH',
  },
  meshHops: [
    {
      hopIndex: Number,
      nodeId: String,
      nodeName: String,
      nodeType: String, // 'Gateway', 'Tower_Relay', 'Village_Transceiver', 'Citizen_Handset'
      rssi: Number,     // e.g. -88 dBm
      snr: Number,      // e.g. +7.5 dB
      latencyMs: Number,
      status: String,   // 'ONLINE', 'RELAYING', 'ACKED'
    },
  ],
  sectorReach: [
    {
      sectorId: String,
      name: String,
      category: String, // Coastal / Estuary / Inlands / Relief Center
      population: Number,
      deliveredPct: Number,
      ackCount: Number,
      sosCount: Number,
      signalLevel: String, // 'STRONG', 'FAIR', 'CRITICAL_LOW'
      color: String,
    },
  ],
  channelStats: {
    capBroadcast: { sent: Number, delivered: Number, fail: Number },
    compressedSms: { sent: Number, delivered: Number, fail: Number },
    loraMesh: { sent: Number, delivered: Number, fail: Number },
    communitySiren: { triggered: Boolean, activeStations: Number },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Telemetry', TelemetrySchema);
