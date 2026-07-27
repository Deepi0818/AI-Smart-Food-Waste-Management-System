"""
app.py
Main Flask application entry point for the AI Smart Food Waste Analysis
& Redistribution System backend.
"""

import os
from flask import Flask, jsonify
from database import init_db

from routes.auth_routes import auth_bp
from routes.prediction_routes import prediction_bp
from routes.image_routes import image_bp
from routes.donation_routes import donation_bp
from routes.ngo_routes import ngo_bp
from routes.dashboard_routes import dashboard_bp
from routes.history_routes import history_bp
from routes.report_routes import report_bp
from routes.chatbot_routes import chatbot_bp
from routes.notification_routes import notification_bp
from routes.settings_routes import settings_bp

BASE_DIR = os.path.dirname(__file__)


def create_app():
    app = Flask(__name__)
    app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")
    app.config["REPORT_FOLDER"] = os.path.join(BASE_DIR, "reports")
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB upload cap

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["REPORT_FOLDER"], exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "qr"), exist_ok=True)

    init_db()

    # ---- Manual CORS (no internet access to install flask-cors) ----
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return response

    @app.route("/api/<path:_unused>", methods=["OPTIONS"])
    def cors_preflight(_unused):
        return "", 204

    # ---- Blueprints ----
    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(donation_bp)
    app.register_blueprint(ngo_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(settings_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "AI Smart Food Waste Analysis & Redistribution System API"})

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
