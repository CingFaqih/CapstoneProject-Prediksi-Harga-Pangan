import React, { useState, useMemo } from 'react';
import { Commodity, ForecastRecord } from '../../types.ts';
import { SimpleLineChart } from '../common/SimpleLineChart.tsx';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AdminForecastViewProps {
  commodities: Commodity[];
  forecastData: ForecastRecord[];
}

export const AdminForecastView: React.FC<AdminForecastViewProps> = ({
  commodities,
  forecastData,
}) => {
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('beras');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const activeCommodity = useMemo(() => {
    return commodities.find((c) => c.id === selectedCommodityId) || commodities[0];
  }, [commodities, selectedCommodityId]);

  const filtered = useMemo(() => {
    let list = forecastData.filter((f) => f.commodityId === selectedCommodityId);
    if (selectedMonth !== 'all') {
      list = list.filter((f) => f.month === selectedMonth);
    }
    return list;
  }, [forecastData, selectedCommodityId, selectedMonth]);

  const chartLabels = useMemo(() => {
    return filtered.map((f) => {
      const parts = f.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
  }, [filtered]);

  const chartValues = useMemo(() => {
    return filtered.map((f) => f.predictedPrice);
  }, [filtered]);

  const upperBounds = useMemo(() => {
    return filtered.map((f) => f.upperBound);
  }, [filtered]);

  const lowerBounds = useMemo(() => {
    return filtered.map((f) => f.lowerBound);
  }, [filtered]);

  const handleExportCSV = () => {
    const headers = ['Minggu Ke', 'Tanggal', 'Bulan', 'Komoditas', 'Harga Prediksi (Rp)', 'Batas Bawah', 'Batas Atas', 'Status Prediksi'];
    const rows = filtered.map((f) => [
      f.weekIndex,
      f.date,
      f.month,
      `"${f.commodityName}"`,
      f.predictedPrice,
      f.lowerBound,
      f.upperBound,
      f.trend,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hasil_prediksi_admin_${selectedCommodityId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Proyeksi Multi-Step LSTM</span>
              <span aria-hidden="true">·</span>
              <span>September – Desember 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Hasil Prediksi & Ramalan Model
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verifikasi hasil komputasi ramalan harga pangan untuk 18 minggu mendatang di Provinsi Maluku
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV Prediksi</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Pilih Komoditas:
            </label>
            <select
              value={selectedCommodityId}
              onChange={(e) => setSelectedCommodityId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-600 focus:outline-none"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Pilih Periode Bulan:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-emerald-600 focus:outline-none"
            >
              <option value="all">Semua Bulan (Sep – Des 2026)</option>
              <option value="September">September 2026</option>
              <option value="Oktober">Oktober 2026</option>
              <option value="November">November 2026</option>
              <option value="Desember">Desember 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prediction Line Chart */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Grafik Lintasan Prediksi ({activeCommodity.name})
            </h3>
            <p className="text-xs text-slate-500">
              Satuan: Rp / {activeCommodity.unit} · Proyeksi 18 Minggu ke Depan
            </p>
          </div>
        </div>

        <SimpleLineChart
          labels={chartLabels}
          series={[
            {
              id: 'admin-pred-series',
              name: `Prediksi LSTM ${activeCommodity.name}`,
              color: '#059669',
              data: chartValues,
              dashed: true,
            },
          ]}
          confidenceBounds={{
            upper: upperBounds,
            lower: lowerBounds,
          }}
          height={320}
          yAxisLabel={`Harga (Rp/${activeCommodity.unit})`}
        />
      </div>

      {/* Prediction Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Hasil Prediksi Mingguan
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filtered.length} baris proyeksi model
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Komoditas</th>
                <th className="py-2.5 px-3 font-semibold">Periode (Tanggal)</th>
                <th className="py-2.5 px-3 font-semibold">Bulan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Prediksi</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status Prediksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {row.commodityName}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                    {row.date} (Minggu {row.weekIndex})
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {row.month} 2026
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                    Rp {row.predictedPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-medium text-[11px] ${
                        row.trend === 'naik'
                          ? 'text-rose-600'
                          : row.trend === 'turun'
                          ? 'text-emerald-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {row.trend === 'naik' && <TrendingUp className="h-3 w-3" />}
                      {row.trend === 'turun' && <TrendingDown className="h-3 w-3" />}
                      {row.trend === 'stabil' && <span>—</span>}
                      <span className="capitalize">{row.trend}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
