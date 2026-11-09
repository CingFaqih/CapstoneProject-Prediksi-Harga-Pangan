import React, {
  useMemo,
  useState,
} from 'react';

import {
  Commodity,
  PublicNavTab,
} from '../../types.ts';

import {
  ArrowRight,
  BarChart3,
  Database,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';


/* =========================================================
   PROPS
   ========================================================= */

interface CommodityDataViewProps {
  commodities: Commodity[];

  onSelectCommodityForHistory:
    (commodityId: string) => void;

  onNavigate:
    (tab: PublicNavTab) => void;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export const CommodityDataView:
React.FC<CommodityDataViewProps> = ({
  commodities,
  onSelectCommodityForHistory,
  onNavigate,
}) => {

  /* =======================================================
     SEARCH STATE
     ======================================================= */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');


  /* =======================================================
     FORMAT PRICE
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
     SEARCHED COMMODITIES
     ======================================================= */

  const filteredCommodities =
    useMemo(() => {

      const query =
        searchQuery
          .trim()
          .toLowerCase();


      if (!query) {

        return commodities;

      }


      return commodities.filter(
        (
          commodity
        ) =>

          commodity.name
            .toLowerCase()
            .includes(
              query
            ) ||

          commodity.category
            .toLowerCase()
            .includes(
              query
            )

      );

    }, [
      commodities,
      searchQuery,
    ]);


  /* =======================================================
     EMPTY STATE
     ======================================================= */

  if (
    commodities.length === 0
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

        Data komoditas belum tersedia.

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
        pb-10
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

        {/* HEADER TEXT */}

        <div
          className="
            border-b
            border-slate-100
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

            Data {commodities.length} Komoditas Pangan Provinsi Maluku

          </h1>


          <p
            className="
              mt-1
              max-w-3xl
              text-xs
              leading-relaxed
              text-slate-500
            "
          >

            Ringkasan harga mingguan PIHPS, perubahan harga,
            dan nilai MAPE hasil evaluasi model LSTM.

          </p>

        </div>


        {/* =================================================
            SEARCH
            ================================================= */}

        <div
          className="
            mt-4
            flex
            justify-end
          "
        >

          <div
            className="
              relative
              w-full

              sm:w-[320px]
            "
          >

            <Search
              className="
                absolute
                left-3
                top-1/2

                h-4
                w-4

                -translate-y-1/2

                text-slate-400
              "
            />


            <input
              type="text"
              value={
                searchQuery
              }
              onChange={
                (
                  event
                ) =>
                  setSearchQuery(
                    event.target.value
                  )
              }
              placeholder="Cari nama komoditas..."
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

                outline-none

                transition

                placeholder:text-slate-400

                focus:border-[#0F8A78]
                focus:ring-2
                focus:ring-emerald-100
              "
            />

          </div>

        </div>

      </section>


      {/* =================================================
          COMMODITY GRID
          ================================================= */}

      {filteredCommodities.length >
      0 ? (

        <section
          className="
            grid
            grid-cols-1
            gap-4

            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {filteredCommodities.map(
            (
              commodity
            ) => (

              <CommodityCard
                key={
                  commodity.id
                }
                commodity={
                  commodity
                }
                formatPrice={
                  formatPrice
                }
                formatDate={
                  formatDate
                }
                onHistory={
                  () =>
                    onSelectCommodityForHistory(
                      commodity.id
                    )
                }
                onEvaluation={
                  () =>
                    onNavigate(
                      'evaluasi'
                    )
                }
              />

            )
          )}

        </section>

      ) : (

        /* =================================================
           SEARCH EMPTY RESULT
           ================================================= */

        <section
          className="
            rounded-xl
            border
            border-slate-200
            bg-white

            p-10

            text-center
          "
        >

          <Database
            className="
              mx-auto
              h-6
              w-6
              text-slate-300
            "
          />


          <h3
            className="
              mt-3
              text-sm
              font-semibold
              text-slate-700
            "
          >

            Komoditas tidak ditemukan

          </h3>


          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >

            Coba gunakan nama komoditas yang berbeda.

          </p>

        </section>

      )}

    </div>

  );

};


/* =========================================================
   COMMODITY CARD
   ========================================================= */

interface CommodityCardProps {
  commodity: Commodity;

  formatPrice:
    (value: number) => string;

  formatDate:
    (date: string) => string;

  onHistory:
    () => void;

  onEvaluation:
    () => void;
}


const CommodityCard:
React.FC<CommodityCardProps> = ({
  commodity,
  formatPrice,
  formatDate,
  onHistory,
  onEvaluation,
}) => {

  const positive =
    commodity.changePercent >
    0;


  const negative =
    commodity.changePercent <
    0;


  return (

    <article
      className="
        overflow-hidden

        rounded-xl
        border
        border-slate-200
        bg-white

        shadow-sm

        transition-all
        duration-150

        hover:border-emerald-200
        hover:shadow-md
      "
    >

      {/* =================================================
          CARD HEADER
          ================================================= */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4

          border-b
          border-slate-100

          px-5
          py-4
        "
      >

        {/* NAME */}

        <div>

          <h2
            className="
              text-base
              font-bold
              text-slate-900
            "
          >

            {commodity.name}

          </h2>


          <p
            className="
              mt-0.5
              text-xs
              text-slate-500
            "
          >

            {commodity.category}

            {' · '}

            {commodity.unit}

          </p>

        </div>


        {/* WEEKLY CHANGE */}

        <div
          className="
            text-right
          "
        >

          <div
            className={`
              inline-flex
              items-center
              gap-1

              font-mono
              text-xs
              font-bold

              ${
                positive
                  ? 'text-rose-600'
                  : negative
                  ? 'text-emerald-700'
                  : 'text-slate-500'
              }
            `}
          >

            {positive ? (

              <TrendingUp
                className="
                  h-3.5
                  w-3.5
                "
              />

            ) : negative ? (

              <TrendingDown
                className="
                  h-3.5
                  w-3.5
                "
              />

            ) : null}


            {positive
              ? '+'
              : ''}

            {commodity.changePercent.toFixed(
              2
            )}

            %

          </div>


          <div
            className="
              mt-1
              text-[9px]
              text-slate-400
            "
          >

            Perubahan Mingguan

          </div>

        </div>

      </div>


      {/* =================================================
          CURRENT PRICE
          ================================================= */}

      <div
        className="
          px-5
          pb-4
          pt-4
        "
      >

        <div
          className="
            text-[11px]
            text-slate-500
          "
        >

          Harga Terbaru

        </div>


        <div
          className="
            mt-1

            flex
            items-end
            gap-2
          "
        >

          <span
            className="
              font-mono
              text-2xl
              font-bold
              tracking-tight
              text-slate-950
            "
          >

            Rp{' '}

            {formatPrice(
              commodity.currentPrice
            )}

          </span>


          <span
            className="
              pb-0.5
              text-xs
              text-slate-500
            "
          >

            / {commodity.unit}

          </span>

        </div>


        <div
          className="
            mt-1
            text-[11px]
            text-slate-500
          "
        >

          {formatDate(
            commodity.lastUpdated
          )}

        </div>

      </div>


      {/* =================================================
          MODEL INFORMATION
          ================================================= */}

      <div
        className="
          mx-5

          rounded-lg
          border
          border-slate-100
          bg-slate-50

          px-4
          py-3
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <div>

            <div
              className="
                text-[10px]
                text-slate-500
              "
            >

              MAPE Model

            </div>


            <div
              className="
                mt-1
                font-mono
                text-sm
                font-bold
                text-slate-900
              "
            >

              {commodity.mape !==
                undefined &&
              commodity.mape !==
                null
                ? `${commodity.mape.toFixed(
                    2
                  )}%`
                : '—'}

            </div>

          </div>


          <BarChart3
            className="
              h-4
              w-4
              text-[#0F8A78]
            "
          />

        </div>

      </div>


      {/* =================================================
          ACTIONS
          ================================================= */}

      <div
        className="
          mx-5
          mt-4

          flex
          items-center
          justify-between

          border-t
          border-slate-100

          py-3
        "
      >

        {/* HISTORY */}

        <button
          type="button"
          onClick={
            onHistory
          }
          className="
            group

            inline-flex
            cursor-pointer
            items-center
            gap-1

            text-xs
            font-semibold
            text-slate-800

            transition-colors

            hover:text-[#0F8A78]
          "
        >

          Lihat Data Historis

          <ArrowRight
            className="
              h-3.5
              w-3.5

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
            onEvaluation
          }
          className="
            inline-flex
            cursor-pointer
            items-center
            gap-1.5

            text-xs
            font-medium
            text-slate-500

            transition-colors

            hover:text-[#0F8A78]
          "
        >

          <BarChart3
            className="
              h-3.5
              w-3.5
            "
          />

          Evaluasi Model

        </button>

      </div>

    </article>

  );

};