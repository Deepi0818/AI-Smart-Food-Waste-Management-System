"""prediction_routes.py -- AI Food Waste Prediction module."""

from flask import Blueprint, request, jsonify
from database import get_connection, now_iso
from utils.auth import token_required
from models.waste_predictor import predict_waste, get_model_metrics, EVENT_TYPES, FOOD_TYPES, MEAL_TYPES

prediction_bp = Blueprint("prediction", __name__, url_prefix="/api/prediction")


@prediction_bp.route("/options", methods=["GET"])
def options():
    return jsonify({"event_types": EVENT_TYPES, "food_types": FOOD_TYPES, "meal_types": MEAL_TYPES})


@prediction_bp.route("/model-info", methods=["GET"])
def model_info():
    return jsonify(get_model_metrics())


@prediction_bp.route("/predict", methods=["POST"])
@token_required
def predict():
    data = request.get_json(force=True)
    try:
        guests = int(data.get("guests"))
        event_type = data["event_type"]
        food_type = data["food_type"]
        meal_type = data["meal_type"]
        event_date = data.get("event_date", "")
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "guests, event_type, food_type and meal_type are required"}), 400

    if guests <= 0:
        return jsonify({"error": "Guests must be a positive number"}), 400

    result = predict_waste(event_type, guests, food_type, meal_type)

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO predictions (user_id, event_type, guests, food_type, meal_type, event_date,
           predicted_waste_kg, confidence, recommendation, co2_saved_kg, people_feedable, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (request.user["user_id"], event_type, guests, food_type, meal_type, event_date,
         result["predicted_waste_kg"], result["confidence"], result["recommendation"],
         result["co2_saved_kg"], result["people_feedable"], now_iso()),
    )
    conn.commit()
    prediction_id = cur.lastrowid

    cur.execute(
        "INSERT INTO notifications (user_id, message, type, created_at) VALUES (?, ?, ?, ?)",
        (request.user["user_id"], f"Prediction completed: {result['predicted_waste_kg']} kg estimated for {event_type}",
         "prediction", now_iso()),
    )
    conn.commit()
    conn.close()

    result["id"] = prediction_id
    result["event_type"] = event_type
    result["food_type"] = food_type
    result["meal_type"] = meal_type
    result["guests"] = guests
    result["event_date"] = event_date
    return jsonify(result), 201
