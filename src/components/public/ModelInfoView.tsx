import React from 'react';
import { LstmModelConfig } from '../../types.ts';
import {
  Cpu,
  Database,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  FileText,
  BarChart,
  Layers,
  ArrowRight,
  Code2,
} from 'lucide-react';

interface ModelInfoViewProps {
  modelConfig: LstmModelConfig;
}

export const ModelInfoView: React.FC<ModelInfoViewProps> = ({ modelConfig }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Research Header with Generated Image Asset */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Informasi Metodologi & Arsitektur Penelitian</span>
              <span aria-hidden="true">·</span>
              <span>Skripsi / Tugas Akhir</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Prediksi Harga Sepuluh Komoditas Pangan di Provinsi Maluku Menggunakan Algoritma Long Short-Term Memory (LSTM) dengan Implementasi Dashboard Web
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dokumentasi komprehensif mengenai spesifikasi dataset, arsitektur jaringan saraf tiruan berulang (Recurrent Neural Network - LSTM), parameter hiper, alur preprocessing data deret waktu, dan skema evaluasi performa model.
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="relative aspect-16/9 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
              <img
                src="/src/assets/images/maluku_food_landscape_1791181955851.jpg"
                alt="Provinsi Maluku Food Landscape & Research"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] text-white/90 font-medium">
                  PIHPS Maluku · 10 Komoditas Pangan
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Required 8 Specification Cards */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Parameter Pokok Penelitian
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Cpu className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider">Algoritma</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              Long Short-Term Memory (LSTM)
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Arsitektur Deep Learning RNN untuk time-series berderet panjang
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Database className="h-4 w-4 text-sky-600" />
              <span className="text-xs font-semibold uppercase tracking-wider">Sumber Data</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              Pusat Informasi Harga Pangan Strategis (PIHPS)
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bank Indonesia Kantor Perwakilan Provinsi Maluku
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <MapPin className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-semibold uppercase tracking-wider">Wilayah</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              Provinsi Maluku
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Meliputi pasar tradisional acuan Kota Ambon, Tual, dan sekitarnya
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-wider">Frekuensi</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              Mingguan (Weekly)
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Interval waktu 7 hari untuk meredam noise harian logistik
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider">Periode Data</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              31 Januari 2023 – 31 Agustus 2026
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total 187 observasi deret waktu mingguan per komoditas
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <CheckCircle className="h-4 w-4 text-sky-600" />
              <span className="text-xs font-semibold uppercase tracking-wider">Periode Pengujian</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              Tahun 2026 (Januari – Agustus)
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Data testing set untuk validasi out-of-sample akurasi
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Layers className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-semibold uppercase tracking-wider">Periode Peramalan</span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              September – Desember 2026
            </div>
            <p className="text-xs text-slate-500 mt-1">
              18 minggu ramalan multi-step ke depan menuju akhir tahun
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <BarChart className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-wider">Metrik Evaluasi</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              MAE, RMSE, MAPE
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kombinasi standar absolut, kuadratik, dan persentase kesalahan
            </p>
          </div>
        </div>
      </section>

      {/* Arsitektur Jaringan LSTM & Parameter Model */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Arsitektur Jaringan Long Short-Term Memory (LSTM)
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Konfigurasi hyperparameter dan topologi layer jaringan saraf yang diimplementasikan
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Topologi & Parameter Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tabel Hyperparameter Model
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-600 font-medium">Input Window (Lag Time)</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">4 Minggu (t-4 s/d t-1)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">LSTM Units</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">64 Hidden Neurons</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-600 font-medium">Dropout Rate (Anti-Overfitting)</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">0.20 (20%)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">Dense Output Layer</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">1 Unit (Continuous Price)</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-600 font-medium">Fungsi Optimasi</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">Adam (lr = 0.001)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">Loss Function</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">Mean Squared Error (MSE)</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-600 font-medium">Epochs & Batch Size</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">100 Epochs · Batch 16</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">Normalisasi Fitur</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-right">MinMaxScaler [0, 1]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Gerbang Logika LSTM (Gates Explanation) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Komponen Memory Cell LSTM
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <span className="font-bold text-slate-900 block mb-1">1. Forget Gate (Gerbang Lupa)</span>
                <p className="leading-relaxed">
                  Menentukan informasi historis harga yang harus dibuang dari cell state masa lalu menggunakan fungsi aktivasi Sigmoid: <code className="font-mono text-[11px] bg-white px-1 rounded border">f_t = σ(W_f · [h_(t-1), x_t] + b_f)</code>.
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <span className="font-bold text-slate-900 block mb-1">2. Input Gate & Candidate State (Gerbang Masukan)</span>
                <p className="leading-relaxed">
                  Menentukan fitur harga baru mana yang ditambahkan ke cell state dengan kombinasi gerbang Sigmoid dan Tanh: <code className="font-mono text-[11px] bg-white px-1 rounded border">i_t = σ(W_i · [h_(t-1), x_t] + b_i)</code>.
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <span className="font-bold text-slate-900 block mb-1">3. Output Gate & Hidden State (Gerbang Keluaran)</span>
                <p className="leading-relaxed">
                  Menghasilkan output prediksi harga ternormalisasi untuk interval mingguan berikutnya yang diteruskan ke layer Dense regresi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Metodologi Penelitian Flowchart */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Tahapan Metodologi Penelitian
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Siklus tahapan ilmiah dari akuisisi data PIHPS hingga visualisasi dashboard web
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-mono font-bold text-[11px]">
              1
            </div>
            <h4 className="font-bold text-slate-900">Pengumpulan Data</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Ekstraksi data harga mingguan 10 komoditas dari portal resmi PIHPS Maluku periode 2023–2026.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-mono font-bold text-[11px]">
              2
            </div>
            <h4 className="font-bold text-slate-900">Pra-pemrosesan Data</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Penanganan missing value via interpolasi linear dan normalisasi skala harga MinMaxScaler (0–1).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-mono font-bold text-[11px]">
              3
            </div>
            <h4 className="font-bold text-slate-900">Windowing & Split</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Pembentukan sliding window lag = 4 minggu dan pembagian data latih (2023–2025) serta data uji (2026).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-mono font-bold text-[11px]">
              4
            </div>
            <h4 className="font-bold text-slate-900">Pelatihan & Evaluasi</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Training model LSTM 100 epoch, denormalisasi harga, dan evaluasi menggunakan MAE, RMSE, dan MAPE.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-emerald-50/60 border-emerald-200 p-4 space-y-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-white font-mono font-bold text-[11px]">
              5
            </div>
            <h4 className="font-bold text-emerald-950">Dashboard Web</h4>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Penyajian antarmuka interaktif 2 POV (Publik & Admin) dan peramalan Sep–Des 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Panduan Implementasi Backend Python Flask */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="h-5 w-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900">
            Arsitektur Integrasi Backend Python Flask
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Prototype ini dirancang secara modular agar siap dihubungkan 1:1 dengan aplikasi web berbasis framework <strong>Python Flask</strong> dan library <strong>TensorFlow / Keras / PyTorch</strong>.
        </p>

        <div className="rounded-xl bg-slate-900 p-4 text-slate-300 font-mono text-xs overflow-x-auto">
          <pre>{`# Contoh Endpoint Python Flask (app.py)
from flask import Flask, jsonify, request
from tensorflow.keras.models import load_model
import numpy as np

app = Flask(__name__)

@app.route('/api/model/predict/<commodity_id>', methods=['GET'])
def get_prediction(commodity_id):
    # Load model LSTM tersimpan (e.g. lstm_beras.h5)
    model = load_model(f'models/lstm_{commodity_id}.h5')
    # Ambil 4 minggu terakhir data historis (lag = 4)
    # Lakukan invers normalisasi MinMaxScaler
    forecast_results = predict_next_18_weeks(model, commodity_id)
    return jsonify({
        "status": "success",
        "commodity": commodity_id,
        "horizon": "Sep-Des 2026",
        "forecast": forecast_results
    })`}</pre>
        </div>
      </section>
    </div>
  );
};
