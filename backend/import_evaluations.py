import csv
from pathlib import Path

import mysql.connector
from mysql.connector import Error

from config import DB_CONFIG


# Root project
BASE_DIR = Path(__file__).resolve().parent.parent

# File hasil Google Colab
CSV_PATH = BASE_DIR / "data_import" / "evaluasi_uji_model_tuned.csv"


def normalize_name(value):
    """
    Menyamakan penulisan nama komoditas agar pencocokan
    antara CSV dan MySQL tidak sensitif terhadap huruf besar/kecil
    atau spasi berlebih.
    """
    return " ".join(value.strip().lower().split())


def get_db_connection():
    """
    Membuka koneksi MySQL menggunakan konfigurasi
    dari backend/config.py.
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
        # --------------------------------------------------
        # 1. Koneksi ke database
        # --------------------------------------------------
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        print("=== KONEKSI DATABASE ===")
        print("MySQL berhasil terhubung.")

        # --------------------------------------------------
        # 2. Ambil master komoditas dari MySQL
        # --------------------------------------------------
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

        # --------------------------------------------------
        # 3. Variabel pencatatan hasil import
        # --------------------------------------------------
        inserted = 0
        duplicate = 0
        skipped_unknown = 0
        skipped_invalid = 0

        unknown_names = set()

        # --------------------------------------------------
        # 4. Baca CSV
        # --------------------------------------------------
        with open(
            CSV_PATH,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as file:

            reader = csv.DictReader(file)

            print()
            print("Kolom CSV:", reader.fieldnames)

            # Sesuai struktur asli CSV Google Colab
            required_columns = {
                "commodity",
                "MAE",
                "RMSE",
                "MAPE",
            }

            csv_columns = set(reader.fieldnames or [])

            if not required_columns.issubset(csv_columns):
                raise ValueError(
                    "Struktur CSV tidak sesuai.\n"
                    f"Kolom ditemukan: {reader.fieldnames}\n"
                    f"Kolom diperlukan: {sorted(required_columns)}"
                )

            print()
            print("=== PROSES IMPORT EVALUATION ===")

            # --------------------------------------------------
            # 5. Proses setiap baris
            # --------------------------------------------------
            for row_number, row in enumerate(reader, start=2):

                commodity_name = row["commodity"].strip()
                normalized_commodity = normalize_name(commodity_name)

                # Cek apakah komoditas tersedia di MySQL
                if normalized_commodity not in commodity_map:
                    skipped_unknown += 1
                    unknown_names.add(commodity_name)
                    continue

                mysql_commodity_id = commodity_map[
                    normalized_commodity
                ]

                # Ambil nilai evaluasi dari CSV
                try:
                    mae_text = row["MAE"].strip()
                    rmse_text = row["RMSE"].strip()
                    mape_text = row["MAPE"].strip()

                    if not mae_text or not rmse_text or not mape_text:
                        raise ValueError("Nilai evaluasi kosong")

                    mae = float(mae_text)
                    rmse = float(rmse_text)
                    mape = float(mape_text)

                except (ValueError, AttributeError):
                    skipped_invalid += 1

                    print(
                        f"[BARIS {row_number}] "
                        f"Nilai evaluasi tidak valid: "
                        f"{commodity_name}"
                    )

                    continue

                # --------------------------------------------------
                # 6. Insert ke tabel evaluations
                # --------------------------------------------------
                try:
                    cursor.execute(
                        """
                        INSERT INTO evaluations
                            (
                                commodity_id,
                                mae,
                                rmse,
                                mape
                            )
                        VALUES
                            (
                                %s,
                                %s,
                                %s,
                                %s
                            )
                        """,
                        (
                            mysql_commodity_id,
                            mae,
                            rmse,
                            mape,
                        ),
                    )

                    inserted += 1

                except mysql.connector.IntegrityError as e:

                    # Duplicate commodity_id
                    if e.errno == 1062:
                        duplicate += 1
                    else:
                        raise

        # --------------------------------------------------
        # 7. Simpan ke database
        # --------------------------------------------------
        connection.commit()

        # --------------------------------------------------
        # 8. Ringkasan hasil import
        # --------------------------------------------------
        print()
        print("=== HASIL IMPORT EVALUATION ===")
        print(f"Data berhasil masuk   : {inserted}")
        print(f"Data duplikat         : {duplicate}")
        print(f"Komoditas tidak cocok : {skipped_unknown}")
        print(f"Data tidak valid      : {skipped_invalid}")

        if unknown_names:
            print()
            print("Nama komoditas yang tidak ditemukan di MySQL:")

            for name in sorted(unknown_names):
                print(f"- {name}")

        # --------------------------------------------------
        # 9. Hitung total evaluasi
        # --------------------------------------------------
        cursor.execute("""
            SELECT COUNT(*) AS jumlah
            FROM evaluations
        """)

        total = cursor.fetchone()["jumlah"]

        print()
        print(f"Total tabel evaluations: {total}")

        # --------------------------------------------------
        # 10. Tampilkan ringkasan per komoditas
        # --------------------------------------------------
        cursor.execute("""
            SELECT
                c.id,
                c.name,
                e.mae,
                e.rmse,
                e.mape
            FROM commodities c
            LEFT JOIN evaluations e
                ON e.commodity_id = c.id
            ORDER BY c.id
        """)

        results = cursor.fetchall()

        print()
        print("=== RINGKASAN EVALUASI PER KOMODITAS ===")

        for row in results:
            print(
                f'{row["id"]}. '
                f'{row["name"]}: '
                f'MAE={row["mae"]} | '
                f'RMSE={row["rmse"]} | '
                f'MAPE={row["mape"]}'
            )

        print()
        print("IMPORT SELESAI")

    # --------------------------------------------------
    # Penanganan error MySQL
    # --------------------------------------------------
    except Error as e:

        if connection:
            connection.rollback()

        print()
        print("IMPORT GAGAL - MYSQL")
        print(e)

    # --------------------------------------------------
    # Penanganan validasi CSV
    # --------------------------------------------------
    except ValueError as e:

        if connection:
            connection.rollback()

        print()
        print("IMPORT GAGAL - VALIDASI DATA")
        print(e)

    # --------------------------------------------------
    # Error lainnya
    # --------------------------------------------------
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