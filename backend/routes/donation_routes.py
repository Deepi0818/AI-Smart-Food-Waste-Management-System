"""donation_routes.py -- Donate Food module (create, track, list, status update)."""

import os
import uuid
import random
import string
from flask import Blueprint, request, jsonify, current_app
from database import get_connection, now_iso
from utils.auth import token_required
from utils.qr_generator import generate_tracking_code_image

donation_bp = Blueprint("donation", __name__, url_prefix="/api/donation")


def _gen_donation_code():
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"DON-{now_iso()[:4]}-{suffix}"


@donation_bp.route("", methods=["POST"])
@token_required
def create_donation():
    data = request.get_json(force=True)
    required = ["food_name", "category", "quantity_kg", "location", "contact_number"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    code = _gen_donation_code()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO donations (user_id, donation_code, food_name, category, quantity_kg,
           cooking_time, expiry_time, location, contact_number, image_path, freshness_label,
           freshness_confidence, donation_eligible, notes, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (request.user["user_id"], code, data["food_name"], data["category"], float(data["quantity_kg"]),
         data.get("cooking_time"), data.get("expiry_time"), data["location"], data["contact_number"],
         data.get("stored_filename"), data.get("freshness_label"), data.get("freshness_confidence"),
         1 if data.get("donation_eligible") else 0, data.get("notes"), "Pending", now_iso()),
    )
    conn.commit()
    donation_id = cur.lastrowid

    qr_dir = os.path.join(current_app.config["REPORT_FOLDER"], "..", "qr")
    qr_path = os.path.join(qr_dir, f"{code}.png")
    generate_tracking_code_image(code, qr_path)

    cur.execute(
        "INSERT INTO notifications (user_id, message, type, created_at) VALUES (?, ?, ?, ?)",
        (request.user["user_id"], f"Donation {code} submitted successfully and is pending NGO pickup.",
         "donation", now_iso()),
    )
    conn.commit()

    cur.execute("SELECT * FROM donations WHERE id = ?", (donation_id,))
    row = dict(cur.fetchone())
    conn.close()
    row["tracking_image"] = f"/api/donation/{code}/qr"
    return jsonify(row), 201


@donation_bp.route("", methods=["GET"])
@token_required
def list_donations():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM donations WHERE user_id = ? ORDER BY created_at DESC", (request.user["user_id"],))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)


@donation_bp.route("/<code>", methods=["GET"])
@token_required
def get_donation(code):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM donations WHERE donation_code = ? AND user_id = ?",
                (code, request.user["user_id"]))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Donation not found"}), 404
    return jsonify(dict(row))


@donation_bp.route("/<code>/qr", methods=["GET"])
def get_qr(code):
    from flask import send_file
    qr_path = os.path.join(current_app.config["REPORT_FOLDER"], "..", "qr", f"{code}.png")
    if not os.path.exists(qr_path):
        return jsonify({"error": "Tracking image not found"}), 404
    return send_file(qr_path, mimetype="image/png")


@donation_bp.route("/<int:donation_id>/status", methods=["PATCH"])
@token_required
def update_status(donation_id):
    data = request.get_json(force=True)
    new_status = data.get("status")
    valid = {"Pending", "Accepted", "Picked Up", "Delivered", "Cancelled"}
    if new_status not in valid:
        return jsonify({"error": f"Status must be one of: {', '.join(valid)}"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE donations SET status = ?, ngo_id = COALESCE(?, ngo_id) WHERE id = ? AND user_id = ?",
                (new_status, data.get("ngo_id"), donation_id, request.user["user_id"]))
    conn.commit()
    if cur.rowcount == 0:
        conn.close()
        return jsonify({"error": "Donation not found"}), 404

    cur.execute("SELECT donation_code FROM donations WHERE id = ?", (donation_id,))
    code = cur.fetchone()["donation_code"]
    cur.execute(
        "INSERT INTO notifications (user_id, message, type, created_at) VALUES (?, ?, ?, ?)",
        (request.user["user_id"], f"Donation {code} status updated to {new_status}.", "donation", now_iso()),
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated", "status": new_status})
