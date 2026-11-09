import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Commodity,
  PriceRecord,
} from '../../types.ts';

import {
  SimpleLineChart,
} from '../common/SimpleLineChart.tsx';

import {
  MetricCard,
} from '../common/MetricCard.tsx';

import {
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
} from 'lucide-react';


interface HistoricalPricesViewProps {
  commodities: Commodity[];
  historicalPrices: PriceRecord[];
  initialCommodityId?: string;
}


export const HistoricalPricesView:
React.FC<HistoricalPricesViewProps> = ({
  commodities,
  historicalPrices,
  initialCommodityId,
}) => {

  /* ======================================================
     STATE
     ====================================================== */

  const [
    selectedCommodityId,
    setSelectedCommodityId,
  ] = useState<string>(
    initialCommodityId || ''
  );


  const [
    selectedPeriod,
    setSelectedPeriod,
  ] = useState<string>(
    'all'
  );


  const [
    searchQuery,
    setSearchQuery,
  ] = useState<string>(
    ''
  );


  const [
    currentPage,
    setCurrentPage,
  ] = useState<number>(
    1
  );


  const pageSize =
    15;


  /* ======================================================
     SINKRONISASI KOMODITAS
     ====================================================== */

  useEffect(() => {

    if (
      commodities.length === 0
    ) {
      return;
    }


    const selectedStillExists =
      commodities.some(
        (
          commodity
        ) =>
          commodity.id ===
          selectedCommodityId
      );


    if (
      !selectedStillExists
    ) {

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

    }

  }, [
    commodities,
    initialCommodityId,
    selectedCommodityId,
  ]);


  /* ======================================================
     KOMODITAS AKTIF
     ====================================================== */

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


  /* ======================================================
     FORMAT TANGGAL
     ====================================================== */

  const formatDateIndonesia =
    (
      dateString: string
    ) => {

      if (
        !dateString
      ) {
        return '-';
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


  const formatMonthYear =
    (
      dateString: string
    ) => {

      if (
        !dateString
      ) {
        return '-';
      }


      return new Date(
        `${dateString}T00:00:00`
      ).toLocaleDateString(
        'id-ID',
        {
          month:
            'short',

          year:
            'numeric',
        }
      );

    };


  /* ======================================================
     SELURUH DATA KOMODITAS TERPILIH
     ====================================================== */

  const selectedCommodityRecords =
    useMemo(() => {

      return historicalPrices
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
      historicalPrices,
      selectedCommodityId,
    ]);


  /* ======================================================
     LABEL PERIODE DATA
     ====================================================== */

  const allPeriodLabel =
    useMemo(() => {

      if (
        selectedCommodityRecords.length ===
        0
      ) {

        return (
          'Semua Periode'
        );

      }


      const first =
        selectedCommodityRecords[0];


      const last =
        selectedCommodityRecords[
          selectedCommodityRecords.length -
          1
        ];


      return (
        `Semua Periode (` +
        `${formatMonthYear(
          first.date
        )} – ` +
        `${formatMonthYear(
          last.date
        )})`
      );

    }, [
      selectedCommodityRecords,
    ]);


  /* ======================================================
     FILTER DATA
     ====================================================== */

  const filteredRecords =
    useMemo(() => {

      let records =
        [
          ...selectedCommodityRecords,
        ];


      if (
        selectedPeriod ===
        '2023'
      ) {

        records =
          records.filter(
            (
              record
            ) =>
              record.date.startsWith(
                '2023'
              )
          );

      } else if (
        selectedPeriod ===
        '2024'
      ) {

        records =
          records.filter(
            (
              record
            ) =>
              record.date.startsWith(
                '2024'
              )
          );

      } else if (
        selectedPeriod ===
        '2025'
      ) {

        records =
          records.filter(
            (
              record
            ) =>
              record.date.startsWith(
                '2025'
              )
          );

      } else if (
        selectedPeriod ===
        '2026'
      ) {

        records =
          records.filter(
            (
              record
            ) =>
              record.date.startsWith(
                '2026'
              )
          );

      } else if (
        selectedPeriod ===
        'last6m'
      ) {

        if (
          records.length >
          0
        ) {

          const lastRecord =
            records[
              records.length -
              1
            ];


          const endDate =
            new Date(
              `${lastRecord.date}T00:00:00`
            );


          const startDate =
            new Date(
              endDate
            );


          startDate.setDate(
            startDate.getDate() -
            26 * 7
          );


          records =
            records.filter(
              (
                record
              ) => {

                const recordDate =
                  new Date(
                    `${record.date}T00:00:00`
                  );


                return (
                  recordDate >=
                    startDate &&
                  recordDate <=
                    endDate
                );

              }
            );

        }

      }


      if (
        searchQuery.trim()
      ) {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        records =
          records.filter(
            (
              record
            ) =>
              record.date
                .toLowerCase()
                .includes(
                  query
                ) ||

              Number(
                record.price
              )
                .toString()
                .includes(
                  query
                )
          );

      }


      return records;

    }, [
      selectedCommodityRecords,
      selectedPeriod,
      searchQuery,
    ]);


  /* ======================================================
     STATISTIK
     ====================================================== */

  const stats =
    useMemo(() => {

      if (
        filteredRecords.length ===
        0
      ) {

        return {
          latest:
            0,

          highest:
            0,

          lowest:
            0,

          average:
            0,

          latestDate:
            '',
        };

      }


      const prices =
        filteredRecords.map(
          (
            record
          ) =>
            Number(
              record.price
            )
        );


      const latestRecord =
        filteredRecords[
          filteredRecords.length -
          1
        ];


      const highest =
        Math.max(
          ...prices
        );


      const lowest =
        Math.min(
          ...prices
        );


      const average =
        Math.round(

          prices.reduce(
            (
              total,
              price
            ) =>
              total +
              price,
            0
          ) /
          prices.length

        );


      return {

        latest:
          Number(
            latestRecord.price
          ),

        highest,

        lowest,

        average,

        latestDate:
          latestRecord.date,

      };

    }, [
      filteredRecords,
    ]);


  /* ======================================================
     DATA GRAFIK
     SELURUH OBSERVASI DIGUNAKAN
     ====================================================== */

  const chartData =
    useMemo(() => {

      return {

        labels:
          filteredRecords.map(
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
          ),


        data:
          filteredRecords.map(
            (
              record
            ) =>
              Number(
                record.price
              )
          ),

      };

    }, [
      filteredRecords,
    ]);


  /* ======================================================
     PAGINATION
     ====================================================== */

  const totalPages =
    Math.ceil(
      filteredRecords.length /
      pageSize
    ) || 1;


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


  /* ======================================================
     RESET PAGE WHEN FILTER CHANGES
     ====================================================== */

  useEffect(() => {

    setCurrentPage(
      1
    );

  }, [
    selectedCommodityId,
    selectedPeriod,
    searchQuery,
  ]);


  /* ======================================================
     DATA TABEL
     TERBARU → TERLAMA
     ====================================================== */

  const paginatedRecords =
    useMemo(() => {

      const reversed =
        [
          ...filteredRecords,
        ].reverse();


      const startIndex =
        (
          currentPage -
          1
        ) *
        pageSize;


      return reversed.slice(

        startIndex,

        startIndex +
          pageSize

      );

    }, [
      filteredRecords,
      currentPage,
    ]);


  /* ======================================================
     NOMOR PAGINATION
     ====================================================== */

  const visiblePageCount =
    Math.min(
      5,
      totalPages
    );


  const maxStartPage =
    Math.max(

      1,

      totalPages -
        visiblePageCount +
        1

    );


  const startPage =
    Math.min(

      Math.max(

        1,

        currentPage -
          Math.floor(
            visiblePageCount /
            2
          )

      ),

      maxStartPage

    );


  const visiblePages =
    Array.from(
      {
        length:
          visiblePageCount,
      },
      (
        _,
        index
      ) =>
        startPage +
        index
    );


  /* ======================================================
     EXPORT CSV
     ====================================================== */

  const handleExportCSV =
    () => {

      const headers = [
        'ID',
        'Tanggal',
        'Komoditas',
        'Harga (Rp)',
        'Satuan',
        'Sumber Data',
      ];


      const rows =
        filteredRecords.map(
          (
            record
          ) => [

            record.id,

            record.date,

            `"${record.commodityName}"`,

            record.price,

            record.unit,

            `"${record.source}"`,

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
        `pihps_maluku_${selectedCommodityId}_${selectedPeriod}.csv`
      );


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );

    };


  /* ======================================================
     EMPTY STATE
     ====================================================== */

  if (
    commodities.length ===
    0
  ) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-8
          text-center
          text-sm
          text-slate-500
        "
      >

        Data komoditas belum tersedia.

      </div>

    );

  }


  /* ======================================================
     RENDER
     ====================================================== */

  return (

    <div
      className="
        space-y-6
        pb-12
      "
    >

      {/* =================================================
          TITLE + FILTER
          ================================================= */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-xs
        "
      >

        {/* HEADER */}

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

              Harga Historis Komoditas Pangan

            </h1>


            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >

              Catatan pergerakan harga mingguan Pusat Informasi Harga Pangan Strategis (PIHPS) Maluku.

            </p>

          </div>


          {/* EXPORT */}

          <button
            type="button"
            onClick={
              handleExportCSV
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

              transition-colors

              hover:bg-slate-200/80
            "
          >

            <Download
              className="
                h-3.5
                w-3.5
              "
            />


            <span>
              Export CSV
            </span>

          </button>

        </div>


        {/* =================================================
            FILTER
            ================================================= */}

        <div
          className="
            mt-4

            grid
            grid-cols-1
            gap-3

            sm:grid-cols-2
            lg:grid-cols-3
          "
        >

          {/* KOMODITAS */}

          <div>

            <label
              htmlFor="comm-select"
              className="
                mb-1
                block

                text-xs
                font-medium
                text-slate-600
              "
            >

              Pilih Komoditas ({commodities.length} Bahan Pangan):

            </label>


            <select
              id="comm-select"
              value={
                selectedCommodityId
              }
              onChange={
                (
                  event
                ) => {

                  setSelectedCommodityId(
                    event.target.value
                  );

                  setCurrentPage(
                    1
                  );

                  setSearchQuery(
                    ''
                  );

                }
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


          {/* PERIODE */}

          <div>

            <label
              htmlFor="period-select"
              className="
                mb-1
                block

                text-xs
                font-medium
                text-slate-600
              "
            >

              Filter Rentang Periode Data:

            </label>


            <select
              id="period-select"
              value={
                selectedPeriod
              }
              onChange={
                (
                  event
                ) => {

                  setSelectedPeriod(
                    event.target.value
                  );

                  setCurrentPage(
                    1
                  );

                }
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

              <option
                value="all"
              >
                {allPeriodLabel}
              </option>


              <option
                value="last6m"
              >
                26 Minggu Terakhir
              </option>


              <option
                value="2026"
              >
                Tahun 2026
              </option>


              <option
                value="2025"
              >
                Tahun 2025
              </option>


              <option
                value="2024"
              >
                Tahun 2024
              </option>


              <option
                value="2023"
              >
                Tahun 2023
              </option>

            </select>

          </div>


          {/* SEARCH */}

          <div>

            <label
              htmlFor="search-input"
              className="
                mb-1
                block

                text-xs
                font-medium
                text-slate-600
              "
            >

              Pencarian Tanggal / Harga:

            </label>


            <div
              className="
                relative
              "
            >

              <Search
                className="
                  absolute
                  left-3
                  top-1/2

                  h-3.5
                  w-3.5

                  -translate-y-1/2

                  text-slate-400
                "
              />


              <input
                id="search-input"
                type="text"
                placeholder="Contoh: 2026-08 atau 15000"
                value={
                  searchQuery
                }
                onChange={
                  (
                    event
                  ) => {

                    setSearchQuery(
                      event.target.value
                    );

                    setCurrentPage(
                      1
                    );

                  }
                }
                className="
                  w-full

                  rounded-lg
                  border
                  border-slate-300
                  bg-white

                  py-2
                  pl-9
                  pr-3

                  text-xs
                  text-slate-800

                  shadow-2xs

                  placeholder:text-slate-400

                  focus:border-[#0F8A78]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          STATISTICS
          ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-2
          lg:grid-cols-4
        "
      >

        <MetricCard
          label="Harga Terbaru"
          value={
            `Rp ${stats.latest.toLocaleString(
              'id-ID'
            )}`
          }
          subtext={
            stats.latestDate
              ? `Per ${formatDateIndonesia(
                  stats.latestDate
                )}`
              : '-'
          }
          secondaryText={
            activeCommodity?.name ||
            '-'
          }
          icon={

            <DollarSign
              className="
                h-4
                w-4
                text-emerald-600
              "
            />

          }
        />


        <MetricCard
          label="Harga Tertinggi"
          value={
            `Rp ${stats.highest.toLocaleString(
              'id-ID'
            )}`
          }
          subtext="Puncak harga pada periode terpilih"
          secondaryText="Maksimal"
          icon={

            <TrendingUp
              className="
                h-4
                w-4
                text-rose-600
              "
            />

          }
        />


        <MetricCard
          label="Harga Terendah"
          value={
            `Rp ${stats.lowest.toLocaleString(
              'id-ID'
            )}`
          }
          subtext="Harga terendah pada periode terpilih"
          secondaryText="Minimal"
          icon={

            <TrendingDown
              className="
                h-4
                w-4
                text-emerald-600
              "
            />

          }
        />


        <MetricCard
          label="Harga Rata-Rata"
          value={
            `Rp ${stats.average.toLocaleString(
              'id-ID'
            )}`
          }
          subtext={
            `Berdasarkan ${filteredRecords.length} titik data`
          }
          secondaryText="Mean"
          icon={

            <Activity
              className="
                h-4
                w-4
                text-sky-600
              "
            />

          }
        />

      </div>


      {/* =================================================
          CHART
          ================================================= */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-xs
        "
      >

        {/* CHART HEADER */}

        <div
          className="
            mb-4

            flex
            items-center
            justify-between

            border-b
            border-slate-100

            pb-3
          "
        >

          <div>

            <h3
              className="
                text-base
                font-bold
                text-slate-900
              "
            >

              Grafik Tren Harga Historis — {activeCommodity?.name}

            </h3>


            <p
              className="
                text-xs
                text-slate-500
              "
            >

              Satuan: {activeCommodity?.unit || 'Rp/kg'}
              {' · '}
              Frekuensi Mingguan

            </p>

          </div>


          <div
            className="
              font-mono
              text-xs
              text-slate-400
            "
          >

            {filteredRecords.length} observasi mingguan

          </div>

        </div>


        {/* FULL DATA CHART */}

        <SimpleLineChart
          labels={
            chartData.labels
          }
          series={[
            {

              id:
                'hist-series',

              name:
                `Harga Historis (${activeCommodity?.name || '-'})`,

              color:
                '#097B27',

              data:
                chartData.data,

              dashed:
                false,

            },
          ]}
          height={
            320
          }
          yAxisLabel={
            `Harga (${activeCommodity?.unit || 'Rp/kg'})`
          }
        />

      </div>


      {/* =================================================
          TABLE
          ================================================= */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-xs
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

            <h3
              className="
                text-base
                font-bold
                text-slate-900
              "
            >

              Tabel Catatan Harga Mingguan

            </h3>


            <p
              className="
                text-xs
                text-slate-500
              "
            >

              Menampilkan {paginatedRecords.length} dari {filteredRecords.length} baris data

            </p>

          </div>


          <div
            className="
              font-mono
              text-xs
              text-slate-500
            "
          >

            Halaman {currentPage} dari {totalPages}

          </div>

        </div>


        {/* TABLE */}

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
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
                  No
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >
                  Tanggal (Minggu)
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >
                  Komoditas
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    text-right
                    font-semibold
                  "
                >
                  Harga (Rp)
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >
                  Satuan
                </th>


                <th
                  className="
                    px-3
                    py-2.5
                    font-semibold
                  "
                >
                  Sumber Data
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
                    record,
                    index
                  ) => {

                    const globalIndex =
                      (
                        currentPage -
                        1
                      ) *
                        pageSize +
                      index +
                      1;


                    return (

                      <tr
                        key={
                          record.id
                        }
                        className="
                          transition-colors
                          hover:bg-slate-50/60
                        "
                      >

                        <td
                          className="
                            px-3
                            py-2.5

                            font-mono
                            tabular-nums
                            text-slate-400
                          "
                        >

                          {globalIndex}

                        </td>


                        <td
                          className="
                            px-3
                            py-2.5

                            font-mono
                            font-medium
                            text-slate-900
                          "
                        >

                          {record.date}

                        </td>


                        <td
                          className="
                            px-3
                            py-2.5
                            text-slate-700
                          "
                        >

                          {record.commodityName}

                        </td>


                        <td
                          className="
                            px-3
                            py-2.5

                            text-right

                            font-mono
                            font-semibold
                            tabular-nums
                            text-slate-900
                          "
                        >

                          Rp{' '}

                          {Number(
                            record.price
                          ).toLocaleString(
                            'id-ID'
                          )}

                        </td>


                        <td
                          className="
                            px-3
                            py-2.5
                            text-slate-500
                          "
                        >

                          {record.unit}

                        </td>


                        <td
                          className="
                            px-3
                            py-2.5

                            text-[11px]
                            text-slate-500
                          "
                        >

                          {record.source}

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
                      py-8
                      text-center
                      text-xs
                      text-slate-400
                    "
                  >

                    Tidak ada catatan data harga yang sesuai dengan filter pencarian.

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

              pt-3
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
                        page -
                          1
                      )
                  )
              }
              className="
                cursor-pointer

                rounded-lg
                border
                border-slate-200

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

              {visiblePages.map(
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
                      font-medium

                      transition

                      ${
                        currentPage ===
                        pageNumber
                          ? `
                            bg-[#0F8A78]
                            text-white
                          `
                          : `
                            text-slate-600
                            hover:bg-slate-100
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
                        page +
                          1
                      )
                  )
              }
              className="
                cursor-pointer

                rounded-lg
                border
                border-slate-200

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

      </div>

    </div>

  );

};