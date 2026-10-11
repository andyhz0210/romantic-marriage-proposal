import React, { useEffect, useRef, useState } from 'react';

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

interface ConstellationPoint {
  x: number;
  y: number;
  size: number;
  alpha: number;
  shimmerSpeed: number;
  shimmerOffset: number;
}

interface ConstellationEdge {
  from: number;
  to: number;
  alpha: number;
}

export const SpotlightCanvas: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;

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
      generateConstellationData();
    };
    window.addEventListener('resize', handleResize);

    // Target and current lerped cursor position
    let targetX = width / 2;
    let targetY = height / 3;
    let currentX = targetX;
    let currentY = targetY;
    let spotlightRadius = 180;
    let isCursorInWindow = false;
    let spotlightAlpha = 0; // Fades in smoothly
    let time = 0;

    // Constellation points and links
    let points: ConstellationPoint[] = [];
    let edges: ConstellationEdge[] = [];

    // Pre-generate rich constellation map across the screen
    const generateConstellationData = () => {
      points = [];
      edges = [];

      const pointCount = Math.floor((width * height) / 12000);
      for (let i = 0; i < pointCount; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.2 + 1.2,
          alpha: Math.random() * 0.7 + 0.3,
          shimmerSpeed: Math.random() * 0.04 + 0.02,
          shimmerOffset: Math.random() * Math.PI * 2,
        });
      }

      // Connect nearby points to form delicate constellation lines
      for (let i = 0; i < points.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130 && connections < 3) {
            edges.push({
              from: i,
              to: j,
              alpha: Math.max(0.1, 0.45 - dist / 130),
            });
            connections++;
          }
        }
      }

      // Add a special romantic Heart constellation near the center of the viewport
      const cx = width * 0.5;
      const cy = height * 0.4;
      const heartPointsCount = 14;
      const heartStartIndex = points.length;

      for (let i = 0; i < heartPointsCount; i++) {
        const t = (Math.PI * 2 * i) / heartPointsCount;
        const hx = cx + (16 * Math.pow(Math.sin(t), 3)) * 4.2;
        const hy = cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 4.2;
        points.push({
          x: hx,
          y: hy,
          size: 2.8,
          alpha: 0.95,
          shimmerSpeed: 0.05,
          shimmerOffset: t,
        });
      }

      for (let i = 0; i < heartPointsCount; i++) {
        edges.push({
          from: heartStartIndex + i,
          to: heartStartIndex + ((i + 1) % heartPointsCount),
          alpha: 0.65,
        });
      }
    };

    generateConstellationData();

    // Stardust floating particles
    const stardust: StardustParticle[] = [];
    const colors = [
      'rgba(254, 240, 138, ', // amber-200
      'rgba(251, 191, 36, ',  // amber-400
      'rgba(253, 224, 71, ',  // yellow-300
      'rgba(254, 205, 211, ', // rose-200
    ];

    const emitStardust = (x: number, y: number) => {
      if (stardust.length > 60) return;
      for (let i = 0; i < 2; i++) {
        stardust.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6 - 0.3,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.6 + 0.3,
          decay: Math.random() * 0.015 + 0.01,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    // Event listeners for smooth mouse & touch tracking
    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      isCursorInWindow = true;
      setIsActive(true);
      emitStardust(targetX, targetY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetX = e.touches[0].clientX;
        targetY = e.touches[0].clientY;
        isCursorInWindow = true;
        setIsActive(true);
        emitStardust(targetX, targetY);
      }
    };

    const handleMouseLeave = () => {
      isCursorInWindow = false;
    };

    const handleTouchEnd = () => {
      // Keep spotlight briefly, then gentle fade
      setTimeout(() => {
        isCursorInWindow = false;
      }, 800);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchend', handleTouchEnd);

    // Animation render loop
    let animationFrameId: number;

    const render = () => {
      time += 0.03;

      // Lerp smooth follow with gentle fluid inertia
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      // Smooth fade in / fade out of spotlight
      const targetAlpha = isCursorInWindow ? 1 : 0.35; // Keep a soft ambient breathing halo even when idle
      spotlightAlpha += (targetAlpha - spotlightAlpha) * 0.08;

      // Breathing radius modulation
      const breathingRadius = spotlightRadius + Math.sin(time * 1.5) * 8;

      ctx.clearRect(0, 0, width, height);

      // --- PASS 1: Render Hidden Constellations Masked by the Spotlight ---
      ctx.save();

      // Create circular clipping path matching the spotlight
      ctx.beginPath();
      ctx.arc(currentX, currentY, breathingRadius, 0, Math.PI * 2);
      ctx.clip();

      // Draw constellation edges within the spotlight
      ctx.strokeStyle = '#fef08a';
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const p1 = points[edge.from];
        const p2 = points[edge.to];
        if (!p1 || !p2) continue;

        // Check if edge is near spotlight to optimize
        const midX = (p1.x + p2.x) * 0.5;
        const midY = (p1.y + p2.y) * 0.5;
        const dist = Math.hypot(midX - currentX, midY - currentY);

        if (dist < breathingRadius + 30) {
          const edgeAlpha = edge.alpha * spotlightAlpha * (1 - dist / (breathingRadius + 30));
          ctx.globalAlpha = Math.max(0, edgeAlpha * 0.7);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw constellation star points with shimmering glow
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dist = Math.hypot(p.x - currentX, p.y - currentY);
        if (dist < breathingRadius) {
          const shimmer = Math.sin(time * p.shimmerSpeed * 20 + p.shimmerOffset) * 0.3 + 0.7;
          const radialFade = 1 - dist / breathingRadius;
          const alpha = p.alpha * shimmer * radialFade * spotlightAlpha;

          ctx.globalAlpha = Math.max(0, alpha);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#fef08a';

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // --- PASS 2: Warm Gold Cinematic Spotlight Halo (Feathered Radial Gradient) ---
      ctx.save();
      const gradient = ctx.createRadialGradient(
        currentX,
        currentY,
        0,
        currentX,
        currentY,
        breathingRadius
      );

      gradient.addColorStop(0, `rgba(254, 240, 138, ${0.28 * spotlightAlpha})`);
      gradient.addColorStop(0.35, `rgba(251, 191, 36, ${0.14 * spotlightAlpha})`);
      gradient.addColorStop(0.7, `rgba(244, 63, 94, ${0.06 * spotlightAlpha})`);
      gradient.addColorStop(1, 'rgba(8, 5, 9, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(currentX, currentY, breathingRadius, 0, Math.PI * 2);
      ctx.fill();

      // Central specular highlight
      const coreGrad = ctx.createRadialGradient(
        currentX,
        currentY,
        0,
        currentX,
        currentY,
        35
      );
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.25 * spotlightAlpha})`);
      coreGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // --- PASS 3: Floating Stardust Trailing Particles ---
      ctx.save();
      for (let i = stardust.length - 1; i >= 0; i--) {
        const s = stardust[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          stardust.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = s.alpha * spotlightAlpha;
        ctx.fillStyle = `${s.color}${s.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#fde047';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{
        mixBlendMode: 'screen',
        opacity: 0.95,
      }}
    />
  );
};
