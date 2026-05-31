'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Crosshair } from 'lucide-react';

interface Blip { id: number; x: number; y: number; age: number; city: string; severity: number }

const CITIES = [
  { name: 'Mumbai', x: 0.25, y: 0.55 },
  { name: 'Delhi', x: 0.45, y: 0.2 },
  { name: 'Bangalore', x: 0.35, y: 0.75 },
  { name: 'Chennai', x: 0.45, y: 0.8 },
  { name: 'Kolkata', x: 0.72, y: 0.35 },
  { name: 'Hyderabad', x: 0.42, y: 0.6 },
  { name: 'Pune', x: 0.3, y: 0.58 },
  { name: 'Ahmedabad', x: 0.25, y: 0.38 },
  { name: 'Surat', x: 0.27, y: 0.45 },
  { name: 'Jaipur', x: 0.38, y: 0.3 },
];

export default function EmergencyRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blips, setBlips] = useState<Blip[]>([]);
  const sweepRef = useRef(0);
  const blipIdRef = useRef(0);
  const animRef = useRef<number>(0);
  const lastBlipRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.46;

    let localBlips: Blip[] = [];

    const draw = (time: number) => {
      ctx.clearRect(0, 0, size, size);

      // Background
      ctx.fillStyle = '#0a0e1a';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.fill();

      // Concentric rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r * i) / 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Cross hairs
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();

      // Sweep
      const sweep = sweepRef.current;

      // Sweep trail (arc)
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 60; i++) {
        const angle = sweep - (i * Math.PI) / 60;
        const alpha = ((60 - i) / 60) * 0.3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, angle - Math.PI / 60, angle);
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.fill();
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * Math.cos(sweep), r * Math.sin(sweep));
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Spawn blip when sweep crosses a city
      if (time - lastBlipRef.current > 200) {
        CITIES.forEach((city) => {
          const bx = cx + (city.x - 0.5) * 2 * r;
          const by = cy + (city.y - 0.5) * 2 * r;
          const cityAngle = Math.atan2(by - cy, bx - cx);
          const diff = ((sweep - cityAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          if (diff < 0.08 && Math.random() < 0.4) {
            localBlips.push({
              id: blipIdRef.current++,
              x: bx,
              y: by,
              age: 0,
              city: city.name,
              severity: Math.floor(Math.random() * 5) + 1,
            });
            lastBlipRef.current = time;
          }
        });
      }

      // Draw & age blips
      localBlips = localBlips
        .map((b) => ({ ...b, age: b.age + 0.016 }))
        .filter((b) => b.age < 4);

      localBlips.forEach((blip) => {
        const alpha = Math.max(0, 1 - blip.age / 4);
        const pulse = 1 + Math.sin(blip.age * 8) * 0.3 * alpha;
        const severe = blip.severity >= 4;
        const color = severe ? `rgba(239, 68, 68, ${alpha})` : `rgba(16, 185, 129, ${alpha})`;
        const innerColor = severe ? `rgba(254, 202, 202, ${alpha * 0.8})` : `rgba(167, 243, 208, ${alpha * 0.8})`;

        // Pulse ring
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, 6 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = innerColor;
        ctx.fill();
      });

      // Advance sweep
      sweepRef.current = (sweepRef.current + 0.025) % (Math.PI * 2);
      setBlips([...localBlips]);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Latest active blip labels (last 3)
  const recentBlips = [...blips].reverse().slice(0, 3);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/20">
        <Radio className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-semibold">Emergency Radar</span>
        <motion.div
          className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          SCANNING
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
        {/* Canvas radar */}
        <div className="relative shrink-0">
          <canvas
            ref={canvasRef}
            width={220}
            height={220}
            className="rounded-full"
            style={{ imageRendering: 'pixelated' }}
          />
          {/* Center crosshair overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Crosshair className="w-4 h-4 text-emerald-500/40" />
          </div>
        </div>

        {/* Blip list */}
        <div className="flex-1 w-full space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Detections</p>
          {recentBlips.length === 0 ? (
            <p className="text-xs text-muted-foreground/50 italic">Scanning…</p>
          ) : (
            recentBlips.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-muted/40 border border-border/40"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: b.severity >= 4 ? '#ef4444' : '#10b981' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{b.city}</p>
                  <p className="text-[10px] text-muted-foreground">Severity {b.severity}/5</p>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground/50">
                  {Math.floor(b.age)}s ago
                </span>
              </motion.div>
            ))
          )}
          {blips.length > 0 && (
            <p className="text-[10px] text-muted-foreground/40 pt-1">
              {blips.length} active signal{blips.length !== 1 ? 's' : ''} detected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
