import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  type: 'petal' | 'star' | 'heart';
}

export const PetalCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(244, 114, 182, ', // pink-400
      'rgba(251, 113, 133, ', // rose-400
      'rgba(244, 63, 94, ',   // rose-500
      'rgba(253, 164, 175, ', // rose-300
      'rgba(254, 205, 211, ', // rose-200
    ];

    const count = Math.min(45, Math.floor((width * height) / 25000));
    const particles: Petal[] = [];

    for (let i = 0; i < count; i++) {
      const isStar = Math.random() < 0.25;
      const isHeart = !isStar && Math.random() < 0.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isStar ? Math.random() * 2 + 1 : isHeart ? Math.random() * 8 + 6 : Math.random() * 12 + 8,
        speedX: (Math.random() - 0.2) * 0.8,
        speedY: isStar ? 0.2 + Math.random() * 0.3 : 0.6 + Math.random() * 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.25,
        type: isStar ? 'star' : isHeart ? 'heart' : 'petal',
      });
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = `${p.color}${p.opacity})`;

      ctx.beginPath();
      // Organic teardrop petal path
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, 0, p.size * 1.5);
      ctx.bezierCurveTo(-p.size, 0, -p.size / 2, -p.size / 2, 0, 0);
      ctx.fill();

      ctx.restore();
    };

    const drawHeart = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * 0.4);
      ctx.fillStyle = `${p.color}${p.opacity * 0.7})`;

      const s = p.size * 0.6;
      ctx.beginPath();
      ctx.moveTo(0, s / 3);
      ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
      ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, s / 3);
      ctx.fill();

      ctx.restore();
    };

    const drawStar = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = `rgba(255, 235, 180, ${p.opacity * 0.8})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        if (p.type === 'star') drawStar(p);
        else if (p.type === 'heart') drawHeart(p);
        else drawPetal(p);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};
