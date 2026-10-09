import { RadarChart } from '../components/ui/radar-chart';
import React, { useState } from 'react';
import {
  FolderLock,
  Search,
  Users,
  Eye,
  Filter,
  Grid,
  List,
  FileText,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import FolderFloat from '../components/ui/FolderFloat/FolderFloat';

export default function PatientRecordsPage({
  patients,
  selectedPatientId,
  onSelectPatient,
  onNavigate
}) {
  const [viewMode, setViewMode] = useState('bento'); // 'bento' | 'table'
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filtered = patients.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.presentingComplaint.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || p.department.includes(deptFilter);
    return matchSearch && matchDept;
  });

  const renderTriageBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical' || p === '1') return <span className="badge-crit px-2.5 py-0.5 rounded-full text-[11px] font-bold">Critical</span>;
    if (p === 'high' || p === '2') return <span className="badge-high px-2.5 py-0.5 rounded-full text-[11px] font-bold">High</span>;
    if (p === 'moderate' || p === '3') return <span className="badge-mod px-2.5 py-0.5 rounded-full text-[11px] font-bold">Moderate</span>;
    return <span className="badge-low px-2.5 py-0.5 rounded-full text-[11px] font-bold">Low</span>;
  };

  return (
    <div className="p-5 md:p-7 space-y-5 flex-1">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Medical Records Directory
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              HIPAA DOSSIER ARCHIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Searchable institutional medical repository. Hover zero-g dossiers to inspect floating medical history tags.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('bento')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'bento'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Bento Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Directory Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search dossier by patient name, MRN, complaint..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mediqueue-input-field pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="mediqueue-input-field text-xs min-w-[150px] font-semibold"
          >
            <option value="All">All Care Bays</option>
            <option value="Resuscitation">Resuscitation Bay</option>
            <option value="Acute">Acute Care Bay</option>
            <option value="Urgent">Urgent Care Bay</option>
            <option value="Fast Track">Fast Track Clinic</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: BENTO MATRIX OF FLOATING FOLDERS */}
      {viewMode === 'bento' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.slice(0, 6).map((p, index) => {
            const isSelected = selectedPatientId === p.id;
            const matrixCode = `NODE-0${index + 1}`;

            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPatient(p.id);
                  onNavigate('patient-details');
                }}
                className={`relative rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between overflow-hidden border ${
                  isSelected
                    ? 'bg-white border-teal-500 ring-2 ring-teal-500/30 shadow-xl'
                    : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md'
                }`}
                style={{ minHeight: '300px' }}
              >
                {/* Header ribbon */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      p.urgencyTier === 1 ? 'bg-rose-500 animate-pulse' :
                      p.urgencyTier === 2 ? 'bg-orange-500' :
                      p.urgencyTier === 3 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-[10px] font-mono tracking-wider font-bold text-slate-600">
                      {matrixCode} // {p.department}
                    </span>
                  </div>
                  {renderTriageBadge(p.priority)}
                </div>

                {/* Patient Overview */}
                <div className="py-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                      {p.name}
                      <span className="text-xs font-mono font-normal text-slate-400">
                        ({p.age}y • {p.gender})
                      </span>
                    </h4>
                    <p className="text-[11px] font-mono text-teal-800 mt-0.5">
                      {p.id} • Waiting: <span className="text-amber-600 font-bold">{p.waitingTimeFormatted || `${p.waitingMinutes}m`}</span>
                    </p>
                  </div>

                  {/* Vitals summary pills */}
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span className={`px-2 py-0.5 rounded border ${
                      p.vitals?.spo2 < 92 ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      SpO2: {p.vitals?.spo2}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                      HR: {p.vitals?.pulse || p.vitals?.hr}
                    </span>
                  </div>
                </div>

                {/* Centerpiece: FolderFloat Component with Floating Tags */}
                <div className="relative my-2 py-2 flex items-center justify-center">
                  <FolderFloat
                    items={p.medicalHistory || ['Emergency Record', 'Baseline ECG', 'Allergy Screen']}
                    label={p.name.split(' ')[0]}
                    sublabel={`${(p.medicalHistory || []).length} Dossier Tags`}
                    trigger="hover"
                    defaultOpen={false}
                    physics={true}
                    drift={0.35}
                    folderColor="#0B2850"
                    frontColor="#123B73"
                    paperColor="#F3F8FD"
                    itemColor="#0D9488"
                    itemTextColor="#FFFFFF"
                    labelColor="#FFFFFF"
                    width={130}
                    height={84}
                    spread={85}
                    lift={15}
                  />
                </div>

                {/* Footer bar */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <p className="text-[11px] text-slate-500 line-clamp-1 italic max-w-[65%]">
                    "{p.presentingComplaint}"
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPatient(p.id);
                      onNavigate('patient-details');
                    }}
                    className="text-[10px] font-mono px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-sm"
                  >
                    OPEN RECORD
                  </button>
                </div>

                {/* Multiaxial Acuity & Symptoms Radar Preview */}
                <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-teal-700 uppercase font-bold mb-1">
                    Symptom & Acuity Multiaxial Radar
                  </span>
                  <RadarChart
                    data={[
                      { metric: 'Symptom Load', desktop: p.urgencyTier === 1 ? 95 : 75, mobile: 70 },
                      { metric: 'Acuity Score', desktop: p.urgencyTier === 1 ? 98 : 70, mobile: 65 },
                      { metric: 'Pain Index', desktop: (p.vitals?.pain || 7) * 10, mobile: 55 },
                      { metric: 'Vitals Instability', desktop: (p.vitals?.spo2 < 92 || p.vitals?.hr > 120) ? 92 : 60, mobile: 60 },
                      { metric: 'Risk Factors', desktop: 80, mobile: 65 },
                      { metric: 'Urgency Tier', desktop: p.urgencyTier === 1 ? 96 : 70, mobile: 65 },
                    ]}
                    glowing={p.urgencyTier === 1}
                    className="w-full max-w-[240px]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: DIRECTORY TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Age / Sex</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Triage Priority</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.age}y • {p.gender}</td>
                    <td className="py-3.5 px-4 text-slate-700">{p.department}</td>
                    <td className="py-3.5 px-4">{renderTriageBadge(p.priority)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{p.status}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          onSelectPatient(p.id);
                          onNavigate('patient-details');
                        }}
                        className="px-3 py-1 rounded-lg bg-[#123B73] hover:bg-[#0B2850] text-white text-[11px] font-bold"
                      >
                        View File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
