# filmlib
## Victoria Hart

## UI Preview
<p align="center">
<img src="https://github.com/Victoria-Hart/filmlib/blob/main/docs/library-preview.jpg" width="45%" />
<img src="https://github.com/Victoria-Hart/filmlib/blob/main/docs/search-empty-preview.jpg" width="45%" />
</p>

---

## Overview  
Filmlib is a fullstack movie library application built with FastAPI and React. Users can register, log in/out, and manage their own personal movie collection with full CRUD functionality, dynamic filtering, and automatic movie data and poster integration via the OMDb API.

---

## Requirements  

- Structured FastAPI backend (models, schemas, routes) — `backend/models/`, `backend/schemas/`, `backend/routes/`
- Full CRUD functionality (POST, GET all, GET by ID, PUT, DELETE) — `backend/routes/movie_routes.py`
- Data validation with Pydantic — `backend/schemas/movie.py`, `backend/schemas/user.py`
- Error handling using HTTPException and status codes (200, 201, 404, etc.) — `backend/routes/movie_routes.py`
- CORS configuration for frontend integration — `backend/app.py`
- MongoDB database integration — `backend/database.py`
- React frontend consuming backend API — `frontend/src/`

---

## Additional Features  

- JWT-based authentication (login/register) and password hashing
- User-specific data isolation (multi-user support)
- OMDb API integration (auto-fetch movie data and posters)
- Live search functionality
- Watched status tracking and filtering (all / watched / not watched)
- Dynamic sorting by title, year, rating, director
- Frontend form validation
- Responsive UI
- CI pipeline with GitHub Actions

---

## Setup Instructions  

### 1. Start Backend

```
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app:app --reload
```

---

### 2. Start Frontend  

```
cd frontend
npm install
npm run dev
```

---

### 3. Environment Variables  

Create a private `.env` file in the backend directory.  
See `.env.example` for reference.

```
MONGO_URI=your_mongodb_connection_string
OMDB_API_KEY=your_omdb_api_key
SECRET_KEY=your_secret_key
```

---

## API Endpoints  

### Authentication  

| Method | Endpoint        | Description                  |
|--------|---------------|------------------------------|
| POST   | /auth/register | Register a new user          |
| POST   | /auth/login    | Login and receive JWT token  |
| POST   | /auth/logout   | Logout user                  |

---

> All movie and OMDb routes require authentication via JWT.

### Movies  

| Method | Endpoint            | Description                    |
|--------|--------------------|--------------------------------|
| POST   | /movies            | Create a new movie             |
| GET    | /movies            | Get all movies (user-specific) |
| GET    | /movies/{movie_id} | Get a single movie             |
| PUT    | /movies/{movie_id} | Update a movie                 |
| DELETE | /movies/{movie_id} | Delete a movie                 |

---

### External API Integration  

| Method | Endpoint                | Description                                      |
|--------|------------------------|--------------------------------------------------|
| GET    | /movies/search_omdb    | Search OMDb movies (`query` parameter required)  |
| GET    | /movies/omdb/{imdb_id} | Get OMDb movie details by IMDb ID                |

---

### API Docs  

Interactive documentation available at:

```
http://127.0.0.1:8000/docs
```

---

## Project Structure  

```
filmlib/
├── backend/
│   ├── app.py
│   ├── database.py
│   │
│   ├── models/
│   │   └── __init__.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   └── movie_routes.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── movie.py
│   │   └── user.py
│   │
│   ├── utils/
│   │   ├── auth.py
│   │   └── security.py
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_health.py
│   │   └── test_movies.py
│   │
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   │
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   │
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── no-poster.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   │
│   │   └── utils/
│   │       └── validation.ts
│   │
│   └── tsconfig*.json
│
├── docs/
│   ├── library-preview.jpg
│   └── search-empty-preview.jpg
│
└── README.md
```
---
