"""dashboard_routes.py -- Professional Dashboard: KPI cards, trends, charts data."""

from collections import defaultdict
from flask import Blueprint, request, jsonify
from database import get_connection
from utils.auth import token_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/summary", methods=["GET"])
@token_required
def summary():
    uid = request.user["user_id"]
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) c, COALESCE(AVG(confidence),0) a FROM predictions WHERE user_id=?", (uid,))
    pred_row = cur.fetchone()
    total_predictions, avg_confidence = pred_row["c"], round(pred_row["a"], 1)

    cur.execute("SELECT COALESCE(SUM(predicted_waste_kg),0) w, COALESCE(SUM(co2_saved_kg),0) co2, "
                "COALESCE(SUM(people_feedable),0) p FROM predictions WHERE user_id=?", (uid,))
    agg = cur.fetchone()

    cur.execute("SELECT COUNT(*) c, COALESCE(SUM(quantity_kg),0) q FROM donations WHERE user_id=?", (uid,))
    don_row = cur.fetchone()

    cur.execute("SELECT COUNT(*) c FROM donations WHERE user_id=? AND status='Delivered'", (uid,))
    delivered = cur.fetchone()["c"]

    conn.close()
    return jsonify({
        "total_predictions": total_predictions,
        "avg_prediction_confidence": avg_confidence,
        "total_waste_estimated_kg": round(agg["w"], 1),
        "total_co2_saved_kg": round(agg["co2"], 1),
        "total_people_feedable": int(agg["p"]),
        "total_donations": don_row["c"],
        "total_food_donated_kg": round(don_row["q"], 1),
        "donations_delivered": delivered,
    })


@dashboard_bp.route("/trends", methods=["GET"])
@token_required
def trends():
    uid = request.user["user_id"]
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT substr(created_at,1,10) d, predicted_waste_kg, confidence, event_type "
                "FROM predictions WHERE user_id=? ORDER BY created_at", (uid,))
    preds = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT substr(created_at,1,10) d, quantity_kg, status, category "
                "FROM donations WHERE user_id=? ORDER BY created_at", (uid,))
    dons = [dict(r) for r in cur.fetchall()]
    conn.close()

    daily_waste = defaultdict(float)
    for p in preds:
        daily_waste[p["d"]] += p["predicted_waste_kg"]

    by_event = defaultdict(float)
    for p in preds:
        by_event[p["event_type"]] += p["predicted_waste_kg"]

    by_status = defaultdict(int)
    for d in dons:
        by_status[d["status"]] += 1

    by_category = defaultdict(float)
    for d in dons:
        by_category[d["category"]] += d["quantity_kg"]

    return jsonify({
        "waste_over_time": [{"date": k, "waste_kg": round(v, 1)} for k, v in sorted(daily_waste.items())],
        "waste_by_event_type": [{"event_type": k, "waste_kg": round(v, 1)} for k, v in by_event.items()],
        "donations_by_status": [{"status": k, "count": v} for k, v in by_status.items()],
        "donations_by_category": [{"category": k, "quantity_kg": round(v, 1)} for k, v in by_category.items()],
    })


@dashboard_bp.route("/top-ngos", methods=["GET"])
@token_required
def top_ngos():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT n.name, n.category, COUNT(d.id) as donations_received, COALESCE(SUM(d.quantity_kg),0) as total_kg
        FROM ngos n LEFT JOIN donations d ON d.ngo_id = n.id
        GROUP BY n.id ORDER BY total_kg DESC LIMIT 5
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)
