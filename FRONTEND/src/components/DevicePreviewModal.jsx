import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Radio, 
  Volume2, 
  BellRing, 
  ShieldAlert, 
  Check, 
  AlertTriangle,
  Send,
  LifeBuoy
} from 'lucide-react';
import { sound } from '../utils/audioSynth';

export default function DevicePreviewModal({
  isOpen,
  onClose,
  alertData,
  onSendCitizenAck
}) {
  if (!isOpen) return null;

  const [deviceTab, setDeviceTab] = useState('phone'); // 'phone' (feature phone), 'smart' (smartphone), 'siren' (PA speaker)
  const [featurePhoneSent, setFeaturePhoneSent] = useState(false);

  const transData = alertData?.transmissionData || {};
  const smsText = transData.sms140 || `[EMERGENCY SEV] ${alertData?.affectedArea?.name || 'COAST'}: Severe storm approaching. Move to nearest Cyclone Shelter. Dial 112.`;
  const threatTitle = alertData?.plainLanguage?.threat || alertData?.title || 'Severe Disaster Warning';

  const handleFeaturePhoneReply = (replyCode) => {
    sound.playPacketBeep();
    setFeaturePhoneSent(true);
    setTimeout(() => setFeaturePhoneSent(false), 3000);

    onSendCitizenAck({
      senderName: 'Nokia 1100 Citizen #492',
      sectorId: 'SEC-A',
      sectorName: 'Shoreline Belt A',
      deviceType: 'FEATURE_PHONE_SMS',
      status: replyCode === '1' ? 'SAFE' : 'SOS',
      sosType: replyCode === '2' ? 'TRAPPED_WATER' : 'NONE',
      message: replyCode === '1' ? 'SMS: SAFE AT SHELTER' : 'SMS: SOS NEED BOAT',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0C1327] border border-cyan-500/40 rounded-2xl shadow-neon-cyan overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070B19]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#00F2FE]" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
              LAST-MILE DEVICE HARDWARE PREVIEW
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Device Switcher */}
            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => { sound.playBlip(); setDeviceTab('phone'); }}
                className={`px-3 py-1 rounded-md transition-all ${
                  deviceTab === 'phone' ? 'bg-[#00F2FE] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                2G Feature Phone
              </button>
              <button
                onClick={() => { sound.playBlip(); setDeviceTab('smart'); }}
                className={`px-3 py-1 rounded-md transition-all ${
                  deviceTab === 'smart' ? 'bg-[#00F2FE] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Smartphone (CAP)
              </button>
              <button
                onClick={() => { sound.playBlip(); setDeviceTab('siren'); }}
                className={`px-3 py-1 rounded-md transition-all ${
                  deviceTab === 'siren' ? 'bg-[#00F2FE] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                LoRa PA Siren
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Device Body Container */}
        <div className="p-6 overflow-y-auto flex items-center justify-center min-h-[460px] bg-[#050813]">
          
          {/* TAB 1: 2G Nokia Style Feature Phone */}
          {deviceTab === 'phone' && (
            <div className="flex flex-col items-center">
              {/* Feature Phone Casing */}
              <div className="w-64 bg-[#1E293B] border-4 border-[#334155] rounded-[38px] p-4 shadow-2xl flex flex-col items-center">
                
                {/* Earpiece Speaker Slit */}
                <div className="w-12 h-1.5 bg-[#475569] rounded-full mb-3" />

                {/* Monochrome LCD Screen (Retro Green Glow) */}
                <div className="w-full bg-[#8CA473] text-[#14230D] font-mono text-[11px] rounded-lg p-2.5 border-2 border-[#5C7443] shadow-inner min-h-[140px] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between border-b border-[#5C7443] pb-1 text-[9px] font-bold">
                      <span>BSNL 2G ▮▮▮▮</span>
                      <span>18:35</span>
                    </div>
                    <div className="mt-1.5 font-bold uppercase tracking-wide text-[10px]">
                      [1 NEW URGENT SMS]
                    </div>
                    <p className="mt-1 text-[10px] leading-tight font-semibold">
                      {smsText}
                    </p>
                  </div>

                  <div className="border-t border-[#5C7443] pt-1 text-[9px] flex justify-between font-bold">
                    <span>Reply: 1=SAFE</span>
                    <span>2=SOS</span>
                  </div>
                </div>

                {/* Brand label */}
                <div className="text-[10px] font-bold font-mono tracking-widest text-slate-400 my-2">
                  NOKIA 1100 RURAL
                </div>

                {/* Keypad Buttons */}
                <div className="w-full grid grid-cols-3 gap-1.5 pt-1">
                  {/* D-Pad Center */}
                  <div className="col-span-3 flex justify-center mb-1">
                    <div className="w-14 h-5 bg-[#334155] rounded-full border border-slate-600" />
                  </div>
                  {/* Keys 1-9, *, 0, # */}
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                    <button
                      key={k}
                      onClick={() => (k === '1' || k === '2') && handleFeaturePhoneReply(k)}
                      className={`h-8 rounded-lg border text-xs font-mono font-bold flex flex-col items-center justify-center transition-all ${
                        k === '1'
                          ? 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border-emerald-500/50 active:scale-95'
                          : k === '2'
                          ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-300 border-rose-500/50 active:scale-95'
                          : 'bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>{k}</span>
                      {k === '1' && <span className="text-[7px] text-emerald-400">SAFE</span>}
                      {k === '2' && <span className="text-[7px] text-rose-400">SOS</span>}
                    </button>
                  ))}
                </div>

                {featurePhoneSent && (
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 animate-pulse">
                    ✓ SMS Sent to 112 Gateway
                  </div>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400 mt-3">
                Simulated 2G GSM-7 SMS with zero-internet keypad response.
              </span>
            </div>
          )}

          {/* TAB 2: Smartphone Android/iOS Emergency Cell Broadcast */}
          {deviceTab === 'smart' && (
            <div className="flex flex-col items-center">
              <div className="w-72 bg-[#000000] border-4 border-slate-700 rounded-[44px] p-3 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
                
                {/* Dynamic Island / Camera cutout */}
                <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2" />

                {/* Smartphone Lockscreen with Flashing Emergency Modal */}
                <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-500 shadow-neon-red text-center space-y-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-rose-600/30 border border-rose-400 mx-auto flex items-center justify-center">
                    <ShieldAlert className="w-7 h-7 text-white animate-bounce" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-600 text-white font-bold tracking-wider">
                      EMERGENCY ALERT // CAP BROADCAST
                    </span>
                    <h4 className="text-sm font-bold text-white font-sans mt-2">
                      {threatTitle}
                    </h4>
                    <p className="text-xs text-rose-200 mt-1 leading-snug">
                      {(alertData?.plainLanguage?.actionableSteps || [])[0] || 'Move to the nearest Cyclone Shelter immediately.'}
                    </p>
                  </div>

                  {/* Actions on lockscreen */}
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => {
                        sound.playSuccessChime();
                        onSendCitizenAck({
                          senderName: 'Android 5G User #119',
                          sectorId: 'SEC-A',
                          deviceType: 'SMARTPHONE_APP',
                          status: 'SAFE',
                          message: 'Smartphone: Tapped Acknowledge Safe'
                        });
                      }}
                      className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all"
                    >
                      ACKNOWLEDGE: SAFE
                    </button>
                    <button
                      onClick={() => {
                        sound.playEmergencySiren(1.5);
                        onSendCitizenAck({
                          senderName: 'Android 5G User #119',
                          sectorId: 'SEC-A',
                          deviceType: 'SMARTPHONE_APP',
                          status: 'SOS',
                          message: 'Smartphone: Tapped Trigger SOS'
                        });
                      }}
                      className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono transition-all"
                    >
                      TRIGGER DISASTER SOS (112)
                    </button>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-4" />
              </div>
              <span className="text-xs font-mono text-slate-400 mt-3">
                Full-screen intrusive cell broadcast pop-up bypassing Silent/Do Not Disturb mode.
              </span>
            </div>
          )}

          {/* TAB 3: Village LoRa Public Address Speaker Siren */}
          {deviceTab === 'siren' && (
            <div className="flex flex-col items-center max-w-sm text-center">
              <div className="p-6 rounded-2xl bg-[#070B19] border-2 border-amber-500 shadow-neon-amber flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center animate-pulse">
                  <BellRing className="w-10 h-10 text-amber-400 animate-bounce" />
                </div>

                <div>
                  <h4 className="text-base font-bold font-display text-white">
                    PANCHAYAT PUBLIC ADDRESS SIREN TOWER
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Solar-Powered LoRa Mesh Node with 120 dB Horn Loudspeaker
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0C1327] border border-slate-800 text-xs font-mono text-amber-300 w-full text-left space-y-1">
                  <div>Frequency: <span className="text-white">868.5 MHz LoRaWAN</span></div>
                  <div>Power: <span className="text-emerald-400">Solar Backup 100% (48V LiFePO4)</span></div>
                  <div>Broadcast Sound: <span className="text-rose-400">120 dB High-Decibel Chime</span></div>
                </div>

                <button
                  onClick={() => sound.playEmergencySiren(3)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-neon-amber"
                >
                  TEST LOCAL SIREN SOUND (WEB AUDIO)
                </button>
              </div>
              <span className="text-xs font-mono text-slate-400 mt-3">
                Autonomous community loudspeaker designed for citizens with zero phones or electricity.
              </span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#070B19] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Target Audience: 100% Inclusivity</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
