// MediaDetails.jsx

import { useEffect, useState } from "react";

function MediaDetails({ item, goBack }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!item.tmdb_id) return;

    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/tmdb/${item.tmdb_id}`);
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error("Failed to load TMDb details:", err);
      }
    };

    fetchDetails();
  }, [item.tmdb_id]);

  return (
    <div className="details-container">
      <button className="back-button" onClick={goBack}>← Back</button>

      <h1>{item.title}</h1>
      <p><strong>Type:</strong> {item.media_type}</p>
      <p><strong>Status:</strong> {item.status}</p>
      <p><strong>Next Release:</strong> {item.next_release_date || "N/A"}</p>

      {details ? (
        <>
          <img
            src={`https://image.tmdb.org/t/p/w300${details.poster_path}`}
            alt={details.title}
          />
          <p>{details.overview}</p>
        </>
      ) : (
        <p>Loading details...</p>
      )}
    </div>
  );
}

export default MediaDetails;
