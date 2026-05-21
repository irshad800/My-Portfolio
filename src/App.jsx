import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

import CVModal from './components/CVModal';

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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 992); // Matches hover/custom cursor breakpoint
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      <Preloader />
      {!isMobile && <CustomCursor />}
      <ParticleCanvas />
      
      {/* Premium ambient decorative glow fields */}
      <div className="ambient-glow glow-top-right" />
      <div className="ambient-glow glow-bottom-left" />

      <Navbar onDownloadCV={() => setShowCV(true)} />

      <Routes>
        <Route path="/" element={<HomePage onDownloadCV={() => setShowCV(true)} />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>

      {showCV && <CVModal onClose={() => setShowCV(false)} />}
    </>
  );
}
