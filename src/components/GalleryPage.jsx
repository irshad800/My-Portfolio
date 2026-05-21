import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryImages } from '../data/portfolioData';

export default function GalleryPage() {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(null);
  const [filter, setFilter] = useState('all');

  // Scroll to top when page mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredImages = galleryImages.filter(img => {
    if (filter === 'all') return true;
    return img.type === filter;
  });

  return (
    <div className="gallery-page">
      <div className="ambient-glow glow-top-right" />
      <div className="ambient-glow glow-bottom-left" />
      
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-outline"
          style={{ marginBottom: '40px' }}
        >
          <span>←</span> Back to Home
        </button>

        <div className="section-header" style={{ animation: 'slide-up 0.8s ease', textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-label" style={{ justifyContent: 'center' }}>Portfolio Assets</span>
          <h1 className="hero-heading" style={{ fontSize: '3rem', marginBottom: '10px' }}>Full <span>Gallery</span></h1>
          <p className="hero-desc" style={{ margin: '0 auto' }}>Explore screenshots and visual mockups of premium iGaming concepts and apps.</p>
        </div>

        {/* Premium Category Filter Tabs */}
        <div className="gallery-filters">
          {[
            { id: 'all', label: 'All Showcase' },
            { id: 'desktop', label: 'Desktop Interfaces' },
            { id: 'mobile', label: 'Mobile Apps' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`filter-btn ${filter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="gallery-full-grid">
          {filteredImages.map((img, index) => (
            <div 
              key={img.id} 
              className={`gallery-card ${img.type || 'desktop'}-size glass`}
              style={{ animation: `slide-up 0.6s ease ${index * 0.06}s both` }}
              onClick={() => setActiveImage(img)}
            >
              <div className="gallery-img-container">
                <img src={img.src} alt={img.alt} />
                <div className="gallery-overlay">
                  <span>{img.caption}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Lightbox Modal */}
      {activeImage && (
        <div className="lightbox-modal" onClick={() => setActiveImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActiveImage(null)}>&times;</button>
            <img src={activeImage.src} alt={activeImage.alt} className="lightbox-img" />
            <div className="lightbox-caption">{activeImage.caption}</div>
          </div>
        </div>
      )}
    </div>
  );
}
