import {
  Commodity,
  PriceRecord,
  ActualVsPredictedRecord,
  ModelEvaluationItem,
  ForecastRecord,
  LstmModelConfig,
} from '../types.ts';

export const COMMODITIES: Commodity[] = [
  {
    id: 'beras',
    name: 'Beras',
    unit: 'kg',
    category: 'Bahan Pokok',
    basePrice: 14500,
    currentPrice: 15800,
    minPrice: 14000,
    maxPrice: 16500,
    changePercent: 0.64,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 1.84,
    description: 'Beras kualitas medium rata-rata di pasar tradisional Provinsi Maluku.',
  },
  {
    id: 'daging-ayam',
    name: 'Daging Ayam',
    unit: 'kg',
    category: 'Daging & Unggas',
    basePrice: 38000,
    currentPrice: 42500,
    minPrice: 36000,
    maxPrice: 46000,
    changePercent: -1.16,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 2.76,
    description: 'Daging ayam ras segar pasokan peternak lokal dan distributor Maluku.',
  },
  {
    id: 'daging-sapi',
    name: 'Daging Sapi',
    unit: 'kg',
    category: 'Daging & Unggas',
    basePrice: 125000,
    currentPrice: 130000,
    minPrice: 120000,
    maxPrice: 135000,
    changePercent: 0.0,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 1.42,
    description: 'Daging sapi segar paha belakang / kualitas 1 di pasar Ambon & sekitarnya.',
  },
  {
    id: 'telur-ayam',
    name: 'Telur Ayam',
    unit: 'kg',
    category: 'Bahan Pokok',
    basePrice: 31000,
    currentPrice: 34200,
    minPrice: 29000,
    maxPrice: 36500,
    changePercent: 0.88,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 2.15,
    description: 'Telur ayam ras per kilogram, pasokan dari Surabaya/Makassar via pelabuhan.',
  },
  {
    id: 'bawang-merah',
    name: 'Bawang Merah',
    unit: 'kg',
    category: 'Bumbu & Sayuran',
    basePrice: 38000,
    currentPrice: 48000,
    minPrice: 34000,
    maxPrice: 55000,
    changePercent: 2.13,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 3.82,
    description: 'Bawang merah ukuran sedang, pasokan Bima/Enrekang ke Maluku.',
  },
  {
    id: 'bawang-putih',
    name: 'Bawang Putih',
    unit: 'kg',
    category: 'Bumbu & Sayuran',
    basePrice: 42000,
    currentPrice: 45000,
    minPrice: 39000,
    maxPrice: 49000,
    changePercent: -0.44,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 2.38,
    description: 'Bawang putih honan pasokan impor nasional di pedagang besar Maluku.',
  },
  {
    id: 'cabai-merah',
    name: 'Cabai Merah',
    unit: 'kg',
    category: 'Bumbu & Sayuran',
    basePrice: 58000,
    currentPrice: 68500,
    minPrice: 50000,
    maxPrice: 78000,
    changePercent: 3.78,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 4.65,
    description: 'Cabai merah besar/keriting dengan fluktuasi cuaca maritim Maluku.',
  },
  {
    id: 'cabai-rawit',
    name: 'Cabai Rawit',
    unit: 'kg',
    category: 'Bumbu & Sayuran',
    basePrice: 65000,
    currentPrice: 82000,
    minPrice: 55000,
    maxPrice: 96000,
    changePercent: 4.46,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 5.12,
    description: 'Cabai rawit merah segar dengan volatilitas harga tertinggi antarpulau.',
  },
  {
    id: 'minyak-goreng',
    name: 'Minyak Goreng',
    unit: 'liter',
    category: 'Bahan Pokok',
    basePrice: 17500,
    currentPrice: 19500,
    minPrice: 16500,
    maxPrice: 21000,
    changePercent: 0.0,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 1.65,
    description: 'Minyak goreng kemasan sederhana / curah terstandarisasi Minyakita.',
  },
  {
    id: 'gula-pasir',
    name: 'Gula Pasir',
    unit: 'kg',
    category: 'Bahan Pokok',
    basePrice: 17000,
    currentPrice: 18500,
    minPrice: 16000,
    maxPrice: 19500,
    changePercent: 0.54,
    lastUpdated: '2026-08-31',
    dataStatus: 'Terverifikasi PIHPS',
    mape: 1.55,
    description: 'Gula pasir kristal putih lokal di distributor dan pasar Maluku.',
  },
];

