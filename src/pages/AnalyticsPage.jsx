import { RadarChart } from '../components/ui/radar-chart';
import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  Smile,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
  Layers
} from 'lucide-react';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="p-5 md:p-7 space-y-6 flex-1">
      {/* Header (Screen 6 Wireframe) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Insights into patient flow, waiting times and triage performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="mediqueue-input-field text-xs min-w-[130px] font-semibold"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* 4 Metric KPI Cards (Screen 6 Wireframe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Total Patients</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">183</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 12% vs last week
          </span>
        </div>

        {/* Avg. Waiting Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Avg. Waiting Time</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">36 min</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> 18% vs last week
          </span>
        </div>

        {/* Critical Cases */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Critical Cases</span>
          <div className="text-3xl font-black text-rose-600 tracking-tight">28</div>
          <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 6% vs last week
          </span>
        </div>

        {/* Patient Satisfaction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Patient Satisfaction</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">4.7 / 5</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 9% vs last week
          </span>
        </div>
      </div>

      {/* Charts Grid: Patient Flow + Triage Breakdown (Screen 6 Wireframe) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Patient Flow SVG Line/Area Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Patient Flow</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-sky-600">
                <span className="w-3 h-1 bg-sky-500 rounded-full inline-block" /> Arrivals
              </span>
              <span className="flex items-center gap-1.5 text-teal-600">
                <span className="w-3 h-1 bg-teal-500 rounded-full inline-block" /> Consultations
              </span>
            </div>
          </div>

          <div className="h-48 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 160">
              <defs>
                <linearGradient id="arrivalsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1" />

              {/* Arrivals Filled Area */}
              <path
                d="M 30,120 Q 100,50 180,85 T 320,40 T 480,70 L 480,140 L 30,140 Z"
                fill="url(#arrivalsGrad)"
              />

              {/* Arrivals Curve (Sky Blue) */}
              <path
                d="M 30,120 Q 100,50 180,85 T 320,40 T 480,70"
                fill="none"
                stroke="#0284c7"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Consultations Curve (Teal Dashed) */}
              <path
                d="M 30,135 Q 100,80 180,105 T 320,65 T 480,90"
                fill="none"
                stroke="#0d9488"
                strokeWidth="3"
                strokeDasharray="5 3"
                strokeLinecap="round"
              />

              {/* Points */}
              {[[30, 120], [180, 85], [320, 40], [480, 70]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#0284c7" stroke="#fff" strokeWidth="2" />
              ))}
            </svg>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono px-3">
              <span>Apr 21</span>
              <span>Apr 22</span>
              <span>Apr 23</span>
              <span>Apr 24</span>
              <span>Apr 25</span>
              <span>Apr 26</span>
              <span>Apr 27</span>
            </div>
          </div>
        </div>

        {/* Triage Level Breakdown Donut (Screen 6 Wireframe) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Triage Level Breakdown</h3>
          <div className="flex items-center justify-around gap-2 py-2">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                {/* Critical: 8% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#dc2626" strokeWidth="12" strokeDasharray="19 220" strokeDashoffset="0" />
                {/* High: 30% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="72 167" strokeDashoffset="-19" />
                {/* Moderate: 39% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#eab308" strokeWidth="12" strokeDasharray="93 146" strokeDashoffset="-91" />
                {/* Low: 23% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#16a34a" strokeWidth="12" strokeDasharray="55 184" strokeDashoffset="-184" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">183</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Patients</span>
              </div>
            </div>

            <div className="space-y-2 text-xs w-full max-w-[170px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-slate-600 font-medium">Critical</span>
                </div>
                <span className="font-bold text-slate-800">15 (8%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-slate-600 font-medium">High</span>
                </div>
                <span className="font-bold text-slate-800">54 (30%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-medium">Moderate</span>
                </div>
                <span className="font-bold text-slate-800">72 (39%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-slate-600 font-medium">Low</span>
                </div>
                <span className="font-bold text-slate-800">42 (23%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Analytics Row: Average Waiting Time by Triage + Peak Hours (Screen 6 Wireframe) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Average Waiting Time by Triage Level */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Average Waiting Time by Triage Level</h3>
          <div className="space-y-3 pt-1 text-xs">
            {[
              { label: 'Critical', time: '12 min', percent: '20%', color: 'bg-rose-600' },
              { label: 'High', time: '26 min', percent: '42%', color: 'bg-orange-500' },
              { label: 'Moderate', time: '41 min', percent: '65%', color: 'bg-amber-500' },
              { label: 'Low', time: '63 min', percent: '100%', color: 'bg-emerald-600' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">{item.time}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.percent }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours Bar Chart (Screen 6 Wireframe) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Peak Hours</h3>
          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
            {[
              { label: '6am-9am', height: '40%', val: '24' },
              { label: '9am-12pm', height: '85%', val: '58' },
              { label: '12pm-3pm', height: '100%', val: '72' },
              { label: '3pm-6pm', height: '75%', val: '49' },
              { label: '6pm-9pm', height: '60%', val: '38' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.val}
                </span>
                <div
                  className="w-full rounded-t-lg bg-sky-500 hover:bg-sky-600 transition-all shadow-sm"
                  style={{ height: bar.height }}
                />
                <span className="text-[10px] text-slate-500 font-mono text-center leading-tight">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Multiaxial Performance Radar Section */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Multiaxial Emergency Throughput Radar</h3>
            <p className="text-xs text-slate-500 mt-0.5">Six-dimensional clinical readiness and queue performance audit.</p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
            RADAR BENCHMARK v4
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <RadarChart glowing showLegend className="max-w-xl mx-auto" />
        </div>
      </div>
    </div>
  );
}