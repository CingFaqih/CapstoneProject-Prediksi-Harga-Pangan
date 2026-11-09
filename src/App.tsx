/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useEffect,
  useState,
} from 'react';

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

import { PublicSidebar } from './components/layout/PublicSidebar.tsx';
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

import {
  Menu,
} from 'lucide-react';


export default function App() {

  /* ======================================================
     NAVIGATION
     ====================================================== */

  const [
    currentPov,
    setCurrentPov,
  ] = useState<
    'public' | 'admin'
  >('public');


  const [
    publicTab,
    setPublicTab,
  ] = useState<PublicNavTab>(
    'dashboard'
  );


  const [
    adminTab,
    setAdminTab,
  ] = useState<AdminNavTab>(
    'admin-dashboard'
  );


  /* ======================================================
     LOGIN MODAL
     ====================================================== */

  const [
    isLoginModalOpen,
    setIsLoginModalOpen,
  ] = useState(false);


  /* ======================================================
     MOBILE SIDEBARS
     ====================================================== */

  const [
    mobileAdminSidebarOpen,
    setMobileAdminSidebarOpen,
  ] = useState(false);


  const [
    mobilePublicSidebarOpen,
    setMobilePublicSidebarOpen,
  ] = useState(false);


  /* ======================================================
     SELECTED COMMODITY CONTEXT
     ====================================================== */

  /**
   * ID komoditas berasal dari MySQL:
   * 1, 2, 3, ... 10
   */
  const [
    selectedCommodityContext,
    setSelectedCommodityContext,
  ] = useState<string>('');


  /* ======================================================
     APPLICATION DATA STATES
     ====================================================== */

  const [
    commodities,
    setCommodities,
  ] = useState<Commodity[]>([]);


  const [
    historicalPrices,
    setHistoricalPrices,
  ] = useState<PriceRecord[]>([]);


  const [
    actualVsPredicted,
    setActualVsPredicted,
  ] = useState<
    ActualVsPredictedRecord[]
  >([]);


  const [
    modelEvaluation,
    setModelEvaluation,
  ] = useState<
    ModelEvaluationItem[]
  >([]);


  const [
    forecastData,
    setForecastData,
  ] = useState<
    ForecastRecord[]
  >([]);


  const [
    modelConfig,
    setModelConfig,
  ] = useState<
    LstmModelConfig | null
  >(null);


  const [
    session,
    setSession,
  ] = useState<UserSession>({
    isAuthenticated: false,
    user: null,
  });


  const [
    loading,
    setLoading,
  ] = useState(true);


  /* ======================================================
     LOAD APPLICATION DATA
     ====================================================== */

  const loadData =
    async () => {

      try {

        const [
          comms,
          prices,
          avp,
          evals,
          forecasts,
          config,
        ] = await Promise.all([

          ApiService.getCommodities(),

          ApiService.getHistoricalPrices(),

          ApiService.getActualVsPredicted(),

          ApiService.getModelEvaluation(),

          ApiService.getForecastData(),

          ApiService.getModelConfig(),

        ]);


        setCommodities(
          comms
        );


        setHistoricalPrices(
          prices
        );


        setActualVsPredicted(
          avp
        );


        setModelEvaluation(
          evals
        );


        setForecastData(
          forecasts
        );


        setModelConfig(
          config
        );


        setSession(
          ApiService.getSession()
        );


        /*
         * Pastikan commodity context memakai
         * ID komoditas yang benar dari MySQL.
         */
        setSelectedCommodityContext(
          (previous) => {

            const stillExists =
              comms.some(
                (commodity) =>
                  commodity.id === previous
              );


            if (stillExists) {

              return previous;

            }


            return (
              comms[0]?.id ||
              ''
            );

          }
        );

      } catch (error) {

        console.error(
          'Error loading data:',
          error
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  /* ======================================================
     INITIAL LOAD
     ====================================================== */

  useEffect(() => {

    loadData();

  }, []);


  /* ======================================================
     ADMIN AUTHENTICATION
     ====================================================== */

  const handleLoginSuccess =
    (
      newSession: UserSession
    ) => {

      setSession(
        newSession
      );


      setCurrentPov(
        'admin'
      );


      setAdminTab(
        'admin-dashboard'
      );


      setMobilePublicSidebarOpen(
        false
      );

    };


  const handleLogout =
    () => {

      ApiService.logout();


      setSession({
        isAuthenticated: false,
        user: null,
      });


      setCurrentPov(
        'public'
      );


      setPublicTab(
        'dashboard'
      );


      setMobileAdminSidebarOpen(
        false
      );


      setMobilePublicSidebarOpen(
        false
      );

    };


  /* ======================================================
     ADMIN PRICE MANAGEMENT
     ====================================================== */

  const handleAddPrice =
    async (
      record: Omit<
        PriceRecord,
        'id' | 'createdAt'
      >
    ) => {

      await ApiService.addPriceRecord(
        record
      );


      await loadData();

    };


  const handleUpdatePrice =
    async (
      id: string,
      updates: Partial<PriceRecord>
    ) => {

      await ApiService.updatePriceRecord(
        id,
        updates
      );


      await loadData();

    };


  const handleDeletePrice =
    async (
      id: string
    ) => {

      await ApiService.deletePriceRecord(
        id
      );


      await loadData();

    };


  /* ======================================================
     ADMIN DATASET IMPORT
     ====================================================== */

  const handleCommitImport =
    async (
      records: Array<{
        tanggal: string;
        komoditas: string;
        harga: number;
        satuan?: string;
      }>
    ) => {

      const result =
        await ApiService.importDataset(
          records
        );


      await loadData();


      return result;

    };


  /* ======================================================
     ADMIN MODEL TRAINING
     ====================================================== */

  const handleTrainModel =
    async (
      epochs: number,

      onProgress: (
        progress: number,
        epoch: number,
        loss: number,
        log: string
      ) => void
    ) => {

      const updated =
        await ApiService.trainModel(
          epochs,
          onProgress
        );


      await loadData();


      return updated;

    };


  /* ======================================================
     PUBLIC NAVIGATION WITH COMMODITY CONTEXT
     ====================================================== */

  const handleSelectCommodityForHistory =
    (
      commodityId: string
    ) => {

      setSelectedCommodityContext(
        commodityId
      );


      setPublicTab(
        'historis'
      );


      setMobilePublicSidebarOpen(
        false
      );

    };


  /* ======================================================
     LOADING SCREEN
     ====================================================== */

  if (
    loading ||
    !modelConfig
  ) {

    return (

      <div
        className="
          flex
          h-screen
          w-screen
          items-center
          justify-center
          bg-[#f4f7fb]
        "
      >

        <div
          className="
            space-y-3
            text-center
          "
        >

          <div
            className="
              inline-block
              h-8
              w-8
              animate-spin
              rounded-full
              border-3
              border-[#0A4EA3]
              border-t-transparent
            "
          />


          <p
            className="
              text-xs
              font-semibold
              text-slate-600
            "
          >

            Memuat Data Pangan PIHPS Maluku...

          </p>

        </div>

      </div>

    );

  }


  /* ======================================================
     APPLICATION
     ====================================================== */

  return (

    <div
      className="
        min-h-screen
        bg-[#f4f7fb]
        font-sans
        text-slate-800
        antialiased
        selection:bg-emerald-100
        selection:text-emerald-900
      "
    >

      {/* =================================================
          TEST CONNECTION:
          REACT → FLASK → MYSQL
          ================================================= */}

      <FlaskConnectionTest />


      {/* =================================================
          ADMIN VIEW
          ================================================= */}

      {currentPov === 'admin' &&
      session.isAuthenticated &&
      session.user?.role === 'admin'
        ? (

          <div
            className="
              flex
              min-h-screen
            "
          >

            {/* ============================================
                ADMIN SIDEBAR
                ============================================ */}

            <AdminSidebar
              currentTab={
                adminTab
              }
              onSelectTab={
                setAdminTab
              }
              session={
                session
              }
              onLogout={
                handleLogout
              }
              onGoToPublic={
                () => {

                  setCurrentPov(
                    'public'
                  );


                  setMobileAdminSidebarOpen(
                    false
                  );

                }
              }
              isOpenMobile={
                mobileAdminSidebarOpen
              }
              onCloseMobile={
                () =>
                  setMobileAdminSidebarOpen(
                    false
                  )
              }
            />


            {/* ============================================
                ADMIN MAIN
                ============================================ */}

            <div
              className="
                flex
                min-w-0
                flex-1
                flex-col
              "
            >

              {/* ==========================================
                  ADMIN MOBILE HEADER
                  ========================================== */}

              <header
                className="
                  sticky
                  top-0
                  z-30
                  flex
                  h-14
                  items-center
                  justify-between
                  border-b
                  border-slate-200
                  bg-white
                  px-4
                  lg:hidden
                "
              >

                <button
                  type="button"
                  onClick={
                    () =>
                      setMobileAdminSidebarOpen(
                        true
                      )
                  }
                  className="
                    cursor-pointer
                    rounded-lg
                    p-1.5
                    text-slate-600
                    transition
                    hover:bg-slate-100
                  "
                >

                  <Menu
                    className="
                      h-5
                      w-5
                    "
                  />

                </button>


                <div
                  className="
                    text-xs
                    font-bold
                    text-slate-900
                  "
                >

                  PANEL ADMIN · PIHPS MALUKU

                </div>


                <button
                  type="button"
                  onClick={
                    () => {

                      setCurrentPov(
                        'public'
                      );


                      setMobileAdminSidebarOpen(
                        false
                      );

                    }
                  }
                  className="
                    cursor-pointer
                    text-xs
                    font-semibold
                    text-emerald-800
                  "
                >

                  Ke Publik

                </button>

              </header>


              {/* ==========================================
                  ADMIN CONTENT
                  ========================================== */}

              <main
                className="
                  mx-auto
                  w-full
                  max-w-7xl
                  flex-1
                  p-4
                  sm:p-6
                  lg:p-8
                "
              >

                {/* ADMIN DASHBOARD */}

                {adminTab ===
                  'admin-dashboard' && (

                  <AdminDashboard
                    commodities={
                      commodities
                    }
                    historicalPrices={
                      historicalPrices
                    }
                    modelConfig={
                      modelConfig
                    }
                    onNavigateTab={
                      setAdminTab
                    }
                    onTrainModelQuick={
                      () =>
                        setAdminTab(
                          'admin-model'
                        )
                    }
                  />

                )}


                {/* ADMIN PRICE MANAGEMENT */}

                {adminTab ===
                  'admin-data-harga' && (

                  <AdminPriceManagement
                    commodities={
                      commodities
                    }
                    prices={
                      historicalPrices
                    }
                    onAddPrice={
                      handleAddPrice
                    }
                    onUpdatePrice={
                      handleUpdatePrice
                    }
                    onDeletePrice={
                      handleDeletePrice
                    }
                  />

                )}


                {/* ADMIN DATASET IMPORT */}

                {adminTab ===
                  'admin-import' && (

                  <AdminDatasetImport
                    commodities={
                      commodities
                    }
                    onCommitImport={
                      handleCommitImport
                    }
                  />

                )}


                {/* ADMIN LSTM */}

                {adminTab ===
                  'admin-model' && (

                  <AdminLstmModel
                    modelConfig={
                      modelConfig
                    }
                    onTrainModel={
                      handleTrainModel
                    }
                  />

                )}


                {/* ADMIN EVALUATION */}

                {adminTab ===
                  'admin-evaluasi' && (

                  <AdminEvaluationView
                    evaluationData={
                      modelEvaluation
                    }
                    onRefreshEvaluation={
                      loadData
                    }
                  />

                )}


                {/* ADMIN FORECAST */}

                {adminTab ===
                  'admin-prediksi' && (

                  <AdminForecastView
                    commodities={
                      commodities
                    }
                    forecastData={
                      forecastData
                    }
                  />

                )}

              </main>

            </div>

          </div>

        ) : (

          /* =================================================
             PUBLIC VIEW
             ================================================= */

          <div
            className="
              min-h-screen
              bg-[#f4f7fb]
            "
          >

            {/* ============================================
                PUBLIC SIDEBAR
                ============================================ */}

            <PublicSidebar
              currentTab={
                publicTab
              }
              onSelectTab={
                setPublicTab
              }
              session={
                session
              }
              onOpenLogin={
                () =>
                  setIsLoginModalOpen(
                    true
                  )
              }
              onGoToAdmin={
                () =>
                  setCurrentPov(
                    'admin'
                  )
              }
              isOpenMobile={
                mobilePublicSidebarOpen
              }
              onCloseMobile={
                () =>
                  setMobilePublicSidebarOpen(
                    false
                  )
              }
            />


            {/* ============================================
                PUBLIC MAIN AREA
                ============================================ */}

            <div
              className="
                flex
                min-h-screen
                min-w-0
                flex-col
                lg:pl-64
              "
            >

              {/* ==========================================
                  MOBILE PUBLIC HEADER
                  ========================================== */}

              <header
                className="
                  sticky
                  top-0
                  z-30
                  flex
                  h-16
                  items-center
                  justify-between
                  border-b
                  border-slate-200
                  bg-white/95
                  px-4
                  backdrop-blur
                  lg:hidden
                "
              >

                {/* MOBILE MENU */}

                <button
                  type="button"
                  onClick={
                    () =>
                      setMobilePublicSidebarOpen(
                        true
                      )
                  }
                  className="
                    cursor-pointer
                    rounded-lg
                    p-2
                    text-slate-600
                    transition
                    hover:bg-slate-100
                  "
                >

                  <Menu
                    className="
                      h-5
                      w-5
                    "
                  />

                </button>


                {/* MOBILE BRAND */}

                <div
                  className="
                    text-center
                  "
                >

                  <div
                    className="
                      text-xs
                      font-bold
                      tracking-tight
                      text-slate-900
                    "
                  >

                    PANGAN MALUKU

                  </div>


                  <div
                    className="
                      mt-0.5
                      text-[9px]
                      text-slate-400
                    "
                  >

                    Data PIHPS · LSTM

                  </div>

                </div>


                {/* BALANCE */}

                <div
                  className="
                    w-9
                  "
                />

              </header>


              {/* ==========================================
                  PUBLIC CONTENT
                  ========================================== */}

              <main
                className="
                  w-full
                  flex-1
                  p-4
                  sm:p-5
                  lg:p-6
                  xl:p-7
                "
              >

                <div
                  className="
                    mx-auto
                    w-full
                    max-w-[1600px]
                  "
                >

                  {/* ======================================
                      DASHBOARD
                      ====================================== */}

                  {publicTab ===
                    'dashboard' && (

                    <PublicDashboard
                      commodities={
                        commodities
                      }
                      historicalPrices={
                        historicalPrices
                      }
                      onNavigate={
                        setPublicTab
                      }
                      onSelectCommodityForHistory={
                        handleSelectCommodityForHistory
                      }
                    />

                  )}


                  {/* ======================================
                      HISTORICAL PRICES
                      ====================================== */}

                  {publicTab ===
                    'historis' && (

                    <HistoricalPricesView
                      commodities={
                        commodities
                      }
                      historicalPrices={
                        historicalPrices
                      }
                      initialCommodityId={
                        selectedCommodityContext
                      }
                    />

                  )}


                  {/* ======================================
                      ACTUAL VS PREDICTED
                      ====================================== */}

                  {publicTab ===
                    'aktual-prediksi' && (

                    <ActualVsPredictedView
                      commodities={
                        commodities
                      }
                      actualVsPredictedData={
                        actualVsPredicted
                      }
                      initialCommodityId={
                        selectedCommodityContext
                      }
                    />

                  )}


                  {/* ======================================
                      MODEL EVALUATION
                      ====================================== */}

                  {publicTab ===
                    'evaluasi' && (

                    <ModelEvaluationView
                      evaluationData={
                        modelEvaluation
                      }
                    />

                  )}


                  {/* ======================================
                      FORECAST
                      ====================================== */}

                  {publicTab ===
                    'prediksi' && (

                    <PriceForecastView
                      commodities={
                        commodities
                      }
                      forecastData={
                        forecastData
                      }
                      initialCommodityId={
                        selectedCommodityContext
                      }
                    />

                  )}


                  {/* ======================================
                      COMMODITY DATA
                      ====================================== */}

                  {publicTab ===
                    'komoditas' && (

                    <CommodityDataView
                      commodities={
                        commodities
                      }
                      onSelectCommodityForHistory={
                        handleSelectCommodityForHistory
                      }
                      onNavigate={
                        setPublicTab
                      }
                    />

                  )}


                  {/* ======================================
                      MODEL INFORMATION
                      ====================================== */}

                  {publicTab ===
                    'informasi' && (

                    <ModelInfoView
                      modelConfig={
                        modelConfig
                      }
                    />

                  )}

                </div>

              </main>

            </div>

          </div>

        )}


      {/* =================================================
          ADMIN LOGIN MODAL
          ================================================= */}

      <AdminLoginModal
        isOpen={
          isLoginModalOpen
        }
        onClose={
          () =>
            setIsLoginModalOpen(
              false
            )
        }
        onLoginSuccess={
          handleLoginSuccess
        }
      />

    </div>

  );

}