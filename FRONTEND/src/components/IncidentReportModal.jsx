import React, { useState } from 'react';
import { X, AlertCircle, Send, CheckCircle2, MapPin } from 'lucide-react';
import { sound } from '../utils/audioSynth';

export default function IncidentReportModal({ isOpen, onClose, location }) {
  const [incidentType, setIncidentType] = useState('tree_fall');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState(location ? location.city : 'Bhubaneswar');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md weather-card bg-[#0F1526]/95 border border-white/10 rounded-2xl shadow-2xl p-5 overflow-hidden">
        
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-teal-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold text-sm text-white">Report an issue or ask for help</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-semibold text-white">Report received by local responders</h4>
            <p className="text-xs text-slate-300">Local emergency and municipal response teams have been notified.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">What is happening?</label>
              <select 
                value={incidentType} 
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="tree_fall" className="bg-[#111827]">Fallen tree or road blockage</option>
                <option value="power_down" className="bg-[#111827]">Power line down or electrical hazard</option>
                <option value="water_breach" className="bg-[#111827]">Waterlogging or flooded street</option>
                <option value="stranded_citizens" className="bg-[#111827]">Stranded elders or families needing help</option>
                <option value="medical_sos" className="bg-[#111827]">Medical emergency or ambulance assistance</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Location or landmark</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Near Master Canteen, Ward 12, Bhubaneswar"
                  className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Details (optional description)</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current situation, water level, or if someone needs urgent care..."
                className="w-full p-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send report to local responders</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
