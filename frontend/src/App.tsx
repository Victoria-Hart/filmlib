import { useEffect, useState } from "react";
import "./App.css";
import noPoster from "./assets/no-poster.png";
import { validateMovie } from "./utils/validation";

type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  rating: number;
  watched: boolean;
  poster?: string;
};

const API_URL = "http://localhost:8000/movies";
const AUTH_URL = "http://localhost:8000/auth";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "watched" | "not_watched">("all");
  const [sort, setSort] = useState<string>("title");
  const [order, setOrder] = useState<string>("asc");
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [omdbSearch, setOmdbSearch] = useState("");
  const [omdbResults, setOmdbResults] = useState<any[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });

  const [form, setForm] = useState({
    title: "",
    director: "",
    year: "",
    rating: "",
    watched: false
  });

  const fetchMovies = async () => {
    let url = API_URL + "/";
    const params = new URLSearchParams();

    if (filter === "watched") params.append("watched", "true");
    if (filter === "not_watched") params.append("watched", "false");
    if (sort) params.append("sort", sort);
    if (order) params.append("order", order);

    if (params.toString()) {
      url += "?" + params.toString();
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        setIsLoggedIn(false);
        return;
      }

      const data = await res.json();
      setMovies(data);
      setIsLoggedIn(true);
    } catch {
      setError("Network error");
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [filter, sort, order, search]);

  

  const normalize = (str: string) =>
  str
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/[^\w\s]/g, "")
    .trim();

  const filteredMovies = movies
    .filter((movie) => {
      if (filter === "watched" && !movie.watched) return false;
      if (filter === "not_watched" && movie.watched) return false;

      if (search) {
        if (!normalize(movie.title).includes(normalize(search))) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let result = 0;

      if (sort === "title") {
        result = normalize(a.title).localeCompare(normalize(b.title));
      } else if (sort === "director") {
        result = a.director.localeCompare(b.director);
      } else if (sort === "year") {
        result = a.year - b.year;
      } else if (sort === "rating") {
        result = (a.rating ?? 0) - (b.rating ?? 0);
      }

      return order === "asc" ? result : -result;
    });

  const handleAuth = async () => {
    setError(null);

    const endpoint = authMode === "login" ? "login" : "register";

    try {
      const res = await fetch(`${AUTH_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(authForm)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Auth failed");
        return;
      }

      if (authMode === "register") {
        setError("Account created! Please log in.");
        setAuthMode("login");
        setAuthForm({ username: "", password: "" });
        return;
      }

      localStorage.setItem("token", data.access_token);

      setAuthForm({ username: "", password: "" });
      await fetchMovies();

    } catch {
      setError("Network error");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMovies([]);
  };

const searchOMDb = async (query: string) => {
  if (!query || query.length < 3) {
    setOmdbResults([]);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/search_omdb?query=${query}`);
    const data = await res.json();

    if (data.Response === "False") {
      setOmdbResults([]);
      return;
    }

    setOmdbResults(data.Search || []);
  } catch {
    setOmdbResults([]);
  }
};

  const selectOMDbMovie = async (movie: any) => {
    setEditingId(null);
    try {
      const res = await fetch(`${API_URL}/omdb/${movie.imdbID}`);
      const data = await res.json();

      setForm({
        title: data.Title || "",
        director: data.Director || "",
        year: data.Year || "",
        rating: "",
        watched: false
      });

      setOmdbResults([]);
      setOmdbSearch("");
    } catch {}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const addMovie = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateMovie(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!isLoggedIn) {
      setError("Please log in to add movies");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL + "/";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          rating: Number(form.rating)
        })
      });

      if (res.status === 401) {
        setIsLoggedIn(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Something went wrong");
        return;
      }

      setEditingId(null);
      setForm({
        title: "",
        director: "",
        year: "",
        rating: "",
        watched: false
      });

      fetchMovies();
    } catch {
      setError("Network error");
    }
  };

  const editMovie = (movie: Movie) => {
    setEditingId(movie.id);

    setForm({
      title: movie.title,
      director: movie.director,
      year: String(movie.year),
      rating: String(movie.rating),
      watched: movie.watched
    });
  };

  const deleteMovie = async (id: string) => {
    if (!isLoggedIn) return;

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    fetchMovies();
  };

  return (
  <div className="app">
    <div className="header">
      <div className="header-left">
        <div className="omdb-search-wrapper">
          <input
            className="input header-search"
            placeholder="Search movies to add..."
            value={omdbSearch}
            onChange={(e) => {
              const value = e.target.value;
              setOmdbSearch(value);
              searchOMDb(value);
            }}
          />

          {omdbResults.length > 0 && (
            <div className="omdb-dropdown">
              {omdbResults.map((movie) => (
                <div
                  key={movie.imdbID}
                  className="omdb-item"
                  onClick={() => selectOMDbMovie(movie)}
                >
                  {movie.Title} ({movie.Year})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h1 className="title">filmlib</h1>

      <div className="header-right">
        {isLoggedIn ? (
          <button className="button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <div className="auth-inline">
            <input
              className="input small"
              placeholder="Username"
              value={authForm.username}
              onChange={(e) =>
                setAuthForm({ ...authForm, username: e.target.value })
              }
            />

            <input
              className="input small"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
            />

            <button className="button small" onClick={handleAuth}>
              {authMode === "login" ? "Login" : "Register"}
            </button>

            <button
              className="button small secondary"
              onClick={() =>
                setAuthMode(authMode === "login" ? "register" : "login")
              }
            >
              {authMode === "login" ? "Sign up" : "Login"}
            </button>
          </div>
        )}
      </div>
    </div>

    <div className="container">
      {isLoggedIn && (
        <>
          <form className="form" onSubmit={addMovie}>
            <div className="form-group">
              <input className="input" name="title" placeholder="Title" onChange={handleChange} value={form.title} />
              <input className="input" name="director" placeholder="Director" onChange={handleChange} value={form.director} />
              <input className="input" name="year" placeholder="Year" onChange={handleChange} value={form.year} />
              <input className="input" name="rating" placeholder="Rating" onChange={handleChange} value={form.rating} />
            </div>

            <div className="form-actions">
              <label className="checkbox">
                <input type="checkbox" name="watched" onChange={handleChange} checked={form.watched} />
                <span>Watched</span>
              </label>

              <button className="button" type="submit">
                {editingId ? "Update Movie" : "Add Movie"}
              </button>
            </div>
          </form>

          {error && <div className="error">{error}</div>}

          <div className="library-wrapper">
            
            {/* FILTER BAR */}
            <div className="filter-bar">
              {/* Filter buttons */}
              <div className="filter-group">
                {[
                  { key: "all", label: "All" },
                  { key: "watched", label: "Watched" },
                  { key: "not_watched", label: "To Watch" }
                ].map((f) => (
                  <button
                    key={f.key}
                    className={`filter-btn ${filter === f.key ? "active" : ""}`}
                    onClick={() => setFilter(f.key as "all" | "watched" | "not_watched")}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input
                className="input search"
                type="text"
                placeholder="Search in library..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Sorting */}
              <div className="sort-group">
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="title">Title</option>
                  <option value="director">Director</option>
                  <option value="rating">Rating</option>
                  <option value="year">Year</option>
                </select>

                <select value={order} onChange={(e) => setOrder(e.target.value)}>
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
              </div>
            </div>
            
            <div className="grid">
              {filteredMovies.length === 0 ? (
                <div className="empty-state">
                  No movies yet. Search to add one.
                </div>
              ) : (
                filteredMovies.map((movie) => (
                  <div key={movie.id} className="movie-card">
                    <div
                      className="poster"
                      style={{
                        backgroundImage: `url(${movie.poster && movie.poster !== "N/A" ? movie.poster : noPoster})`
                      }}
                    />

                    <div className="movie-info">
                      <div className="movie-title">
                        {movie.title} ({movie.year})
                      </div>
                      <div className="movie-director">{movie.director}</div>
                    </div>

                    <div className="actions">
                      <button className="edit-btn" onClick={() => editMovie(movie)}>✏️</button>
                      <button className="delete-btn" onClick={() => deleteMovie(movie.id)}>✖</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {!isLoggedIn && error && <div className="error">{error}</div>}
    </div>
  </div>
);
}

export default App;