import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  secondaryText?: string;
  changePercent?: number;
  icon?: React.ReactNode;
  badgeText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  secondaryText,
  changePercent,
  icon,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {value}
            </span>
            {changePercent !== undefined && (
              <span
                className={`text-xs font-semibold font-mono tabular-nums ${
                  changePercent > 0
                    ? 'text-rose-600'
                    : changePercent < 0
                    ? 'text-emerald-600'
                    : 'text-slate-500'
                }`}
              >
                {changePercent > 0 ? '▲ +' : changePercent < 0 ? '▼ ' : '— '}
                {Math.abs(changePercent).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100/90 text-slate-700">
            {icon}
          </div>
        )}
      </div>

      {(subtext || secondaryText) && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          {subtext && <span>{subtext}</span>}
          {subtext && secondaryText && <span aria-hidden="true">·</span>}
          {secondaryText && <span className="font-medium text-slate-700">{secondaryText}</span>}
        </div>
      )}
    </div>
  );
};
