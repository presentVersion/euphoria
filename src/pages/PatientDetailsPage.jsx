import React, { useState } from 'react';
import {
  ChevronLeft,
  User,
  HeartPulse,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Stethoscope,
  Activity,
  ArrowRight,
  Flame,
  ShieldCheck,
  Edit,
  Play
} from 'lucide-react';
import { RadarChart } from '../components/ui/radar-chart';
import SwipeRow from '../components/ui/SwipeRow/SwipeRow';
import SlideCommit from '../components/ui/SlideCommit/SlideCommit';

export default function PatientDetailsPage({
  patient,
  acceptedPatientIds = new Set(),
  onAcceptPatient,
  onTaskCommit,
  onNavigate
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Lab'); // 'Overview' | 'Medical History' | 'Vital Signs' | 'Notes'
  const [newNote, setNewNote] = useState('');
  const [localNotes, setLocalNotes] = useState(patient?.clinicalNotes || []);

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500">
        No patient record loaded. Please select a patient from the queue.
      </div>
    );
  }

  const isAccepted = acceptedPatientIds.has(patient.id) || patient.status === 'In-Consult';

  const renderTriageBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical' || p === '1') return <span className="badge-crit px-2.5 py-0.5 rounded-full text-xs font-bold">Critical</span>;
    if (p === 'high' || p === '2') return <span className="badge-high px-2.5 py-0.5 rounded-full text-xs font-bold">High</span>;
    if (p === 'moderate' || p === '3') return <span className="badge-mod px-2.5 py-0.5 rounded-full text-xs font-bold">Moderate</span>;
    return <span className="badge-low px-2.5 py-0.5 rounded-full text-xs font-bold">Low</span>;
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteObj = {
      author: 'Dr. Sarah Khan',
      role: 'Staff Physician',
      time: 'Just now',
      text: newNote.trim()
    };
    setLocalNotes(prev => [noteObj, ...prev]);
    setNewNote('');
  };

  return (
    <div className="p-5 md:p-7 space-y-5 flex-1 max-w-5xl">
      {/* Top Back Action Bar (Screen 5 Wireframe) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('patient-queue')}
          className="text-xs font-bold text-slate-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Queue
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('emergency-triage')}
            className="px-3 py-1.5 rounded-lg border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Reassess Triage</span>
          </button>

          <button
            onClick={() => onNavigate('consultation')}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Consultation</span>
          </button>
        </div>
      </div>

      {/* Patient Summary Card (Screen 5 Wireframe) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-500 shadow-inner">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
              {renderTriageBadge(patient.priority)}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {patient.id} | Age: {patient.age} | {patient.gender}
            </p>
          </div>
        </div>

        {/* 3 Metric Pills (Waiting Time, Triage Level, Status) */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[90px]">
            <div className="text-[10px] text-slate-400">Waiting Time</div>
            <div className="text-sm font-black text-slate-800 mt-0.5">
              {patient.waitingTimeFormatted || `${patient.waitingMinutes} min`}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center min-w-[90px]">
            <div className="text-[10px] text-rose-500">Triage Level</div>
            <div className="text-sm font-black text-rose-600 mt-0.5">
              {patient.priority}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center min-w-[90px]">
            <div className="text-[10px] text-blue-500">Status</div>
            <div className="text-sm font-black text-blue-700 mt-0.5">
              {isAccepted ? 'In-Consult' : patient.status}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Screen 5 Wireframe: Overview | Medical History | Vital Signs | Notes) */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-bold text-slate-500">
        {['Overview', 'Medical History', 'Vital Signs', 'Patient Folder & Reports', 'Notes'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 relative transition-colors ${
              activeTab === tab
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Symptoms, Conditions, Medications */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
                Symptoms / Condition
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {patient.symptomsList?.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                    <span>{s}</span>
                  </div>
                )) || (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                    <span>{patient.presentingComplaint}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
                Existing Conditions
              </h4>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                  <span>{patient.previousDiseases || 'None reported'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
                Current Medications
              </h4>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                  <span>{patient.currentMeds || 'None reported'}</span>
                </div>
              </div>
            </div>

            {/* Interactive SwipeRow Tasks */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Clinical Action Items (Swipe to Mark Done)
                </h4>
                <span className="text-[10px] font-mono text-teal-600 font-bold">SWIPEROW</span>
              </div>

              {patient.activeTasks?.length > 0 ? (
                patient.activeTasks.map(task => (
                  <SwipeRow
                    key={task.id}
                    height={42}
                    radius={10}
                    actionWidth={75}
                    actionColor="#10b981"
                    rowColor="#f8fafc"
                    textColor="#0f172a"
                    actions={[{ id: 'complete', label: 'Done', dismiss: true }]}
                    onCommit={() => onTaskCommit(patient.id, task.id)}
                    label={task.label}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{task.label}</span>
                    </div>
                  </SwipeRow>
                ))
              ) : (
                <div className="p-3 text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 font-medium">
                  ✓ All initial emergency tasks completed for {patient.name}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Vitals, Radar, Clinician & Accept Button */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2.5">
                Vital Signs
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-mono">SpO2</span>
                  <span className={`text-base font-black ${patient.vitals?.spo2 < 92 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {patient.vitals?.spo2}%
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-mono">Pulse</span>
                  <span className="text-base font-black text-slate-800">
                    {patient.vitals?.pulse || patient.vitals?.hr} bpm
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-mono">Temperature</span>
                  <span className="text-base font-black text-slate-800">
                    {patient.vitals?.temp} °C
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-mono">Blood Pressure</span>
                  <span className="text-base font-black text-slate-800">
                    {patient.vitals?.bp} mmHg
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                  <span className="text-[10px] text-slate-400 block font-mono">Respiratory Rate</span>
                  <span className="text-base font-black text-slate-800">
                    {patient.vitals?.rr || 20}/min
                  </span>
                </div>
              </div>
            </div>

            {/* 6-Axis Radar Chart */}
            <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-mono text-teal-700 uppercase font-bold mb-1">
                Acuity Multiaxial Radar
              </span>
              <RadarChart
                data={[
                  { metric: 'Symptom Load', desktop: patient?.urgencyTier === 1 ? 95 : 75, mobile: 70 },
                  { metric: 'Acuity Score', desktop: patient?.urgencyTier === 1 ? 98 : 70, mobile: 65 },
                  { metric: 'Pain Index', desktop: (patient?.vitals?.pain || 8) * 10, mobile: 55 },
                  { metric: 'Vitals Instability', desktop: (patient?.vitals?.spo2 < 92 || patient?.vitals?.hr > 120) ? 92 : 60, mobile: 60 },
                  { metric: 'Risk Factors', desktop: 85, mobile: 68 },
                  { metric: 'Urgency Tier', desktop: patient?.urgencyTier === 1 ? 96 : 72, mobile: 65 },
                ]}
                glowing={patient?.urgencyTier === 1}
                className="w-full max-w-[280px]"
              />
            </div>

            {/* Assigned Clinician Card (Screen 5 Wireframe) */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Assigned Clinician
              </span>
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                  <img
                    src="/assets/doctor_neuro.jpg"
                    alt="Clinician"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {patient.assignedClinician?.split(',')[0] || 'Dr. Anjali Mehta'}
                  </div>
                  <div className="text-[10px] text-teal-700 font-semibold">
                    {patient.assignedClinician?.split(',')[1] || 'Emergency Physician'}
                  </div>
                </div>
              </div>
            </div>

            {/* Accept Patient Action (SlideCommit or Direct Click) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[10px] font-mono text-teal-700 uppercase font-bold">
                Consultation Transition:
              </div>

              {!isAccepted ? (
                <div className="space-y-2">
                  <button
                    onClick={() => onAcceptPatient(patient.id)}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Accept Patient for Consultation</span>
                  </button>

                  <div className="flex items-center justify-center py-1">
                    <SlideCommit
                      key={patient.id}
                      label="→ Slide to Accept Patient"
                      doneLabel="✓ Patient Accepted"
                      errorLabel="✕ Action Failed"
                      onConfirm={() => onAcceptPatient(patient.id)}
                      onDone={() => {}}
                      onError={err => console.error(err)}
                      trackColor="#0B2850"
                      handleColor="#ffffff"
                      successColor="#10b981"
                      dangerColor="#ef4444"
                      width={280}
                      height={44}
                      radius={22}
                      speed={55}
                      returnBounce={0.38}
                      landingDip={0.025}
                      holdMs={1000}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <div className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Patient is In-Consultation</span>
                  </div>
                  <button
                    onClick={() => onNavigate('consultation')}
                    className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                  >
                    Open Active Consultation Room →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onNavigate('patient-records')}
                  className="w-full py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  View Full Medical File
                </button>
                <button
                  onClick={() => onNavigate('emergency-triage')}
                  className="w-full py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MEDICAL HISTORY */}
      {activeTab === 'Medical History' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Longitudinal Medical History & Diagnostic Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Previous Chronic Illnesses:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {patient.previousDiseases || 'No documented chronic illnesses.'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Past Surgical Procedures:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {patient.previousSurgeries || 'No past surgical interventions reported.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Known Allergies:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {patient.medicalHistory?.find(m => m.includes('Allergy')) || 'No known drug or environmental allergies.'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Attached Historical Files:</span>
                <div className="space-y-1.5">
                  {(patient.previousReports?.split(',') || ['ECG_Baseline.pdf']).map((file, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <span className="font-mono text-teal-800 font-semibold">{file.trim()}</span>
                      <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">VERIFIED PDF</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: VITAL SIGNS */}
      {activeTab === 'Vital Signs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Observation Flowsheet & Vital Trends
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-3">Recorded Time</th>
                  <th className="py-2.5 px-3">SpO2</th>
                  <th className="py-2.5 px-3">HR (bpm)</th>
                  <th className="py-2.5 px-3">Blood Pressure</th>
                  <th className="py-2.5 px-3">Temp (°C)</th>
                  <th className="py-2.5 px-3">Resp. Rate</th>
                  <th className="py-2.5 px-3">Assessing Clinician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-3 px-3 text-slate-700">Triage Intake (08m ago)</td>
                  <td className={`py-3 px-3 font-bold ${patient.vitals?.spo2 < 92 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {patient.vitals?.spo2}%
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-bold">{patient.vitals?.pulse || patient.vitals?.hr}</td>
                  <td className="py-3 px-3 text-slate-800">{patient.vitals?.bp}</td>
                  <td className="py-3 px-3 text-slate-800">{patient.vitals?.temp}</td>
                  <td className="py-3 px-3 text-slate-800">{patient.vitals?.rr || 20}/min</td>
                  <td className="py-3 px-3 text-slate-600 font-sans">{patient.assignedClinician?.split(',')[0]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: NOTES */}
      {activeTab === 'Notes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Chronological Clinical Notes & Triage Logs
          </h3>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Add observation note or clinician progress entry..."
              className="mediqueue-input-field text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Add Clinical Note
            </button>
          </form>

          <div className="space-y-3 pt-2">
            {localNotes.length === 0 ? (
              <p className="text-xs text-slate-400">No notes recorded yet.</p>
            ) : (
              localNotes.map((note, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-bold text-slate-800">{note.author} ({note.role})</span>
                    <span className="font-mono">{note.time}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{note.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 📁 INTERACTIVE CLINICAL REPORT INSPECTION MODAL */}
      {selectedReportModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedReportModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{selectedReportModal.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Patient: {patient.name} ({patient.id}) · {selectedReportModal.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Metadata Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Attending Physician</span>
                <strong className="text-slate-800">{selectedReportModal.doctor || 'Dr. Rajesh Sharma, MD'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Laboratory Category</span>
                <strong className="text-teal-800">{selectedReportModal.category || 'Diagnostic'}</strong>
              </div>
            </div>

            {/* Clinical Findings Body */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Clinical Findings & Diagnostic Interpretation
              </h4>
              <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-100/80 text-xs leading-relaxed text-slate-800 font-mono">
                {selectedReportModal.findings}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Physician Order Status:</strong> Findings require correlation with acute bedside vitals. Document actions in consultation notes.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-teal-600" /> Digitally Certified
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Printing clinical report to hospital networked printer...')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => alert('Downloading official encrypted medical PDF dossier...')}
                  className="mediqueue-btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📤 UPLOAD REPORT MODAL */}
      {uploadModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setUploadModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900">Upload Clinical Report to Patient Folder</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Report Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Brain MRI T1/T2 Axial Scan.pdf"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  className="mediqueue-input-field w-full text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="mediqueue-input-field w-full text-xs font-semibold"
                >
                  <option value="Lab">Pathology / Blood Laboratory</option>
                  <option value="Radiology">Radiology / X-Ray / CT / MRI</option>
                  <option value="Cardiology">ECG / Echo / Cardiac Telemetry</option>
                  <option value="Discharge">Consultation & Discharge Summary</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-1 hover:border-teal-400 cursor-pointer">
                <FileText className="w-8 h-8 text-teal-600 mx-auto" />
                <span className="font-bold text-slate-700 block">Click to select PDF or image</span>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG, DICOM up to 25MB</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Report "${uploadName || 'Clinical_Document.pdf'}" uploaded to ${patient.name}'s folder!`);
                  setUploadModalOpen(false);
                }}
                className="mediqueue-btn-primary px-3 py-1.5 text-xs font-bold"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
