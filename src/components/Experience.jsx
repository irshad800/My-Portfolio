import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { experience, education } from '../data/portfolioData';

function TimelineItem({ item, isEdu, index }) {
  const [ref] = useScrollAnimation(0.1);
  return (
    <motion.div 
      className="timeline-item" 
      ref={ref}
      initial={{ opacity: 0, x: -30, rotateY: -8 }}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, type: 'spring' }}
      style={{ transformPerspective: 1000 }}
    >
      <div className="timeline-dot" />
      <span className="timeline-date">{item.date}</span>
      <motion.div 
        className="timeline-card glass"
        whileHover={{
          scale: 1.02,
          rotateX: 2,
          rotateY: -2,
          boxShadow: "0 20px 40px -10px rgba(6, 182, 212, 0.2)"
        }}
        style={{ transformPerspective: 1000 }}
      >
        <h3>{isEdu ? item.degree : item.role}</h3>
        <div className="company">{isEdu ? item.school : item.company}</div>
        <div className="location">📍 {item.location}</div>
        <p>{item.desc}</p>
      </motion.div>
    </motion.div>
  );
}

export default function Experience() {
  const [ref] = useScrollAnimation();
  const [activeTab, setActiveTab] = useState('work');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleTabChange = (tab, shouldScroll = false) => {
    setActiveTab(tab);
    if (shouldScroll) {
      const sectionEl = document.getElementById('experience');
      if (sectionEl) {
        const yOffset = -70;
        const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="section" id="experience">
      <div className="container">
        <motion.div 
          ref={ref} 
          style={{ textAlign: 'center', marginBottom: 'var(--header-margin, 60px)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label" style={{ justifyContent: 'center' }}>Timeline</span>
          <h2 className="section-title">My <span>Experience</span> & Education</h2>
        </motion.div>

        {isMobile && (
          <div className="mobile-exp-header">
            <div className="experience-tabs">
              <button 
                className={`experience-tab-btn ${activeTab === 'work' ? 'active' : ''}`}
                onClick={() => handleTabChange('work')}
              >
                💼 Work ({experience.length})
              </button>
              <button 
                className={`experience-tab-btn ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => handleTabChange('education')}
              >
                🎓 Education ({education.length})
              </button>
            </div>
            <div className="dots-indicator" style={{ justifyContent: 'center', marginBottom: '8px' }}>
              <span className={`dot ${activeTab === 'work' ? 'active' : ''}`} onClick={() => handleTabChange('work')} />
              <span className={`dot ${activeTab === 'education' ? 'active' : ''}`} onClick={() => handleTabChange('education')} />
            </div>
            <div className="swipe-hint">👈 Swipe card area or tap tab to toggle view 👉</div>
          </div>
        )}

        <div className="exp-edu-grid">
          {isMobile ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'work' ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'work' ? 30 : -30 }}
                transition={{ duration: 0.25 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -50 && activeTab === 'work') {
                    handleTabChange('education');
                  } else if (offset.x > 50 && activeTab === 'education') {
                    handleTabChange('work');
                  }
                }}
                style={{ width: '100%', touchAction: 'pan-y' }}
              >
                <div className="timeline">
                  {(activeTab === 'work' ? experience : education).map((e, i) => (
                    <TimelineItem key={i} item={e} isEdu={activeTab === 'education'} index={i} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              <div>
                <h3><span className="icon">💼</span> Work Experience</h3>
                <div className="timeline">
                  {experience.map((e, i) => <TimelineItem key={i} item={e} index={i} />)}
                </div>
              </div>
              <div>
                <h3><span className="icon">🎓</span> Education</h3>
                <div className="timeline">
                  {education.map((e, i) => <TimelineItem key={i} item={e} isEdu index={i} />)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* BOTTOM MOBILE CONTROLS & SWIPE HINT - AT THE BOTTOM */}
        {isMobile && (
          <div className="mobile-bottom-controls" style={{ marginTop: '28px' }}>
            <div className="swipe-banner">
              <span className="swipe-icon">👈</span>
              <span className="swipe-text">SWIPE LEFT/RIGHT OR TAP TO SWITCH SECTION</span>
              <span className="swipe-icon">👉</span>
            </div>

            <div className="dots-indicator" style={{ justifyContent: 'center', margin: '12px 0' }}>
              <span 
                className={`dot ${activeTab === 'work' ? 'active' : ''}`} 
                onClick={() => handleTabChange('work', true)} 
              />
              <span 
                className={`dot ${activeTab === 'education' ? 'active' : ''}`} 
                onClick={() => handleTabChange('education', true)} 
              />
            </div>

            <button 
              className="bottom-next-category-btn"
              onClick={() => handleTabChange(activeTab === 'work' ? 'education' : 'work', true)}
            >
              {activeTab === 'work' ? (
                <>Switch to <span>🎓 Education ({education.length})</span> ↑</>
              ) : (
                <>Switch to <span>💼 Work Experience ({experience.length})</span> ↑</>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
