import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Commodity,
  PriceRecord,
  PublicNavTab,
} from '../../types.ts';

import {
  SimpleLineChart,
} from '../common/SimpleLineChart.tsx';

import {
  BarChart3,
  ChevronRight,
  Clock3,
  Database,
  Layers3,
  LineChart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';


/* =========================================================
   PROPS
   ========================================================= */

interface PublicDashboardProps {
  commodities: Commodity[];
  historicalPrices: PriceRecord[];

  onNavigate:
    (tab: PublicNavTab) => void;

  onSelectCommodityForHistory:
    (commodityId: string) => void;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export const PublicDashboard:
React.FC<PublicDashboardProps> = ({
  commodities,
  historicalPrices,
  onNavigate,
  onSelectCommodityForHistory,
}) => {

  /* =======================================================
     SELECTED COMMODITY
     ======================================================= */

  const [
    selectedCommodityId,
    setSelectedCommodityId,
  ] = useState<string>('');


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


    if (!exists) {

      setSelectedCommodityId(
        commodities[0].id
      );

    }

  }, [
    commodities,
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
     ACTIVE HISTORICAL DATA
     ======================================================= */

  const activeHistory =
    useMemo(() => {

      if (
        !activeCommodity
      ) {
        return [];
      }


      return historicalPrices
        .filter(
          (
            record
          ) =>
            record.commodityId ===
            activeCommodity.id
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
      activeCommodity,
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
          maximumFractionDigits:
            2,
        }
      );

    };


  const formatShortDate =
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
            '2-digit',

          month:
            'short',

          year:
            'numeric',
        }
      );

    };


  const formatLongDate =
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
     HISTORICAL SUMMARY
     ======================================================= */

  const historicalSummary =
    useMemo(() => {

      if (
        activeHistory.length ===
        0
      ) {

        return {
          count:
            0,

          min:
            0,

          max:
            0,

          average:
            0,
        };

      }


      const values =
        activeHistory.map(
          (
            record
          ) =>
            Number(
              record.price
            )
        );


      const total =
        values.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value,
          0
        );


      return {

        count:
          values.length,

        min:
          Math.min(
            ...values
          ),

        max:
          Math.max(
            ...values
          ),

        average:
          total /
          values.length,

      };

    }, [
      activeHistory,
    ]);


  /* =======================================================
     CHART DATA
     26 MINGGU TERAKHIR
     ======================================================= */

  const chartData =
    useMemo(() => {

      if (
        activeHistory.length ===
        0
      ) {

        return {
          labels:
            [] as string[],

          data:
            [] as number[],

          startDate:
            '',

          endDate:
            '',
        };

      }


      const lastRecord =
        activeHistory[
          activeHistory.length -
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


      const recent =
        activeHistory.filter(
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


      return {

        labels:
          recent.map(
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
          recent.map(
            (
              record
            ) =>
              Number(
                record.price
              )
          ),


        startDate:
          recent[0]?.date ||
          '',


        endDate:
          recent[
            recent.length -
            1
          ]?.date ||
          '',

      };

    }, [
      activeHistory,
    ]);


  /* =======================================================
     EMPTY STATE
     ======================================================= */

  if (
    commodities.length ===
      0 ||
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

        Data dashboard belum tersedia.

      </div>

    );

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div
      className="
        space-y-5
        pb-8
      "
    >

      {/* =================================================
          DASHBOARD HEADER
          ================================================= */}

      <header
        className="
          border-b
          border-slate-200
          pb-4
        "
      >

        <h1
          className="
            text-xl
            font-bold
            tracking-tight
            text-slate-900

            sm:text-2xl
          "
        >

          Dashboard Prediksi Harga Pangan Provinsi Maluku

        </h1>


        <p
          className="
            mt-1
            max-w-2xl
            text-sm
            leading-relaxed
            text-slate-500
          "
        >

          Ringkasan harga mingguan,
          evaluasi model LSTM,
          dan ramalan harga pangan.

        </p>

      </header>


      {/* =================================================
          KPI CARDS
          ================================================= */}

      <section
        className="
          grid
          grid-cols-2
          gap-3

          md:grid-cols-3
          xl:grid-cols-5
        "
      >

        <DashboardStatCard
          label="Komoditas"
          value={
            `${commodities.length}`
          }
          helper="Komoditas pangan"
          icon={

            <Layers3
              className="
                h-4
                w-4
              "
            />

          }
        />


        <DashboardStatCard
          label="Observasi"
          value={
            `${historicalSummary.count}`
          }
          helper="Per komoditas"
          icon={

            <Database
              className="
                h-4
                w-4
              "
            />

          }
        />


        <DashboardStatCard
          label="Frekuensi"
          value="Mingguan"
          helper="Data harga PIHPS"
          icon={

            <Clock3
              className="
                h-4
                w-4
              "
            />

          }
        />


        <DashboardStatCard
          label="Data Uji"
          value="30"
          helper="Per komoditas"
          icon={

            <BarChart3
              className="
                h-4
                w-4
              "
            />

          }
        />


        <DashboardStatCard
          label="Ramalan"
          value="18"
          helper="Minggu / komoditas"
          icon={

            <TrendingUp
              className="
                h-4
                w-4
              "
            />

          }
        />

      </section>


      {/* =================================================
          MAIN GRID
          ================================================= */}

      <section
        className="
          grid
          grid-cols-1
          gap-4

          xl:grid-cols-12
        "
      >

        {/* =================================================
            HISTORICAL CHART
            ================================================= */}

        <div
          className="
            overflow-hidden

            rounded-xl
            border
            border-slate-200
            bg-white

            shadow-sm

            xl:col-span-8
          "
        >

          {/* CHART HEADER */}

          <div
            className="
              flex
              flex-col
              gap-3

              border-b
              border-slate-100

              px-5
              py-4

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <h2
                className="
                  text-sm
                  font-bold
                  text-slate-900
                "
              >

                Perkembangan Harga Historis

              </h2>


              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-slate-500
                "
              >

                26 minggu terakhir · {activeCommodity.name}

              </p>

            </div>


            {/* COMMODITY SELECT */}

            <select
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
                min-w-[180px]

                rounded-lg
                border
                border-slate-200
                bg-slate-50

                px-3
                py-2

                text-xs
                font-medium
                text-slate-700

                outline-none
                transition

                focus:border-[#0F8A78]
                focus:bg-white
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

                  </option>

                )
              )}

            </select>

          </div>


          {/* CHART */}

          <div
            className="
              px-4
              py-5
            "
          >

            <SimpleLineChart
              labels={
                chartData.labels
              }
              series={[
                {
                  id:
                    'historical-series',

                  name:
                    `Harga ${activeCommodity.name}`,

                  color:
                    '#097B27',

                  data:
                    chartData.data,
                },
              ]}
              height={
                330
              }
              yAxisLabel={
                `Harga (${activeCommodity.unit})`
              }
            />

          </div>


          {/* CHART FOOTER */}

          <div
            className="
              flex
              flex-col
              gap-2

              border-t
              border-slate-100

              px-5
              py-3

              text-[11px]
              text-slate-500

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <span>

              Periode grafik:{' '}

              <strong
                className="
                  font-medium
                  text-slate-700
                "
              >

                {formatShortDate(
                  chartData.startDate
                )}

                {' – '}

                {formatShortDate(
                  chartData.endDate
                )}

              </strong>

            </span>


            <button
              type="button"
              onClick={
                () =>
                  onSelectCommodityForHistory(
                    activeCommodity.id
                  )
              }
              className="
                inline-flex
                cursor-pointer
                items-center
                gap-1

                font-semibold
                text-[#0F8A78]

                hover:underline
              "
            >

              Lihat harga historis

              <ChevronRight
                className="
                  h-3
                  w-3
                "
              />

            </button>

          </div>

        </div>


        {/* =================================================
            COMMODITY SUMMARY
            ================================================= */}

        <aside
          className="
            overflow-hidden

            rounded-xl
            border
            border-slate-200
            bg-white

            shadow-sm

            xl:col-span-4
          "
        >

          {/* SUMMARY HEADER */}

          <div
            className="
              border-b
              border-slate-100

              px-5
              py-4
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >

                  Ringkasan Komoditas

                </span>


                <h2
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-slate-900
                  "
                >

                  {activeCommodity.name}

                </h2>


                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                  "
                >

                  {activeCommodity.category}

                  {' · '}

                  {activeCommodity.unit}

                </p>

              </div>


              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center

                  rounded-lg

                  bg-emerald-50
                  text-[#0F8A78]
                "
              >

                <LineChart
                  className="
                    h-4
                    w-4
                  "
                />

              </div>

            </div>

          </div>


          {/* CURRENT PRICE */}

          <div
            className="
              border-b
              border-slate-100

              px-5
              py-5
            "
          >

            <span
              className="
                text-[11px]
                text-slate-500
              "
            >

              Harga Terbaru

            </span>


            <div
              className="
                mt-1

                text-3xl
                font-bold
                tracking-tight
                text-slate-950
              "
            >

              Rp{' '}

              {formatPrice(
                activeCommodity.currentPrice
              )}

            </div>


            <div
              className="
                mt-2

                flex
                items-center
                justify-between

                text-xs
              "
            >

              <span
                className="
                  text-slate-500
                "
              >

                {formatLongDate(
                  activeCommodity.lastUpdated
                )}

              </span>


              <PriceChangeBadge
                value={
                  activeCommodity.changePercent
                }
              />

            </div>

          </div>


          {/* =================================================
              STATISTICS
              ================================================= */}

          <div
            className="
              grid
              grid-cols-2

              border-b
              border-slate-100
            "
          >

            <SummaryValue
              label="Harga Terendah"
              value={
                `Rp ${formatPrice(
                  historicalSummary.min
                )}`
              }
            />


            <SummaryValue
              label="Harga Tertinggi"
              value={
                `Rp ${formatPrice(
                  historicalSummary.max
                )}`
              }
              borderLeft
            />


            <SummaryValue
              label="Harga Rata-rata"
              value={
                `Rp ${formatPrice(
                  historicalSummary.average
                )}`
              }
              borderTop
            />


            <SummaryValue
              label="MAPE Model"
              value={
                activeCommodity.mape !==
                  undefined &&
                activeCommodity.mape !==
                  null
                  ? `${activeCommodity.mape.toFixed(
                      2
                    )}%`
                  : '—'
              }
              borderLeft
              borderTop
            />

          </div>


          {/* =================================================
              QUICK ACTIONS
              ================================================= */}

          <div
            className="
              space-y-2
              p-4
            "
          >

            {/* ACTUAL VS PREDICTED */}

            <button
              type="button"
              onClick={
                () =>
                  onNavigate(
                    'aktual-prediksi'
                  )
              }
              className="
                group

                flex
                w-full
                cursor-pointer
                items-center
                justify-between

                rounded-lg
                border
                border-slate-200
                bg-white

                px-3
                py-2.5

                text-xs
                font-semibold
                text-slate-700

                transition-all
                duration-150

                hover:border-[#0F8A78]
                hover:bg-[#0F8A78]
                hover:text-white
              "
            >

              <span>
                Aktual vs Prediksi
              </span>


              <ChevronRight
                className="
                  h-4
                  w-4

                  transition-transform
                  duration-150

                  group-hover:translate-x-0.5
                "
              />

            </button>


            {/* EVALUATION */}

            <button
              type="button"
              onClick={
                () =>
                  onNavigate(
                    'evaluasi'
                  )
              }
              className="
                group

                flex
                w-full
                cursor-pointer
                items-center
                justify-between

                rounded-lg
                border
                border-slate-200
                bg-white

                px-3
                py-2.5

                text-xs
                font-semibold
                text-slate-700

                transition-all
                duration-150

                hover:border-[#0F8A78]
                hover:bg-[#0F8A78]
                hover:text-white
              "
            >

              <span>
                Evaluasi Model
              </span>


              <ChevronRight
                className="
                  h-4
                  w-4

                  transition-transform
                  duration-150

                  group-hover:translate-x-0.5
                "
              />

            </button>


            {/* FORECAST */}

            <button
              type="button"
              onClick={
                () =>
                  onNavigate(
                    'prediksi'
                  )
              }
              className="
                group

                flex
                w-full
                cursor-pointer
                items-center
                justify-between

                rounded-lg
                border
                border-slate-200
                bg-white

                px-3
                py-2.5

                text-xs
                font-semibold
                text-slate-700

                transition-all
                duration-150

                hover:border-[#0F8A78]
                hover:bg-[#0F8A78]
                hover:text-white
              "
            >

              <span>
                Prediksi Harga
              </span>


              <ChevronRight
                className="
                  h-4
                  w-4

                  transition-transform
                  duration-150

                  group-hover:translate-x-0.5
                "
              />

            </button>

          </div>

        </aside>

      </section>

    </div>

  );

};


/* =========================================================
   DASHBOARD STAT CARD
   ========================================================= */

interface DashboardStatCardProps {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}


const DashboardStatCard:
React.FC<DashboardStatCardProps> = ({
  label,
  value,
  helper,
  icon,
}) => {

  return (

    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white

        p-4

        shadow-sm

        transition

        hover:border-emerald-200
        hover:shadow-md
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div>

          <div
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
            "
          >

            {label}

          </div>


          <div
            className="
              mt-2
              text-xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >

            {value}

          </div>


          <div
            className="
              mt-1
              text-[10px]
              text-slate-500
            "
          >

            {helper}

          </div>

        </div>


        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center

            rounded-lg

            bg-emerald-50
            text-[#0F8A78]
          "
        >

          {icon}

        </div>

      </div>

    </div>

  );

};


/* =========================================================
   SUMMARY VALUE
   ========================================================= */

interface SummaryValueProps {
  label: string;
  value: string;
  borderLeft?: boolean;
  borderTop?: boolean;
}


const SummaryValue:
React.FC<SummaryValueProps> = ({
  label,
  value,
  borderLeft = false,
  borderTop = false,
}) => {

  return (

    <div
      className={`
        p-4

        ${
          borderLeft
            ? 'border-l border-slate-100'
            : ''
        }

        ${
          borderTop
            ? 'border-t border-slate-100'
            : ''
        }
      `}
    >

      <div
        className="
          text-[10px]
          text-slate-400
        "
      >

        {label}

      </div>


      <div
        className="
          mt-1
          text-sm
          font-bold
          tabular-nums
          text-slate-900
        "
      >

        {value}

      </div>

    </div>

  );

};


/* =========================================================
   PRICE CHANGE BADGE
   ========================================================= */

interface PriceChangeBadgeProps {
  value: number;
}


const PriceChangeBadge:
React.FC<PriceChangeBadgeProps> = ({
  value,
}) => {

  const positive =
    value > 0;


  const negative =
    value < 0;


  return (

    <span
      className={`
        inline-flex
        items-center
        gap-1

        rounded-md

        px-2
        py-1

        text-[10px]
        font-semibold
        tabular-nums

        ${
          positive
            ? 'bg-rose-50 text-rose-600'
            : negative
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
        }
      `}
    >

      {positive ? (

        <TrendingUp
          className="
            h-3
            w-3
          "
        />

      ) : negative ? (

        <TrendingDown
          className="
            h-3
            w-3
          "
        />

      ) : null}


      {positive
        ? '+'
        : ''}

      {value.toFixed(
        2
      )}

      %

    </span>

  );

};