import React, { useState, useMemo } from 'react';
import { Commodity, PriceRecord } from '../../types.ts';
import { SimpleLineChart } from '../common/SimpleLineChart.tsx';
import { MetricCard } from '../common/MetricCard.tsx';
import {
  Download,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
} from 'lucide-react';

interface HistoricalPricesViewProps {
  commodities: Commodity[];
  historicalPrices: PriceRecord[];
  initialCommodityId?: string;
}

export const HistoricalPricesView: React.FC<HistoricalPricesViewProps> = ({
  commodities,
  historicalPrices,
  initialCommodityId,
}) => {
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>(
    initialCommodityId || 'beras'
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const activeCommodity = useMemo(() => {
    return commodities.find((c) => c.id === selectedCommodityId) || commodities[0];
  }, [commodities, selectedCommodityId]);

  // Filter records by commodity and period
  const filteredRecords = useMemo(() => {
    let records = historicalPrices.filter((p) => p.commodityId === selectedCommodityId);

    if (selectedPeriod === '2023') {
      records = records.filter((p) => p.date.startsWith('2023'));
    } else if (selectedPeriod === '2024') {
      records = records.filter((p) => p.date.startsWith('2024'));
    } else if (selectedPeriod === '2025') {
      records = records.filter((p) => p.date.startsWith('2025'));
    } else if (selectedPeriod === '2026') {
      records = records.filter((p) => p.date.startsWith('2026'));
    } else if (selectedPeriod === 'last6m') {
      // Last 26 weeks
      records = records.slice(-26);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      records = records.filter((r) => r.date.includes(q) || r.price.toString().includes(q));
    }

    return records;
  }, [historicalPrices, selectedCommodityId, selectedPeriod, searchQuery]);

  // Compute Statistics: Terbaru, Tertinggi, Terendah, Rata-rata
  const stats = useMemo(() => {
    if (!filteredRecords.length) {
      return { latest: 0, highest: 0, lowest: 0, average: 0 };
    }
    const prices = filteredRecords.map((r) => r.price);
    const latest = prices[prices.length - 1];
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    return { latest, highest, lowest, average };
  }, [filteredRecords]);

  // Prepare chart series & labels
  const chartData = useMemo(() => {
    // Show maximum 52 points for readability if period is 'all', downsampled or step
    const sampleStep = filteredRecords.length > 60 ? Math.ceil(filteredRecords.length / 50) : 1;
    const sampled = filteredRecords.filter((_, idx) => idx % sampleStep === 0 || idx === filteredRecords.length - 1);

    return {
      labels: sampled.map((r) => {
        const [y, m, d] = r.date.split('-');
        return `${d}/${m}/${y.slice(2)}`;
      }),
      data: sampled.map((r) => r.price),
    };
  }, [filteredRecords]);

  // Paginated table data (newest first)
  const paginatedRecords = useMemo(() => {
    const reversed = [...filteredRecords].reverse();
    const startIndex = (currentPage - 1) * pageSize;
    return reversed.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Komoditas', 'Harga (Rp)', 'Satuan', 'Sumber Data'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.date,
      `"${r.commodityName}"`,
      r.price,
      r.unit,
      `"${r.source}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pihps_maluku_${selectedCommodityId}_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Filter Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Harga Historis Komoditas Pangan
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Catatan pergerakan harga mingguan Pusat Informasi Harga Pangan Strategis (PIHPS) Maluku
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dropdown Komoditas */}
          <div>
            <label htmlFor="comm-select" className="block text-xs font-medium text-slate-600 mb-1">
              Pilih Komoditas (10 Bahan Pangan):
            </label>
            <select
              id="comm-select"
              value={selectedCommodityId}
              onChange={(e) => {
                setSelectedCommodityId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-600 focus:outline-none"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unit}) — {c.category}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tanggal / Periode */}
          <div>
            <label htmlFor="period-select" className="block text-xs font-medium text-slate-600 mb-1">
              Filter Rentang Periode Data:
            </label>
            <div className="relative">
              <select
                id="period-select"
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="all">Semua Periode (Jan 2023 – Agu 2026)</option>
                <option value="last6m">6 Bulan Terakhir</option>
                <option value="2026">Tahun 2026 (Periode Uji)</option>
                <option value="2025">Tahun 2025</option>
                <option value="2024">Tahun 2024</option>
                <option value="2023">Tahun 2023</option>
              </select>
            </div>
          </div>

          {/* Search inside table */}
          <div>
            <label htmlFor="search-input" className="block text-xs font-medium text-slate-600 mb-1">
              Pencarian Tanggal / Harga:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Contoh: 2026-08 atau 15000"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Required Metric Summary Cards: Terbaru, Tertinggi, Terendah, Rata-rata */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Harga Terbaru"
          value={`Rp ${stats.latest.toLocaleString('id-ID')}`}
          subtext={`Per 31 Agustus 2026`}
          secondaryText={activeCommodity.name}
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
        />
        <MetricCard
          label="Harga Tertinggi"
          value={`Rp ${stats.highest.toLocaleString('id-ID')}`}
          subtext="Puncak fluktuasi periode ini"
          secondaryText={`Maksimal`}
          icon={<TrendingUp className="h-4 w-4 text-rose-600" />}
        />
        <MetricCard
          label="Harga Terendah"
          value={`Rp ${stats.lowest.toLocaleString('id-ID')}`}
          subtext="Titik terendah periode ini"
          secondaryText={`Minimal`}
          icon={<TrendingDown className="h-4 w-4 text-emerald-600" />}
        />
        <MetricCard
          label="Harga Rata-Rata"
          value={`Rp ${stats.average.toLocaleString('id-ID')}`}
          subtext={`Berdasarkan ${filteredRecords.length} titik data`}
          secondaryText={`Mean`}
          icon={<Activity className="h-4 w-4 text-sky-600" />}
        />
      </div>

      {/* Line Chart Section */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Grafik Tren Harga Historis — {activeCommodity.name}
            </h3>
            <p className="text-xs text-slate-500">
              Satuan: Rp / {activeCommodity.unit} · Frekuensi Mingguan
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {filteredRecords.length} observasi mingguan
          </div>
        </div>

        <SimpleLineChart
          labels={chartData.labels}
          series={[
            {
              id: 'hist-series',
              name: `Harga Historis (${activeCommodity.name})`,
              color: '#0284c7', // Sky Blue solid
              data: chartData.data,
              dashed: false,
            },
          ]}
          height={320}
          yAxisLabel={`Harga (Rp/${activeCommodity.unit})`}
        />
      </div>

      {/* Table Data Harga */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Catatan Harga Mingguan
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {paginatedRecords.length} dari {filteredRecords.length} baris data
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">No</th>
                <th className="py-2.5 px-3 font-semibold">Tanggal (Minggu)</th>
                <th className="py-2.5 px-3 font-semibold">Komoditas</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga (Rp)</th>
                <th className="py-2.5 px-3 font-semibold">Satuan</th>
                <th className="py-2.5 px-3 font-semibold">Sumber Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono tabular-nums">
                        {globalIndex}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">
                        {record.date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {record.commodityName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        Rp {record.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {record.unit}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {record.source}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada catatan data harga yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Sebelumnya
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-7 w-7 rounded-md text-xs font-mono font-medium cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
