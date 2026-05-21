import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { skills } from '../data/portfolioData';

function SkillCard({ skill, delay }) {
  const [ref, vis] = useScrollAnimation(0.1);
  return (
    <div className={`skill-card glass scale-in${vis ? ' visible' : ''}`} ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      <div className="skill-header">
        <span className="skill-name">{skill.name}</span>
        <span className="skill-percent">{skill.percent}%</span>
      </div>
      <div className="skill-bar">
        <div className={`skill-fill${vis ? ' animate' : ''}`} style={{ width: vis ? `${skill.percent}%` : '0%', transitionDelay: `${delay + 300}ms` }} />
      </div>
    </div>
  );
}

export default function Skills() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section className="section" id="skills">
      <div className="container">
        <div className={`fade-in${vis ? ' visible' : ''}`} ref={ref} style={{ textAlign: 'center', marginBottom: 'var(--header-margin, 60px)' }}>
          <span className="section-label" style={{ justifyContent: 'center' }}>Professional Skills</span>
          <h2 className="section-title">Technologies I <span>Master</span></h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            I craft wonderful digital experiences for brands using modern technologies and best practices.
          </p>
        </div>
        <div className="skills-grid">
          {skills.map((s, i) => <SkillCard key={s.name} skill={s} delay={i * 60} />)}
        </div>
      </div>
    </section>
  );
}
