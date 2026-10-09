import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Filter,
  Eye,
  Flame,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Stethoscope
} from 'lucide-react';
import AnimatedList from '../components/ui/AnimatedList/AnimatedList';

export default function PatientQueuePage({
  patients,
  selectedPatientId,
  acceptedPatientIds = new Set(),
  onSelectPatient,
  onNavigate,
  onAcceptPatient
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [triageFilter, setTriageFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [useAnimatedList, setUseAnimatedList] = useState(false);
  const pageSize = 8;

  // Filtered and sorted patients
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.presentingComplaint.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTriage =
        triageFilter === 'All' ||
        p.priority.toLowerCase() === triageFilter.toLowerCase() ||
        p.tierName.toLowerCase() === triageFilter.toLowerCase();

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'In-Consult' && (acceptedPatientIds.has(p.id) || p.status === 'In-Consult')) ||
        (statusFilter === 'Waiting' && !acceptedPatientIds.has(p.id) && p.status === 'Waiting');

      return matchSearch && matchTriage && matchStatus;
    });
  }, [patients, searchQuery, triageFilter, statusFilter, acceptedPatientIds]);

  // Paginated patients
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  // Helpers for Badges
  const renderTriageBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical' || p === '1') {
      return <span className="badge-crit px-2.5 py-0.5 rounded-full text-[11px] font-bold">Critical</span>;
    }
    if (p === 'high' || p === '2') {
      return <span className="badge-high px-2.5 py-0.5 rounded-full text-[11px] font-bold">High</span>;
    }
    if (p === 'moderate' || p === '3') {
      return <span className="badge-mod px-2.5 py-0.5 rounded-full text-[11px] font-bold">Moderate</span>;
    }
    return <span className="badge-low px-2.5 py-0.5 rounded-full text-[11px] font-bold">Low</span>;
  };

  const renderStatusBadge = (status, patientId) => {
    const isAccepted = acceptedPatientIds.has(patientId) || status === 'In-Consult';
    if (isAccepted) {
      return (
        <span className="badge-inconsult px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
          <span>In-Consult</span>
        </span>
      );
    }
    return (
      <span className="badge-waiting px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Waiting</span>
      </span>
    );
  };

  return (
    <div className="p-5 md:p-7 space-y-5 flex-1">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">Prioritized list of waiting patients.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseAnimatedList(!useAnimatedList)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              useAnimatedList
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {useAnimatedList ? '✓ Dynamic Motion Queue' : 'Switch to AnimatedList'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Screen 4 Wireframe) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, ID or condition..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="mediqueue-input-field pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={triageFilter}
            onChange={e => {
              setTriageFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="mediqueue-input-field text-xs min-w-[140px] font-semibold"
          >
            <option value="All">All Triage Levels</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Moderate">Moderate Only</option>
            <option value="Low">Low Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="mediqueue-input-field text-xs min-w-[130px] font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="In-Consult">In Consultation</option>
          </select>
        </div>
      </div>

      {/* Prioritized Patient Queue Table (Screen 4 Wireframe) */}
      {!useAnimatedList ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Age</th>
                  <th className="py-3.5 px-4">Symptoms / Condition</th>
                  <th className="py-3.5 px-4">Waiting Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No patients found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedPatients.map(patient => (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        selectedPatientId === patient.id ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderTriageBadge(patient.priority)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {patient.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {patient.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {patient.age}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={patient.presentingComplaint}>
                        {patient.presentingComplaint}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {patient.waitingTimeFormatted || `${patient.waitingMinutes} min`}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(patient.status, patient.id)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => {
                            onSelectPatient(patient.id);
                            onNavigate('emergency-triage');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[11px] transition-colors"
                          title="Review or Reassess Triage"
                        >
                          Triage
                        </button>

                        <button
                          onClick={() => {
                            onSelectPatient(patient.id);
                            onNavigate('patient-details');
                          }}
                          className="px-3.5 py-1 rounded-lg bg-[#123B73] text-white font-bold text-[11px] hover:bg-[#0B2850] transition-colors shadow-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (Matching Screen 4: Showing 1-8 of 24 patients, < 1 2 3 >) */}
          <div className="p-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing {filteredPatients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} patients
            </span>

            <div className="flex items-center gap-1 font-mono">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded font-bold transition-colors ${
                    currentPage === page
                      ? 'bg-teal-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* React Bits AnimatedList View */
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="text-xs text-slate-500 font-mono">
            ANIMATED DYNAMIC QUEUE (ARROW KEYS ENABLED FOR FAST BEDSIDE TRIAGE)
          </div>
          <AnimatedList
            items={filteredPatients}
            onItemSelect={(p) => {
              onSelectPatient(p.id);
              onNavigate('patient-details');
            }}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={true}
            renderItem={(p) => (
              <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  {renderTriageBadge(p.priority)}
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {p.name} <span className="font-mono text-slate-400">({p.id})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {p.presentingComplaint}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-slate-500">
                    {p.waitingTimeFormatted || `${p.waitingMinutes} min`}
                  </span>
                  <button className="px-3 py-1 rounded-lg bg-teal-600 text-white font-bold text-[11px]">
                    View
                  </button>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
