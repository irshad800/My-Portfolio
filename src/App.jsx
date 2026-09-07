import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';
import Preloader from './components/Preloader';
import ParticleCanvas from './components/ParticleCanvas';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Marquee from './components/Marquee';
import Expertise from './components/Expertise';
import Projects from './components/Projects';
import GallerySection from './components/GallerySection';
import Contact from './components/Contact';
import GalleryPage from './components/GalleryPage';

import ProtectedRoute from './components/admin/ProtectedRoute';

import { API_BASE_URL } from './config/api';

function HomePage({ onDownloadCV }) {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Marquee />
      <Expertise />
      <Projects />
      <GallerySection />
      <Contact />
    </>
  );
}

export default function App() {
  const [showCV, setShowCV] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin') || window.location.hash.includes('admin');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 992);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Automatic silent visitor geolocation logging
  useEffect(() => {
    if (isAdminRoute) return; // Don't log admin panel visits as regular portfolio visitors
    const logVisit = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname })
        });
      } catch (err) {
        // Silent failure if offline
      }
    };
    logVisit();
  }, [isAdminRoute]);

  return (
    <>
      <Preloader />
      {!isMobile && !isAdminRoute && <CustomCursor />}
      <ParticleCanvas />
      
      {/* Premium ambient decorative glow fields */}
      <div className="ambient-glow glow-top-right" />
      <div className="ambient-glow glow-bottom-left" />

      {!isAdminRoute && <Navbar onDownloadCV={() => setShowCV(true)} />}

      {!isAdminRoute && (
        <div className="floating-socials" aria-label="Quick contact links">
          <a
            href="tel:+971558421678"
            className="social-link call"
            aria-label="Call phone number"
          >
            <FaPhone />
          </a>
          <a
            href="https://wa.me/971558421678"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link whatsapp"
            aria-label="Contact via WhatsApp"
          >
            <FaWhatsapp />
          </a>
          <a
            href="mailto:irshadvp800@gmail.com"
            className="social-link gmail"
            aria-label="Send an email"
          >
            <FaEnvelope />
          </a>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage onDownloadCV={() => setShowCV(true)} />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/admin" element={<ProtectedRoute />} />
      </Routes>

      {showCV && <CVModal onClose={() => setShowCV(false)} />}
    </>
  );
}
