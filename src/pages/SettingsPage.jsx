import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Sliders,
  Bed,
  CheckCircle2,
  Save,
  Key,
  Flame
} from 'lucide-react';

export default function SettingsPage({
  currentUser,
  onOpenKeyModal,
  onLogout
}) {
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Dr. Sarah Khan',
    email: currentUser?.email || 'sarah.khan@mediqueue.org',
    role: currentUser?.role || 'Chief Triage Specialist',
    department: currentUser?.department || 'Resuscitation & Acute Care',
    shift: currentUser?.shift || 'Day Shift (08:00 - 18:00)'
  });

  const [triageProtocol, setTriageProtocol] = useState('ESI-v4');
  const [autoRefreshSecs, setAutoRefreshSecs] = useState('15');
  const [soundChime, setSoundChime] = useState(true);
  const [criticalAutoEscalate, setCriticalAutoEscalate] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-5 md:p-7 space-y-6 flex-1 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Triage Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure clinical workflows, urgency alert thresholds, and clinician profile credentials.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Institutional configuration preferences updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Clinician Profile */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>Staff Clinician Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinician Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="mediqueue-input-field text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Institutional Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="mediqueue-input-field text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinical Role / Title</label>
              <input
                type="text"
                value={profile.role}
                onChange={e => setProfile({ ...profile, role: e.target.value })}
                className="mediqueue-input-field text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Department</label>
              <input
                type="text"
                value={profile.department}
                onChange={e => setProfile({ ...profile, department: e.target.value })}
                className="mediqueue-input-field text-xs"
              />
            </div>
          </div>
        </div>

        {/* Clinical Triage Protocol Configuration */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <span>Emergency Triage Algorithm Protocol</span>
            </h3>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200 font-bold">
              ADMIN CONTROL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Urgency Classification Standard</label>
              <select
                value={triageProtocol}
                onChange={e => setTriageProtocol(e.target.value)}
                className="mediqueue-input-field text-xs font-semibold"
              >
                <option value="ESI-v4">Emergency Severity Index (ESI v4) - 5 Tiers</option>
                <option value="Manchester">Manchester Triage System (MTS)</option>
                <option value="CTAS">Canadian Triage and Acuity Scale (CTAS)</option>
                <option value="Australasian">Australasian Triage Scale (ATS)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Telemetry Queue Auto-Refresh Rate</label>
              <select
                value={autoRefreshSecs}
                onChange={e => setAutoRefreshSecs(e.target.value)}
                className="mediqueue-input-field text-xs font-semibold"
              >
                <option value="5">Every 5 seconds (Critical Care)</option>
                <option value="15">Every 15 seconds (Standard ED)</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 60 seconds</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={soundChime}
                onChange={e => setSoundChime(e.target.checked)}
                className="rounded text-teal-600"
              />
              <span>Audible audio alert chime for Tier 1 Critical emergency arrivals</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={criticalAutoEscalate}
                onChange={e => setCriticalAutoEscalate(e.target.checked)}
                className="rounded text-teal-600"
              />
              <span>Automatically trigger trauma bay pager dispatch on SpO2 &lt; 90% or Systolic BP &gt; 200</span>
            </label>
          </div>
        </div>

        {/* AI Key & Integration */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Google Gemini Clinical CDS Integration</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Custom institutional API key for LLM-driven danger sign identification and triage scoring.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenKeyModal}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0"
          >
            Manage API Key
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Sign Out of Clinician Console
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Institutional Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
