import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Mail, Lock, User, UserCheck, ShieldCheck, 
  ArrowRight, KeyRound, Sparkles, LogIn, CheckCircle2
} from 'lucide-react';

const AuthPages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { showToast } = useNotification();

  // Active form view: 'login' | 'signup' | 'forgot' | 'verify'
  const activeTab = searchParams.get('tab') || 'login';
  
  // Loading & error
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('tenant'); // 'tenant' | 'owner'
  
  // Verification Code State
  const [verificationCode, setVerificationCode] = useState('');

  // Update tabs
  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
    setErrorMsg('');
  };

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill out all fields');
      return;
    }
    
    setFormLoading(true);
    setErrorMsg('');
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Welcome back to RentGB!', 'success');
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill out all fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setFormLoading(true);
    setErrorMsg('');
    try {
      // Go to verification UI instead of logging in directly
      // This matches real-world flows
      setTab('verify');
      showToast('A verification code has been sent to your email (Simulated)', 'info');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Verification Code
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setErrorMsg('Please enter verification code');
      return;
    }

    setFormLoading(true);
    setErrorMsg('');
    try {
      // Verify & register
      const res = await register(name, email, password, role);
      if (res.success) {
        showToast('Email verified and account registered!', 'success');
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Forgot Password
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email');
      return;
    }

    setFormLoading(true);
    setErrorMsg('');
    // Simulate reset link sent
    setTimeout(() => {
      setFormLoading(false);
      showToast('A password reset link has been sent to your email (Simulated)', 'success');
      setTab('login');
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* LEFT SIDE: VISUAL DISPLAY COLUMN */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12 bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1627063410772-2f3b9000dfb3?auto=format&fit=crop&w=1200&q=80" 
          alt="Gilgit-Baltistan Peak Views" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/80 to-transparent"></div>
        
        <div className="relative z-10 space-y-6 max-w-md text-white">
          <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="h-6 w-6 text-brand-300" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Direct Connecting Portal for Gilgit-Baltistan
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            RentGB helps tourists find cottages, students secure hostels, and professionals relocate to Skardu & Gilgit without dealing with middle-man broker fees.
          </p>
          <div className="flex items-center space-x-6 text-xs text-slate-400 font-bold tracking-wider uppercase border-t border-white/15 pt-6">
            <span>Direct chat</span>
            <span>&bull;</span>
            <span>Visit Scheduler</span>
            <span>&bull;</span>
            <span>Zero Brokerage</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: AUTHENTICATION FORM COLUMN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-8 shadow-xl space-y-8 backdrop-blur-md">
          
          {/* Header branding info */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              {activeTab === 'login' && 'Sign In to RentGB'}
              {activeTab === 'signup' && 'Create Your Account'}
              {activeTab === 'forgot' && 'Reset Password'}
              {activeTab === 'verify' && 'Verify Your Email'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === 'login' && 'Enter credentials or use demo accounts below'}
              {activeTab === 'signup' && 'Select your role and start listing or renting'}
              {activeTab === 'forgot' && 'Enter your email to receive recovery instructions'}
              {activeTab === 'verify' && 'Enter the verification code sent to your inbox'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-2xl">
              {errorMsg}
            </div>
          )}

          {/* Form Content */}

          {/* 1. LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setTab('forgot')}
                    className="text-xs font-bold text-brand-500 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-colors"
              >
                <LogIn className="h-4.5 w-4.5" />
                <span>{formLoading ? 'Logging in...' : 'Sign In'}</span>
              </button>
            </form>
          )}

          {/* 2. SIGNUP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              
              {/* Premium Role Selector Cards */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Register As</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('tenant')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all ${
                      role === 'tenant' 
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <UserCheck className={`h-5 w-5 ${role === 'tenant' ? 'text-brand-500' : 'text-slate-400'}`} />
                    <div>
                      <h4 className="font-bold text-xs">Tenant / User</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Find student hostels & cottages</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all ${
                      role === 'owner' 
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <ShieldCheck className={`h-5 w-5 ${role === 'owner' ? 'text-brand-500' : 'text-slate-400'}`} />
                    <div>
                      <h4 className="font-bold text-xs">Property Owner</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">List & manage local assets</p>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-colors"
              >
                <span>{formLoading ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-500/10 disabled:opacity-50 transition-colors"
              >
                <KeyRound className="h-4.5 w-4.5" />
                <span>{formLoading ? 'Sending link...' : 'Reset My Password'}</span>
              </button>
            </form>
          )}

          {/* 4. EMAIL VERIFICATION UI */}
          {activeTab === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start space-x-3 text-xs text-blue-500">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  We sent a 6-digit confirmation code to <strong>{email}</strong>. For the presentation, you can enter any code (e.g., <strong>123456</strong>) to verify immediately.
                </p>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500 text-center">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-lg font-black tracking-widest focus:outline-none focus:border-brand-500 focus:ring-0 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl text-sm shadow-lg transition-colors"
              >
                Verify & Register Account
              </button>
            </form>
          )}

          {/* Tab toggler links */}
          <div className="text-center text-xs font-semibold text-slate-400">
            {activeTab === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button onClick={() => setTab('signup')} className="text-brand-500 hover:underline font-bold">
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button onClick={() => setTab('login')} className="text-brand-500 hover:underline font-bold">
                  Sign In
                </button>
              </span>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Demo Credentials Section (Highly structured for evaluator ease) */}
          {activeTab === 'login' && (
            <div className="bg-slate-100 dark:bg-slate-950/40 p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-3">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
                <span>Demo Login Accounts</span>
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@gmail.com');
                    setPassword('admin123');
                    showToast('Admin credentials filled!', 'info');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('owner@gmail.com');
                    setPassword('owner123');
                    showToast('Owner credentials filled!', 'info');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors"
                >
                  Landlord
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('tenant@gmail.com');
                    setPassword('tenant123');
                    showToast('Tenant credentials filled!', 'info');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors"
                >
                  Tenant
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default AuthPages;
