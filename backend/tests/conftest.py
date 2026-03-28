import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ["TESTING"] = "true"

from database import db

@pytest.fixture(autouse=True)
def clear_database():
    db["movies"].delete_many({})