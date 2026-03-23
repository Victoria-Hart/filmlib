# filmlib

Victoria Hart

## Project Overview

Filmlib is a fullstack movie collection and CRUD application built with FastAPI (backend) and React (frontend). The application allows users to create, view, update, and delete movies, with poster data automatically fetched from the OMDb API.

---

## Requirements

* Full CRUD functionality - backend/routes/movie_routes.py
* Structured backend (models, schemas, routes) with FastAPI
* MongoDB database integration - backend/database.py
* React frontend - frontend/src/App.tsx
* RESTful API structure - backend/routes/movie_routes.py
* Validation with Pydantic - backend/schemas/movie.py
* Error handling with HTTPException and status codes (200, 201, 204, 400, 404) - backend/routes/movie_routes.py

---

## Features

- Create, Read, Update, and Delete movies  
- Poster auto-fetch from OMDb API  
- Watched status tracking  
- Filtering (all / watched / not watched)  
- Sorting by title (ignoring articles such as "The", "A", "An")  

---

## Project Structure

```
filmlib/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   └── routes/
├── frontend/
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

---

### 2. Backend setup

```
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Create a `.env` file:

```
MONGO_URI=your_mongodb_uri
OMDB_API_KEY=your_api_key
```

Run backend:

```
uvicorn app:app --reload
```

---

### 3. Frontend setup

```
cd frontend
npm install
npm run dev
```

---

## API Endpoints
API documentation available at:
```
http://127.0.0.1:8000/docs
```

| Method | Endpoint     | Description    |
| ------ | ------------ | -------------- |
| POST   | /movies      | Create movie   |
| GET    | /movies      | Get all movies |
| GET    | /movies/{id} | Get one movie  |
| PUT    | /movies/{id} | Update movie   |
| DELETE | /movies/{id} | Delete movie   |

---

## Example Movie Object

```
{
  "title": "Inception",
  "director": "Christopher Nolan",
  "year": 2010,
  "rating": 9,
  "watched": true,
  "poster": "https://m.media-amazon.com/images/movie-poster-image-URL.jpg"
}
```

---

## Environment Variables

Sensitive data is stored in `.env` and not committed to Git.
See `.env.example` for required variables.

---
