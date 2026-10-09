import React, { useState, useMemo } from 'react';
import CurvedLoop from './components/ui/CurvedLoop/CurvedLoop';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import StaffHeader from './components/layout/StaffHeader';

// Modals
import AuthModal from './components/modals/AuthModal';
import GeminiKeyModal from './components/modals/GeminiKeyModal';
import CopilotDrawer from './components/modals/CopilotDrawer';
import RegistrationConfirmModal from './components/modals/RegistrationConfirmModal';

// Pages
import LandingPage from './pages/LandingPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import PatientRegistrationPage from './pages/PatientRegistrationPage';
import EmergencyTriagePage from './pages/EmergencyTriagePage';
import PatientQueuePage from './pages/PatientQueuePage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import ConsultationPage from './pages/ConsultationPage';
import PatientRecordsPage from './pages/PatientRecordsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

// Seed Data & Services
import { INITIAL_PATIENTS, SAMPLE_STAFF_MEMBERS, SAMPLE_NOTIFICATIONS } from './data/mockPatients';
import { analyzePatientTriageWithGemini } from './services/geminiTriageService';

export default function App() {
  // Navigation State
  // 'landing' | 'staff-dashboard' | 'patient-registration' | 'emergency-triage' |
  // 'patient-queue' | 'patient-details' | 'consultation' | 'patient-records' |
  // 'analytics' | 'notifications' | 'settings'
  const [activeTab, setActiveTab] = useState('landing');

  // Patients State
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState('P1024');
  const [acceptedPatientIds, setAcceptedPatientIds] = useState(new Set(['P1017']));

  // Authenticated Staff State
  const [allStaff, setAllStaff] = useState(SAMPLE_STAFF_MEMBERS);
  const [currentUser, setCurrentUser] = useState(SAMPLE_STAFF_MEMBERS[0]);

  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [newlyRegisteredPatient, setNewlyRegisteredPatient] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Marquee Ticker Alert
  const [alertBanner, setAlertBanner] = useState(
    '✦ TEAM EUPHORIA • MEDIQUEUE ACTIVE ✦ REAL-TIME ESI v4 AI TRIAGE ✦ RESUSCITATION BAY ON STANDBY ✦'
  );

  // Derived Selected Patient
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Calculated Real-Time Metrics for Dashboard
  const stats = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter(p => p.urgencyTier === 1 || p.priority === 'Critical').length;
    const high = patients.filter(p => p.urgencyTier === 2 || p.priority === 'High').length;
    const moderate = patients.filter(p => p.urgencyTier === 3 || p.priority === 'Moderate').length;
    const low = patients.filter(p => p.urgencyTier >= 4 || p.priority === 'Low').length;
    const inConsult = patients.filter(p => p.status === 'In-Consult' || acceptedPatientIds.has(p.id)).length;
    const avgWait = Math.round(
      patients.reduce((acc, p) => acc + (p.waitingMinutes || 0), 0) / (patients.length || 1)
    );
    return { total, critical, high, moderate, low, inConsult, avgWait };
  }, [patients, acceptedPatientIds]);

  // Handle Public Appointment Registration
  const handleBookAppointment = async (formData, callback) => {
    try {
      const triage = await analyzePatientTriageWithGemini({
        name: formData.fullName,
        age: formData.age,
        gender: formData.sex,
        symptoms: formData.symptoms,
        history: formData.existingConditions,
        currentMeds: formData.currentMeds
      });

      const nextNum = patients.length + 1025;
      const newId = `P${nextNum}`;
      const newPatient = {
        id: newId,
        patientId: newId,
        mrn: newId,
        name: formData.fullName,
        age: parseInt(formData.age) || 30,
        gender: formData.sex,
        urgencyTier: triage.urgencyTier,
        tierName: triage.tierName,
        priority: triage.urgencyTier === 1 ? 'Critical' : triage.urgencyTier === 2 ? 'High' : triage.urgencyTier === 3 ? 'Moderate' : 'Low',
        department: triage.suggestedDepartment || 'Acute Care Bay',
        nameOfIllness: triage.diagnosticHypothesis || 'Clinical Intake Assessment',
        presentingComplaint: formData.symptoms,
        symptomsList: [formData.symptoms],
        previousDiseases: formData.existingConditions || 'None reported',
        whenFeltSymptoms: 'Reported during online pre-intake',
        currentMeds: formData.currentMeds || 'None reported',
        previousReports: 'None',
        previousSurgeries: 'None',
        vitals: {
          spo2: triage.urgencyTier === 1 ? 92 : 98,
          pulse: triage.urgencyTier === 1 ? 112 : 80,
          hr: triage.urgencyTier === 1 ? 112 : 80,
          temp: 37.0,
          bp: '124/80',
          rr: 18,
          gcs: 15,
          pain: 5,
          o2Delivery: 'Room Air'
        },
        assignedClinician: 'Dr. Sarah Khan, Chief Triage Specialist',
        waitingMinutes: 0,
        waitingTimeFormatted: '0 min',
        status: 'Waiting',
        activeTasks: [
          { id: `t-new-1-${newId}`, label: 'Primary Triage Vitals Check', completed: false }
        ],
        medicalHistory: [
          formData.existingConditions || 'No Chronic History',
          `Intake: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        ],
        clinicalNotes: [
          {
            author: 'System Intake Engine',
            role: 'Automated CDS',
            time: 'Just now',
            text: `Registered with complaint: ${formData.symptoms}. Assigned ${triage.tierName} priority.`
          }
        ],
        radarData: triage.radarScores
          ? [
              { label: 'Chest Pain', value: triage.radarScores.physiologicalUrgency || 60, fullMark: 100 },
              { label: 'Hypoxia Risk', value: triage.radarScores.symptomAcuity || 50, fullMark: 100 },
              { label: 'Vitals Stress', value: triage.radarScores.vitalsCompromise || 40, fullMark: 100 },
              { label: 'Cardiac Marker', value: triage.radarScores.comorbidityRisk || 40, fullMark: 100 },
              { label: 'Comorbidities', value: triage.radarScores.resourceNeeds || 30, fullMark: 100 },
              { label: 'Acuity Score', value: triage.urgencyTier === 1 ? 95 : 60, fullMark: 100 }
            ]
          : [
              { label: 'Chest Pain', value: 65, fullMark: 100 },
              { label: 'Hypoxia Risk', value: 50, fullMark: 100 },
              { label: 'Vitals Stress', value: 55, fullMark: 100 },
              { label: 'Cardiac Marker', value: 40, fullMark: 100 },
              { label: 'Comorbidities', value: 30, fullMark: 100 },
              { label: 'Acuity Score', value: 60, fullMark: 100 }
            ],
        redFlags: triage.dangerFlags || []
      };

      setPatients(prev => [newPatient, ...prev]);
      setSelectedPatientId(newId);
      setNewlyRegisteredPatient(newPatient);
      setShowConfirmModal(true);
      setAlertBanner(`✦ NEW PATIENT ARRIVAL: ${newPatient.name} • ${newPatient.priority.toUpperCase()} PRIORITY ✦`);
      if (callback) callback();
    } catch (err) {
      console.error(err);
      if (callback) callback();
    }
  };

  // Handle Staff Patient Registration
  const handleStaffRegistration = async (formData, andStartTriage, callback) => {
    try {
      const triage = await analyzePatientTriageWithGemini({
        name: formData.fullName,
        age: formData.age,
        gender: formData.sex,
        symptoms: formData.symptoms,
        history: formData.existingConditions,
        currentMeds: formData.currentMeds
      });

      const nextNum = patients.length + 1025;
      const newId = `P${nextNum}`;
      const newPatient = {
        id: newId,
        patientId: newId,
        mrn: newId,
        name: formData.fullName,
        age: parseInt(formData.age) || 35,
        gender: formData.sex,
        urgencyTier: triage.urgencyTier,
        tierName: triage.tierName,
        priority: triage.urgencyTier === 1 ? 'Critical' : triage.urgencyTier === 2 ? 'High' : triage.urgencyTier === 3 ? 'Moderate' : 'Low',
        department: triage.suggestedDepartment || 'Acute Care Bay',
        nameOfIllness: triage.diagnosticHypothesis || 'Intake Clinical Evaluation',
        presentingComplaint: formData.symptoms,
        symptomsList: [formData.symptoms],
        previousDiseases: formData.existingConditions || 'None reported',
        whenFeltSymptoms: formData.symptomDuration || 'Recent onset',
        currentMeds: formData.currentMeds || 'None reported',
        previousReports: formData.previousReports || 'None',
        previousSurgeries: 'None',
        vitals: {
          spo2: formData.spo2 ? parseInt(formData.spo2) : (triage.urgencyTier === 1 ? 92 : 98),
          pulse: formData.hr ? parseInt(formData.hr) : (triage.urgencyTier === 1 ? 112 : 82),
          hr: formData.hr ? parseInt(formData.hr) : (triage.urgencyTier === 1 ? 112 : 82),
          temp: formData.temp ? parseFloat(formData.temp) : 37.1,
          bp: formData.bp || '124/82',
          rr: formData.rr ? parseInt(formData.rr) : 18,
          gcs: 15,
          pain: 6,
          o2Delivery: 'Room Air'
        },
        assignedClinician: `${currentUser.name}, ${currentUser.role.split('&')[0]}`,
        waitingMinutes: 0,
        waitingTimeFormatted: '0 min',
        status: 'Waiting',
        activeTasks: [
          { id: `t-staff-1-${newId}`, label: 'Verify Initial Bedside Vitals', completed: true },
          { id: `t-staff-2-${newId}`, label: 'Attending Physician Evaluation', completed: false }
        ],
        medicalHistory: [
          formData.existingConditions || 'No Chronic History',
          `Intake by ${currentUser.name} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        ],
        clinicalNotes: [
          {
            author: currentUser.name,
            role: currentUser.role.split('&')[0],
            time: 'Just now',
            text: `Intake assessment complete. Presenting complaint: ${formData.symptoms}. Assigned initial ESI Tier ${triage.urgencyTier}.`
          }
        ],
        radarData: triage.radarScores
          ? [
              { label: 'Chest Pain', value: triage.radarScores.physiologicalUrgency || 65, fullMark: 100 },
              { label: 'Hypoxia Risk', value: triage.radarScores.symptomAcuity || 55, fullMark: 100 },
              { label: 'Vitals Stress', value: triage.radarScores.vitalsCompromise || 45, fullMark: 100 },
              { label: 'Cardiac Marker', value: triage.radarScores.comorbidityRisk || 45, fullMark: 100 },
              { label: 'Comorbidities', value: triage.radarScores.resourceNeeds || 35, fullMark: 100 },
              { label: 'Acuity Score', value: triage.urgencyTier === 1 ? 92 : 65, fullMark: 100 }
            ]
          : [
              { label: 'Chest Pain', value: 70, fullMark: 100 },
              { label: 'Hypoxia Risk', value: 60, fullMark: 100 },
              { label: 'Vitals Stress', value: 50, fullMark: 100 },
              { label: 'Cardiac Marker', value: 45, fullMark: 100 },
              { label: 'Comorbidities', value: 35, fullMark: 100 },
              { label: 'Acuity Score', value: 70, fullMark: 100 }
            ],
        redFlags: triage.dangerFlags || []
      };

      setPatients(prev => [newPatient, ...prev]);
      setSelectedPatientId(newId);
      setNewlyRegisteredPatient(newPatient);
      setAlertBanner(`✦ PATIENT REGISTERED: ${newPatient.name} • ESI ${newPatient.urgencyTier} ✦`);

      if (callback) callback();

      if (andStartTriage) {
        setActiveTab('emergency-triage');
      } else {
        setShowConfirmModal(true);
      }
    } catch (err) {
      console.error(err);
      if (callback) callback();
      setActiveTab('patient-queue');
    }
  };

  // Accept Patient for Consultation
  const handleAcceptPatient = (patientId) => {
    return new Promise((resolve) => {
      setPatients(prev =>
        prev.map(p =>
          p.id === patientId
            ? { ...p, status: 'In-Consult', waitingMinutes: 0, waitingTimeFormatted: '0 min' }
            : p
        )
      );
      setAcceptedPatientIds(prev => new Set([...prev, patientId]));
      setAlertBanner(`✦ ${currentUser.name.toUpperCase()} ACCEPTED ${patientId} • IN-CONSULT ACTIVE ✦`);
      resolve();
    });
  };

  // Complete Consultation
  const handleCompleteConsultation = (patientId, details) => {
    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              status: details.disposition.includes('Discharge') ? 'Discharged' : 'Transferred',
              clinicalNotes: [
                {
                  author: currentUser.name,
                  role: 'Attending Clinician',
                  time: 'Just now',
                  text: `Encounter completed (${details.duration}). Disposition: ${details.disposition}. Prescriptions: ${details.prescriptions}.`
                },
                ...(p.clinicalNotes || [])
              ]
            }
          : p
      )
    );
    setAcceptedPatientIds(prev => {
      const next = new Set(prev);
      next.delete(patientId);
      return next;
    });
    setAlertBanner(`✦ ENCOUNTER COMPLETE: ${patientId} DISPOSITIONED AS ${details.disposition.toUpperCase()} ✦`);
  };

  // Save Triage Assessment
  const handleSaveTriage = (patientId, triageData) => {
    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              urgencyTier: triageData.urgencyTier,
              priority: triageData.priority,
              tierName: triageData.tierName,
              status: triageData.status || 'Waiting',
              clinicalNotes: [
                {
                  author: currentUser.name,
                  role: 'Triage Clinician',
                  time: 'Just now',
                  text: triageData.clinicalNote
                },
                ...(p.clinicalNotes || [])
              ]
            }
          : p
      )
    );
    setAlertBanner(`✦ TRIAGE COMMITTED: ${patientId} CLASSIFIED AS ${triageData.priority.toUpperCase()} ✦`);
    setActiveTab('patient-queue');
  };

  // Mark task done
  const handleTaskCommit = (patientId, taskId) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            activeTasks: (p.activeTasks || []).filter(t => t.id !== taskId)
          };
        }
        return p;
      })
    );
  };

  const isStaffView = activeTab !== 'landing';

  return (
    <div className="site-outer-wrapper">
      <div className="site-app-frame">
        {/* 1. CurvedLoop Emergency Live Ticker */}
        <div style={{ height: '44px', overflow: 'hidden', background: '#071822', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <CurvedLoop
            marqueeText={alertBanner}
            speed={2.2}
            curveAmount={35}
            direction="left"
            className="text-[11px] uppercase tracking-widest text-teal-400 font-mono font-bold"
          />
        </div>

        {/* ========================================================
            PUBLIC VIEW: LANDING PAGE
            ======================================================== */}
        {activeTab === 'landing' && (
          <div className="flex-1 flex flex-col">
            <Navbar
              onNavigate={setActiveTab}
              onOpenCopilot={() => setShowCopilot(true)}
              onOpenLogin={() => setShowAuthModal(true)}
              currentUser={currentUser}
            />
            <LandingPage
              onBookAppointment={handleBookAppointment}
              onNavigate={setActiveTab}
              onOpenCopilot={() => setShowCopilot(true)}
            />
          </div>
        )}

        {/* ========================================================
            STAFF PORTAL FRAME (Persistent Sidebar + Staff Header)
            ======================================================== */}
        {isStaffView && (
          <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-44px)]">
            {/* Left Sidebar */}
            <Sidebar
              activeTab={activeTab}
              onNavigate={setActiveTab}
              patientCount={patients.length}
              unreadNotifsCount={SAMPLE_NOTIFICATIONS.filter(n => n.unread).length}
              onLogout={() => {
                setActiveTab('landing');
                setShowAuthModal(true);
              }}
            />

            {/* Right Main Content */}
            <div className="flex-1 mediqueue-content-bg flex flex-col min-w-0">
              <StaffHeader
                currentUser={currentUser}
                onOpenKeyModal={() => setShowKeyModal(true)}
                onOpenCopilot={() => setShowCopilot(true)}
                onNavigate={setActiveTab}
                unreadCount={SAMPLE_NOTIFICATIONS.filter(n => n.unread).length}
                onSelectUser={setCurrentUser}
                allStaff={allStaff}
                onLogout={() => {
                  setActiveTab('landing');
                  setShowAuthModal(true);
                }}
              />

              {/* View 1: Staff Dashboard */}
              {activeTab === 'staff-dashboard' && (
                <StaffDashboardPage
                  currentUser={currentUser}
                  patients={patients}
                  stats={stats}
                  onNavigate={setActiveTab}
                  onSelectPatient={(id) => {
                    setSelectedPatientId(id);
                    setActiveTab('patient-details');
                  }}
                />
              )}

              {/* View 2: Patient Registration Form */}
              {activeTab === 'patient-registration' && (
                <PatientRegistrationPage
                  onSubmitRegistration={handleStaffRegistration}
                  onStartTriageDirect={() => setActiveTab('emergency-triage')}
                />
              )}

              {/* View 3: Emergency Triage Assessment */}
              {activeTab === 'emergency-triage' && (
                <EmergencyTriagePage
                  patient={selectedPatient}
                  allPatients={patients}
                  currentUser={currentUser}
                  onSelectPatient={setSelectedPatientId}
                  onSaveTriage={handleSaveTriage}
                  onNavigate={setActiveTab}
                />
              )}

              {/* View 4: Prioritized Patient Queue */}
              {activeTab === 'patient-queue' && (
                <PatientQueuePage
                  patients={patients}
                  selectedPatientId={selectedPatientId}
                  acceptedPatientIds={acceptedPatientIds}
                  onSelectPatient={(id) => {
                    setSelectedPatientId(id);
                  }}
                  onNavigate={setActiveTab}
                  onAcceptPatient={handleAcceptPatient}
                />
              )}

              {/* View 5: Patient Details & Medical Record Dossier */}
              {activeTab === 'patient-details' && (
                <PatientDetailsPage
                  patient={selectedPatient}
                  acceptedPatientIds={acceptedPatientIds}
                  onAcceptPatient={handleAcceptPatient}
                  onTaskCommit={handleTaskCommit}
                  onNavigate={setActiveTab}
                />
              )}

              {/* View 6: Consultation Workflow Room */}
              {activeTab === 'consultation' && (
                <ConsultationPage
                  patient={selectedPatient}
                  currentUser={currentUser}
                  onCompleteConsultation={handleCompleteConsultation}
                  onNavigate={setActiveTab}
                />
              )}

              {/* View 7: Patient Records Bento Matrix & Directory */}
              {activeTab === 'patient-records' && (
                <PatientRecordsPage
                  patients={patients}
                  selectedPatientId={selectedPatientId}
                  onSelectPatient={setSelectedPatientId}
                  onNavigate={setActiveTab}
                />
              )}

              {/* View 8: Analytics & Flow Metrics */}
              {activeTab === 'analytics' && (
                <AnalyticsPage />
              )}

              {/* View 9: Notifications & Audit Activity Center */}
              {activeTab === 'notifications' && (
                <NotificationsPage
                  onSelectPatient={setSelectedPatientId}
                  onNavigate={setActiveTab}
                />
              )}

              {/* View 10: Institutional Settings */}
              {activeTab === 'settings' && (
                <SettingsPage
                  currentUser={currentUser}
                  onOpenKeyModal={() => setShowKeyModal(true)}
                  onLogout={() => {
                    setActiveTab('landing');
                    setShowAuthModal(true);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            GLOBAL MODALS & DRAWERS
            ======================================================== */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(staff) => {
            setCurrentUser(staff);
            setActiveTab('staff-dashboard');
          }}
          allStaff={allStaff}
        />

        <GeminiKeyModal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
        />

        <CopilotDrawer
          isOpen={showCopilot}
          onClose={() => setShowCopilot(false)}
          currentUser={currentUser}
        />

        <RegistrationConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          patient={newlyRegisteredPatient}
          onNavigate={setActiveTab}
        />
      </div>
    </div>
  );
}
