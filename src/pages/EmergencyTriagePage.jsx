import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  HeartPulse,
  Activity,
  Bot,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import RadarChart from '../components/ui/RadarChart/RadarChart';
import SlideCommit from '../components/ui/SlideCommit/SlideCommit';
import { analyzePatientTriageWithGemini } from '../services/geminiTriageService';

export default function EmergencyTriagePage({
  patient,
  allPatients = [],
  currentUser,
  onSelectPatient,
  onSaveTriage,
  onNavigate
}) {
  const currentPatient = patient || allPatients[0];
  const [selectedTier, setSelectedTier] = useState(currentPatient?.urgencyTier || 1);
  const [clinicianNotes, setClinicianNotes] = useState(
    currentPatient?.clinicalNotes?.[0]?.text ||
    'Evaluated presenting symptoms. Hemodynamic stability confirmed with targeted vitals review.'
  );
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  if (!currentPatient) {
    return (
      <div className="p-8 text-center text-slate-500">
        No patient selected for triage assessment.
      </div>
    );
  }

  const handleAiAnalyze = async () => {
    setAiAnalyzing(true);
    try {
      const result = await analyzePatientTriageWithGemini({
        name: currentPatient.name,
        age: currentPatient.age,
        gender: currentPatient.gender,
        symptoms: currentPatient.presentingComplaint,
        history: currentPatient.previousDiseases,
        currentMeds: currentPatient.currentMeds
      });
      setAiSuggestion(result);
      if (result.urgencyTier) {
        setSelectedTier(result.urgencyTier);
      }
      if (result.rationale) {
        setClinicianNotes(prev => `${prev}\n[AI Clinical Suggestion]: ${result.rationale}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleCommitTriage = () => {
    const priorityName =
      selectedTier === 1 ? 'Critical' :
      selectedTier === 2 ? 'High' :
      selectedTier === 3 ? 'Moderate' : 'Low';

    onSaveTriage(currentPatient.id, {
      urgencyTier: selectedTier,
      priority: priorityName,
      tierName: priorityName,
      clinicalNote: clinicianNotes,
      status: 'Waiting'
    });
  };

  return (
    <div className="p-5 md:p-7 space-y-6 flex-1 max-w-5xl">
      {/* Header with Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('patient-queue')}
            className="text-xs font-bold text-slate-600 hover:text-teal-700 flex items-center gap-1 transition-colors mb-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Queue
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Emergency Triage Assessment
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
              CLINICAL DECISION PROTOCOL
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Assessing clinician: <b>{currentUser?.name || 'Dr. Sarah Khan'}</b> ({currentUser?.role?.split('&')[0] || 'Triage Lead'})
          </p>
        </div>

        {/* Patient Switcher for demo ease */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Active Patient:</span>
          <select
            value={currentPatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="mediqueue-input-field text-xs min-w-[190px] font-bold"
          >
            {allPatients.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.name} ({p.priority})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Dossier Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">{currentPatient.name}</h2>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {currentPatient.id}
            </span>
            <span className="text-xs text-slate-500">
              {currentPatient.age} yrs • {currentPatient.gender}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            <b>Chief Complaint:</b> {currentPatient.presentingComplaint}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Symptom Onset: {currentPatient.whenFeltSymptoms}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAiAnalyze}
            disabled={aiAnalyzing}
            className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-300 text-teal-800 hover:bg-teal-100 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            {aiAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Running Gemini CDS...</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 text-teal-600" />
                <span>Gemini CDS Recommendation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Recommendation Alert if triggered */}
      {aiSuggestion && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Google Gemini Clinical CDS Finding:</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-200/60 text-teal-900 font-bold">
              SUGGESTED: TIER {aiSuggestion.urgencyTier} ({aiSuggestion.tierName})
            </span>
          </div>
          <div className="text-xs text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            <div>
              <b>Diagnostic Hypothesis:</b> {aiSuggestion.diagnosticHypothesis}
            </div>
            <div>
              <b>Suggested Bay:</b> {aiSuggestion.suggestedDepartment}
            </div>
          </div>
          {aiSuggestion.dangerFlags?.length > 0 && (
            <div className="text-xs text-rose-700 flex items-center gap-1.5 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span><b>Red Flags:</b> {aiSuggestion.dangerFlags.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Vitals & Radar + Triage Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Vitals Station & Acuity Radar */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
              Recorded Vital Signs & Telemetry
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">SpO2 (Pulse Oximetry)</span>
                <span className={`text-base font-black ${currentPatient.vitals?.spo2 < 92 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {currentPatient.vitals?.spo2}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">Heart Rate / Pulse</span>
                <span className="text-base font-black text-slate-800">
                  {currentPatient.vitals?.pulse || currentPatient.vitals?.hr} bpm
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">Blood Pressure</span>
                <span className="text-base font-black text-slate-800">
                  {currentPatient.vitals?.bp}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">Body Temperature</span>
                <span className="text-base font-black text-slate-800">
                  {currentPatient.vitals?.temp} °C
                </span>
              </div>
            </div>
          </div>

          {/* Radar Acuity */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
            <span className="text-[10px] font-mono text-teal-700 uppercase font-bold mb-1">
              Physiological Acuity Polygon
            </span>
            <RadarChart
              data={currentPatient.radarData}
              size={190}
              strokeColor="#0d9488"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div><b>Known Allergies:</b> {currentPatient.medicalHistory?.find(m => m.includes('Allergy')) || 'None documented'}</div>
            <div><b>Existing Conditions:</b> {currentPatient.previousDiseases || 'None'}</div>
            <div><b>Current Medications:</b> {currentPatient.currentMeds || 'None'}</div>
          </div>
        </div>

        {/* Right Column: Triage Category Assignment & Actions */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
              Select Clinician Urgency Level (ESI v4 Protocol)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Critical */}
              <button
                type="button"
                onClick={() => setSelectedTier(1)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  selectedTier === 1
                    ? 'border-rose-500 bg-rose-50/70 shadow-md ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-rose-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> Tier 1: Critical
                  </span>
                  <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                    RESUSCITATION
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Immediate life-saving intervention needed. Shock, arrest, respiratory failure.
                </p>
              </button>

              {/* High */}
              <button
                type="button"
                onClick={() => setSelectedTier(2)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  selectedTier === 2
                    ? 'border-orange-500 bg-orange-50/70 shadow-md ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:border-orange-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Tier 2: High
                  </span>
                  <span className="text-[10px] font-mono bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-bold">
                    EMERGENT
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  High risk, severe pain, acute altered mental state. Fast bedside physician evaluation.
                </p>
              </button>

              {/* Moderate */}
              <button
                type="button"
                onClick={() => setSelectedTier(3)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  selectedTier === 3
                    ? 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-amber-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Tier 3: Moderate
                  </span>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    URGENT
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Stable vital signs with multiple diagnostic resource needs (labs, x-ray, IV).
                </p>
              </button>

              {/* Low */}
              <button
                type="button"
                onClick={() => setSelectedTier(4)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  selectedTier === 4
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-emerald-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Tier 4: Low
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    FAST TRACK
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Routine complaints, minor sprain, sutures, prescription refills.
                </p>
              </button>
            </div>
          </div>

          {/* Clinician Rationale Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Clinician Assessment Notes & Triage Rationale *
            </label>
            <textarea
              rows={4}
              value={clinicianNotes}
              onChange={e => setClinicianNotes(e.target.value)}
              className="mediqueue-input-field text-xs font-sans"
              placeholder="Record clinical rationale for chosen category, targeted observations, and immediate orders..."
            />
          </div>

          {/* Interactive SlideCommit Slider or Confirm Action */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Commit & Escalate in Priority Queue:
              </span>
              <span className="text-[10px] font-mono text-teal-700 font-bold">SLIDECOMMIT</span>
            </div>

            <div className="flex items-center justify-center py-1">
              <SlideCommit
                key={`${currentPatient.id}-${selectedTier}`}
                label={`→ Slide to Commit Triage as ${selectedTier === 1 ? 'CRITICAL' : selectedTier === 2 ? 'HIGH' : selectedTier === 3 ? 'MODERATE' : 'LOW'}`}
                doneLabel="✓ Triage Assessment Saved"
                errorLabel="✕ Action Failed"
                onConfirm={handleCommitTriage}
                onDone={() => onNavigate('patient-queue')}
                onError={err => console.error(err)}
                trackColor="#0B2850"
                handleColor="#ffffff"
                successColor="#10b981"
                dangerColor="#ef4444"
                width={320}
                height={46}
                radius={23}
                speed={55}
                returnBounce={0.38}
                landingDip={0.025}
                holdMs={1000}
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleCommitTriage}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold underline"
              >
                Or click here to save immediately without sliding
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>
              Qualified clinical review is mandatory. All triage categorizations are digitally signed and recorded in the audit log.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
