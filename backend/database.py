from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")
client = MongoClient(uri)

db_name = "test_db" if os.getenv("TESTING") == "true" else "filmlib"

db = client[db_name]
movies_collection = db["movies"]