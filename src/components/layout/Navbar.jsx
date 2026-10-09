import React from 'react';
import { Bot, LogIn, HeartPulse } from 'lucide-react';

export default function Navbar({ onNavigate, onOpenCopilot, onOpenLogin, currentUser }) {
  return (
    <header className="px-6 md:px-10 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer group" 
        onClick={() => onNavigate('landing')}
      >
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30 font-black text-lg group-hover:scale-105 transition-transform">
          +
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
            MEDIQUEUE
          </span>
          <span className="text-[9px] font-semibold tracking-wider text-teal-600 uppercase">
            Smart Triage & Queue
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
        <button 
          onClick={() => onNavigate('landing')} 
          className="text-teal-600 font-bold hover:text-teal-700 transition-colors"
        >
          Home
        </button>
        <a 
          href="#how-it-works" 
          className="hover:text-slate-900 transition-colors"
        >
          How It Works
        </a>
        <button 
          onClick={() => onNavigate('patient-registration')} 
          className="hover:text-slate-900 transition-colors"
        >
          Emergency Triage
        </button>
        <button 
          onClick={() => onNavigate('patient-queue')} 
          className="hover:text-slate-900 transition-colors"
        >
          Live Queue
        </button>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenCopilot}
          className="px-3 py-1.5 rounded-full text-xs font-semibold border border-teal-500/30 text-teal-700 bg-teal-50 hover:bg-teal-100 flex items-center gap-1.5 transition-colors shadow-sm"
          title="Open AI Clinical Copilot"
        >
          <Bot className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {currentUser ? (
          <button
            onClick={() => onNavigate('staff-dashboard')}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#123B73] text-white hover:bg-[#0B2850] shadow-md shadow-slate-900/10 transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Staff Portal</span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-4 py-1.5 rounded-full text-xs font-bold border-2 border-[#123B73] text-[#123B73] hover:bg-[#123B73] hover:text-white transition-all flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
