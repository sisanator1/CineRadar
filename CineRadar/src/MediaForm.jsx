import { useState, useEffect } from "react";

const MediaForm = ({ existingMedia = {}, updateCallback }) => {
  const [title, setTitle] = useState(existingMedia.title || "");
  const [mediaType, setMediaType] = useState(existingMedia.mediaType || "movie");
  const [status, setStatus] = useState(existingMedia.status || "watching");
  const [nextReleaseDate, setNextReleaseDate] = useState(existingMedia.nextReleaseDate || "");

  // TMDb search state
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTmdbId, setSelectedTmdbId] = useState(existingMedia.tmdb_id || null);
  const [selectedPosterPath, setSelectedPosterPath] = useState(existingMedia.poster_path || null);   // <-- ADDED
  const [isSearching, setIsSearching] = useState(false);

  const updating = Object.entries(existingMedia).length !== 0;

  // Search TMDb when title changes (debounced)
  useEffect(() => {
    if (!title || title.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const endpoint = mediaType === "movie" ? "movie" : "tv";
        const response = await fetch(
          `https://cineradar.onrender.com/tmdb_search/${endpoint}?query=${encodeURIComponent(title)}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("TMDb search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, mediaType]);

  // ---- UPDATED HANDLER ----
  const handleSelectTmdb = (result) => {
    setSelectedTmdbId(result.id);
    setTitle(result.title || result.name);
    setSelectedPosterPath(result.poster_path);  // <---- ADDED
    setSearchResults([]);
  };

  // ---- UPDATED SUBMIT ----
  const onSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title,
      mediaType,
      status,
      nextReleaseDate,
      tmdb_id: selectedTmdbId,
      tmdb_type: mediaType,
      poster_path: selectedPosterPath   // <---- ADDED
    };

    const url = `https://cineradar.onrender.com/${
      updating ? `update_media/${existingMedia.id}` : "create_media"
    }`;

    const response = await fetch(url, {
      method: updating ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      updateCallback();
    } else {
      const result = await response.json();
      alert(result.message || "Error saving media");
    }
  };

  return (
    <form className="media-form" onSubmit={onSubmit}>
      <h3 className="form-title">{updating ? "Update Media" : "Add New Media"}</h3>

      <div className="form-group">
        <label>Type</label>
        <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
          <option value="movie">Movie</option>
          <option value="tv">TV Show</option>
        </select>
      </div>

      <div className="form-group">
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Search for a movie or TV show..."
        />

        {isSearching && (
          <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            Searching TMDb...
          </p>
        )}

        {searchResults.length > 0 && (
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "5px",
              maxHeight: "200px",
              overflowY: "auto",
              backgroundColor: "white",
              position: "relative",
              zIndex: 10,
            }}
          >
            {searchResults.slice(0, 5).map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelectTmdb(result)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                {result.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                    alt=""
                    style={{
                      width: "30px",
                      height: "45px",
                      objectFit: "cover",
                      borderRadius: "2px",
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <strong>{result.title || result.name}</strong>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {result.release_date || result.first_air_date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTmdbId && (
          <p style={{ fontSize: "12px", color: "green", marginTop: "5px" }}>
            ✓ TMDb match found (ID: {selectedTmdbId})
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="watching">Watching</option>
          <option value="completed">Completed</option>
          <option value="plan to watch">Plan to Watch</option>
        </select>
      </div>

      <div className="form-group">
        <label>Next Release Date</label>
        <input
          type="date"
          value={nextReleaseDate}
          onChange={(e) => setNextReleaseDate(e.target.value)}
        />
      </div>

      <button type="submit" className="form-submit">
        {updating ? "Update" : "Add"}
      </button>
    </form>
  );
};

export default MediaForm;
