
def movie_model(movie) -> dict:
    return {
        "id": str(movie["_id"]),
        "title": movie["title"],
        "director": movie["director"],
        "year": movie["year"],
        "rating": movie["rating"],
        "watched": movie["watched"],
        "poster": movie.get("poster"),
    }

def movie_list(movies) -> list:
    return [movie_model(movie) for movie in movies]