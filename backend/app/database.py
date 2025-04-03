import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
from typing import Optional

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class Database:
    _instance = None
    
    def __init__(self):
        if Database._instance is not None:
            raise Exception("Database is a singleton!")
        
        self.MONGO_URI = os.getenv("MONGO_URI")
        if not self.MONGO_URI:
            raise ValueError("MONGO_URI not found in environment variables")
        
        try:
            self.sync_client = MongoClient(self.MONGO_URI)
            self.async_client = AsyncIOMotorClient(self.MONGO_URI)
            self.sync_client.admin.command('ping')
            print("✅ Successfully connected to MongoDB")
        except ConnectionFailure as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

db_instance = Database.get_instance()
db = db_instance.sync_client.get_default_database()
async_db = db_instance.async_client.get_default_database()

# Collections
users_collection = db.users
image_processes_collection = db.image_processes
async_users_collection = async_db.users
async_image_processes_collection = async_db.image_processes