import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#6366f1', '#8b5cf6'];
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let centerX = width / 2;
    let centerY = height / 2;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
    };
    window.addEventListener('resize', resize);

    // 3D coordinates projection constants
    const focalLength = 350; 
    let angleX = 0.0003; // Auto rotation speeds
    let angleY = 0.0003;
    let targetAngleX = 0.0003;
    let targetAngleY = 0.0003;

    // Scroll depth tracking
    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleMouseMove = (e) => {
      // Modulate rotation speed and direction based on mouse position from center
      const ndcX = (e.clientX - centerX) / centerX;
      const ndcY = (e.clientY - centerY) / centerY;
      targetAngleY = ndcX * 0.002;
      targetAngleX = ndcY * 0.002;
    };
    window.addEventListener('mousemove', handleMouseMove);

    class Particle3D {
      constructor() {
        this.reset();
      }

      reset() {
        // Distribute randomly in a 3D box surrounding the view
        this.x = (Math.random() - 0.5) * width * 1.5;
        this.y = (Math.random() - 0.5) * height * 1.5;
        this.z = Math.random() * 800 - 400; // Depth range [-400, 400]
        
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      rotateX(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const y1 = this.y * cos - this.z * sin;
        const z1 = this.z * cos + this.y * sin;
        this.y = y1;
        this.z = z1;
      }

      rotateY(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x1 = this.x * cos - this.z * sin;
        const z1 = this.z * cos + this.x * sin;
        this.x = x1;
        this.z = z1;
      }

      update() {
        // Smoothly interpolate rotation speed
        angleX += (targetAngleX - angleX) * 0.05;
        angleY += (targetAngleY - angleY) * 0.05;

        // Apply 3D rotations
        this.rotateX(angleX);
        this.rotateY(angleY);

        // Apply depth parallax translation based on page scroll
        scrollY += (targetScrollY - scrollY) * 0.1;
        
        // Render projection calculations
        // Compute virtual Z coordinates including scroll offset
        const virtualZ = this.z - (scrollY * 0.4);
        
        // Wrap around when particle passes behind/front limits
        if (virtualZ < -focalLength) {
          this.z += 800; // Warp back to front depth
        } else if (virtualZ > 600) {
          this.z -= 800; // Warp back to far depth
        }
      }

      project() {
        const virtualZ = this.z - (scrollY * 0.4);
        const scale = focalLength / (focalLength + virtualZ);
        
        // 2D screen projected coords
        this.projX = centerX + this.x * scale;
        this.projY = centerY + this.y * scale;
        this.projSize = Math.max(0.1, this.size * scale);
        
        // Fade out particles that are too close or too far
        const depthOpacity = scale > 1 ? (2 - scale) : scale;
        this.projOpacity = Math.max(0, this.opacity * depthOpacity);
      }

      draw() {
        if (this.projOpacity <= 0) return;
        
        ctx.beginPath();
        ctx.arc(this.projX, this.projY, this.projSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.projOpacity;
        ctx.fill();
      }
    }

    // Initialize 3D particle field
    const particleCount = Math.min(80, Math.floor((width * height) / 15000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle3D());
    }

    // Draw lines between nearby projected particles in 3D space
    function draw3DLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          // Calculate distance in 3D coordinates
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (dist3D < 180) {
            // Draw projected line if distance is short
            const virtualZ1 = p1.z - (scrollY * 0.4);
            const scaleLine = focalLength / (focalLength + virtualZ1);
            
            ctx.beginPath();
            ctx.moveTo(p1.projX, p1.projY);
            ctx.lineTo(p2.projX, p2.projY);
            
            // Fade line color based on depth and 3D proximity
            const lineOpacity = (1 - dist3D / 180) * 0.08 * scaleLine;
            ctx.strokeStyle = `rgba(124, 58, 237, ${Math.max(0, lineOpacity)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update();
        p.project();
        p.draw();
      });
      
      draw3DLines();
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(animate);
    }
    
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none',
    }} />
  );
}
