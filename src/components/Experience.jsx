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
          <div className="experience-tabs">
            <button 
              className={`experience-tab-btn ${activeTab === 'work' ? 'active' : ''}`}
              onClick={() => setActiveTab('work')}
            >
              💼 Work
            </button>
            <button 
              className={`experience-tab-btn ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              🎓 Education
            </button>
          </div>
        )}

        <div className="exp-edu-grid">
          {(!isMobile || activeTab === 'work') && (
            <motion.div
              key="work-list"
              initial={isMobile ? { opacity: 0, y: 15 } : {}}
              animate={isMobile ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              {!isMobile && <h3><span className="icon">💼</span> Work Experience</h3>}
              <div className="timeline">
                {experience.map((e, i) => <TimelineItem key={i} item={e} index={i} />)}
              </div>
            </motion.div>
          )}

          {(!isMobile || activeTab === 'education') && (
            <motion.div
              key="edu-list"
              initial={isMobile ? { opacity: 0, y: 15 } : {}}
              animate={isMobile ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              {!isMobile && <h3><span className="icon">🎓</span> Education</h3>}
              <div className="timeline">
                {education.map((e, i) => <TimelineItem key={i} item={e} isEdu index={i} />)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
