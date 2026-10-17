import React from 'react';
import {
  Commodity,
  PriceRecord,
  LstmModelConfig,
  AdminNavTab,
} from '../../types.ts';
import { MetricCard } from '../common/MetricCard.tsx';
import {
  Coins,
  UploadCloud,
  Cpu,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Database,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  commodities: Commodity[];
  historicalPrices: PriceRecord[];
  modelConfig: LstmModelConfig;
  onNavigateTab: (tab: AdminNavTab) => void;
  onTrainModelQuick: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  commodities,
  historicalPrices,
  modelConfig,
  onNavigateTab,
  onTrainModelQuick,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Sistem Manajemen Penelitian</span>
              <span aria-hidden="true">·</span>
              <span>Hak Akses: Administrator</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Admin Control Panel — Prediksi Pangan Maluku
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola dataset harga historis, unggah data mingguan baru, eksekusi training model LSTM, dan pantau hasil ramalan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTrainModelQuick}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Train / Update Model</span>
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Status Model:</span>
            <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {modelConfig.status} (Siap Prediksi)
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Training Terakhir:</span>
            <span className="font-semibold text-slate-900 font-mono text-[11px] mt-0.5 block truncate">
              {modelConfig.lastTrainedAt}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Total Data Harga:</span>
            <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
              {historicalPrices.length.toLocaleString('id-ID')} Baris
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-500 block">Rentang Data:</span>
            <span className="font-medium text-slate-700 font-mono text-[11px] mt-0.5 block">
              Jan 2023 – Agu 2026
            </span>
          </div>
        </div>
      </div>

      {/* 4 Quick Action Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => onNavigateTab('admin-data-harga')}
          className="group cursor-pointer rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <Coins className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Kelola Data Harga</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tambah, edit, dan hapus baris data harga komoditas mingguan
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('admin-import')}
          className="group cursor-pointer rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <UploadCloud className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Import Dataset</h3>
          <p className="text-xs text-slate-500 mt-1">
            Unggah file CSV/Excel data PIHPS dengan verifikasi preview
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('admin-model')}
          className="group cursor-pointer rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Cpu className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Model LSTM</h3>
          <p className="text-xs text-slate-500 mt-1">
            Pantau status training, loss history, dan perbarui bobot model
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('admin-evaluasi')}
          className="group cursor-pointer rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <BarChart3 className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Evaluasi & Ramalan</h3>
          <p className="text-xs text-slate-500 mt-1">
            Analisis MAE, RMSE, MAPE serta proyeksi masa depan Sep–Des 2026
          </p>
        </div>
      </div>

      {/* Overview Table of 10 Commodities under Admin view */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Status 10 Komoditas Pangan di Sistem
            </h3>
            <p className="text-xs text-slate-500">
              Data master acuan harga dan parameter normalisasi
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('admin-data-harga')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Buka Pengelolaan Lengkap →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Komoditas</th>
                <th className="py-2.5 px-3 font-semibold">Kategori</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Terkini</th>
                <th className="py-2.5 px-3 font-semibold">Update Terakhir</th>
                <th className="py-2.5 px-3 font-semibold">Status PIHPS</th>
                <th className="py-2.5 px-3 font-semibold text-right">Akurasi MAPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commodities.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {c.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {c.category}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    Rp {c.currentPrice.toLocaleString('id-ID')} / {c.unit}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {c.lastUpdated}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="text-[11px] font-medium text-emerald-800">
                      ✓ {c.dataStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold tabular-nums">
                    {c.mape ? `${c.mape.toFixed(2)}%` : '—'}
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
