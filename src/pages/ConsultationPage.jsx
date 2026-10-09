import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Clock,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  Bed,
  ArrowRight,
  ShieldCheck,
  Mic,
  Save,
  LogOut
} from 'lucide-react';
import VoicePill from '../components/ui/VoicePill/VoicePill';

export default function ConsultationPage({
  patient,
  currentUser,
  onCompleteConsultation,
  onNavigate
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(254); // Demo timer starting ~4 min
  const [soapNotes, setSoapNotes] = useState({
    subjective: patient ? `Patient describes: ${patient.presentingComplaint}. Onset: ${patient.whenFeltSymptoms}.` : '',
    objective: patient ? `Vitals: SpO2 ${patient.vitals?.spo2}%, BP ${patient.vitals?.bp}, Pulse ${patient.vitals?.pulse || patient.vitals?.hr} bpm, Temp ${patient.vitals?.temp} C. Heart sounds S1S2 present.` : '',
    assessment: patient ? `${patient.nameOfIllness || 'Clinical Assessment'}. Prioritized ESI Tier ${patient.urgencyTier} (${patient.priority}).` : '',
    plan: 'IV Cannulation, Stat blood draws, telemetry monitoring. Monitor response.'
  });
  const [prescriptions, setPrescriptions] = useState('IV Fluids 500mL, Paracetamol 1g IV Stat');
  const [referralDept, setReferralDept] = useState('Cardiology & Cath Lab');
  const [isSaving, setIsSaving] = useState(false);
  const [consultCompleted, setConsultCompleted] = useState(false);

  // Live timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceStop = (text) => {
    if (!text) return;
    setSoapNotes(prev => ({
      ...prev,
      subjective: (prev.subjective ? prev.subjective + ' ' : '') + text
    }));
  };

  const handleComplete = (disposition) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setConsultCompleted(true);
      onCompleteConsultation(patient.id, {
        disposition,
        soapNotes,
        prescriptions,
        referralDept,
        duration: formatTimer(elapsedSeconds)
      });
    }, 700);
  };

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500">
        No patient selected for active consultation.
      </div>
    );
  }

  return (
    <div className="p-5 md:p-7 space-y-5 flex-1 max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('patient-details')}
            className="text-xs font-bold text-slate-600 hover:text-teal-700 flex items-center gap-1 transition-colors mb-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dossier
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Active Consultation Room
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
              CLINICAL ENCOUNTER
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Attending Clinician: <b>{currentUser?.name || 'Dr. Sarah Khan'}</b> | Department: <b>{patient.department}</b>
          </p>
        </div>

        {/* Live Timer Pill */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white font-mono text-xs flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-[10px]">CONSULT TIME:</span>
            <span className="font-bold text-teal-300 text-sm">{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Patient Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">{patient.name}</h2>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {patient.id}
            </span>
            <span className="text-xs text-slate-500">
              {patient.age}y • {patient.gender}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              patient.urgencyTier === 1 ? 'badge-crit' : patient.urgencyTier === 2 ? 'badge-high' : 'badge-mod'
            }`}>
              {patient.priority}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            <b>Complaint:</b> {patient.presentingComplaint}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">VITALS SUMMARY</div>
            <div className="font-bold text-slate-800">
              SpO2 {patient.vitals?.spo2}% | HR {patient.vitals?.pulse || patient.vitals?.hr} | BP {patient.vitals?.bp}
            </div>
          </div>
        </div>
      </div>

      {consultCompleted ? (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-bold text-emerald-950">Consultation Successfully Completed</h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            Clinical findings documented, prescription logged, and patient disposition committed to hospital queue records.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('patient-queue')}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
            >
              Return to Patient Queue
            </button>
            <button
              onClick={() => onNavigate('staff-dashboard')}
              className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs"
            >
              Staff Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* SOAP Clinical Documentation Form */
        <div className="space-y-5">
          {/* Voice Pill for SOAP dictation */}
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-900">
              <Mic className="w-4 h-4 text-teal-600" />
              <span>Hands-Free Speech Dictation for Subjective Findings:</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* S - Subjective */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">S</span>
                <span>Subjective (Patient Reported)</span>
              </label>
              <textarea
                rows={3}
                value={soapNotes.subjective}
                onChange={e => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                className="mediqueue-input-field text-xs font-sans"
              />
            </div>

            {/* O - Objective */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">O</span>
                <span>Objective (Observations & Vitals)</span>
              </label>
              <textarea
                rows={3}
                value={soapNotes.objective}
                onChange={e => setSoapNotes({ ...soapNotes, objective: e.target.value })}
                className="mediqueue-input-field text-xs font-sans"
              />
            </div>

            {/* A - Assessment */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">A</span>
                <span>Assessment & Provisional Diagnosis</span>
              </label>
              <textarea
                rows={3}
                value={soapNotes.assessment}
                onChange={e => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
                className="mediqueue-input-field text-xs font-sans"
              />
            </div>

            {/* P - Plan */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">P</span>
                <span>Care Plan & Clinical Orders</span>
              </label>
              <textarea
                rows={3}
                value={soapNotes.plan}
                onChange={e => setSoapNotes({ ...soapNotes, plan: e.target.value })}
                className="mediqueue-input-field text-xs font-sans"
              />
            </div>
          </div>

          {/* Prescriptions & Referrals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Discharge Orders & Specialist Referral
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Prescribed Stat Medications
                </label>
                <input
                  type="text"
                  value={prescriptions}
                  onChange={e => setPrescriptions(e.target.value)}
                  placeholder="e.g. Aspirin 325mg, Atorvastatin 80mg"
                  className="mediqueue-input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Referral Department / Transfer Ward
                </label>
                <select
                  value={referralDept}
                  onChange={e => setReferralDept(e.target.value)}
                  className="mediqueue-input-field text-xs font-semibold"
                >
                  <option value="Cardiology & Cath Lab">Cardiology & Cath Lab</option>
                  <option value="Emergency Trauma Surgery">Emergency Trauma Surgery</option>
                  <option value="Neurology ICU">Neurology ICU</option>
                  <option value="Pulmonology High-Dependency">Pulmonology High-Dependency</option>
                  <option value="General Medical Ward">General Medical Ward</option>
                  <option value="Outpatient Follow-up">Outpatient Follow-up (Discharge)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Disposition Action Buttons */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Digital clinical sign-off will lock this encounter to legal medical record.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Consultation draft saved to encounter record.')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleComplete('Transferred / Admitted')}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Bed className="w-3.5 h-3.5" />
                <span>Admit to Bay</span>
              </button>

              <button
                type="button"
                onClick={() => handleComplete('Completed & Discharged')}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete & Discharge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
