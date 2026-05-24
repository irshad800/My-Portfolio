import { useState, useEffect, useRef } from 'react';
import { personalInfo, stats } from '../data/portfolioData';
import { FaLinkedin, FaGithub, FaBehance } from 'react-icons/fa';

function Typewriter({ words, speed = 100, pause = 2000 }) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(word.substring(0, charIdx + 1));
        if (charIdx + 1 === word.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIdx(c => c + 1);
        }
      } else {
        setText(word.substring(0, charIdx));
        if (charIdx === 0) {
          setDeleting(false);
          setWordIdx(i => (i + 1) % words.length);
        } else {
          setCharIdx(c => c - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return (
    <span className="typewriter-text">
      {text}<span className="typewriter-cursor">|</span>
    </span>
  );
}

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const num = parseInt(target);
        const duration = 2000;
        const step = duration / num;
        let current = 0;
        const timer = setInterval(() => {
          current++;
          setCount(current);
          if (current >= num) clearInterval(timer);
        }, step);
      }
    }, { threshold: 0.5 });
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref} className="stat-number">{count}{suffix}</span>;
}

export default function Hero() {
  const roles = ['Software Engineer', 'Full-Stack Developer', 'iGaming Specialist', 'Cloud Architect'];

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isAvatar, setIsAvatar] = useState(false);
  const frameRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: x * 15, y: y * -15 }); // 15 degrees max tilt
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />
      </div>
      <div className="container">
        <div className="hero-content" style={{ animation: 'slide-up .8s ease forwards' }}>
          <div className="hero-badge">
            <span className="dot" />
            Available for work
          </div>
          <p className="hero-name" style={{ animationDelay: '.2s' }}>Hi, I'm {personalInfo.name} 👋</p>
          <h1 className="hero-heading">
            <Typewriter words={roles} speed={80} pause={2500} />
          </h1>
          <p className="hero-desc">{personalInfo.bio}</p>
          <div className="hero-buttons">
            <a href="#projects" className="btn btn-primary btn-glow">
              <span className="btn-shine" />View Projects <span>→</span>
            </a>
            <a href="#contact" className="btn btn-outline">
              Let's Talk <span>💬</span>
            </a>
          </div>
          <div className="hero-stats">
            {stats.map(s => (
              <div className="stat-item" key={s.label}>
                <AnimatedCounter target={s.number.replace('+', '')} suffix={s.number.includes('+') ? '+' : ''} />
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-visual" style={{ animation: 'slide-up 1s ease .3s both' }}>
          <div
            className="hero-image-wrap"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={frameRef}
          >
            {/* Background rotating tech rings */}
            <div className="tech-circle tech-circle-1" />
            <div className="tech-circle tech-circle-2" />

            <div
              className="hero-image-frame glow-border"
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
              }}
            >
              {/* Scanline element */}
              <div className="hero-scan-line" />

              {/* HUD corner brackets */}
              <div className="hud-bracket top-left" />
              <div className="hud-bracket top-right" />
              <div className="hud-bracket bottom-left" />
              <div className="hud-bracket bottom-right" />

              <img src={isAvatar ? `${import.meta.env.BASE_URL}my-image/me-ai.png` : `${import.meta.env.BASE_URL}irshad-image.png`} alt={personalInfo.name} />
            </div>

            <div className="hero-float-card card-1 glass">
              <div className="card-label">Based in</div>
              <div className="card-value">🇦🇪 Dubai, UAE</div>
            </div>
            <div className="hero-float-card card-2 glass">
              <div className="card-label">Speciality</div>
              <div className="card-value">⚡ Full-Stack Dev</div>
            </div>

            {/* Premium Cyber Toggle Button */}
            <button
              className="avatar-toggle-btn"
              onClick={() => setIsAvatar(!isAvatar)}
            >
              {isAvatar ? '👤 View Photo' : '⚡ Cyber Avatar'}
            </button>
          </div>
          <div className="hero-socials">
            {[
              { url: personalInfo.socials.github, Icon: FaGithub, label: 'GitHub' },
              { url: personalInfo.socials.linkedin, Icon: FaLinkedin, label: 'LinkedIn' },
              { url: personalInfo.socials.behance, Icon: FaBehance, label: 'Behance' },
            ].map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                className="glass social-icon-link" title={s.label}>
                <s.Icon size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
