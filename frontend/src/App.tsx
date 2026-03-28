import { useEffect, useState } from "react";
import "./App.css";
import noPoster from "./assets/no-poster.png";

type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  rating: number;
  watched: boolean;
  poster?: string;
};

const API_URL = "http://127.0.0.1:8000/movies";

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

  const [form, setForm] = useState({
    title: "",
    director: "",
    year: "",
    rating: "",
    watched: false
  });

  // ========================
  // FETCH
  // ========================
  const fetchMovies = async () => {
    let url = API_URL + "/";
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (filter === "watched") params.append("watched", "true");
    if (filter === "not_watched") params.append("watched", "false");
    if (sort) params.append("sort", sort);
    if (order) params.append("order", order);

    if (params.toString()) {
      url += "?" + params.toString();
    }

    const res = await fetch(url);
    const data = await res.json();
    setMovies(data);
  };

  useEffect(() => {
    fetchMovies();
  }, [filter, sort, order, search]);

  const filteredMovies = movies;

  // ========================
  // OMDB SEARCH
  // ========================
  const searchOMDb = async (query: string) => {
    if (!query) {
      setOmdbResults([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/search_omdb?query=${query}`);
      const data = await res.json();
      setOmdbResults(data.Search || []);
    } catch {
      setOmdbResults([]);
    }
  };

  const selectOMDbMovie = async (movie: any) => {
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

  // ========================
  // INPUT
  // ========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // ========================
  // CREATE / UPDATE
  // ========================
  const addMovie = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL + "/";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          rating: Number(form.rating)
        })
      });

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

  // ========================
  // EDIT
  // ========================
  const editMovie = (movie: Movie) => {
    setForm({
      title: movie.title,
      director: movie.director,
      year: String(movie.year),
      rating: String(movie.rating),
      watched: movie.watched
    });
    setEditingId(movie.id);
  };

  // ========================
  // DELETE
  // ========================
  const deleteMovie = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchMovies();
  };

  // ========================
  // RETURN UI
  // ========================
  return (
    <div className="app">

      {/* HEADER */}
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
          <button className="button">Login</button>
        </div>
      </div>

      <div className="container">

        {/* FORM */}
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

        {/* FILTER BAR */}
        <div className="filter-bar">
          <div className="filter-group">
            <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
            <button className={`filter-btn ${filter === "watched" ? "active" : ""}`} onClick={() => setFilter("watched")}>Watched</button>
            <button className={`filter-btn ${filter === "not_watched" ? "active" : ""}`} onClick={() => setFilter("not_watched")}>To Watch</button>
          </div>

          <input
            className="input search"
            type="text"
            placeholder="Search in library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

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

        {/* MOVIE GRID */}
        <div className="grid">
          {filteredMovies.map((movie) => (
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
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;