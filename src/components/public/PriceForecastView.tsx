import React, { useState, useMemo } from 'react';
import { Commodity, ForecastRecord } from '../../types.ts';
import { SimpleLineChart } from '../common/SimpleLineChart.tsx';
import { MetricCard } from '../common/MetricCard.tsx';
import {
  Calendar,
  AlertTriangle,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Compass,
} from 'lucide-react';

interface PriceForecastViewProps {
  commodities: Commodity[];
  forecastData: ForecastRecord[];
  initialCommodityId?: string;
}

export const PriceForecastView: React.FC<PriceForecastViewProps> = ({
  commodities,
  forecastData,
  initialCommodityId,
}) => {
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>(
    initialCommodityId || 'beras'
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const activeCommodity = useMemo(() => {
    return commodities.find((c) => c.id === selectedCommodityId) || commodities[0];
  }, [commodities, selectedCommodityId]);

  // Filter forecasts
  const filteredForecasts = useMemo(() => {
    let list = forecastData.filter((f) => f.commodityId === selectedCommodityId);
    if (selectedMonth !== 'all') {
      list = list.filter((f) => f.month === selectedMonth);
    }
    return list;
  }, [forecastData, selectedCommodityId, selectedMonth]);

  // Forecast summaries
  const forecastStats = useMemo(() => {
    if (!filteredForecasts.length) {
      return { average: 0, minPredicted: 0, maxPredicted: 0, endOfYearPrice: 0 };
    }
    const prices = filteredForecasts.map((f) => f.predictedPrice);
    const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const minPredicted = Math.min(...prices);
    const maxPredicted = Math.max(...prices);
    const endOfYearPrice = prices[prices.length - 1];

    return { average, minPredicted, maxPredicted, endOfYearPrice };
  }, [filteredForecasts]);

  // Prepare chart series
  const chartLabels = useMemo(() => {
    return filteredForecasts.map((f) => {
      const parts = f.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
  }, [filteredForecasts]);

  const predictedValues = useMemo(() => {
    return filteredForecasts.map((f) => f.predictedPrice);
  }, [filteredForecasts]);

  const upperBounds = useMemo(() => {
    return filteredForecasts.map((f) => f.upperBound);
  }, [filteredForecasts]);

  const lowerBounds = useMemo(() => {
    return filteredForecasts.map((f) => f.lowerBound);
  }, [filteredForecasts]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Minggu Ke', 'Tanggal', 'Bulan', 'Komoditas', 'Harga Ramalan LSTM (Rp)', 'Batas Bawah 95%', 'Batas Atas 95%', 'Kecenderungan Tren'];
    const rows = filteredForecasts.map((f) => [
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
    link.setAttribute('download', `ramalan_lstm_${selectedCommodityId}_sep_des_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Visual Disclaimer Banner (MANDATORY REQUIREMENT) */}
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <AlertTriangle className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-900 tracking-tight">
              PERHATIAN: DATA HASIL RAMALAN ALGORITMA LSTM (BUKAN HARGA TRANSAKSI AKTUAL)
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed">
              Seluruh angka pada halaman ini merupakan <strong>hasil estimasi dan proyeksi model deep learning Long Short-Term Memory (LSTM)</strong> untuk horizon waktu <strong>September hingga Desember 2026</strong>. Angka ini disajikan untuk keperluan analisis akademis dan peringatan dini fluktuasi harga pangan strategis di Provinsi Maluku menjelang HBKN akhir tahun, bukan harga transaksi fisik di pasar saat ini.
            </p>
          </div>
        </div>
      </div>

      {/* Main Header & Filter Control */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Horizon Peramalan Masa Depan</span>
              <span aria-hidden="true">·</span>
              <span>18 Minggu ke Depan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Ramalan Harga Pangan: September – Desember 2026
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Proyeksi harga mingguan menggunakan model LSTM terlatih berdasarkan deret waktu PIHPS Maluku
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Ramalan CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Dropdown Komoditas */}
          <div>
            <label htmlFor="comm-forecast" className="block text-xs font-medium text-slate-600 mb-1">
              Pilih Komoditas:
            </label>
            <select
              id="comm-forecast"
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

          {/* Filter Bulan */}
          <div>
            <label htmlFor="month-forecast" className="block text-xs font-medium text-slate-600 mb-1">
              Filter Bulan Proyeksi:
            </label>
            <select
              id="month-forecast"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-emerald-600 focus:outline-none"
            >
              <option value="all">Semua Bulan (September – Desember 2026)</option>
              <option value="September">September 2026 (Minggu 1 – 4)</option>
              <option value="Oktober">Oktober 2026 (Minggu 5 – 8)</option>
              <option value="November">November 2026 (Minggu 9 – 13)</option>
              <option value="Desember">Desember 2026 (Minggu 14 – 18 / HBKN)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Forecast Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Harga Basis Terkini"
          value={`Rp ${activeCommodity.currentPrice.toLocaleString('id-ID')}`}
          subtext="Per 31 Agustus 2026"
          secondaryText="Data Riil Terakhir"
          icon={<Calendar className="h-4 w-4 text-slate-600" />}
        />
        <MetricCard
          label="Rata-rata Ramalan"
          value={`Rp ${forecastStats.average.toLocaleString('id-ID')}`}
          subtext={`Proyeksi ${filteredForecasts.length} minggu`}
          secondaryText="Mean Forecast"
          icon={<Sparkles className="h-4 w-4 text-emerald-600" />}
        />
        <MetricCard
          label="Rentang Proyeksi"
          value={`Rp ${forecastStats.minPredicted.toLocaleString('id-ID')}`}
          subtext={`s/d Rp ${forecastStats.maxPredicted.toLocaleString('id-ID')}`}
          secondaryText="Min - Max LSTM"
          icon={<Compass className="h-4 w-4 text-sky-600" />}
        />
        <MetricCard
          label="Estimasi Akhir Tahun"
          value={`Rp ${forecastStats.endOfYearPrice.toLocaleString('id-ID')}`}
          subtext="Desember 2026 (HBKN)"
          secondaryText="Potensi Kenaikan"
          icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
        />
      </div>

      {/* Forecast Line Chart with Confidence Interval */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Grafik Lintasan Ramalan Mingguan — {activeCommodity.name}
            </h3>
            <p className="text-xs text-slate-500">
              Garis putus-putus menunjukkan ramalan LSTM dengan pita konfidensi 95%
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
            <span>Model: LSTM 64 Units</span>
          </div>
        </div>

        <SimpleLineChart
          labels={chartLabels}
          series={[
            {
              id: 'forecast-series',
              name: `Hasil Ramalan LSTM (${activeCommodity.name})`,
              color: '#059669', // Emerald-600
              data: predictedValues,
              dashed: true, // Dashed to denote forecast
            },
          ]}
          confidenceBounds={{
            upper: upperBounds,
            lower: lowerBounds,
          }}
          height={320}
          yAxisLabel={`Harga Ramalan (Rp/${activeCommodity.unit})`}
        />
      </div>

      {/* Forecast Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Rincian Ramalan Harga Mingguan
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredForecasts.length} proyeksi titik waktu mingguan
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {activeCommodity.name} (Satuan: {activeCommodity.unit})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Minggu Ke</th>
                <th className="py-2.5 px-3 font-semibold">Tanggal Proyeksi</th>
                <th className="py-2.5 px-3 font-semibold">Bulan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Ramalan (Rp)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Batas Bawah (95%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Batas Atas (95%)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Kecenderungan Tren</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredForecasts.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                    Minggu {row.weekIndex}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">
                    {row.date}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {row.month} 2026
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                    Rp {row.predictedPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                    Rp {row.lowerBound.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                    Rp {row.upperBound.toLocaleString('id-ID')}
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
