import React from 'react'
import './MediaList.css' // CSS for the card layout

/**
 * MediaList Component
 * ---------------------
 * Displays the list of movies and TV shows currently stored in the app as cards.
 * Each media item can be edited or deleted using action buttons.
 *
 * Props:
 * - media (array): list of media items fetched from the backend
 * - updateMedia (function): called when the user clicks "Edit" to open the form with that item
 * - updateCallback (function): called after a successful delete to refresh the list
 */
const MediaList = ({ media, updateMedia, updateCallback }) => {
  
  /**
   * Handles deletion of a media item by ID.
   * - Confirms the user's action before deleting.
   * - Sends a DELETE request to the Flask backend.
   * - If successful, triggers updateCallback() to refresh data in the parent component.
   */
  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return

    const response = await fetch(`http://127.0.0.1:5000/delete_media/${id}`, {
      method: "DELETE"
    })

    if (response.ok) {
      updateCallback()
    } else {
      alert("Failed to delete item.")
    }
  }

  // ======= RENDER CARD GRID =======
  return (
    <div>
      <h2>My Watchlist</h2>

      {/* Container for all media cards */}
      <div className="media-grid">
        {media.map((item) => (
          <div key={item.id} className="media-card">
            <h3>{item.title}</h3>
            <p><strong>Type:</strong> {item.mediaType}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Next Release:</strong> {item.nextReleaseDate || "-"}</p>

            {/* Action buttons */}
            <div className="card-actions">
              <button onClick={() => updateMedia(item)}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}

        {/* Show fallback if no media items exist */}
        {media.length === 0 && (
          <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            No media added yet.
          </p>
        )}
      </div>
    </div>
  )
}

export default MediaList
