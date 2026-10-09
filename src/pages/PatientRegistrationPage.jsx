import React, { useState } from 'react';
import {
  Mic,
  ShieldCheck,
  RefreshCw,
  HeartPulse,
  Thermometer,
  Activity,
  AlertTriangle,
  ArrowRight,
  Flame
} from 'lucide-react';
import VoicePill from '../components/ui/VoicePill/VoicePill';

export default function PatientRegistrationPage({
  onSubmitRegistration,
  onStartTriageDirect
}) {
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    sex: 'Male',
    contactNumber: '',
    symptomDuration: '',
    symptoms: '',
    existingConditions: '',
    currentMeds: '',
    previousReports: '',
    // Initial Observations / Vitals
    hr: '',
    bp: '',
    rr: '',
    spo2: '',
    temp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice dictation stop handler
  const handleVoiceStop = (text) => {
    if (!text) return;
    setForm(prev => ({
      ...prev,
      symptoms: (prev.symptoms ? prev.symptoms + ' ' : '') + text
    }));
  };

  const handleClear = () => {
    setForm({
      fullName: '',
      age: '',
      sex: 'Male',
      contactNumber: '',
      symptomDuration: '',
      symptoms: '',
      existingConditions: '',
      currentMeds: '',
      previousReports: '',
      hr: '',
      bp: '',
      rr: '',
      spo2: '',
      temp: ''
    });
  };

  const handleSubmit = (e, andStartTriage = false) => {
    e.preventDefault();
    if (!form.fullName || !form.symptoms) {
      alert('Please fill in required fields: Full Name and Symptoms.');
      return;
    }
    setIsSubmitting(true);
    onSubmitRegistration(form, andStartTriage, () => {
      setIsSubmitting(false);
      handleClear();
    });
  };

  // Warning checks for out-of-range observations
  const spo2Warning = form.spo2 && parseInt(form.spo2) < 92;
  const hrWarning = form.hr && (parseInt(form.hr) > 115 || parseInt(form.hr) < 50);
  const tempWarning = form.temp && (parseFloat(form.temp) > 38.5 || parseFloat(form.temp) < 35.5);

  return (
    <div className="p-5 md:p-7 space-y-5 flex-1 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Registration</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Please fill in the patient details and medical information below. Fields marked with * are required.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
        {/* Hands-Free Voice Dictation Banner */}
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-900">
            <Mic className="w-4 h-4 text-teal-600" />
            <span>Dictate Symptoms Hands-Free:</span>
          </div>
          <VoicePill
            accentColor="#0d9488"
            iconColor="#0f766e"
            background="#f0fdfa"
            size={28}
            shape="pill"
            showTime={true}
            waveform={true}
            slideToCancel={true}
            reactive="simulated"
            onStop={handleVoiceStop}
          />
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">
          {/* Section 1: Demographics */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              1. Patient Identity & Demographics
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter patient full name"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Age *</label>
                <input
                  type="number"
                  required
                  placeholder="Age (years)"
                  value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sex *</label>
                <select
                  value={form.sex}
                  onChange={e => setForm({ ...form, sex: e.target.value })}
                  className="mediqueue-input-field text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Complaint */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              2. Clinical Complaint & Onset
            </span>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Symptom Duration / Onset</label>
                <input
                  type="text"
                  placeholder="e.g. 2 hours, 1 day, sudden onset 45 min ago"
                  value={form.symptomDuration}
                  onChange={e => setForm({ ...form, symptomDuration: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Symptoms / Reason for Visit *</label>
                  <span className="text-[10px] text-slate-400 font-mono">{form.symptoms.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  required
                  maxLength={500}
                  placeholder="Describe current symptoms or reason for visit (e.g. crushing retrosternal chest pain radiating to left arm, severe shortness of breath)"
                  value={form.symptoms}
                  onChange={e => setForm({ ...form, symptoms: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Medical Background */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              3. Medical Background & Medication History
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Existing Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. diabetes, asthma, hypertension, CAD"
                  value={form.existingConditions}
                  onChange={e => setForm({ ...form, existingConditions: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Current Medications</label>
                <input
                  type="text"
                  placeholder="List medications and doses if known (e.g. Metformin 500mg, Amlodipine 5mg)"
                  value={form.currentMeds}
                  onChange={e => setForm({ ...form, currentMeds: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Previous Reports / Surgeries</label>
              <input
                type="text"
                placeholder="e.g. MRI, allergies, past CABG, appendectomy"
                value={form.previousReports}
                onChange={e => setForm({ ...form, previousReports: e.target.value })}
                className="mediqueue-input-field text-xs"
              />
            </div>
          </div>

          {/* Section 4: Initial Observations (Vital Signs) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <span>Initial Observations (Vitals Station)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">OPTIONAL CLINICAL TRIAGE INPUT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">HR (bpm)</label>
                <input
                  type="number"
                  placeholder="e.g. 112"
                  value={form.hr}
                  onChange={e => setForm({ ...form, hr: e.target.value })}
                  className={`mediqueue-input-field text-xs ${hrWarning ? 'border-rose-400 bg-rose-50/50' : ''}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  placeholder="e.g. 150/100"
                  value={form.bp}
                  onChange={e => setForm({ ...form, bp: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 92"
                  value={form.spo2}
                  onChange={e => setForm({ ...form, spo2: e.target.value })}
                  className={`mediqueue-input-field text-xs ${spo2Warning ? 'border-rose-500 bg-rose-50 font-bold text-rose-700' : ''}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 38.5"
                  value={form.temp}
                  onChange={e => setForm({ ...form, temp: e.target.value })}
                  className={`mediqueue-input-field text-xs ${tempWarning ? 'border-amber-400 bg-amber-50/50' : ''}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Resp. Rate (/min)</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={form.rr}
                  onChange={e => setForm({ ...form, rr: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>
            </div>

            {(spo2Warning || hrWarning || tempWarning) && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <b>Concerning Observations Flagged:</b>{' '}
                  {spo2Warning && 'Critical Hypoxia (SpO2 < 92%). '}
                  {hrWarning && 'Tachycardia / Bradycardia. '}
                  {tempWarning && 'High Pyrexia / Hypothermia. '}
                  Immediate clinician review recommended.
                </span>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 max-w-md">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Patient information is securely stored and will be reviewed by a clinician for appropriate triage and care.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-teal-600 text-teal-700 text-xs font-bold hover:bg-teal-50 transition-colors flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Save & Start Triage</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Triage...</span>
                  </>
                ) : (
                  <span>Submit Registration</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
