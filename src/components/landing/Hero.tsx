'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Phone, Play, Shield, HeartPulse, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/store';
import DemoModal from '@/components/landing/DemoModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const stats = [
  { value: '50,000+', label: 'Lives Saved' },
  { value: '200+', label: 'Hospitals' },
  { value: '<4min', label: 'Avg Response' },
];

/* Typing text animation words */
const HERO_WORDS = ['Never Alone.', 'Connected.', 'Protected.', 'Safe.'];

function TypingText() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className="inline-flex items-center">
      {!prefersReducedMotion ? (
        <>
          {HERO_WORDS.map((word, i) => (
            <motion.span
              key={word}
              className="gradient-text inline-block"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.5,
                delay: 0.6 + i * 0.3,
                ease: 'easeOut',
              }}
            >
              {word}
              {i < HERO_WORDS.length - 1 && (
                <motion.span
                  className="inline-block w-[2px] h-[1em] bg-white/60 ml-0.5 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.3 + 0.25, repeat: 1 }}
                />
              )}
            </motion.span>
          ))}
        </>
      ) : (
        <span className="gradient-text">Never Alone.</span>
      )}
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [showDemo, setShowDemo] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 150]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden hero-gradient pt-16"
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ y: parallaxY, opacity: parallaxOpacity }}
      >
        <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-12 lg:flex-row lg:gap-16">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex max-w-2xl flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Tag line */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emergency/30 bg-emergency/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emergency">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emergency opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emergency" />
                </span>
                Emergency Response &bull; Reimagined
              </span>
            </motion.div>

            {/* Main Headline with typing/reveal animation */}
            <motion.h1
              variants={itemVariants}
              className="mt-6 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white break-words"
            >
              Every Second Matters.{' '}
              <TypingText />
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-lg text-lg leading-relaxed text-white/70 sm:text-xl"
            >
              One-tap SOS with instant GPS tracking, smart hospital matching, and real-time
              ambulance coordination — all from your phone.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center w-full sm:w-auto gap-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-emergency hover:bg-emergency/90 text-emergency-foreground h-12 px-6 sm:px-8 text-base font-semibold shadow-lg shadow-emergency/25"
                onClick={() => useNavigationStore.getState().setCurrentPage('signup')}
              >
                <Phone className="size-5" />
                Get Emergency Card
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white px-6 sm:px-8 text-base font-semibold"
                onClick={() => setShowDemo(true)}
              >
                <Play className="size-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center gap-6 text-sm text-white/50"
            >
              <div className="flex items-center gap-2">
                <Shield className="size-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="size-4" />
                <span>24/7 Active</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Activity className="size-4" />
                <span>Real-time</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Phone Mockup with SOS */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="relative flex flex-1 items-center justify-center"
          >
            <div className="relative">
              {/* SOS Pulse Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="sos-ring-1 absolute h-64 w-64 rounded-full border-2 border-emergency/40" />
                <div className="sos-ring-2 absolute h-64 w-64 rounded-full border-2 border-emergency/30" />
                <div className="sos-ring-3 absolute h-64 w-64 rounded-full border-2 border-emergency/20" />
              </div>

              {/* Phone frame */}
              <div className="relative z-10 flex h-72 w-44 flex-col items-center rounded-[2rem] border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:h-80 sm:w-48">
                {/* Phone notch */}
                <div className="h-6 w-20 rounded-full bg-black/40" />

                {/* Phone screen content */}
                <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3">
                  {/* SOS Button */}
                  <div className="sos-glow flex h-24 w-24 items-center justify-center rounded-full bg-emergency shadow-2xl">
                    <span className="text-3xl font-black tracking-wider text-white">
                      SOS
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white/80">
                    Tap for Emergency Help
                  </p>

                  {/* Mini status */}
                  <div className="mt-2 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                    </span>
                    <span className="text-[10px] text-white/70">GPS Active</span>
                  </div>
                </div>

                {/* Phone bottom bar */}
                <div className="mb-1 h-1 w-12 rounded-full bg-white/30" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pb-12"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-white sm:text-3xl">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Demo Modal */}
      <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </section>
  );
}
