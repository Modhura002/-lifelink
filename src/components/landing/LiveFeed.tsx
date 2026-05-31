'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, MapPin, Clock, CheckCircle2, Ambulance, Building2, Radio } from 'lucide-react';

const FEED_EVENTS = [
  { type: 'sos', city: 'Mumbai', msg: 'SOS activated — ambulance dispatched in 47s', time: '0m ago', icon: Siren, color: 'text-red-500', bg: 'bg-red-500/10' },
  { type: 'resolved', city: 'Delhi', msg: 'Patient admitted at AIIMS Emergency', time: '2m ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { type: 'ambulance', city: 'Bangalore', msg: 'Ambulance KA-05 en route — ETA 3.2 min', time: '3m ago', icon: Ambulance, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { type: 'hospital', city: 'Chennai', msg: 'Apollo Hospital cleared 4 emergency beds', time: '5m ago', icon: Building2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { type: 'sos', city: 'Hyderabad', msg: 'Cardiac event — advanced life support dispatched', time: '6m ago', icon: Siren, color: 'text-red-500', bg: 'bg-red-500/10' },
  { type: 'resolved', city: 'Pune', msg: 'Emergency resolved — response time 4.1 min', time: '8m ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { type: 'ambulance', city: 'Kolkata', msg: 'Ambulance WB-01 arrived at scene', time: '9m ago', icon: Ambulance, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { type: 'sos', city: 'Ahmedabad', msg: 'Road accident — multi-unit response activated', time: '11m ago', icon: Siren, color: 'text-red-500', bg: 'bg-red-500/10' },
  { type: 'hospital', city: 'Surat', msg: 'Narmada General: ICU at 82% capacity — alert sent', time: '13m ago', icon: Building2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { type: 'resolved', city: 'Jaipur', msg: 'Trauma patient stabilized in OR', time: '15m ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

interface FeedItem { type: string; city: string; msg: string; time: string; icon: React.ElementType; color: string; bg: string; }

function FeedRow({ item }: { item: FeedItem }) {
  return (
    <div className="flex items-start gap-3 py-2.5 px-1 border-b border-border/40 last:border-0">
      <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${item.bg}`}>
        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold">{item.city}</span>
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />{item.time}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.msg}</p>
      </div>
    </div>
  );
}

export default function LiveFeed() {
  const [feed, setFeed] = useState(FEED_EVENTS.slice(0, 5));
  const [activeIndex, setActiveIndex] = useState(0);

  // Rotate in new events periodically
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % FEED_EVENTS.length;
        setFeed(FEED_EVENTS.slice(next, next + 5).concat(FEED_EVENTS.slice(0, Math.max(0, next + 5 - FEED_EVENTS.length))));
        return next;
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-muted/30 border-y border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emergency/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emergency">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emergency opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emergency" />
              </span>
              Live Network Activity
            </span>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Our network{' '}
              <span className="gradient-text">never sleeps.</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Across 200+ cities, LifeLink coordinates thousands of emergency responses 24/7 —
              connecting patients with the right care in under 4 minutes on average.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { icon: Siren, value: '47', label: 'Active now', color: 'text-red-500 bg-red-500/10' },
                { icon: Ambulance, value: '312', label: 'Ambulances online', color: 'text-blue-500 bg-blue-500/10' },
                { icon: Building2, value: '218', label: 'Hospitals linked', color: 'text-emerald-500 bg-emerald-500/10' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 text-center">
                  <div className={`mx-auto mb-2 w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — live feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden">
              {/* Feed header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-muted/30">
                <Radio className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Live Emergency Feed</span>
                <motion.div
                  className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  LIVE
                </motion.div>
              </div>

              {/* Events */}
              <div className="px-3 py-1 relative overflow-hidden" style={{ minHeight: 260 }}>
                <AnimatePresence mode="popLayout">
                  {feed.map((item, i) => (
                    <motion.div
                      key={`${item.city}-${item.time}-${i}`}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <FeedRow item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/50">Showing live events across India · Updated in real-time</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
