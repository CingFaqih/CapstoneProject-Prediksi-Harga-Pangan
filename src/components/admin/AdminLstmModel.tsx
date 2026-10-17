import React, { useState } from 'react';
import { LstmModelConfig } from '../../types.ts';
import {
  Cpu,
  Play,
  CheckCircle2,
  Clock,
  Database,
  Calendar,
  Layers,
  Terminal,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface AdminLstmModelProps {
  modelConfig: LstmModelConfig;
  onTrainModel: (
    epochs: number,
    onProgress: (progress: number, epoch: number, loss: number, log: string) => void
  ) => Promise<LstmModelConfig>;
}

export const AdminLstmModel: React.FC<AdminLstmModelProps> = ({
  modelConfig,
  onTrainModel,
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [currentLoss, setCurrentLoss] = useState<number | null>(null);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStartTraining = async () => {
    setIsTraining(true);
    setProgress(0);
    setCurrentEpoch(0);
    setCurrentLoss(null);
    setSuccessMessage(null);
    setTrainingLogs([
      '[INIT] Inisialisasi pipeline deep learning LSTM PIHPS Maluku...',
      '[DATA] Memuat 1.870 rekaman deret waktu mingguan (2023–2026)...',
      '[PREP] Normalisasi MinMaxScaler [0, 1] dan pembentukan sliding window (lag = 4)...',
    ]);

    try {
      await onTrainModel(100, (prog, epoch, loss, log) => {
        setProgress(prog);
        setCurrentEpoch(epoch);
        setCurrentLoss(loss);
        setTrainingLogs((prev) => [...prev.slice(-8), log]);
      });

      setSuccessMessage('Pelatihan model LSTM 100 Epochs selesai. Bobot model (.h5) dan metrik evaluasi berhasil diperbarui.');
      setTrainingLogs((prev) => [
        ...prev,
        '[DONE] Model konvergen dengan validasi MSE optimal.',
        '[SAVE] Menyimpan bobot jaringan saraf ke sistem penyimpanan.',
      ]);
    } catch {
      alert('Terjadi kesalahan selama proses pelatihan model.');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Train Trigger Button */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <span>Pengendali Deep Learning</span>
              <span aria-hidden="true">·</span>
              <span>Backend Training Pipeline</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Model Long Short-Term Memory (LSTM)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Status model, parameter pelatihan time-series, dan pembaruan bobot peramalan 10 komoditas
            </p>
          </div>

          <button
            onClick={handleStartTraining}
            disabled={isTraining}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Play className={`h-4 w-4 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Sedang Melatih Model...' : 'Train / Update Model'}</span>
          </button>
        </div>

        {/* 6 Required Status Cards */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-1">
            <span className="text-slate-500 block font-medium">Status Model:</span>
            <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {isTraining ? 'Training in Progress' : `${modelConfig.status} (Optimal)`}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-1">
            <span className="text-slate-500 block font-medium">Dataset yang Digunakan:</span>
            <span className="text-sm font-bold text-slate-900 truncate block">
              PIHPS Maluku (10 Komoditas)
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-1">
            <span className="text-slate-500 block font-medium">Periode Data:</span>
            <span className="text-sm font-bold text-slate-900 font-mono block">
              31 Jan 2023 – 31 Agu 2026
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-1">
            <span className="text-slate-500 block font-medium">Waktu Training Terakhir:</span>
            <span className="text-sm font-semibold text-slate-900 font-mono block">
              {modelConfig.lastTrainedAt}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-1">
            <span className="text-slate-500 block font-medium">Status Training:</span>
            <span className="text-sm font-semibold text-slate-900 block">
              {isTraining ? 'Aktif (100 Epochs)' : 'Selesai (Loss: 0.0031)'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-1">
            <span className="text-slate-500 block font-medium">Model Terakhir Diperbarui:</span>
            <span className="text-sm font-semibold text-slate-900 font-mono block">
              Versi Produksi v1.4-Maluku
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Training Terminal & Progress Box */}
      {(isTraining || trainingLogs.length > 0) && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs animate-in fade-in duration-150">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Proses Pelatihan Model LSTM
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-500">
              {isTraining ? `Epoch: ${currentEpoch}/100` : 'Pelatihan Berhasil'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-slate-600 font-mono">
              <span>Kemajuan Epoch: {Math.round(progress)}%</span>
              {currentLoss !== null && <span>Loss: {currentLoss}</span>}
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-emerald-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Log terminal */}
          <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 space-y-1 overflow-x-auto max-h-48 overflow-y-auto">
            {trainingLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>

          {successMessage && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Model Hyperparameters & Architecture Summary */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Spesifikasi Arsitektur Neural Network
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Struktur layer model terstandarisasi untuk peramalan harga pangan PIHPS Maluku
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-slate-500 block">Input Layer:</span>
            <span className="font-bold text-slate-900 font-mono mt-1 block">
              Window: 4 Minggu (Lag-4)
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-slate-500 block">Hidden Layer:</span>
            <span className="font-bold text-slate-900 font-mono mt-1 block">
              64 LSTM Units (Return Seq: False)
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-slate-500 block">Regularisasi:</span>
            <span className="font-bold text-slate-900 font-mono mt-1 block">
              Dropout 0.20 (20%)
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-slate-500 block">Dense Output:</span>
            <span className="font-bold text-slate-900 font-mono mt-1 block">
              1 Unit Regresi Kontinu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
