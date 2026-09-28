import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Users, 
  Send, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  LogOut, 
  BadgeCheck, 
  ShieldAlert, 
  Radio, 
  Zap, 
  Smartphone, 
  MessageSquare, 
  TowerControl, 
  PhoneCall, 
  AlertTriangle,
  Layers,
  ArrowLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audioSynth';

export default function AuthPage({ onNavigateToTab, onOpenSafety }) {
  const { currentUser, isAuthenticated, login, register, quickLogin, logout, mongoUsers, usersCount } = useAuth();

  // Active persona selection: 'volunteer' | 'citizen' | 'commander'
  const [selectedPersona, setSelectedPersona] = useState('citizen');
  // Mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    phone: '',
    location: '',
  });

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#3B82F6', '#10B981', '#F59E0B']
      });
    } catch {}
  };

  const handleQuickLogin = async (email, password = 'Password123!') => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    sound.playBlip();

    const res = await quickLogin(email, password);
    setLoading(false);

    if (res.success) {
      sound.playSuccessChime();
      triggerConfetti();
      setSuccessMsg(`Authenticated successfully as ${res.user.name} (${res.user.role})`);
    } else {
      setErrorMsg(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    sound.playBlip();

    if (authMode === 'signin') {
      const res = await login(formData.email, formData.password);
      setLoading(false);
      if (res.success) {
        sound.playSuccessChime();
        triggerConfetti();
        setSuccessMsg(`Welcome back, ${res.user.name}`);
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
    } else {
      // Registration
      if (!formData.name.trim()) {
        setLoading(false);
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!formData.email.trim()) {
        setLoading(false);
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (formData.password.length < 6) {
        setLoading(false);
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      const role = selectedPersona === 'volunteer' 
        ? 'Volunteer' 
        : selectedPersona === 'commander' 
        ? 'Disaster Management Officer' 
        : 'Citizen';

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        organization: formData.organization || (role === 'Volunteer' ? 'Disaster Relief Volunteer Corps' : 'Citizen Resident'),
        phone: formData.phone || '+91 94370 00000',
        location: formData.location || 'Odisha, India',
      };

      const res = await register(payload);
      setLoading(false);
      if (res.success) {
        sound.playSuccessChime();
        triggerConfetti();
        setSuccessMsg(`Account created! Logged in as ${res.user.name} (${res.user.role})`);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    }
  };

  const isCurrentVolunteer = currentUser?.role === 'Volunteer' || 
    currentUser?.role === 'Emergency Responder' || 
    currentUser?.role === 'Disaster Management Officer' || 
    currentUser?.role === 'Administrator' ||
    currentUser?.role === 'Citizen / Volunteer';

  const isCurrentCitizen = currentUser?.role === 'Citizen' || currentUser?.role === 'Normal User';

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 px-1 sm:px-2 animate-in fade-in duration-300">
      
      {/* 1. Header Navigation & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
              Access Control & Identity
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">Role-Gated Permissions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <span>Identity & Dispatch Authorization Portal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sign in as a <strong className="text-sky-300">Normal Citizen</strong> for personalized warnings and SOS reporting, or as a <strong className="text-emerald-300">Relief Volunteer</strong> with mass alert dispatch permissions.
          </p>
        </div>

        {onNavigateToTab && (
          <button
            onClick={() => onNavigateToTab('dashboard')}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-300 transition-all flex items-center gap-1.5 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
        )}
      </div>

      {/* 2. Active Session Card (If Logged In) */}
      {isAuthenticated && currentUser && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0C152E]/90 to-[#0A1D3D]/80 border border-white/15 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              isCurrentVolunteer 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20' 
                : 'bg-gradient-to-br from-sky-500 to-indigo-700 shadow-sky-500/20'
            }`}>
              {isCurrentVolunteer ? <ShieldCheck className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-white">{currentUser.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                  isCurrentVolunteer 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}>
                  {isCurrentVolunteer ? '🛡️ Relief Volunteer / Dispatcher' : '👥 Normal Citizen'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.08] text-slate-300">
                  {currentUser.badgeNumber || 'VERIFIED-ID'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span>{currentUser.organization || 'Odisha'}</span>
                <span>•</span>
                <span className="text-slate-300">{currentUser.location || 'Bhubaneswar'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Indicator */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              isCurrentVolunteer 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}>
              {isCurrentVolunteer ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public Broadcast: AUTHORIZED</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Public Broadcast: RESTRICTED</span>
                </>
              )}
            </div>

            {onNavigateToTab && isCurrentVolunteer && (
              <button
                onClick={() => onNavigateToTab('multilingual')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Launch Dispatch AI
              </button>
            )}

            <button
              onClick={() => {
                sound.playBlip();
                logout();
                setSuccessMsg('You have been signed out.');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* 3. Role Selector Showcase Grid (Normal Citizen vs Volunteer) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD 1: NORMAL CITIZEN PERSONA */}
        <div 
          onClick={() => {
            sound.playBlip();
            setSelectedPersona('citizen');
          }}
          className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
            selectedPersona === 'citizen'
              ? 'bg-[#0B1428]/95 border-sky-400/60 shadow-xl shadow-sky-500/10 ring-1 ring-sky-400/40'
              : 'bg-[#080D1C]/80 border-white/10 hover:border-white/20'
          }`}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <Users className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold border ${
                selectedPersona === 'citizen'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}>
                General Public
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Normal Citizen (Public)</span>
              {selectedPersona === 'citizen' && (
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Designed for residents, coastal villagers, and families seeking real-time vernacular storm alerts, safety protocols, and emergency shelter locations.
            </p>

            {/* Permission Matrix for Citizen */}
            <div className="mt-4 space-y-2 p-3 rounded-xl bg-black/30 border border-white/[0.06] text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Vernacular Dialect Alerts (12+ Indic)
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Cyclone Shelter Directory & Helplines
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ground Incident & SOS Reporting
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Send Mass Messages to People
                </span>
                <span className="text-amber-400 font-mono font-bold text-[10px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  Restricted
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Quick Login for Citizen */}
          <div className="mt-4 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickLogin('citizen@resona.org', 'Password123!');
              }}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-200 text-xs font-semibold flex items-center justify-between transition-all group-hover:border-sky-400/50"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>1-Click Sign In as Citizen (Sunita Nayak)</span>
              </div>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded">
                CIT-8821
              </span>
            </button>
          </div>
        </div>

        {/* CARD 2: DISASTER RELIEF VOLUNTEER PERSONA */}
        <div 
          onClick={() => {
            sound.playBlip();
            setSelectedPersona('volunteer');
          }}
          className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
            selectedPersona === 'volunteer'
              ? 'bg-[#0B1824]/95 border-emerald-400/60 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-400/40'
              : 'bg-[#080D1C]/80 border-white/10 hover:border-white/20'
          }`}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold border ${
                selectedPersona === 'volunteer'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}>
                Authorized Dispatcher
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Disaster Relief Volunteer</span>
              {selectedPersona === 'volunteer' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Designated for field operatives, NGO volunteers, and first responders authorized to transmit disaster warning messages directly to citizens.
            </p>

            {/* Permission Matrix for Volunteer */}
            <div className="mt-4 space-y-2 p-3 rounded-xl bg-black/30 border border-white/[0.06] text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Send Messages to People (Broadcast)
                </span>
                <span className="text-emerald-400 font-mono font-bold text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  AUTHORIZED
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Multi-Channel (SMS, WhatsApp, Cell, IVR)
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Field Mesh Telemetry & Delivery Stats
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 pt-1.5 border-t border-white/[0.06]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Volunteer ID & Ground Sector Badge
                </span>
                <span className="text-cyan-300 font-mono text-[11px]">VOL-XXXX</span>
              </div>
            </div>
          </div>

          {/* 1-Click Quick Login for Volunteer */}
          <div className="mt-4 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickLogin('volunteer@resona.org', 'Password123!');
              }}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center justify-between transition-all group-hover:border-emerald-400/50"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Sign In as Volunteer (Ramesh Das)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                VOL-4022
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Interactive Credentials Form (Sign In / Register) */}
      <div className="rounded-2xl p-5 sm:p-6 bg-[#090F22]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
        
        {/* Switcher & Form Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              selectedPersona === 'volunteer' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
            }`}>
              {selectedPersona === 'volunteer' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {authMode === 'signin' ? 'Sign In Credentials' : `Register as New ${selectedPersona === 'volunteer' ? 'Relief Volunteer' : 'Citizen'}`}
              </h4>
              <p className="text-[11px] text-slate-400">
                {selectedPersona === 'volunteer' 
                  ? 'Volunteer credentials include broadcast dispatch authorization' 
                  : 'Citizen account provides personalized vernacular alerts and ground SOS reports'}
              </p>
            </div>
          </div>

          {/* Mode Switcher: Sign In vs Register */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setAuthMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                authMode === 'signin' ? 'bg-white/10 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setAuthMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                authMode === 'register' ? 'bg-white/10 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {authMode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={selectedPersona === 'volunteer' ? 'Ramesh Das' : 'Sunita Nayak'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94370 12345"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {selectedPersona === 'volunteer' ? 'Volunteer Organization / NGO *' : 'Locality / Resident Community'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder={selectedPersona === 'volunteer' ? 'Odisha Coastal Volunteer Corps' : 'Puri Coastal Resident'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  District / Sector Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Puri District, Odisha"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={selectedPersona === 'volunteer' ? 'volunteer@resona.org' : 'citizen@resona.org'}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password *
                </label>
                <span className="text-[10px] text-slate-500 font-mono">min 6 chars</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                {selectedPersona === 'volunteer'
                  ? 'Volunteer badge (VOL-XXXX) will be assigned automatically upon registration'
                  : 'Citizen ID (CIT-XXXX) created with personalized vernacular profile'
                }
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                selectedPersona === 'volunteer'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-500/25'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'signin' ? `Sign In as ${selectedPersona === 'volunteer' ? 'Volunteer' : 'Citizen'}` : `Create ${selectedPersona === 'volunteer' ? 'Volunteer' : 'Citizen'} Account`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* 5. Additional Commander / Admin Option & Personnel Sync */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Need official state command access?</span>
          <button
            onClick={() => handleQuickLogin('commander@resona.gov.in', 'Password123!')}
            className="text-cyan-400 hover:underline font-semibold font-mono"
          >
            Sign In as Commander Arjun Patel (CMD-1011) →
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          MongoDB Store: {usersCount} Registered Personnel
        </div>
      </div>

    </div>
  );
}
