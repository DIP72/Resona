import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Phone, 
  MapPin, 
  KeyRound, 
  X,
  Radio,
  Layers,
  ChevronRight,
  Shield,
  Zap,
  ArrowRight,
  MessageSquare,
  PhoneCall,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audioSynth';
import { openDeviceSms, openWhatsAppChat, openEmailClient } from '../utils/directDispatch';
import ContactActionModal from './ContactActionModal';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, quickLogin, mongoUsers, usersCount, mongoUri, currentUser } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'database'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedContactForAction, setSelectedContactForAction] = useState(null);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Emergency Responder',
    organization: 'Odisha Disaster Rapid Action Force (ODRAF)',
    phone: '+91 98765 43210',
    location: 'Puri Coastal Command, Odisha'
  });

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#3B82F6', '#10B981', '#F43F5E']
      });
    } catch {}
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    sound.playBlip();

    const res = await login(loginForm.email, loginForm.password);
    setLoading(false);

    if (res.success) {
      sound.playSuccessChime();
      triggerConfetti();
      setSuccessMsg(`Welcome back, ${res.user.name}`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Login failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!registerForm.name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!registerForm.email.trim()) {
      setErrorMsg('Valid email is required.');
      return;
    }
    if (registerForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    sound.playBlip();

    const res = await register(registerForm);
    setLoading(false);

    if (res.success) {
      sound.playSuccessChime();
      triggerConfetti();
      setSuccessMsg(`Account created for ${res.user.name}`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  const handleQuickDemoClick = async (demoEmail) => {
    setErrorMsg('');
    setLoading(true);
    sound.playBlip();

    const res = await quickLogin(demoEmail, 'Password123!');
    setLoading(false);

    if (res.success) {
      sound.playSuccessChime();
      triggerConfetti();
      setSuccessMsg(`Authenticated as ${res.user.name}`);
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setErrorMsg(res.error || 'Demo login failed.');
    }
  };

  const [persona, setPersona] = useState('citizen'); // 'citizen' | 'volunteer'

  const demoAccounts = [
    {
      email: 'citizen@resona.org',
      name: 'Sunita Nayak',
      role: 'Normal Citizen',
      org: 'Coastal Resident',
      initials: 'SN',
      badge: 'CIT-8821',
      color: 'sky',
      canBroadcast: false,
      desc: 'Public warnings, SOS reports'
    },
    {
      email: 'volunteer@resona.org',
      name: 'Ramesh Das',
      role: 'Relief Volunteer',
      org: 'Coastal Volunteer Corps',
      initials: 'RD',
      badge: 'VOL-4022',
      color: 'emerald',
      canBroadcast: true,
      desc: 'Authorized to dispatch broadcasts'
    },
    {
      email: 'commander@resona.gov.in',
      name: 'Arjun Patel',
      role: 'Disaster Commander',
      org: 'ODRAF Coastal Force',
      initials: 'AP',
      badge: 'CMD-1011',
      color: 'amber',
      canBroadcast: true,
      desc: 'State command authority'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Container Card */}
      <div className="relative w-full max-w-lg bg-[#0B1020]/95 border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Subtle Ambient Glow Header */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

        {/* Header */}
        <div className="p-5 pb-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-400/25 flex items-center justify-center text-sky-400 shadow-inner">
              <Shield className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  {mode === 'login' ? 'Welcome to Resona' : mode === 'register' ? 'Create Responder Account' : 'Database Directory'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Secure
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login' ? 'Sign in to access disaster command & telemetry' : mode === 'register' ? 'Register for mission-control privileges' : 'Inspecting live registered records'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="p-3 pb-0">
          <div className="flex p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl">
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white/10 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white/10 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setMode('database');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'database'
                  ? 'bg-white/10 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Users ({usersCount})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Notifications */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="commander@resona.gov.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-500">256-bit bcrypt encrypted</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all font-mono"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Instant 1-Click Demo Accounts */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Quick Access Demo Accounts</span>
                  </span>
                  <span className="text-[10px] text-slate-500">1-click login</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickDemoClick(acc.email)}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {acc.initials}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                          {acc.badge}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {acc.role}
                        </p>
                        <div className="mt-1">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-block ${
                            acc.canBroadcast 
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40' 
                              : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                          }`}>
                            {acc.canBroadcast ? '✓ Can Broadcast' : '🔒 Broadcast Off'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* MODE: REGISTER NEW ACCOUNT */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="Rajesh Roy"
                      className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Official Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="rajesh.ndrf@gov.in"
                      className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password (min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-9 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Operational Role *
                  </label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0E1528] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Citizen">👥 Citizen (Public Resident - Warnings & SOS)</option>
                    <option value="Volunteer">🛡️ Volunteer (Relief Operative - Broadcast Authorized)</option>
                    <option value="Emergency Responder">Ground Responder (ODRAF / NDRF)</option>
                    <option value="Disaster Management Officer">Disaster Officer (NDMA / SDMA)</option>
                  </select>
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Organization / Agency
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={registerForm.organization}
                      onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                      placeholder="ODRAF / NDMA"
                      className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Deployment Location */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sector / Base Station
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={registerForm.location}
                    onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                    placeholder="Puri Coastal Belt, Odisha"
                    className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Responder Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: DATABASE DIRECTORY */}
          {mode === 'database' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                <span className="text-xs text-slate-400">
                  Registered Personnel Directory
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {usersCount} Records Synced
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {mongoUsers && mongoUsers.length > 0 ? (
                  mongoUsers.map((u, i) => (
                    <div 
                      key={u._id || u.id || i}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-white truncate">{u.name}</p>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300">
                              {u.role || 'Member'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedContactForAction({ name: u.name, email: u.email, phone: u.phone, role: u.role })}
                              className="hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                              title="Click to send email"
                            >
                              <Mail className="w-3 h-3 text-cyan-400" />
                              <span>{u.email}</span>
                            </button>

                            {u.phone && (
                              <>
                                <span>•</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedContactForAction({ name: u.name, email: u.email, phone: u.phone, role: u.role })}
                                  className="hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer font-mono"
                                  title="Click to send message or call"
                                >
                                  <Phone className="w-3 h-3 text-emerald-400" />
                                  <span>{u.phone}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {u.phone && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playBlip();
                                openDeviceSms(u.phone, `🚨 [RESONA EMERGENCY ADVISORY] Cyclone warning active in coastal sector. Seek shelter. Dial 1070 for rescue.`);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-medium border border-emerald-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Send SMS to phone"
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>SMS</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playBlip();
                                openWhatsAppChat(u.phone, `🚨 [RESONA EMERGENCY ADVISORY] Cyclone warning active in coastal sector. Seek shelter. Dial 1070 for rescue.`);
                              }}
                              className="px-2 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 text-[10px] font-medium border border-teal-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Send WhatsApp message"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            sound.playBlip();
                            setSelectedContactForAction({ name: u.name, email: u.email, phone: u.phone, role: u.role });
                          }}
                          className="px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-[10px] font-medium border border-cyan-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open full dispatch options"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No records found</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Discrete Footer Status */}
        <div className="px-5 py-2.5 bg-black/30 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">MongoDB Connected</span>
            <span className="text-slate-600 font-mono hidden sm:inline">(resona_db)</span>
          </div>
          <span className="text-slate-500 text-[10px]">Resona Disaster Intelligence</span>
        </div>

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
