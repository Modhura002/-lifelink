'use client';

import { motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import { Phone, Shield, HeartPulse, Activity, ArrowDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/store';
import DemoModal from '@/components/landing/DemoModal';
import ParticleCanvas from '@/components/landing/ParticleCanvas';

/* ── Marquee ticker ─────────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  '🚑 Ambulance dispatched in 47s — Mumbai',
  '✅ Patient admitted at AIIMS — Delhi',
  '🏥 4 beds cleared — Bangalore',
  '⚡ 3.8 min average response time',
  '🚑 Ambulance en route — Chennai',
  '✅ Emergency resolved — Pune',
  '❤️ 50,000+ lives saved this year',
  '🛡️ HIPAA compliant & encrypted',
];

function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden border-t border-white/10 bg-white/[0.03] py-2.5">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-xs font-medium text-white/50 flex items-center gap-12">
            {item}
            <span className="text-white/20">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Floating orbs background ────────────────────────────────────────────────── */
function AmbientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orb — blue */}
      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{ width: 600, height: 600, left: '-10%', top: '-20%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Secondary orb — red/emergency */}
      <motion.div
        className="absolute rounded-full blur-[140px]"
        style={{ width: 500, height: 500, right: '-5%', top: '10%', background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)' }}
        animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      {/* Tertiary orb — purple */}
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{ width: 400, height: 400, left: '40%', bottom: '5%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }}
        animate={{ x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />
      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="hero-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
    </div>
  );
}

/* ── Animated EKG line across hero ─────────────────────────────────────────── */
function EKGDecor() {
  return (
    <div className="absolute bottom-32 left-0 right-0 overflow-hidden opacity-[0.12] pointer-events-none">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16">
        <motion.path
          d="M0,40 L120,40 L150,40 L165,10 L180,70 L195,5 L210,75 L225,40 L240,40 L360,40 L390,40 L405,10 L420,70 L435,5 L450,75 L465,40 L480,40 L600,40 L630,40 L645,10 L660,70 L675,5 L690,75 L705,40 L720,40 L840,40 L870,40 L885,10 L900,70 L915,5 L930,75 L945,40 L960,40 L1080,40 L1110,40 L1125,10 L1140,70 L1155,5 L1170,75 L1185,40 L1200,40 L1320,40 L1350,40 L1365,10 L1380,70 L1395,5 L1410,75 L1425,40 L1440,40"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, ease: 'easeInOut', delay: 1 }}
        />
      </svg>
    </div>
  );
}

/* ── Hero stats ─────────────────────────────────────────────────────────────── */
const HERO_STATS = [
  { value: '50K+', label: 'Lives Saved' },
  { value: '200+', label: 'Hospitals' },
  { value: '<4 min', label: 'Avg Response' },
  { value: '99.9%', label: 'Uptime' },
];

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [showDemo, setShowDemo] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), { stiffness: 200, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [prefersReducedMotion, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => { mouseX.set(0); mouseY.set(0); }, [mouseX, mouseY]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 180]);
  const textParallax = useTransform(scrollYProgress, [0, 0.5], [0, prefersReducedMotion ? 0 : -60]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #050810 0%, #0a0e1a 40%, #0c0814 100%)' }}>
      <ParticleCanvas />
      <AmbientOrbs />
      <EKGDecor />

      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ y: parallaxY }}
      >
        <div className="flex min-h-screen flex-col items-center justify-center pt-20 pb-16">

          {/* ── Top badge ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Emergency Response · Reimagined
            </span>
          </motion.div>

          {/* ── Massive headline ── */}
          <motion.div
            style={{ y: textParallax }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
              className="font-black leading-[0.9] tracking-tight text-white"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
            >
              EVERY
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 40%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                SECOND
              </span>
              <br />
              MATTERS.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-8 text-lg sm:text-xl text-white/50 max-w-xl mx-auto leading-relaxed"
            >
              One tap. GPS precision. Smart hospital matching. Real-time ambulance tracking.
              <br className="hidden sm:block" />
              <span className="text-white/70">Life-saving technology in your pocket.</span>
            </motion.p>
          </motion.div>

          {/* ── CTA row ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="h-14 px-10 text-base font-black tracking-wide shadow-2xl shadow-red-500/30 border-0"
                style={{ background: 'linear-gradient(135deg, #ef4444, #ec4899)', color: 'white' }}
                onClick={() => useNavigationStore.getState().setCurrentPage('signup')}
              >
                <Phone className="size-5" />
                Get Emergency Card Free
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/40 backdrop-blur-sm"
                onClick={() => setShowDemo(true)}
              >
                <Play className="size-4" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* ── Trust badges ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-6 flex items-center gap-6 text-xs text-white/30 font-medium"
          >
            <div className="flex items-center gap-1.5"><Shield className="size-3.5 text-white/20" />HIPAA Compliant</div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5"><HeartPulse className="size-3.5 text-white/20" />24/7 Active</div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5"><Activity className="size-3.5 text-white/20" />Real-time</div>
          </motion.div>

          {/* ── 3D Phone + stats grid ── */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-16 w-full max-w-4xl mx-auto"
          >
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Phone mockup */}
              <motion.div
                ref={phoneRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative flex items-center justify-center cursor-pointer"
                style={{ perspective: 1000 }}
              >
                <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
                  {/* Glow behind phone */}
                  <div className="absolute -inset-8 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)' }} />

                  {/* SOS rings */}
                  {[0, 0.7, 1.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-red-500/30"
                      style={{ transform: 'translate(-50%,-50%)', top: '50%', left: '50%', width: 300, height: 300, borderRadius: '50%' }}
                      animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeOut' }}
                    />
                  ))}

                  {/* Phone frame */}
                  <div className="relative z-10 w-52 h-96 sm:w-60 sm:h-[28rem] rounded-[2.5rem] overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset' }}
                  >
                    {/* Notch */}
                    <div className="mx-auto mt-4 w-24 h-6 rounded-full bg-black/60" />
                    {/* Screen content */}
                    <div className="flex flex-col items-center justify-center mt-8 gap-4 px-4">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">LifeLink</p>

                      {/* SOS button */}
                      <motion.div
                        className="relative flex items-center justify-center w-32 h-32 rounded-full"
                        style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 0 40px rgba(239,68,68,0.6), 0 0 80px rgba(239,68,68,0.2)' }}
                        animate={{ boxShadow: ['0 0 40px rgba(239,68,68,0.5)', '0 0 60px rgba(239,68,68,0.8)', '0 0 40px rgba(239,68,68,0.5)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-4xl font-black text-white tracking-wider">SOS</span>
                      </motion.div>

                      <p className="text-[10px] text-white/50 font-medium">Hold 2s for Emergency</p>

                      {/* Status bar */}
                      <div className="mt-2 flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        <span className="text-[9px] text-emerald-400 font-semibold">GPS Active · 108 Ready</span>
                      </div>

                      {/* Mini info */}
                      <div className="w-full mt-2 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5">Your Emergency Profile</p>
                        <div className="flex gap-2 flex-wrap">
                          {['O+', 'Penicillin ⚠', 'Metformin'].map((t) => (
                            <span key={t} className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Bottom bar */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/20" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Stats grid */}
              <div className="flex-1 grid grid-cols-2 gap-4 w-full lg:w-auto">
                {HERO_STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, rotateX: -3, rotateY: 3 }}
                    style={{ perspective: 600, transformStyle: 'preserve-3d' }}
                    className="rounded-2xl p-5 text-center cursor-default"
                  >
                    <div
                      className="rounded-2xl p-5 text-center"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="text-3xl sm:text-4xl font-black text-white">{s.value}</div>
                      <div className="text-xs text-white/40 font-medium mt-1 uppercase tracking-wider">{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-12 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-semibold">Scroll</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowDown className="w-4 h-4 text-white/20" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Marquee at absolute bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Marquee />
      </div>

      <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </section>
  );
}
