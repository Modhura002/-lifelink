'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Siren, Building2, Navigation, QrCode, Brain, BellRing, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Siren,
    number: '01',
    title: 'Instant SOS',
    description: 'One-tap emergency alert shares your GPS with responders and contacts in under 2 seconds.',
    accent: '#ef4444',
    glow: 'rgba(239,68,68,0.15)',
  },
  {
    icon: Building2,
    number: '02',
    title: 'Smart Hospital Match',
    description: 'AI matches you to the nearest hospital by specialty, real-time availability, and traffic.',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    icon: Navigation,
    number: '03',
    title: 'Live Tracking',
    description: 'Real-time ambulance position on a live map — know exactly when help arrives.',
    accent: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
  },
  {
    icon: QrCode,
    number: '04',
    title: 'Medical QR Card',
    description: 'Blood type, allergies, medications — your full profile accessible via one QR scan.',
    accent: '#8b5cf6',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    icon: Brain,
    number: '05',
    title: 'AI Triage',
    description: 'Instant severity assessment routes your emergency to the right resources automatically.',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: BellRing,
    number: '06',
    title: 'Family Alerts',
    description: 'Loved ones get live updates: location, hospital ETA, and status — all automatic.',
    accent: '#ec4899',
    glow: 'rgba(236,72,153,0.15)',
  },
];

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-background">
      {/* Faint grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.04] pointer-events-none">
        <defs>
          <pattern id="feat-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#feat-grid)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <span className="inline-block rounded-full border border-emergency/30 bg-emergency/10 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emergency mb-6">
            Built for Emergencies
          </span>
          <h2 className="font-black tracking-tight" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05 }}>
            Everything you need
            <br />
            <span className="gradient-text">when seconds count.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Six precision-engineered features that orchestrate every moment from SOS tap to hospital admission.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.02, zIndex: 10 }}
              style={{ perspective: 900 }}
              className="relative group bg-card"
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${f.glow}, transparent 65%)` }}
              />

              <div className="relative p-7 h-full flex flex-col">
                {/* Number + icon row */}
                <div className="flex items-start justify-between mb-5">
                  <span className="font-black text-5xl tabular-nums leading-none" style={{ color: `${f.accent}18`, WebkitTextStroke: `1px ${f.accent}30` }}>
                    {f.number}
                  </span>
                  <motion.div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}25` }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.accent }} />
                  </motion.div>
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-foreground transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.description}</p>

                {/* Arrow link */}
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: f.accent }}>
                  <span>Learn more</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>

                {/* Bottom accent line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 rounded-b"
                  style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
