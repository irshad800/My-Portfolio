import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mx = -100, my = -100, rx = -100, ry = -100;

    const move = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', move);

    const hoverable = () => document.querySelectorAll('a, button, .glass, .skill-card, .expertise-card, .project-card');

    const onEnter = () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1.4)';
      ring.style.borderColor = '#f43f5e';
      ring.style.background = 'rgba(244, 63, 94, 0.04)';
      dot.style.background = '#f43f5e';
      dot.style.boxShadow = '0 0 8px rgba(244, 63, 94, 0.5)';
    };
    const onLeave = () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.borderColor = 'rgba(124, 58, 237, 0.4)';
      ring.style.background = 'transparent';
      dot.style.background = '#7c3aed';
      dot.style.boxShadow = '0 0 8px rgba(124, 58, 237, 0.5)';
    };

    const addListeners = () => {
      hoverable().forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    setTimeout(addListeners, 1000);
    const obs = new MutationObserver(addListeners);
    obs.observe(document.body, { childList: true, subtree: true });

    let active = true;
    function animate() {
      if (!active) return;
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animate);
    }
    animate();

    return () => { active = false; window.removeEventListener('mousemove', move); obs.disconnect(); };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', width: 6, height: 6, borderRadius: '50%',
        background: '#7c3aed', transform: 'translate(-50%,-50%)',
        zIndex: 9999, pointerEvents: 'none', transition: 'background 0.2s, box-shadow 0.2s',
        boxShadow: '0 0 8px rgba(124, 58, 237, 0.5)',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', width: 28, height: 28, borderRadius: '50%',
        border: '1.5px solid rgba(124, 58, 237, 0.4)', transform: 'translate(-50%,-50%)',
        zIndex: 9998, pointerEvents: 'none',
        transition: 'transform .25s cubic-bezier(0.25,0.8,0.25,1), border-color 0.2s, background 0.2s',
      }} />
    </>
  );
}
