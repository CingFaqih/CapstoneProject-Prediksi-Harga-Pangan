import React from 'react';
import { AdminNavTab, UserSession } from '../../types.ts';
import {
  LayoutDashboard,
  Coins,
  UploadCloud,
  Cpu,
  BarChart3,
  TrendingUp,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: AdminNavTab;
  onSelectTab: (tab: AdminNavTab) => void;
  session: UserSession;
  onLogout: () => void;
  onGoToPublic: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  session,
  onLogout,
  onGoToPublic,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const menuItems: { id: AdminNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'admin-data-harga', label: 'Data Harga', icon: <Coins className="h-4 w-4" /> },
    { id: 'admin-import', label: 'Import Dataset', icon: <UploadCloud className="h-4 w-4" /> },
    { id: 'admin-model', label: 'Model LSTM', icon: <Cpu className="h-4 w-4" /> },
    { id: 'admin-evaluasi', label: 'Evaluasi Model', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'admin-prediksi', label: 'Hasil Prediksi', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      <div>
        {/* Brand & Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">ADMIN PANEL</div>
              <div className="text-[11px] text-slate-400">PIHPS Maluku · LSTM Engine</div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-3 mt-4 mb-2 rounded-lg bg-slate-800/60 p-3 border border-slate-700/50">
          <div className="text-xs font-semibold text-white truncate">
            {session.user?.name || 'Administrator'}
          </div>
          <div className="text-[11px] text-slate-400 truncate font-mono">
            {session.user?.email || 'admin@pihps-maluku.id'}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
            <span>ROLE: ADMIN</span>
            <span>TOKEN AKTIF</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-2 space-y-1">
          <div className="px-3 py-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Menu Kelola
          </div>
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={onGoToPublic}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <span>Lihat Website Publik</span>
          </span>
        </button>

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};
