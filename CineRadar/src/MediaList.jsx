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

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'watching':
        return 'status-watching';
      case 'completed':
        return 'status-completed';
      case 'plan to watch':
        return 'status-plan';
      default:
        return 'status-plan';
    }
  };

  const getBorderClass = (status) => {
    switch(status.toLowerCase()) {
      case 'watching':
        return 'border-watching';
      case 'completed':
        return 'border-completed';
      case 'plan to watch':
        return 'border-plan';
      default:
        return 'border-plan';
    }
  };

  return (
    <div>
      <h2>My Watchlist</h2>
      
      
      <div className="media-grid">
        {media.map((item) => (
          <div
            key={item.id}
            className={`media-card ${getBorderClass(item.status)}`}
            onClick={() => openDetails(item)}
            style={{ cursor: "pointer" }}
          >
            <div className="card-poster">
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.title}
                  className="poster-image"
                />
              ) : (
                <div className="poster-placeholder">
                  <span>No Image</span>
                </div>
              )}
            </div>

            <div className="card-content">
              <h3>{item.title}</h3>
              
              <span className={`status-badge ${getStatusClass(item.status)}`}>
                {item.status}
              </span>
              
              <div className="card-info">
                <p><strong>Type:</strong> {item.mediaType === 'tv' ? 'TV Show' : 'Movie'}</p>
                {item.nextReleaseDate && (
                  <p><strong>Next Release:</strong> {item.nextReleaseDate}</p>
                )}
              </div>

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
          </div>
        ))}
        {media.length === 0 && (
          <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            No media found. Try a different filter or add some items!
          </p>
        )}
      </div>
    </div>
  );
};

export default MediaList; 