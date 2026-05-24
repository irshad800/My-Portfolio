import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useNavScroll } from '../hooks/useScrollAnimation';
import { navLinks } from '../data/portfolioData';

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
        {navLinks.map(l => {
          const isRoute = l.href.startsWith('/');
          return isRoute ? (
            <Link key={l.href} to={getHref(l.href)} onClick={close}>{l.label}</Link>
          ) : (
            <a key={l.href} href={getHref(l.href)} onClick={close}>{l.label}</a>
          );
        })}
        <a href="#!" className="btn nav-cta" style={{ textAlign: 'center', marginTop: 12 }}
          onClick={e => { e.preventDefault(); close(); onDownloadCV(); }}>
          Download CV
        </a>
      </div>
    </>
  );
}
