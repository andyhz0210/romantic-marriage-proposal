import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;
  size: number;
  gravity: number;
}

export const FireworksCanvas: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const colors = [
      '#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#fbbf24',
      '#e879f9', '#c084fc', '#38bdf8', '#34d399', '#ffffff'
    ];

    const createHeartBurst = (cx: number, cy: number, color: string) => {
      const count = 70;
      for (let i = 0; i < count; i++) {
        const t = (Math.PI * 2 * i) / count;
        // Parametric heart curve
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const speed = (Math.random() * 0.4 + 0.8) * 0.28;

        particles.push({
          x: cx,
          y: cy,
          vx: hx * speed,
          vy: hy * speed,
          alpha: 1,
          color,
          decay: Math.random() * 0.015 + 0.008,
          size: Math.random() * 2.5 + 2,
          gravity: 0.03,
        });
      }
    };

    const createStandardBurst = (cx: number, cy: number, color: string) => {
      const count = 90;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          decay: Math.random() * 0.02 + 0.01,
          size: Math.random() * 2.5 + 1.5,
          gravity: 0.06,
        });
      }
    };

    let burstTimer: number;
    const launchFireworks = () => {
      const x = Math.random() * (width * 0.7) + width * 0.15;
      const y = Math.random() * (height * 0.45) + height * 0.1;
      const col = colors[Math.floor(Math.random() * colors.length)];

      if (Math.random() > 0.4) {
        createHeartBurst(x, y, col);
      } else {
        createStandardBurst(x, y, col);
      }
    };

    // Immediate multiple initial bursts
    for (let i = 0; i < 4; i++) {
      setTimeout(launchFireworks, i * 280);
    }

    burstTimer = window.setInterval(launchFireworks, 650);

    let animationId: number;
    const render = () => {
      // Semi-transparent overlay for motion trails
      ctx.fillStyle = 'rgba(8, 5, 9, 0.18)';
      ctx.fillRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(burstTimer);
      cancelAnimationFrame(animationId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
