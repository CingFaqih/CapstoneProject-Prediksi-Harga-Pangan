import React from 'react';
import {
  LayoutDashboard,
  History,
  LineChart,
  BarChart3,
  TrendingUp,
  Database,
  Cpu,
  X,
} from 'lucide-react';
import type { PublicNavTab, UserSession } from '../../types.ts';

interface PublicSidebarProps {
  currentTab: PublicNavTab;
  onSelectTab: (tab: PublicNavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;

  // Dipertahankan agar pemanggilan komponen lama tidak error.
  // Properti ini tidak digunakan dan tidak menampilkan tombol apa pun.
  session?: UserSession;
  onOpenLogin?: () => void;
  onGoToAdmin?: () => void;
}

interface NavigationItem {
  id: PublicNavTab;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { id: 'historis', label: 'Harga Historis', icon: <History className="h-[18px] w-[18px]" /> },
  { id: 'aktual-prediksi', label: 'Aktual vs Prediksi', icon: <LineChart className="h-[18px] w-[18px]" /> },
  { id: 'evaluasi', label: 'Evaluasi Model', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  { id: 'prediksi', label: 'Prediksi Harga', icon: <TrendingUp className="h-[18px] w-[18px]" /> },
  { id: 'komoditas', label: 'Data Komoditas', icon: <Database className="h-[18px] w-[18px]" /> },
  { id: 'informasi', label: 'Informasi Model', icon: <Cpu className="h-[18px] w-[18px]" /> },
];

export const PublicSidebar: React.FC<PublicSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const handleNavigation = (tab: PublicNavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          bg-[#0F8A78] text-white shadow-xl shadow-slate-900/5
          transition-transform duration-300 lg:translate-x-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-[84px] shrink-0 items-center border-b border-white/10 px-5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold tracking-tight text-white">
              PANGAN MALUKU
            </div>
            <p className="mt-1 truncate text-[10px] text-emerald-50/70">
              Provinsi Maluku · Data PIHPS
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup sidebar"
            onClick={onCloseMobile}
            className="ml-2 rounded-lg p-1.5 text-emerald-50/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-2 pt-5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-50/65">
          Menu Utama
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {navigationItems.map((item) => {
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.id)}
                className={`
                  group flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                  text-left text-[13px] font-medium transition-all duration-150
                  ${
                    isActive
                      ? 'bg-white text-[#0F8A78] shadow-sm'
                      : 'text-emerald-50/85 hover:bg-white/[0.08] hover:text-white'
                  }
                `}
              >
                <span
                  className={`
                    flex h-5 w-5 shrink-0 items-center justify-center transition-colors
                    ${
                      isActive
                        ? 'text-[#0F8A78]'
                        : 'text-emerald-50/65 group-hover:text-white'
                    }
                  `}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
