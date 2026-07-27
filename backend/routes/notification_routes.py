"""notification_routes.py -- Live Alerts module."""

from flask import Blueprint, request, jsonify
from database import get_connection
from utils.auth import token_required

notification_bp = Blueprint("notification", __name__, url_prefix="/api/notifications")


@notification_bp.route("", methods=["GET"])
@token_required
def list_notifications():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
                (request.user["user_id"],))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)


@notification_bp.route("/unread-count", methods=["GET"])
@token_required
def unread_count():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0",
                (request.user["user_id"],))
    count = cur.fetchone()["c"]
    conn.close()
    return jsonify({"unread_count": count})


@notification_bp.route("/<int:notif_id>/read", methods=["PATCH"])
@token_required
def mark_read(notif_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
                (notif_id, request.user["user_id"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Marked as read"})


@notification_bp.route("/read-all", methods=["PATCH"])
@token_required
def mark_all_read():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (request.user["user_id"],))
    conn.commit()
    conn.close()
    return jsonify({"message": "All notifications marked as read"})
