import React, { useState } from 'react';
import { ModelEvaluationItem } from '../../types.ts';
import { BarChartComparison } from '../common/BarChartComparison.tsx';
import {
  Calculator,
  BookOpen,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ModelEvaluationViewProps {
  evaluationData: ModelEvaluationItem[];
}

export const ModelEvaluationView: React.FC<ModelEvaluationViewProps> = ({
  evaluationData,
}) => {
  // Allow user to toggle between pristine placeholder state ("—") and evaluated state
  const [showTrainedMetrics, setShowTrainedMetrics] = useState<boolean>(true);
  const [activeChartMetric, setActiveChartMetric] = useState<'MAPE' | 'MAE' | 'RMSE'>('MAPE');

  // Prepare display items according to toggle
  const displayItems = evaluationData.map((item) => {
    if (!showTrainedMetrics) {
      return {
        ...item,
        mae: null,
        rmse: null,
        mape: null,
        isCalculated: false,
      };
    }
    return item;
  });

  const chartItems = displayItems.map((d) => ({
    label: d.commodityName,
    value:
      activeChartMetric === 'MAPE'
        ? d.mape
        : activeChartMetric === 'MAE'
        ? d.mae
        : d.rmse,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Metrik Evaluasi Prediksi Time-Series</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Evaluasi Performa Model LSTM
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pengukuran akurasi peramalan harga pada 10 komoditas pangan strategis Provinsi Maluku
            </p>
          </div>

          {/* Toggle Button for Placeholder vs Trained View */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Mode Tampilan:</span>
            <button
              onClick={() => setShowTrainedMetrics(!showTrainedMetrics)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                showTrainedMetrics
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>
                {showTrainedMetrics ? 'Hasil Pelatihan Model (Aktif)' : 'Placeholder (Nilai Belum Dijalankan)'}
              </span>
            </button>
          </div>
        </div>

        {/* Academic Note about Placeholder / Zero-Slop Rule */}
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/80 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Sesuai pedoman pengujian akademis: Apabila model LSTM belum dijalankan pada server backend, nilai metrik disajikan dengan simbol placeholder <strong>“—”</strong>. Saat pelatihan selesai dieksekusi oleh Administrator, tabel akan memperbarui nilai kalkulasi riil dari dataset uji tahun 2026.
          </div>
        </div>
      </div>

      {/* Main Required Evaluation Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Evaluasi Tiga Metrik Model LSTM (10 Komoditas)
            </h3>
            <p className="text-xs text-slate-500">
              Periode Pengujian: Januari – Agustus 2026 (Data Uji Mingguan PIHPS Maluku)
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {displayItems.length} Komoditas Terdaftar
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="py-3 px-4 font-semibold">No</th>
                <th className="py-3 px-4 font-semibold">Komoditas</th>
                <th className="py-3 px-4 font-semibold text-right">MAE (Mean Absolute Error)</th>
                <th className="py-3 px-4 font-semibold text-right">RMSE (Root Mean Squared Error)</th>
                <th className="py-3 px-4 font-semibold text-right">MAPE (%)</th>
                <th className="py-3 px-4 font-semibold text-center">Tingkat Akurasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayItems.map((item, idx) => {
                const hasVal = item.mape !== null && item.mae !== null && item.rmse !== null;
                const mapeVal = item.mape;

                let accuracyCategory = '—';
                if (mapeVal !== null) {
                  if (mapeVal < 2.0) accuracyCategory = 'Sangat Tinggi (< 2%)';
                  else if (mapeVal < 5.0) accuracyCategory = 'Tinggi / Baik (< 5%)';
                  else accuracyCategory = 'Cukup / Moderat';
                }

                return (
                  <tr key={item.commodityId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.commodityName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
                      {hasVal ? `Rp ${item.mae?.toLocaleString('id-ID', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
                      {hasVal ? `Rp ${item.rmse?.toLocaleString('id-ID', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {hasVal ? (
                        <span className="text-emerald-700">{item.mape?.toFixed(2)}%</span>
                      ) : (
                        <span className="text-slate-400 font-sans">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] text-slate-600 font-medium">
                        {accuracyCategory}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualisasi Sederhana: Bar Chart Comparison Antar Komoditas */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Visualisasi Perbandingan Performa Antar Komoditas
            </h3>
            <p className="text-xs text-slate-500">
              Grafik batang komparasi metrik evaluasi model LSTM pada data uji
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['MAPE', 'MAE', 'RMSE'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveChartMetric(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeChartMetric === m
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
          title={`Perbandingan ${activeChartMetric} untuk 10 Komoditas Pangan Maluku`}
          subtitle={
            activeChartMetric === 'MAPE'
              ? 'Nilai persentase kesalahan rata-rata relatif terhadap harga sebenarnya (semakin kecil semakin akurat)'
              : `Besaran simpangan dalam satuan mata uang Rupiah per komoditas (${activeChartMetric})`
          }
          items={chartItems}
          metricType={activeChartMetric}
        />
      </div>

      {/* Tiga Metrik Formulasi & Penjelasan Ilmiah */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-sky-600" />
            <h4 className="font-bold text-slate-900 text-sm">Mean Absolute Error (MAE)</h4>
          </div>
          <div className="rounded-md bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
            MAE = (1/n) · Σ |y_t - ŷ_t|
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Menghitung rata-rata nilai absolut selisih antara harga pangan aktual (y) dengan hasil prediksi LSTM (ŷ). Mengukur besaran kesalahan dalam satuan nominal Rupiah tanpa memberikan bobot berlebih pada outlier.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-amber-600" />
            <h4 className="font-bold text-slate-900 text-sm">Root Mean Squared Error (RMSE)</h4>
          </div>
          <div className="rounded-md bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
            RMSE = √[ (1/n) · Σ (y_t - ŷ_t)² ]
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Akar dari rata-rata kuadrat kesalahan. Memberikan penalti yang lebih besar terhadap kesalahan prediksi yang bernilai ekstrem, sangat krusial untuk komoditas volatil seperti Cabai Rawit dan Bawang Merah.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">Mean Absolute Percentage Error (MAPE)</h4>
          </div>
          <div className="rounded-md bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
            MAPE = (100%/n) · Σ |(y_t - ŷ_t) / y_t|
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Rata-rata persentase deviasi kesalahan terhadap nilai aktual. Bebas dari skala harga komoditas sehingga memungkinkan komparasi langsung antara komoditas berharga tinggi (Daging Sapi) dan berharga rendah (Beras).
          </p>
        </div>
      </div>
    </div>
  );
};
