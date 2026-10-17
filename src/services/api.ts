const API_BASE_URL = 'http://localhost:5000/api';

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
  generateActualVsPredictedData,
  MODEL_EVALUATION_DATA,
  generateForecastData,
  INITIAL_MODEL_CONFIG,
} from '../data/mockData.ts';

 const STORAGE_KEYS = {
  COMMODITIES: 'lstm_maluku_commodities_v1',
  PRICES: 'lstm_maluku_prices_v1',
  EVALUATION: 'lstm_maluku_eval_v1',
  FORECAST: 'lstm_maluku_forecast_v1',
  MODEL_CONFIG: 'lstm_maluku_config_v1',
  AUTH_SESSION: 'lstm_maluku_session_v1',
};

// Initialize localStorage if not present
function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.COMMODITIES)) {
    localStorage.setItem(STORAGE_KEYS.COMMODITIES, JSON.stringify(COMMODITIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRICES)) {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(generateInitialHistoricalData()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVALUATION)) {
    localStorage.setItem(STORAGE_KEYS.EVALUATION, JSON.stringify(MODEL_EVALUATION_DATA));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FORECAST)) {
    localStorage.setItem(STORAGE_KEYS.FORECAST, JSON.stringify(generateForecastData()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(INITIAL_MODEL_CONFIG));
  }
}

initializeStorage();

