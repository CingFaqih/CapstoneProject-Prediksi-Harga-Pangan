import React, { useState } from 'react';
import { ModelEvaluationItem } from '../../types.ts';
import { BarChartComparison } from '../common/BarChartComparison.tsx';
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface AdminEvaluationViewProps {
  evaluationData: ModelEvaluationItem[];
  onRefreshEvaluation: () => void;
}

export const AdminEvaluationView: React.FC<AdminEvaluationViewProps> = ({
  evaluationData,
  onRefreshEvaluation,
}) => {
  const [activeMetric, setActiveMetric] = useState<'MAPE' | 'MAE' | 'RMSE'>('MAPE');

  const chartItems = evaluationData.map((d) => ({
    label: d.commodityName,
    value:
      activeMetric === 'MAPE'
        ? d.mape
        : activeMetric === 'MAE'
        ? d.mae
        : d.rmse,
  }));

  const handleExportCSV = () => {
    const headers = ['Komoditas', 'MAE (Rp)', 'RMSE (Rp)', 'MAPE (%)', 'Periode Pengujian', 'Waktu Evaluasi'];
    const rows = evaluationData.map((d) => [
      `"${d.commodityName}"`,
      d.mae || '',
      d.rmse || '',
      d.mape || '',
      `"${d.testPeriod || 'Tahun 2026'}"`,
      `"${d.evaluatedAt || '-'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `evaluasi_model_admin_maluku.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Pengukuran Validasi Algoritma</span>
              <span aria-hidden="true">·</span>
              <span>Admin Monitoring</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Evaluasi Model LSTM (Panel Admin)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Hasil pengukuran performa MAE, RMSE, dan MAPE seluruh 10 komoditas pangan pada periode pengujian 2026
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Laporan</span>
            </button>
          </div>
        </div>

        {/* Info row */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Periode Pengujian:</span>
            <span className="font-semibold text-slate-900 mt-0.5 block font-mono">
              Tahun 2026 (Januari – Agustus 2026)
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Waktu Evaluasi Terakhir:</span>
            <span className="font-semibold text-slate-900 mt-0.5 block font-mono">
              {evaluationData[0]?.evaluatedAt || '2026-08-31 16:45 WIT'}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Status Benchmark:</span>
            <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Tervalidasi (10 Komoditas)
            </span>
          </div>
        </div>
      </div>

      {/* Evaluation Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Matriks Metrik Evaluasi 10 Komoditas
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi dihitung menggunakan error testing out-of-sample
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Komoditas</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAE</th>
                <th className="py-2.5 px-3 font-semibold text-right">RMSE</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAPE</th>
                <th className="py-2.5 px-3 font-semibold">Periode Pengujian</th>
                <th className="py-2.5 px-3 font-semibold">Waktu Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluationData.map((d) => (
                <tr key={d.commodityId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {d.commodityName}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                    {d.mae ? `Rp ${d.mae.toLocaleString('id-ID')}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                    {d.rmse ? `Rp ${d.rmse.toLocaleString('id-ID')}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    {d.mape ? `${d.mape.toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {d.testPeriod || 'Tahun 2026'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {d.evaluatedAt || '2026-08-31 16:45 WIT'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chart Comparison */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Grafik Perbandingan Metrik Evaluasi Antar Komoditas
          </h3>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['MAPE', 'MAE', 'RMSE'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeMetric === m
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <BarChartComparison
          title={`Perbandingan ${activeMetric} (Admin Overview)`}
          subtitle={`Grafik visualisasi kesalahan prediksi model LSTM`}
          items={chartItems}
          metricType={activeMetric}
        />
      </div>
    </div>
  );
};
