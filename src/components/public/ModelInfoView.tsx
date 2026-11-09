import React from 'react';

import {
  LstmModelConfig,
} from '../../types.ts';

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


/* =========================================================
   PROPS
   ========================================================= */

interface ModelInfoViewProps {
  modelConfig: LstmModelConfig;
}


/* =========================================================
   SELECTED MODEL SUMMARY
   ========================================================= */

const selectedModelSummary = [
  {
    commodity: 'Bawang Putih',
    lookback: 12,
    refitEpochs: 1,
  },
  {
    commodity: 'Beras',
    lookback: 12,
    refitEpochs: 60,
  },
  {
    commodity: 'Gula Pasir',
    lookback: 8,
    refitEpochs: 21,
  },
  {
    commodity: 'Cabai Rawit',
    lookback: 1,
    refitEpochs: 200,
  },
  {
    commodity: 'Daging Ayam',
    lookback: 1,
    refitEpochs: 16,
  },
  {
    commodity: 'Minyak Goreng',
    lookback: 8,
    refitEpochs: 9,
  },
  {
    commodity: 'Telur Ayam',
    lookback: 4,
    refitEpochs: 11,
  },
  {
    commodity: 'Bawang Merah',
    lookback: 8,
    refitEpochs: 57,
  },
  {
    commodity: 'Cabai Merah',
    lookback: 12,
    refitEpochs: 2,
  },
  {
    commodity: 'Daging Sapi',
    lookback: 4,
    refitEpochs: 26,
  },
];


/* =========================================================
   COMPONENT
   ========================================================= */

