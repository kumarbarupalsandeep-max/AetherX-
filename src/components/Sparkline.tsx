import React from 'react';

interface SparklineProps {
  changePercent?: number;
  data?: number[];
  width?: number | string;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  changePercent = 0,
  data,
  width = 96,
  height = 28,
  className = '',
}) => {
  const isUp = changePercent >= 0;
  const strokeColor = isUp ? '#0ECB81' : '#F6465D';
  const fillColor = isUp ? 'rgba(14, 203, 129, 0.12)' : 'rgba(246, 70, 93, 0.12)';
  const gradId = `spark-${Math.random().toString(36).slice(2, 8)}-${isUp ? 'up' : 'down'}`;

  // If explicit data points are not provided, synthesize a natural 7-day price trajectory
  // matching the sign and magnitude of changePercent
  const points = React.useMemo(() => {
    if (data && data.length > 2) return data;
    const count = 10;
    const pts: number[] = [];
    const trend = isUp ? 1 : -1;
    const mag = Math.min(Math.max(Math.abs(changePercent), 0.8), 18);
    let current = isUp ? 50 - mag * 1.5 : 50 + mag * 1.5;

    for (let i = 0; i < count; i++) {
      const noise = (Math.sin(i * 1.7) * 4 + Math.cos(i * 0.9) * 3);
      const step = (trend * mag * 3) / count;
      current += step + noise * 0.4;
      pts.push(Math.max(10, Math.min(90, current)));
    }
    // ensure last point accurately reflects the trend
    pts[pts.length - 1] = isUp ? Math.max(...pts) * 0.95 : Math.min(...pts) * 1.05;
    return pts;
  }, [changePercent, data, isUp]);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const w = 100;
  const h = 32;
  const paddingY = 4;

  const coordinates = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * w;
    const normalizedY = (p - min) / range;
    // invert Y because SVG y=0 is top
    const y = h - paddingY - normalizedY * (h - paddingY * 2);
    return { x, y };
  });

  // Generate smooth SVG curve using Catmull-Rom or cubic Bezier
  const pathD = coordinates.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }, '');

  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width, height }}
      className={`overflow-visible select-none shrink-0 ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
