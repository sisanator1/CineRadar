import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import Login from './Login';
import Signup from './Signup';
import MediaList from './MediaList.jsx';
import MediaForm from './MediaForm.jsx';
import MediaDetails from './MediaDetails.jsx';
import './App.css';
import './index.css';

function App() {
  const { user, loading, logout, API_URL } = useAuth();
  const [media, setMedia] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [detailsItem, setDetailsItem] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMedia();
    }
  }, [user]);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`${API_URL}/media`, {
        credentials: 'include',
      });
      const data = await response.json();
      setMedia(data.media);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    }
  };

  const openCreateModal = () => setIsModalOpen(true);
  const openEditModal = (item) => { setCurrentItem(item); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setCurrentItem({}); };
  const onUpdate = () => { closeModal(); fetchMedia(); };

  const openDetails = (item) => setDetailsItem(item);
  const closeDetails = () => setDetailsItem(null);

  const filteredMedia = media.filter(item => {
    if (typeFilter === 'all') return true;
    return item.mediaType === typeFilter;
  });

  // Show loading screen
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!user) {
    return showLogin 
      ? <Login onSwitchToSignup={() => setShowLogin(false)} />
      : <Signup onSwitchToLogin={() => setShowLogin(true)} />;
  }

  // Show details page
  if (detailsItem) {
    return <MediaDetails item={detailsItem} goBack={closeDetails} />;
  }

  // Main app view
  return (
    <>
      {/* User info bar */}
      <div style={{
        background: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontWeight: 'bold', color: '#333' }}>
            Welcome, {user.username}! 👋
          </span>
        </div>
        <button
          onClick={logout}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Logout
        </button>
      </div>

      <MediaList
        media={filteredMedia}
        updateMedia={openEditModal}
        updateCallback={onUpdate}
        openDetails={openDetails}
      />

      {/* Floating Filter Buttons */}
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