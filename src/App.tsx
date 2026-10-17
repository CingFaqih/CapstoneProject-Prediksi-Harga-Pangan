/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Commodity,
  PriceRecord,
  ActualVsPredictedRecord,
  ModelEvaluationItem,
  ForecastRecord,
  LstmModelConfig,
  UserSession,
  PublicNavTab,
  AdminNavTab,
} from './types.ts';
import { ApiService } from './services/api.ts';
import FlaskConnectionTest from './components/FlaskConnectionTest';
import { Navbar } from './components/layout/Navbar.tsx';
import { AdminSidebar } from './components/layout/AdminSidebar.tsx';
import { PublicDashboard } from './components/public/PublicDashboard.tsx';
import { HistoricalPricesView } from './components/public/HistoricalPricesView.tsx';
import { ActualVsPredictedView } from './components/public/ActualVsPredictedView.tsx';
import { ModelEvaluationView } from './components/public/ModelEvaluationView.tsx';
import { PriceForecastView } from './components/public/PriceForecastView.tsx';
import { CommodityDataView } from './components/public/CommodityDataView.tsx';
import { ModelInfoView } from './components/public/ModelInfoView.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminPriceManagement } from './components/admin/AdminPriceManagement.tsx';
import { AdminDatasetImport } from './components/admin/AdminDatasetImport.tsx';
import { AdminLstmModel } from './components/admin/AdminLstmModel.tsx';
import { AdminEvaluationView } from './components/admin/AdminEvaluationView.tsx';
import { AdminForecastView } from './components/admin/AdminForecastView.tsx';
import { Menu, ShieldAlert, Cpu } from 'lucide-react';

