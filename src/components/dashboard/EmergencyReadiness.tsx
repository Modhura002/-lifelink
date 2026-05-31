'use client';
import { useSession } from 'next-auth/react';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ShieldAlert, ShieldX, Phone, FileHeart, Droplets,
  Pill, UserCircle, QrCode, Plus, X, Pencil, ChevronRight,
  CheckCircle2, Circle, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/store';
import { BLOOD_GROUP_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ─── Symptom journal ──────────────────────────────────────────────────────────
interface SymptomEntry { id: string; symptom: string; intensity: 1 | 2 | 3; time: Date }

const QUICK_SYMPTOMS = ['Headache', 'Chest pain', 'Nausea', 'Dizziness', 'Shortness of breath', 'Fever', 'Fatigue', 'Back pain'];

function SymptomJournal() {
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState('');
  const [intensity, setIntensity] = useState<1 | 2 | 3>(1);
  const { setCurrentPage } = useNavigationStore();

  const add = (symptom: string) => {
    if (!symptom.trim()) return;
    setEntries((p) => [{ id: Date.now().toString(), symptom, intensity, time: new Date() }, ...p].slice(0, 8));
    setSelected('');
    setCustom('');
  };

  const remove = (id: string) => setEntries((p) => p.filter((e) => e.id !== id));

  const intensityLabel: Record<number, { label: string; color: string; bg: string }> = {
    1: { label: 'Mild', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    2: { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    3: { label: 'Severe', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  };

  const hasSevere = entries.some((e) => e.intensity === 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Pencil className="w-3 h-3" /> Symptom Journal
        </h4>
        <span className="text-[10px] text-muted-foreground/50">{entries.length}/8 entries</span>
      </div>

      {/* Quick pick */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_SYMPTOMS.map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s === selected ? '' : s)}
            className={cn(
              'text-[10px] px-2 py-1 rounded-full border transition-colors',
              selected === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Custom + intensity */}
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add(custom || selected)}
          placeholder={selected || 'Type symptom…'}
          className="flex-1 h-8 px-3 text-xs rounded-lg border border-border/80 bg-card focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <div className="flex gap-1">
          {([1, 2, 3] as const).map((i) => (
            <button
              key={i}
              onClick={() => setIntensity(i)}
              className={cn(
                'w-8 h-8 rounded-lg text-[10px] font-bold border transition-colors',
                intensity === i
                  ? `${intensityLabel[i].bg} ${intensityLabel[i].color} border-current`
                  : 'border-border text-muted-foreground',
              )}
            >
              {i}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="h-8 px-3"
          onClick={() => add(custom || selected)}
          disabled={!custom.trim() && !selected}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Severe warning */}
      <AnimatePresence>
        {hasSevere && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>You logged a severe symptom. Consider using the AI Chat or triggering SOS.</span>
            <Button
              size="sm"
              variant="destructive"
              className="ml-auto h-6 text-[10px] px-2 shrink-0"
              onClick={() => setCurrentPage('sos')}
            >
              SOS
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry list */}
      <AnimatePresence initial={false}>
        {entries.map((e) => {
          const info = intensityLabel[e.intensity];
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-border/50 bg-muted/30 text-xs"
            >
              <span className={cn('font-semibold px-1.5 py-0.5 rounded text-[10px]', info.bg, info.color)}>
                {info.label}
              </span>
              <span className="flex-1 font-medium">{e.symptom}</span>
              <span className="text-muted-foreground/50 font-mono text-[9px]">
                {e.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={() => remove(e.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {entries.length === 0 && (
        <p className="text-[10px] text-muted-foreground/40 text-center py-2">
          No symptoms logged · tap a symptom above to add one
        </p>
      )}

      {entries.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs gap-1"
          onClick={() => setCurrentPage('ai-chat')}
        >
          Discuss with AI Medical Assistant <ChevronRight className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

// ─── Preparedness score ───────────────────────────────────────────────────────
interface CheckItem { label: string; done: boolean; route: string; icon: React.ElementType; points: number }

function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = score / max;
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  const color = pct >= 0.8 ? '#10b981' : pct >= 0.5 ? '#f59e0b' : '#ef4444';
  const ShieldIcon = pct >= 0.8 ? ShieldCheck : pct >= 0.5 ? ShieldAlert : ShieldX;

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <ShieldIcon className="w-5 h-5 mb-0.5" style={{ color }} />
        <span className="text-xl font-black" style={{ color }}>{score}</span>
        <span className="text-[9px] text-muted-foreground">/ {max}</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EmergencyReadiness({ patient }: { patient?: any }) {
  const { data: session } = useSession();
  const user = session?.user;
  const { setCurrentPage } = useNavigationStore();

  const checks = useMemo<CheckItem[]>(() => {
    if (!patient) return [];
    return [
      { label: 'Emergency contacts added', done: (patient.emergencyContacts?.length ?? 0) > 0, route: 'profile', icon: Phone, points: 20 },
      { label: 'Blood group on file', done: !!patient.bloodGroup, route: 'profile', icon: Droplets, points: 20 },
      { label: 'Medical records uploaded', done: false, route: 'medical-records', icon: FileHeart, points: 20 }, // real user logic
      { label: 'Current medications listed', done: (patient.currentMedications?.length ?? 0) > 0, route: 'profile', icon: Pill, points: 20 },
      { label: 'Profile photo set', done: !!user?.image, route: 'profile', icon: UserCircle, points: 10 },
      { label: 'QR card generated', done: true, route: 'qr-card', icon: QrCode, points: 10 },
    ];
  }, [user, patient]);

  const score = checks.reduce((acc, c) => acc + (c.done ? c.points : 0), 0);
  const max = checks.reduce((acc, c) => acc + c.points, 0);

  const readinessLabel =
    score >= 90 ? { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400' }
    : score >= 60 ? { label: 'Good', color: 'text-amber-600 dark:text-amber-400' }
    : { label: 'Needs attention', color: 'text-red-600 dark:text-red-400' };

  return (
    <div className="space-y-5">
      {/* Score section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Emergency Preparedness Score
        </h3>

        <div className="flex items-start gap-4">
          <ScoreRing score={score} max={max} />

          <div className="flex-1 space-y-1.5">
            <div>
              <span className={cn('text-sm font-bold', readinessLabel.color)}>{readinessLabel.label}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {score < max
                  ? `Complete your profile to improve emergency response speed`
                  : `Your emergency profile is complete`}
              </p>
            </div>

            <div className="space-y-1">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-[11px]">
                  {c.done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />}
                  <span className={c.done ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
                  {!c.done && (
                    <button
                      onClick={() => setCurrentPage(c.route as any)}
                      className="ml-auto text-[10px] text-primary hover:underline shrink-0"
                    >
                      Fix →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50" />

      {/* Symptom Journal */}
      <SymptomJournal />
    </div>
  );
}
