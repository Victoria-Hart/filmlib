from fastapi import APIRouter, HTTPException, status
from schemas.movie import Movie
from models.movie_model import movie_list
from database import movies_collection
from bson import ObjectId
import requests
import os

router = APIRouter(prefix="/movies", tags=["Movies"])


def serialize_movie(movie) -> dict:
    return {
        "id": str(movie["_id"]),
        "title": movie["title"],
        "director": movie["director"],
        "year": movie["year"],
        "rating": movie["rating"],
        "watched": movie["watched"],
        "poster": movie.get("poster"),
    }


# ========================
# CREATE
# ========================
@router.post("/")
def create_movie(movie: Movie):
    movie_data = movie.model_dump()

    OMDB_API_KEY = os.getenv("OMDB_API_KEY")

    # Fetch poster from OMDb
    try:
        response = requests.get(
            "https://www.omdbapi.com/",
            params={
                "t": movie.title.strip(),
                "apikey": OMDB_API_KEY
            }
        )
        data = response.json()

        if data.get("Poster") and data["Poster"] != "N/A":
            movie_data["poster"] = data["Poster"]
        else:
            movie_data["poster"] = None

    except Exception:
        movie_data["poster"] = None

    result = movies_collection.insert_one(movie_data)

    return {"id": str(result.inserted_id)}, status.HTTP_201_CREATED


# ========================
# READ ALL
# ========================
@router.get("/")
def get_movies():
    movies = movies_collection.find()
    return movie_list(movies)


# ========================
# READ ONE
# ========================
@router.get("/{movie_id}")
def get_movie(movie_id: str):
    try:
        obj_id = ObjectId(movie_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

    movie = movies_collection.find_one({"_id": obj_id})

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    return serialize_movie(movie)


# ========================
# UPDATE
# ========================
@router.put("/{movie_id}")
def update_movie(movie_id: str, movie: Movie):
    try:
        obj_id = ObjectId(movie_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = movies_collection.update_one(
        {"_id": obj_id},
        {"$set": movie.model_dump()}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Movie not found")

    return {"message": "Movie updated"}


# ========================
# DELETE
# ========================
@router.delete("/{movie_id}")
def delete_movie(movie_id: str):
    try:
        obj_id = ObjectId(movie_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = movies_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Movie not found")

    return {"message": "Movie deleted"}