// Simulation helper for network latency in prototype
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ApiService = {
  // Authentication (Role-Based Access)
  // Backend simulation compatible with Python Flask /api/auth/login
  async login(email: string, password: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    await delay(450);

    // Simple backend simulation for authorized domain/email format
    // Validates password length and email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Format email tidak valid.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password minimal 6 karakter.' };
    }

    // Role-based logic: any valid admin credentials for research portal
    // For convenience in testing, any email containing 'admin' or password 'admin123' / 'maluku2026' grants role admin
    const isAdmin = email.toLowerCase().includes('admin') || password.includes('admin') || password === 'maluku2026';

    if (!isAdmin && password !== 'admin123' && password !== 'maluku2026' && !email.endsWith('.go.id')) {
      // Allow general demo credentials or notify
      return {
        success: false,
        error: 'Kredensial tidak terdaftar sebagai Administrator PIHPS Maluku.',
      };
    }

    const session: UserSession = {
      isAuthenticated: true,
      user: {
        name: 'Administrator PIHPS Maluku',
        email: email,
        role: 'admin',
      },
      token: 'jwt-auth-token-' + Math.random().toString(36).substring(2),
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return { success: true, session };
  },

  getSession(): UserSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {
      isAuthenticated: false,
      user: null,
    };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  },

  // Commodities
  async getCommodities(): Promise<Commodity[]> {
    initializeStorage();
    const stored = localStorage.getItem(STORAGE_KEYS.COMMODITIES);
    return stored ? JSON.parse(stored) : COMMODITIES;
  },

  // Historical Prices
  async getHistoricalPrices(commodityId?: string): Promise<PriceRecord[]> {
    initializeStorage();
    const stored = localStorage.getItem(STORAGE_KEYS.PRICES);
    const all: PriceRecord[] = stored ? JSON.parse(stored) : [];
    if (commodityId && commodityId !== 'all') {
      return all.filter((r) => r.commodityId === commodityId);
    }
    return all;
  },

  async addPriceRecord(record: Omit<PriceRecord, 'id' | 'createdAt'>): Promise<PriceRecord> {
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEYS.PRICES);
    const all: PriceRecord[] = stored ? JSON.parse(stored) : [];
    
    const newRecord: PriceRecord = {
      ...record,
      id: `rec-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    all.push(newRecord);
    // Sort chronologically
    all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(all));

    // Update commodity current price if it's recent
    const comms: Commodity[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMODITIES) || '[]');
    const targetComm = comms.find((c) => c.id === record.commodityId);
    if (targetComm) {
      targetComm.currentPrice = record.price;
      targetComm.lastUpdated = record.date;
      localStorage.setItem(STORAGE_KEYS.COMMODITIES, JSON.stringify(comms));
    }

    return newRecord;
  },

  async updatePriceRecord(id: string, updates: Partial<PriceRecord>): Promise<PriceRecord> {
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEYS.PRICES);
    const all: PriceRecord[] = stored ? JSON.parse(stored) : [];
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Data harga tidak ditemukan.');

    all[index] = { ...all[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(all));
    return all[index];
  },

  async deletePriceRecord(id: string): Promise<boolean> {
    await delay(250);
    const stored = localStorage.getItem(STORAGE_KEYS.PRICES);
    const all: PriceRecord[] = stored ? JSON.parse(stored) : [];
    const filtered = all.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(filtered));
    return true;
  },

  // Actual vs Predicted (Testing Set 2026)
  async getActualVsPredicted(commodityId?: string): Promise<ActualVsPredictedRecord[]> {
    const all = generateActualVsPredictedData();
    if (commodityId && commodityId !== 'all') {
      return all.filter((r) => r.commodityId === commodityId);
    }
    return all;
  },

  // Model Evaluation (MAE, RMSE, MAPE)
  async getModelEvaluation(): Promise<ModelEvaluationItem[]> {
    initializeStorage();
    const stored = localStorage.getItem(STORAGE_KEYS.EVALUATION);
    return stored ? JSON.parse(stored) : MODEL_EVALUATION_DATA;
  },

  // Forecast Data (Sept - Dec 2026)
  async getForecastData(commodityId?: string, month?: string): Promise<ForecastRecord[]> {
    initializeStorage();
    const stored = localStorage.getItem(STORAGE_KEYS.FORECAST);
    let all: ForecastRecord[] = stored ? JSON.parse(stored) : generateForecastData();

    if (commodityId && commodityId !== 'all') {
      all = all.filter((r) => r.commodityId === commodityId);
    }
    if (month && month !== 'all') {
      all = all.filter((r) => r.month === month);
    }
    return all;
  },

  // Model Config & Status
  async getModelConfig(): Promise<LstmModelConfig> {
    initializeStorage();
    const stored = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG);
    return stored ? JSON.parse(stored) : INITIAL_MODEL_CONFIG;
  },

  // Trigger LSTM Model Training (Admin feature)
  async trainModel(
    epochs: number = 100,
    onProgress?: (progress: number, epoch: number, loss: number, log: string) => void
  ): Promise<LstmModelConfig> {
    const config = await this.getModelConfig();
    config.status = 'Training';
    localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(config));

    // Simulate training progress over epochs
    const totalSteps = 10;
    for (let step = 1; step <= totalSteps; step++) {
      await delay(250);
      const currentEpoch = Math.round((step / totalSteps) * epochs);
      const loss = parseFloat((0.0825 * Math.exp(-step * 0.22) + 0.003).toFixed(5));
      const log = `Epoch ${currentEpoch}/${epochs} - loss: ${loss} - val_loss: ${(loss * 1.08).toFixed(5)} - lag: ${config.inputLagWeeks}w`;
      if (onProgress) {
        onProgress((step / totalSteps) * 100, currentEpoch, loss, log);
      }
    }

    // Refresh model status
    const updatedConfig: LstmModelConfig = {
      ...config,
      status: 'Ready',
      epochs,
      lastTrainedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jayapura' }) + ' WIT',
      totalRecords: (await this.getHistoricalPrices()).length,
    };
    localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(updatedConfig));

    // Refresh evaluation metrics with slightly fine-tuned figures
    const evalData: ModelEvaluationItem[] = MODEL_EVALUATION_DATA.map((item) => ({
      ...item,
      isCalculated: true,
      evaluatedAt: updatedConfig.lastTrainedAt,
      // subtle adjustment
      mape: parseFloat(((item.mape || 2.5) * (0.97 + Math.random() * 0.04)).toFixed(2)),
    }));
    localStorage.setItem(STORAGE_KEYS.EVALUATION, JSON.stringify(evalData));

    return updatedConfig;
  },

  // Import Dataset Preview and Save
  async importDataset(
    records: Array<{
      tanggal: string;
      komoditas: string;
      harga: number;
      satuan?: string;
    }>
  ): Promise<{ importedCount: number; periodStart: string; periodEnd: string }> {
    await delay(600);
    const existingPrices = await this.getHistoricalPrices();
    const commodities = await this.getCommodities();

    let count = 0;
    const dates: string[] = [];

    records.forEach((row) => {
      // Find matching commodity
      const matched = commodities.find(
        (c) => c.name.toLowerCase() === row.komoditas.toLowerCase() || c.id === row.komoditas.toLowerCase()
      );
      if (matched && row.tanggal && !isNaN(row.harga)) {
        existingPrices.push({
          id: `imp-${Date.now()}-${count}`,
          commodityId: matched.id,
          commodityName: matched.name,
          date: row.tanggal,
          price: Math.round(row.harga),
          unit: row.satuan || matched.unit,
          source: 'PIHPS Maluku (Import)',
          createdAt: new Date().toISOString(),
        });
        dates.push(row.tanggal);
        count++;
      }
    });

    dates.sort();
    existingPrices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(existingPrices));

    return {
      importedCount: count,
      periodStart: dates[0] || '2023-01-31',
      periodEnd: dates[dates.length - 1] || '2026-08-31',
    };
  },

  // Reset to default PIHPS dataset
  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.COMMODITIES);
    localStorage.removeItem(STORAGE_KEYS.PRICES);
    localStorage.removeItem(STORAGE_KEYS.EVALUATION);
    localStorage.removeItem(STORAGE_KEYS.FORECAST);
    localStorage.removeItem(STORAGE_KEYS.MODEL_CONFIG);
    initializeStorage();
  },
};
