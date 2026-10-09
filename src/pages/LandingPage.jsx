import React, { useState } from 'react';
import {
  Calendar,
  User,
  Users,
  Activity,
  HeartPulse,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Radio,
  Clock,
  Sparkles,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import ScrollExpand from '../components/ui/ScrollExpand/ScrollExpand';
import { CalendlyCarousel } from '../components/ui/connected-carousel';
import ContactWithGlobe from '../components/ui/contact-with-globe';

export default function LandingPage({
  onBookAppointment,
  onNavigate,
  onOpenCopilot
}) {
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    sex: 'Male',
    symptoms: '',
    existingConditions: '',
    currentMeds: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.symptoms) return;
    setIsSubmitting(true);
    onBookAppointment(form, () => {
      setIsSubmitting(false);
      setForm({
        fullName: '',
        age: '',
        sex: 'Male',
        symptoms: '',
        existingConditions: '',
        currentMeds: ''
      });
    });
  };

  const DOCTORS_DATA = [
    {
      id: 'doc-1',
      author: 'Dr. Sarah Khan, MD',
      role: 'Chief Emergency Medicine & Triage Lead',
      stat: 'HEAD OF TRAUMA',
      quote: 'Deterministic triage saves lives. MediQueue algorithms ensure zero critical patient slips through unseen.',
      defaultImage: '/assets/doctor_avatar.jpg',
      selectedImage: '/assets/doctor_avatar.jpg'
    },
    {
      id: 'doc-2',
      author: 'Dr. Anjali Mehta, MD',
      role: 'Emergency Physician & Clinical Informatics',
      stat: 'ACUTE CARE BAY',
      quote: 'Live vital integration and trained Gemini CDS reduce door-to-treatment time by 38% across emergency wards.',
      defaultImage: '/assets/doctor_neuro.jpg',
      selectedImage: '/assets/doctor_neuro.jpg'
    },
    {
      id: 'doc-3',
      author: 'Dr. Vikramaditya Sen, MS',
      role: 'Director of Resuscitation & Surgical Triage',
      stat: 'RESUSCITATION POD',
      quote: 'Immediate vital feedback empowers our resus bay to allocate blood and operating bays prior to arrival.',
      defaultImage: '/assets/doctor_pediatric.jpg',
      selectedImage: '/assets/doctor_pediatric.jpg'
    }
  ];

  return (
    <div className="bg-[#F3F8FD] min-h-[calc(100vh-48px)] flex flex-col text-slate-800">
      <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full space-y-10">
        
        {/* ========================================================
            HERO SECTION (Screen 1 Reference)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Smarter queues.<br />
              <span className="text-teal-600">Faster care.</span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-md">
              MEDIQUEUE prioritizes patients based on the urgency of their condition, so those who need care the most get it first.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#book-form"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment →</span>
              </a>
              <button
                onClick={() => onNavigate('patient-queue')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-sm transition-all"
              >
                <Users className="w-4 h-4 text-teal-600" />
                <span>View Live Queue</span>
              </button>
            </div>
          </div>

          {/* Right Hero Image with Authentic Floating Badges */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-slate-100">
              <img
                src="/assets/mediqueue_hero.jpg"
                alt="Doctor Attending Patient at MediQueue"
                className="w-full h-full object-cover"
              />

              {/* Floating Badge 1: Priority: Urgent */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
                  !
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block text-[9px] leading-tight font-semibold">Priority:</span>
                  <span className="font-bold text-rose-600">Urgent</span>
                </div>
              </div>

              {/* Floating Badge 2: Queue updates: Live */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 animate-in fade-in zoom-in duration-500">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <div className="text-xs">
                  <span className="text-slate-400 block text-[9px] leading-tight font-semibold">Queue updates</span>
                  <span className="font-bold text-cyan-700 flex items-center gap-1">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            BOOK AN APPOINTMENT CARD (Screen 1 Reference)
            ======================================================== */}
        <div id="book-form" className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Book an Appointment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit symptoms for instant clinical prioritization in the emergency queue.
              </p>
            </div>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 font-bold">
              ESTIMATED TRIAGE: &lt; 2 MIN
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    className="mediqueue-input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Age *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    required
                    placeholder="Enter your age"
                    value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                    className="mediqueue-input-field pl-9 text-xs"
                  />
                </div>
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

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Symptoms / Reason for Visit *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe your symptoms or reason for visit (e.g. chest discomfort, high fever, abdominal pain)"
                value={form.symptoms}
                onChange={e => setForm({ ...form, symptoms: e.target.value })}
                className="mediqueue-input-field text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Existing Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. diabetes, hypertension, asthma, etc"
                  value={form.existingConditions}
                  onChange={e => setForm({ ...form, existingConditions: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Current Medications</label>
                <input
                  type="text"
                  placeholder="List current medications and dosages"
                  value={form.currentMeds}
                  onChange={e => setForm({ ...form, currentMeds: e.target.value })}
                  className="mediqueue-input-field text-xs"
                />
              </div>
            </div>

            {/* Emergency Notice & Register Action */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600 max-w-lg">
                <AlertTriangle className="w-5 h-5 text-teal-600 shrink-0" />
                <span>
                  <b>Medical Emergency?</b> Seek immediate in-person assistance at triage. Our automated CDS assigns priority upon check-in.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ fullName: '', age: '', sex: 'Male', symptoms: '', existingConditions: '', currentMeds: '' })}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Evaluating Urgency...' : 'Register Patient →'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ========================================================
            3 FEATURE CARDS (Screen 1 Reference)
            ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Smart Triage</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Automatically assesses urgency and assigns clinically verified priority levels using trained ESI v4 logic.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Live Queue</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                See real-time updates on waiting times, care area capacity, and doctor bedside evaluations.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Patient Monitoring</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Track physiological vital signs, telemetry trends, and timely notifications when consultation begins.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            COMMAND CENTER & SCROLLEXPAND SHOWCASE
            ======================================================== */}
        <section id="how-it-works" className="pt-2 space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-lg font-bold text-slate-900">How MediQueue Coordinates Emergency Flow</h3>
            <p className="text-xs text-slate-500">From digital patient intake to rapid resuscitation mobilization.</p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg" style={{ height: '320px' }}>
            <ScrollExpand
              src="/assets/mediqueue_hero.jpg"
              alt="Emergency Command Center"
              title="COMMAND CENTER"
              scrollHint="SCROLL TO EXPAND"
              mediaZoom={1.12}
              startWidth={70}
              startHeight={75}
              scrollDistance={0.5}
              holdDistance={0.2}
            >
              <div className="max-w-lg text-center p-4 bg-slate-950/90 backdrop-blur-md rounded-xl border border-white/10 mx-auto text-white">
                <h3 className="text-base font-bold mb-1">Metropolitan Hospital Emergency Department</h3>
                <p className="text-xs text-slate-300 mb-3">
                  Balancing emergency room throughput, eliminating clinical wait bottlenecks, and guaranteeing critical patient intervention.
                </p>
                <button
                  onClick={() => onNavigate('staff-dashboard')}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
                >
                  Enter Clinician Console
                </button>
              </div>
            </ScrollExpand>
          </div>
        </section>

        {/* ========================================================
            CLINICAL FACULTY CAROUSEL
            ======================================================== */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinical Leadership & Triage Staff</h3>
              <p className="text-xs text-slate-500">Board-certified emergency physicians supervising emergency care bays.</p>
            </div>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 font-bold">
              CLINICIANS ON DUTY
            </span>
          </div>
          <CalendlyCarousel items={DOCTORS_DATA} autoPlayInterval={5000} />
        </section>

        {/* ========================================================
            HOSPITAL DISPATCH & GLOBE HOTLINE
            ======================================================== */}
        <section className="space-y-3">
          <ContactWithGlobe />
        </section>

        {/* ========================================================
            FOOTER (Section 5 Specification)
            ======================================================== */}
        <footer className="pt-8 pb-12 border-t border-slate-200 text-xs text-slate-500 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                +
              </div>
              <span className="font-extrabold text-slate-900 text-sm">MEDIQUEUE</span>
              <span className="text-slate-400">| Smarter Triage. Healthier Tomorrows.</span>
            </div>

            <div className="flex items-center gap-6 text-slate-600 font-medium">
              <button onClick={() => onNavigate('landing')} className="hover:text-slate-900">Home</button>
              <a href="#how-it-works" className="hover:text-slate-900">How It Works</a>
              <button onClick={() => onNavigate('emergency-triage')} className="hover:text-slate-900">Emergency Triage</button>
              <button onClick={() => onNavigate('staff-dashboard')} className="hover:text-slate-900">Staff Portal</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            <p>© 2026 MEDIQUEUE Smart Patient Queue & Emergency Triage System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Use</span>
              <span>•</span>
              <span>Clinical Safety Disclaimer</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
