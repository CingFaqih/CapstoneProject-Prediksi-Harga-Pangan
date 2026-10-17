import React, { useState, useMemo } from 'react';
import { Commodity, PriceRecord, PublicNavTab } from '../../types.ts';
import { MetricCard } from '../common/MetricCard.tsx';
import { SimpleLineChart } from '../common/SimpleLineChart.tsx';
import {
  Calendar,
  Layers,
  Cpu,
  TrendingUp,
  ArrowUpRight,
  Database,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface PublicDashboardProps {
  commodities: Commodity[];
  historicalPrices: PriceRecord[];
  onNavigate: (tab: PublicNavTab) => void;
  onSelectCommodityForHistory: (commodityId: string) => void;
}

export const PublicDashboard: React.FC<PublicDashboardProps> = ({
  commodities,
  historicalPrices,
  onNavigate,
  onSelectCommodityForHistory,
}) => {
  const [selectedQuickCommodity, setSelectedQuickCommodity] = useState<string>('beras');

  const activeCommodity = useMemo(() => {
    return commodities.find((c) => c.id === selectedQuickCommodity) || commodities[0];
  }, [commodities, selectedQuickCommodity]);

  // Extract weekly dates and prices for active commodity (last 24 weeks for overview chart)
  const chartData = useMemo(() => {
    if (!activeCommodity) return { labels: [], data: [] };
    const filtered = historicalPrices.filter((p) => p.commodityId === activeCommodity.id);
    const recent = filtered.slice(-26); // last 26 weeks (~6 months)
    return {
      labels: recent.map((r) => {
        const parts = r.date.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
      }),
      data: recent.map((r) => r.price),
    };
  }, [historicalPrices, activeCommodity]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header Area */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            <span>Penelitian Skripsi & Analitika Pangan</span>
            <span aria-hidden="true">·</span>
            <span>PIHPS Maluku</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Prediksi Harga Pangan Provinsi Maluku
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Dashboard Monitoring dan Prediksi Harga 10 Komoditas Pangan Menggunakan Algoritma Long Short-Term Memory (LSTM).
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Periode Data: <strong className="text-slate-700 font-semibold">31 Januari 2023 – 31 Agustus 2026</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-slate-400" />
              Model: <strong className="text-slate-700 font-semibold">Long Short-Term Memory (LSTM)</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
              Periode Ramalan: <strong className="text-slate-700 font-semibold">September – Desember 2026</strong>
            </span>
          </div>
        </div>

        {/* Decorative Watermark-Free Visual Badge */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => onNavigate('aktual-prediksi')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <span>Lihat Aktual vs Prediksi</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onNavigate('prediksi')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <span>Hasil Ramalan Sep–Des 2026</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onNavigate('evaluasi')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
          >
            <span>Evaluasi Model (MAE, RMSE, MAPE)</span>
          </button>
        </div>
      </section>

      {/* 4 Summary Cards (as specified in prompt) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="1. Komoditas Pangan"
          value="10 Komoditas"
          subtext="Komoditas Strategis PIHPS"
          secondaryText="Provinsi Maluku"
          icon={<Layers className="h-4 w-4" />}
        />
        <MetricCard
          label="2. Frekuensi & Data"
          value="Data Mingguan"
          subtext="187 Titik Data / Komoditas"
          secondaryText="31 Jan 2023 – 31 Agu 2026"
          icon={<Database className="h-4 w-4" />}
        />
        <MetricCard
          label="3. Algoritma Machine Learning"
          value="Model LSTM"
          subtext="Recurrent Neural Network"
          secondaryText="Lag 4 Minggu · Adam"
          icon={<Cpu className="h-4 w-4" />}
        />
        <MetricCard
          label="4. Periode Ramalan"
          value="Sep – Des 2026"
          subtext="18 Minggu ke Depan"
          secondaryText="HBKN Akhir Tahun"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </section>

      {/* Main Chart Section: Ringkasan Perkembangan Harga */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Perkembangan Harga Historis ({activeCommodity?.name})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik 26 minggu terakhir berdasarkan catatan PIHPS Maluku
            </p>
          </div>

          {/* Quick Commodity Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="quick-comm" className="text-xs font-medium text-slate-600">
              Pilih Komoditas:
            </label>
            <select
              id="quick-comm"
              value={selectedQuickCommodity}
              onChange={(e) => setSelectedQuickCommodity(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-emerald-600 focus:outline-none"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Highlights for the active commodity */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Harga Terkini (31 Agu 2026)</span>
            <span className="text-base font-bold font-mono text-slate-900">
              Rp {activeCommodity.currentPrice.toLocaleString('id-ID')} / {activeCommodity.unit}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Perubahan Mingguan</span>
            <span
              className={`text-base font-bold font-mono ${
                activeCommodity.changePercent > 0
                  ? 'text-rose-600'
                  : activeCommodity.changePercent < 0
                  ? 'text-emerald-600'
                  : 'text-slate-600'
              }`}
            >
              {activeCommodity.changePercent > 0 ? '+' : ''}
              {activeCommodity.changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Kategori Bahan Pangan</span>
            <span className="text-sm font-semibold text-slate-800">
              {activeCommodity.category}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Akurasi Model (MAPE)</span>
            <span className="text-base font-bold font-mono text-emerald-700">
              {activeCommodity.mape ? `${activeCommodity.mape.toFixed(2)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Responsive Line Chart */}
        <SimpleLineChart
          labels={chartData.labels}
          series={[
            {
              id: 'historical-series',
              name: `Harga Historis ${activeCommodity.name}`,
              color: '#0284c7', // Sky-600
              data: chartData.data,
            },
          ]}
          height={290}
          yAxisLabel={`Harga ${activeCommodity.name} (Rp/${activeCommodity.unit})`}
        />

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Sumber: Pusat Informasi Harga Pangan Strategis (PIHPS) Maluku</span>
          </span>
          <button
            onClick={() => onSelectCommodityForHistory(activeCommodity.id)}
            className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            Buka Analisis Lengkap & Data Tabel →
          </button>
        </div>
      </section>

      {/* 10 Commodities Overview Table */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ringkasan 10 Komoditas Pangan Strategis
            </h3>
            <p className="text-xs text-slate-500">
              Pantauan harga acuan Provinsi Maluku per 31 Agustus 2026
            </p>
          </div>
          <button
            onClick={() => onNavigate('komoditas')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Lihat Semua Detail →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Komoditas</th>
                <th className="py-2.5 px-3 font-semibold">Kategori</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Terbaru</th>
                <th className="py-2.5 px-3 font-semibold text-right">Perubahan</th>
                <th className="py-2.5 px-3 font-semibold">Status PIHPS</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAPE LSTM</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commodities.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                    Rp {item.currentPrice.toLocaleString('id-ID')} / {item.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <span
                      className={`font-semibold ${
                        item.changePercent > 0
                          ? 'text-rose-600'
                          : item.changePercent < 0
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.changePercent > 0 ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="text-[11px] text-emerald-800 font-medium">
                      ● Terverifikasi
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                    {item.mape ? `${item.mape.toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onSelectCommodityForHistory(item.id)}
                      className="text-xs text-sky-700 hover:text-sky-900 font-medium cursor-pointer"
                    >
                      Lihat Tren
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Academic Context Footnote */}
      <section className="rounded-xl border border-slate-200/80 bg-slate-50 p-5 text-xs text-slate-600 flex items-start gap-3">
        <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">
            Catatan Metodologi Penelitian
          </p>
          <p className="leading-relaxed">
            Data harga diperoleh secara resmi dari Pusat Informasi Harga Pangan Strategis (PIHPS) Kantor Perwakilan Bank Indonesia Provinsi Maluku. Pemodelan Long Short-Term Memory (LSTM) dirancang khusus untuk menangani dependensi temporal dan musiman harga pangan akibat ketergantungan pasokan logistik maritim antarprovinsi.
          </p>
        </div>
      </section>
    </div>
  );
};
