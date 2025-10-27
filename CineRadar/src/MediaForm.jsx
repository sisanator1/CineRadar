import { useState } from "react"

/**
 * MediaForm Component
 * ---------------------
 * Handles both creation and updating of media items (movies/TV shows).
 * Uses controlled form inputs tied to component state.
 *
 * Props:
 * - existingMedia (object): the media item to edit; empty object means "create new"
 * - updateCallback (function): called after a successful add/update to refresh parent component
 */
const MediaForm = ({ existingMedia = {}, updateCallback }) => {
  const [title, setTitle] = useState(existingMedia.title || "")
  const [mediaType, setMediaType] = useState(existingMedia.mediaType || "movie")
  const [status, setStatus] = useState(existingMedia.status || "watching")
  const [nextReleaseDate, setNextReleaseDate] = useState(existingMedia.nextReleaseDate || "")

  const updating = Object.entries(existingMedia).length !== 0

  const onSubmit = async (e) => {
    e.preventDefault()
    const data = { title, mediaType, status, nextReleaseDate }
    const url = `http://127.0.0.1:5000/${
      updating ? `update_media/${existingMedia.id}` : "create_media"
    }`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      updateCallback()
    } else {
      const result = await response.json()
      alert(result.message || "Error saving media")
    }
  }

  // ======= RENDER FORM =======
  return (
    <form className="media-form" onSubmit={onSubmit}>
      <h3 className="form-title">{updating ? "Update Media" : "Add New Media"}</h3>

      <div className="form-group">
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter movie or TV show title"
        />
      </div>

      <div className="form-group">
        <label>Type</label>
        <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
          <option value="movie">Movie</option>
          <option value="tv">TV Show</option>
        </select>
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
  )
}

export default MediaForm
