import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useNavScroll } from '../hooks/useScrollAnimation';
import { navLinks, personalInfo } from '../data/portfolioData';

export default function Navbar({ onDownloadCV }) {
  const { scrolled, activeSection } = useNavScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const close = () => setMenuOpen(false);

  const isGalleryPage = location.pathname === '/gallery';

  const getHref = (href) => {
    if (isGalleryPage) {
      if (href.startsWith('#')) return `/${href}`;
      return href;
    }
    return href;
  };

  const isActive = (href) => {
    if (href === '/gallery') return isGalleryPage;
    if (isGalleryPage) return false;
    return activeSection === href.slice(1);
  };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="container">
          <Link to="/" className="nav-logo" onClick={close}>Irshad<span>.</span></Link>
          <div className="nav-links">
            {navLinks.map(l => {
              const isRoute = l.href.startsWith('/');
              return isRoute ? (
                <Link 
                  key={l.href} 
                  to={getHref(l.href)} 
                  className={isActive(l.href) ? 'active' : ''}
                >
                  {l.label}
                </Link>
              ) : (
                <a 
                  key={l.href} 
                  href={getHref(l.href)} 
                  className={isActive(l.href) ? 'active' : ''}
                >
                  {l.label}
                </a>
              );
            })}
            <a href="#!" className="nav-cta" onClick={e => { e.preventDefault(); onDownloadCV(); }}>
              Download CV
            </a>
          </div>
          <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>
      <div className={`mobile-overlay${menuOpen ? ' open' : ''}`} onClick={close} />
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {/* Close Button */}
        <button className="mobile-menu-close" onClick={close} aria-label="Close menu">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Menu Header */}
        <div className="mobile-menu-header">
          <Link to="/" className="mobile-menu-logo" onClick={close}>Irshad<span>.</span></Link>
          <p className="mobile-menu-tagline">Software Engineer</p>
        </div>

        {/* Divider */}
        <div className="mobile-menu-divider" />

        {/* Navigation Links */}
        <div className="mobile-menu-nav">
          {navLinks.map((l, i) => {
            const isRoute = l.href.startsWith('/');
            const linkClass = `mobile-nav-link${isActive(l.href) ? ' active' : ''}`;
            return isRoute ? (
              <Link key={l.href} to={getHref(l.href)} className={linkClass} onClick={close} style={{ animationDelay: `${0.05 + i * 0.04}s` }}>
                <span className="mobile-nav-index">0{i + 1}</span>
                <span className="mobile-nav-label">{l.label}</span>
                <span className="mobile-nav-arrow">→</span>
              </Link>
            ) : (
              <a key={l.href} href={getHref(l.href)} className={linkClass} onClick={close} style={{ animationDelay: `${0.05 + i * 0.04}s` }}>
                <span className="mobile-nav-index">0{i + 1}</span>
                <span className="mobile-nav-label">{l.label}</span>
                <span className="mobile-nav-arrow">→</span>
              </a>
            );
          })}
        </div>

        {/* Download CV */}
        <button className="mobile-menu-cta" onClick={() => { close(); onDownloadCV(); }}>
          <span className="mobile-cta-icon">📄</span> Download CV
        </button>

        {/* Social Links */}
        <div className="mobile-menu-socials">
          {personalInfo.socials.github && (
            <a href={personalInfo.socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">GH</a>
          )}
          {personalInfo.socials.linkedin && (
            <a href={personalInfo.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">IN</a>
          )}
          {personalInfo.socials.instagram && (
            <a href={personalInfo.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
          )}
          {personalInfo.socials.behance && (
            <a href={personalInfo.socials.behance} target="_blank" rel="noopener noreferrer" aria-label="Behance">BE</a>
          )}
        </div>

        {/* Footer */}
        <div className="mobile-menu-footer">
          <p>© 2026 Irshad. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
