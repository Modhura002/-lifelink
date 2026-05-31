'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  hue: number;
  size: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 160;
    const DEPTH = 1400;
    const FOV = 600;
    const HUES = [0, 10, 240, 265, 200]; // red, orange-red, blue, violet, sky

    const spawn = (): Particle => ({
      x: (Math.random() - 0.5) * 1800,
      y: (Math.random() - 0.5) * 1400,
      z: Math.random() * DEPTH,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25,
      vz: 0.6 + Math.random() * 1.0,
      hue: HUES[Math.floor(Math.random() * HUES.length)],
      size: 0.6 + Math.random() * 1.4,
    });

    const ps: Particle[] = Array.from({ length: N }, spawn);

    const project = (p: Particle, w: number, h: number) => {
      const s = FOV / (FOV + p.z);
      return { sx: p.x * s + w / 2, sy: p.y * s + h / 2, scale: s };
    };

    let mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse = { x: (e.clientX / window.innerWidth - 0.5) * 0.3, y: (e.clientY / window.innerHeight - 0.5) * 0.3 };
    };
    window.addEventListener('mousemove', onMouse);

    const tick = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Sort back-to-front for correct layering
      ps.sort((a, b) => b.z - a.z);

      // Draw connections
      for (let i = 0; i < ps.length; i++) {
        const { sx: ax, sy: ay, scale: sa } = project(ps[i], W, H);
        for (let j = i + 1; j < ps.length; j++) {
          const { sx: bx, sy: by } = project(ps[j], W, H);
          const d = Math.hypot(ax - bx, ay - by);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(255,255,255,${((1 - d / 90) * sa * 0.06).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw + move particles
      ps.forEach((p) => {
        p.z -= p.vz;
        p.x += p.vx + mouse.x;
        p.y += p.vy + mouse.y;

        if (p.z < 1) {
          Object.assign(p, spawn());
          p.z = DEPTH;
        }

        const { sx, sy, scale } = project(p, W, H);
        if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) return;

        const r = p.size * scale * 3.5;
        const alpha = Math.min(scale * 1.1, 0.85);

        // Glow
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3);
        g.addColorStop(0, `hsla(${p.hue},75%,65%,${(alpha * 0.6).toFixed(3)})`);
        g.addColorStop(1, `hsla(${p.hue},75%,65%,0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(r * 0.5, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},90%,92%,${alpha.toFixed(3)})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
