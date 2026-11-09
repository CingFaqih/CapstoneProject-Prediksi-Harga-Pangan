import React, {
  useMemo,
  useState,
} from 'react';

import {
  ModelEvaluationItem,
} from '../../types.ts';

import {
  Calculator,
  Info,
  CheckCircle2,
} from 'lucide-react';


/* =========================================================
   TYPES
   ========================================================= */

interface ModelEvaluationViewProps {
  evaluationData: ModelEvaluationItem[];
}

type MetricKey =
  | 'MAPE'
  | 'MAE'
  | 'RMSE';


/* =========================================================
   COMPONENT
   ========================================================= */

export const ModelEvaluationView:
React.FC<ModelEvaluationViewProps> = ({
  evaluationData,
}) => {

  /* =======================================================
     ACTIVE CHART METRIC
     ======================================================= */

  const [
    activeChartMetric,
    setActiveChartMetric,
  ] = useState<MetricKey>(
    'MAPE'
  );


  /* =======================================================
     VALID EVALUATION DATA
     ======================================================= */

  const displayItems =
    useMemo(() => {

      return evaluationData.map(
        (item) => ({
          ...item,

          mae:
            item.mae !== null
              ? Number(item.mae)
              : null,

          rmse:
            item.rmse !== null
              ? Number(item.rmse)
              : null,

          mape:
            item.mape !== null
              ? Number(item.mape)
              : null,
        })
      );

    }, [
      evaluationData,
    ]);


  /* =======================================================
     TEST METADATA
     ======================================================= */

  const testMetadata =
    useMemo(() => {

      const itemWithPeriod =
        evaluationData.find(
          (item) =>
            item.testPeriod
        );


      const itemWithSamples =
        evaluationData.find(
          (item) =>
            item.testSamplesCount
        );


      return {

        period:
          itemWithPeriod?.testPeriod ||
          'Periode uji tidak tersedia',

        samples:
          itemWithSamples
            ?.testSamplesCount ??
          null,
      };

    }, [
      evaluationData,
    ]);


  /* =======================================================
     CHART DATA
     ======================================================= */

  const chartItems =
    useMemo(() => {

      return displayItems.map(
        (item) => {

          let value:
            number | null =
            null;


          if (
            activeChartMetric ===
            'MAPE'
          ) {

            value =
              item.mape;

          } else if (
            activeChartMetric ===
            'MAE'
          ) {

            value =
              item.mae;

          } else {

            value =
              item.rmse;
          }


          return {
            label:
              item.commodityName,

            value,
          };
        }
      );

    }, [
      displayItems,
      activeChartMetric,
    ]);


  const chartMaximum =
    useMemo(() => {

      const values =
        chartItems
          .map(
            (item) =>
              item.value
          )
          .filter(
            (
              value
            ): value is number =>
              value !== null &&
              Number.isFinite(
                value
              )
          );


      if (
        values.length === 0
      ) {
        return 1;
      }


      return Math.max(
        ...values
      );

    }, [
      chartItems,
    ]);


  /* =======================================================
     FORMATTERS
     ======================================================= */

  const formatCurrencyMetric = (
    value: number | null
  ) => {

    if (
      value === null ||
      value === undefined
    ) {
      return '—';
    }


    return (
      'Rp ' +
      value.toLocaleString(
        'id-ID',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )
    );
  };


  const formatPercentage = (
    value: number | null
  ) => {

    if (
      value === null ||
      value === undefined
    ) {
      return '—';
    }


    return (
      value.toLocaleString(
        'id-ID',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ) +
      '%'
    );
  };


  const formatChartValue = (
    value: number | null
  ) => {

    if (
      value === null ||
      value === undefined
    ) {
      return '—';
    }


    if (
      activeChartMetric ===
      'MAPE'
    ) {

      return formatPercentage(
        value
      );
    }


    return formatCurrencyMetric(
      value
    );
  };


  /* =======================================================
     CHART TEXT
     ======================================================= */

  const chartSubtitle =
    useMemo(() => {

      if (
        activeChartMetric ===
        'MAPE'
      ) {

        return (
          'Perbandingan rata-rata kesalahan absolut ' +
          'dalam bentuk persentase pada masing-masing komoditas.'
        );
      }


      if (
        activeChartMetric ===
        'MAE'
      ) {

        return (
          'Perbandingan rata-rata nilai absolut ' +
          'kesalahan prediksi pada masing-masing komoditas.'
        );
      }


      return (
        'Perbandingan akar rata-rata kuadrat ' +
        'kesalahan prediksi pada masing-masing komoditas.'
      );

    }, [
      activeChartMetric,
    ]);


  /* =======================================================
     EMPTY STATE
     ======================================================= */

  if (
    evaluationData.length === 0
  ) {

    return (

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">

        Data evaluasi model belum tersedia.

      </div>
    );
  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="space-y-6 pb-12">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">

        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">

            </div>


            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">

              Evaluasi Performa Model LSTM

            </h1>


            <p className="mt-1 text-xs text-slate-500">

              Hasil evaluasi prediksi harga pada {evaluationData.length} komoditas pangan Provinsi Maluku menggunakan MAE, RMSE, dan MAPE.

            </p>

          </div>


        </div>


        {/* INFORMATION */}

      </div>


      {/* =================================================
          EVALUATION TABLE
          ================================================= */}

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">

        <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h3 className="text-base font-bold text-slate-900">

              Tabel Evaluasi Tiga Metrik Model LSTM ({evaluationData.length} Komoditas)

            </h3>


            <p className="text-xs text-slate-500">

              Periode Pengujian: {testMetadata.period}

              {testMetadata.samples !== null
                ? (
                    ` · ${testMetadata.samples} observasi uji per komoditas`
                  )
                : ''}

            </p>

          </div>


          <div className="font-mono text-xs text-slate-400">

            {displayItems.length} Komoditas

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700">

                <th className="px-4 py-3 font-semibold">
                  No
                </th>

                <th className="px-4 py-3 font-semibold">
                  Komoditas
                </th>

                <th className="px-4 py-3 text-right font-semibold">
                  MAE
                </th>

                <th className="px-4 py-3 text-right font-semibold">
                  RMSE
                </th>

                <th className="px-4 py-3 text-right font-semibold">
                  MAPE (%)
                </th>

                <th className="px-4 py-3 text-center font-semibold">
                  Data Uji
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {displayItems.map(
                (
                  item,
                  index
                ) => {

                  const hasValues =
                    item.mae !== null &&
                    item.rmse !== null &&
                    item.mape !== null;


                  return (

                    <tr
                      key={
                        item.commodityId
                      }
                      className="transition-colors hover:bg-slate-50/70"
                    >

                      {/* NO */}

                      <td className="px-4 py-3 font-mono tabular-nums text-slate-400">

                        {index + 1}

                      </td>


                      {/* COMMODITY */}

                      <td className="px-4 py-3 font-semibold text-slate-900">

                        {item.commodityName}

                      </td>


                      {/* MAE */}

                      <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-slate-800">

                        {hasValues
                          ? formatCurrencyMetric(
                              item.mae
                            )
                          : '—'}

                      </td>


                      {/* RMSE */}

                      <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-slate-800">

                        {hasValues
                          ? formatCurrencyMetric(
                              item.rmse
                            )
                          : '—'}

                      </td>


                      {/* MAPE */}

                      <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-emerald-700">

                        {hasValues
                          ? formatPercentage(
                              item.mape
                            )
                          : '—'}

                      </td>


                      {/* TEST DATA */}

                      <td className="px-4 py-3 text-center font-mono tabular-nums text-slate-600">

                        {item.testSamplesCount ??
                          '—'}

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          COMPARISON VISUALIZATION
          ================================================= */}

      <div className="space-y-4">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <h3 className="text-base font-bold text-slate-900">

              Visualisasi Perbandingan Metrik Antar Komoditas

            </h3>


            <p className="text-xs text-slate-500">

              Perbandingan hasil evaluasi model LSTM pada data uji untuk masing-masing komoditas.

            </p>

          </div>


          {/* METRIC SELECTOR */}

          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">

            {(
              [
                'MAPE',
                'MAE',
                'RMSE',
              ] as MetricKey[]
            ).map(
              (metric) => (

                <button
                  key={
                    metric
                  }
                  onClick={
                    () =>
                      setActiveChartMetric(
                        metric
                      )
                  }
                  className={
                    `cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ` +
                    (
                      activeChartMetric ===
                      metric
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )
                  }
                >

                  {metric}

                </button>
              )
            )}

          </div>

        </div>


        {/* BAR CHART */}

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">

          <div className="border-b border-slate-100 pb-3">

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h4 className="text-sm font-bold text-slate-900">

                  Perbandingan {activeChartMetric} untuk {evaluationData.length} Komoditas Pangan Maluku

                </h4>


                <p className="mt-0.5 text-xs text-slate-500">

                  {chartSubtitle}

                </p>

              </div>


              <span className="font-mono text-xs text-slate-400">

                {activeChartMetric === 'MAPE'
                  ? 'Satuan: Persentase'
                  : 'Satuan: mengikuti harga komoditas'}

              </span>

            </div>

          </div>


          <div className="mt-4 space-y-3">

            {chartItems.map(
              (
                item,
                index
              ) => {

                const width =
                  item.value !== null &&
                  chartMaximum > 0

                    ? (
                        item.value /
                        chartMaximum
                      ) *
                      100

                    : 0;


                return (

                  <div
                    key={
                      `${item.label}-${index}`
                    }
                    className="grid grid-cols-[120px_minmax(0,1fr)_110px] items-center gap-3 sm:grid-cols-[140px_minmax(0,1fr)_130px]"
                  >

                        {/* LABEL */}

                        <div className="truncate text-right text-xs font-medium text-slate-700">

                          {item.label}

                        </div>


                        {/* BAR */}

                        <div className="h-7 overflow-hidden rounded-md bg-slate-100">

                          <div
                            className="
                              h-full
                              rounded-full
                              bg-[#0F8A78]
                              transition-all
                              duration-500
                            "
                            style={{
                              width: `${
                                Math.min(
                                  100,
                                  (
                                    Number(item.value ?? 0) /
                                    Math.max(
                                      ...chartItems.map(
                                        (chartItem) =>
                                          Number(chartItem.value ?? 0)
                                      ),
                                      1
                                    )
                                  ) * 100
                                )
                              }%`,
                            }}
                          />

                        </div>


                    {/* VALUE */}

                    <div className="text-right font-mono text-xs font-medium tabular-nums text-slate-700">

                      {formatChartValue(
                        item.value
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>


          <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">

            Panjang batang menunjukkan besarnya nilai metrik pada masing-masing komoditas. Nilai kesalahan yang lebih kecil menunjukkan hasil prediksi yang lebih dekat terhadap nilai aktual.

          </div>

        </div>

      </div>


      {/* =================================================
          METRIC EXPLANATIONS
          ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* MAE */}

        <div className="space-y-2 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">

          <div className="flex items-center gap-2">

            <Calculator className="h-4 w-4 text-sky-600" />


            <h4 className="text-sm font-bold text-slate-900">

              Mean Absolute Error (MAE)

            </h4>

          </div>


          <div className="rounded-md bg-slate-50 p-2 font-mono text-[11px] text-slate-700">

            MAE = (1/n) · Σ |yᵢ − ŷᵢ|

          </div>


          <p className="text-xs leading-relaxed text-slate-600">

            MAE menghitung rata-rata nilai absolut selisih antara harga aktual dan hasil prediksi. Nilainya menunjukkan besar kesalahan prediksi dalam satuan yang sama dengan data harga.

          </p>

        </div>


        {/* RMSE */}

        <div className="space-y-2 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">

          <div className="flex items-center gap-2">

            <Calculator className="h-4 w-4 text-amber-600" />


            <h4 className="text-sm font-bold text-slate-900">

              Root Mean Squared Error (RMSE)

            </h4>

          </div>


          <div className="rounded-md bg-slate-50 p-2 font-mono text-[11px] text-slate-700">

            RMSE = √[(1/n) · Σ (yᵢ − ŷᵢ)²]

          </div>


          <p className="text-xs leading-relaxed text-slate-600">

            RMSE dihitung dari akar rata-rata kuadrat selisih antara nilai aktual dan prediksi. Pengkuadratan kesalahan membuat selisih yang lebih besar memberikan pengaruh lebih kuat terhadap nilai RMSE.

          </p>

        </div>


        {/* MAPE */}

        <div className="space-y-2 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">

          <div className="flex items-center gap-2">

            <Calculator className="h-4 w-4 text-emerald-600" />


            <h4 className="text-sm font-bold text-slate-900">

              Mean Absolute Percentage Error (MAPE)

            </h4>

          </div>


          <div className="rounded-md bg-slate-50 p-2 font-mono text-[11px] text-slate-700">

            MAPE = (100%/n) · Σ |(yᵢ − ŷᵢ) / yᵢ|

          </div>


          <p className="text-xs leading-relaxed text-slate-600">

            MAPE menyatakan rata-rata kesalahan absolut antara nilai aktual dan prediksi dalam bentuk persentase. Metrik ini memudahkan perbandingan kesalahan relatif antar komoditas dengan tingkat harga yang berbeda.

          </p>

        </div>

      </div>


      {/* =================================================
          SYMBOL INFORMATION
          ================================================= */}

      
    </div>
  );
};