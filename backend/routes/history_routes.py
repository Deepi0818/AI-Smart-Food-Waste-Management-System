"""history_routes.py -- Prediction History: search, filter, sort, delete, export CSV/Excel."""

import io
import csv
from flask import Blueprint, request, jsonify, send_file
from openpyxl import Workbook
from database import get_connection
from utils.auth import token_required

history_bp = Blueprint("history", __name__, url_prefix="/api/history")

ALLOWED_SORT = {"created_at", "predicted_waste_kg", "confidence", "guests", "event_date"}


@history_bp.route("/predictions", methods=["GET"])
@token_required
def list_predictions():
    uid = request.user["user_id"]
    search = request.args.get("search", "").strip()
    event_type = request.args.get("event_type", "").strip()
    sort_by = request.args.get("sort_by", "created_at")
    order = request.args.get("order", "desc").upper()

    if sort_by not in ALLOWED_SORT:
        sort_by = "created_at"
    if order not in ("ASC", "DESC"):
        order = "DESC"

    query = "SELECT * FROM predictions WHERE user_id = ?"
    params = [uid]
    if search:
        query += " AND (event_type LIKE ? OR food_type LIKE ? OR meal_type LIKE ?)"
        like = f"%{search}%"
        params += [like, like, like]
    if event_type:
        query += " AND event_type = ?"
        params.append(event_type)
    query += f" ORDER BY {sort_by} {order}"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)


@history_bp.route("/predictions/<int:pred_id>", methods=["DELETE"])
@token_required
def delete_prediction(pred_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM predictions WHERE id = ? AND user_id = ?", (pred_id, request.user["user_id"]))
    conn.commit()
    deleted = cur.rowcount
    conn.close()
    if deleted == 0:
        return jsonify({"error": "Prediction not found"}), 404
    return jsonify({"message": "Prediction deleted"})


@history_bp.route("/predictions/<int:pred_id>", methods=["PUT"])
@token_required
def update_prediction(pred_id):
    data = request.get_json(force=True)
    notes_allowed_fields = ["event_date"]
    updates, params = [], []
    for field in notes_allowed_fields:
        if field in data:
            updates.append(f"{field} = ?")
            params.append(data[field])
    if not updates:
        return jsonify({"error": "No editable fields provided"}), 400

    params += [pred_id, request.user["user_id"]]
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"UPDATE predictions SET {', '.join(updates)} WHERE id = ? AND user_id = ?", params)
    conn.commit()
    updated = cur.rowcount
    conn.close()
    if updated == 0:
        return jsonify({"error": "Prediction not found"}), 404
    return jsonify({"message": "Prediction updated"})


def _fetch_all(uid):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC", (uid,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@history_bp.route("/export/csv", methods=["GET"])
@token_required
def export_csv():
    rows = _fetch_all(request.user["user_id"])
    output = io.StringIO()
    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    mem = io.BytesIO(output.getvalue().encode("utf-8"))
    mem.seek(0)
    return send_file(mem, mimetype="text/csv", as_attachment=True, download_name="prediction_history.csv")


@history_bp.route("/export/excel", methods=["GET"])
@token_required
def export_excel():
    rows = _fetch_all(request.user["user_id"])
    wb = Workbook()
    ws = wb.active
    ws.title = "Prediction History"
    if rows:
        headers = list(rows[0].keys())
        ws.append(headers)
        for r in rows:
            ws.append([r[h] for h in headers])
    for col in ws.columns:
        max_len = max((len(str(c.value)) for c in col if c.value is not None), default=10)
        ws.column_dimensions[col[0].column_letter].width = min(max_len + 2, 40)

    mem = io.BytesIO()
    wb.save(mem)
    mem.seek(0)
    return send_file(mem, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      as_attachment=True, download_name="prediction_history.xlsx")
