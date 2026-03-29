import uuid
from conftest import client


def test_full_crud_flow(auth_headers):
    # 1. CREATE
    new_movie = {
        "title": f"Test Movie {uuid.uuid4()}",
        "director": "Test Director",
        "year": 2024,
        "rating": 8,
        "watched": False
    }

    create_res = client.post("/movies", json=new_movie, headers=auth_headers)
    assert create_res.status_code == 201

    movie_id = create_res.json()["id"]

    # 2. GET ALL
    get_res = client.get("/movies", headers=auth_headers)
    assert get_res.status_code == 200

    # 3. UPDATE
    update_res = client.put(
        f"/movies/{movie_id}",
        json={**new_movie, "rating": 9},
        headers=auth_headers
    )
    assert update_res.status_code == 200

    # 4. DELETE
    delete_res = client.delete(f"/movies/{movie_id}", headers=auth_headers)
    assert delete_res.status_code == 204