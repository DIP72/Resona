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
  ArrowRight, 
  Building2, 
  Phone, 
  MapPin, 
  KeyRound, 
  X,
  Radio,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audioSynth';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, quickLogin, mongoUsers, usersCount, mongoUri, currentUser } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'database'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F2FE', '#0077FE', '#00F59B', '#FF0055']
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
      setSuccessMsg(`Welcome back, ${res.user.name}! Connected to MongoDB.`);
      setTimeout(() => {
        onClose();
      }, 1200);
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
      setSuccessMsg(`Account created and saved in MongoDB at ${mongoUri}!`);
      setTimeout(() => {
        onClose();
      }, 1400);
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
      setSuccessMsg(`Logged in as ${res.user.name} via MongoDB!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Demo login failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030612]/80 backdrop-blur-md animate-fadeIn">
      
      {/* Container Card */}
      <div className="relative w-full max-w-2xl bg-[#090F24]/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.18)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Glow Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00F2FE] via-[#0077FE] to-[#FF0055]" />

        {/* Header */}
        <div className="p-5 border-b border-cyan-500/20 flex items-center justify-between bg-[#0B1432]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.25)]">
              <KeyRound className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white tracking-wide">
                  PERSONNEL AUTHENTICATION PORTAL
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  SECURE ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Database Sync:</span>
                <span className="text-emerald-400 font-semibold">{mongoUri}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Close Portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live MongoDB Status Banner */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 border-b border-cyan-500/15 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-300">
            <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>MongoDB Target:</span>
            <span className="text-white font-bold bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
              mongodb://localhost:27017/
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playBlip();
              setMode(mode === 'database' ? 'login' : 'database');
            }}
            className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-100 underline decoration-cyan-500/50 hover:decoration-cyan-400 text-[11px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inspect MongoDB Users ({usersCount})</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-4 flex gap-2 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              sound.playBlip();
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`pb-3 px-4 font-mono text-xs font-medium transition-all relative ${
              mode === 'login'
                ? 'text-[#00F2FE] border-b-2 border-[#00F2FE]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SIGN IN (LOGIN)
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playBlip();
              setMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`pb-3 px-4 font-mono text-xs font-medium transition-all relative ${
              mode === 'register'
                ? 'text-[#00F2FE] border-b-2 border-[#00F2FE]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            REGISTER NEW ACCOUNT
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playBlip();
              setMode('database');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`pb-3 px-4 font-mono text-xs font-medium transition-all relative ml-auto ${
              mode === 'database'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            MONGODB DIRECTORY ({usersCount})
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Official Email Address:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="e.g. commander@resona.gov.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE] font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex justify-between">
                  <span>Account Password:</span>
                  <span className="text-[11px] text-cyan-400 font-mono">Encrypted with bcrypt</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE] font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#00F2FE] to-[#0077FE] hover:from-[#00F2FE]/90 hover:to-[#0077FE]/90 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTICATING AGAINST MONGODB...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>AUTHENTICATE & ENTER COMMAND CENTER</span>
                  </>
                )}
              </button>

              {/* Fast 1-Click Demo Accounts */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[11px] font-mono text-slate-400 mb-2.5 flex items-center justify-between">
                  <span>⚡ Instant 1-Click Demo Logins (Stored in MongoDB):</span>
                  <span className="text-cyan-400 text-[10px]">Pre-seeded at 27017</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('commander@resona.gov.in')}
                    className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/20 hover:border-cyan-400 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                        Disaster Cmdr
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">CMD</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Arjun Patel (ODRAF)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('priya.imd@gov.in')}
                    className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/20 hover:border-emerald-400 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                        IMD Scientist
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">MET</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Dr. Priya Sengupta</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('ramesh.volunteer@gmail.com')}
                    className="p-2.5 rounded-lg bg-slate-900 border border-pink-500/20 hover:border-pink-400 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-pink-300 group-hover:text-pink-200">
                        Citizen Volunteer
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">CIT</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Ramesh Das (Konark)</p>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MODE: REGISTER NEW ACCOUNT */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Full Legal / Official Name: *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="e.g. Commander Rajesh Roy"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Official Email Address: *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="e.g. rajesh.ndrf@gov.in"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Create Password (min. 6 chars): *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="Enter strong password..."
                      className="w-full pl-9 pr-10 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Operational Role / Tier: *
                  </label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#00F2FE] font-mono"
                  >
                    <option value="Emergency Responder">Emergency Responder (Ground Command)</option>
                    <option value="Disaster Management Officer">Disaster Management Officer (NDMA / SDMA)</option>
                    <option value="Meteorological Specialist">Meteorological Specialist (IMD Forecast)</option>
                    <option value="Citizen / Volunteer">Citizen / Local Community Volunteer</option>
                    <option value="Administrator">System Administrator</option>
                  </select>
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Organization / Agency:
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={registerForm.organization}
                      onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                      placeholder="e.g. National Disaster Response Force"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] font-mono"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Emergency Phone:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Deployment Sector / Base Location:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={registerForm.location}
                    onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                    placeholder="e.g. Puri Coastal Belt, Odisha"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] font-mono"
                  />
                </div>
              </div>

              {/* Stored to MongoDB Notice */}
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span>Target DB: <code className="text-white">mongodb://localhost:27017/resona_db</code></span>
                </span>
                <span className="text-emerald-400 font-semibold">users collection</span>
              </div>

              {/* Register Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-[#0077FE] hover:opacity-95 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-[0_0_20px_rgba(0,245,155,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>SAVING ACCOUNT DIRECTLY TO MONGODB...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>REGISTER & SAVE TO MONGODB DATABASE</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: DATABASE INSPECTOR */}
          {mode === 'database' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    LIVE MONGODB USERS DIRECTORY
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Direct live documents stored in MongoDB at <span className="text-cyan-300">mongodb://localhost:27017/resona_db</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold">
                  {usersCount} Accounts Recorded
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {mongoUsers && mongoUsers.length > 0 ? (
                  mongoUsers.map((u, i) => (
                    <div 
                      key={u._id || u.id || i}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-between text-xs font-mono hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{u.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px]">
                            {u.badgeNumber || 'AUTH'}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            ({u.role})
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-2">
                          <span>{u.email}</span>
                          <span>•</span>
                          <span className="text-slate-300">{u.organization || 'Emergency Corps'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          MONGODB STORED
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-mono py-4 text-center">
                    No users loaded yet from MongoDB.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs font-mono">
                <span className="text-slate-400">
                  Ready to sign in with any of these credentials?
                </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-[#00F2FE] border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
