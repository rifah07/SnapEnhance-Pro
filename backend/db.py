from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["snapenhance_db"]

# Collections
processed_images = db["processed_images"]

def log_image_processing(original_path: str, processed_path: str, effect: str):
    """Logs each image processing operation to MongoDB"""
    try:
        processed_images.insert_one({
            "original_filename": os.path.basename(original_path),
            "processed_filename": os.path.basename(processed_path),
            "effect": effect,
            "timestamp": datetime.now(),
            "file_size_kb": round(os.path.getsize(processed_path) / 1024, 2)
        })
        # Create indexes if they don't exist
        processed_images.create_index("timestamp")
        processed_images.create_index("effect")
    except Exception as e:
        print(f"Error logging to MongoDB: {e}")

def get_processing_history(limit=10):
    """Retrieves recent processing history"""
    try:
        return list(processed_images.find(
            {},
            {"_id": 0, "original_filename": 1, "processed_filename": 1, 
             "effect": 1, "timestamp": 1, "file_size_kb": 1}
        ).sort("timestamp", -1).limit(limit))
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []