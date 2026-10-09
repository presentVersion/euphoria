import React, { useState } from 'react';
import { Key, Bot, Bell, ChevronDown, User, Shield, LogOut, Check } from 'lucide-react';

export default function StaffHeader({
  currentUser,
  onOpenKeyModal,
  onOpenCopilot,
  onNavigate,
  unreadCount = 2,
  onSelectUser,
  allStaff = [],
  onLogout
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Console Status */}
      <div className="flex items-center gap-3">
        <div className="text-xs font-mono font-bold text-teal-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">HOSPITAL ED CONSOLE //</span>
          <span className="text-slate-800 uppercase font-sans font-bold">
            {currentUser?.name || 'Dr. Sarah Khan'}
          </span>
        </div>
        <span className="hidden md:inline-block text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
          {currentUser?.department || 'Resuscitation & Acute Care'}
        </span>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenKeyModal}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 font-mono transition-colors"
          title="Configure Google Gemini Clinical CDS API Key"
        >
          <Key className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Gemini Key</span>
        </button>

        <button
          onClick={onOpenCopilot}
          className="text-xs px-3 py-1.5 rounded-lg border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 flex items-center gap-1.5 font-semibold transition-colors shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => onNavigate('notifications')}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 relative transition-colors"
          title="View Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 shadow-sm shrink-0">
              <img
                src={currentUser?.avatar || '/assets/doctor_avatar.jpg'}
                alt={currentUser?.name || 'Staff'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-bold text-slate-800 leading-tight flex items-center gap-1">
                <span>{currentUser?.name || 'Dr. Sarah Khan'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {currentUser?.role?.split('&')[0] || 'Healthcare Staff'}
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
                <div className="text-[10px] font-mono text-teal-600 mt-0.5">{currentUser?.shift}</div>
              </div>

              <div className="py-1">
                <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Clinician
                </div>
                {allStaff.map(staff => (
                  <button
                    key={staff.id}
                    onClick={() => {
                      onSelectUser(staff);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      currentUser?.id === staff.id ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{staff.name}</div>
                      <div className="text-[10px] text-slate-400">{staff.role.split('&')[0]}</div>
                    </div>
                    {currentUser?.id === staff.id && (
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & Role Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
