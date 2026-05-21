import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { experience, education } from '../data/portfolioData';

function TimelineItem({ item, isEdu }) {
  const [ref, vis] = useScrollAnimation(0.1);
  return (
    <div className={`timeline-item fade-in${vis ? ' visible' : ''}`} ref={ref}>
      <div className="timeline-dot" />
      <span className="timeline-date">{item.date}</span>
      <div className="timeline-card glass">
        <h3>{isEdu ? item.degree : item.role}</h3>
        <div className="company">{isEdu ? item.school : item.company}</div>
        <div className="location">📍 {item.location}</div>
        <p>{item.desc}</p>
      </div>
    </div>
  );
}

export default function Experience() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section className="section" id="experience">
      <div className="container">
        <div className={`fade-in${vis ? ' visible' : ''}`} ref={ref} style={{ textAlign: 'center', marginBottom: 'var(--header-margin, 60px)' }}>
          <span className="section-label" style={{ justifyContent: 'center' }}>Timeline</span>
          <h2 className="section-title">My <span>Experience</span> & Education</h2>
        </div>
        <div className="exp-edu-grid">
          <div>
            <h3><span className="icon">💼</span> Work Experience</h3>
            <div className="timeline">
              {experience.map((e, i) => <TimelineItem key={i} item={e} />)}
            </div>
          </div>
          <div>
            <h3><span className="icon">🎓</span> Education</h3>
            <div className="timeline">
              {education.map((e, i) => <TimelineItem key={i} item={e} isEdu />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
