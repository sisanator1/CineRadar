import { useState, useEffect } from 'react'
import MediaList from './MediaList.jsx'
import MediaForm from './MediaForm.jsx'
import './App.css'
import './index.css'

/**
 * Main application component for CineRadar.
 * Handles fetching media data, managing modals, and coordinating form/list actions.
 */
function App() {
  const [media, setMedia] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState({})

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    const response = await fetch('http://127.0.0.1:5000/media')
    const data = await response.json()
    setMedia(data.media)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentItem({})
  }

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    if (isModalOpen) return
    setCurrentItem(item)
    setIsModalOpen(true)
  }

  const onUpdate = () => {
    closeModal()
    fetchMedia()
  }

  return (
    <>
      {/* Media list cards */}
      <MediaList media={media} updateMedia={openEditModal} updateCallback={onUpdate} />

      {/* Add button styled as a card button */}
      <div className="add-button-container">
        <button className="add-button" onClick={openCreateModal}>
          + Add New Movie/Show
        </button>
      </div>

      {/* Modal for adding/editing media */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-card">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <MediaForm existingMedia={currentItem} updateCallback={onUpdate} />
          </div>
        </div>
      )}
    </>
  )
}

export default App
