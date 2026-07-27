"""settings_routes.py -- Settings module: theme, language, profile."""

from flask import Blueprint, request, jsonify
from database import get_connection
from utils.auth import token_required

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")


@settings_bp.route("", methods=["GET"])
@token_required
def get_settings():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT theme, language, name, email FROM users WHERE id = ?", (request.user["user_id"],))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(row))


@settings_bp.route("", methods=["PUT"])
@token_required
def update_settings():
    data = request.get_json(force=True)
    fields, params = [], []
    for key in ("theme", "language", "name"):
        if key in data:
            fields.append(f"{key} = ?")
            params.append(data[key])
    if not fields:
        return jsonify({"error": "No valid fields provided"}), 400

    params.append(request.user["user_id"])
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return jsonify({"message": "Settings updated successfully"})
