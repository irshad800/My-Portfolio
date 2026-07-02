import { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { personalInfo } from '../data/portfolioData';

export default function About() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section className="section about" id="about">
      <div className="container" ref={ref}>
        <div className={`about-image fade-in-left${vis ? ' visible' : ''}`}>
          <img src="my-image/me-ai.png" alt={personalInfo.name} />
          <div className="about-image-overlay">
            <div className="overlay-badge" />
            <div>
              <h5>Tech Pioneer</h5>
              <span>Building Future Interfaces</span>
            </div>
          </div>
        </div>
        <div className={`fade-in-right${vis ? ' visible' : ''}`}>
          <span className="section-label">About Me</span>
          <h2 className="section-title">
            Crafting <span>Digital Experiences</span> That Make An Impact
          </h2>
          <p className="section-desc">{personalInfo.aboutLong}</p>
          <div className="about-detail">
            <div className="about-detail-item glass">
              <div className="label">Name</div>
              <div className="value">{personalInfo.name}</div>
            </div>
            <div className="about-detail-item glass">
              <div className="label">Email</div>
              <div className="value">{personalInfo.email}</div>
            </div>
            <div className="about-detail-item glass">
              <div className="label">Location</div>
              <div className="value">{personalInfo.location}</div>
            </div>
            <div className="about-detail-item glass">
              <div className="label">Experience</div>
              <div className="value">3+ Years</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
