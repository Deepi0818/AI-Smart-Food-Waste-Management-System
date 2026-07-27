"""auth_routes.py -- Register, login, forgot-password (demo), profile."""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_connection, now_iso
from utils.auth import generate_token, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cur.fetchone():
        conn.close()
        return jsonify({"error": "An account with this email already exists"}), 409

    cur.execute(
        "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (name, email, generate_password_hash(password), now_iso()),
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()

    token = generate_token(user_id, email, "user")
    return jsonify({
        "message": "Account created successfully",
        "token": token,
        "user": {"id": user_id, "name": name, "email": email, "role": "user"},
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cur.fetchone()
    conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user["id"], user["email"], user["role"])
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]},
    })


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    # Demo-safe implementation: does not actually send email, confirms request receipt only.
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    return jsonify({"message": "If an account exists for this email, password reset instructions have been sent."})


@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role, theme, language, created_at FROM users WHERE id = ?",
                (request.user["user_id"],))
    user = cur.fetchone()
    conn.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(user))
