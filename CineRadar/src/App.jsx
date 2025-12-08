import { useState, useEffect } from 'react';
import MediaList from './MediaList.jsx';
import MediaForm from './MediaForm.jsx';
import MediaDetails from './MediaDetails.jsx';
import './App.css';
import './index.css';

function App() {
  const [media, setMedia] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [detailsItem, setDetailsItem] = useState(null); // <-- selected item for details page

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const response = await fetch('http://127.0.0.1:5000/media');
    const data = await response.json();
    setMedia(data.media);
  };

  const openCreateModal = () => setIsModalOpen(true);
  const openEditModal = (item) => { setCurrentItem(item); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setCurrentItem({}); };
  const onUpdate = () => { closeModal(); fetchMedia(); };

  // ---- NEW ---- handle clicking a card
  const openDetails = (item) => setDetailsItem(item);
  const closeDetails = () => setDetailsItem(null);

  // If a card is selected, show details page
  if (detailsItem) {
    return <MediaDetails item={detailsItem} goBack={closeDetails} />;
  }

  // Otherwise show main page
  return (
    <>
      <MediaList
        media={media}
        updateMedia={openEditModal}
        updateCallback={onUpdate}
        openDetails={openDetails} // pass this to MediaList
      />

      <div className="add-button-container">
        <button className="add-button" onClick={openCreateModal}>
          + Add New Movie/Show
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-card">
            <span className="close" onClick={closeModal}>&times;</span>
            <MediaForm existingMedia={currentItem} updateCallback={onUpdate} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
