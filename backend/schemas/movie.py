from pydantic import BaseModel
from typing import Optional

class Movie(BaseModel):
    title: str
    director: str
    year: int
    rating: int
    watched: bool = False
    poster: Optional[str] = None