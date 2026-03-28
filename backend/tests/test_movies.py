import uuid
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_full_crud_flow():
    # 1. CREATE    
    new_movie = {
        "title": f"Test Movie {uuid.uuid4()}",
        "director": "Test Director",
        "year": 2024,
        "rating": 8,
        "watched": False
    }

    create_res = client.post("/movies", json=new_movie)
    print(create_res.status_code)
    print(create_res.json())
    assert create_res.status_code == 201

    created = create_res.json()
    movie_id = created["id"]

    # 2. GET ONE
    get_res = client.get(f"/movies/{movie_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == new_movie["title"]

    # 3. UPDATE
    updated_data = {**new_movie, "rating": 9}

    update_res = client.put(f"/movies/{movie_id}", json=updated_data)
    assert update_res.status_code == 200
    assert update_res.json()["rating"] == 9

    # 4. GET ALL
    list_res = client.get("/movies")
    assert list_res.status_code == 200
    assert any(m["id"] == movie_id for m in list_res.json())

    # 5. DELETE
    delete_res = client.delete(f"/movies/{movie_id}")
    assert delete_res.status_code == 204

    # 6. VERIFY DELETED
    get_deleted = client.get(f"/movies/{movie_id}")
    assert get_deleted.status_code == 404