export default function App() {
  // Navigation & Mode
  const [currentPov, setCurrentPov] = useState<'public' | 'admin'>('public');
  const [publicTab, setPublicTab] = useState<PublicNavTab>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminNavTab>('admin-dashboard');

  // Login Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mobileAdminSidebarOpen, setMobileAdminSidebarOpen] = useState(false);

  // Selected commodity context across navigation
  const [selectedCommodityContext, setSelectedCommodityContext] = useState<string>('beras');

  // Application Data States
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [historicalPrices, setHistoricalPrices] = useState<PriceRecord[]>([]);
  const [actualVsPredicted, setActualVsPredicted] = useState<ActualVsPredictedRecord[]>([]);
  const [modelEvaluation, setModelEvaluation] = useState<ModelEvaluationItem[]>([]);
  const [forecastData, setForecastData] = useState<ForecastRecord[]>([]);
  const [modelConfig, setModelConfig] = useState<LstmModelConfig | null>(null);
  const [session, setSession] = useState<UserSession>({ isAuthenticated: false, user: null });
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadData = async () => {
    try {
      const [comms, prices, avp, evals, forecasts, config] = await Promise.all([
        ApiService.getCommodities(),
        ApiService.getHistoricalPrices(),
        ApiService.getActualVsPredicted(),
        ApiService.getModelEvaluation(),
        ApiService.getForecastData(),
        ApiService.getModelConfig(),
      ]);

      setCommodities(comms);
      setHistoricalPrices(prices);
      setActualVsPredicted(avp);
      setModelEvaluation(evals);
      setForecastData(forecasts);
      setModelConfig(config);
      setSession(ApiService.getSession());
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Admin actions
  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setCurrentPov('admin');
    setAdminTab('admin-dashboard');
  };

  const handleLogout = () => {
    ApiService.logout();
    setSession({ isAuthenticated: false, user: null });
    setCurrentPov('public');
    setPublicTab('dashboard');
    setMobileAdminSidebarOpen(false);
  };

  const handleAddPrice = async (record: Omit<PriceRecord, 'id' | 'createdAt'>) => {
    await ApiService.addPriceRecord(record);
    await loadData();
  };

  const handleUpdatePrice = async (id: string, updates: Partial<PriceRecord>) => {
    await ApiService.updatePriceRecord(id, updates);
    await loadData();
  };

  const handleDeletePrice = async (id: string) => {
    await ApiService.deletePriceRecord(id);
    await loadData();
  };

  const handleCommitImport = async (
    records: Array<{ tanggal: string; komoditas: string; harga: number; satuan?: string }>
  ) => {
    const res = await ApiService.importDataset(records);
    await loadData();
    return res;
  };

  const handleTrainModel = async (
    epochs: number,
    onProgress: (progress: number, epoch: number, loss: number, log: string) => void
  ) => {
    const updated = await ApiService.trainModel(epochs, onProgress);
    await loadData();
    return updated;
  };

  const handleSelectCommodityForHistory = (commId: string) => {
    setSelectedCommodityContext(commId);
    setPublicTab('historis');
  };

  if (loading || !modelConfig) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-emerald-700 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-600 font-mono">
            Memuat Data Pangan PIHPS Maluku...
          </p>
        </div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">

    {/* Pengujian koneksi React → Flask → MySQL */}
    <FlaskConnectionTest />

    {/* POV 2: ADMIN VIEW */}
      {currentPov === 'admin' && session.isAuthenticated && session.user?.role === 'admin' ? (
        <div className="flex min-h-screen">
          {/* Admin Sidebar */}
          <AdminSidebar
            currentTab={adminTab}
            onSelectTab={setAdminTab}
            session={session}
            onLogout={handleLogout}
            onGoToPublic={() => setCurrentPov('public')}
            isOpenMobile={mobileAdminSidebarOpen}
            onCloseMobile={() => setMobileAdminSidebarOpen(false)}
          />

          {/* Admin Main Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Admin Top Mobile Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
              <button
                onClick={() => setMobileAdminSidebarOpen(true)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="text-xs font-bold text-slate-900">
                PANEL ADMIN · PIHPS MALUKU
              </div>
              <button
                onClick={() => setCurrentPov('public')}
                className="text-xs text-emerald-800 font-semibold cursor-pointer"
              >
                Ke Publik
              </button>
            </header>

            {/* Admin Content Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {adminTab === 'admin-dashboard' && (
                <AdminDashboard
                  commodities={commodities}
                  historicalPrices={historicalPrices}
                  modelConfig={modelConfig}
                  onNavigateTab={setAdminTab}
                  onTrainModelQuick={() => setAdminTab('admin-model')}
                />
              )}

              {adminTab === 'admin-data-harga' && (
                <AdminPriceManagement
                  commodities={commodities}
                  prices={historicalPrices}
                  onAddPrice={handleAddPrice}
                  onUpdatePrice={handleUpdatePrice}
                  onDeletePrice={handleDeletePrice}
                />
              )}

              {adminTab === 'admin-import' && (
                <AdminDatasetImport
                  commodities={commodities}
                  onCommitImport={handleCommitImport}
                />
              )}

              {adminTab === 'admin-model' && (
                <AdminLstmModel
                  modelConfig={modelConfig}
                  onTrainModel={handleTrainModel}
                />
              )}

              {adminTab === 'admin-evaluasi' && (
                <AdminEvaluationView
                  evaluationData={modelEvaluation}
                  onRefreshEvaluation={loadData}
                />
              )}

              {adminTab === 'admin-prediksi' && (
                <AdminForecastView
                  commodities={commodities}
                  forecastData={forecastData}
                />
              )}
            </main>
          </div>
        </div>
      ) : (
        /* POV 1: PUBLIC VIEW */
        <div className="flex min-h-screen flex-col">
          {/* Public Top Navbar */}
          <Navbar
            currentTab={publicTab}
            onSelectTab={setPublicTab}
            session={session}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onGoToAdmin={() => setCurrentPov('admin')}
          />

          {/* Public Main Content */}
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
            {publicTab === 'dashboard' && (
              <PublicDashboard
                commodities={commodities}
                historicalPrices={historicalPrices}
                onNavigate={setPublicTab}
                onSelectCommodityForHistory={handleSelectCommodityForHistory}
              />
            )}

            {publicTab === 'historis' && (
              <HistoricalPricesView
                commodities={commodities}
                historicalPrices={historicalPrices}
                initialCommodityId={selectedCommodityContext}
              />
            )}

            {publicTab === 'aktual-prediksi' && (
              <ActualVsPredictedView
                commodities={commodities}
                actualVsPredictedData={actualVsPredicted}
                initialCommodityId={selectedCommodityContext}
              />
            )}

            {publicTab === 'evaluasi' && (
              <ModelEvaluationView evaluationData={modelEvaluation} />
            )}

            {publicTab === 'prediksi' && (
              <PriceForecastView
                commodities={commodities}
                forecastData={forecastData}
                initialCommodityId={selectedCommodityContext}
              />
            )}

            {publicTab === 'komoditas' && (
              <CommodityDataView
                commodities={commodities}
                onSelectCommodityForHistory={handleSelectCommodityForHistory}
                onNavigate={setPublicTab}
              />
            )}

            {publicTab === 'informasi' && (
              <ModelInfoView modelConfig={modelConfig} />
            )}
          </main>

          {/* Academic Footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold text-slate-800">
                    Sistem Monitoring & Prediksi Harga Pangan Provinsi Maluku
                  </p>
                  <p className="mt-0.5 text-slate-500">
                    Penelitian Implementasi Model Long Short-Term Memory (LSTM) Berbasis Data PIHPS
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                  <span>Sumber: PIHPS Bank Indonesia Maluku</span>
                  <span aria-hidden="true">·</span>
                  <span>Horizon Uji: 2026</span>
                  <span aria-hidden="true">·</span>
                  <span>Proyeksi: Sep–Des 2026</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
