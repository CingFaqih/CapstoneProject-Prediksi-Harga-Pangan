
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:5000/api';


import {
  Commodity,
  PriceRecord,
  ActualVsPredictedRecord,
  ModelEvaluationItem,
  ForecastRecord,
  LstmModelConfig,
  UserSession,
} from '../types.ts';

import {
  COMMODITIES,
  generateInitialHistoricalData,
  MODEL_EVALUATION_DATA,
  generateForecastData,
  INITIAL_MODEL_CONFIG,
} from '../data/mockData.ts';


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const STORAGE_KEYS = {
  COMMODITIES: 'lstm_maluku_commodities_v1',
  PRICES: 'lstm_maluku_prices_v1',
  EVALUATION: 'lstm_maluku_eval_v1',
  FORECAST: 'lstm_maluku_forecast_v1',
  MODEL_CONFIG: 'lstm_maluku_config_v1',
  AUTH_SESSION: 'lstm_maluku_session_v1',
};


/**
 * LocalStorage masih dipertahankan karena bagian Admin
 * dan beberapa fitur simulasi masih menggunakannya.
 */
function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.COMMODITIES)) {
    localStorage.setItem(
      STORAGE_KEYS.COMMODITIES,
      JSON.stringify(COMMODITIES)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRICES)) {
    localStorage.setItem(
      STORAGE_KEYS.PRICES,
      JSON.stringify(generateInitialHistoricalData())
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.EVALUATION)) {
    localStorage.setItem(
      STORAGE_KEYS.EVALUATION,
      JSON.stringify(MODEL_EVALUATION_DATA)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.FORECAST)) {
    localStorage.setItem(
      STORAGE_KEYS.FORECAST,
      JSON.stringify(generateForecastData())
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG)) {
    localStorage.setItem(
      STORAGE_KEYS.MODEL_CONFIG,
      JSON.stringify(INITIAL_MODEL_CONFIG)
    );
  }
}


initializeStorage();


/* =========================================================
   UTILITIES
   ========================================================= */

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


type FlaskResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
};


/**
 * Helper umum untuk mengambil data dari Flask API.
 */
