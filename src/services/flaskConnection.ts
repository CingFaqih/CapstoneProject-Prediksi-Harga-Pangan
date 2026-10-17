
const API_BASE_URL = 'http://127.0.0.1:5000/api';

export interface FlaskConnectionResult {
  success: boolean;
  database?: string;
  message?: string;
  error?: string;
}

export interface FlaskCommodity {
  id: number;
  name: string;
  unit: string;
}

export interface FlaskCommoditiesResult {
  success: boolean;
  data: FlaskCommodity[];
  error?: string;
}

export async function testFlaskConnection(): Promise<FlaskConnectionResult> {
  const response = await fetch(`${API_BASE_URL}/test-db`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Flask API tidak dapat diakses.`);
  }

  const result: FlaskConnectionResult = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Koneksi Flask ke MySQL gagal.');
  }

  return result;
}

export async function testGetCommodities(): Promise<FlaskCommodity[]> {
  const response = await fetch(`${API_BASE_URL}/commodities`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Gagal mengambil komoditas.`);
  }

  const result: FlaskCommoditiesResult = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.error || 'Respons data komoditas tidak valid.');
  }

  return result.data;
}
