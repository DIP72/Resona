/**
 * Telemetry & Network Propagation Simulator
 * Simulates real-time packet propagation through multi-hop mesh nodes and rural sectors.
 */

function generateInitialTelemetry(alertId, alertData) {
  const areaName = alertData.affectedArea?.name || 'Coastal Belt';
  
  const meshHops = [
    {
      hopIndex: 0,
      nodeId: 'GW-HQ-01',
      nodeName: 'State EOC Satellite Gateway',
      nodeType: 'Gateway',
      rssi: -58,
      snr: 12.4,
      latencyMs: 14,
      status: 'ONLINE',
    },
    {
      hopIndex: 1,
      nodeId: 'TWR-RELAY-04',
      nodeName: `${areaName} Cellular 2G BTS Tower`,
      nodeType: 'Tower_Relay',
      rssi: -74,
      snr: 9.8,
      latencyMs: 48,
      status: 'RELAYING',
    },
    {
      hopIndex: 2,
      nodeId: 'LORA-NODE-12',
      nodeName: 'Gram Panchayat LoRa Repeater #3',
      nodeType: 'Village_Transceiver',
      rssi: -88,
      snr: 7.2,
      latencyMs: 120,
      status: 'ACKED',
    },
    {
      hopIndex: 3,
      nodeId: 'END-DEV-99',
      nodeName: 'Sector Fishermen Handset / Siren Node',
      nodeType: 'Citizen_Handset',
      rssi: -96,
      snr: 4.5,
      latencyMs: 185,
      status: 'ACKED',
    },
  ];

  const sectorReach = [
    {
      sectorId: 'SEC-A',
      name: `${areaName} - Shoreline Belt A`,
      category: 'Coastal Fishermen Belt',
      population: 34000,
      deliveredPct: 96.2,
      ackCount: 29840,
      sosCount: 14,
      signalLevel: 'STRONG',
      color: '#00F59B',
    },
    {
      sectorId: 'SEC-B',
      name: `${areaName} - Mangrove Estuary B`,
      category: 'Tidal Inundation Zone',
      population: 28500,
      deliveredPct: 88.5,
      ackCount: 22400,
      sosCount: 19,
      signalLevel: 'FAIR',
      color: '#00F2FE',
    },
    {
      sectorId: 'SEC-C',
      name: `${areaName} - Lowland Delta C`,
      category: 'Agricultural Hamlets',
      population: 41200,
      deliveredPct: 92.1,
      ackCount: 34100,
      sosCount: 5,
      signalLevel: 'STRONG',
      color: '#FFB703',
    },
    {
      sectorId: 'SEC-D',
      name: `${areaName} - Elevated Shelter Zone D`,
      category: 'Concrete Relief Base',
      population: 21300,
      deliveredPct: 99.4,
      ackCount: 20120,
      sosCount: 0,
      signalLevel: 'STRONG',
      color: '#00F59B',
    },
  ];

  const totalTargeted = 125000;
  const deliveredCount = 114860;
  const acknowledgedCount = 106460;
  const sosCount = 38;

  return {
    alertId,
    totalTargeted,
    sentCount: totalTargeted,
    deliveredCount,
    acknowledgedCount,
    sosCount,
    packetLossRate: 3.8,
    simulatedBandwidthKbps: 9.6,
    networkMode: 'LoRa_MESH',
    meshHops,
    sectorReach,
    channelStats: {
      capBroadcast: { sent: 45000, delivered: 44100, fail: 900 },
      compressedSms: { sent: 55000, delivered: 51200, fail: 3800 },
      loraMesh: { sent: 25000, delivered: 23960, fail: 1040 },
      communitySiren: { triggered: true, activeStations: 18 },
    },
  };
}

module.exports = {
  generateInitialTelemetry,
};
