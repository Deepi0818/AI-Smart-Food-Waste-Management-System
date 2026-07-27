"""ngo_routes.py -- NGO Finder module (list + haversine distance sorting)."""

import math
from flask import Blueprint, request, jsonify
from database import get_connection
from utils.auth import token_required

ngo_bp = Blueprint("ngo", __name__, url_prefix="/api/ngo")


def _haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@ngo_bp.route("", methods=["GET"])
@token_required
def list_ngos():
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM ngos")
    ngos = [dict(r) for r in cur.fetchall()]
    conn.close()

    if lat is not None and lng is not None:
        for n in ngos:
            n["distance_km"] = round(_haversine_km(lat, lng, n["latitude"], n["longitude"]), 2)
            n["maps_url"] = f"https://www.google.com/maps/dir/?api=1&destination={n['latitude']},{n['longitude']}"
        ngos.sort(key=lambda n: n["distance_km"])
    else:
        for n in ngos:
            n["maps_url"] = f"https://www.google.com/maps/dir/?api=1&destination={n['latitude']},{n['longitude']}"

    return jsonify(ngos)


@ngo_bp.route("/<int:ngo_id>", methods=["GET"])
@token_required
def get_ngo(ngo_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM ngos WHERE id = ?", (ngo_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "NGO not found"}), 404
    return jsonify(dict(row))
