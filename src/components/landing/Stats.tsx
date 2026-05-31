'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Activity, Building2, Timer, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  color: string;
  bgColor: string;
  gradientText: string;
  trend: string;
}

const stats: StatItem[] = [
  {
    icon: Activity,
    value: 47,
    suffix: '',
    label: 'Active Emergencies Today',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    gradientText: 'gradient-text-rose',
    trend: '+12%',
  },
  {
    icon: Building2,
    value: 218,
    suffix: '',
    label: 'Hospitals Online',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    gradientText: 'gradient-text-emerald',
    trend: '+8%',
  },
  {
    icon: Timer,
    value: 3.8,
    suffix: ' min',
    decimals: 1,
    label: 'Average Response Time',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    gradientText: 'gradient-text-amber',
    trend: '-15%',
  },
  {
    icon: Star,
    value: 4.9,
    suffix: '/5',
    decimals: 1,
    label: 'Patient Satisfaction',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    gradientText: 'gradient-text-violet',
    trend: '+3%',
  },
];

function AnimatedCounter({
  target,
  decimals = 0,
  isActive,
}: {
  target: number;
  decimals?: number;
  isActive: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const duration = 2500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = eased * target;

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isActive, target]);

  return (
    <span>{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}</span>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 sm:py-32 stats-pattern">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full border border-emergency/30 bg-emergency/10 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emergency">
            Live Network
          </span>
          <h2 className="mt-4 font-black tracking-tight" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.1 }}>
            Numbers that{' '}
            <span className="gradient-text">save lives.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real-time metrics from our emergency response network across 200+ cities.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div
          ref={ref}
          className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{
                scale: 1.06,
                rotateX: -5,
                rotateY: 5,
                z: 30,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              style={{ perspective: 900, transformStyle: 'preserve-3d' }}
            >
              <div className="card-hover group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center backdrop-blur-sm shadow-sm hover:shadow-xl transition-shadow">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative">
                  {/* Decorative ring behind stat number */}
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                    <div className="stat-ring" />
                    <div className="absolute">
                      <div
                        className={`mx-auto mb-0 flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bgColor}`}
                      >
                        <stat.icon className={`size-7 ${stat.color}`} />
                      </div>
                    </div>
                  </div>

                  <div className={cn('text-3xl font-extrabold tracking-tight sm:text-4xl', stat.gradientText)}>
                    <AnimatedCounter
                      target={stat.value}
                      decimals={stat.decimals}
                      isActive={isInView}
                    />
                    <span className="text-lg text-muted-foreground">
                      {stat.suffix}
                    </span>
                  </div>

                  {/* Trend indicator */}
                  <div className="mt-1.5 flex items-center justify-center gap-1">
                    <TrendingUp className={cn(
                      'size-3',
                      stat.trend.startsWith('-') ? 'text-emerald-500' : 'text-emerald-500'
                    )} />
                    <span className="text-xs font-medium text-emerald-500">
                      {stat.trend}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
