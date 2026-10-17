from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def fetch_all(query, params=None):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(query, params or ())
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "API Prediksi Harga Pangan Maluku aktif"
    })


@app.route("/api/test-db")
def test_db():
    try:
        rows = fetch_all("SELECT DATABASE() AS database_name")
        return jsonify({
            "success": True,
            "message": "Koneksi Flask ke MySQL berhasil",
            "database": rows[0]["database_name"]
        })
    except Error as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/commodities")
def get_commodities():
    try:
        rows = fetch_all(
            "SELECT id, name, unit FROM commodities ORDER BY id"
        )
        return jsonify({"success": True, "data": rows})
    except Error as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/harga")
def get_prices():
    try:
        commodity_id = request.args.get("commodityId")

        query = """
            SELECT p.id, p.commodity_id, c.name AS commodity,
                   p.date, p.price
            FROM prices p
            JOIN commodities c ON c.id = p.commodity_id
        """
        params = ()

        if commodity_id:
            query += " WHERE p.commodity_id = %s"
            params = (commodity_id,)

        query += " ORDER BY p.date"

        rows = fetch_all(query, params)

        for row in rows:
            row["date"] = row["date"].isoformat()
            row["price"] = float(row["price"])

        return jsonify({"success": True, "data": rows})
    except Error as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/actual-vs-predicted")
def get_predictions():
    try:
        commodity_id = request.args.get("commodityId")

        query = """
            SELECT p.id, p.commodity_id, c.name AS commodity,
                   p.date, p.actual_price, p.predicted_price
            FROM predictions p
            JOIN commodities c ON c.id = p.commodity_id
        """
        params = ()

        if commodity_id:
            query += " WHERE p.commodity_id = %s"
            params = (commodity_id,)

        query += " ORDER BY p.date"

        rows = fetch_all(query, params)

        for row in rows:
            row["date"] = row["date"].isoformat()
            for key in ("actual_price", "predicted_price"):
                if row[key] is not None:
                    row[key] = float(row[key])

        return jsonify({"success": True, "data": rows})
    except Error as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/evaluasi")
def get_evaluations():
    try:
        rows = fetch_all("""
            SELECT e.id, e.commodity_id, c.name AS commodity,
                   e.mae, e.rmse, e.mape
            FROM evaluations e
            JOIN commodities c ON c.id = e.commodity_id
            ORDER BY e.commodity_id
        """)

        for row in rows:
            for key in ("mae", "rmse", "mape"):
                if row[key] is not None:
                    row[key] = float(row[key])

        return jsonify({"success": True, "data": rows})
    except Error as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/forecast")
def get_forecast():
    try:
        commodity_id = request.args.get("commodityId")

        query = """
            SELECT f.id, f.commodity_id, c.name AS commodity,
                   f.date, f.predicted_price
            FROM forecasts f
            JOIN commodities c ON c.id = f.commodity_id
        """
        params = ()

        if commodity_id:
            query += " WHERE f.commodity_id = %s"
            params = (commodity_id,)

        query += " ORDER BY f.date"

        rows = fetch_all(query, params)

        for row in rows:
            row["date"] = row["date"].isoformat()
            row["predicted_price"] = float(row["predicted_price"])

        return jsonify({"success": True, "data": rows})
    except Error as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/model")
def get_model():
    return jsonify({
        "success": True,
        "data": {
            "algorithm": "LSTM",
            "status": "Menunggu hasil training dari Google Colab"
        }
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)