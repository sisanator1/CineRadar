import React from 'react';
import './MediaList.css';

const MediaList = ({ media, updateMedia, updateCallback, openDetails }) => {
  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    const response = await fetch(`http://127.0.0.1:5000/delete_media/${id}`, { method: "DELETE" });
    if (response.ok) {
      updateCallback();
    } else {
      alert("Failed to delete item.");
    }
  };

  return (
    <div>
      <h2>My Watchlist</h2>
      <div className="media-grid">
        {media.map((item) => (
          <div
            key={item.id}
            className="media-card"
            onClick={() => openDetails(item)} // <-- NEW
            style={{ cursor: "pointer" }}
          >
            <h3>{item.title}</h3>
            <p><strong>Type:</strong> {item.mediaType}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Next Release:</strong> {item.nextReleaseDate || "-"}</p>

            <div className="card-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateMedia(item);
                }}
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            No media added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default MediaList;
