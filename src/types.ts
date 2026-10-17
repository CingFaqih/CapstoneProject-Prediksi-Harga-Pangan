export interface Commodity {
  id: string;
  name: string;
  unit: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  changePercent: number; // WoW
  lastUpdated: string;
  dataStatus: 'Terverifikasi PIHPS' | 'Lengkap';
  mape?: number;
  description: string;
}

export interface PriceRecord {
  id: string;
  commodityId: string;
  commodityName: string;
  date: string; // YYYY-MM-DD
  price: number;
  unit: string;
  source: string;
  createdAt?: string;
}

export interface ActualVsPredictedRecord {
  date: string;
  weekLabel: string;
  commodityId: string;
  actualPrice: number;
  predictedPrice: number;
  difference: number;
  differencePercent: number;
}

export interface ModelEvaluationItem {
  commodityId: string;
  commodityName: string;
  mae: number | null;
  rmse: number | null;
  mape: number | null; // percentage e.g. 2.45%
  isCalculated: boolean;
  testSamplesCount?: number;
  testPeriod?: string;
  evaluatedAt?: string;
}

export interface ForecastRecord {
  id: string;
  commodityId: string;
  commodityName: string;
  weekIndex: number;
  date: string;
  month: 'September' | 'Oktober' | 'November' | 'Desember';
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  trend: 'stabil' | 'naik' | 'turun';
}

export interface LstmModelConfig {
  algorithm: string;
  sumberData: string;
  wilayah: string;
  frekuensi: string;
  periodeData: string;
  periodePengujian: string;
  periodePeramalan: string;
  metrikEvaluasi: string[];
  inputLagWeeks: number;
  lstmUnits: number;
  denseUnits: number;
  dropoutRate: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  lossFunction: string;
  optimizer: string;
  status: 'Ready' | 'Training' | 'Needs Update';
  lastTrainedAt: string;
  totalRecords: number;
}

export interface UserSession {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    role: 'admin' | 'public';
  } | null;
  token?: string;
}

export type PublicNavTab =
  | 'dashboard'
  | 'historis'
  | 'aktual-prediksi'
  | 'evaluasi'
  | 'prediksi'
  | 'komoditas'
  | 'informasi';

export type AdminNavTab =
  | 'admin-dashboard'
  | 'admin-data-harga'
  | 'admin-import'
  | 'admin-model'
  | 'admin-evaluasi'
  | 'admin-prediksi';
