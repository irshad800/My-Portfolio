import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { projects } from '../data/portfolioData';

function ProjectCard({ p, delay }) {
  const [ref, vis] = useScrollAnimation(0.1);
  return (
    <div className={`project-card glass fade-in${vis ? ' visible' : ''}`} ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      <span className="project-tag">{p.duration}</span>
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
    </div>
  );
}

export default function Projects() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section className="section" id="projects">
      <div className="container">
        <div className={`fade-in${vis ? ' visible' : ''}`} ref={ref} style={{ textAlign: 'center', marginBottom: 'var(--header-margin, 60px)' }}>
          <span className="section-label" style={{ justifyContent: 'center' }}>Portfolio</span>
          <h2 className="section-title">Featured <span>Projects</span></h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            A selection of my recent work across web and mobile platforms.
          </p>
        </div>
        <div className="projects-grid">
          {projects.map((p, i) => <ProjectCard key={p.title} p={p} delay={i * 100} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <a href="https://github.com/irshad800?tab=repositories" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            View All Projects →
          </a>
        </div>
      </div>
    </section>
  );
}
