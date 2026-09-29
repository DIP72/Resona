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
            <span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Access control & identity
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-sans">Role permissions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mt-1.5 flex items-center gap-2.5">
            <span>Identity & dispatch portal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Sign in as a <strong className="text-cyan-300 font-medium">Resident citizen</strong> for personalized warnings and SOS reporting, or as a <strong className="text-emerald-300 font-medium">Relief volunteer</strong> with mass alert dispatch permissions.
          </p>
        </div>

        {onNavigateToTab && (
          <button
            onClick={() => onNavigateToTab('dashboard')}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Back to dashboard
          </button>
        )}
      </div>

      {/* 2. Active Session Card (If Logged In) */}
      {isAuthenticated && currentUser && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#091124]/90 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isCurrentVolunteer 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20' 
                : 'bg-gradient-to-br from-cyan-500 to-blue-700 shadow-cyan-500/20'
            }`}>
              {isCurrentVolunteer ? <ShieldCheck className="w-6 h-6 text-white stroke-[1.8]" /> : <User className="w-6 h-6 text-white stroke-[1.8]" />}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-semibold text-white font-sans">{currentUser.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-medium ${
                  isCurrentVolunteer 
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' 
                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                }`}>
                  {isCurrentVolunteer ? 'Relief volunteer' : 'Resident citizen'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/[0.06] text-slate-400 border border-white/10">
                  {currentUser.badgeNumber || 'VERIFIED-ID'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap font-sans">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span>{currentUser.organization || 'Odisha Disaster Response'}</span>
                <span>•</span>
                <span className="text-slate-300">{currentUser.location || 'Bhubaneswar'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Indicator Chip */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              isCurrentVolunteer 
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
            }`}>
              {isCurrentVolunteer ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                  <span>Broadcast access: <strong className="font-semibold text-emerald-200">Authorized</strong></span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                  <span>Broadcast access: <strong className="font-semibold text-amber-200">Restricted</strong></span>
                </>
              )}
            </div>

            {onNavigateToTab && isCurrentVolunteer && (
              <button
                onClick={() => onNavigateToTab('multilingual')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium text-xs shadow-md shadow-cyan-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 stroke-[1.8]" /> Open alert engine
              </button>
            )}

            <button
              onClick={() => {
                sound.playBlip();
                logout();
                setSuccessMsg('You have been signed out.');
              }}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/15 hover:text-rose-300 text-slate-300 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" /> Sign out
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
          className={`relative p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group shadow-lg ${
            selectedPersona === 'citizen'
              ? 'bg-[#0B152B]/95 border-cyan-500/40 shadow-cyan-500/10 ring-1 ring-cyan-400/30'
              : 'bg-[#080E1E]/80 border-white/10 hover:border-white/20'
          }`}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Users className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className={`text-xs font-sans px-3 py-1 rounded-full font-medium ${
                selectedPersona === 'citizen'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}>
                General public
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-normal font-sans flex items-center gap-2">
              <span>Resident citizen</span>
              {selectedPersona === 'citizen' && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 stroke-[1.8]" />
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
              Designed for residents, coastal communities, and families seeking real-time vernacular storm alerts, safety protocols, and emergency shelter locations.
            </p>

            {/* Permission Matrix for Citizen */}
            <div className="mt-4 space-y-2.5 p-3.5 rounded-xl bg-black/30 border border-white/[0.06] text-xs font-sans">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Vernacular dialect alerts (12+ Indic)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/20">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Cyclone shelter directory & helplines
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/20">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ground incident & SOS reporting
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/20">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-white/[0.06]">
                <span className="flex items-center gap-2 text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                  Mass alert broadcasting to public
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-medium border border-amber-500/25">
                  Restricted
                </span>
              </div>
            </div>
          </div>

          {/* Friendly Account Badge Quick Login for Citizen */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickLogin('citizen@resona.org', 'Password123!');
              }}
              disabled={loading}
              className="w-full py-2.5 px-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-200 text-xs font-medium flex items-center justify-between transition-all group-hover:border-cyan-400/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-semibold text-xs">
                  SN
                </div>
                <div className="text-left">
                  <span className="text-white font-medium block">Sunita Nayak</span>
                  <span className="text-[11px] text-slate-400">Resident Citizen</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/20">
                  ID: CIT-8821
                </span>
                <span className="text-xs text-cyan-400 font-medium">Sign in →</span>
              </div>
            </button>
          </div>
        </div>

        {/* CARD 2: DISASTER RELIEF VOLUNTEER PERSONA */}
        <div 
          onClick={() => {
            sound.playBlip();
            setSelectedPersona('volunteer');
          }}
          className={`relative p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group shadow-lg ${
            selectedPersona === 'volunteer'
              ? 'bg-[#0A1724]/95 border-emerald-500/40 shadow-emerald-500/10 ring-1 ring-emerald-400/30'
              : 'bg-[#080E1E]/80 border-white/10 hover:border-white/20'
          }`}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className={`text-xs font-sans px-3 py-1 rounded-full font-medium ${
                selectedPersona === 'volunteer'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}>
                Authorized dispatcher
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-normal font-sans flex items-center gap-2">
              <span>Disaster relief volunteer</span>
              {selectedPersona === 'volunteer' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
              Designated for field operatives, NGO volunteers, and first responders authorized to transmit disaster warning messages directly to citizens.
            </p>

            {/* Permission Matrix for Volunteer */}
            <div className="mt-4 space-y-2.5 p-3.5 rounded-xl bg-black/30 border border-white/[0.06] text-xs font-sans">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 font-medium text-emerald-300">
                  <Send className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                  Mass emergency alert broadcasting
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/25">
                  Authorized
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Multi-channel delivery (SMS, WhatsApp, Cell, IVR)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/20">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Delivery & Connection Status
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/20">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-white/[0.06]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Volunteer identity & sector verification
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-medium border border-cyan-500/20">
                  Verified volunteer
                </span>
              </div>
            </div>
          </div>

          {/* Friendly Account Badge Quick Login for Volunteer */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickLogin('volunteer@resona.org', 'Password123!');
              }}
              disabled={loading}
              className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-200 text-xs font-medium flex items-center justify-between transition-all group-hover:border-emerald-400/40 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-semibold text-xs">
                  RD
                </div>
                <div className="text-left">
                  <span className="text-white font-medium block">Ramesh Das</span>
                  <span className="text-[11px] text-slate-400">Field Volunteer</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/20">
                  ID: VOL-4022
                </span>
                <span className="text-xs text-emerald-400 font-medium">Sign in →</span>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Interactive Credentials Form (Sign In / Register) */}
      <div className="rounded-2xl p-6 sm:p-7 bg-[#091022]/90 border border-white/10 backdrop-blur-xl shadow-xl">
        
        {/* Switcher & Form Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
              selectedPersona === 'volunteer' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
            }`}>
              {selectedPersona === 'volunteer' ? <ShieldCheck className="w-4.5 h-4.5 stroke-[1.8]" /> : <User className="w-4.5 h-4.5 stroke-[1.8]" />}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-white tracking-normal font-sans">
                {authMode === 'signin' ? 'Sign in with credentials' : `Register as new ${selectedPersona === 'volunteer' ? 'relief volunteer' : 'citizen'}`}
              </h4>
              <p className="text-xs text-slate-400 font-sans">
                {selectedPersona === 'volunteer' 
                  ? 'Volunteer credentials include mass broadcast dispatch authorization' 
                  : 'Citizen account provides personalized vernacular alerts and ground SOS reports'}
              </p>
            </div>
          </div>

          {/* Mode Switcher: Sign In vs Register */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs font-sans">
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setAuthMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                authMode === 'signin' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setAuthMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                authMode === 'register' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 stroke-[1.8]" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in font-sans">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 stroke-[1.8]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {authMode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Full name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 stroke-[1.8]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={selectedPersona === 'volunteer' ? 'Ramesh Das' : 'Sunita Nayak'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Contact mobile number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 stroke-[1.8]" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94370 12345"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  {selectedPersona === 'volunteer' ? 'Volunteer organization / NGO *' : 'Locality / Resident community'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 stroke-[1.8]" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder={selectedPersona === 'volunteer' ? 'Odisha Coastal Volunteer Corps' : 'Puri Coastal Resident'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  District / Sector location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 stroke-[1.8]" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Puri District, Odisha"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                Email address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 stroke-[1.8]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={selectedPersona === 'volunteer' ? 'volunteer@resona.org' : 'citizen@resona.org'}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 font-sans">
                <label className="block text-xs font-medium text-slate-300">
                  Password *
                </label>
                <span className="text-[10px] text-slate-400">min 6 chars</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 stroke-[1.8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.8]" /> : <Eye className="w-4 h-4 stroke-[1.8]" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                {selectedPersona === 'volunteer'
                  ? 'Volunteer badge assigned automatically upon registration'
                  : 'Citizen ID created with personalized vernacular profile'
                }
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                selectedPersona === 'volunteer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-950/40'
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
                    {authMode === 'signin' ? `Sign in as ${selectedPersona === 'volunteer' ? 'volunteer' : 'citizen'}` : `Create ${selectedPersona === 'volunteer' ? 'volunteer' : 'citizen'} account`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[1.8]" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* 5. Additional Commander / Admin Option & Personnel Sync */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center gap-2.5 text-slate-300">
          <Database className="w-4 h-4 text-cyan-400 stroke-[1.8]" />
          <span>Need official state command access?</span>
          <button
            onClick={() => handleQuickLogin('commander@resona.gov.in', 'Password123!')}
            className="text-cyan-300 hover:text-cyan-200 font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Sign in as Commander Arjun Patel</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">CMD-1011</span>
            <span>→</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Database connected: {usersCount} registered users</span>
        </div>
      </div>

    </div>
  );
}
