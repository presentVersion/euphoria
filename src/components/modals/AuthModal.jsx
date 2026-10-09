import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  allStaff = []
}) {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('sarah.khan@mediqueue.org');
  const [password, setPassword] = useState('Hospital@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Find matching staff or default to first
      const foundStaff = allStaff.find(s => s.email.toLowerCase() === email.toLowerCase()) || allStaff[0];
      onLoginSuccess(foundStaff);
      onClose();
    }, 600);
  };

  const handleQuickLogin = (staff) => {
    setEmail(staff.email);
    setPassword('Hospital@2026');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(staff);
      onClose();
    }, 400);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-600/30 text-xl">
            +
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">
              {isForgotPassword ? 'Reset Password' : 'Staff Portal Sign-In'}
            </h3>
            <p className="text-xs text-slate-500">
              {isForgotPassword 
                ? 'Enter your institutional email to reset credentials' 
                : 'Hospital Triage & Clinical Decision Support'}
            </p>
          </div>
        </div>

        {!isForgotPassword ? (
          <>
            {/* Quick Demo Login Chips */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Demo Clinician Profiles:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {allStaff.map(staff => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleQuickLogin(staff)}
                    className="p-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-left transition-all flex items-center gap-2 group"
                  >
                    <img src={staff.avatar} alt={staff.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-slate-800 group-hover:text-teal-700 truncate">{staff.name.split(' ')[1] || staff.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">{staff.role.split(' ')[0]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Institutional Email / Staff ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="mediqueue-input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="mediqueue-input-field pl-9 pr-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-teal-700 hover:text-teal-800 font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating Clinician...</span>
                ) : (
                  <>
                    <span>Sign In to Staff Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Forgot Password View */
          <div className="space-y-4">
            {resetSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Reset Link Sent</h4>
                <p className="text-xs text-emerald-700">
                  A verification token has been dispatched to <b>{email}</b>. Follow the secure institutional prompt.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="mt-2 text-xs font-bold text-teal-700 hover:underline"
                >
                  ← Return to Sign-In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Please provide your registered clinical email to receive instructions for resetting your authentication key.
                </p>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="mediqueue-input-field text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md hover:bg-teal-700 transition-all"
                >
                  {isLoading ? 'Processing...' : 'Send Recovery Link'}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Role-Based Access Control • HIPAA & FHIR Compliant Architecture</span>
        </div>
      </div>
    </div>
  );
}
