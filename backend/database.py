from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv("MONGO_URI")

client = MongoClient(uri)

db = client["filmlib"]

movies_collection = db["movies"]
users_collection = db["users"]