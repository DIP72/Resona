import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProcessFlowChart, { PIPELINE_STAGES } from './components/ProcessFlowChart';
import Stage1OfficialAlert from './components/stages/Stage1OfficialAlert';
import Stage2PlainLanguage from './components/stages/Stage2PlainLanguage';
import Stage3Translation from './components/stages/Stage3Translation';
import Stage4VisualVersion from './components/stages/Stage4VisualVersion';
import Stage5SimulatedDelivery from './components/stages/Stage5SimulatedDelivery';
import Stage6Acknowledgement from './components/stages/Stage6Acknowledgement';
import DevicePreviewModal from './components/DevicePreviewModal';
import AuthModal from './components/AuthModal';
import { sound } from './utils/audioSynth';

const API_BASE = '/api';

export default function App() {
  const [activeStage, setActiveStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([1]);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [dbStatus, setDbStatus] = useState('CHECKING');
  const [loading, setLoading] = useState(true);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Core Alert Data
  const [alertData, setAlertData] = useState({
    alertId: 'ALERT-INITIAL-DANA',
    presetKey: 'cyclone',
    title: 'Severe Cyclonic Storm "DANA" Imminent Landfall',
    category: 'Meteorological',
    severity: 'Extreme',
    urgency: 'Immediate',
    issuingAuthority: 'India Meteorological Department (IMD) & NDMA',
    rawTechnicalBulletin: `BULLETIN NO. 18 / MET-EOC-2024:
DEEP DEPRESSION OVER EAST-CENTRAL BAY OF BENGAL INTENSIFIED INTO A SEVERE CYCLONIC STORM "DANA".
SYSTEM PRESENTLY CENTRED AT LATITUDE 19.8°N AND LONGITUDE 85.8°E, APPROXIMATELY 180 KM SOUTH-SOUTHEAST OF PURI.
EXPECTED ISOBARIC PRESSURE MINIMA REACHING 972 HPA.
CONVECTIVE CYCLOGENESIS EXHIBITING SQUALLY WINDS WITH GALE SPEED COMMENCING 120-130 KMPH GUSTING TO 145 KMPH.
ASTRONOMICAL TIDE COUPLING ANTICIPATES INUNDATION BY STORM SURGE OF HEIGHT 1.5 TO 2.0 METERS OVER ASTRONOMICAL TIDE.
TOTAL PRECIPITATION EXCEEDING 250MM IN LOCALIZED ZONES.
ALL MARITIME TRAFFIC ORDERED TO VACATE. MANDATORY RELOCATION PROTOCOLS COMMENCED FOR LOW-LYING RIPARIAN COMMUNITES.`,
    affectedArea: {
      name: 'Puri & Jagatsinghpur Coastal Belt',
      state: 'Odisha',
      coordinates: { lat: 19.8135, lng: 85.8312 },
      radiusKm: 55,
    },
    plainLanguage: {
      threat: 'DANGEROUS CYCLONE STORM: Very heavy rain and violent winds hitting coastal Odisha soon. Trees, tin roofs, and power lines will collapse.',
      impactZone: 'Puri & Jagatsinghpur Coastal Belt within 55 km radius',
      actionableSteps: [
        'Immediately move to your nearest concrete Cyclone Shelter or pucca building.',
        'Stay away from the sea beach and rivers. Do not go out to look at the storm.',
        'Store 3 days of clean drinking water, dry food, and a torch/flashlight.',
        'Turn off your main electricity breaker and cooking gas cylinder now.'
      ],
      readabilityBefore: { gradeLevel: 14.8, fleschScore: 26.4, status: 'College Level - Complex' },
      readabilityAfter: { gradeLevel: 4.6, fleschScore: 91.2, status: '5th Grade - Universal' },
    },
    translations: [],
    visualAssets: {
      colorCode: '#FF0055',
      iconType: 'cyclone',
      evacuationShelters: [
        { id: 'SHELTER-01', name: 'Puri Multi-Purpose Cyclone Shelter #4', distanceKm: 2.4, capacity: 1200, occupied: 850, lat: 19.824, lng: 85.821, status: 'Open' },
        { id: 'SHELTER-02', name: 'Konark Government High School Pucca Relief Center', distanceKm: 8.7, capacity: 800, occupied: 420, lat: 19.891, lng: 86.094, status: 'Open' },
        { id: 'SHELTER-03', name: 'Astaranga Coastal Community Bunker', distanceKm: 14.2, capacity: 1500, occupied: 1100, lat: 19.982, lng: 86.265, status: 'Open' },
      ],
    },
    transmissionData: {
      capXml: '',
      capPacketSizeBytes: 864,
      sms140: '[EMERGENCY EXTREME] PURI: Dangerous cyclone hitting soon. Move to nearest Cyclone Shelter. Disconnect power. Dial 112 / 1077.',
      ussdCode: '*999*1*PURI#',
      loraPayloadHex: '0xAA5501FFA947C753CC4002D4E444D412D4C4153544D494C45',
      loraBytes: 48,
    }
  });

  const [presets, setPresets] = useState([]);
  const [telemetryData, setTelemetryData] = useState(null);
  const [acksList, setAcksList] = useState([]);

  // Fetch initial data from Backend & MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Health check
        const healthRes = await fetch(`${API_BASE}/health`).catch(() => null);
        if (healthRes && healthRes.ok) {
          const healthData = await healthRes.json();
          setDbStatus(healthData.mongoDb || 'ONLINE');
        }

        // Presets
        const presetsRes = await fetch(`${API_BASE}/presets`).catch(() => null);
        if (presetsRes && presetsRes.ok) {
          const presetsData = await presetsRes.json();
          setPresets(presetsData.presets || []);
        }

        // Active Alert from Backend
        const alertsRes = await fetch(`${API_BASE}/alerts`).catch(() => null);
        if (alertsRes && alertsRes.ok) {
          const alertsList = await alertsRes.json();
          if (alertsList.alerts && alertsList.alerts.length > 0) {
            const first = alertsList.alerts[0];
            setAlertData(first);

            // Fetch Telemetry for this alert
            const telemRes = await fetch(`${API_BASE}/alerts/${first.alertId}/telemetry`).catch(() => null);
            if (telemRes && telemRes.ok) {
              const telemJson = await telemRes.json();
              setTelemetryData(telemJson.telemetry);
            }

            // Fetch Acks
            const acksRes = await fetch(`${API_BASE}/alerts/${first.alertId}/acks`).catch(() => null);
            if (acksRes && acksRes.ok) {
              const acksJson = await acksRes.json();
              setAcksList(acksJson.acknowledgements || []);
            }
          }
        }
      } catch (err) {
        console.warn('Initial fetch note:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update alert data fields
  const handleAlertDataChange = (field, value) => {
    setAlertData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Switch scenario preset
  const handleSelectPreset = (presetKey) => {
    const found = presets.find(p => p.key === presetKey);
    if (!found) return;

    // Trigger backend creation or local update
    fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presetKey: found.key,
        title: found.title,
        category: found.category,
        severity: found.severity,
        urgency: found.urgency,
        issuingAuthority: found.issuingAuthority,
        rawTechnicalBulletin: found.rawTechnicalBulletin,
        affectedArea: found.affectedArea,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.alert) {
        setAlertData(data.alert);
        if (data.telemetry) setTelemetryData(data.telemetry);
      }
    })
    .catch(() => {
      // Local fallback
      setAlertData(prev => ({
        ...prev,
        presetKey: found.key,
        title: found.title,
        category: found.category,
        severity: found.severity,
        rawTechnicalBulletin: found.rawTechnicalBulletin,
        affectedArea: found.affectedArea,
        visualAssets: found.visualAssets || prev.visualAssets,
      }));
    });
  };

  // Citizen Acknowledgement or SOS dispatch
  const handleSendCitizenAck = async (ackPayload) => {
    const alertId = alertData.alertId || 'ALERT-INITIAL-DANA';
    try {
      const res = await fetch(`${API_BASE}/alerts/${alertId}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ackPayload),
      });
      const data = await res.json();
      if (data.updatedTelemetry) {
        setTelemetryData(data.updatedTelemetry);
      }
      if (data.acknowledgement) {
        setAcksList(prev => [data.acknowledgement, ...prev]);
      }
    } catch {
      // Local state fallback
      setAcksList(prev => [ackPayload, ...prev]);
      if (telemetryData) {
        setTelemetryData(prev => ({
          ...prev,
          acknowledgedCount: ackPayload.status === 'SAFE' ? prev.acknowledgedCount + 1 : prev.acknowledgedCount,
          sosCount: ackPayload.status === 'SOS' ? prev.sosCount + 1 : prev.sosCount,
        }));
      }
    }
  };

  // Run Full Pipeline 1-Click Automated Simulation
  const handleRunFullPipeline = () => {
    setIsRunningPipeline(true);
    sound.playBlip();

    const stagesSequence = [1, 2, 3, 4, 5, 6];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex += 1;
      if (currentIndex < stagesSequence.length) {
        const nextStage = stagesSequence[currentIndex];
        setActiveStage(nextStage);
        setCompletedStages(prev => Array.from(new Set([...prev, nextStage])));
        sound.playBlip();
      } else {
        clearInterval(interval);
        setIsRunningPipeline(false);
        sound.playSuccessChime();
        setIsDeviceModalOpen(true); // Open device preview upon completion
      }
    }, 1800);
  };

  // Step navigation
  const goToNextStage = () => {
    if (activeStage < 6) {
      const next = activeStage + 1;
      setActiveStage(next);
      setCompletedStages(prev => Array.from(new Set([...prev, next])));
    }
  };

  const goToPreviousStage = () => {
    if (activeStage > 1) {
      setActiveStage(activeStage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 flex flex-col font-sans selection:bg-[#00F2FE]/30 selection:text-[#00F2FE]">
      
      {/* 1. Futuristic Mission Control Header */}
      <Header
        onRunFullPipeline={handleRunFullPipeline}
        isRunningPipeline={isRunningPipeline}
        onToggleDeviceModal={() => setIsDeviceModalOpen(!isDeviceModalOpen)}
        isDeviceModalOpen={isDeviceModalOpen}
        dbStatus={dbStatus}
        currentStage={activeStage}
        severity={alertData.severity}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Mission Control Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* MongoDB Live Connection & Auth Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono shadow-[0_0_15px_rgba(0,242,254,0.06)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Database Storage:</span>
            <span className="text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              mongodb://localhost:27017/resona_db
            </span>
            <span className="hidden sm:inline text-slate-500">• users collection active</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleOpenAuthModal('login')} 
              className="text-cyan-400 hover:text-cyan-200 transition-colors font-medium flex items-center gap-1"
            >
              Sign In
            </button>
            <span className="text-slate-700">|</span>
            <button 
              onClick={() => handleOpenAuthModal('register')} 
              className="text-emerald-400 hover:text-emerald-200 transition-colors font-medium flex items-center gap-1"
            >
              + Register Account
            </button>
            <span className="text-slate-700">|</span>
            <button 
              onClick={() => handleOpenAuthModal('database')} 
              className="text-amber-400 hover:text-amber-200 transition-colors font-medium flex items-center gap-1"
            >
              Inspect MongoDB Users
            </button>
          </div>
        </div>

        {/* 2. Interactive Process Flow Chart (6 Stages matching slide) */}
        <section className="cyber-card p-5 rounded-2xl border border-cyan-500/25">
          <ProcessFlowChart
            activeStage={activeStage}
            onSelectStage={(stageId) => {
              setActiveStage(stageId);
              setCompletedStages(prev => Array.from(new Set([...prev, stageId])));
            }}
            completedStages={completedStages}
          />
        </section>

        {/* 3. Active Stage Workspace Canvas */}
        <section className="cyber-card p-6 rounded-2xl border border-cyan-500/20 relative min-h-[500px]">
          
          {activeStage === 1 && (
            <Stage1OfficialAlert
              alertData={alertData}
              onChangeAlertData={handleAlertDataChange}
              onSelectPreset={handleSelectPreset}
              onProceedToNext={goToNextStage}
              presets={presets}
              loading={loading}
            />
          )}

          {activeStage === 2 && (
            <Stage2PlainLanguage
              alertData={alertData}
              onProceedToNext={goToNextStage}
              onBackToPrevious={goToPreviousStage}
            />
          )}

          {activeStage === 3 && (
            <Stage3Translation
              alertData={alertData}
              onProceedToNext={goToNextStage}
              onBackToPrevious={goToPreviousStage}
            />
          )}

          {activeStage === 4 && (
            <Stage4VisualVersion
              alertData={alertData}
              onProceedToNext={goToNextStage}
              onBackToPrevious={goToPreviousStage}
            />
          )}

          {activeStage === 5 && (
            <Stage5SimulatedDelivery
              alertData={alertData}
              onProceedToNext={goToNextStage}
              onBackToPrevious={goToPreviousStage}
            />
          )}

          {activeStage === 6 && (
            <Stage6Acknowledgement
              alertData={alertData}
              telemetryData={telemetryData}
              onSendCitizenAck={handleSendCitizenAck}
              onBackToPrevious={goToPreviousStage}
              acksList={acksList}
            />
          )}

        </section>

      </main>

      {/* 4. Interactive Mobile & Hardware Device Simulator Modal */}
      <DevicePreviewModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        alertData={alertData}
        onSendCitizenAck={handleSendCitizenAck}
      />

      {/* 5. Personnel Authentication & MongoDB Access Portal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050813] py-4 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LASTMILE ALERT SYSTEM // KIIT KSAC HALL A - PROBLEM STATEMENT 1</span>
          <span className="text-cyan-400">Node.js Express + MongoDB Atlas/Local Engine Active</span>
        </div>
      </footer>

    </div>
  );
}
