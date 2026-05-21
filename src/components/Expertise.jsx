import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { expertise } from '../data/portfolioData';

function ExpertiseCard({ item, delay }) {
  const [ref, vis] = useScrollAnimation(0.1);
  return (
    <div className={`expertise-card glass scale-in${vis ? ' visible' : ''}`} ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      <div className="card-icon">{item.icon}</div>
      <h3>{item.title}</h3>
      <ul>
        {item.items.map((li, i) => <li key={i}>{li}</li>)}
      </ul>
    </div>
  );
}

export default function Expertise() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section className="section" id="expertise">
      <div className="container">
        <div className={`fade-in${vis ? ' visible' : ''}`} ref={ref} style={{ textAlign: 'center', marginBottom: 'var(--header-margin, 60px)' }}>
          <span className="section-label" style={{ justifyContent: 'center' }}>Technical Expertise</span>
          <h2 className="section-title">My Capabilities Span <span>Diverse Technologies</span></h2>
        </div>
        <div className="expertise-grid">
          {expertise.map((e, i) => <ExpertiseCard key={e.title} item={e} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}
