import { useEffect, useState } from "react";

function MediaDetails({ item, goBack }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item.tmdb_id || !item.tmdb_type) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/tmdb/${item.tmdb_type}/${item.tmdb_id}`);
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error("Failed to load TMDb details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [item.tmdb_id, item.tmdb_type]);

  return (
    <div className="details-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        className="back-button" 
        onClick={goBack}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      <h1>{item.title}</h1>
      <p><strong>Type:</strong> {item.mediaType === 'tv' ? 'TV Show' : 'Movie'}</p>
      <p><strong>Status:</strong> {item.status}</p>
      <p><strong>Next Release:</strong> {item.nextReleaseDate || "N/A"}</p>

      {loading ? (
        <p>Loading details...</p>
      ) : details ? (
        <div style={{ marginTop: '20px' }}>
          {details.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
              alt={details.title || details.name}
              style={{ maxWidth: '300px', borderRadius: '8px', marginBottom: '20px' }}
            />
          )}
          <h2>Overview</h2>
          <p>{details.overview || "No overview available."}</p>
          
          {details.vote_average && (
            <p><strong>Rating:</strong> {details.vote_average}/10</p>
          )}
          
          {details.release_date && (
            <p><strong>Release Date:</strong> {details.release_date}</p>
          )}
          
          {details.first_air_date && (
            <p><strong>First Air Date:</strong> {details.first_air_date}</p>
          )}
          
          {details.genres && details.genres.length > 0 && (
            <p><strong>Genres:</strong> {details.genres.map(g => g.name).join(', ')}</p>
          )}
        </div>
      ) : (
        <p>No TMDb details available for this item.</p>
      )}
    </div>
  );
}

export default MediaDetails;