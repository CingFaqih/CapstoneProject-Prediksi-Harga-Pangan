import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Commodity,
  ForecastRecord,
} from '../../types.ts';

import {
  SimpleLineChart,
} from '../common/SimpleLineChart.tsx';

import {
  MetricCard,
} from '../common/MetricCard.tsx';

import {
  Calendar,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Compass,
} from 'lucide-react';


/* =========================================================
   PROPS
   ========================================================= */

interface PriceForecastViewProps {
  commodities: Commodity[];
  forecastData: ForecastRecord[];
  initialCommodityId?: string;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export const PriceForecastView:
React.FC<PriceForecastViewProps> = ({
  commodities,
  forecastData,
  initialCommodityId,
}) => {

  /* =======================================================
     STATE
     ======================================================= */

  const [
    selectedCommodityId,
    setSelectedCommodityId,
  ] = useState<string>(
    initialCommodityId || ''
  );


  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState<string>(
    'all'
  );


  const [
    currentPage,
    setCurrentPage,
  ] = useState<number>(
    1
  );


  /*
   * 18 ramalan / 6 baris
   * = 3 halaman ketika semua bulan ditampilkan.
   */
  const pageSize = 6;


  /* =======================================================
     SYNC SELECTED COMMODITY
     ======================================================= */

  useEffect(() => {

    if (
      commodities.length === 0
    ) {
      return;
    }


    const exists =
      commodities.some(
        (
          commodity
        ) =>
          commodity.id ===
          selectedCommodityId
      );


    if (exists) {
      return;
    }


    const initialExists =
      initialCommodityId &&
      commodities.some(
        (
          commodity
        ) =>
          commodity.id ===
          initialCommodityId
      );


    setSelectedCommodityId(
      initialExists
        ? initialCommodityId!
        : commodities[0].id
    );

  }, [
    commodities,
    initialCommodityId,
    selectedCommodityId,
  ]);


  /* =======================================================
     RESET PAGE
     ======================================================= */

  useEffect(() => {

    setCurrentPage(
      1
    );

  }, [
    selectedCommodityId,
    selectedMonth,
  ]);


  /* =======================================================
     ACTIVE COMMODITY
     ======================================================= */

  const activeCommodity =
    useMemo(() => {

      return (
        commodities.find(
          (
            commodity
          ) =>
            commodity.id ===
            selectedCommodityId
        ) ||
        commodities[0]
      );

    }, [
      commodities,
      selectedCommodityId,
    ]);


  /* =======================================================
     FORECAST DATA FOR COMMODITY
     ======================================================= */

  const commodityForecasts =
    useMemo(() => {

      return forecastData
        .filter(
          (
            forecast
          ) =>
            forecast.commodityId ===
            selectedCommodityId
        )
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              `${a.date}T00:00:00`
            ).getTime() -
            new Date(
              `${b.date}T00:00:00`
            ).getTime()
        );

    }, [
      forecastData,
      selectedCommodityId,
    ]);


  /* =======================================================
     MONTH FILTER
     ======================================================= */

  const filteredForecasts =
    useMemo(() => {

      if (
        selectedMonth ===
        'all'
      ) {

        return commodityForecasts;

      }


      return commodityForecasts.filter(
        (
          forecast
        ) =>
          forecast.month ===
          selectedMonth
      );

    }, [
      commodityForecasts,
      selectedMonth,
    ]);


  /* =======================================================
     FORMAT PRICE
     ======================================================= */

  const formatPrice =
    (
      value: number,
      decimals = true
    ) => {

      return Number(
        value
      ).toLocaleString(
        'id-ID',
        {
          minimumFractionDigits:
            decimals
              ? 2
              : 0,

          maximumFractionDigits:
            decimals
              ? 2
              : 0,
        }
      );

    };


  /* =======================================================
     FORMAT DATE
     ======================================================= */

  const formatDate =
    (
      dateString: string
    ) => {

      if (!dateString) {
        return '—';
      }


      return new Date(
        `${dateString}T00:00:00`
      ).toLocaleDateString(
        'id-ID',
        {
          day:
            'numeric',

          month:
            'long',

          year:
            'numeric',
        }
      );

    };


  /* =======================================================
     FORECAST STATISTICS
     ======================================================= */

  const forecastStats =
    useMemo(() => {

      if (
        filteredForecasts.length ===
        0
      ) {

        return {
          average:
            0,

          minPredicted:
            0,

          maxPredicted:
            0,

          finalPrice:
            0,

          finalDate:
            '',
        };

      }


      const values =
        filteredForecasts.map(
          (
            forecast
          ) =>
            Number(
              forecast.predictedPrice
            )
        );


      const average =
        values.reduce(
          (
            total,
            value
          ) =>
            total +
            value,
          0
        ) /
        values.length;


      const lastForecast =
        filteredForecasts[
          filteredForecasts.length -
          1
        ];


      return {

        average,

        minPredicted:
          Math.min(
            ...values
          ),

        maxPredicted:
          Math.max(
            ...values
          ),

        finalPrice:
          Number(
            lastForecast.predictedPrice
          ),

        finalDate:
          lastForecast.date,

      };

    }, [
      filteredForecasts,
    ]);


  /* =======================================================
     CHART DATA
     ======================================================= */

  const chartLabels =
    useMemo(() => {

      return filteredForecasts.map(
        (
          forecast
        ) => {

          const [
            year,
            month,
            day,
          ] =
            forecast.date.split(
              '-'
            );


          return (
            `${day}/${month}/` +
            `${year.slice(
              2
            )}`
          );

        }
      );

    }, [
      filteredForecasts,
    ]);


  const predictedValues =
    useMemo(() => {

      return filteredForecasts.map(
        (
          forecast
        ) =>
          Number(
            forecast.predictedPrice
          )
      );

    }, [
      filteredForecasts,
    ]);


  const upperBounds =
    useMemo(() => {

      return filteredForecasts.map(
        (
          forecast
        ) =>
          Number(
            forecast.upperBound
          )
      );

    }, [
      filteredForecasts,
    ]);


  const lowerBounds =
    useMemo(() => {

      return filteredForecasts.map(
        (
          forecast
        ) =>
          Number(
            forecast.lowerBound
          )
      );

    }, [
      filteredForecasts,
    ]);


  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredForecasts.length /
        pageSize
      )
    );


  useEffect(() => {

    if (
      currentPage >
      totalPages
    ) {

      setCurrentPage(
        totalPages
      );

    }

  }, [
    currentPage,
    totalPages,
  ]);


  const paginatedForecasts =
    useMemo(() => {

      const startIndex =
        (
          currentPage -
          1
        ) *
        pageSize;


      return filteredForecasts.slice(
        startIndex,
        startIndex +
          pageSize
      );

    }, [
      filteredForecasts,
      currentPage,
    ]);


  /* =======================================================
     EXPORT CSV
     ======================================================= */

  const handleExportCSV =
    () => {

      const headers = [
        'Minggu Ke',
        'Tanggal',
        'Bulan',
        'Komoditas',
        'Harga Ramalan LSTM (Rp)',
        'Batas Bawah 95%',
        'Batas Atas 95%',
        'Kecenderungan Tren',
      ];


      const rows =
        filteredForecasts.map(
          (
            forecast
          ) => [

            forecast.weekIndex,

            forecast.date,

            forecast.month,

            `"${forecast.commodityName}"`,

            forecast.predictedPrice,

            forecast.lowerBound,

            forecast.upperBound,

            forecast.trend,

          ]
        );


      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [
          headers.join(
            ','
          ),

          ...rows.map(
            (
              row
            ) =>
              row.join(
                ','
              )
          ),
        ].join(
          '\n'
        );


      const encodedUri =
        encodeURI(
          csvContent
        );


      const link =
        document.createElement(
          'a'
        );


      link.setAttribute(
        'href',
        encodedUri
      );


      link.setAttribute(
        'download',
        `ramalan_lstm_${selectedCommodityId}_sep_des_2026.csv`
      );


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );

    };


  /* =======================================================
     EMPTY STATE
     ======================================================= */

  if (
    commodities.length === 0 ||
    !activeCommodity
  ) {

    return (

      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-8
          text-center
          text-sm
          text-slate-500
        "
      >

        Data ramalan belum tersedia.

      </div>

    );

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div
      className="
        space-y-6
        pb-12
      "
    >

      {/* =================================================
          HEADER
          ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-sm
        "
      >

        {/* HEADER TOP */}

        <div
          className="
            flex
            flex-col
            gap-4

            border-b
            border-slate-100

            pb-4

            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          {/* TITLE */}

          <div>

            <h1
              className="
                text-xl
                font-bold
                tracking-tight
                text-slate-900

                sm:text-2xl
              "
            >

              Ramalan Harga Pangan: September – Desember 2026

            </h1>


            <p
              className="
                mt-1
                text-xs
                leading-relaxed
                text-slate-500
              "
            >

              Hasil ramalan harga mingguan model LSTM berdasarkan
              data historis PIHPS Maluku.

            </p>

          </div>


          {/* EXPORT */}

          <button
            type="button"
            onClick={
              handleExportCSV
            }
            disabled={
              filteredForecasts.length ===
              0
            }
            className="
              inline-flex
              cursor-pointer
              items-center
              gap-1.5

              rounded-lg
              bg-slate-100

              px-3
              py-1.5

              text-xs
              font-semibold
              text-slate-700

              transition-colors

              hover:bg-slate-200/80

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            <Download
              className="
                h-3.5
                w-3.5
              "
            />


            <span>
              Export Ramalan CSV
            </span>

          </button>

        </div>


        {/* =================================================
            FILTERS
            ================================================= */}

        <div
          className="
            mt-4

            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2
          "
        >

          {/* COMMODITY */}

          <div>

            <label
              htmlFor="comm-forecast"
              className="
                mb-1
                block

                text-xs
                font-medium
                text-slate-600
              "
            >

              Pilih Komoditas:

            </label>


            <select
              id="comm-forecast"
              value={
                selectedCommodityId
              }
              onChange={
                (
                  event
                ) =>
                  setSelectedCommodityId(
                    event.target.value
                  )
              }
              className="
                w-full

                rounded-lg
                border
                border-slate-300
                bg-white

                px-3
                py-2

                text-xs
                font-semibold
                text-slate-900

                shadow-2xs

                focus:border-[#0F8A78]
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-100
              "
            >

              {commodities.map(
                (
                  commodity
                ) => (

                  <option
                    key={
                      commodity.id
                    }
                    value={
                      commodity.id
                    }
                  >

                    {commodity.name}

                    {' ('}

                    {commodity.unit}

                    {') — '}

                    {commodity.category}

                  </option>

                )
              )}

            </select>

          </div>


          {/* MONTH */}

          <div>

            <label
              htmlFor="month-forecast"
              className="
                mb-1
                block

                text-xs
                font-medium
                text-slate-600
              "
            >

              Filter Bulan Ramalan:

            </label>


            <select
              id="month-forecast"
              value={
                selectedMonth
              }
              onChange={
                (
                  event
                ) =>
                  setSelectedMonth(
                    event.target.value
                  )
              }
              className="
                w-full

                rounded-lg
                border
                border-slate-300
                bg-white

                px-3
                py-2

                text-xs
                font-medium
                text-slate-800

                shadow-2xs

                focus:border-[#0F8A78]
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-100
              "
            >

              <option value="all">
                Semua Bulan (September – Desember 2026)
              </option>


              <option value="September">
                September 2026
              </option>


              <option value="Oktober">
                Oktober 2026
              </option>


              <option value="November">
                November 2026
              </option>


              <option value="Desember">
                Desember 2026
              </option>

            </select>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
          ================================================= */}

      <section
        className="
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* ACTUAL PRICE */}

        <MetricCard
          label="Harga Aktual Terakhir"
          value={
            `Rp ${formatPrice(
              Number(
                activeCommodity.currentPrice
              ),
              false
            )}`
          }
          subtext={
            activeCommodity.lastUpdated
              ? `Per ${formatDate(
                  activeCommodity.lastUpdated
                )}`
              : 'Data aktual terakhir'
          }
          secondaryText="Data Historis PIHPS"
          icon={

            <Calendar
              className="
                h-4
                w-4
                text-slate-600
              "
            />

          }
        />


        {/* AVERAGE */}

        <MetricCard
          label="Rata-Rata Ramalan"
          value={
            `Rp ${formatPrice(
              forecastStats.average
            )}`
          }
          subtext={
            `${filteredForecasts.length} observasi ramalan`
          }
          secondaryText={
            selectedMonth ===
            'all'
              ? 'September – Desember 2026'
              : `${selectedMonth} 2026`
          }
          icon={

            <Sparkles
              className="
                h-4
                w-4
                text-emerald-600
              "
            />

          }
        />


        {/* RANGE */}

        <MetricCard
          label="Rentang Ramalan"
          value={
            `Rp ${formatPrice(
              forecastStats.minPredicted
            )}`
          }
          subtext={
            `s/d Rp ${formatPrice(
              forecastStats.maxPredicted
            )}`
          }
          secondaryText="Minimum – Maksimum"
          icon={

            <Compass
              className="
                h-4
                w-4
                text-sky-600
              "
            />

          }
        />


        {/* FINAL */}

        <MetricCard
          label="Ramalan Akhir Periode"
          value={
            `Rp ${formatPrice(
              forecastStats.finalPrice
            )}`
          }
          subtext={
            forecastStats.finalDate
              ? formatDate(
                  forecastStats.finalDate
                )
              : '—'
          }
          secondaryText="Titik Ramalan Terakhir"
          icon={

            <TrendingUp
              className="
                h-4
                w-4
                text-amber-600
              "
            />

          }
        />

      </section>


      {/* =================================================
          CHART
          ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-sm
        "
      >

        <div
          className="
            mb-4

            flex
            flex-col
            gap-2

            border-b
            border-slate-100

            pb-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h2
              className="
                text-base
                font-bold
                text-slate-900
              "
            >

              Grafik Ramalan Harga Mingguan — {activeCommodity.name}

            </h2>


            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
              "
            >

              Garis putus-putus menunjukkan hasil ramalan
              harga mingguan model LSTM.

            </p>

          </div>


          <div
            className="
              font-mono
              text-xs
              text-slate-400
            "
          >

            {filteredForecasts.length} Titik Ramalan

          </div>

        </div>


        <SimpleLineChart
          labels={
            chartLabels
          }
          series={[
            {

              id:
                'forecast-series',

              name:
                `Hasil Ramalan LSTM (${activeCommodity.name})`,

              color:
                '#0F8A78',

              data:
                predictedValues,

              dashed:
                true,

            },
          ]}
          confidenceBounds={
            upperBounds.length >
              0 &&
            lowerBounds.length >
              0
              ? {
                  upper:
                    upperBounds,

                  lower:
                    lowerBounds,
                }
              : undefined
          }
          height={
            320
          }
          yAxisLabel={
            `Harga Ramalan (${activeCommodity.unit})`
          }
        />

      </section>


      {/* =================================================
          FORECAST TABLE
          ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-sm
        "
      >

        {/* TABLE HEADER */}

        <div
          className="
            mb-4

            flex
            flex-col
            gap-2

            border-b
            border-slate-100

            pb-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h2
              className="
                text-base
                font-bold
                text-slate-900
              "
            >

              Tabel Rincian Ramalan Harga Mingguan

            </h2>


            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
              "
            >

              Menampilkan {paginatedForecasts.length} dari{' '}
              {filteredForecasts.length} titik ramalan mingguan.

            </p>

          </div>


          <div
            className="
              text-right
            "
          >

            <div
              className="
                font-mono
                text-xs
                text-slate-400
              "
            >

              {activeCommodity.name}
              {' · '}
              {activeCommodity.unit}

            </div>


            <div
              className="
                mt-0.5
                text-[10px]
                text-slate-400
              "
            >

              Halaman {currentPage} dari {totalPages}

            </div>

          </div>

        </div>


        {/* =================================================
            TABLE
            ================================================= */}

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              min-w-[850px]
              text-left
              text-xs
            "
          >

            <thead>

              <tr
                className="
                  border-b
                  border-slate-200
                  bg-slate-50/80
                  text-slate-700
                "
              >

                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >

                  Minggu

                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >

                  Tanggal Ramalan

                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >

                  Bulan

                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    text-right
                    font-semibold
                  "
                >

                  Harga Ramalan ({activeCommodity.unit})

                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    text-center
                    font-semibold
                  "
                >

                  Kecenderungan

                </th>

              </tr>

            </thead>


            <tbody
              className="
                divide-y
                divide-slate-100
              "
            >

              {paginatedForecasts.length >
              0 ? (

                paginatedForecasts.map(
                  (
                    row
                  ) => {

                    const normalizedTrend =
                      String(
                        row.trend ||
                        'stabil'
                      ).toLowerCase();


                    const isUp =
                      normalizedTrend ===
                      'naik';


                    const isDown =
                      normalizedTrend ===
                      'turun';


                    return (

                      <tr
                        key={
                          row.id
                        }
                        className="
                          transition-colors
                          hover:bg-slate-50/60
                        "
                      >

                        {/* WEEK */}

                        <td
                          className="
                            px-3
                            py-2.5

                            font-mono
                            tabular-nums
                            text-slate-500
                          "
                        >

                          Minggu {row.weekIndex}

                        </td>


                        {/* DATE */}

                        <td
                          className="
                            px-3
                            py-2.5

                            font-mono
                            font-medium
                            text-slate-900
                          "
                        >

                          {row.date}

                        </td>


                        {/* MONTH */}

                        <td
                          className="
                            px-3
                            py-2.5
                            text-slate-700
                          "
                        >

                          {row.month} 2026

                        </td>


                        {/* FORECAST */}

                        <td
                          className="
                            px-3
                            py-2.5

                            text-right

                            font-mono
                            font-bold
                            tabular-nums
                            text-emerald-800
                          "
                        >

                          Rp{' '}

                          {formatPrice(
                            Number(
                              row.predictedPrice
                            )
                          )}

                        </td>


                        {/* TREND */}

                        <td
                          className="
                            px-3
                            py-2.5
                            text-center
                          "
                        >

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1

                              text-[11px]
                              font-medium

                              ${
                                isUp
                                  ? 'text-rose-600'
                                  : isDown
                                  ? 'text-emerald-600'
                                  : 'text-slate-600'
                              }
                            `}
                          >

                            {isUp && (

                              <TrendingUp
                                className="
                                  h-3
                                  w-3
                                "
                              />

                            )}


                            {isDown && (

                              <TrendingDown
                                className="
                                  h-3
                                  w-3
                                "
                              />

                            )}


                            {!isUp &&
                            !isDown && (

                              <span>
                                —
                              </span>

                            )}


                            <span
                              className="
                                capitalize
                              "
                            >

                              {normalizedTrend}

                            </span>

                          </span>

                        </td>

                      </tr>

                    );

                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan={
                      5
                    }
                    className="
                      py-10
                      text-center
                      text-xs
                      text-slate-400
                    "
                  >

                    Data ramalan tidak tersedia untuk filter yang dipilih.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* =================================================
            PAGINATION
            ================================================= */}

        {totalPages > 1 && (

          <div
            className="
              mt-4

              flex
              items-center
              justify-between

              border-t
              border-slate-100

              pt-4
            "
          >

            {/* PREVIOUS */}

            <button
              type="button"
              disabled={
                currentPage ===
                1
              }
              onClick={
                () =>
                  setCurrentPage(
                    (
                      page
                    ) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
              }
              className="
                cursor-pointer

                rounded-lg
                border
                border-slate-200
                bg-white

                px-3
                py-1.5

                text-xs
                font-medium
                text-slate-700

                transition

                hover:bg-slate-50

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              ← Sebelumnya

            </button>


            {/* PAGE NUMBERS */}

            <div
              className="
                flex
                items-center
                gap-1
              "
            >

              {Array.from(
                {
                  length:
                    totalPages,
                },
                (
                  _,
                  index
                ) =>
                  index + 1
              ).map(
                (
                  pageNumber
                ) => (

                  <button
                    key={
                      pageNumber
                    }
                    type="button"
                    onClick={
                      () =>
                        setCurrentPage(
                          pageNumber
                        )
                    }
                    className={`
                      flex
                      h-8
                      min-w-8
                      cursor-pointer
                      items-center
                      justify-center

                      rounded-md

                      px-2

                      font-mono
                      text-xs
                      font-semibold

                      transition

                      ${
                        currentPage ===
                        pageNumber
                          ? `
                            bg-[#0F8A78]
                            text-white
                          `
                          : `
                            border
                            border-slate-200
                            bg-white
                            text-slate-600

                            hover:border-emerald-200
                            hover:bg-emerald-50
                            hover:text-[#0F8A78]
                          `
                      }
                    `}
                  >

                    {pageNumber}

                  </button>

                )
              )}

            </div>


            {/* NEXT */}

            <button
              type="button"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={
                () =>
                  setCurrentPage(
                    (
                      page
                    ) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
              }
              className="
                cursor-pointer

                rounded-lg
                border
                border-slate-200
                bg-white

                px-3
                py-1.5

                text-xs
                font-medium
                text-slate-700

                transition

                hover:bg-slate-50

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              Selanjutnya →

            </button>

          </div>

        )}

      </section>

    </div>

  );

};