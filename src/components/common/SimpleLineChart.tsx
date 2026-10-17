import React, { useState, useId } from 'react';

export interface ChartSeries {
  id: string;
  name: string;
  color: string;
  data: number[];
  dashed?: boolean;
}

interface SimpleLineChartProps {
  labels: string[];
  series: ChartSeries[];
  height?: number;
  yAxisLabel?: string;
  formatY?: (val: number) => string;
  confidenceBounds?: {
    upper: number[];
    lower: number[];
  };
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  labels,
  series,
  height = 320,
  yAxisLabel = 'Harga (Rp)',
  formatY = (v) => `Rp ${v.toLocaleString('id-ID')}`,
  confidenceBounds,
}) => {
  const chartId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!labels.length || !series.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400">
        Tidak ada data grafik yang tersedia
      </div>
    );
  }

  // Calculate min and max
  let allValues: number[] = [];
  series.forEach((s) => {
    allValues = allValues.concat(s.data);
  });
  if (confidenceBounds) {
    allValues = allValues.concat(confidenceBounds.upper, confidenceBounds.lower);
  }

  const minValRaw = Math.min(...allValues);
  const maxValRaw = Math.max(...allValues);
  const padding = (maxValRaw - minValRaw) * 0.1 || minValRaw * 0.1 || 1000;
  const minY = Math.max(0, Math.floor((minValRaw - padding) / 1000) * 1000);
  const maxY = Math.ceil((maxValRaw + padding) / 1000) * 1000;
  const rangeY = maxY - minY || 1;

  // Chart layout geometry
  const paddingLeft = 85;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 45;
  const width = 800; // SVG viewBox coordinate width
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const getX = (idx: number) => {
    if (labels.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (idx / (labels.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const norm = (val - minY) / rangeY;
    return paddingTop + innerHeight - norm * innerHeight;
  };

  // Generate SVG path for a series
  const generatePath = (data: number[]) => {
    return data
      .map((val, idx) => {
        const x = getX(idx);
        const y = getY(val);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Generate Confidence Band Area
  let confidencePath = '';
  if (confidenceBounds && confidenceBounds.upper.length && confidenceBounds.lower.length) {
    const upperPoints = confidenceBounds.upper.map((v, i) => `${getX(i).toFixed(1)} ${getY(v).toFixed(1)}`);
    const lowerPointsReversed = confidenceBounds.lower
      .map((v, i) => `${getX(i).toFixed(1)} ${getY(v).toFixed(1)}`)
      .reverse();
    confidencePath = `M ${upperPoints[0]} L ${upperPoints.slice(1).join(' L ')} L ${lowerPointsReversed.join(' L ')} Z`;
  }

  // Y-axis tick divisions (5 ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = minY + ratio * rangeY;
    return {
      value: Math.round(val),
      yPos: paddingTop + innerHeight - ratio * innerHeight,
    };
  });

  // Pick ~6 readable x-ticks
  const xTickStep = Math.max(1, Math.floor(labels.length / 6));
  const xTicks = labels
    .map((lbl, idx) => ({ label: lbl, idx }))
    .filter((_, idx) => idx % xTickStep === 0 || idx === labels.length - 1);

  return (
    <div className="w-full">
      {/* Legend & Summary */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          {series.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-6 rounded-sm"
                style={{
                  backgroundColor: s.color,
                  borderBottom: s.dashed ? '2px dashed #ffffff' : undefined,
                  opacity: s.dashed ? 0.9 : 1,
                }}
              />
              <span className="font-medium text-slate-800">{s.name}</span>
              {s.dashed && <span className="text-slate-400 text-[11px]">(Garis Putus-Putus)</span>}
              {!s.dashed && series.length > 1 && (
                <span className="text-slate-400 text-[11px]">(Garis Solid)</span>
              )}
            </div>
          ))}
          {confidenceBounds && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="inline-block h-3 w-4 rounded-sm bg-emerald-500/15 border border-emerald-500/30" />
              <span>Interval Konfidensi (95%)</span>
            </div>
          )}
        </div>
        <div className="text-slate-400 text-[11px]">
          {yAxisLabel} · Tabular Numerals (IDR)
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white p-2 shadow-xs">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(paddingLeft, Math.min(width - paddingRight, mouseX));
            const ratio = (clampedX - paddingLeft) / innerWidth;
            const idx = Math.min(labels.length - 1, Math.max(0, Math.round(ratio * (labels.length - 1))));
            setHoverIndex(idx);
          }}
        >
          <defs>
            <linearGradient id={`grad-conf-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.yPos}
                x2={width - paddingRight}
                y2={tick.yPos}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={tick.yPos + 4}
                textAnchor="end"
                className="font-mono text-[10px] fill-slate-400 select-none"
              >
                {formatY(tick.value).replace('Rp ', '')}
              </text>
            </g>
          ))}

          {/* Confidence interval area */}
          {confidencePath && (
            <path d={confidencePath} fill={`url(#grad-conf-${chartId})`} />
          )}

          {/* Series lines */}
          {series.map((s) => (
            <path
              key={s.id}
              d={generatePath(s.data)}
              fill="none"
              stroke={s.color}
              strokeWidth={s.dashed ? 2.2 : 2.5}
              strokeDasharray={s.dashed ? '6 4' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* X-axis labels */}
          {xTicks.map((xt, i) => {
            const xPos = getX(xt.idx);
            return (
              <g key={i}>
                <line
                  x1={xPos}
                  y1={height - paddingBottom}
                  x2={xPos}
                  y2={height - paddingBottom + 5}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={xPos}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  className="font-mono text-[10px] fill-slate-500"
                >
                  {xt.label}
                </text>
              </g>
            );
          })}

          {/* Active Hover Crosshair & Points */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical line indicator */}
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={height - paddingBottom}
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Data points */}
              {series.map((s) => {
                const val = s.data[hoverIndex];
                if (val === undefined) return null;
                const ptX = getX(hoverIndex);
                const ptY = getY(val);
                return (
                  <circle
                    key={s.id}
                    cx={ptX}
                    cy={ptY}
                    r="4.5"
                    fill="#ffffff"
                    stroke={s.color}
                    strokeWidth="2.5"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute z-20 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-xs transition-transform duration-75"
            style={{
              left: `${Math.min(78, Math.max(12, (getX(hoverIndex) / width) * 100))}%`,
              top: '16px',
            }}
          >
            <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1 mb-1.5 flex items-center justify-between gap-3">
              <span>{labels[hoverIndex]}</span>
              <span className="text-[10px] text-slate-400 font-mono">PIHPS Maluku</span>
            </div>
            <div className="space-y-1">
              {series.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-4 font-mono tabular-nums">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}:
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatY(s.data[hoverIndex])}
                  </span>
                </div>
              ))}
              {series.length >= 2 && (
                <div className="mt-1 border-t border-slate-100 pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Selisih:</span>
                  <span
                    className={`font-semibold ${
                      series[1].data[hoverIndex] - series[0].data[hoverIndex] >= 0
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {series[1].data[hoverIndex] - series[0].data[hoverIndex] > 0 ? '+' : ''}
                    Rp {(series[1].data[hoverIndex] - series[0].data[hoverIndex]).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
