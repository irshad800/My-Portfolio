import { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { personalInfo } from '../data/portfolioData';
import { FaLinkedin, FaGithub, FaBehance, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';

export default function Contact() {
  const [ref, vis] = useScrollAnimation();
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('https://portfoliobackend-39ou.onrender.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setStatus('success');
        e.target.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <section className="section contact" id="contact">
      <div className="container" ref={ref}>
        <div className={`fade-in-left${vis ? ' visible' : ''}`}>
          <span className="section-label">Get In Touch</span>
          <h2 className="section-title">Let's Build Something <span>Amazing</span></h2>
          <p className="section-desc" style={{ marginBottom: 32 }}>
            Excited to hear from you! Whether it's a project, job opportunity, or just a chat — feel free to reach out.
          </p>
          <div className="contact-info">
            <div className="contact-item glass">
              <div className="icon">📍</div>
              <div><h4>Location</h4><p>{personalInfo.location}</p></div>
            </div>
            <div className="contact-item glass">
              <div className="icon">📧</div>
              <div><h4>Email</h4><a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a></div>
            </div>
            <div className="contact-item glass">
              <div className="icon">📞</div>
              <div><h4>Phone</h4><a href={`tel:${personalInfo.phone}`}>{personalInfo.phone}</a></div>
            </div>
          </div>
          <div className="contact-socials" style={{ marginTop: 24 }}>
            {Object.entries(personalInfo.socials).map(([key, url]) => {
              let Icon = null;
              if (key === 'linkedin') Icon = FaLinkedin;
              else if (key === 'github') Icon = FaGithub;
              else if (key === 'behance') Icon = FaBehance;
              else if (key === 'instagram') Icon = FaInstagram;
              else if (key === 'facebook') Icon = FaFacebook;
              else Icon = FaGlobe;
              
              return (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="glass" title={key}>
                  {Icon && <Icon size={24} />}
                </a>
              );
            })}
          </div>
        </div>
        <div className={`fade-in-right${vis ? ' visible' : ''}`}>
          <form className="contact-form glass" onSubmit={handleSubmit} id="contactForm">
            <div className="form-row">
              <input type="text" name="name" placeholder="Your Name" required />
              <input type="email" name="email" placeholder="Your Email" required />
            </div>
            <input type="text" name="subject" placeholder="Subject" />
            <textarea name="message" placeholder="Your Message" rows="5" required />
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send Message'} <span>→</span>
            </button>
            {status === 'success' && <p style={{ color: '#00e676', marginTop: 8 }}>✅ Message sent successfully!</p>}
            {status === 'error' && <p style={{ color: '#ff5252', marginTop: 8 }}>❌ Failed to send. Please try again.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
