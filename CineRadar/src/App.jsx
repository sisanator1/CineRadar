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
  const [detailsItem, setDetailsItem] = useState(null);
  
  // NEW: Filter state
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'movie', 'tv'

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

  const openDetails = (item) => setDetailsItem(item);
  const closeDetails = () => setDetailsItem(null);

  // NEW: Filter media based on type
  const filteredMedia = media.filter(item => {
    if (typeFilter === 'all') return true;
    return item.mediaType === typeFilter;
  });

  // If a card is selected, show details page
  if (detailsItem) {
    return <MediaDetails item={detailsItem} goBack={closeDetails} />;
  }

  // Otherwise show main page
  return (
    <>
      <MediaList
        media={filteredMedia}
        updateMedia={openEditModal}
        updateCallback={onUpdate}
        openDetails={openDetails}
      />

      {/* NEW: Floating Filter Buttons */}
      <div className="floating-filters">
        <button 
          className={`filter-btn ${typeFilter === 'movie' ? 'active' : ''}`}
          onClick={() => setTypeFilter(typeFilter === 'movie' ? 'all' : 'movie')}
          title="Movies"
        >
          🎬
        </button>
        <button 
          className={`filter-btn ${typeFilter === 'tv' ? 'active' : ''}`}
          onClick={() => setTypeFilter(typeFilter === 'tv' ? 'all' : 'tv')}
          title="TV Shows"
        >
          📺
        </button>
      </div>

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