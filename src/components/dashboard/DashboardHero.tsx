'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface DashboardHeroProps {
  greeting: string;
  name: string;
  subtitle: string;
  gradient: string;          // CSS gradient string
  accentColor: string;       // Tailwind color for glow, e.g. 'rgba(99,102,241,0.15)'
  icon: ReactNode;
  badge?: string;
  badgeColor?: string;
  stats?: { value: string; label: string }[];
  rightContent?: ReactNode;
}

export default function DashboardHero({
  greeting, name, subtitle, gradient, accentColor, icon, badge, badgeColor, stats, rightContent
}: DashboardHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{ background: gradient }}
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: accentColor }} />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ background: accentColor, opacity: 0.5 }} />

      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" style={{ pointerEvents: 'none' }}>
        <defs>
          <pattern id="dash-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-grid)" />
      </svg>

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
              animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.1)', '0 0 0 8px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {icon}
            </motion.div>

            <div>
              {badge && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2" style={{ background: badgeColor ?? 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                  {badge}
                </span>
              )}
              <p className="text-white/60 text-sm font-medium">{greeting}</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mt-0.5">{name}</h1>
              <p className="text-white/50 text-sm mt-1">{subtitle}</p>
            </div>
          </div>

          {rightContent && (
            <div className="shrink-0">{rightContent}</div>
          )}
        </div>

        {/* Stats row */}
        {stats && stats.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <div className="text-xl sm:text-2xl font-black text-white">{s.value}</div>
                <div className="text-[11px] text-white/50 font-medium mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
