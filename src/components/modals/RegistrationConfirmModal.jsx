import React from 'react';
import { CheckCircle2, ArrowRight, User, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RegistrationConfirmModal({
  isOpen,
  onClose,
  patient,
  onNavigate
}) {
  if (!isOpen || !patient) return null;

  const getBadgeClass = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical' || p === '1') return 'badge-crit';
    if (p === 'high' || p === '2') return 'badge-high';
    if (p === 'moderate' || p === '3') return 'badge-mod';
    return 'badge-low';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">
            Registration Confirmed
          </h3>
          <p className="text-xs text-slate-500">
            Patient record created and clinical triage prioritized in queue.
          </p>
        </div>

        {/* Patient Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">UNIQUE PATIENT ID</span>
              <span className="text-lg font-black font-mono text-teal-800">{patient.id}</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getBadgeClass(patient.priority)}`}>
              {patient.priority} Priority
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Patient Name</span>
              <span className="font-bold text-slate-800">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Demographics</span>
              <span className="font-semibold text-slate-700">{patient.age} yrs • {patient.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Allocated Care Bay</span>
              <span className="font-semibold text-slate-700">{patient.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Intake Timestamp</span>
              <span className="font-mono text-slate-700">Just now</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
            <span className="text-[10px] text-slate-400 block font-semibold">Chief Complaint</span>
            <span className="italic line-clamp-2">"{patient.presentingComplaint}"</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onNavigate('patient-queue');
            }}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>View in Priority Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('patient-details');
            }}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
          >
            Open Patient Medical Record
          </button>
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Patient data committed to local clinical state</span>
        </div>
      </div>
    </div>
  );
}
