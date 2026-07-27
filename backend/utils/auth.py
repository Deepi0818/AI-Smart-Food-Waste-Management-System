"""
auth.py
JWT-based authentication helpers: token creation, verification decorator.
"""

import os
import jwt
from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import request, jsonify

SECRET_KEY = os.environ.get("FOODWASTE_SECRET_KEY", "dev-secret-change-in-production-2026")
TOKEN_EXPIRY_HOURS = 12


def generate_token(user_id, email, role="user"):
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401

        payload = decode_token(token)
        if payload is None:
            return jsonify({"error": "Token is invalid or expired"}), 401

        request.user = payload
        return f(*args, **kwargs)
    return decorated
