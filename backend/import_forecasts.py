import csv
from pathlib import Path

import mysql.connector
from mysql.connector import Error

from config import DB_CONFIG


BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "data_import" / "ramalan_harga_sep_des_2026.csv"


def normalize_name(value):
    return " ".join(value.strip().lower().split())


def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def main():
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

        inserted = 0
        duplicate = 0
        skipped_unknown = 0
        skipped_invalid = 0

        unknown_names = set()

        with open(
            CSV_PATH,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as file:

            reader = csv.DictReader(file)

            print()
            print("Kolom CSV:", reader.fieldnames)

            required_columns = {
                "commodity",
                "date",
                "predicted_price",
            }

            csv_columns = set(reader.fieldnames or [])

            if not required_columns.issubset(csv_columns):
                raise ValueError(
                    "Struktur CSV tidak sesuai.\n"
                    f"Kolom ditemukan: {reader.fieldnames}\n"
                    f"Kolom diperlukan: {sorted(required_columns)}"
                )

            print()
            print("=== PROSES IMPORT FORECAST ===")

            for row_number, row in enumerate(reader, start=2):

                commodity_name = row["commodity"].strip()
                date = row["date"].strip()
                predicted_text = row["predicted_price"].strip()

                normalized_commodity = normalize_name(commodity_name)

                if normalized_commodity not in commodity_map:
                    skipped_unknown += 1
                    unknown_names.add(commodity_name)
                    continue

                mysql_commodity_id = commodity_map[
                    normalized_commodity
                ]

                try:
                    predicted_price = float(predicted_text)

                    if predicted_price <= 0:
                        raise ValueError("Predicted price <= 0")

                except (ValueError, AttributeError):
                    skipped_invalid += 1

                    print(
                        f"[BARIS {row_number}] "
                        f"Prediksi tidak valid: "
                        f"{commodity_name} | {date} | {predicted_text}"
                    )

                    continue

                try:
                    cursor.execute(
                        """
                        INSERT INTO forecasts
                            (
                                commodity_id,
                                date,
                                predicted_price
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
                            predicted_price,
                        ),
                    )

                    inserted += 1

                except mysql.connector.IntegrityError as e:

                    if e.errno == 1062:
                        duplicate += 1
                    else:
                        raise

        connection.commit()

        print()
        print("=== HASIL IMPORT FORECAST ===")
        print(f"Data berhasil masuk   : {inserted}")
        print(f"Data duplikat         : {duplicate}")
        print(f"Komoditas tidak cocok : {skipped_unknown}")
        print(f"Data tidak valid      : {skipped_invalid}")

        if unknown_names:
            print()
            print("Nama komoditas yang tidak ditemukan di MySQL:")

            for name in sorted(unknown_names):
                print(f"- {name}")

        cursor.execute("""
            SELECT COUNT(*) AS jumlah
            FROM forecasts
        """)

        total = cursor.fetchone()["jumlah"]

        print()
        print(f"Total tabel forecasts: {total}")

        cursor.execute("""
            SELECT
                c.id,
                c.name,
                COUNT(f.id) AS jumlah_data,
                MIN(f.date) AS tanggal_awal,
                MAX(f.date) AS tanggal_akhir
            FROM commodities c
            LEFT JOIN forecasts f
                ON f.commodity_id = c.id
            GROUP BY
                c.id,
                c.name
            ORDER BY
                c.id
        """)

        print()
        print("=== RINGKASAN RAMALAN PER KOMODITAS ===")

        for row in cursor.fetchall():
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