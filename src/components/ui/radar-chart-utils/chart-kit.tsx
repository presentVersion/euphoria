"use client";
import * as React from 'react';

export const RADAR_METRICS = [
  { metric: 'Symptom Load', desktop: 88, mobile: 72 },
  { metric: 'Acuity Score', desktop: 94, mobile: 68 },
  { metric: 'Pain Index', desktop: 85, mobile: 60 },
  { metric: 'Vitals Instability', desktop: 78, mobile: 65 },
  { metric: 'Risk Factors', desktop: 90, mobile: 74 },
  { metric: 'Urgency Tier', desktop: 92, mobile: 70 },
];

export const SERIES = {
  desktop: { label: 'Assessed Acuity', color: '#0d9488' },
  mobile: { label: 'Baseline Average', color: '#6366f1' },
};

export const HOVER_TRANSITION = 'opacity 180ms ease';

export const markOpacity = (active, key) =>
  active && active !== key ? 0.45 : 1;

export function axisTick(props) {
  const { x, y, payload } = props;
  return (
    <text
      x={x}
      y={y}
      fill="#64748b"
      fontSize={11}
      fontWeight={600}
      textAnchor="middle"
      dy={4}
    >
      {payload.value}
    </text>
  );
}

export function useChartId(prefix) {
  return prefix + '-chart';
}

export function useChartMotion() {
  return { isAnimationActive: true, animationDuration: 650 };
}

export function ChartFrame({ children, className = '' }) {
  return <div className={'relative w-full min-h-[280px] flex flex-col items-center justify-center ' + className}>{children}</div>;
}

export function ChartLegend() {
  return (
    <div className="flex items-center justify-center gap-5 pb-2 text-xs font-semibold text-slate-600">
      <span className="flex items-center gap-1.5">
        <i style={{ background: SERIES.desktop.color, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
        {SERIES.desktop.label}
      </span>
      <span className="flex items-center gap-1.5">
        <i style={{ background: SERIES.mobile.color, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
        {SERIES.mobile.label}
      </span>
    </div>
  );
}

export function ChartPlotSurface({ children }) {
  return <div className="w-full h-[260px] min-h-[260px]">{children}</div>;
}

export function ChartLoadingBars({ count = 8 }) {
  return (
    <div className="flex items-end gap-2 h-48 w-full p-6 justify-center">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="flex-1 bg-slate-200 rounded-md animate-pulse"
          style={{ height: ((i % 3 + 1) * 28) + '%' }}
        />
      ))}
    </div>
  );
}

export function ChartTooltipContent({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1">
      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }} className="font-semibold">{p.name}:</span>
          <span className="font-mono font-bold text-slate-900">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function ChartGlowFilter({ id }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}
