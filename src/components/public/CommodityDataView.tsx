import React, { useState, useMemo } from 'react';
import { Commodity, PublicNavTab } from '../../types.ts';
import {
  Search,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';

interface CommodityDataViewProps {
  commodities: Commodity[];
  onSelectCommodityForHistory: (commodityId: string) => void;
  onNavigate: (tab: PublicNavTab) => void;
}

export const CommodityDataView: React.FC<CommodityDataViewProps> = ({
  commodities,
  onSelectCommodityForHistory,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const set = new Set(commodities.map((c) => c.category));
    return ['all', ...Array.from(set)];
  }, [commodities]);

  const filteredCommodities = useMemo(() => {
    return commodities.filter((c) => {
      const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [commodities, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Basis Data Komoditas Strategis</span>
              <span aria-hidden="true">·</span>
              <span>10 Bahan Pangan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Data 10 Komoditas Pangan Provinsi Maluku
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ringkasan harga acuan pasar tradisional, status verifikasi PIHPS, dan performa akurasi peramalan model LSTM
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            Mode: Read-Only (Publik)
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Interactive filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'Semua Komoditas' : cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama komoditas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Cards (10 Commodities) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCommodities.map((comm) => (
          <div
            key={comm.id}
            className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div>
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                    {comm.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>{comm.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-400">Satuan: {comm.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-xs font-bold tabular-nums ${
                      comm.changePercent > 0
                        ? 'text-rose-600'
                        : comm.changePercent < 0
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {comm.changePercent > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : comm.changePercent < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    {comm.changePercent > 0 ? '+' : ''}
                    {comm.changePercent.toFixed(2)}%
                  </span>
                  <div className="text-[10px] text-slate-400">Perubahan WoW</div>
                </div>
              </div>

              {/* Price Body */}
              <div className="py-4 space-y-3">
                <div>
                  <div className="text-xs text-slate-500">Harga Terbaru (31 Agu 2026):</div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                    Rp {comm.currentPrice.toLocaleString('id-ID')}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ {comm.unit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Status Data:</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1 text-[11px] mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {comm.dataStatus}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Akurasi MAPE:</span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                      {comm.mape ? `${comm.mape.toFixed(2)}%` : '—'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1 line-clamp-2">
                  {comm.description}
                </p>
              </div>
            </div>

            {/* Footer card actions */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <button
                onClick={() => onSelectCommodityForHistory(comm.id)}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Data Historis</span>
                <ArrowRight className="h-3 w-3" />
              </button>

              <button
                onClick={() => onNavigate('aktual-prediksi')}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Uji Model →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Table Format for Academic Review */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Matriks Lengkap 10 Komoditas Pangan
            </h3>
            <p className="text-xs text-slate-500">
              Data terverifikasi Pusat Informasi Harga Pangan Strategis (PIHPS) Maluku
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Komoditas</th>
                <th className="py-2.5 px-3 font-semibold">Kategori</th>
                <th className="py-2.5 px-3 font-semibold">Satuan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Terendah</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Tertinggi</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Terbaru</th>
                <th className="py-2.5 px-3 font-semibold text-right">Perubahan</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status Data</th>
                <th className="py-2.5 px-3 font-semibold text-right">MAPE LSTM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commodities.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">
                    {item.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                    Rp {item.minPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                    Rp {item.maxPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    Rp {item.currentPrice.toLocaleString('id-ID')}
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
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[11px] text-emerald-800 font-medium">
                      {item.dataStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                    {item.mape ? `${item.mape.toFixed(2)}%` : '—'}
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
