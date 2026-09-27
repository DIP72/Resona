import React, { useState } from 'react';
import { X, AlertOctagon, Send, CheckCircle2, MapPin } from 'lucide-react';
import { sound } from '../utils/audioSynth';

export default function IncidentReportModal({ isOpen, onClose, location }) {
  const [incidentType, setIncidentType] = useState('tree_fall');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState(location ? location.city : 'Puri');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.playSuccessChime();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0D162E] border border-[#1E2C4F] rounded-2xl shadow-2xl p-5 overflow-hidden">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Report Ground Disaster Incident</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-white">Incident Dispatched to District EOC!</h4>
            <p className="text-xs text-slate-300">NDRF & local emergency responders have been notified with coordinates.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Incident Classification:</label>
              <select 
                value={incidentType} 
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 bg-[#111C38] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="tree_fall">Tree Fall / Road Blockage</option>
                <option value="power_down">Snapped High-Tension Electric Wire</option>
                <option value="water_breach">Embankment Breach / Severe Inundation</option>
                <option value="stranded_citizens">Stranded Vulnerable Citizens Needing Rescue</option>
                <option value="medical_sos">Critical Medical Emergency / Oxygen Need</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">District / Ward / Landmark:</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Baliapanda, Ward 12, Puri"
                  className="w-full pl-9 pr-3 py-2 bg-[#111C38] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Situation Details:</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current severity, number of affected people, water height..."
                className="w-full p-2.5 bg-[#111C38] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Incident to Responders</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
