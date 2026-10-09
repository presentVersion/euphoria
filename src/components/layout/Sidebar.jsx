import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FolderLock,
  BarChart3,
  Flame,
  Bell,
  Settings,
  ChevronLeft,
  Stethoscope,
  LogOut
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onNavigate,
  patientCount,
  unreadNotifsCount,
  onLogout
}) {
  return (
    <aside className="w-full md:w-60 mediqueue-sidebar p-4 flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div className="space-y-6">
        {/* Brand Header */}
        <div
          className="flex items-center gap-2.5 cursor-pointer px-2"
          onClick={() => onNavigate('staff-dashboard')}
        >
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
            +
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white leading-none">
              MEDIQUEUE
            </span>
            <span className="text-[9px] font-mono tracking-wider text-teal-400 uppercase mt-0.5">
              CLINICIAN OS
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="space-y-1">
          <button
            onClick={() => onNavigate('staff-dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold mediqueue-sidebar-item ${
              activeTab === 'staff-dashboard' ? 'active' : ''
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('patient-registration')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold mediqueue-sidebar-item ${
              activeTab === 'patient-registration' ? 'active' : ''
            }`}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Patient Registration</span>
          </button>

          <button
            onClick={() => onNavigate('patient-queue')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold mediqueue-sidebar-item ${
              activeTab === 'patient-queue' || activeTab === 'patient-details' ? 'active' : ''
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Patient Queue</span>
            <span className="ml-auto text-[10px] bg-slate-900/60 text-teal-300 px-2 py-0.5 rounded-full font-mono">
              {patientCount}
            </span>
          </button>

          <button
            onClick={() => onNavigate('emergency-triage')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold mediqueue-sidebar-item ${
              activeTab === 'emergency-triage' ? 'active' : ''
            }`}
          >
            <Flame className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Emergency Triage</span>
            <span className="ml-auto text-[9px] bg-rose-950/80 text-rose-300 px-1.5 py-0.5 rounded uppercase font-bold">
              ESI
            </span>
          </button>

          <button
            onClick={() => onNavigate('patient-records')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold mediqueue-sidebar-item ${
              activeTab === 'patient-records' ? 'active' : ''
            }`}
          >
            <FolderLock className="w-4 h-4 shrink-0" />
            <span>Patient Records</span>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold mediqueue-sidebar-item ${
              activeTab === 'analytics' ? 'active' : ''
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => onNavigate('notifications')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold mediqueue-sidebar-item ${
              activeTab === 'notifications' ? 'active' : ''
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="ml-auto text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold mediqueue-sidebar-item ${
              activeTab === 'settings' ? 'active' : ''
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2">
        <button
          onClick={() => onNavigate('landing')}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors py-1.5"
        >
          <span className="flex items-center gap-2 font-medium">
            <ChevronLeft className="w-3.5 h-3.5" /> Public Landing
          </span>
          <span className="text-[10px] bg-teal-900/60 text-teal-300 px-1.5 py-0.5 rounded font-mono">v2.4</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition-colors py-1.5 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