// Helper to generate consistent weekly timestamps between start and end
function getWeeklyDates(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDateStr);
  const end = new Date(endDateStr);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

// Generate full historical weekly prices (31 Jan 2023 - 31 Aug 2026)
export function generateInitialHistoricalData(): PriceRecord[] {
  const dates = getWeeklyDates('2023-01-31', '2026-08-31');
  const records: PriceRecord[] = [];

  COMMODITIES.forEach((comm) => {
    let price = comm.basePrice;
    dates.forEach((date, index) => {
      // Deterministic pseudo-random variation based on sine & index
      const seasonal = Math.sin(index / 12) * (comm.basePrice * 0.06);
      const noise = (Math.sin(index * 3.7 + comm.basePrice % 100) * (comm.basePrice * 0.03));
      const trend = (index / dates.length) * (comm.currentPrice - comm.basePrice);
      
      let calcPrice = Math.round((comm.basePrice + trend + seasonal + noise) / 100) * 100;
      if (calcPrice < comm.minPrice) calcPrice = comm.minPrice;
      if (calcPrice > comm.maxPrice) calcPrice = comm.maxPrice;

      // Ensure the last date matches currentPrice
      if (index === dates.length - 1) {
        calcPrice = comm.currentPrice;
      }

      records.push({
        id: `rec-${comm.id}-${index}`,
        commodityId: comm.id,
        commodityName: comm.name,
        date: date,
        price: calcPrice,
        unit: comm.unit,
        source: 'PIHPS Maluku',
        createdAt: '2026-08-31T12:00:00Z',
      });
    });
  });

  return records;
}

// Generate Actual vs Predicted data for Testing Period 2026 (Jan - Aug 2026, 35 weeks)
export function generateActualVsPredictedData(): ActualVsPredictedRecord[] {
  const dates = getWeeklyDates('2026-01-06', '2026-08-31');
  const results: ActualVsPredictedRecord[] = [];

  COMMODITIES.forEach((comm) => {
    dates.forEach((date, i) => {
      const weekIndex = i + 1;
      const progress = i / dates.length;
      const actualTrend = comm.basePrice + (comm.currentPrice - comm.basePrice) * 0.7 + (progress * (comm.currentPrice - comm.basePrice) * 0.3);
      const wave = Math.sin(i * 0.8) * (comm.basePrice * 0.04);
      let actual = Math.round((actualTrend + wave) / 100) * 100;

      // Realistic LSTM prediction error (1-4% lag & smoothing)
      const errorFactor = Math.sin(i * 1.5 + (comm.name.length)) * ((comm.mape || 2.5) * 0.007);
      let predicted = Math.round((actual * (1 + errorFactor)) / 50) * 50;

      const diff = predicted - actual;
      const diffPercent = parseFloat(((diff / actual) * 100).toFixed(2));

      results.push({
        date,
        weekLabel: `Minggu ${weekIndex} (2026)`,
        commodityId: comm.id,
        actualPrice: actual,
        predictedPrice: predicted,
        difference: diff,
        differencePercent: diffPercent,
      });
    });
  });

  return results;
}

