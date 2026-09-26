import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Send, 
  Users, 
  Activity, 
  ArrowLeft, 
  Smartphone, 
  RotateCw,
  Sparkles,
  LifeBuoy,
  ShieldCheck,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audioSynth';

export default function Stage6Acknowledgement({
  alertData,
  telemetryData,
  onSendCitizenAck,
  onBackToPrevious,
  acksList = []
}) {
  const telem = telemetryData || {
    totalTargeted: 125000,
    sentCount: 125000,
    deliveredCount: 114860,
    acknowledgedCount: 106460,
    sosCount: 38,
    packetLossRate: 3.8,
    sectorReach: [
      { sectorId: 'SEC-A', name: 'Coastal Shoreline Belt A', deliveredPct: 96.2, ackCount: 29840, sosCount: 14, color: '#00F59B' },
      { sectorId: 'SEC-B', name: 'Mangrove Estuary B', deliveredPct: 88.5, ackCount: 22400, sosCount: 19, color: '#00F2FE' },
      { sectorId: 'SEC-C', name: 'Lowland Delta C', deliveredPct: 92.1, ackCount: 34100, sosCount: 5, color: '#FFB703' },
      { sectorId: 'SEC-D', name: 'Elevated Shelter Zone D', deliveredPct: 99.4, ackCount: 20120, sosCount: 0, color: '#00F59B' },
    ]
  };

  const [selectedSector, setSelectedSector] = useState('SEC-A');
  const [citizenName, setCitizenName] = useState('Puri Resident');
  const [deviceType, setDeviceType] = useState('FEATURE_PHONE_SMS');
  const [customMsg, setCustomMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveredPct = Math.round((telem.deliveredCount / Math.max(1, telem.totalTargeted)) * 100);
  const ackPct = Math.round((telem.acknowledgedCount / Math.max(1, telem.totalTargeted)) * 100);

  const handleAckAction = async (status, sosType = 'NONE') => {
    setIsSubmitting(true);
    sound.playBlip();

    if (status === 'SAFE') {
      sound.playSuccessChime();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {}
    } else {
      sound.playEmergencySiren(1.5);
    }

    const payload = {
      senderName: citizenName || 'Local Citizen',
      sectorId: selectedSector,
      sectorName: telem.sectorReach?.find(s => s.sectorId === selectedSector)?.name || 'Coastal Sector',
      deviceType,
      status, // 'SAFE' or 'SOS'
      sosType,
      message: customMsg || (status === 'SAFE' ? 'Arrived safely at concrete cyclone shelter.' : 'Flood water entered home, need rescue boat.'),
    };

    await onSendCitizenAck(payload);
    setIsSubmitting(false);
  };

  const handleBack = () => {
    sound.playBlip();
    onBackToPrevious();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Stage Overview */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
              STAGE 06 OF 06
            </span>
            <h3 className="text-base font-bold font-display text-white tracking-wide">
              LAST-MILE ACKNOWLEDGEMENT & TELEMETRY VERIFICATION
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live two-way verification loop documenting packet delivery rates, citizen acknowledgement confirmations,
            and real-time emergency SOS distress beacon alerts across rural sectors.
          </p>
        </div>

        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO DELIVERY</span>
        </button>
      </div>

      {/* Top 4 Real-time Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Targeted */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0C1327]/80">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Population Targeted</span>
          <div className="text-2xl font-bold font-display text-white mt-1">
            {telem.totalTargeted.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-cyan-400">
            <span>Mesh Broadcast Mode</span>
            <span>100% Coverage</span>
          </div>
        </div>

        {/* Metric 2: Packets Delivered */}
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#0C1327]/80 shadow-[0_0_10px_rgba(0,242,254,0.15)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-cyan-300 uppercase block">Packets Delivered</span>
            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              {deliveredPct}%
            </span>
          </div>
          <div className="text-2xl font-bold font-display text-[#00F2FE] mt-1">
            {telem.deliveredCount.toLocaleString()}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#00F2FE] h-full rounded-full transition-all" style={{ width: `${deliveredPct}%` }} />
          </div>
        </div>

        {/* Metric 3: Acknowledged (Safe) */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#0C1327]/80 shadow-[0_0_10px_rgba(0,245,155,0.15)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-emerald-300 uppercase block">Verified Read / Ack</span>
            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              {ackPct}%
            </span>
          </div>
          <div className="text-2xl font-bold font-display text-[#00F59B] mt-1">
            {telem.acknowledgedCount.toLocaleString()}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#00F59B] h-full rounded-full transition-all" style={{ width: `${ackPct}%` }} />
          </div>
        </div>

        {/* Metric 4: SOS Distress Alerts */}
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 shadow-neon-red">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-rose-300 uppercase block">Active SOS Tickets</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl font-bold font-display text-rose-400 mt-1">
            {telem.sosCount} Calls
          </div>
          <p className="text-[11px] text-rose-300 mt-2 font-mono">
            Rescue boats & medical teams dispatched
          </p>
        </div>

      </div>

      {/* Main Grid: Sector Heatmap (Left 7 Cols) + Interactive Citizen Simulator (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Sector Delivery Heatmap & Reach Grid (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-800 bg-[#0C1327]/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00F2FE]" />
              <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                RURAL SECTOR REACH HEATMAP // TELEMETRY GRID
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              RELIABILITY: 99.2%
            </span>
          </div>

          {/* Sector Bars */}
          <div className="space-y-3">
            {(telem.sectorReach || []).map((sec) => (
              <div 
                key={sec.sectorId}
                className="p-3.5 rounded-xl bg-[#070B19] border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color || '#00F2FE' }} />
                    <span className="font-bold text-white font-sans">{sec.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-400">Pop: <b className="text-white">{sec.population?.toLocaleString()}</b></span>
                    <span className="text-emerald-400">Ack: <b>{sec.ackCount?.toLocaleString()}</b></span>
                    {sec.sosCount > 0 && (
                      <span className="text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">
                        {sec.sosCount} SOS
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Reach Coverage</span>
                    <span style={{ color: sec.color || '#00F2FE' }}>{sec.deliveredPct}% Delivered</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${sec.deliveredPct}%`,
                        backgroundColor: sec.color || '#00F2FE'
                      }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Feed Ticker */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <h5 className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2">
              Recent Last-Mile Inbound Telemetry Packets:
            </h5>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {(acksList.length > 0 ? acksList : [
                { senderName: 'Village Gram Mukhiya #4', sectorName: 'Shoreline Belt A', status: 'SAFE', message: 'Evacuated 400 fishermen to shelter #4.', deviceType: 'FEATURE_PHONE_SMS' },
                { senderName: 'Resident R. Jena', sectorName: 'Mangrove Estuary B', status: 'SOS', message: 'Water rising near tidal bund, 3 elderly need assistance.', deviceType: 'LORA_HANDHELD' },
                { senderName: 'Relay Substation #2', sectorName: 'Lowland Delta C', status: 'SAFE', message: 'Siren active. Message received via 2G broadcast.', deviceType: 'SMARTPHONE_APP' }
              ]).map((ack, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded-lg bg-[#070B19]/70 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${ack.status === 'SAFE' ? 'bg-[#00F59B]' : 'bg-rose-500 animate-ping'}`} />
                    <span className="text-white font-semibold">{ack.senderName}</span>
                    <span className="text-slate-500">({ack.sectorName})</span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded font-bold ${
                    ack.status === 'SAFE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  }`}>
                    {ack.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interactive Citizen Device Responder (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-cyan-500/30 bg-[#0C1327]/90 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#00F2FE]" />
                <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                  CITIZEN DEVICE RESPONDER
                </h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                TWO-WAY RELAY
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Test how an end-user on a 2G keypad phone or village radio responds back to the centralized command center.
            </p>

            {/* Simulated Response Form */}
            <div className="space-y-3 p-3.5 rounded-xl bg-[#070B19] border border-slate-800">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Citizen / Sender Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-[#0C1327] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-[#00F2FE]"
                  placeholder="Citizen name or ID"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Sector Location</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full bg-[#0C1327] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-[#00F2FE]"
                >
                  <option value="SEC-A">Sector A: Coastal Shoreline Belt</option>
                  <option value="SEC-B">Sector B: Mangrove Estuary Zone</option>
                  <option value="SEC-C">Sector C: Lowland Agricultural Delta</option>
                  <option value="SEC-D">Sector D: Elevated Shelter Zone</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Channel Device Type</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full bg-[#0C1327] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-[#00F2FE]"
                >
                  <option value="FEATURE_PHONE_SMS">2G Feature Phone (SMS / USSD)</option>
                  <option value="LORA_HANDHELD">LoRa Multi-Hop Handheld Transceiver</option>
                  <option value="SMARTPHONE_APP">Android / iOS Cell Broadcast App</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Optional Message / Note</label>
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="w-full bg-[#0C1327] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-[#00F2FE]"
                  placeholder="e.g. Arrived at Shelter 4 or water rising"
                />
              </div>
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              
              {/* Green Safe Ack */}
              <button
                onClick={() => handleAckAction('SAFE')}
                disabled={isSubmitting}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs flex flex-col items-center justify-center gap-1 shadow-neon-green transition-all hover:scale-[1.02]"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                <span>CONFIRM SAFE</span>
                <span className="text-[9px] font-normal text-slate-900">Arrived at shelter</span>
              </button>

              {/* Red SOS Distress */}
              <button
                onClick={() => handleAckAction('SOS', 'TRAPPED_WATER')}
                disabled={isSubmitting}
                className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs flex flex-col items-center justify-center gap-1 shadow-neon-red transition-all hover:scale-[1.02]"
              >
                <AlertOctagon className="w-5 h-5 text-white animate-bounce" />
                <span>SEND SOS</span>
                <span className="text-[9px] font-normal text-rose-200">Trapped / Medical Need</span>
              </button>

            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Direct MongoDB telemetry binding</span>
            <span className="text-emerald-400">Zero packet drops on uplink</span>
          </div>
        </div>

      </div>

    </div>
  );
}
