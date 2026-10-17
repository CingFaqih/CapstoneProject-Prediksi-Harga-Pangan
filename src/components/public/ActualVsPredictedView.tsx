import React, { useState, useMemo } from 'react';
import { Commodity, ActualVsPredictedRecord } from '../../types.ts';
import { SimpleLineChart } from '../common/SimpleLineChart.tsx';
import { MetricCard } from '../common/MetricCard.tsx';
import {
  GitCommit,
  CheckCircle,
  HelpCircle,
  Download,
  AlertCircle,
  Info,
} from 'lucide-react';

interface ActualVsPredictedViewProps {
  commodities: Commodity[];
  actualVsPredictedData: ActualVsPredictedRecord[];
  initialCommodityId?: string;
}

export const ActualVsPredictedView: React.FC<ActualVsPredictedViewProps> = ({
  commodities,
  actualVsPredictedData,
  initialCommodityId,
}) => {
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>(
    initialCommodityId || 'beras'
  );

  const activeCommodity = useMemo(() => {
    return commodities.find((c) => c.id === selectedCommodityId) || commodities[0];
  }, [commodities, selectedCommodityId]);

  // Filter records for the selected commodity (testing period 2026)
  const records = useMemo(() => {
    return actualVsPredictedData.filter((r) => r.commodityId === selectedCommodityId);
  }, [actualVsPredictedData, selectedCommodityId]);

  // Compute test set metrics dynamically from records
  const metrics = useMemo(() => {
    if (!records.length) {
      return { mae: 0, rmse: 0, mape: 0, count: 0 };
    }

    let sumAbsError = 0;
    let sumSquaredError = 0;
    let sumAbsPercentError = 0;

    records.forEach((r) => {
      const absDiff = Math.abs(r.difference);
      sumAbsError += absDiff;
      sumSquaredError += absDiff * absDiff;
      sumAbsPercentError += Math.abs(r.differencePercent);
    });

    const count = records.length;
    const mae = Math.round(sumAbsError / count);
    const rmse = Math.round(Math.sqrt(sumSquaredError / count));
    const mape = parseFloat((sumAbsPercentError / count).toFixed(2));

    return { mae, rmse, mape, count };
  }, [records]);

  // Chart data preparation
  const chartLabels = useMemo(() => {
    return records.map((r) => {
      const parts = r.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
  }, [records]);

  const actualSeries = useMemo(() => {
    return records.map((r) => r.actualPrice);
  }, [records]);

  const predictedSeries = useMemo(() => {
    return records.map((r) => r.predictedPrice);
  }, [records]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Minggu', 'Harga Aktual (Rp)', 'Prediksi LSTM (Rp)', 'Selisih (Rp)', 'Selisih (%)'];
    const rows = records.map((r) => [
      r.date,
      `"${r.weekLabel}"`,
      r.actualPrice,
      r.predictedPrice,
      r.difference,
      r.differencePercent,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `evaluasi_aktual_vs_prediksi_${selectedCommodityId}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Periode Pengujian (Testing Set) · Tahun 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Aktual vs Prediksi Model LSTM
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi komparasi harga riil PIHPS Maluku terhadap proyeksi algoritma Long Short-Term Memory
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Commodity Selector and Legend Specification Notice */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-80">
            <label htmlFor="comm-select-avp" className="block text-xs font-medium text-slate-600 mb-1">
              Pilih Komoditas Pengujian:
            </label>
            <select
              id="comm-select-avp"
              value={selectedCommodityId}
              onChange={(e) => setSelectedCommodityId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-600 focus:outline-none"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unit}) — {c.category}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Visual Rule Compliance Indicator */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-500" />
              <span>Standar Visualisasi Penelitian:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-5 bg-sky-700 rounded-xs" />
                <span>Harga Aktual = <strong>Garis Solid (Biru)</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-5 border-b-2 border-dashed border-rose-600" />
                <span>Prediksi LSTM = <strong>Garis Putus-Putus (Merah)</strong></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards for this specific commodity test set */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="MAE (Mean Absolute Error)"
          value={`Rp ${metrics.mae.toLocaleString('id-ID')}`}
          subtext={`Rata-rata deviasi absolut per minggu`}
          secondaryText={`${metrics.count} Sampel Uji`}
          icon={<GitCommit className="h-4 w-4 text-sky-600" />}
        />
        <MetricCard
          label="RMSE (Root Mean Squared Error)"
          value={`Rp ${metrics.rmse.toLocaleString('id-ID')}`}
          subtext="Penalti deviasi ekstrem kuadratik"
          secondaryText="Provinsi Maluku"
          icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
        />
        <MetricCard
          label="MAPE (Mean Absolute Percentage Error)"
          value={`${metrics.mape.toFixed(2)}%`}
          subtext={metrics.mape < 5 ? 'Akurasi Sangat Baik (< 5%)' : 'Akurasi Moderat'}
          secondaryText="Skala Persentase"
          icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
        />
      </div>

      {/* Main Comparison Line Chart */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Grafik Komparasi: Aktual vs Prediksi LSTM ({activeCommodity.name})
            </h3>
            <p className="text-xs text-slate-500">
              Pengujian 35 Minggu Tahun 2026 (Januari – Agustus 2026)
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Lag Window: 4 Minggu · Epoch: 100
          </div>
        </div>

        <SimpleLineChart
          labels={chartLabels}
          series={[
            {
              id: 'actual-series',
              name: 'Harga Aktual (PIHPS)',
              color: '#0369a1', // Solid Sky-700
              data: actualSeries,
              dashed: false, // MANDATORY: Solid line for actual
            },
            {
              id: 'predicted-series',
              name: 'Hasil Prediksi LSTM',
              color: '#e11d48', // Dashed Rose-600
              data: predictedSeries,
              dashed: true, // MANDATORY: Dashed line for LSTM prediction
            },
          ]}
          height={330}
          yAxisLabel={`Harga ${activeCommodity.name} (Rp/${activeCommodity.unit})`}
        />
      </div>

      {/* Detailed Comparison Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Perbandingan Aktual vs Prediksi Mingguan
            </h3>
            <p className="text-xs text-slate-500">
              Perhitungan selisih absolut dan persentase error per titik observasi
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {records.length} Baris Uji
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Minggu / Tanggal</th>
                <th className="py-2.5 px-3 font-semibold">Label Observasi</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Aktual (Rp)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Prediksi LSTM (Rp)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Selisih (Rp)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Selisih (%)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status Deviasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((row, idx) => {
                const isUnder = row.difference < 0;
                const isExact = row.difference === 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">
                      {row.date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {row.weekLabel}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      Rp {row.actualPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-700 tabular-nums">
                      Rp {row.predictedPrice.toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums font-medium ${
                        isUnder ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {row.difference > 0 ? '+' : ''}
                      Rp {row.difference.toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${
                        Math.abs(row.differencePercent) > 3 ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {row.differencePercent > 0 ? '+' : ''}
                      {row.differencePercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[11px] text-slate-600 font-medium">
                        {Math.abs(row.differencePercent) < 2
                          ? 'Sangat Dekat'
                          : Math.abs(row.differencePercent) < 4
                          ? 'Deviasi Rendah'
                          : 'Deviasi Sedang'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
