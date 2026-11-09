import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Commodity,
  ActualVsPredictedRecord,
} from '../../types.ts';

import {
  SimpleLineChart,
} from '../common/SimpleLineChart.tsx';

import {
  MetricCard,
} from '../common/MetricCard.tsx';

import {
  GitCommit,
  CheckCircle,
  Download,
  AlertCircle,
} from 'lucide-react';


/* =========================================================
   PROPS
   ========================================================= */

interface ActualVsPredictedViewProps {
  commodities: Commodity[];
  actualVsPredictedData: ActualVsPredictedRecord[];
  initialCommodityId?: string;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export const ActualVsPredictedView:
React.FC<ActualVsPredictedViewProps> = ({
  commodities,
  actualVsPredictedData,
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
    tablePage,
    setTablePage,
  ] = useState<number>(1);


  const tablePageSize = 10;


  /* =======================================================
     SYNC SELECTED COMMODITY
     ======================================================= */

  useEffect(() => {

    if (
      commodities.length === 0
    ) {
      return;
    }


    const selectedExists =
      commodities.some(
        (
          commodity
        ) =>
          commodity.id ===
          selectedCommodityId
      );


    if (
      selectedExists
    ) {
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
     RESET PAGE WHEN COMMODITY CHANGES
     ======================================================= */

  useEffect(() => {

    setTablePage(1);

  }, [
    selectedCommodityId,
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
     TEST RECORDS
     ======================================================= */

  const records =
    useMemo(() => {

      return actualVsPredictedData
        .filter(
          (
            record
          ) =>
            record.commodityId ===
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
      actualVsPredictedData,
      selectedCommodityId,
    ]);


  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalTablePages =
    Math.ceil(
      records.length /
      tablePageSize
    ) || 1;


  const paginatedRecords =
    useMemo(() => {

      const startIndex =
        (
          tablePage -
          1
        ) *
        tablePageSize;


      return records.slice(
        startIndex,
        startIndex +
          tablePageSize
      );

    }, [
      records,
      tablePage,
    ]);


  useEffect(() => {

    if (
      tablePage >
      totalTablePages
    ) {

      setTablePage(
        totalTablePages
      );

    }

  }, [
    tablePage,
    totalTablePages,
  ]);


  /* =======================================================
     FORMATTERS
     ======================================================= */

  const formatPrice =
    (
      value: number
    ) => {

      return Number(
        value
      ).toLocaleString(
        'id-ID',
        {
          minimumFractionDigits:
            2,

          maximumFractionDigits:
            2,
        }
      );

    };


  const formatPriceTable =
    (
      value: number
    ) => {

      return Number(
        value
      ).toLocaleString(
        'id-ID',
        {
          maximumFractionDigits:
            2,
        }
      );

    };


  const formatDateLong =
    (
      dateString: string
    ) => {

      if (
        !dateString
      ) {
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
     TEST PERIOD
     ======================================================= */

  const testPeriod =
    useMemo(() => {

      if (
        records.length === 0
      ) {

        return {
          start: '',
          end: '',
        };

      }


      return {

        start:
          records[0].date,

        end:
          records[
            records.length -
            1
          ].date,

      };

    }, [
      records,
    ]);


  /* =======================================================
     METRICS
     ======================================================= */

  const metrics =
    useMemo(() => {

      if (
        records.length === 0
      ) {

        return {
          mae: 0,
          rmse: 0,
          mape: 0,
          count: 0,
        };

      }


      let sumAbsoluteError = 0;
      let sumSquaredError = 0;
      let sumPercentageError = 0;
      let validMapeCount = 0;


      records.forEach(
        (
          record
        ) => {

          const actual =
            Number(
              record.actualPrice
            );


          const predicted =
            Number(
              record.predictedPrice
            );


          const error =
            predicted -
            actual;


          const absoluteError =
            Math.abs(
              error
            );


          sumAbsoluteError +=
            absoluteError;


          sumSquaredError +=
            error *
            error;


          if (
            actual !== 0
          ) {

            sumPercentageError +=
              (
                absoluteError /
                Math.abs(
                  actual
                )
              ) *
              100;


            validMapeCount +=
              1;

          }

        }
      );


      const count =
        records.length;


      return {

        mae:
          sumAbsoluteError /
          count,


        rmse:
          Math.sqrt(
            sumSquaredError /
            count
          ),


        mape:
          validMapeCount >
          0
            ? sumPercentageError /
              validMapeCount
            : 0,


        count,

      };

    }, [
      records,
    ]);


  /* =======================================================
     CHART DATA
     ======================================================= */

  const chartLabels =
    useMemo(() => {

      return records.map(
        (
          record
        ) => {

          const [
            year,
            month,
            day,
          ] =
            record.date.split(
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
      records,
    ]);


  const actualSeries =
    useMemo(() => {

      return records.map(
        (
          record
        ) =>
          Number(
            record.actualPrice
          )
      );

    }, [
      records,
    ]);


  const predictedSeries =
    useMemo(() => {

      return records.map(
        (
          record
        ) =>
          Number(
            record.predictedPrice
          )
      );

    }, [
      records,
    ]);


  /* =======================================================
     EXPORT CSV
     ======================================================= */

  const handleExportCSV =
    () => {

      const headers = [
        'Tanggal',
        'Minggu',
        'Harga Aktual (Rp)',
        'Prediksi LSTM (Rp)',
        'Selisih (Rp)',
        'Selisih (%)',
      ];


      const rows =
        records.map(
          (
            record
          ) => [

            record.date,

            `"${record.weekLabel}"`,

            record.actualPrice,

            record.predictedPrice,

            record.difference,

            record.differencePercent,

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
        `aktual_vs_prediksi_${selectedCommodityId}_2026.csv`
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

        Data aktual dan prediksi belum tersedia.

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

              Aktual vs Prediksi Model LSTM

            </h1>


            <p
              className="
                mt-1
                text-xs
                leading-relaxed
                text-slate-500
              "
            >

              Perbandingan harga aktual PIHPS Maluku dengan
              hasil prediksi satu minggu ke depan menggunakan
              model LSTM.

            </p>

          </div>


          {/* EXPORT */}

          <button
            type="button"
            onClick={
              handleExportCSV
            }
            disabled={
              records.length === 0
            }
            className="
              flex
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

              transition

              hover:bg-slate-200

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


            Export CSV

          </button>

        </div>


        {/* =================================================
            COMMODITY SELECTOR
            ================================================= */}

        <div
          className="
            mt-4
          "
        >

          <div
            className="
              w-full
              sm:w-80
            "
          >

            <label
              htmlFor="comm-select-avp"
              className="
                mb-1
                block
                text-xs
                font-medium
                text-slate-600
              "
            >

              Pilih Komoditas Pengujian:

            </label>


            <select
              id="comm-select-avp"
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

        </div>

      </section>


      {/* =================================================
          METRIC CARDS
          ================================================= */}

      <section
        className="
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-3
        "
      >

        <MetricCard
          label="MAE (Mean Absolute Error)"
          value={
            `Rp ${formatPrice(
              metrics.mae
            )}`
          }
          subtext="Rata-rata nilai absolut kesalahan prediksi"
          secondaryText={
            `${metrics.count} Observasi Uji`
          }
          icon={

            <GitCommit
              className="
                h-4
                w-4
                text-sky-600
              "
            />

          }
        />


        <MetricCard
          label="RMSE (Root Mean Squared Error)"
          value={
            `Rp ${formatPrice(
              metrics.rmse
            )}`
          }
          subtext="Akar rata-rata kuadrat kesalahan prediksi"
          secondaryText={
            activeCommodity.unit
          }
          icon={

            <AlertCircle
              className="
                h-4
                w-4
                text-amber-600
              "
            />

          }
        />


        <MetricCard
          label="MAPE (Mean Absolute Percentage Error)"
          value={
            `${metrics.mape.toLocaleString(
              'id-ID',
              {
                minimumFractionDigits:
                  2,

                maximumFractionDigits:
                  2,
              }
            )}%`
          }
          subtext="Rata-rata kesalahan absolut dalam persentase"
          secondaryText="Skala Persentase"
          icon={

            <CheckCircle
              className="
                h-4
                w-4
                text-emerald-600
              "
            />

          }
        />

      </section>


      {/* =================================================
          COMPARISON CHART
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

        {/* CHART HEADER */}

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

              Grafik Komparasi: Aktual vs Prediksi LSTM ({activeCommodity.name})

            </h2>


            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
              "
            >

              {metrics.count} observasi uji

              {testPeriod.start &&
              testPeriod.end
                ? (
                  <>
                    {' · '}

                    {formatDateLong(
                      testPeriod.start
                    )}

                    {' – '}

                    {formatDateLong(
                      testPeriod.end
                    )}
                  </>
                )
                : null}

            </p>

          </div>


          <div
            className="
              font-mono
              text-xs
              text-slate-400
            "
          >

            Prediksi 1 Minggu ke Depan

          </div>

        </div>


        <SimpleLineChart
          labels={
            chartLabels
          }
          series={[
            {

              id:
                'actual-series',

              name:
                'Harga Aktual (PIHPS)',

              color:
                '#097B27',

              data:
                actualSeries,

              dashed:
                false,

            },

            {

              id:
                'predicted-series',

              name:
                'Hasil Prediksi LSTM',

              color:
                '#E11D48',

              data:
                predictedSeries,

              dashed:
                true,

            },
          ]}
          height={
            330
          }
          yAxisLabel={
            `Harga ${activeCommodity.name} (${activeCommodity.unit})`
          }
        />

      </section>


      {/* =================================================
          COMPARISON TABLE
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

              Tabel Perbandingan Aktual vs Prediksi Mingguan

            </h2>


            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
              "
            >

              Nilai aktual, hasil prediksi LSTM,
              serta selisih pada setiap observasi periode uji.

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

              {paginatedRecords.length} dari {records.length} Baris Uji

            </div>


            <div
              className="
                mt-0.5
                text-[10px]
                text-slate-400
              "
            >

              Halaman {tablePage} dari {totalTablePages}

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
                  text-slate-600
                "
              >

                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >
                  Tanggal
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >
                  Observasi
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    text-right
                    font-semibold
                  "
                >
                  Harga Aktual (Rp)
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    text-right
                    font-semibold
                  "
                >
                  Prediksi LSTM (Rp)
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    text-right
                    font-semibold
                  "
                >
                  Selisih (Rp)
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    text-right
                    font-semibold
                  "
                >
                  Selisih (%)
                </th>

              </tr>

            </thead>


            <tbody
              className="
                divide-y
                divide-slate-100
              "
            >

              {paginatedRecords.length >
              0 ? (

                paginatedRecords.map(
                  (
                    row,
                    index
                  ) => {

                    const actual =
                      Number(
                        row.actualPrice
                      );


                    const predicted =
                      Number(
                        row.predictedPrice
                      );


                    const difference =
                      predicted -
                      actual;


                    const differencePercent =
                      actual !== 0
                        ? (
                            difference /
                            actual
                          ) *
                          100
                        : 0;


                    return (

                      <tr
                        key={
                          `${row.date}-${index}`
                        }
                        className="
                          transition-colors
                          hover:bg-slate-50/60
                        "
                      >

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


                        {/* OBSERVATION */}

                        <td
                          className="
                            px-3
                            py-2.5
                            text-slate-500
                          "
                        >

                          {row.weekLabel}

                        </td>


                        {/* ACTUAL */}

                        <td
                          className="
                            px-3
                            py-2.5

                            text-right

                            font-mono
                            font-semibold
                            tabular-nums

                            text-[#097B27]
                          "
                        >

                          Rp{' '}

                          {formatPriceTable(
                            actual
                          )}

                        </td>


                        {/* PREDICTION */}

                        <td
                          className="
                            px-3
                            py-2.5

                            text-right

                            font-mono
                            font-semibold
                            tabular-nums

                            text-rose-600
                          "
                        >

                          Rp{' '}

                          {formatPriceTable(
                            predicted
                          )}

                        </td>


                        {/* DIFFERENCE */}

                        <td
                          className="
                            px-3
                            py-2.5

                            text-right

                            font-mono
                            font-medium
                            tabular-nums

                            text-slate-700
                          "
                        >

                          {difference > 0
                            ? '+'
                            : ''}

                          Rp{' '}

                          {formatPriceTable(
                            difference
                          )}

                        </td>


                        {/* DIFFERENCE PERCENT */}

                        <td
                          className="
                            px-3
                            py-2.5

                            text-right

                            font-mono
                            font-semibold
                            tabular-nums

                            text-slate-700
                          "
                        >

                          {differencePercent > 0
                            ? '+'
                            : ''}

                          {differencePercent.toLocaleString(
                            'id-ID',
                            {
                              minimumFractionDigits:
                                2,

                              maximumFractionDigits:
                                2,
                            }
                          )}

                          %

                        </td>

                      </tr>

                    );

                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan={
                      6
                    }
                    className="
                      py-10
                      text-center
                      text-xs
                      text-slate-400
                    "
                  >

                    Data aktual dan prediksi belum tersedia.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* =================================================
            PAGINATION
            ================================================= */}

        {totalTablePages > 1 && (

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
                tablePage === 1
              }
              onClick={
                () =>
                  setTablePage(
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
                gap-1.5
              "
            >

              {Array.from(
                {
                  length:
                    totalTablePages,
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
                        setTablePage(
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
                        tablePage ===
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

                            hover:bg-slate-50
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
                tablePage ===
                totalTablePages
              }
              onClick={
                () =>
                  setTablePage(
                    (
                      page
                    ) =>
                      Math.min(
                        totalTablePages,
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