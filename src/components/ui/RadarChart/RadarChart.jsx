import React, { useMemo } from 'react';
import './RadarChart.css';

/**
 * RadarChart - Interactive SVG Radar / Spider Web visualization
 * Used for multi-dimensional patient triage acuity & health metrics
 */
export default function RadarChart({
  data = [
    { label: 'Symptom Load', value: 85, fullMark: 100 },
    { label: 'Acuity Score', value: 78, fullMark: 100 },
    { label: 'Pain Index', value: 90, fullMark: 100 },
    { label: 'Vitals Instability', value: 65, fullMark: 100 },
    { label: 'Risk Pre-conditions', value: 70, fullMark: 100 },
    { label: 'Urgency Tier', value: 80, fullMark: 100 },
  ],
  size = 320,
  levels = 4,
  fillColor = 'rgba(99, 102, 241, 0.45)',
  strokeColor = '#818cf8',
  showLabels = true,
  className = '',
}) {
  const radius = (size - 80) / 2;
  const center = size / 2;
  const totalAxes = data.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Compute points for concentric background web polygons
  const webLevels = useMemo(() => {
    return Array.from({ length: levels }, (_, levelIndex) => {
      const levelRadius = (radius / levels) * (levelIndex + 1);
      const points = Array.from({ length: totalAxes }, (_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + levelRadius * Math.cos(angle);
        const y = center + levelRadius * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
      return points;
    });
  }, [levels, radius, center, totalAxes, angleStep]);

  // Compute axes line endpoints
  const axes = useMemo(() => {
    return data.map((item, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      // Label coordinate with small outward offset
      const labelDistance = radius + 24;
      const labelX = center + labelDistance * Math.cos(angle);
      const labelY = center + labelDistance * Math.sin(angle);

      return {
        ...item,
        x,
        y,
        labelX,
        labelY,
        angle,
      };
    });
  }, [data, radius, center, angleStep]);

  // Compute the data polygon coordinates
  const { polygonPoints, dataCoords } = useMemo(() => {
    const coords = data.map((item, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const normalizedValue = Math.min(Math.max(item.value / (item.fullMark || 100), 0), 1);
      const itemRadius = radius * normalizedValue;
      const x = center + itemRadius * Math.cos(angle);
      const y = center + itemRadius * Math.sin(angle);
      return { x, y, label: item.label, value: item.value };
    });

    return {
      polygonPoints: coords.map((c) => `${c.x},${c.y}`).join(' '),
      dataCoords: coords,
    };
  }, [data, radius, center, angleStep]);

  return (
    <div className={`radar-chart-container ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="radar-chart-svg">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#312e81" stopOpacity="0.05" />
          </radialGradient>
          <filter id="radarBloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Circular ambient background */}
        <circle cx={center} cy={center} r={radius} className="radar-bg-circle" />

        {/* Concentric grid webs */}
        {webLevels.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            className="radar-web-level"
            style={{ opacity: 0.15 + (idx / levels) * 0.15 }}
          />
        ))}

        {/* Radial axes lines */}
        {axes.map((axis, idx) => (
          <line
            key={idx}
            x1={center}
            y1={center}
            x2={axis.x}
            y2={axis.y}
            className="radar-axis-line"
          />
        ))}

        {/* Shaded Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#radarGlow)"
          stroke={strokeColor}
          strokeWidth="2.5"
          filter="url(#radarBloom)"
          className="radar-data-polygon"
        />

        {/* Vertex points with animated pulsing rings */}
        {dataCoords.map((coord, idx) => (
          <g key={idx} className="radar-vertex-group">
            <circle cx={coord.x} cy={coord.y} r="5" className="radar-vertex-dot" fill={strokeColor} />
            <circle cx={coord.x} cy={coord.y} r="9" className="radar-vertex-halo" stroke={strokeColor} />
          </g>
        ))}

        {/* Metric Labels */}
        {showLabels &&
          axes.map((axis, idx) => (
            <text
              key={idx}
              x={axis.labelX}
              y={axis.labelY}
              className="radar-label"
              textAnchor={
                Math.abs(axis.labelX - center) < 10
                  ? 'middle'
                  : axis.labelX > center
                  ? 'start'
                  : 'end'
              }
              dominantBaseline="middle"
            >
              {axis.label}
              <tspan className="radar-label-val" dx="4" fill="#a5b4fc">
                {axis.value}
              </tspan>
            </text>
          ))}
      </svg>
    </div>
  );
}
