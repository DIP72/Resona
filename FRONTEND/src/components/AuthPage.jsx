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
  Database,
  Check,
  RefreshCw,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audioSynth';
import ContactActionModal from './ContactActionModal';
import { openDeviceSms, openWhatsAppChat, openEmailClient } from '../utils/directDispatch';

export default function AuthPage({ onNavigateToTab, onOpenSafety }) {
  const { currentUser, isAuthenticated, login, register, quickLogin, logout, mongoUsers, usersCount, fetchMongoUsers, mongoUri } = useAuth();

  // Active persona selection: 'volunteer' | 'citizen' | 'commander'
  const [selectedPersona, setSelectedPersona] = useState('citizen');
  // Mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedContactForAction, setSelectedContactForAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [quickLoginClicked, setQuickLoginClicked] = useState(null);

  // MongoDB Inspector state
  const [isDbViewerOpen, setIsDbViewerOpen] = useState(true);
  const [dbSearch, setDbSearch] = useState('');
  const [refreshingDb, setRefreshingDb] = useState(false);

  const handleManualDbRefresh = async () => {
    sound.playBlip();
    setRefreshingDb(true);
    await fetchMongoUsers();
    setTimeout(() => setRefreshingDb(false), 400);
  };

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
    setQuickLoginClicked(email);
    setLoading(true);
    sound.playBlip();

    // brief visual ripple before auth transition
    await new Promise(r => setTimeout(r, 260));

    const res = await quickLogin(email, password);
    setLoading(false);
    setQuickLoginClicked(null);

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
        setSuccessMsg(`✓ Successfully registered & saved to MongoDB (${res.storage || 'resona_db.users'})! Document ID: ${res.user._id || res.user.id}`);
        setFormData({
          name: '',
          email: '',
          password: '',
          organization: '',
          phone: '',
          location: '',
        });
        await fetchMongoUsers();
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
        <div className="p-5 sm:p-6 rounded-2xl bg-[#091124]/90 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 glass-morphism animate-page-enter">
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
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-white/[0.06] text-slate-300 border border-white/10">
                  {isCurrentVolunteer ? 'Verified Volunteer ID' : 'Verified Resident ID'}
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap font-sans">
                <button
                  type="button"
                  onClick={() => setSelectedContactForAction({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, role: currentUser.role })}
                  className="hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer text-slate-300"
                  title="Click to send emergency email or message"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentUser.email}</span>
                </button>
                {currentUser.phone && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedContactForAction({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, role: currentUser.role })}
                      className="hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer font-mono text-emerald-300"
                      title="Click to send SMS or message"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentUser.phone}</span>
                    </button>
                  </>
                )}
                <span>•</span>
                <span>{currentUser.organization || 'Odisha Disaster Response'}</span>
                <span>•</span>
                <span className="text-slate-300">{currentUser.location || 'Bhubaneswar'}</span>
              </div>
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
          className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group shadow-lg glass-morphism ${
            selectedPersona === 'citizen'
              ? 'bg-[#0B152B]/95 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.22)] ring-1 ring-cyan-400/40'
              : 'bg-[#080E1E]/80 border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.18)] hover:-translate-y-1'
          }`}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className={`text-xs font-sans px-3 py-1 rounded-full font-medium transition-all ${
                selectedPersona === 'citizen'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}>
                General public
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-normal font-sans flex items-center gap-2">
              <span>Resident citizen</span>
              {selectedPersona === 'citizen' && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 stroke-[1.8] animate-bounce" />
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans font-normal">
              Designed for residents, coastal communities, and families seeking real-time vernacular storm alerts, safety protocols, and emergency shelter locations.
            </p>

            {/* Permission Matrix for Citizen with Staggered Reveal */}
            <div className="mt-4 space-y-2.5 p-3.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-sans">
              <div className="animate-stagger-in stagger-1 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
                  Vernacular dialect alerts (12+ Indic)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.2)]">Active</span>
              </div>
              <div className="animate-stagger-in stagger-2 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
                  Cyclone shelter directory & helplines
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.2)]">Active</span>
              </div>
              <div className="animate-stagger-in stagger-3 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
                  Ground incident & SOS reporting
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.2)]">Enabled</span>
              </div>
              <div className="animate-stagger-in stagger-4 flex items-center justify-between text-slate-400 pt-2 border-t border-white/[0.06]">
                <span className="flex items-center gap-2 text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                  Mass alert broadcasting to public
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-medium border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
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
              className="w-full py-2.5 px-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-200 text-xs font-medium flex items-center justify-between transition-all duration-300 group-hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95 cursor-pointer animate-page-enter"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300/40 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                  SN
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold block text-xs">Sunita Nayak</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-cyan-300 bg-cyan-950/70 border border-cyan-500/30">
                      Citizen
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Puri Resident Community</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
                {quickLoginClicked === 'citizen@resona.org' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Authenticating...
                  </span>
                ) : (
                  <>
                    <span>1-Click sign in</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </div>
            </button>

            {/* Direct Contact & Dispatch Links for Sunita Nayak */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1 pt-2 border-t border-white/[0.04]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContactForAction({ name: 'Sunita Nayak', email: 'citizen@resona.org', phone: '+91 94370 22334', role: 'Citizen' });
                }}
                className="hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer font-mono text-cyan-300/80"
                title="Click to message or call Sunita Nayak"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>+91 94370 22334</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContactForAction({ name: 'Sunita Nayak', email: 'citizen@resona.org', phone: '+91 94370 22334', role: 'Citizen' });
                }}
                className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] flex items-center gap-1 cursor-pointer"
                title="Send emergency message to this number"
              >
                <Send className="w-2.5 h-2.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: DISASTER RELIEF VOLUNTEER PERSONA */}
        <div 
          onClick={() => {
            sound.playBlip();
            setSelectedPersona('volunteer');
          }}
          className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group shadow-lg glass-morphism ${
            selectedPersona === 'volunteer'
              ? 'bg-[#0A1724]/95 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.22)] ring-1 ring-emerald-400/40'
              : 'bg-[#080E1E]/80 border-white/10 hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.18)] hover:-translate-y-1'
          }`}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className={`text-xs font-sans px-3 py-1 rounded-full font-medium transition-all ${
                selectedPersona === 'volunteer'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}>
                Authorized dispatcher
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-normal font-sans flex items-center gap-2">
              <span>Disaster relief volunteer</span>
              {selectedPersona === 'volunteer' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[1.8] animate-bounce" />
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans font-normal">
              Designated for field operatives, NGO volunteers, and first responders authorized to transmit disaster warning messages directly to citizens.
            </p>

            {/* Permission Matrix for Volunteer with Staggered Reveal */}
            <div className="mt-4 space-y-2.5 p-3.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-sans">
              <div className="animate-stagger-in stagger-1 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 font-medium text-emerald-300">
                  <Send className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                  Mass emergency alert broadcasting
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  Authorized
                </span>
              </div>
              <div className="animate-stagger-in stagger-2 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
                  Multi-channel delivery (SMS, WhatsApp, Cell, IVR)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.2)]">Enabled</span>
              </div>
              <div className="animate-stagger-in stagger-3 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
                  Delivery & Connection Status
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.2)]">Active</span>
              </div>
              <div className="animate-stagger-in stagger-4 flex items-center justify-between text-slate-300 pt-2 border-t border-white/[0.06]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
                  Volunteer identity & sector verification
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-medium border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
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
              className="w-full py-2.5 px-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-200 text-xs font-medium flex items-center justify-between transition-all duration-300 group-hover:border-emerald-400/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95 cursor-pointer animate-page-enter"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 border border-emerald-300/40 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                  RD
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold block text-xs">Ramesh Das</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-300 bg-emerald-950/70 border border-emerald-500/30">
                      Relief Volunteer
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Odisha Coastal Relief Corps</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                {quickLoginClicked === 'volunteer@resona.org' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Authenticating...
                  </span>
                ) : (
                  <>
                    <span>1-Click sign in</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </div>
            </button>

            {/* Direct Contact & Dispatch Links for Ramesh Das */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1 pt-2 border-t border-white/[0.04]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContactForAction({ name: 'Ramesh Das', email: 'volunteer@resona.org', phone: '+91 70081 99887', role: 'Volunteer' });
                }}
                className="hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer font-mono text-emerald-300/80"
                title="Click to message or call Ramesh Das"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>+91 70081 99887</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContactForAction({ name: 'Ramesh Das', email: 'volunteer@resona.org', phone: '+91 70081 99887', role: 'Volunteer' });
                }}
                className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1 cursor-pointer"
                title="Send emergency message to this number"
              >
                <Send className="w-2.5 h-2.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Interactive Credentials Form (Sign In / Register) */}
      <div className="rounded-2xl p-6 sm:p-7 bg-[#091022]/90 border border-white/10 backdrop-blur-xl shadow-2xl glass-morphism animate-slide-in">
        
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
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans glass-morphism animate-page-enter">
        <div className="flex items-center gap-2.5 text-slate-300">
          <Database className="w-4 h-4 text-cyan-400 stroke-[1.8]" />
          <span>Need official state command access?</span>
          <button
            onClick={() => handleQuickLogin('commander@resona.gov.in', 'Password123!')}
            className="text-cyan-300 hover:text-cyan-200 font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Sign in as Commander Arjun Patel</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">Command Officer</span>
            <span>→</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
          <span>Database connected: {usersCount} registered users</span>
        </div>
      </div>

      {/* 6. LIVE MONGODB DATABASE RECORDS INSPECTOR (resona_db.users) */}
      <div className="rounded-2xl p-6 bg-[#091022]/90 border border-white/10 backdrop-blur-xl shadow-2xl glass-morphism space-y-4">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-semibold text-white">
                  MongoDB Personnel Directory
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  resona_db.users
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {usersCount} Registered Documents
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Live collection records connected at <code className="text-cyan-300 font-mono text-[11px]">mongodb://localhost:27017/resona_db</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleManualDbRefresh}
              disabled={refreshingDb}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingDb ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{refreshingDb ? 'Syncing...' : 'Sync MongoDB'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDbViewerOpen(!isDbViewerOpen)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/25 transition-all cursor-pointer"
            >
              {isDbViewerOpen ? 'Collapse' : 'View Records'}
            </button>
          </div>
        </div>

        {/* Database Search & Filter */}
        {isDbViewerOpen && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search registered accounts by name, email, phone, or MongoDB _id..."
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {(mongoUsers || [])
                .filter(u => {
                  if (!dbSearch.trim()) return true;
                  const q = dbSearch.toLowerCase();
                  return (
                    (u.name || '').toLowerCase().includes(q) ||
                    (u.email || '').toLowerCase().includes(q) ||
                    (u.phone || '').toLowerCase().includes(q) ||
                    (u._id || u.id || '').toLowerCase().includes(q) ||
                    (u.role || '').toLowerCase().includes(q)
                  );
                })
                .map((u, idx) => (
                  <div
                    key={u._id || u.id || idx}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-2.5 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[11px] font-bold text-slate-300">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="font-semibold text-white text-xs">{u.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          u.role === 'Volunteer' || u.role === 'Emergency Responder'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : u.role === 'Disaster Management Officer'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {u.role || 'Citizen'}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <button
                            type="button"
                            onClick={() => setSelectedContactForAction({ name: u.name, email: u.email, phone: u.phone, role: u.role })}
                            className="hover:text-cyan-300 hover:underline flex items-center gap-1.5 cursor-pointer text-slate-300 truncate"
                            title="Send email to this user"
                          >
                            <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </button>
                        </div>

                        {u.phone && (
                          <div className="flex items-center justify-between text-slate-400">
                            <button
                              type="button"
                              onClick={() => setSelectedContactForAction({ name: u.name, email: u.email, phone: u.phone, role: u.role })}
                              className="hover:text-emerald-300 hover:underline flex items-center gap-1.5 cursor-pointer font-mono text-emerald-300/90"
                              title="Send SMS / message"
                            >
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{u.phone}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-slate-500 truncate" title={`MongoDB Document ID: ${u._id || u.id}`}>
                        ID: {(u._id || u.id || '').slice(0, 10)}...
                      </span>

                      <div className="flex items-center gap-1.5">
                        {u.phone && (
                          <button
                            type="button"
                            onClick={() => openDeviceSms(u.phone, `🚨 [RESONA EMERGENCY ADVISORY] Cyclone warning active in coastal Odisha. Seek immediate high shelter.`)}
                            className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-sans border border-emerald-500/30 cursor-pointer"
                            title="Send SMS"
                          >
                            SMS
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(u.email, 'Password123!')}
                          className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/10 text-white text-[10px] font-sans cursor-pointer"
                          title="Quick Login as this user"
                        >
                          Sign in
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* Interactive Contact Dispatch Modal */}
      <ContactActionModal
        isOpen={!!selectedContactForAction}
        contact={selectedContactForAction}
        onClose={() => setSelectedContactForAction(null)}
      />

    </div>
  );
}