export const ModelInfoView:
React.FC<ModelInfoViewProps> = ({
  modelConfig,
}) => {

  /*
   * modelConfig tetap dipertahankan agar
   * kompatibel dengan App.tsx.
   */
  const hasModelConfig =
    Boolean(
      modelConfig
    );


  return (

    <div
      className="
        space-y-8
        pb-12
      "
      data-model-config={
        hasModelConfig
          ? 'available'
          : 'missing'
      }
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
          shadow-xs

          sm:p-8
        "
      >

        <div
          className="
            grid
            grid-cols-1
            gap-6

            lg:grid-cols-12
            lg:items-center
          "
        >

          {/* LEFT */}

          <div
            className="
              space-y-3
              lg:col-span-8
            "
          >

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2

                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-emerald-800
              "
            >

              <span>
                Informasi Model & Metodologi
              </span>


            </div>


            <h1
              className="
                text-xl
                font-extrabold
                leading-tight
                tracking-tight
                text-slate-900

                sm:text-2xl
                lg:text-3xl
              "
            >

              Prediksi Harga Sepuluh Komoditas Pangan di Provinsi Maluku Menggunakan Long Short-Term Memory (LSTM)

            </h1>


            <p
              className="
                text-xs
                leading-relaxed
                text-slate-600

                sm:text-sm
              "
            >

              Halaman ini menjelaskan data penelitian, proses pembentukan model LSTM, tuning hyperparameter, evaluasi pada data uji, proses refit untuk menghasilkan ramalan September–Desember 2026, serta integrasi hasil pemodelan dengan dashboard web.

            </p>

          </div>


          {/* RIGHT */}

          <div
            className="
              lg:col-span-4
            "
          >

            <div
              className="
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                p-5
              "
            >

              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-2
                "
              >

                <Layers
                  className="
                    h-5
                    w-5
                    text-emerald-700
                  "
                />

                <span
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-emerald-900
                  "
                >

                  Alur Implementasi

                </span>

              </div>


              <div
                className="
                  space-y-2
                  text-xs
                  text-emerald-950
                "
              >

                <div
                  className="
                    font-semibold
                  "
                >
                  PIHPS
                </div>

                <div
                  className="
                    text-emerald-700
                  "
                >
                  ↓
                </div>

                <div
                  className="
                    font-semibold
                  "
                >
                  Google Colab · PyTorch · Optuna
                </div>

                <div
                  className="
                    text-emerald-700
                  "
                >
                  ↓
                </div>

                <div
                  className="
                    font-semibold
                  "
                >
                  MySQL · Flask API
                </div>

                <div
                  className="
                    text-emerald-700
                  "
                >
                  ↓
                </div>

                <div
                  className="
                    font-semibold
                  "
                >
                  React + TypeScript Dashboard
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          MAIN RESEARCH PARAMETERS
          ================================================= */}

      <section
        className="
          space-y-3
        "
      >

        <h2
          className="
            text-base
            font-bold
            text-slate-900
          "
        >

          Parameter Pokok Penelitian

        </h2>


        <div
          className="
            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <InfoCard
            icon={
              <Cpu
                className="
                  h-4
                  w-4
                  text-emerald-600
                "
              />
            }
            label="Algoritma"
            value="Long Short-Term Memory (LSTM)"
            description="Model deret waktu univariat yang dibangun secara terpisah untuk setiap komoditas."
          />


          <InfoCard
            icon={
              <Database
                className="
                  h-4
                  w-4
                  text-sky-600
                "
              />
            }
            label="Sumber Data"
            value="PIHPS"
            description="Data harga pangan mingguan yang digunakan sebagai sumber data penelitian."
          />


          <InfoCard
            icon={
              <MapPin
                className="
                  h-4
                  w-4
                  text-rose-600
                "
              />
            }
            label="Wilayah"
            value="Provinsi Maluku"
            description="Cakupan wilayah penelitian prediksi harga sepuluh komoditas pangan."
          />


          <InfoCard
            icon={
              <Clock
                className="
                  h-4
                  w-4
                  text-amber-600
                "
              />
            }
            label="Frekuensi"
            value="Mingguan"
            description="Satu titik harga merepresentasikan satu observasi mingguan."
          />


          <InfoCard
            icon={
              <Calendar
                className="
                  h-4
                  w-4
                  text-emerald-600
                "
              />
            }
            label="Cakupan Data"
            value="31 Jan 2023 – 31 Agu 2026"
            description="185 harga teramati per komoditas; observasi terakhir yang tersedia adalah 25 Agustus 2026."
            mono
          />


          <InfoCard
            icon={
              <CheckCircle
                className="
                  h-4
                  w-4
                  text-sky-600
                "
              />
            }
            label="Data Uji"
            value="3 Feb – 25 Agu 2026"
            description="30 pasangan harga aktual dan prediksi untuk setiap komoditas."
            mono
          />


          <InfoCard
            icon={
              <Layers
                className="
                  h-4
                  w-4
                  text-rose-600
                "
              />
            }
            label="Periode Ramalan"
            value="1 Sep – 29 Des 2026"
            description="18 titik ramalan mingguan untuk masing-masing komoditas."
            mono
          />


          <InfoCard
            icon={
              <BarChart
                className="
                  h-4
                  w-4
                  text-amber-600
                "
              />
            }
            label="Metrik Evaluasi"
            value="MAE · RMSE · MAPE"
            description="Digunakan untuk mengukur besarnya kesalahan prediksi pada data uji."
          />

        </div>

      </section>


      {/* =================================================
          MODEL DEVELOPMENT
          ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-xs
        "
      >

        <div
          className="
            mb-5
          "
        >

          <h2
            className="
              text-base
              font-bold
              text-slate-900
            "
          >

            Konfigurasi dan Tuning Model LSTM

          </h2>


          <p
            className="
              mt-1
              text-xs
              leading-relaxed
              text-slate-500
            "
          >

            Model tidak menggunakan satu konfigurasi hyperparameter yang sama untuk seluruh komoditas. Pencarian konfigurasi dilakukan secara terpisah sehingga setiap komoditas dapat memiliki panjang jendela dan jumlah epoch final yang berbeda.

          </p>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-6

            lg:grid-cols-2
          "
        >

          {/* SEARCH SPACE */}

          <div>

            <h3
              className="
                mb-3
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-slate-700
              "
            >

              Ruang Pencarian Hyperparameter

            </h3>


            <div
              className="
                overflow-hidden
                rounded-xl
                border
                border-slate-200
              "
            >

              <table
                className="
                  w-full
                  text-left
                  text-xs
                "
              >

                <tbody
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  <ParameterRow
                    label="Lookback"
                    value="1, 4, 8, 12 minggu"
                    alternate
                  />

                  <ParameterRow
                    label="LSTM Units"
                    value="8, 16, 32"
                  />

                  <ParameterRow
                    label="Dropout"
                    value="0.0, 0.1, 0.2"
                    alternate
                  />

                  <ParameterRow
                    label="Learning Rate"
                    value="0.0001 – 0.01"
                  />

                  <ParameterRow
                    label="Batch Size"
                    value="8, 16, 32"
                    alternate
                  />

                  <ParameterRow
                    label="Output Mode"
                    value="Level / Residual"
                  />

                  <ParameterRow
                    label="Optimizer"
                    value="Adam"
                    alternate
                  />

                  <ParameterRow
                    label="Loss Function"
                    value="MSE pada skala normalisasi"
                  />

                  <ParameterRow
                    label="Maksimum Epoch"
                    value="200"
                    alternate
                  />

                  <ParameterRow
                    label="Early Stopping"
                    value="Patience 20"
                  />

                  <ParameterRow
                    label="Trial"
                    value="16 per komoditas"
                    alternate
                  />

                  <ParameterRow
                    label="Seed Model"
                    value="42"
                  />

                </tbody>

              </table>

            </div>

          </div>


          {/* STRUCTURE */}

          <div>

            <h3
              className="
                mb-3
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-slate-700
              "
            >

              Struktur Model

            </h3>


            <div
              className="
                space-y-3
              "
            >

              <div
                className="
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50/80
                  p-4
                "
              >

                <span
                  className="
                    block
                    text-xs
                    font-bold
                    text-slate-900
                  "
                >

                  1. Masukan Deret Waktu

                </span>


                <p
                  className="
                    mt-1
                    text-xs
                    leading-relaxed
                    text-slate-600
                  "
                >

                  Setiap model menggunakan satu fitur harga dari komoditas yang bersangkutan. Jumlah observasi sebelumnya yang menjadi masukan mengikuti nilai lookback terpilih.

                </p>

              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50/80
                  p-4
                "
              >

                <span
                  className="
                    block
                    text-xs
                    font-bold
                    text-slate-900
                  "
                >

                  2. Lapisan LSTM

                </span>


                <p
                  className="
                    mt-1
                    text-xs
                    leading-relaxed
                    text-slate-600
                  "
                >

                  Satu lapisan LSTM memproses urutan harga dan memanfaatkan mekanisme memory cell untuk mempertahankan informasi yang relevan dari observasi sebelumnya.

                </p>

              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50/80
                  p-4
                "
              >

                <span
                  className="
                    block
                    text-xs
                    font-bold
                    text-slate-900
                  "
                >

                  3. Lapisan Output

                </span>


                <p
                  className="
                    mt-1
                    text-xs
                    leading-relaxed
                    text-slate-600
                  "
                >

                  Hidden state terakhir diteruskan ke lapisan linear untuk menghasilkan satu nilai prediksi harga pada horizon berikutnya.

                </p>

              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50/80
                  p-4
                "
              >

                <span
                  className="
                    block
                    text-xs
                    font-bold
                    text-slate-900
                  "
                >

                  4. Normalisasi

                </span>


                <p
                  className="
                    mt-1
                    text-xs
                    leading-relaxed
                    text-slate-600
                  "
                >

                  Harga dinormalisasi dengan MinMaxScaler. Parameter scaler dipelajari dari data yang diperbolehkan pada tahap pelatihan sehingga data masa depan tidak digunakan untuk membentuk skala masukan.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          SELECTED CONFIGURATION
          ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-xs
        "
      >

        <div
          className="
            mb-4
            border-b
            border-slate-100
            pb-3
          "
        >

          <h2
            className="
              text-base
              font-bold
              text-slate-900
            "
          >

            Konfigurasi Model Final per Komoditas

          </h2>


          <p
            className="
              mt-1
              text-xs
              leading-relaxed
              text-slate-500
            "
          >

            Lookback merupakan panjang jendela masukan hasil tuning. Epoch refit mengikuti best epoch dari konfigurasi yang telah dipilih melalui data validasi.

          </p>

        </div>


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
                  No
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
                    text-center
                    font-semibold
                  "
                >
                  Lookback Terpilih
                </th>

                <th
                  className="
                    px-3
                    py-2.5
                    text-center
                    font-semibold
                  "
                >
                  Epoch Refit
                </th>

              </tr>

            </thead>


            <tbody
              className="
                divide-y
                divide-slate-100
              "
            >

              {selectedModelSummary.map(
                (
                  item,
                  index
                ) => (

                  <tr
                    key={
                      item.commodity
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
                        text-slate-400
                      "
                    >

                      {index + 1}

                    </td>


                    <td
                      className="
                        px-3
                        py-2.5
                        font-semibold
                        text-slate-900
                      "
                    >

                      {item.commodity}

                    </td>


                    <td
                      className="
                        px-3
                        py-2.5
                        text-center
                        font-mono
                        font-semibold
                        text-slate-700
                      "
                    >

                      {item.lookback}{' '}
                      minggu

                    </td>


                    <td
                      className="
                        px-3
                        py-2.5
                        text-center
                        font-mono
                        font-semibold
                        text-slate-700
                      "
                    >

                      {item.refitEpochs}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>


        <div
          className="
            mt-4
            rounded-lg
            border
            border-sky-100
            bg-sky-50/60
            p-3
          "
        >

          <p
            className="
              text-xs
              leading-relaxed
              text-sky-900
            "
          >

            Perbedaan nilai lookback dan epoch menunjukkan bahwa konfigurasi model dipilih berdasarkan karakteristik masing-masing komoditas, bukan menggunakan satu parameter yang dipaksakan untuk seluruh seri harga.

          </p>

        </div>

      </section>


      {/* =================================================
          DEVELOPMENT STAGES
          ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-xs
        "
      >

        <div
          className="
            mb-6
          "
        >

          <h2
            className="
              text-base
              font-bold
              text-slate-900
            "
          >

            Tahapan Pengembangan

          </h2>


          <p
            className="
              mt-1
              text-xs
              leading-relaxed
              text-slate-500
            "
          >

            Tahapan pengembangan penelitian dari pengumpulan data hingga implementasi hasil penelitian pada dashboard web.

          </p>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-3

            md:grid-cols-2
            lg:grid-cols-3
          "
        >

          <MethodCard
            number="1"
            title="Pengumpulan Data"
            description="Data harga mingguan sepuluh komoditas pangan di Provinsi Maluku dikumpulkan dari Pusat Informasi Harga Pangan Strategis (PIHPS) sebagai sumber data penelitian."
          />


          <MethodCard
            number="2"
            title="Analisis Kebutuhan"
            description="Kebutuhan sistem dianalisis berdasarkan kebutuhan fungsional dan non-fungsional, meliputi pengelolaan data, penyajian harga historis, hasil prediksi, evaluasi model, ramalan harga, serta kebutuhan antarmuka dashboard."
          />


          <MethodCard
            number="3"
            title="Pra-Pemrosesan Data"
            description="Data diperiksa berdasarkan format tanggal dan nilai harga, masukan kosong ditangani secara kausal, target kosong tidak digunakan, kemudian data dinormalisasi menggunakan MinMaxScaler sebelum digunakan dalam pemodelan."
          />


          <MethodCard
            number="4"
            title="Evaluasi Model LSTM"
            description="Model LSTM dibentuk dan dikonfigurasi untuk setiap komoditas. Hasil prediksi pada data uji kemudian dievaluasi menggunakan Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), dan Mean Absolute Percentage Error (MAPE)."
          />


          <MethodCard
            number="5"
            title="Perancangan Sistem"
            description="Sistem dirancang dengan React dan TypeScript pada frontend, Flask sebagai backend API, serta MySQL sebagai basis data untuk menyimpan dan menyediakan data yang ditampilkan pada dashboard."
          />


          <MethodCard
            number="6"
            title="Implementasi Website"
            description="Dashboard web diimplementasikan untuk menyajikan data komoditas, harga historis, perbandingan harga aktual dan prediksi, evaluasi model, serta ramalan harga September–Desember 2026."
            highlight
          />

        </div>

      </section>


      {/* =================================================
          EVALUATION & FORECAST
          ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-xs
        "
      >

        <div
          className="
            grid
            grid-cols-1
            gap-6

            lg:grid-cols-2
          "
        >

          {/* TEST */}

          <div>

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
              "
            >

              <BarChart
                className="
                  h-5
                  w-5
                  text-sky-700
                "
              />

              <h2
                className="
                  text-base
                  font-bold
                  text-slate-900
                "
              >

                Evaluasi Model

              </h2>

            </div>


            <div
              className="
                space-y-3
                text-xs
                leading-relaxed
                text-slate-600
              "
            >

              <p>

                Pengujian menggunakan 30 pasangan harga aktual dan prediksi untuk setiap komoditas pada tanggal yang tersedia dari 3 Februari sampai 25 Agustus 2026.

              </p>


              <p>

                Prediksi pengujian merupakan prediksi satu minggu ke depan secara bergulir. MAE dan RMSE dinyatakan dalam satuan harga, sedangkan MAPE dinyatakan dalam persentase.

              </p>


              <div
                className="
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  p-3
                "
              >

                <strong
                  className="
                    text-slate-900
                  "
                >
                  Catatan:
                </strong>{' '}

                nilai MAE, RMSE, dan MAPE pada halaman Evaluasi Model merupakan hasil pengujian model, bukan ukuran kesalahan terhadap ramalan September–Desember 2026.

              </div>

            </div>

          </div>


          {/* FORECAST */}

          <div>

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
              "
            >

              <Layers
                className="
                  h-5
                  w-5
                  text-emerald-700
                "
              />

              <h2
                className="
                  text-base
                  font-bold
                  text-slate-900
                "
              >

                Ramalan September–Desember 2026

              </h2>

            </div>


            <div
              className="
                space-y-3
                text-xs
                leading-relaxed
                text-slate-600
              "
            >

              <p>

                Setelah evaluasi selesai, setiap model dilatih ulang menggunakan seluruh harga historis yang tersedia sampai Agustus 2026 dengan konfigurasi yang telah dibekukan sebelumnya.

              </p>


              <p>

                Ramalan dilakukan secara rekursif dari satu titik awal tetap. Prediksi minggu sebelumnya dapat digunakan sebagai bagian dari masukan untuk menghasilkan prediksi minggu berikutnya.

              </p>


              <div
                className="
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  p-3
                "
              >

                Setiap komoditas menghasilkan 18 titik ramalan mingguan dari 1 September sampai 29 Desember 2026.

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          SYSTEM INTEGRATION
          ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-xs
        "
      >

        <div
          className="
            mb-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <Code2
              className="
                h-5
                w-5
                text-emerald-700
              "
            />

            <h2
              className="
                text-base
                font-bold
                text-slate-900
              "
            >

              Arsitektur Integrasi Sistem

            </h2>

          </div>


          <p
            className="
              mt-1
              text-xs
              leading-relaxed
              text-slate-500
            "
          >

            Pemodelan LSTM dilakukan di Google Colab. Backend Flask tidak melatih ulang ataupun menjalankan prediksi LSTM saat pengguna membuka dashboard; Flask berfungsi menyediakan data yang telah disimpan pada MySQL melalui API.

          </p>

        </div>


        {/* PIPELINE */}

        <div
          className="
            grid
            grid-cols-1
            items-stretch
            gap-3

            lg:grid-cols-11
          "
        >

          <ArchitectureBox
            title="PIHPS"
            description="Data harga mingguan"
            icon={
              <FileText
                className="
                  h-5
                  w-5
                "
              />
            }
          />


          <ArchitectureArrow />


          <ArchitectureBox
            title="Google Colab"
            description="Preprocessing, tuning, evaluasi, refit, ramalan"
            icon={
              <Cpu
                className="
                  h-5
                  w-5
                "
              />
            }
          />


          <ArchitectureArrow />


          <ArchitectureBox
            title="CSV Hasil"
            description="Historis, aktual-prediksi, evaluasi, forecast"
            icon={
              <FileText
                className="
                  h-5
                  w-5
                "
              />
            }
          />


          <ArchitectureArrow />


          <ArchitectureBox
            title="MySQL"
            description="Penyimpanan data dashboard"
            icon={
              <Database
                className="
                  h-5
                  w-5
                "
              />
            }
          />


          <ArchitectureArrow />


          <ArchitectureBox
            title="Flask API"
            description="Membaca dan menyediakan data"
            icon={
              <Code2
                className="
                  h-5
                  w-5
                "
              />
            }
          />


          <ArchitectureArrow />


          <ArchitectureBox
            title="React"
            description="Visualisasi dashboard web"
            icon={
              <Layers
                className="
                  h-5
                  w-5
                "
              />
            }
          />

        </div>

      </section>

    </div>

  );

};


/* =========================================================
   INFO CARD
   ========================================================= */

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  mono?: boolean;
}


const InfoCard:
React.FC<InfoCardProps> = ({
  icon,
  label,
  value,
  description,
  mono = false,
}) => {

  return (

    <div
      className="
        rounded-xl
        border
        border-slate-200/90
        bg-white
        p-5
        shadow-xs
      "
    >

      <div
        className="
          mb-2
          flex
          items-center
          gap-2
          text-slate-500
        "
      >

        {icon}

        <span
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
          "
        >

          {label}

        </span>

      </div>


      <div
        className={
          `text-sm font-bold text-slate-900 ` +
          (
            mono
              ? 'font-mono'
              : ''
          )
        }
      >

        {value}

      </div>


      <p
        className="
          mt-1
          text-xs
          leading-relaxed
          text-slate-500
        "
      >

        {description}

      </p>

    </div>

  );

};


/* =========================================================
   PARAMETER ROW
   ========================================================= */

interface ParameterRowProps {
  label: string;
  value: string;
  alternate?: boolean;
}


const ParameterRow:
React.FC<ParameterRowProps> = ({
  label,
  value,
  alternate = false,
}) => {

  return (

    <tr
      className={
        alternate
          ? 'bg-slate-50/60'
          : 'bg-white'
      }
    >

      <td
        className="
          px-3
          py-2.5
          font-medium
          text-slate-600
        "
      >

        {label}

      </td>


      <td
        className="
          px-3
          py-2.5
          text-right
          font-mono
          font-semibold
          text-slate-900
        "
      >

        {value}

      </td>

    </tr>

  );

};


/* =========================================================
   METHOD CARD
   ========================================================= */

interface MethodCardProps {
  number: string;
  title: string;
  description: string;
  highlight?: boolean;
}


const MethodCard:
React.FC<MethodCardProps> = ({
  number,
  title,
  description,
  highlight = false,
}) => {

  return (

    <div
      className="
        flex
        flex-col
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
        text-slate-700
      "
    >

      <div
        className="
          flex
          h-6
          w-6
          items-center
          justify-center

          rounded-full
          bg-slate-900

          font-mono
          text-[11px]
          font-bold
          text-white
        "
      >

        {number}

      </div>


      <h4
        className={
          `font-bold ` +
          (
            highlight
              ? 'text-emerald-950'
              : 'text-slate-900'
          )
        }
      >

        {title}

      </h4>


      <p
        className={
          `text-[11px] leading-relaxed ` +
          (
            highlight
              ? 'text-emerald-800'
              : 'text-slate-600'
          )
        }
      >

        {description}

      </p>

    </div>

  );

};


/* =========================================================
   ARCHITECTURE BOX
   ========================================================= */

interface ArchitectureBoxProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}


const ArchitectureBox:
React.FC<ArchitectureBoxProps> = ({
  title,
  description,
  icon,
  highlight = false,
}) => {

  return (

    <div
      className={
        `flex flex-col items-center justify-center rounded-xl border p-4 text-center lg:col-span-1 ` +
        (
          highlight
            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
            : 'border-slate-200 bg-slate-50 text-slate-700'
        )
      }
    >

      <div
        className="
          mb-2
        "
      >

        {icon}

      </div>


      <div
        className="
          text-xs
          font-bold
        "
      >

        {title}

      </div>


      <div
        className="
          mt-1
          text-[10px]
          leading-relaxed
          opacity-80
        "
      >

        {description}

      </div>

    </div>

  );

};


/* =========================================================
   ARCHITECTURE ARROW
   ========================================================= */

const ArchitectureArrow:
React.FC = () => {

  return (

    <div
      className="
        flex
        items-center
        justify-center

        lg:col-span-1
      "
    >

      <ArrowRight
        className="
          hidden
          h-4
          w-4
          text-slate-400

          lg:block
        "
      />

      <span
        className="
          text-slate-400

          lg:hidden
        "
      >
        ↓
      </span>

    </div>

  );

};