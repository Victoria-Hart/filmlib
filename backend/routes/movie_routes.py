from fastapi import APIRouter, HTTPException, status, Query
from schemas.movie import Movie
from models.movie_model import movie_list
from database import movies_collection
from bson import ObjectId
from bson.errors import InvalidId
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
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_movie(movie: Movie):
    movie_data = movie.model_dump()

    # ========================
    # DUPLICATE CHECK (NOT case-sensitive)
    # ========================
    existing_movie = movies_collection.find_one({
        "title": {"$regex": f"^{movie_data['title']}$", "$options": "i"},
        "year": movie_data["year"]
    })

    if existing_movie:
        raise HTTPException(
            status_code=400,
            detail="Movie already exists"
        )

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

    return {"id": str(result.inserted_id)}

# ========================
# OMDB SEARCH
# ========================
@router.get("/search_omdb")
def search_omdb(query: str):
    OMDB_API_KEY = os.getenv("OMDB_API_KEY")

    response = requests.get(
        "https://www.omdbapi.com/",
        params={
            "s": query,
            "apikey": OMDB_API_KEY
        }
    )

    return response.json()


# ========================
# OMDB DETAILS
# ========================
@router.get("/omdb/{imdb_id}")
def get_omdb_movie(imdb_id: str):
    OMDB_API_KEY = os.getenv("OMDB_API_KEY")

    response = requests.get(
        "https://www.omdbapi.com/",
        params={
            "i": imdb_id,
            "apikey": OMDB_API_KEY
        }
    )

    return response.json()

# ========================
# READ ALL
# ========================
@router.get("/")
def get_movies(
    watched: bool | None = Query(default=None),
    min_rating: int | None = Query(default=None),
    search: str | None = Query(default=None),
    sort: str | None = Query(default=None),
    order: str = Query(default="asc"),
):
    query = {}

    # ========================
    # FILTERING
    # ========================
    if watched is not None:
        query["watched"] = watched

    if min_rating is not None:
        query["rating"] = {"$gte": min_rating}

    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    # ========================
    # SORTING
    # ========================
    sort_field = None

    allowed_sorts = ["title", "director", "rating", "year"]

    if sort in allowed_sorts:
        sort_field = sort

    sort_order = 1 if order == "asc" else -1

    # ========================
    # DATABASE QUERY
    # ========================
    if sort_field:
        movies = movies_collection.find(query).sort(sort_field, sort_order)
    else:
        movies = movies_collection.find(query)

    return movie_list(movies)


# ========================
# READ ONE
# ========================
@router.get("/{movie_id}")
def get_movie(movie_id: str):
    try:
        obj_id = ObjectId(movie_id)
    except InvalidId:
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
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = movies_collection.update_one(
        {"_id": obj_id},
        {"$set": movie.model_dump()}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Movie not found")

    updated_movie = movies_collection.find_one({"_id": obj_id})
    return serialize_movie(updated_movie)


# ========================
# DELETE
# ========================
@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(movie_id: str):
    try:
        obj_id = ObjectId(movie_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = movies_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Movie not found")

    return