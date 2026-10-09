import React from 'react';
import {
  Users,
  AlertTriangle,
  UserCheck,
  Clock,
  UserPlus,
  FolderLock,
  BarChart3,
  Flame,
  ArrowRight,
  Activity,
  CheckCircle2,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export default function StaffDashboardPage({
  currentUser,
  patients,
  stats,
  activities = [],
  onNavigate,
  onSelectPatient
}) {
  return (
    <div className="p-5 md:p-7 space-y-6 flex-1">
      {/* Welcome & Register Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Dashboard</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome aboard, <b>{currentUser?.name || 'Dr. Sarah Khan'}</b>. Overview of current patient flow and priority cases.
          </p>
        </div>

        <button
          onClick={() => onNavigate('patient-registration')}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Patient</span>
        </button>
      </div>

      {/* 4 Summary Cards (Exact to Screen 3 Wireframe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Waiting Patients */}
        <div 
          onClick={() => onNavigate('patient-queue')}
          className="bg-white p-4 rounded-xl border border-teal-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Waiting Patients</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total || 24}</div>
          </div>
        </div>

        {/* Card 2: Critical Patients */}
        <div 
          onClick={() => onNavigate('emergency-triage')}
          className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-rose-400 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Critical Patients</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{stats.critical || 3}</div>
          </div>
        </div>

        {/* Card 3: In Consultation */}
        <div 
          onClick={() => onNavigate('patient-queue')}
          className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">In Consultation</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.inConsult || 5}</div>
          </div>
        </div>

        {/* Card 4: Avg. Waiting Time */}
        <div 
          onClick={() => onNavigate('analytics')}
          className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Avg. Waiting Time</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.avgWait || 42} min</div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Triage Distribution + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Triage Level Distribution Donut (Screen 3) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Triage Level Distribution</h3>
            <span className="text-[10px] text-slate-400 font-mono">ESI TIER SPECTRUM</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                {/* Critical: 12% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#dc2626" strokeWidth="12" strokeDasharray="29 210" strokeDashoffset="0" />
                {/* High: 29% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="69 170" strokeDashoffset="-29" />
                {/* Moderate: 38% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#eab308" strokeWidth="12" strokeDasharray="91 148" strokeDashoffset="-98" />
                {/* Low: 21% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#16a34a" strokeWidth="12" strokeDasharray="50 189" strokeDashoffset="-189" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">{stats.total || 24}</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Patients</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs w-full max-w-[170px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-slate-600 font-medium">Critical</span>
                </div>
                <span className="font-bold text-slate-800">{stats.critical || 3} (12%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-slate-600 font-medium">High</span>
                </div>
                <span className="font-bold text-slate-800">{stats.high || 7} (29%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-medium">Moderate</span>
                </div>
                <span className="font-bold text-slate-800">{stats.moderate || 9} (38%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-slate-600 font-medium">Low</span>
                </div>
                <span className="font-bold text-slate-800">{stats.low || 5} (21%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity (Screen 3) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Activity</h3>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
            >
              <span>View All Timeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { text: 'Patient #P1034 triaged as High', time: '5m ago', dot: 'bg-orange-500', patientId: 'P1034' },
              { text: 'Patient #P1019 started consultation', time: '12m ago', dot: 'bg-blue-500', patientId: 'P1019' },
              { text: 'Patient #P1021 registered', time: '18m ago', dot: 'bg-teal-500', patientId: 'P1021' },
              { text: 'Patient #P1017 completed', time: '25m ago', dot: 'bg-emerald-500', patientId: 'P1017' },
              { text: 'Patient #P1023 triaged as Critical', time: '32m ago', dot: 'bg-rose-500', patientId: 'P1023' },
            ].map((act, i) => (
              <div
                key={i}
                onClick={() => {
                  onSelectPatient(act.patientId);
                  onNavigate('patient-details');
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${act.dot}`} />
                  <span className="font-semibold text-slate-800 hover:text-teal-700">{act.text}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions (4 Cards - Screen 3) */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('patient-registration')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group"
          >
            <UserPlus className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Register New Patient</span>
          </button>

          <button
            onClick={() => onNavigate('patient-queue')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group"
          >
            <Users className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">View Queue</span>
          </button>

          <button
            onClick={() => onNavigate('patient-records')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group"
          >
            <FolderLock className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Patient Records</span>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group"
          >
            <BarChart3 className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}
