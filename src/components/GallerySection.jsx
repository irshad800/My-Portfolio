import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { galleryImages } from '../data/portfolioData';

export default function GallerySection() {
  const [ref, vis] = useScrollAnimation();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(null);

  // Show up to 3 images in the preview section
  const previewImages = galleryImages.slice(0, 3);

  return (
    <section className="section gallery-preview" id="gallery">
      <div className="container" ref={ref}>
        <div className={`section-header fade-in-up${vis ? ' visible' : ''}`}>
          <span className="section-label">Gallery</span>
          <h2 className="section-title">Visual <span>Journey</span></h2>
          <p className="section-desc">A glimpse into my workspace and digital concepts.</p>
        </div>

        <div className="gallery-preview-grid">
          {previewImages.map((img, index) => (
            <div 
              key={img.id} 
              className={`gallery-card ${img.type || 'desktop'}-size glass fade-in-up${vis ? ' visible' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
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

        <div className={`gallery-action fade-in-up${vis ? ' visible' : ''}`} style={{ animationDelay: '0.45s', textAlign: 'center', marginTop: '40px' }}>
          <button onClick={() => navigate('/gallery')} className="btn btn-primary btn-glow">
            <span className="btn-shine" />Show All Gallery <span>→</span>
          </button>
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
    </section>
  );
}
