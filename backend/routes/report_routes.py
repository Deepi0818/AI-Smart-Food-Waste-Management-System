"""report_routes.py -- Generates and serves the PDF impact report."""

import os
from flask import Blueprint, request, jsonify, send_file, current_app
from database import get_connection
from utils.auth import token_required
from utils.pdf_report import generate_report

report_bp = Blueprint("report", __name__, url_prefix="/api/report")


@report_bp.route("/pdf", methods=["GET"])
@token_required
def pdf_report():
    uid = request.user["user_id"]
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT name FROM users WHERE id = ?", (uid,))
    user_row = cur.fetchone()
    user_name = user_row["name"] if user_row else "User"

    cur.execute("SELECT COUNT(*) c, COALESCE(AVG(confidence),0) a FROM predictions WHERE user_id=?", (uid,))
    pr = cur.fetchone()
    cur.execute("SELECT COALESCE(SUM(predicted_waste_kg),0) w, COALESCE(SUM(co2_saved_kg),0) co2, "
                "COALESCE(SUM(people_feedable),0) p FROM predictions WHERE user_id=?", (uid,))
    agg = cur.fetchone()
    cur.execute("SELECT COUNT(*) c, COALESCE(SUM(quantity_kg),0) q FROM donations WHERE user_id=?", (uid,))
    dr = cur.fetchone()
    cur.execute("SELECT COUNT(*) c FROM donations WHERE user_id=? AND status='Delivered'", (uid,))
    delivered = cur.fetchone()["c"]

    summary = {
        "total_predictions": pr["c"], "avg_prediction_confidence": round(pr["a"], 1),
        "total_waste_estimated_kg": round(agg["w"], 1), "total_co2_saved_kg": round(agg["co2"], 1),
        "total_people_feedable": int(agg["p"]), "total_donations": dr["c"],
        "total_food_donated_kg": round(dr["q"], 1), "donations_delivered": delivered,
    }

    cur.execute("SELECT substr(created_at,1,10) d, predicted_waste_kg FROM predictions "
                "WHERE user_id=? ORDER BY created_at", (uid,))
    from collections import defaultdict
    daily = defaultdict(float)
    for r in cur.fetchall():
        daily[r["d"]] += r["predicted_waste_kg"]
    trends = {"waste_over_time": [{"date": k, "waste_kg": round(v, 1)} for k, v in sorted(daily.items())]}

    cur.execute("SELECT * FROM predictions WHERE user_id=? ORDER BY created_at DESC LIMIT 10", (uid,))
    recent = [dict(r) for r in cur.fetchall()]
    conn.close()

    report_dir = current_app.config["REPORT_FOLDER"]
    os.makedirs(report_dir, exist_ok=True)
    save_path = os.path.join(report_dir, f"impact_report_user{uid}.pdf")
    generate_report(user_name, summary, trends, recent, save_path)

    return send_file(save_path, mimetype="application/pdf", as_attachment=True,
                      download_name="FoodWaste_Impact_Report.pdf")
