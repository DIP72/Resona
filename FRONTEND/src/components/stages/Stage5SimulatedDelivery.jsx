import React, { useState } from 'react';
import { 
  Radio, 
  Wifi, 
  MessageSquare, 
  Smartphone, 
  Cpu, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  RotateCw,
  Sliders,
  Terminal,
  Activity
} from 'lucide-react';
import { sound } from '../../utils/audioSynth';

export default function Stage5SimulatedDelivery({
  alertData,
  onProceedToNext,
  onBackToPrevious
}) {
  const transData = alertData.transmissionData || {};
  
  // Simulation Controls
  const [networkSpeed, setNetworkSpeed] = useState('2G'); // 2G, LoRa, EDGE, 4G
  const [packetLossPct, setPacketLossPct] = useState(4);
  const [activeTab, setActiveTab] = useState('lora'); // 'lora', 'cap', 'sms'
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [activeHopIndex, setActiveHopIndex] = useState(-1);
  const [transmissionSuccess, setTransmissionSuccess] = useState(false);

  const speedConfigs = {
    LoRa: { label: 'LoRaWAN Mesh', speedKbps: 0.3, latency: '350 ms', desc: 'Long-range ultra-low bitrate offline mesh' },
    '2G': { label: '2G GSM / SMS', speedKbps: 9.6, latency: '180 ms', desc: 'Cellular fallback for rural keypad phones' },
    EDGE: { label: '2.5G EDGE', speedKbps: 64, latency: '95 ms', desc: 'Low-speed packet data network' },
    '4G': { label: '4G LTE / CAP', speedKbps: 10000, latency: '24 ms', desc: 'High-speed smartphone cell broadcast' },
  };

  const meshNodes = [
    { id: 0, name: 'State EOC Satellite Uplink', type: 'Gateway', rssi: '-56 dBm', snr: '+12.4 dB', freq: '868.1 MHz' },
    { id: 1, name: 'Regional BTS 2G Relay Tower', type: 'Tower Relay', rssi: '-72 dBm', snr: '+9.8 dB', freq: '868.3 MHz' },
    { id: 2, name: 'Gram Panchayat LoRa Repeater #3', type: 'Substation', rssi: '-88 dBm', snr: '+7.2 dB', freq: '868.5 MHz' },
    { id: 3, name: 'Village Feature Phone / Siren End-Node', type: 'Citizen Handset', rssi: '-96 dBm', snr: '+4.5 dB', freq: 'End Node' },
  ];

  const handleRunTransmissionTest = () => {
    setIsTransmitting(true);
    setTransmissionSuccess(false);
    setActiveHopIndex(0);
    sound.playPacketBeep();

    const hopDelay = networkSpeed === 'LoRa' ? 800 : networkSpeed === '2G' ? 500 : 300;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < meshNodes.length) {
        setActiveHopIndex(current);
        sound.playPacketBeep();
      } else {
        clearInterval(interval);
        setIsTransmitting(false);
        setTransmissionSuccess(true);
        sound.playSuccessChime();
      }
    }, hopDelay);
  };

  const handleNext = () => {
    sound.playBlip();
    onProceedToNext();
  };

  const handleBack = () => {
    sound.playBlip();
    onBackToPrevious();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Stage Overview */}
      <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-orange-400/20 text-orange-400 border border-orange-400/40">
              STAGE 05 OF 06
            </span>
            <h3 className="text-base font-bold font-display text-white tracking-wide">
              SIMULATED DELIVERY // LOW-BANDWIDTH & OFFLINE MESH CHANNELS
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Testing message transmission over ultra-constrained networks (2G SMS, OASIS CAP Protocol &lt; 1KB, and LoRaWAN mesh relay).
            Simulate packet loss and throttle bandwidth to guarantee last-mile reach.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F2FE] hover:bg-[#00d0de] text-slate-950 text-xs font-mono font-bold transition-all shadow-neon-cyan hover:scale-[1.02]"
          >
            <span>PROCEED TO VERIFICATION (STAGE 6)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Network Throttle & Packet Loss Sliders Row */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0C1327]/80 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Speed Profiles */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00F2FE]" />
              Network Throttle Channel:
            </span>
            <span className="text-cyan-400 font-bold">{speedConfigs[networkSpeed].label} ({speedConfigs[networkSpeed].speedKbps} kbps)</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {Object.keys(speedConfigs).map((k) => (
              <button
                key={k}
                onClick={() => {
                  sound.playBlip();
                  setNetworkSpeed(k);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all border ${
                  networkSpeed === k
                    ? 'bg-orange-500/20 text-orange-300 border-orange-400 shadow-[0_0_10px_rgba(255,107,0,0.3)]'
                    : 'bg-[#070B19] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Packet Loss Slider */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Simulated Packet Loss Rate:
            </span>
            <span className="text-amber-400 font-bold">{packetLossPct}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="45"
            step="1"
            value={packetLossPct}
            onChange={(e) => setPacketLossPct(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Test Transmission Trigger */}
        <div className="lg:col-span-3 flex justify-end">
          <button
            onClick={handleRunTransmissionTest}
            disabled={isTransmitting}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              isTransmitting
                ? 'bg-orange-900/60 text-orange-300 border border-orange-500 animate-pulse'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-slate-950 shadow-[0_0_15px_rgba(255,107,0,0.4)]'
            }`}
          >
            {isTransmitting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>PROPAGATING PACKET...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>TEST PACKET TRANSMISSION</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* LoRa Mesh Relay Packet Hops Visualization */}
      <div className="p-5 rounded-xl border border-orange-500/30 bg-[#0C1327]/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
            <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
              LORA MESH RELAY // MULTI-HOP PACKET TRACE (868 MHZ)
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-500/30">
            TOTAL HOPS: 3 | PAYLOAD: {transData.loraBytes || 48} BYTES
          </span>
        </div>

        {/* Multi-Hop Interactive Node Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {meshNodes.map((node, idx) => {
            const isCurrentHop = activeHopIndex === idx;
            const isVisited = activeHopIndex >= idx || transmissionSuccess;

            return (
              <div
                key={node.id}
                className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[145px] ${
                  isCurrentHop
                    ? 'bg-orange-500/20 border-orange-400 shadow-[0_0_15px_rgba(255,107,0,0.5)] scale-[1.03]'
                    : isVisited
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                    : 'bg-[#070B19]/70 border-slate-800 opacity-60'
                }`}
              >
                {/* Node Status Indicator Top */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-slate-300 border border-slate-700">
                    HOP #{idx}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isCurrentHop ? 'bg-orange-400 animate-ping' : isVisited ? 'bg-emerald-400' : 'bg-slate-600'
                    }`} />
                    <span className="text-[10px] font-mono text-slate-400">{node.freq}</span>
                  </div>
                </div>

                {/* Node Name */}
                <div>
                  <h5 className="text-xs font-bold font-sans text-white mb-0.5">{node.name}</h5>
                  <span className="text-[10px] font-mono text-orange-300 uppercase">{node.type}</span>
                </div>

                {/* Signal Metrics */}
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>RSSI: <b className="text-cyan-400">{node.rssi}</b></span>
                  <span>SNR: <b className="text-emerald-400">{node.snr}</b></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transmission Result Message */}
        {transmissionSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs font-mono text-emerald-300">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Packet delivered through all 3 hops. Ack token verified at gateway.
            </span>
            <span className="text-slate-400">Latency: 185 ms</span>
          </div>
        )}
      </div>

      {/* Channel Formats Protocol Viewer (CAP XML vs Compressed SMS/USSD) */}
      <div className="p-5 rounded-xl border border-slate-800 bg-[#0C1327]/90 space-y-4">
        
        {/* Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
              PROTOCOL PAYLOAD INSPECTOR
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { sound.playBlip(); setActiveTab('lora'); }}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                activeTab === 'lora' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              LoRa Hex (48 B)
            </button>
            <button
              onClick={() => { sound.playBlip(); setActiveTab('sms'); }}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                activeTab === 'sms' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              SMS / USSD (&lt;140 B)
            </button>
            <button
              onClick={() => { sound.playBlip(); setActiveTab('cap'); }}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                activeTab === 'cap' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              OASIS CAP XML (&lt;1 KB)
            </button>
          </div>
        </div>

        {/* Tab 1: LoRa Hex Payload */}
        {activeTab === 'lora' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Bit-Packed LoRaWAN Packet Structure:</span>
              <span className="text-orange-400 font-bold">{transData.loraBytes || 48} Bytes</span>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#070B19] border border-orange-500/30 text-xs font-mono text-orange-300 overflow-x-auto">
              {transData.loraPayloadHex || '0xAA5501FFA947C753CC4002D4E444D412D4C4153544D494C45'}
            </pre>
            <p className="text-[11px] text-slate-400">
              Packed binary format contains: 2B Sync + 1B Hazard Code + 1B Severity + 4B Lat + 4B Lng + 36B Plain Action ASCII.
            </p>
          </div>
        )}

        {/* Tab 2: Compressed SMS / USSD */}
        {activeTab === 'sms' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Compressed GSM-7 SMS String:</span>
                <span className="text-cyan-400 font-bold">{(transData.sms140 || '').length} / 140 Chars</span>
              </div>
              <div className="p-3 rounded-lg bg-[#070B19] border border-cyan-500/30 font-mono text-xs text-cyan-200">
                {transData.sms140 || '[EMERGENCY SEV] PURI: Severe storm approaching. Move to Cyclone Shelter now. Dial 112.'}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Interactive USSD Shortcode (Runs on 2G feature phones without data):</span>
                <span className="text-amber-400 font-bold">Zero Data Protocol</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#070B19] border border-amber-500/30 font-mono text-xs text-amber-300">
                {transData.ussdCode || '*999*1*OD#'}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: OASIS CAP v1.2 XML */}
        {activeTab === 'cap' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Standard OASIS Common Alerting Protocol v1.2 XML:</span>
              <span className="text-emerald-400 font-bold">{transData.capPacketSizeBytes || 842} Bytes (&lt; 1 KB)</span>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#070B19] border border-emerald-500/30 text-[11px] font-mono text-emerald-300 max-h-56 overflow-y-auto leading-relaxed">
              {transData.capXml || '<?xml version="1.0" encoding="UTF-8"?>...'}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
}
