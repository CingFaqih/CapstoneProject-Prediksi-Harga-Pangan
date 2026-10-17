import React, { useState } from 'react';

interface BarChartItem {
  label: string;
  value: number | null;
  unit?: string;
  tooltipExtra?: string;
}

interface BarChartComparisonProps {
  title: string;
  subtitle?: string;
  items: BarChartItem[];
  metricType: 'MAE' | 'RMSE' | 'MAPE';
  height?: number;
}

export const BarChartComparison: React.FC<BarChartComparisonProps> = ({
  title,
  subtitle,
  items,
  metricType,
  height = 280,
}) => {
  const [activeItem, setActiveItem] = useState<BarChartItem | null>(null);

  // Filter valid numbers
  const validValues = items
    .map((it) => it.value)
    .filter((v): v is number => v !== null && !isNaN(v));

  const maxVal = validValues.length > 0 ? Math.max(...validValues) * 1.15 : 10;

  const getMetricColor = (val: number | null) => {
    if (val === null) return '#cbd5e1';
    if (metricType === 'MAPE') {
      if (val < 2.0) return '#10b981'; // Emerald (Very good)
      if (val < 4.0) return '#0284c7'; // Sky (Good)
      return '#f59e0b'; // Amber (Moderate)
    }
    return '#0284c7'; // Sky blue for error currency
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="text-xs font-mono text-slate-400">
          Metrik: {metricType} {metricType === 'MAPE' ? '(Persentase)' : '(Rupiah)'}
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const ratio = item.value !== null ? Math.min(100, (item.value / maxVal) * 100) : 0;
          const color = getMetricColor(item.value);

          return (
            <div
              key={idx}
              className="group flex items-center gap-3 text-xs"
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* Commodity label */}
              <div className="w-28 shrink-0 font-medium text-slate-700 truncate text-right">
                {item.label}
              </div>

              {/* Bar track and fill */}
              <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-slate-100/80">
                {item.value !== null ? (
                  <div
                    className="h-full rounded-md transition-all duration-300 group-hover:brightness-95"
                    style={{
                      width: `${Math.max(3, ratio)}%`,
                      backgroundColor: color,
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center px-3 text-[11px] italic text-slate-400">
                    Nilai tersedia setelah training
                  </div>
                )}
              </div>

              {/* Value display */}
              <div className="w-24 shrink-0 font-mono tabular-nums text-right font-medium text-slate-800">
                {item.value !== null ? (
                  metricType === 'MAPE' ? (
                    `${item.value.toFixed(2)}%`
                  ) : (
                    `Rp ${Math.round(item.value).toLocaleString('id-ID')}`
                  )
                ) : (
                  <span className="text-slate-400 font-sans">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend guideline */}
      {metricType === 'MAPE' && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            &lt; 2% Sangat Akurat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-600" />
            2% – 4% Baik
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            &gt; 4% Moderat
          </span>
        </div>
      )}
    </div>
  );
};