async function fetchFlask<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Gagal menghubungi Flask API. HTTP ${response.status}`
    );
  }

  const result: FlaskResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(
      result.error ||
      result.message ||
      'Gagal mengambil data dari Flask API.'
    );
  }

  return result.data;
}


/**
 * Membuat nama bulan sesuai interface ForecastRecord.
 */
function getForecastMonth(
  dateString: string
): 'September' | 'Oktober' | 'November' | 'Desember' {
  const date = new Date(`${dateString}T00:00:00`);
  const month = date.getMonth();

  if (month === 8) return 'September';
  if (month === 9) return 'Oktober';
  if (month === 10) return 'November';

  return 'Desember';
}


/* =========================================================
   API SERVICE
   ========================================================= */

export const ApiService = {

  /* =======================================================
     AUTHENTICATION
     MASIH SIMULASI / LOCAL STORAGE
     ======================================================= */

  async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    session?: UserSession;
    error?: string;
  }> {

    await delay(450);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Format email tidak valid.',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password minimal 6 karakter.',
      };
    }

    const isAdmin =
      email.toLowerCase().includes('admin') ||
      password.includes('admin') ||
      password === 'maluku2026';

    if (
      !isAdmin &&
      password !== 'admin123' &&
      password !== 'maluku2026' &&
      !email.endsWith('.go.id')
    ) {
      return {
        success: false,
        error:
          'Kredensial tidak terdaftar sebagai Administrator PIHPS Maluku.',
      };
    }

    const session: UserSession = {
      isAuthenticated: true,
      user: {
        name: 'Administrator PIHPS Maluku',
        email,
        role: 'admin',
      },
      token:
        'jwt-auth-token-' +
        Math.random().toString(36).substring(2),
    };

    localStorage.setItem(
      STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify(session)
    );

    return {
      success: true,
      session,
    };
  },


  getSession(): UserSession {
    try {
      const stored = localStorage.getItem(
        STORAGE_KEYS.AUTH_SESSION
      );

      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // abaikan error localStorage
    }

    return {
      isAuthenticated: false,
      user: null,
    };
  },


  logout(): void {
    localStorage.removeItem(
      STORAGE_KEYS.AUTH_SESSION
    );
  },


  /* =======================================================
     COMMODITIES
     DATA REAL DARI MYSQL MELALUI FLASK
     ======================================================= */

  async getCommodities(): Promise<Commodity[]> {

    const rows = await fetchFlask<
      Array<{
        id: number;
        name: string;
        unit: string;
      }>
    >(`${API_BASE_URL}/commodities`);


    /**
     * Kita ambil harga historis dan evaluasi agar object Commodity
     * tetap sesuai dengan interface frontend.
     */
    const [prices, evaluations] =
      await Promise.all([
        this.getHistoricalPricesRaw(),
        this.getModelEvaluationRaw(),
      ]);


    return rows.map((row) => {

      const commodityPrices = prices
        .filter(
          (price) =>
            price.commodity_id === row.id
        )
        .sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        );


      const evaluation = evaluations.find(
        (item) =>
          item.commodity_id === row.id
      );


      const priceValues =
        commodityPrices.map(
          (item) => Number(item.price)
        );


      const latest =
        commodityPrices.length > 0
          ? commodityPrices[
              commodityPrices.length - 1
            ]
          : null;


      const previous =
        commodityPrices.length > 1
          ? commodityPrices[
              commodityPrices.length - 2
            ]
          : null;


      const currentPrice =
        latest
          ? Number(latest.price)
          : 0;


      const previousPrice =
        previous
          ? Number(previous.price)
          : 0;


      const changePercent =
        previousPrice !== 0
          ? (
              (
                currentPrice -
                previousPrice
              ) /
              previousPrice
            ) *
            100
          : 0;


      return {
        id: String(row.id),
        name: row.name,
        unit: row.unit,

        category: 'Bahan Pangan',

        basePrice:
          priceValues.length > 0
            ? priceValues[0]
            : 0,

        currentPrice,

        minPrice:
          priceValues.length > 0
            ? Math.min(...priceValues)
            : 0,

        maxPrice:
          priceValues.length > 0
            ? Math.max(...priceValues)
            : 0,

        changePercent,

        lastUpdated:
          latest?.date || '',

        dataStatus:
          'Terverifikasi PIHPS',

        mape:
          evaluation?.mape !== null &&
          evaluation?.mape !== undefined
            ? Number(evaluation.mape)
            : undefined,

        description:
          `Data harga mingguan ${row.name} Provinsi Maluku.`,
      };
    });
  },


  /* =======================================================
     RAW HISTORICAL DATA
     INTERNAL HELPER
     ======================================================= */

  async getHistoricalPricesRaw(
    commodityId?: string
  ): Promise<
    Array<{
      id: number;
      commodity_id: number;
      commodity: string;
      date: string;
      price: number;
    }>
  > {

    const query =
      commodityId &&
      commodityId !== 'all'
        ? `?commodityId=${encodeURIComponent(
            commodityId
          )}`
        : '';


    return fetchFlask(
      `${API_BASE_URL}/harga${query}`
    );
  },


  /* =======================================================
     HISTORICAL PRICES
     DATA REAL
     ======================================================= */

  async getHistoricalPrices(
    commodityId?: string
  ): Promise<PriceRecord[]> {

    const rows =
      await this.getHistoricalPricesRaw(
        commodityId
      );


    return rows.map((row) => ({
      id: String(row.id),

      commodityId:
        String(row.commodity_id),

      commodityName:
        row.commodity,

      date:
        row.date,

      price:
        Number(row.price),

      unit:
        'Rp/kg',

      source:
        'PIHPS Maluku',
    }));
  },


  /* =======================================================
     ADD PRICE
     MASIH LOCAL STORAGE / ADMIN SIMULASI
     ======================================================= */

  async addPriceRecord(
    record: Omit<
      PriceRecord,
      'id' | 'createdAt'
    >
  ): Promise<PriceRecord> {

    await delay(300);

    const stored =
      localStorage.getItem(
        STORAGE_KEYS.PRICES
      );

    const all: PriceRecord[] =
      stored
        ? JSON.parse(stored)
        : [];


    const newRecord: PriceRecord = {
      ...record,

      id:
        `rec-custom-${Date.now()}-` +
        Math.floor(
          Math.random() * 1000
        ),

      createdAt:
        new Date().toISOString(),
    };


    all.push(newRecord);


    all.sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );


    localStorage.setItem(
      STORAGE_KEYS.PRICES,
      JSON.stringify(all)
    );


    return newRecord;
  },


  /* =======================================================
     UPDATE PRICE
     ADMIN SIMULASI
     ======================================================= */

  async updatePriceRecord(
    id: string,
    updates: Partial<PriceRecord>
  ): Promise<PriceRecord> {

    await delay(300);

    const stored =
      localStorage.getItem(
        STORAGE_KEYS.PRICES
      );

    const all: PriceRecord[] =
      stored
        ? JSON.parse(stored)
        : [];


    const index =
      all.findIndex(
        (record) =>
          record.id === id
      );


    if (index === -1) {
      throw new Error(
        'Data harga tidak ditemukan.'
      );
    }


    all[index] = {
      ...all[index],
      ...updates,
    };


    localStorage.setItem(
      STORAGE_KEYS.PRICES,
      JSON.stringify(all)
    );


    return all[index];
  },


  /* =======================================================
     DELETE PRICE
     ADMIN SIMULASI
     ======================================================= */

  async deletePriceRecord(
    id: string
  ): Promise<boolean> {

    await delay(250);

    const stored =
      localStorage.getItem(
        STORAGE_KEYS.PRICES
      );

    const all: PriceRecord[] =
      stored
        ? JSON.parse(stored)
        : [];


    const filtered =
      all.filter(
        (record) =>
          record.id !== id
      );


    localStorage.setItem(
      STORAGE_KEYS.PRICES,
      JSON.stringify(filtered)
    );


    return true;
  },


  /* =======================================================
     ACTUAL VS PREDICTED
     DATA REAL
     ======================================================= */

  async getActualVsPredicted(
    commodityId?: string
  ): Promise<
    ActualVsPredictedRecord[]
  > {

    const query =
      commodityId &&
      commodityId !== 'all'
        ? `?commodityId=${encodeURIComponent(
            commodityId
          )}`
        : '';


    const rows = await fetchFlask<
      Array<{
        id: number;
        commodity_id: number;
        commodity: string;
        date: string;
        actual_price: number;
        predicted_price: number;
      }>
    >(
      `${API_BASE_URL}/actual-vs-predicted${query}`
    );


    /**
     * Penting:
     * weekIndex dibuat ulang per komoditas.
     */
    const weekCounter: Record<
      string,
      number
    > = {};


    return rows.map((row) => {

      const commodityKey =
        String(row.commodity_id);


      weekCounter[commodityKey] =
        (
          weekCounter[commodityKey] ||
          0
        ) + 1;


      const actual =
        Number(row.actual_price);


      const predicted =
        Number(row.predicted_price);


      const difference =
        predicted - actual;


      const differencePercent =
        actual !== 0
          ? (
              difference /
              actual
            ) *
            100
          : 0;


      return {
        date:
          row.date,

        weekLabel:
          `Minggu ${weekCounter[commodityKey]}`,

        commodityId:
          commodityKey,

        actualPrice:
          actual,

        predictedPrice:
          predicted,

        difference,

        differencePercent,
      };
    });
  },


  /* =======================================================
     RAW MODEL EVALUATION
     INTERNAL
     ======================================================= */

  async getModelEvaluationRaw(): Promise<
    Array<{
      id: number;
      commodity_id: number;
      commodity: string;
      mae: number | null;
      rmse: number | null;
      mape: number | null;
    }>
  > {

    return fetchFlask(
      `${API_BASE_URL}/evaluasi`
    );
  },


  /* =======================================================
     MODEL EVALUATION
     DATA REAL
     ======================================================= */

  async getModelEvaluation(): Promise<
    ModelEvaluationItem[]
  > {

    const rows =
      await this.getModelEvaluationRaw();


    return rows.map((row) => ({
      commodityId:
        String(row.commodity_id),

      commodityName:
        row.commodity,

      mae:
        row.mae !== null
          ? Number(row.mae)
          : null,

      rmse:
        row.rmse !== null
          ? Number(row.rmse)
          : null,

      mape:
        row.mape !== null
          ? Number(row.mape)
          : null,

      isCalculated:
        row.mae !== null &&
        row.rmse !== null &&
        row.mape !== null,

      testSamplesCount:
        30,

      testPeriod:
        '3 Februari 2026 - 25 Agustus 2026',
    }));
  },


  /* =======================================================
     FORECAST
     DATA REAL
     ======================================================= */

  async getForecastData(
    commodityId?: string,
    month?: string
  ): Promise<ForecastRecord[]> {

    const query =
      commodityId &&
      commodityId !== 'all'
        ? `?commodityId=${encodeURIComponent(
            commodityId
          )}`
        : '';


    const rows = await fetchFlask<
      Array<{
        id: number;
        commodity_id: number;
        commodity: string;
        date: string;
        predicted_price: number;
      }>
    >(
      `${API_BASE_URL}/forecast${query}`
    );


    /**
     * Kelompokkan per komoditas supaya weekIndex
     * dan trend tidak tercampur.
     */
    const weekCounter: Record<
      string,
      number
    > = {};


    const previousPrice: Record<
      string,
      number
    > = {};


    let data: ForecastRecord[] =
      rows.map((row) => {

        const commodityKey =
          String(row.commodity_id);


        weekCounter[commodityKey] =
          (
            weekCounter[commodityKey] ||
            0
          ) + 1;


        const predictedPrice =
          Number(
            row.predicted_price
          );


        let trend:
          | 'stabil'
          | 'naik'
          | 'turun' =
          'stabil';


        if (
          previousPrice[
            commodityKey
          ] !== undefined
        ) {

          if (
            predictedPrice >
            previousPrice[
              commodityKey
            ]
          ) {
            trend = 'naik';

          } else if (
            predictedPrice <
            previousPrice[
              commodityKey
            ]
          ) {
            trend = 'turun';
          }
        }


        previousPrice[
          commodityKey
        ] =
          predictedPrice;


        return {
          id:
            String(row.id),

          commodityId:
            commodityKey,

          commodityName:
            row.commodity,

          weekIndex:
            weekCounter[
              commodityKey
            ],

          date:
            row.date,

          month:
            getForecastMonth(
              row.date
            ),

          predictedPrice,

          /**
           * File hasil Colab final yang masuk MySQL
           * tidak menyimpan interval bawah/atas.
           *
           * Karena interface frontend mewajibkan field ini,
           * nilainya disamakan dengan titik ramalan.
           *
           * Jangan ditafsirkan sebagai confidence interval.
           */
          lowerBound:
            predictedPrice,

          upperBound:
            predictedPrice,

          trend,
        };
      });


    if (
      month &&
      month !== 'all'
    ) {
      data =
        data.filter(
          (row) =>
            row.month === month
        );
    }


    return data;
  },


  /* =======================================================
     MODEL CONFIG
     MASIH KONFIGURASI LOCAL / MOCK
     ======================================================= */

  async getModelConfig():
    Promise<LstmModelConfig> {

    initializeStorage();

    const stored =
      localStorage.getItem(
        STORAGE_KEYS.MODEL_CONFIG
      );


    return stored
      ? JSON.parse(stored)
      : INITIAL_MODEL_CONFIG;
  },


  /* =======================================================
     TRAIN MODEL
     MASIH SIMULASI ADMIN
     ======================================================= */

  async trainModel(
    epochs: number = 100,

    onProgress?: (
      progress: number,
      epoch: number,
      loss: number,
      log: string
    ) => void

  ): Promise<LstmModelConfig> {

    const config =
      await this.getModelConfig();


    config.status =
      'Training';


    localStorage.setItem(
      STORAGE_KEYS.MODEL_CONFIG,
      JSON.stringify(config)
    );


    const totalSteps = 10;


    for (
      let step = 1;
      step <= totalSteps;
      step++
    ) {

      await delay(250);


      const currentEpoch =
        Math.round(
          (
            step /
            totalSteps
          ) *
          epochs
        );


      const loss =
        parseFloat(
          (
            0.0825 *
            Math.exp(
              -step * 0.22
            ) +
            0.003
          ).toFixed(5)
        );


      const log =
        `Epoch ${currentEpoch}/${epochs}` +
        ` - loss: ${loss}` +
        ` - val_loss: ${(loss * 1.08).toFixed(5)}` +
        ` - lag: ${config.inputLagWeeks}w`;


      if (onProgress) {
        onProgress(
          (
            step /
            totalSteps
          ) *
          100,

          currentEpoch,

          loss,

          log
        );
      }
    }


    const updatedConfig:
      LstmModelConfig = {

      ...config,

      status:
        'Ready',

      epochs,

      lastTrainedAt:
        new Date().toLocaleString(
          'id-ID',
          {
            timeZone:
              'Asia/Jayapura',
          }
        ) + ' WIT',

      totalRecords:
        (
          await this
            .getHistoricalPrices()
        ).length,
    };


    localStorage.setItem(
      STORAGE_KEYS.MODEL_CONFIG,
      JSON.stringify(
        updatedConfig
      )
    );


    return updatedConfig;
  },


  /* =======================================================
     IMPORT DATASET
     ADMIN SIMULASI
     ======================================================= */

  async importDataset(
    records: Array<{
      tanggal: string;
      komoditas: string;
      harga: number;
      satuan?: string;
    }>
  ): Promise<{
    importedCount: number;
    periodStart: string;
    periodEnd: string;
  }> {

    await delay(600);


    const stored =
      localStorage.getItem(
        STORAGE_KEYS.PRICES
      );


    const existingPrices:
      PriceRecord[] =
      stored
        ? JSON.parse(stored)
        : [];


    const commodities =
      await this.getCommodities();


    let count = 0;

    const dates:
      string[] = [];


    records.forEach(
      (row) => {

        const matched =
          commodities.find(
            (commodity) =>
              commodity.name
                .toLowerCase() ===
                row.komoditas
                  .toLowerCase() ||

              commodity.id ===
                row.komoditas
                  .toLowerCase()
          );


        if (
          matched &&
          row.tanggal &&
          !isNaN(row.harga)
        ) {

          existingPrices.push({
            id:
              `imp-${Date.now()}-${count}`,

            commodityId:
              matched.id,

            commodityName:
              matched.name,

            date:
              row.tanggal,

            price:
              Math.round(
                row.harga
              ),

            unit:
              row.satuan ||
              matched.unit,

            source:
              'PIHPS Maluku (Import)',

            createdAt:
              new Date()
                .toISOString(),
          });


          dates.push(
            row.tanggal
          );


          count++;
        }
      }
    );


    dates.sort();


    existingPrices.sort(
      (a, b) =>
        new Date(
          a.date
        ).getTime() -
        new Date(
          b.date
        ).getTime()
    );


    localStorage.setItem(
      STORAGE_KEYS.PRICES,
      JSON.stringify(
        existingPrices
      )
    );


    return {
      importedCount:
        count,

      periodStart:
        dates[0] ||
        '2023-01-31',

      periodEnd:
        dates[
          dates.length - 1
        ] ||
        '2026-08-25',
    };
  },


  /* =======================================================
     RESET LOCAL MOCK DATA
     ADMIN
     ======================================================= */

  resetToDefault(): void {

    localStorage.removeItem(
      STORAGE_KEYS.COMMODITIES
    );

    localStorage.removeItem(
      STORAGE_KEYS.PRICES
    );

    localStorage.removeItem(
      STORAGE_KEYS.EVALUATION
    );

    localStorage.removeItem(
      STORAGE_KEYS.FORECAST
    );

    localStorage.removeItem(
      STORAGE_KEYS.MODEL_CONFIG
    );


    initializeStorage();
  },
};