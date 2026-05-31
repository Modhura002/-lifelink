'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  MapPin,
  Route,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Droplets,
  Phone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SosAlert } from '@/hooks/useSosStream';
import { SEVERITY_LABELS } from '@/lib/mock-data';
import { BLOOD_GROUP_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SosAlertCardProps {
  alert: SosAlert;
  onAccept: (emergencyId: string, matchTier: number | null) => Promise<void>;
  onDecline: (emergencyId: string) => void;
  /** Countdown seconds — starts at 30 */
  countdownSeconds?: number;
  isAccepting?: boolean;
}

export default function SosAlertCard({
  alert,
  onAccept,
  onDecline,
  countdownSeconds = 30,
  isAccepting = false,
}: SosAlertCardProps) {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sev = SEVERITY_LABELS[alert.severity] ?? SEVERITY_LABELS[3];

  // Countdown timer
  useEffect(() => {
    setCountdown(countdownSeconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onDecline(alert.emergencyId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert.emergencyId]);

  const bloodLabel = alert.patientBloodGroup
    ? BLOOD_GROUP_LABELS[alert.patientBloodGroup] ?? alert.patientBloodGroup
    : null;

  const TIER_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: 'Exact Match', color: 'bg-emerald-500' },
    2: { label: 'PIN Match', color: 'bg-blue-500' },
    3: { label: 'City Match', color: 'bg-amber-500' },
    4: { label: 'Regional Match', color: 'bg-orange-500' },
  };

  const tierInfo = alert.matchTier && TIER_LABELS[alert.matchTier] 
    ? TIER_LABELS[alert.matchTier] 
    : { label: 'Nearby Match', color: 'bg-sky-400' };

  return (
    <motion.div
      key={alert.emergencyId}
      layout
      initial={{ opacity: 0, y: -24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
    >
      <Card className="overflow-hidden border-2 border-red-500/50 shadow-[0_0_40px_oklch(0.55_0.24_27/0.25)]">
        <CardContent className="p-0">
          {/* ── Urgent header bar ── */}
          <motion.div
            className="bg-gradient-to-r from-red-700 via-red-500 to-orange-500 px-5 py-3 flex items-center justify-between"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 200%' }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
              >
                <Siren className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-white font-bold text-sm tracking-wider uppercase">
                Incoming SOS — {alert.city}
              </span>
              <Badge className={cn(tierInfo.color, 'text-white border-white/20 uppercase tracking-widest text-[10px]')}>
                {tierInfo.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-white"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-white/90 font-mono font-bold text-lg">
                {countdown}s
              </span>
            </div>
          </motion.div>

          {/* ── Emergency details ── */}
          <div className="p-5 space-y-4 bg-gradient-to-b from-red-950/20 to-transparent">
            {/* Patient row */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center shrink-0">
                <span className="text-red-400 font-bold text-lg">
                  {(alert.patientName || 'U').split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate">{alert.patientName}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge
                    className={cn(
                      sev.bgColor,
                      sev.color,
                      'border-0 text-[10px] font-bold px-2',
                    )}
                  >
                    SEV {alert.severity} — {sev.label}
                  </Badge>
                  {bloodLabel && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                      <Droplets className="h-2.5 w-2.5 text-red-400" />
                      {bloodLabel}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {alert.description && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-400">
                  <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-400" />
                  {alert.description}
                </p>
              </div>
            )}

            {/* Location & city */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-red-400" />
                <span>{alert.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Route className="h-4 w-4 text-sky-400" />
                <span className="font-medium text-sky-400">GPS: {alert.location}</span>
              </div>
              {alert.patientPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">{alert.patientPhone}</span>
                </div>
              )}
            </div>

            {/* Countdown progress bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${(countdown / countdownSeconds) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => onAccept(alert.emergencyId, alert.matchTier)}
                disabled={isAccepting}
                size="lg"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-6 shadow-lg shadow-emerald-500/20 gap-2 border-0"
              >
                {isAccepting ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                {isAccepting ? 'Accepting...' : 'Accept'}
              </Button>
              <Button
                onClick={() => onDecline(alert.emergencyId)}
                disabled={isAccepting}
                size="lg"
                variant="outline"
                className="flex-1 border-red-600/40 text-red-400 hover:bg-red-950/30 hover:text-red-300 font-bold text-base py-6 gap-2"
              >
                <XCircle className="h-5 w-5" />
                Decline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
