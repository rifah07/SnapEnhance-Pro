from flask import Blueprint, request, jsonify, send_from_directory
import os
from backend.app.utils.effects import process_image
from backend.db import log_image_processing, get_processing_history

bp = Blueprint('api', __name__)

# Constants
UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

@bp.route("/upload", methods=["POST"])
def upload():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    effect = request.form.get("effect", "grayscale")
    
    # Save original file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    # Process image
    output_path = process_image(file_path, effect)
    
    # Log to MongoDB
    log_image_processing(file_path, output_path, effect)
    
    return jsonify({
        "processed_image": f"/processed/{os.path.basename(output_path)}",
        "effect": effect
    })

@bp.route("/processed/<filename>")
def get_processed_image(filename):
    return send_from_directory(PROCESSED_FOLDER, filename)

@bp.route("/history", methods=["GET"])
def get_history():
    history = get_processing_history()
    return jsonify(history)

@bp.route("/")
def home():
    return jsonify({
        "status": "API Ready",
        "endpoints": {
            "upload": "POST /upload",
            "history": "GET /history",
            "processed": "GET /processed/<filename>"
        }
    })