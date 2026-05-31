'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Thermometer, Wind, Droplets, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── EKG path generator ──────────────────────────────────────────────────────
function generateEKG(width: number, height: number, beats = 3): string {
  const mid = height / 2;
  const step = width / (beats * 10);
  const pts: [number, number][] = [];

  for (let b = 0; b < beats; b++) {
    const base = b * 10 * step;
    // Baseline
    pts.push([base, mid]);
    pts.push([base + step, mid]);
    // P wave
    pts.push([base + step * 1.5, mid - height * 0.08]);
    pts.push([base + step * 2, mid]);
    // PR segment
    pts.push([base + step * 2.5, mid]);
    // Q dip
    pts.push([base + step * 3, mid + height * 0.05]);
    // R spike
    pts.push([base + step * 3.5, mid - height * 0.6]);
    // S dip
    pts.push([base + step * 4, mid + height * 0.1]);
    // ST segment
    pts.push([base + step * 4.5, mid]);
    // T wave
    pts.push([base + step * 5.5, mid - height * 0.15]);
    pts.push([base + step * 6.5, mid]);
    // Baseline to next
    pts.push([base + step * 10, mid]);
  }

  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
}

// ─── Animated EKG line ────────────────────────────────────────────────────────
function EKGLine({ color = '#ef4444', bpm = 72 }: { color?: string; bpm?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [dimensions, setDimensions] = useState({ w: 300, h: 60 });
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setDimensions({ w: e.contentRect.width, h: e.contentRect.height });
    });
    if (svgRef.current) obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const { w, h } = dimensions;
    if (!pathRef.current || w === 0) return;

    const totalW = w * 2;
    const d = generateEKG(totalW, h);
    pathRef.current.setAttribute('d', d);

    const speed = (w / 60) * (bpm / 60);

    const tick = (time: number) => {
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;
      offsetRef.current = (offsetRef.current + speed * dt) % w;
      if (pathRef.current) {
        pathRef.current.style.transform = `translateX(-${offsetRef.current.toFixed(1)}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [dimensions, bpm]);

  return (
    <svg ref={svgRef} className="w-full h-full overflow-hidden" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`ekg-grad-${color.replace('#', '')}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="40%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
        <clipPath id={`ekg-clip-${color.replace('#', '')}`}>
          <rect x="0" y="0" width="100%" height="100%" />
        </clipPath>
      </defs>
      <path
        ref={pathRef}
        fill="none"
        stroke={`url(#ekg-grad-${color.replace('#', '')})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath={`url(#ekg-clip-${color.replace('#', '')})`}
      />
    </svg>
  );
}

// ─── Vital types ──────────────────────────────────────────────────────────────
interface Vital {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
  icon: React.ElementType;
  color: string;
  ekg: boolean;
  decimals?: number;
}

const BASE_VITALS: Vital[] = [
  { label: 'Heart Rate', unit: 'BPM', value: 72, min: 40, max: 140, normalMin: 60, normalMax: 100, icon: Heart, color: '#ef4444', ekg: true },
  { label: 'Blood O₂', unit: '%', value: 98, min: 85, max: 100, normalMin: 95, normalMax: 100, icon: Droplets, color: '#3b82f6', ekg: false },
  { label: 'Temperature', unit: '°C', value: 36.8, min: 35, max: 40, normalMin: 36.1, normalMax: 37.2, icon: Thermometer, color: '#f59e0b', ekg: false, decimals: 1 },
  { label: 'Resp. Rate', unit: '/min', value: 16, min: 8, max: 30, normalMin: 12, normalMax: 20, icon: Wind, color: '#10b981', ekg: false },
];

function getStatus(v: Vital) {
  if (v.value < v.normalMin - (v.normalMin - v.min) * 0.3 || v.value > v.normalMax + (v.max - v.normalMax) * 0.3) return 'critical';
  if (v.value < v.normalMin || v.value > v.normalMax) return 'warning';
  return 'normal';
}

const STATUS_STYLES = {
  normal: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'Normal' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'Attention' },
  critical: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400', badge: 'Critical' },
};

// ─── Single vital card ────────────────────────────────────────────────────────
function VitalCard({ vital, index }: { vital: Vital; index: number }) {
  const status = getStatus(vital);
  const style = STATUS_STYLES[status];
  const pct = ((vital.value - vital.min) / (vital.max - vital.min)) * 100;
  const normalMinPct = ((vital.normalMin - vital.min) / (vital.max - vital.min)) * 100;
  const normalMaxPct = ((vital.normalMax - vital.min) / (vital.max - vital.min)) * 100;
  const displayValue = vital.decimals ? vital.value.toFixed(vital.decimals) : Math.round(vital.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="relative rounded-2xl border border-border/60 bg-card p-4 overflow-hidden group cursor-default"
      style={{ perspective: 600, transformStyle: 'preserve-3d' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% 30%, ${vital.color}08, transparent 60%)` }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${vital.color}18` }}>
              <vital.icon className="w-4 h-4" style={{ color: vital.color }} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground leading-none">{vital.label}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <motion.div
                  className={cn('w-1.5 h-1.5 rounded-full', style.dot)}
                  animate={status !== 'normal' ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className={cn('text-[10px] font-semibold', style.text)}>{style.badge}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black tabular-nums" style={{ color: vital.color }}>{displayValue}</span>
            <span className="text-xs text-muted-foreground ml-1">{vital.unit}</span>
          </div>
        </div>

        {/* EKG trace or progress bar */}
        {vital.ekg ? (
          <div className="h-10 w-full mb-2">
            <EKGLine color={vital.color} bpm={vital.value} />
          </div>
        ) : (
          <div className="relative h-2 rounded-full bg-muted mb-2 overflow-visible">
            {/* Normal range highlight */}
            <div
              className="absolute top-0 h-full rounded-full opacity-20"
              style={{
                left: `${normalMinPct}%`,
                width: `${normalMaxPct - normalMinPct}%`,
                backgroundColor: vital.color,
              }}
            />
            {/* Filled bar */}
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ backgroundColor: vital.color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
            />
            {/* Needle */}
            <motion.div
              className="absolute -top-0.5 w-3 h-3 rounded-full border-2 border-background shadow-sm -translate-x-1/2"
              style={{ left: `${pct}%`, backgroundColor: vital.color }}
              animate={{ left: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Range labels */}
        <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
          <span>{vital.min}{vital.unit}</span>
          <span className="text-[9px]" style={{ color: `${vital.color}80` }}>
            Normal: {vital.normalMin}–{vital.normalMax}
          </span>
          <span>{vital.max}{vital.unit}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VitalsMonitor() {
  const [vitals, setVitals] = useState<Vital[]>(BASE_VITALS);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Simulate subtle vitals fluctuation
  const tick = useCallback(() => {
    setVitals((prev) => prev.map((v) => {
      const jitter = (Math.random() - 0.5) * 0.02 * (v.max - v.min);
      const newVal = Math.max(v.min, Math.min(v.max, v.value + jitter));
      return { ...v, value: parseFloat(newVal.toFixed(v.decimals ?? 0)) };
    }));
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [isLive, tick]);

  const allNormal = vitals.every((v) => getStatus(v) === 'normal');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Live Vitals Monitor</h3>
            <p className="text-[10px] text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allNormal && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              All Normal
            </span>
          )}
          <button
            onClick={() => setIsLive((p) => !p)}
            className={cn(
              'flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors',
              isLive
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-muted border-border text-muted-foreground',
            )}
          >
            <motion.div
              className={cn('w-1.5 h-1.5 rounded-full', isLive ? 'bg-emerald-500' : 'bg-muted-foreground')}
              animate={isLive ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {isLive ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Vitals grid */}
      <div className="grid grid-cols-2 gap-3">
        {vitals.map((v, i) => (
          <VitalCard key={v.label} vital={v} index={i} />
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground/40 text-center">
        <Zap className="w-2.5 h-2.5 inline mr-0.5" />
        Simulated vitals for demonstration · Connect a medical device for real data
      </p>
    </motion.div>
  );
}
