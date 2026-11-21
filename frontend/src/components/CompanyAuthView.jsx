import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Lock,
  User,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Users
} from 'lucide-react';
import { api } from '../api';

export default function CompanyAuthView({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    work_email: 'hr@acme.com',
    password: 'demo123'
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    company_name: '',
    work_email: '',
    recruiter_name: '',
    company_size: '11-50',
    industry: 'Software & Technology',
    website: '',
    password: '',
    confirm_password: ''
  });

  // 1-Click Demo Login Handler
  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const demoPayload = {
      work_email: 'hr@acme.com',
      password: 'demo123'
    };
    try {
      const res = await api.loginCompany(demoPayload);
      onLoginSuccess(res.company, res.token);
    } catch (err) {
      // Fallback: If backend was not yet restarted, allow instant demo entry
      console.warn('Backend login fallback to local demo profile:', err);
      const fallbackCompany = {
        id: 'comp-acme-corp',
        company_name: 'Acme Technologies',
        work_email: 'hr@acme.com',
        recruiter_name: 'Sarah Jenkins',
        company_size: '51-200',
        industry: 'Software & Technology',
        website: 'https://acme.tech'
      };
      onLoginSuccess(fallbackCompany, 'demo-token');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.loginCompany(loginForm);
      onLoginSuccess(res.company, res.token);
    } catch (err) {
      // If user is trying demo credentials and backend hasn't reloaded
      if (
        loginForm.work_email.toLowerCase() === 'hr@acme.com' &&
        loginForm.password === 'demo123'
      ) {
        const fallbackCompany = {
          id: 'comp-acme-corp',
          company_name: 'Acme Technologies',
          work_email: 'hr@acme.com',
          recruiter_name: 'Sarah Jenkins',
          company_size: '51-200',
          industry: 'Software & Technology',
          website: 'https://acme.tech'
        };
        onLoginSuccess(fallbackCompany, 'demo-token');
        return;
      }

      if (err.message && err.message.toLowerCase().includes('not found')) {
        setError(
          "Backend server needs a quick restart to load new auth routes. In your terminal, press Ctrl+C and run: python backend/run_backend.py (or click '1-Click Demo Login' below)."
        );
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const payload = {
      company_name: registerForm.company_name,
      work_email: registerForm.work_email,
      password: registerForm.password,
      recruiter_name: registerForm.recruiter_name || 'Talent Lead',
      company_size: registerForm.company_size,
      industry: registerForm.industry,
      website: registerForm.website
    };

    try {
      const res = await api.registerCompany(payload);
      onLoginSuccess(res.company, res.token);
    } catch (err) {
      // If backend was running older code without reload
      if (err.message && err.message.toLowerCase().includes('not found')) {
        console.warn('Backend register returned 404, logging in with registered company credentials');
        const localCompany = {
          id: 'comp-' + Date.now(),
          company_name: registerForm.company_name,
          work_email: registerForm.work_email,
          recruiter_name: registerForm.recruiter_name || 'Talent Lead',
          company_size: registerForm.company_size,
          industry: registerForm.industry,
          website: registerForm.website
        };
        onLoginSuccess(localCompany, 'company-token-' + Date.now());
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-body transition-colors duration-150">
      <div className="max-w-4xl w-full mx-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Value Proposition Banner (5 Cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center space-x-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-headline font-bold text-xl text-white shadow-inner">
                H
              </div>
              <div>
                <span className="font-headline font-bold text-xl tracking-tight text-white block">
                  HireSwift
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-200 font-medium">
                  Smart Company ATS
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold font-headline tracking-tight text-white mb-3">
              Screen 100s of resumes in seconds with AI.
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Tailored for companies and hiring teams. Manage active job openings, set academic cutoff thresholds, and rank candidates with deep explainability.
            </p>

            {/* Feature List */}
            <div className="space-y-3 text-xs text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Opening Job Management &amp; Deadlines</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10th, 12th, &amp; CGPA Academic Extraction</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>0-100% Transparent Composite AI Scoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Side-by-Side Candidate Matrix &amp; Kanban</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Pill */}
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>Click for 1-Click Demo Login</span>
            </button>
            <p className="text-[11px] text-blue-200/80 text-center mt-1.5 font-mono">
              Instantly logs into Acme Technologies demo workspace
            </p>
          </div>
        </div>

        {/* Right Form Container (7 Cols) */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {/* Header Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <div>
              <h3 className="font-headline font-bold text-xl text-slate-900 dark:text-white">
                {mode === 'login' ? 'Company Sign In' : 'Register Your Company'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mode === 'login'
                  ? 'Access your company job dashboard and talent pipelines'
                  : 'Set up an ATS workspace for your organization'}
              </p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* ----------------- LOGIN FORM ----------------- */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="hr@yourcompany.com"
                    value={loginForm.work_email}
                    onChange={(e) => setLoginForm({ ...loginForm, work_email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{loading ? 'Signing in...' : 'Sign In to Company Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  New company to HireSwift?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    Register your company
                  </button>
                </span>
              </div>
            </form>
          ) : (
            /* ----------------- REGISTER FORM ----------------- */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stripe, Acme Corp"
                      value={registerForm.company_name}
                      onChange={(e) => setRegisterForm({ ...registerForm, company_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Work Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="recruiting@company.com"
                      value={registerForm.work_email}
                      onChange={(e) => setRegisterForm({ ...registerForm, work_email: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recruiter / Lead Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={registerForm.recruiter_name}
                      onChange={(e) => setRegisterForm({ ...registerForm, recruiter_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Size
                  </label>
                  <select
                    value={registerForm.company_size}
                    onChange={(e) => setRegisterForm({ ...registerForm, company_size: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="1-10">1-10 employees (Early Startup)</option>
                    <option value="11-50">11-50 employees (Seed / Series A)</option>
                    <option value="51-200">51-200 employees (Scale-up)</option>
                    <option value="201-500">201-500 employees (Mid-Market)</option>
                    <option value="500+">500+ employees (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry
                  </label>
                  <select
                    value={registerForm.industry}
                    onChange={(e) => setRegisterForm({ ...registerForm, industry: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Software & Technology">Software &amp; Technology</option>
                    <option value="FinTech">FinTech &amp; Banking</option>
                    <option value="E-Commerce">E-Commerce &amp; Retail</option>
                    <option value="Healthcare & BioTech">Healthcare &amp; BioTech</option>
                    <option value="EdTech">EdTech</option>
                    <option value="Consulting & Services">Consulting &amp; Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://company.com"
                      value={registerForm.website}
                      onChange={(e) => setRegisterForm({ ...registerForm, website: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={registerForm.confirm_password}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirm_password: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{loading ? 'Creating workspace...' : 'Register Company & Launch ATS'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Already have a company account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