// Evaluation Metrics for 10 Commodities
// Initially can be shown as evaluated or placeholder as specified by user
export const MODEL_EVALUATION_DATA: ModelEvaluationItem[] = [
  {
    commodityId: 'beras',
    commodityName: 'Beras',
    mae: 275.50,
    rmse: 342.10,
    mape: 1.84,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'daging-ayam',
    commodityName: 'Daging Ayam',
    mae: 1120.00,
    rmse: 1410.80,
    mape: 2.76,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'daging-sapi',
    commodityName: 'Daging Sapi',
    mae: 1850.00,
    rmse: 2240.50,
    mape: 1.42,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'telur-ayam',
    commodityName: 'Telur Ayam',
    mae: 720.40,
    rmse: 890.20,
    mape: 2.15,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'bawang-merah',
    commodityName: 'Bawang Merah',
    mae: 1780.00,
    rmse: 2150.60,
    mape: 3.82,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'bawang-putih',
    commodityName: 'Bawang Putih',
    mae: 1050.20,
    rmse: 1320.40,
    mape: 2.38,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'cabai-merah',
    commodityName: 'Cabai Merah',
    mae: 3120.00,
    rmse: 3840.50,
    mape: 4.65,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'cabai-rawit',
    commodityName: 'Cabai Rawit',
    mae: 4150.00,
    rmse: 5120.00,
    mape: 5.12,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'minyak-goreng',
    commodityName: 'Minyak Goreng',
    mae: 310.00,
    rmse: 395.20,
    mape: 1.65,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
  {
    commodityId: 'gula-pasir',
    commodityName: 'Gula Pasir',
    mae: 280.00,
    rmse: 345.00,
    mape: 1.55,
    isCalculated: true,
    testSamplesCount: 35,
    testPeriod: 'Januari – Agustus 2026',
    evaluatedAt: '2026-08-31 16:45 WIT',
  },
];

// Generate Future Forecast Data for September – Desember 2026 (18 weekly predictions)
export function generateForecastData(): ForecastRecord[] {
  const dates = getWeeklyDates('2026-09-07', '2026-12-28');
  const records: ForecastRecord[] = [];

  COMMODITIES.forEach((comm) => {
    let currentBaseline = comm.currentPrice;
    dates.forEach((date, i) => {
      const monthNum = parseInt(date.split('-')[1], 10);
      let monthName: 'September' | 'Oktober' | 'November' | 'Desember' = 'September';
      if (monthNum === 10) monthName = 'Oktober';
      if (monthNum === 11) monthName = 'November';
      if (monthNum === 12) monthName = 'Desember';

      // Slight seasonality for end-of-year (Natal & Tahun Baru / HBKN in Maluku)
      const holidayFactor = monthNum === 12 ? 0.04 : monthNum === 11 ? 0.02 : 0.005;
      const wave = Math.sin(i * 0.4) * (comm.basePrice * 0.015);
      const drift = i * (comm.basePrice * 0.002);
      
      const predictedPrice = Math.round((currentBaseline + (currentBaseline * holidayFactor) + wave + drift) / 100) * 100;
      const margin = Math.round(predictedPrice * ((comm.mape || 3) * 0.008));

      let trend: 'stabil' | 'naik' | 'turun' = 'stabil';
      if (predictedPrice > comm.currentPrice * 1.015) trend = 'naik';
      else if (predictedPrice < comm.currentPrice * 0.985) trend = 'turun';

      records.push({
        id: `fc-${comm.id}-${i}`,
        commodityId: comm.id,
        commodityName: comm.name,
        weekIndex: i + 1,
        date: date,
        month: monthName,
        predictedPrice,
        lowerBound: predictedPrice - margin,
        upperBound: predictedPrice + margin,
        trend,
      });
    });
  });

  return records;
}

export const INITIAL_MODEL_CONFIG: LstmModelConfig = {
  algorithm: 'Long Short-Term Memory (LSTM)',
  sumberData: 'Pusat Informasi Harga Pangan Strategis (PIHPS) Maluku',
  wilayah: 'Provinsi Maluku (Pasar Tradisional & Modern)',
  frekuensi: 'Mingguan (Weekly)',
  periodeData: '31 Januari 2023 – 31 Agustus 2026',
  periodePengujian: 'Tahun 2026 (Januari – Agustus 2026)',
  periodePeramalan: 'September – Desember 2026',
  metrikEvaluasi: ['MAE (Mean Absolute Error)', 'RMSE (Root Mean Squared Error)', 'MAPE (Mean Absolute Percentage Error)'],
  inputLagWeeks: 4,
  lstmUnits: 64,
  denseUnits: 32,
  dropoutRate: 0.2,
  epochs: 100,
  batchSize: 16,
  learningRate: 0.001,
  lossFunction: 'Mean Squared Error (MSE)',
  optimizer: 'Adam Optimizer',
  status: 'Ready',
  lastTrainedAt: '2026-08-31 16:45:00 WIT',
  totalRecords: 1870, // 187 weeks * 10 commodities
};
