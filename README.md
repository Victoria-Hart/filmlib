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

| Method | Endpoint            | Description                                  |
|--------|--------------------|----------------------------------------------|
| POST   | /movies            | Create a new movie in the collection         |
| GET    | /movies            | Get all movies (user-specific)               |
| GET    | /movies/{movie_id} | Get a single movie                           |
| PUT    | /movies/{movie_id} | Update a movie                               |
| DELETE | /movies/{movie_id} | Delete a movie                               |

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
│   ├── app.py                # FastAPI entry point (routes, middleware, CORS)
│   ├── database.py           # MongoDB connection and client setup
│   │
│   ├── models/               # Data models
│   │   ├── __init__.py
│   │   └── movie_model.py   
│   │
│   ├── routes/               # API endpoints
│   │   ├── __init__.py
│   │   ├── auth_routes.py    # User auth (register/login/logout)
│   │   └── movie_routes.py   # Movie CRUD + OMDb API integration
│   │
│   ├── schemas/              # Pydantic schemas (request/response validation)
│   │   ├── __init__.py
│   │   ├── movie.py
│   │   └── user.py
│   │
│   ├── utils/                # Backend helpers
│   │   ├── auth.py           # JWT dependency
│   │   └── security.py       # Password hashing and verification
│   │
│   ├── tests/                # Pytest unit tests
│   │   ├── conftest.py       # Test setup and fixtures
│   │   ├── test_health.py    # Basic API health check
│   │   └── test_movies.py    # Movie endpoint tests
│   │
│   ├── .env.example          # Example environment variables
│   └── requirements.txt      # Backend dependencies
│
├── frontend/
│   ├── index.html            # Root HTML template (Vite)
│   ├── package.json          # Project dependencies and scripts
│   ├── package-lock.json
│   ├── vite.config.ts        # Vite build/dev configuration
│   ├── eslint.config.js      # Linting configuration
│   │
│   ├── src/
│   │   ├── main.tsx          # React app entry point
│   │   ├── App.tsx           # Root React component
│   │   ├── App.css           # Component-level styling
│   │   ├── index.css         # Global styling (base styles, resets)
│   │   │
│   │   ├── assets/
│   │   │   └── no-poster.png # Fallback image for missing posters
│   │   │
│   │   └── utils/
│   │       └── validation.ts # Form validation logic
│   │
│   └── tsconfig*.json        # TypeScript configuration (app + node)
│
├── docs/                     # Screenshots for UI preview
│   ├── library-preview.jpg
│   └── search-empty-preview.jpg
│
└── README.md
```
---
