'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Phone,
  Building2,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Route,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Ambulance,
  Shield,
  IndianRupee,
  Timer,
  CircleDot,
  Signal,
  Heart,
  Siren,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  DEMO_EMERGENCIES,
  DEMO_HOSPITALS,
  DEMO_PATIENTS,
  SEVERITY_LABELS,
} from '@/lib/mock-data';
import { STATUS_COLORS, getRelativeTime } from '@/lib/constants';
import { useNavigationStore, useEmergencyStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { BLOOD_GROUP_LABELS } from '@/lib/constants';

/* ──────────────────────────────────────────────
   Animation variants
   ────────────────────────────────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ──────────────────────────────────────────────
   Helper: resolve patient/hospital from IDs
   ────────────────────────────────────────────── */
function getPatientName(patientId: string) {
  return DEMO_PATIENTS.find((p) => p.id === patientId)?.name ?? 'Unknown Patient';
}
function getHospitalName(hospitalId?: string) {
  return DEMO_HOSPITALS.find((h) => h.id === hospitalId)?.name ?? 'Not Assigned';
}

/* ──────────────────────────────────────────────
   Mock driver stats
   ────────────────────────────────────────────── */
const DRIVER_STATS = {
  todayTrips: 7,
  totalDistance: 42.5,
  avgResponseTime: '4.2 min',
  rating: 4.8,
  tripsTrend: '+12%',
  distanceTrend: '+8%',
  responseTrend: '-15%',
  ratingTrend: '+0.2',
};

/* ──────────────────────────────────────────────
   Driver dashboard component
   ────────────────────────────────────────────── */
export default function DriverDashboardPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [incomingCountdown, setIncomingCountdown] = useState(30);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  // Emergency store — cross-tab sync
  const { activeEmergency: incomingEmergency, acceptEmergency, rejectEmergency, markArrived } = useEmergencyStore();
  const isIncoming = incomingEmergency?.status === 'WAITING_FOR_DRIVER' && isOnline;

  const prevIsIncoming = useRef(isIncoming);
  useEffect(() => {
    if (prevIsIncoming.current && !isIncoming && incomingEmergency === null) {
      toast({ title: 'Emergency Cancelled', description: 'The patient has cancelled the emergency request.', variant: 'destructive' });
    }
    prevIsIncoming.current = isIncoming;
  }, [isIncoming, incomingEmergency, toast]);

  // Countdown timer for incoming emergency
  useEffect(() => {
    if (isIncoming) {
      setIncomingCountdown(30);
      countdownRef.current = setInterval(() => {
        setIncomingCountdown((prev) => {
          if (prev <= 1) {
            // Auto-decline
            rejectEmergency();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isIncoming, rejectEmergency]);

  const setCurrentPage = useNavigationStore((s) => s.setCurrentPage);

  const handleAccept = useCallback(() => {
    acceptEmergency('amb-1');
    setCurrentPage('driver-navigation');
  }, [acceptEmergency, setCurrentPage]);

  const handleDecline = useCallback(() => {
    rejectEmergency();
  }, [rejectEmergency]);

  /* Active assignment — first EN_ROUTE or ARRIVED emergency */
  const activeAssignment = useMemo(() => {
    if (incomingEmergency && incomingEmergency.status !== 'WAITING_FOR_DRIVER') {
      return {
        id: incomingEmergency.requestId,
        patientId: DEMO_PATIENTS[0].id,
        hospitalId: incomingEmergency.hospitalId || DEMO_HOSPITALS[2].id,
        ambulanceId: incomingEmergency.ambulanceId || 'amb-1',
        status: incomingEmergency.status as any,
        severity: incomingEmergency.severity,
        createdAt: incomingEmergency.startedAt,
        timeline: incomingEmergency.timeline
      };
    }
    return DEMO_EMERGENCIES.find(
      (e) => e.status === 'EN_ROUTE' || e.status === 'AMBULANCE_ASSIGNED' || e.status === 'ARRIVED'
    ) ?? null;
  }, [incomingEmergency]);

  /* Recent (non-active) assignments */
  const recentAssignments = useMemo(
    () =>
      DEMO_EMERGENCIES.filter(
        (e) =>
          e.status === 'COMPLETED' ||
          e.status === 'CANCELLED'
      ).reverse(),
    []
  );

  /* Active assignment derived data */
  const activePatient = useMemo(() => {
    if (!activeAssignment) return null;
    return DEMO_PATIENTS.find((p) => p.id === activeAssignment.patientId) ?? null;
  }, [activeAssignment]);

  const activeHospital = useMemo(() => {
    if (!activeAssignment?.hospitalId) return null;
    return DEMO_HOSPITALS.find((h) => h.id === activeAssignment.hospitalId) ?? null;
  }, [activeAssignment]);

  const activeSeverity = activeAssignment
    ? SEVERITY_LABELS[activeAssignment.severity] ?? SEVERITY_LABELS[1]
    : null;

  /* Earnings mock */
  const earnings = useMemo(
    () => ({
      today: 2850,
      tripsCompleted: 7,
      rating: 4.8,
      weeklyAvg: 4.6,
    }),
    []
  );

  /* Status badge color mapping for table */
  const statusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0';
      case 'EN_ROUTE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0';
      case 'AMBULANCE_ASSIGNED':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-0';
      case 'ARRIVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0';
      default:
        return STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground';
    }
  };

  /* Stat card trend indicator helper */
  const trendIcon = (val: string) => {
    const positive = val.startsWith('+');
    const negative = val.startsWith('-');
    if (negative) return <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />;
    if (positive) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
    return null;
  };

  const formatStatusLabel = (s: string) =>
    s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 p-4 md:p-6 pb-12">
      {/* ──── Incoming Emergency Popup ──── */}
      <AnimatePresence>
        {isIncoming && incomingEmergency && (
          <motion.div
            key="incoming-emergency"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Card className="overflow-hidden border-2 border-red-500/50 shadow-[0_0_30px_oklch(0.55_0.24_27/0.3)]">
              <CardContent className="p-0">
                {/* Urgent header bar */}
                <motion.div
                  className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-5 py-3 flex items-center justify-between"
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
                    <span className="text-white font-bold text-sm tracking-wider uppercase">Incoming Emergency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-white"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <span className="text-white/90 font-mono font-bold text-lg">{incomingCountdown}s</span>
                  </div>
                </motion.div>

                {/* Emergency details */}
                <div className="p-5 space-y-4 bg-gradient-to-b from-red-950/20 to-transparent">
                  {/* Patient Info */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
                      <span className="text-red-400 font-bold text-lg">
                        {(incomingEmergency.patientName ?? 'U').split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{incomingEmergency.patientName ?? 'Unknown Patient'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${
                          SEVERITY_LABELS[incomingEmergency.severity]?.bgColor ?? 'bg-red-900/30'
                        } ${
                          SEVERITY_LABELS[incomingEmergency.severity]?.color ?? 'text-red-400'
                        } border-0 text-[10px] font-bold px-2`}>
                          SEV {incomingEmergency.severity} — {SEVERITY_LABELS[incomingEmergency.severity]?.label ?? 'CRITICAL'}
                        </Badge>
                        {incomingEmergency.patientBloodGroup && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {BLOOD_GROUP_LABELS[incomingEmergency.patientBloodGroup] ?? incomingEmergency.patientBloodGroup}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {incomingEmergency.description && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                      <p className="text-xs text-zinc-400">
                        <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-400" />
                        {incomingEmergency.description}
                      </p>
                    </div>
                  )}

                  {/* Location & Distance */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-red-400" />
                      <span>New Delhi, India</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Route className="h-4 w-4 text-sky-400" />
                      <span className="font-medium text-sky-400">~3.2 km away</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Timer className="h-4 w-4 text-amber-400" />
                      <span>ETA ~8 min</span>
                    </div>
                  </div>

                  {/* Countdown progress bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(incomingCountdown / 30) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAccept}
                      size="lg"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-6 shadow-lg shadow-emerald-500/20 gap-2 border-0"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Accept
                    </Button>
                    <Button
                      onClick={handleDecline}
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
        )}
      </AnimatePresence>

      {/* ──── Page Title ──── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">Driver Dashboard</h1>
          <p className="text-muted-foreground mt-1 break-words text-sm sm:text-base">Manage your assignments and track performance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Signal className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </motion.div>

      {/* ──── 1. Header Card: Driver Profile ──── */}
      <motion.div variants={fadeUp}>
        <Card className="card-shine overflow-hidden">
          <CardContent className="p-0">
            {/* Gradient top bar */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
            <div className="p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/20">
                      RK
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Rajesh Kumar</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Ambulance className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">DL-01-EM-0012</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        <Shield className="h-2.5 w-2.5 mr-1 text-emerald-500" />
                        Verified Driver
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Right: Shift Status Toggle */}
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ──── 2. Stats Row ──── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          {
            label: "Today's Trips",
            value: DRIVER_STATS.todayTrips,
            icon: <Route className="h-4 w-4" />,
            trend: DRIVER_STATS.tripsTrend,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
          },
          {
            label: 'Total Distance',
            value: `${DRIVER_STATS.totalDistance} km`,
            icon: <MapPin className="h-4 w-4" />,
            trend: DRIVER_STATS.distanceTrend,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-900/20',
            iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
          },
          {
            label: 'Avg Response',
            value: DRIVER_STATS.avgResponseTime,
            icon: <Timer className="h-4 w-4" />,
            trend: DRIVER_STATS.responseTrend,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
          },
          {
            label: 'Rating',
            value: DRIVER_STATS.rating,
            icon: <Star className="h-4 w-4 fill-current" />,
            trend: DRIVER_STATS.ratingTrend,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-500',
          },
        ].map((stat) => (
          <Card key={stat.label} className="card-hover overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between min-w-0 gap-1">
                <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                  {trendIcon(stat.trend)}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-2 sm:mt-3 min-w-0">
                <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 break-words line-clamp-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ──── 3. Current Assignment Card ──── */}
      <AnimatePresence mode="wait">
        {activeAssignment && activePatient && activeHospital ? (
          <motion.div
            key="active-assignment"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="card-shine overflow-hidden border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-base">Current Assignment</CardTitle>
                    <Badge className={`${statusBadge(activeAssignment.status)} text-[10px] font-semibold`}>
                      {formatStatusLabel(activeAssignment.status)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{activeAssignment.id}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Patient info row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Patient */}
                  <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        activeSeverity?.bgColor ?? 'bg-muted'
                      }`}
                    >
                      {activePatient.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{activePatient.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`${activeSeverity?.bgColor} ${activeSeverity?.color} border-0 text-[9px] font-bold px-1.5`}>
                          SEV {activeAssignment.severity} — {activeSeverity?.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {BLOOD_GROUP_LABELS[activePatient.bloodGroup ?? 'O_POS']}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Hospital */}
                  <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{activeHospital.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{activeHospital.address}, {activeHospital.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-sky-500" />
                        <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">3.2 km</span>
                        <Clock className="h-3 w-3 text-muted-foreground ml-1" />
                        <span className="text-xs text-muted-foreground">~12 min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    size="lg"
                    onClick={() => setCurrentPage('driver-navigation')}
                  >
                    <Navigation className="h-4 w-4" />
                    Navigate
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="gap-2" size="lg" onClick={() => toast({ title: 'Calling Patient', description: 'Connecting...' })}>
                    <Phone className="h-4 w-4" />
                    Call Patient
                  </Button>
                  <Button variant="outline" className="gap-2" size="lg" onClick={() => markArrived()}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Mark Arrived
                  </Button>
                </div>

                {/* Mini Timeline */}
                <div className="relative">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Assignment Progress</p>
                  <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {activeAssignment.timeline.map((event, idx) => {
                      const isLast = idx === activeAssignment.timeline.length - 1;
                      return (
                        <div key={event.id} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isLast
                                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {isLast ? <CircleDot className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            </div>
                            <p className="text-[10px] font-medium mt-1 text-center whitespace-nowrap max-w-[80px] truncate">{event.event}</p>
                            <p className="text-[9px] text-muted-foreground">{getRelativeTime(event.timestamp)}</p>
                          </div>
                          {!isLast && (
                            <div className="h-0.5 w-8 md:w-12 bg-emerald-300 dark:bg-emerald-800 mx-1 mt-[-18px] shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* ──── Empty State ──── */
          <motion.div
            key="empty-assignment"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="card-hover">
              <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Ambulance className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No Active Assignment</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  You&apos;re all caught up! New emergency assignments will appear here automatically when dispatched.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Waiting for new assignment...
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── Two-column: Recent Assignments + Earnings ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ──── 4. Recent Assignments Table ──── */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Recent Assignments</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">{recentAssignments.length}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentAssignments.length > 0 ? (
                <div className="space-y-2">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1">Status</div>
                    <div className="col-span-3">Patient</div>
                    <div className="col-span-3">Hospital</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-1">Dist</div>
                    <div className="col-span-2">Duration</div>
                  </div>
                  {recentAssignments.map((em, idx) => {
                    const patientName = getPatientName(em.patientId);
                    const hospitalName = getHospitalName(em.hospitalId);
                    const sev = SEVERITY_LABELS[em.severity] ?? SEVERITY_LABELS[1];
                    return (
                      <motion.div
                        key={em.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        {/* Status */}
                        <div className="col-span-1">
                          <Badge className={`${statusBadge(em.status)} text-[9px] font-semibold px-1.5 py-0`}>
                            {em.status === 'COMPLETED' ? (
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                            ) : (
                              <XCircle className="h-2.5 w-2.5 mr-0.5" />
                            )}
                          </Badge>
                        </div>
                        {/* Patient */}
                        <div className="col-span-3 flex items-center gap-1.5 min-w-0">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${sev.bgColor.includes('green') ? 'bg-emerald-500' : sev.bgColor.includes('yellow') ? 'bg-yellow-500' : sev.bgColor.includes('orange') ? 'bg-orange-500' : 'bg-red-500'}`} />
                          <span className="text-xs font-medium truncate">{patientName}</span>
                        </div>
                        {/* Hospital */}
                        <div className="col-span-3 min-w-0">
                          <span className="text-xs text-muted-foreground truncate block">{hospitalName}</span>
                        </div>
                        {/* Time */}
                        <div className="col-span-2">
                          <span className="text-[10px] text-muted-foreground">{getRelativeTime(em.createdAt)}</span>
                        </div>
                        {/* Distance */}
                        <div className="col-span-1">
                          <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                            {em.id === 'ER-D2J9P3' ? '5.8' : '—'} km
                          </span>
                        </div>
                        {/* Duration */}
                        <div className="col-span-2">
                          <span className="text-[10px] text-muted-foreground">
                            {em.id === 'ER-D2J9P3' ? '~45 min' : '—'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ──── 5. Earnings Summary Card ──── */}
        <motion.div variants={fadeUp} className="space-y-4">
          <Card className="card-shine overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold">Earnings Today</h3>
              </div>

              {/* Big amount */}
              <div>
                <motion.p
                  className="text-3xl font-bold tracking-tight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  ₹{earnings.today.toLocaleString('en-IN')}
                </motion.p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {earnings.tripsCompleted} trips completed today
                </p>
              </div>

              <Separator />

              {/* Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(earnings.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-bold ml-1">{earnings.rating}</span>
                </div>
              </div>

              {/* Weekly average */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly avg</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{earnings.weeklyAvg}</span>
                </div>
              </div>

              <Separator />

              {/* Mini breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Base fare</span>
                  <span className="font-medium">₹1,400</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Distance bonus</span>
                  <span className="font-medium">₹850</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Emergency premium</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">₹600</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions card */}
          <Card className="card-hover">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="gap-2 h-10 text-xs"
                  onClick={() => setCurrentPage('driver-navigation')}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Navigation
                </Button>
                <Button variant="outline" className="gap-2 h-10 text-xs" onClick={() => toast({ title: 'Driver Support', description: 'Connecting to dispatch center...' })}>
                  <Phone className="h-3.5 w-3.5" />
                  Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
