import React, { useState, useMemo } from 'react';
import { Commodity, PriceRecord } from '../../types.ts';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface AdminPriceManagementProps {
  commodities: Commodity[];
  prices: PriceRecord[];
  onAddPrice: (record: Omit<PriceRecord, 'id' | 'createdAt'>) => Promise<void>;
  onUpdatePrice: (id: string, updates: Partial<PriceRecord>) => Promise<void>;
  onDeletePrice: (id: string) => Promise<void>;
}

export const AdminPriceManagement: React.FC<AdminPriceManagementProps> = ({
  commodities,
  prices,
  onAddPrice,
  onUpdatePrice,
  onDeletePrice,
}) => {
  const [selectedCommodityFilter, setSelectedCommodityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formCommodityId, setFormCommodityId] = useState<string>('beras');
  const [formDate, setFormDate] = useState<string>('2026-08-31');
  const [formPrice, setFormPrice] = useState<string>('15800');
  const [formUnit, setFormUnit] = useState<string>('kg');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<PriceRecord | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('');

  // Delete Confirmation State
  const [recordToDelete, setRecordToDelete] = useState<PriceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filtered records
  const filteredRecords = useMemo(() => {
    let list = [...prices];
    if (selectedCommodityFilter !== 'all') {
      list = list.filter((r) => r.commodityId === selectedCommodityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.commodityName.toLowerCase().includes(q) ||
          r.date.includes(q) ||
          r.price.toString().includes(q)
      );
    }
    // Newest date first
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [prices, selectedCommodityFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Handle Commodity Change in Add Form to sync unit
  const handleCommodityChange = (commId: string) => {
    setFormCommodityId(commId);
    const comm = commodities.find((c) => c.id === commId);
    if (comm) {
      setFormUnit(comm.unit);
      setFormPrice(comm.currentPrice.toString());
    }
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Harga harus berupa angka lebih dari 0.');
      return;
    }
    if (!formDate) {
      setFormError('Pilih tanggal observasi.');
      return;
    }

    const matchedComm = commodities.find((c) => c.id === formCommodityId);
    if (!matchedComm) {
      setFormError('Komoditas tidak valid.');
      return;
    }

    setFormSubmitting(true);
    try {
      await onAddPrice({
        commodityId: matchedComm.id,
        commodityName: matchedComm.name,
        date: formDate,
        price: priceNum,
        unit: formUnit,
        source: 'PIHPS Maluku (Admin)',
      });
      setIsAddModalOpen(false);
      setFormPrice('');
    } catch {
      setFormError('Gagal menambahkan data harga.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (rec: PriceRecord) => {
    setEditingRecord(rec);
    setEditPrice(rec.price.toString());
    setEditDate(rec.date);
    setEditUnit(rec.unit);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    setFormSubmitting(true);
    try {
      await onUpdatePrice(editingRecord.id, {
        price: priceNum,
        date: editDate,
        unit: editUnit,
      });
      setEditingRecord(null);
    } catch {
      alert('Gagal memperbarui data.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await onDeletePrice(recordToDelete.id);
      setRecordToDelete(null);
    } catch {
      alert('Gagal menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Add Button */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Manajemen Basis Data</span>
              <span aria-hidden="true">·</span>
              <span>CRUD Operasional</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Data Harga Komoditas Pangan
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola, perbarui, dan validasi catatan harga mingguan 10 komoditas pangan Provinsi Maluku
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Data Harga</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="filter-comm-admin" className="block text-xs font-medium text-slate-600 mb-1">
              Filter Komoditas:
            </label>
            <select
              id="filter-comm-admin"
              value={selectedCommodityFilter}
              onChange={(e) => {
                setSelectedCommodityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-600 focus:outline-none"
            >
              <option value="all">Semua Komoditas ({prices.length} baris)</option>
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-search-admin" className="block text-xs font-medium text-slate-600 mb-1">
              Cari Tanggal atau Harga:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                id="filter-search-admin"
                type="text"
                placeholder="Contoh: 2026-08-31 atau Beras"
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

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daftar Catatan Harga Terdaftar
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {paginatedRecords.length} dari {filteredRecords.length} data
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                <th className="py-2.5 px-3 font-semibold">Komoditas</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga (Rp)</th>
                <th className="py-2.5 px-3 font-semibold">Satuan</th>
                <th className="py-2.5 px-3 font-semibold">Sumber</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {r.commodityName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      Rp {r.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">
                      {r.unit}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {r.source}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="rounded-md p-1 text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                          title="Edit Baris Data"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setRecordToDelete(r)}
                          className="rounded-md p-1 text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Baris Data"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada catatan data harga yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Sebelumnya
            </button>
            <div className="text-xs font-mono text-slate-500">
              Halaman {currentPage} dari {totalPages}
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

      {/* Modal: Tambah Data Harga */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                Tambah Data Harga Pangan
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Komoditas:
                </label>
                <select
                  value={formCommodityId}
                  onChange={(e) => handleCommodityChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  {commodities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Observasi (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga (Rp):
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="15000"
                    step="50"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan:
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Data Harga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Data Harga */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setEditingRecord(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                Edit Catatan Harga ({editingRecord.commodityName})
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal:
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga (Rp):
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan:
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  {formSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Data (MANDATORY REQUIREMENT) */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setRecordToDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <h3 className="font-bold text-slate-900 text-base">
              Konfirmasi Penghapusan Data
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data harga <strong>{recordToDelete.commodityName}</strong> pada tanggal <strong>{recordToDelete.date}</strong> sebesar <strong>Rp {recordToDelete.price.toLocaleString('id-ID')}</strong>?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
