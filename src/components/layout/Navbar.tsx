import React, { useState } from 'react';
import { PublicNavTab, UserSession } from '../../types.ts';
import { Menu, X, LogIn, ShieldCheck, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentTab: PublicNavTab;
  onSelectTab: (tab: PublicNavTab) => void;
  session: UserSession;
  onOpenLogin: () => void;
  onGoToAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  session,
  onOpenLogin,
  onGoToAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PublicNavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'historis', label: 'Harga Historis' },
    { id: 'aktual-prediksi', label: 'Aktual vs Prediksi' },
    { id: 'evaluasi', label: 'Evaluasi Model' },
    { id: 'prediksi', label: 'Prediksi Harga' },
    { id: 'komoditas', label: 'Data Komoditas' },
    { id: 'informasi', label: 'Informasi Model' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark with research identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-left group cursor-pointer focus-visible:outline-none"
          >
            <div className="text-base font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
              PANGAN MALUKU <span className="font-mono text-emerald-700 font-semibold text-xs ml-1">LSTM</span>
            </div>
            <div className="hidden sm:block text-[11px] text-slate-500 font-normal">
              Provinsi Maluku · Data PIHPS
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`relative px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-emerald-800 bg-emerald-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {session.isAuthenticated && session.user?.role === 'admin' ? (
            <button
              onClick={onGoToAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Panel Admin</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              title="Akses khusus administrator pengelola data dan model"
            >
              <LogIn className="h-3.5 w-3.5 text-slate-600" />
              <span>Login Admin</span>
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 shadow-lg animate-in slide-in-from-top duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-left ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
