import React, { useState } from 'react';
import { ApiService } from '../../services/api.ts';
import { UserSession } from '../../types.ts';
import { Shield, Lock, Mail, X, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Masukkan alamat email administrator.');
      return;
    }
    if (!password) {
      setError('Masukkan kata sandi.');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiService.login(email, password);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
        onClose();
      } else {
        setError(res.error || 'Autentikasi gagal. Periksa email atau password.');
      }
    } catch {
      setError('Terjadi kendala pada server autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Login Administrator PIHPS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Portal otentikasi pengelola data harga dan pelatihan model LSTM
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Administrator:
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@maluku.go.id / admin@pihps.id"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-pass" className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi (Password):
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Memverifikasi Sesi...</span>
            ) : (
              <>
                <span>Masuk ke Panel Admin</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Helper Box */}
        <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-2">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
            Akun Demo Pengujian Dosen / Penguji:
          </div>
          <div className="flex flex-col gap-1 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleUseDemo('admin.pihps@maluku.go.id', 'maluku2026')}
              className="text-left text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              admin.pihps@maluku.go.id / maluku2026 (Klik untuk isi)
            </button>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            *Autentikasi role-based diverifikasi melalui backend token authorization.
          </p>
        </div>
      </div>
    </div>
  );
};
