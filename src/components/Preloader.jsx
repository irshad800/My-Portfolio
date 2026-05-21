import { useState, useEffect } from 'react';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 12 + 4;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setDone(true), 250);
      setTimeout(() => setHide(true), 850);
    }
  }, [progress]);

  if (hide) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000, background: '#0a0a12',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      opacity: done ? 0 : 1, transform: done ? 'scale(1.04)' : 'scale(1)',
      pointerEvents: done ? 'none' : 'all',
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 700, marginBottom: 20, color: '#fff', letterSpacing: '-1px',
      }}>
        <span style={{
          background: 'linear-gradient(135deg, #7c3aed, #f43f5e)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Irshad</span>
        <span style={{ color: '#f43f5e' }}>.</span>
      </div>
      <div style={{
        width: 240, height: 3, background: 'rgba(255,255,255,0.04)',
        borderRadius: 50, overflow: 'hidden', marginBottom: 12,
      }}>
        <div style={{
          width: `${Math.min(progress, 100)}%`, height: '100%',
          background: 'linear-gradient(90deg, #7c3aed, #f43f5e)',
          borderRadius: 50, transition: 'width 0.15s ease-out',
          boxShadow: '0 0 15px rgba(244, 63, 94, 0.4)',
        }} />
      </div>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem',
        color: '#94a3b8', letterSpacing: 2, fontWeight: 500,
      }}>
        {Math.min(Math.floor(progress), 100)}%
      </span>
    </div>
  );
}
