"""image_routes.py -- Food Image AI (freshness detection) module."""

import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from utils.auth import token_required
from models.freshness_classifier import classify_image, get_model_metrics

image_bp = Blueprint("image", __name__, url_prefix="/api/image")

ALLOWED_EXT = {"png", "jpg", "jpeg", "webp"}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT


@image_bp.route("/model-info", methods=["GET"])
def model_info():
    return jsonify(get_model_metrics())


@image_bp.route("/analyze", methods=["POST"])
@token_required
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded (field name must be 'image')"}), 400

    file = request.files["image"]
    if file.filename == "" or not _allowed(file.filename):
        return jsonify({"error": "Please upload a valid image file (png, jpg, jpeg, webp)"}), 400

    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    safe_name = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    save_path = os.path.join(upload_dir, safe_name)
    file.save(save_path)

    try:
        result = classify_image(save_path)
    except Exception as e:
        return jsonify({"error": f"Could not analyze image: {str(e)}"}), 422

    result["stored_filename"] = safe_name
    return jsonify(result)
