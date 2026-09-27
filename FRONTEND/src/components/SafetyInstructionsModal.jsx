import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Home, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Package, 
  Radio, 
  Volume2, 
  Download,
  Info
} from 'lucide-react';
import { sound } from '../utils/audioSynth';

export default function SafetyInstructionsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('instructions'); // 'instructions' | 'shelters' | 'contacts' | 'kit'

  if (!isOpen) return null;

  const shelters = [
    {
      id: 'SHELTER-01',
      name: 'Puri Multi-Purpose Cyclone Shelter #4',
      distance: '2.4 km away',
      address: 'VIP Road, Near Baliapanda Beach, Puri',
      capacity: '1,200 persons',
      occupied: '850 occupied',
      status: 'Open & Operational',
      facilities: ['Generator Power', 'RO Drinking Water', 'Medical Doctor on Duty']
    },
    {
      id: 'SHELTER-02',
      name: 'Konark Government High School Relief Center',
      distance: '8.7 km away',
      address: 'Sun Temple Road, Konark, Puri District',
      capacity: '800 persons',
      occupied: '420 occupied',
      status: 'Open & Operational',
      facilities: ['Dry Ration Stock', 'Child Care Zone', 'Ambulance Station']
    },
    {
      id: 'SHELTER-03',
      name: 'Astaranga Coastal Community Bunker',
      distance: '14.2 km away',
      address: 'Fish Landing Port Sector, Astaranga',
      capacity: '1,500 persons',
      occupied: '1,100 occupied',
      status: 'High Occupancy',
      facilities: ['Satellite Ham Radio', 'Flood Boat Mooring', 'Emergency Kitchen']
    }
  ];

  const emergencyContacts = [
    { label: 'Disaster Management Helpline', number: '1070', note: 'Toll-free 24x7 Control Room' },
    { label: 'NDRF Central Control Room', number: '1078', note: 'National Disaster Response Force' },
    { label: 'All-in-One Emergency Responder', number: '112', note: 'Police, Fire, Ambulance' },
    { label: 'Emergency Medical & Trauma', number: '108', note: 'Govt. Ambulance Dispatch' },
    { label: 'Indian Coast Guard SAR', number: '1554', note: 'Maritime & Fisherman Rescue' },
    { label: 'Odisha State EOC (Bhubaneswar)', number: '0674-2534177', note: 'State Disaster Operations' }
  ];

  const safetyRules = [
    {
      type: 'during',
      title: 'During Cyclone Landfall & Violent Storm',
      dos: [
        'Stay indoors and keep away from all windows and tin roofs.',
        'Unplug all non-essential electrical appliances and turn off cooking gas cylinders.',
        'Keep mobile phones and emergency torches fully charged.',
        'Stay tuned to official IMD weather bulletins via battery-powered transistor radio.'
      ],
      donts: [
        'Do NOT venture outside to look at the calm "eye of the storm".',
        'Do NOT touch fallen electric cables or walk through flooded electrical installations.',
        'Do NOT spread unverified rumors on social media — rely solely on NDMA/IMD.'
      ]
    },
    {
      type: 'flood',
      title: 'During Flood Inundation & Rising Waters',
      dos: [
        'Move quickly to higher ground or upper floor pucca concrete structures.',
        'Boil all drinking water or use chlorine purification tablets.',
        'Watch for snakes and venomous insects seeking high dry refuge.'
      ],
      donts: [
        'Do NOT attempt to drive or walk through flowing floodwaters (6 inches can knock down adults).',
        'Do NOT consume flood-contaminated food grains or produce.'
      ]
    }
  ];

  const kitItems = [
    { name: 'Clean Drinking Water', desc: 'At least 3 litres per person per day (3-day supply)' },
    { name: 'Non-Perishable Dry Food', desc: 'Chuda (flattened rice), biscuits, dry fruits, energy bars' },
    { name: 'LED Torch & Extra Batteries', desc: 'Heavy duty waterproof flashlight' },
    { name: 'Battery Powered Radio', desc: 'To receive emergency FM/AM transmissions' },
    { name: 'First Aid Kit & Prescriptions', desc: 'Antiseptic, bandages, ORS packets, essential personal medications' },
    { name: 'Waterproof Document Pouch', desc: 'Aadhaar, Voter ID, Ration card, Land deeds, Bank passbooks, Cash' },
    { name: 'Emergency Whistle & Power Bank', desc: 'To signal rescue boats/helicopters and keep phones alive' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-3xl bg-[#0D162E] border border-rose-600/50 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Glowing Alert Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950/60 to-[#0D162E] border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/25 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-display">
                  EMERGENCY PROTOCOLS & SAFETY INSTRUCTIONS
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-900/80 text-rose-200 border border-rose-500/40">
                  RED ALERT ACTIVE
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Official NDMA & Odisha Disaster Management Guidelines
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-[#0B1327] overflow-x-auto">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'instructions'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Safety Instructions
          </button>

          <button
            onClick={() => setActiveTab('shelters')}
            className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'shelters'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Nearest Shelters (3)
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'contacts'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Emergency Contacts
          </button>

          <button
            onClick={() => setActiveTab('kit')}
            className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'kit'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Disaster Kit Checklist
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: SAFETY INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              
              {/* Emergency Banner */}
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-100 leading-snug">
                  <span className="font-bold block text-rose-200 mb-0.5">MANDATORY EVACUATION PROTOCOL:</span>
                  All citizens residing within 5 km of the sea beach, kuccha mud/tin houses, and low-lying riverbanks in Puri & Jagatsinghpur are ordered to evacuate immediately to designated Cyclone Shelters.
                </div>
              </div>

              {/* Safety Rules Accordions */}
              {safetyRules.map((rule, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#111C38] border border-[#1E2C4F] space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>{rule.title}</span>
                  </h4>

                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                      ✓ What You MUST DO:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-200">
                      {rule.dos.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1.5">
                      ✗ What You MUST NOT DO:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {rule.donts.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-rose-950 text-rose-400 border border-rose-600/40 flex items-center justify-center text-[10px] shrink-0 font-bold">
                            ✕
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: NEAREST SHELTERS */}
          {activeTab === 'shelters' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Authorized government pucca cyclone shelters equipped with solar generators, clean water, and medical aid:
              </p>

              <div className="space-y-3">
                {shelters.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-[#111C38] border border-[#1E2C4F] hover:border-[#38BDF8]/60 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{s.name}</h4>
                        <p className="text-xs text-slate-400">{s.address}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 font-mono block">{s.distance}</span>
                        <span className="text-[10px] text-slate-400">{s.capacity} • {s.occupied}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {s.facilities.map((fac, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-[#38BDF8] border border-blue-500/30">
                            {fac}
                          </span>
                        ))}
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Official toll-free emergency phone helplines active 24x7 across India and coastal disaster zones:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {emergencyContacts.map((c) => (
                  <div key={c.number} className="p-3.5 rounded-xl bg-[#111C38] border border-[#1E2C4F] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{c.label}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.note}</p>
                    </div>
                    <a
                      href={`tel:${c.number.replace(/[^0-9]/g, '')}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-sm font-mono flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{c.number}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DISASTER KIT CHECKLIST */}
          {activeTab === 'kit' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Pack an emergency grab-and-go backpack now before power outage and road blockages:
              </p>

              <div className="space-y-2">
                {kitItems.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#111C38] border border-[#1E2C4F] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0B1327] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-5">
          <span>NDMA National Disaster Control // Odisha Emergency Portal</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Safety Hub
          </button>
        </div>

      </div>

    </div>
  );
}
