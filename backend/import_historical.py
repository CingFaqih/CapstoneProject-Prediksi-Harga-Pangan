import csv
from pathlib import Path

import mysql.connector
from mysql.connector import Error

from config import DB_CONFIG


# Root project:
# maluku-food-price-lstm-forecasting-dashboard/
BASE_DIR = Path(__file__).resolve().parent.parent

# Lokasi file CSV hasil Google Colab
CSV_PATH = BASE_DIR / "data_import" / "harga_historis_asli.csv"


def normalize_name(value):
    """
    Menyamakan format nama komoditas agar pencocokan
    antara CSV dan MySQL tidak sensitif terhadap huruf besar/kecil
    atau spasi berlebih.
    """
    return " ".join(value.strip().lower().split())


def get_db_connection():
    """
    Membuat koneksi ke MySQL menggunakan konfigurasi
    yang sudah ada pada backend/config.py.
    """
    return mysql.connector.connect(**DB_CONFIG)


def main():
    # Pastikan file CSV tersedia
    if not CSV_PATH.exists():
        print("IMPORT GAGAL")
        print(f"File tidak ditemukan: {CSV_PATH}")
        return

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        print("=== KONEKSI DATABASE ===")
        print("MySQL berhasil terhubung.")

        # ---------------------------------------------
        # 1. Ambil master komoditas dari MySQL
        # ---------------------------------------------
        cursor.execute("""
            SELECT id, name
            FROM commodities
            ORDER BY id
        """)

        commodities = cursor.fetchall()

        commodity_map = {
            normalize_name(row["name"]): row["id"]
            for row in commodities
        }

        print()
        print("=== MASTER KOMODITAS MYSQL ===")

        for row in commodities:
            print(f'{row["id"]}: {row["name"]}')

        # ---------------------------------------------
        # 2. Variabel pencatatan hasil import
        # ---------------------------------------------
        inserted = 0
        skipped_blank = 0
        skipped_unknown = 0
        skipped_invalid = 0
        duplicate = 0

        unknown_names = set()

        # ---------------------------------------------
        # 3. Baca CSV hasil Google Colab
        # ---------------------------------------------
        with open(
            CSV_PATH,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as file:

            reader = csv.DictReader(file)

            required_columns = {
                "date",
                "commodity",
                "price",
                "commodity_id",
                "is_observed",
            }

            csv_columns = set(reader.fieldnames or [])

            if not required_columns.issubset(csv_columns):
                raise ValueError(
                    "Struktur CSV tidak sesuai.\n"
                    f"Kolom yang ditemukan: {reader.fieldnames}\n"
                    f"Kolom yang diperlukan: {sorted(required_columns)}"
                )

            print()
            print("=== PROSES IMPORT ===")

            for row_number, row in enumerate(reader, start=2):

                commodity_name = row["commodity"].strip()
                date = row["date"].strip()
                price_text = row["price"].strip()

                # -------------------------------------
                # Lewati harga yang kosong
                # -------------------------------------
                if not price_text:
                    skipped_blank += 1
                    continue

                # -------------------------------------
                # Cari commodity_id berdasarkan nama
                # -------------------------------------
                normalized_commodity = normalize_name(commodity_name)

                if normalized_commodity not in commodity_map:
                    skipped_unknown += 1
                    unknown_names.add(commodity_name)
                    continue

                mysql_commodity_id = commodity_map[
                    normalized_commodity
                ]

                # -------------------------------------
                # Validasi harga
                # -------------------------------------
                try:
                    price = float(price_text)

                except ValueError:
                    skipped_invalid += 1

                    print(
                        f"[BARIS {row_number}] "
                        f"Harga tidak valid: "
                        f"{commodity_name} | "
                        f"{date} | "
                        f"{price_text}"
                    )

                    continue

                if price <= 0:
                    skipped_invalid += 1

                    print(
                        f"[BARIS {row_number}] "
                        f"Harga <= 0 dilewati: "
                        f"{commodity_name} | "
                        f"{date} | "
                        f"{price}"
                    )

                    continue

                # -------------------------------------
                # Masukkan ke tabel prices
                # -------------------------------------
                try:
                    cursor.execute(
                        """
                        INSERT INTO prices
                            (
                                commodity_id,
                                date,
                                price
                            )
                        VALUES
                            (
                                %s,
                                %s,
                                %s
                            )
                        """,
                        (
                            mysql_commodity_id,
                            date,
                            price,
                        ),
                    )

                    inserted += 1

                except mysql.connector.IntegrityError as e:

                    # Error 1062 = duplicate unique key
                    if e.errno == 1062:
                        duplicate += 1
                    else:
                        raise

        # ---------------------------------------------
        # 4. Simpan perubahan
        # ---------------------------------------------
        connection.commit()

        # ---------------------------------------------
        # 5. Ringkasan import
        # ---------------------------------------------
        print()
        print("=== HASIL IMPORT DATA HISTORIS ===")
        print(f"Data berhasil masuk      : {inserted}")
        print(f"Harga kosong dilewati    : {skipped_blank}")
        print(f"Harga tidak valid        : {skipped_invalid}")
        print(f"Komoditas tidak cocok    : {skipped_unknown}")
        print(f"Data duplikat            : {duplicate}")

        if unknown_names:
            print()
            print("Nama komoditas yang tidak ditemukan di MySQL:")

            for name in sorted(unknown_names):
                print(f"- {name}")

        # ---------------------------------------------
        # 6. Hitung total data di tabel prices
        # ---------------------------------------------
        cursor.execute("""
            SELECT COUNT(*) AS jumlah
            FROM prices
        """)

        total = cursor.fetchone()["jumlah"]

        print()
        print(f"Total data tabel prices  : {total}")

        # ---------------------------------------------
        # 7. Ringkasan per komoditas
        # ---------------------------------------------
        cursor.execute("""
            SELECT
                c.id,
                c.name,
                COUNT(p.id) AS jumlah_data,
                MIN(p.date) AS tanggal_awal,
                MAX(p.date) AS tanggal_akhir
            FROM commodities c
            LEFT JOIN prices p
                ON p.commodity_id = c.id
            GROUP BY
                c.id,
                c.name
            ORDER BY
                c.id
        """)

        results = cursor.fetchall()

        print()
        print("=== RINGKASAN PER KOMODITAS ===")

        for row in results:
            print(
                f'{row["id"]}. '
                f'{row["name"]}: '
                f'{row["jumlah_data"]} data | '
                f'{row["tanggal_awal"]} '
                f's.d. '
                f'{row["tanggal_akhir"]}'
            )

        print()
        print("IMPORT SELESAI")

    except Error as e:

        if connection:
            connection.rollback()

        print()
        print("IMPORT GAGAL - MYSQL")
        print(e)

    except ValueError as e:

        if connection:
            connection.rollback()

        print()
        print("IMPORT GAGAL - VALIDASI DATA")
        print(e)

    except Exception as e:

        if connection:
            connection.rollback()

        print()
        print("IMPORT GAGAL")
        print(type(e).__name__)
        print(e)

    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


if __name__ == "__main__":
    main()