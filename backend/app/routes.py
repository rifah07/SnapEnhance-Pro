from flask import Blueprint, request, jsonify
import os
from .utils.effects import process_image

bp = Blueprint('api', __name__)

@bp.route("/upload", methods=["POST"])
def upload():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    effect = request.form.get("effect", "grayscale")
    
    # Save original
    upload_path = "uploads"
    os.makedirs(upload_path, exist_ok=True)
    file_path = os.path.join(upload_path, file.filename)
    file.save(file_path)
    
    # Process image
    output_path = process_image(file_path, effect)
    
    return jsonify({
        "processed_image": f"/processed/{os.path.basename(output_path)}"
    })

@bp.route("/")
def home():
    return jsonify({"status": "SnapEnhance API"})