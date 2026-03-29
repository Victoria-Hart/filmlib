import os
import sys
import uuid
import pytest
from fastapi.testclient import TestClient

# Make backend imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set testing mode
os.environ["TESTING"] = "true"

# Import app + db
from app import app
from database import db

# Test client
client = TestClient(app)


# Clear DB before each test
@pytest.fixture(autouse=True)
def clear_database():
    db["movies"].delete_many({})
    db["users"].delete_many({})  # IMPORTANT: clear users too


# Auth headers fixture
@pytest.fixture
def auth_headers():
    user = {
        "username": f"user_{uuid.uuid4()}",
        "password": "testpassword"
    }

    # Register
    client.post("/auth/register", json=user)

    # Login
    res = client.post("/auth/login", json=user)
    assert res.status_code == 200
    token = res.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }