import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { store } from '../data/store';
import { RWANDA_DISTRICTS } from '../data/mockData';
import { InteractiveTreeRope } from './InteractiveTreeRope';
import { Button } from './ui/Button';
import {
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Calendar,
  MapPin,
  Sparkles,
  Gift,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
}

export const AuthTreeModal: React.FC<AuthTreeModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('Gasabo (Kigali)');
  const [regBirthDate, setRegBirthDate] = useState('2001-05-15');
  const [regPass, setRegPass] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = store.login(loginEmail, mode === 'admin' ? 'admin' : 'user');
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(mode === 'admin' ? 'Welcome Admin! Logged in successfully.' : 'Logged in successfully!');
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(res.message);
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPass.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    // Phone validation
    const cleanPhone = regPhone.trim().replace(/\s+/g, '');
    if (!/^(078|079|072|073)\d{7}$/.test(cleanPhone)) {
      setError('Phone number must start with 078, 079, 072, or 073 and have 10 digits.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = store.register({
        name: regName,
        email: regEmail,
        phone: cleanPhone,
        district: regDistrict,
        birthDate: regBirthDate
      });
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Account created successfully! 2,500 RWF bonus added to your wallet.');
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.5 } });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.message);
      }
    }, 500);
  };

  const fillDemoUser = () => {
    setLoginEmail('mugisha@umurimo.rw');
    setLoginPass('User@12345');
    setError(null);
  };

  const fillDemoAdmin = () => {
    setMode('admin');
    setLoginEmail('admin@umurimo.rw');
    setLoginPass('Admin@12345');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
      />

      <div className="relative w-full max-w-lg z-10 my-auto">
        {/* Top Floating Badge */}
        <div className="text-center mb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Umurimo Rwanda - Online Earning & Prosperity Platform
          </span>
        </div>

        {/* Interactive Tree & Rope pulling experience */}
        <InteractiveTreeRope
          isOpen={isFormVisible}
          onOpen={() => setIsFormVisible(true)}
          onClose={() => setIsFormVisible(false)}
        />

        {/* The Form Panel (Deploys via Framer Motion when pulled) */}
        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/90 backdrop-blur-md"
            >
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up (+2,500 RWF)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('admin');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'admin'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Admin Portal
                </button>
              </div>

              {/* Bonus banner when in register mode */}
              {mode === 'register' && (
                <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">
                      Welcome Bonus: 2,500 RWF
                    </span>
                    <span className="text-[11px] text-slate-300 leading-tight block">
                      Register right now and get 2,500 RWF credited to your wallet instantly!
                    </span>
                  </div>
                </div>
              )}

              {/* Error / Success Feedback */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  {successMsg}
                </div>
              )}

              {/* Login Form (User or Admin) */}
              {(mode === 'login' || mode === 'admin') && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {mode === 'admin' ? 'Administrator Email' : 'Email Address or Phone Number'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={
                          mode === 'admin' ? 'admin@umurimo.rw' : 'mugisha@umurimo.rw or 0789456123'
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant={mode === 'admin' ? 'primary' : 'primary'}
                    className={`w-full py-2.5 ${mode === 'admin' ? '!bg-amber-600 hover:!bg-amber-500' : ''}`}
                    isLoading={isLoading}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    {mode === 'admin' ? 'Sign In to Admin Portal' : 'Sign In to My Account'}
                  </Button>

                  {/* Demo Quick-Fill Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 justify-between items-center text-xs">
                    <span className="text-slate-500">Quick Test Accounts:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={fillDemoUser}
                        className="text-emerald-400 hover:underline hover:text-emerald-300 font-medium"
                      >
                        Demo User
                      </button>
                      <span className="text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={fillDemoAdmin}
                        className="text-amber-400 hover:underline hover:text-amber-300 font-medium"
                      >
                        Demo Admin
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Registration Form */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Mugisha Patrick"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@gmail.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Phone (MTN or Airtel)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="078... or 073..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">District / Location</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={regDistrict}
                          onChange={(e) => setRegDistrict(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        >
                          {RWANDA_DISTRICTS.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          required
                          value={regBirthDate}
                          onChange={(e) => setRegBirthDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Choose Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-2.5 mt-2"
                    isLoading={isLoading}
                    icon={<Gift className="w-4 h-4 text-amber-300" />}
                  >
                    Create Account & Get 2,500 RWF Bonus
                  </Button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
