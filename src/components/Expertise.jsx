import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { expertise } from '../data/portfolioData';

function ExpertiseCard({ item, delay, isMobileActive = false }) {
  const [ref, vis] = useScrollAnimation(0.1);
  return (
    <motion.div 
      className={`expertise-card glass scale-in${vis || isMobileActive ? ' visible' : ''}`} 
      ref={ref} 
      style={!isMobileActive ? { transitionDelay: `${delay}ms` } : {}}
      whileHover={{
        y: -5,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.2)"
      }}
      style={{ transformPerspective: 1000 }}
    >
      <div className="card-icon">{item.icon}</div>
      <h3>{item.title}</h3>
      <ul>
        {item.items.map((li, i) => <li key={i}>{li}</li>)}
      </ul>
    </motion.div>
  );
}

export default function Expertise() {
  const [ref] = useScrollAnimation();
  const [activeCategory, setActiveCategory] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Calculate drag boundaries for horizontal tab scrolling
  useEffect(() => {
    if (isMobile && containerRef.current && trackRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const trackWidth = trackRef.current.scrollWidth;
      const maxScroll = trackWidth - containerWidth;
      setDragConstraints({
        left: maxScroll > 0 ? -maxScroll - 16 : 0,
        right: 0
      });
    }
  }, [isMobile, activeCategory]);

  return (
    <section className="section" id="expertise">
      <div className="container">
        <motion.div 
          ref={ref} 
          style={{ textAlign: 'center', marginBottom: 'var(--header-margin, 60px)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label" style={{ justifyContent: 'center' }}>Technical Expertise</span>
          <h2 className="section-title">My Capabilities Span <span>Diverse Technologies</span></h2>
        </motion.div>

        {isMobile && (
          <div className="expertise-tabs-container" ref={containerRef}>
            <motion.div 
              className="expertise-tabs-track"
              ref={trackRef}
              drag="x"
              dragConstraints={dragConstraints}
              dragElastic={0.15}
              whileTap={{ cursor: 'grabbing' }}
              style={{ touchAction: 'pan-y' }}
            >
              {expertise.map((e, i) => (
                <button
                  key={e.title}
                  className={`expertise-tab-btn ${activeCategory === i ? 'active' : ''}`}
                  onClick={() => setActiveCategory(i)}
                >
                  <span className="tab-icon">{e.icon}</span> {e.title.split(' ')[0]}
                </button>
              ))}
            </motion.div>
          </div>
        )}

        <div className="expertise-grid">
          {isMobile ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <ExpertiseCard item={expertise[activeCategory]} delay={0} isMobileActive={true} />
              </motion.div>
            </AnimatePresence>
          ) : (
            expertise.map((e, i) => <ExpertiseCard key={e.title} item={e} delay={i * 80} />)
          )}
        </div>
      </div>
    </section>
  );
}
