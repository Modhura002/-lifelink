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
import { useNavigationStore, useEmergencyStore, useDriverAssignmentStore } from '@/store';
import type { DriverAssignment } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { BLOOD_GROUP_LABELS } from '@/lib/constants';
import DashboardHero from '@/components/dashboard/DashboardHero';
import { useSosStream } from '@/hooks/useSosStream';
import SosAlertCard from '@/components/driver/SosAlertCard';
import LocationOnboardingModal from '@/components/driver/LocationOnboardingModal';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSession } from 'next-auth/react';

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
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Zustand stores
  const { markArrived } = useEmergencyStore();
  const { setAssignment } = useDriverAssignmentStore();
  const setCurrentPage = useNavigationStore((s) => s.setCurrentPage);
  const geo = useGeolocation();
  const { data: session } = useSession();

  const driverName = session?.user?.name || 'Driver';
  const driverInitials = driverName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [driverInfo, setDriverInfo] = useState<{ pinCode: string | null; city: string | null; country: string | null }>({ pinCode: null, city: null, country: null });

  const toggleStatus = async (checked: boolean) => {
    try {
      const newStatus = checked ? 'AVAILABLE' : 'OFFLINE';
      const res = await fetch('/api/driver/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverStatus: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      setIsOnline(checked);
      toast({ title: 'Status Updated', description: `You are now ${checked ? 'Online' : 'Offline'}.` });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not change status.', variant: 'destructive' });
    }
  };

  // SSE broadcast stream — only when driver is online
  const { pendingAlerts, dismissAlert } = useSosStream({
    isOnline,
    onAssigned: (emergencyId) => {
      toast({
        title: 'Patient Assigned',
        description: 'A patient has been assigned an ambulance by another driver.',
      });
    },
    onSetupRequired: () => {
      setShowLocationModal(true);
    },
    onDriverInfo: (info) => {
      setDriverInfo(info);
    }
  });

  // Accept handler — calls real API, atomic Prisma transaction
  const handleAccept = useCallback(async (emergencyId: string, matchTier: number | null) => {
    setAcceptingId(emergencyId);
    try {
      const res = await fetch('/api/driver/accept-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyId, matchTier }),
      });

      if (res.status === 409) {
        toast({
          title: 'Already Assigned',
          description: 'Another driver accepted this emergency first.',
          variant: 'destructive',
        });
        dismissAlert(emergencyId);
        return;
      }

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const em = data.emergency;

      // Store real assignment for DriverNavigationPage
      setAssignment({
        emergencyId: em.id,
        status: em.status,
        severity: em.severity,
        city: em.city,
        description: em.description,
        latitude: em.latitude,
        longitude: em.longitude,
        assignedAt: em.assignedAt,
        patient: em.patient,
        timeline: em.timeline,
      });

      dismissAlert(emergencyId);

      toast({
        title: '✅ Emergency Accepted',
        description: `Navigating to ${em.patient?.name ?? 'patient'} in ${em.city}.`,
      });

      // Navigate to navigation page
      setCurrentPage('driver-navigation');
      router.push('/?page=driver-navigation');
    } catch (err) {
      console.error('Accept error:', err);
      toast({
        title: 'Accept Failed',
        description: 'Could not accept emergency. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAcceptingId(null);
    }
  }, [dismissAlert, setAssignment, setCurrentPage, router, toast]);

  const handleDecline = useCallback((emergencyId: string) => {
    dismissAlert(emergencyId);
  }, [dismissAlert]);

  /* Active assignment — check Zustand store (set on SOS accept) */
  const activeAssignment = useMemo(() => {
    return DEMO_EMERGENCIES.find(
      (e) => e.status === 'EN_ROUTE' || e.status === 'AMBULANCE_ASSIGNED' || e.status === 'ARRIVED'
    ) ?? null;
  }, []);

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
    <>
      <LocationOnboardingModal
        open={showLocationModal}
        initialData={driverInfo}
        onClose={() => setShowLocationModal(false)}
        onSuccess={(data) => {
          setDriverInfo(data);
          setShowLocationModal(false);
        }}
      />
      
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 p-4 md:p-6 pb-12">

        {/* ──── Real-time SOS Alert Cards from SSE stream ──── */}
        <AnimatePresence mode="sync">
        {pendingAlerts.map((alert) => (
          <SosAlertCard
            key={alert.emergencyId}
            alert={alert}
            onAccept={handleAccept}
            onDecline={handleDecline}
            countdownSeconds={30}
            isAccepting={acceptingId === alert.emergencyId}
          />
        ))}
      </AnimatePresence>

      {/* ──── Hero Header ──── */}
      <DashboardHero
        greeting="On Duty"
        name={driverName}
        subtitle={`${isOnline ? '🟢 Online · Ready for dispatch' : '🔴 Offline · Go online to accept emergencies'} · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}`}
        gradient="linear-gradient(135deg, #431407 0%, #c2410c 50%, #0f172a 100%)"
        accentColor="rgba(249,115,22,0.35)"
        icon={<Ambulance className="w-6 h-6 text-orange-300" />}
        badge="Ambulance Driver"
        stats={[
          { value: String(DRIVER_STATS.todayTrips), label: "Today's trips" },
          { value: `${DRIVER_STATS.totalDistance} km`, label: 'Distance covered' },
          { value: DRIVER_STATS.avgResponseTime, label: 'Avg response' },
          { value: String(DRIVER_STATS.rating), label: 'Rating ⭐' },
        ]}
      />

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
                      {driverInitials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{driverName}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Ambulance className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">DL-01-EM-0012</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        <Shield className="h-2.5 w-2.5 mr-1 text-emerald-500" />
                        Verified Driver
                      </Badge>
                      {driverInfo.pinCode && (
                        <div className="flex items-center text-xs text-muted-foreground ml-2">
                          📍 PIN: {driverInfo.pinCode} · {driverInfo.city} · {driverInfo.country}
                          <button 
                            onClick={() => setShowLocationModal(true)}
                            className="ml-2 text-emerald-500 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Right: Shift Status Toggle */}
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <Switch checked={isOnline} onCheckedChange={toggleStatus} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ──── 2. Stats Row ──── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
          <motion.div
            key={stat.label}
            whileHover={{
              scale: 1.05,
              rotateX: -4,
              rotateY: 4,
              z: 20,
              transition: { type: 'spring', stiffness: 400, damping: 20 },
            }}
            style={{ perspective: 800, transformStyle: 'preserve-3d' }}
          >
            <Card className="card-hover shadow-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                    {stat.icon}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {trendIcon(stat.trend)}
                    {stat.trend}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ──── Service Area Card ──── */}
      <motion.div variants={fadeUp}>
        <Card className="card-shine overflow-hidden">
          <CardContent className="p-0">
            <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600" />
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Service Area</h3>
                    <p className="text-[10px] text-muted-foreground">SOS alerts are matched to your service area</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setShowLocationModal(true)}
                >
                  <MapPin className="h-3 w-3" />
                  Update Area
                </Button>
              </div>

              {driverInfo.pinCode ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">PIN Code</p>
                    <p className="text-sm font-bold text-sky-500">{driverInfo.pinCode}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">City</p>
                    <p className="text-sm font-bold capitalize">{driverInfo.city}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Country</p>
                    <p className="text-sm font-bold capitalize">{driverInfo.country}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-amber-400">Service area not configured</p>
                  <p className="text-xs text-muted-foreground mt-1">Set your PIN code, city, and country to receive nearby SOS alerts.</p>
                  <Button
                    size="sm"
                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    onClick={() => setShowLocationModal(true)}
                  >
                    Set Up Now
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
    </>
  );
}
