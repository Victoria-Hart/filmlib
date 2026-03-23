import { useEffect, useState } from "react";
import "./App.css";
import noPoster from "./assets/no-poster.png"

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
  // ========================
  // STATE
  // ========================
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "watched" | "not_watched">("all");

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
    const res = await fetch(API_URL + "/");
    const data = await res.json();
    setMovies(data);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // ========================
  // FILTER + SORT
  // ========================
  const filteredMovies = [...movies]
    .filter((movie) => {
      if (filter === "watched") return movie.watched;
      if (filter === "not_watched") return !movie.watched;
      return true;
    })
    .sort((a, b) =>
      a.title
        .replace(/^(the|a|an)\s/i, "")
        .localeCompare(b.title.replace(/^(the|a|an)\s/i, ""))
    );

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

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL + "/";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
        rating: Number(form.rating)
      })
    });

    setEditingId(null);
    setForm({
      title: "",
      director: "",
      year: "",
      rating: "",
      watched: false
    });

    fetchMovies();
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
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    fetchMovies();
  };

  // ========================
  // BUTTON STYLE (ACTIVE FILTER)
  // ========================
  const buttonStyle = (active: boolean) => ({
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: active ? "#e50914" : "#333",
    color: "white"
  });

  // ========================
  // RETURN UI
  // ========================
  return (
    // ========================
    // OUTER CONTAINER (FULL PAGE)
    // ========================
    <div
      className="app" style={{
        padding: "2rem",
        background: "#0f0f0f",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {/* ========================
          HEADER
          ======================== */}
      <h1
        className="title" style={{
          color: "#e50914",
          fontSize: "3rem",
          marginBottom: "1rem",
          textAlign: "center"
        }}
      >
        NOTFLIX
      </h1>

      {/* ========================
          INNER CONTAINER (CENTERED CONTENT)
          ======================== */}
      <div className="container" style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ========================
            FORM
            ======================== */}
        <form
          className="form" 
          onSubmit={addMovie}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "1rem"
          }}
        >
          <input className="input" style={{ padding: "6px" }} name="title" placeholder="Title" onChange={handleChange} value={form.title} />
          <input className="input" style={{ padding: "6px" }} name="director" placeholder="Director" onChange={handleChange} value={form.director} />
          <input className="input" style={{ padding: "6px" }} name="year" placeholder="Year" onChange={handleChange} value={form.year} />
          <input className="input" style={{ padding: "6px" }} name="rating" placeholder="Rating" onChange={handleChange} value={form.rating} />

          <label className="checkbox">
            <input
              type="checkbox"
              name="watched"
              onChange={handleChange}
              checked={form.watched}
            />
            <span>Watched</span>
          </label>

          <button className="button" type="submit">
            {editingId ? "Update Movie" : "Add Movie"}
          </button>
        </form>

        {/* ========================
            FILTER BUTTONS
            ======================== */}
        <div className="filters" style={{ margin: "1rem 0 1.5rem 0", display: "flex", gap: "10px" }}>
          <button style={buttonStyle(filter === "all")} onClick={() => setFilter("all")}>All</button>
          <button style={buttonStyle(filter === "watched")} onClick={() => setFilter("watched")}>Watched</button>
          <button style={buttonStyle(filter === "not_watched")} onClick={() => setFilter("not_watched")}>To Watch</button>
        </div>

        {/* ========================
            MOVIE GRID
            ======================== */}
        <div className="grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}
        >
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              style={{
                width: "170px",
                background: "#181818",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.zIndex = "10";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.zIndex = "1";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.4)";
              }}
            >
              {/* POSTER */}
              <div
                style={{
                  height: "260px",
                  backgroundImage: `url(${movie.poster && movie.poster !== "N/A" ? movie.poster : noPoster})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              />

              {/* INFO */}
              <div style={{ padding: "0.8rem" }}>
                <div style={{ fontWeight: "bold" }}>
                  {movie.title} ({movie.year})
                </div>
                <div style={{ fontSize: "0.85rem", color: "#aaa" }}>
                  {movie.director}
                </div>
              </div>

              {/* ACTIONS */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  display: "flex",
                  gap: "6px"
                }}
              >
                <button
                  title="Edit movie"
                  onClick={() => editMovie(movie)}
                  style={{
                    background: "#333",
                    border: "none",
                    color: "white",
                    padding: "4px 6px",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#87CEEB")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#333")}
                >
                  ✏️
                </button>

                <button
                  title="Delete movie"
                  onClick={() => deleteMovie(movie.id)}
                  style={{
                    background: "#333",
                    border: "none",
                    color: "white",
                    padding: "4px 6px",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e50914")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#333")}
                >
                  ✖
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
      {/* END INNER CONTAINER */}

    </div>
    /* END OUTER CONTAINER */
  );
}

export default App;
