import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { projects } from '../data/portfolioData';

function ProjectCard({ p, index, totalCount }) {
  const [ref] = useScrollAnimation(0.1);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className="project-card glass mobile-project-card"
      initial={{ 
        opacity: 0, 
        x: isEven ? -60 : 60, 
        rotateY: isEven ? -8 : 8,
        scale: 0.92 
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        rotateY: 0, 
        scale: 1 
      }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.08, 
        type: 'spring', 
        stiffness: 80,
        damping: 15
      }}
      whileHover={{ 
        y: -6,
        rotateX: 3,
        rotateY: -2,
        boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.3)"
      }}
      style={{ transformPerspective: 1200, transformStyle: 'preserve-3d' }}
    >
      {/* Floating number badge */}
      <div className="project-number-badge">
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Top row: tag + number indicator */}
      <div className="project-card-header">
        <span className="project-tag">{p.duration}</span>
        <span className="project-counter">{index + 1} / {totalCount}</span>
      </div>

      <h3>{p.title}</h3>
      <p className="project-desc">{p.desc}</p>

      <div className="tech-stack">
        {p.tech.map(t => <span className="tech-tag" key={t}>{t}</span>)}
      </div>

      <div className="project-links">
        {p.live && (
          <a href={p.live} target="_blank" rel="noopener noreferrer" className="live-link">
            🔗 Live Demo
          </a>
        )}
        {p.code && (
          <a href={p.code} target="_blank" rel="noopener noreferrer" className="code-link">
            💻 Source Code
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [ref] = useScrollAnimation();
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On mobile, show first 3 by default; on desktop, show all
  const visibleProjects = (!isMobile || showAll) ? projects : projects.slice(0, 3);

  return (
    <section className="section" id="projects">
      <div className="container">
        <motion.div 
          ref={ref} 
          style={{ textAlign: 'center', marginBottom: 'var(--header-margin, 60px)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label" style={{ justifyContent: 'center' }}>Portfolio</span>
          <h2 className="section-title">Featured <span>Projects</span></h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            A selection of my recent work across web and mobile platforms.
          </p>
        </motion.div>

        <div className="projects-grid">
          <AnimatePresence>
            {visibleProjects.map((p, i) => (
              <ProjectCard key={p.title} p={p} index={i} totalCount={projects.length} />
            ))}
          </AnimatePresence>
        </div>

        {/* Show More / Less toggle for mobile */}
        {isMobile && !showAll && projects.length > 3 && (
          <motion.div 
            className="projects-show-more"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button className="btn btn-outline projects-toggle-btn" onClick={() => setShowAll(true)}>
              Show {projects.length - 3} More Projects ↓
            </button>
          </motion.div>
        )}
        {isMobile && showAll && projects.length > 3 && (
          <motion.div 
            className="projects-show-more"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button className="btn btn-outline projects-toggle-btn" onClick={() => setShowAll(false)}>
              Show Less ↑
            </button>
          </motion.div>
        )}

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <a href="https://github.com/irshad800?tab=repositories" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            View All Projects →
          </a>
        </div>
      </div>
    </section>
  );
}

