'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Phone,
  User,
  Building2,
  MapPin,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  CheckCircle2,
  AlertTriangle,
  Crosshair,
  Droplets,
  Heart,
  Activity,
  Star,
  PhoneCall,
  Flag,
  Waypoints,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { SEVERITY_LABELS, DEMO_PATIENTS, DEMO_HOSPITALS } from '@/lib/mock-data';
import { BLOOD_GROUP_LABELS } from '@/lib/constants';
import { useNavigationStore, useEmergencyStore, useDriverAssignmentStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import MapWrapper from '@/components/ui/MapWrapper';
import { useRouter } from 'next/navigation';

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

/* ──────────────────────────────────────────────
   Direction icon component
   ────────────────────────────────────────────── */
function DirectionIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'right':
      return <ChevronRight className={className} />;
    case 'left':
      return <ChevronLeft className={className} />;
    case 'straight':
      return <ArrowUp className={className} />;
    case 'arrive':
      return <Flag className={className} />;
    default:
      return <ArrowDown className={className} />;
  }
}

/* ──────────────────────────────────────────────
   Turn-by-turn directions (mock)
   ────────────────────────────────────────────── */
const TURN_DIRECTIONS = [
  { instruction: 'Head north on Hauz Khas Enclave', distance: '0.3 km', icon: 'straight' as const, street: 'Hauz Khas Enclave' },
  { instruction: 'Turn right onto Aurobindo Marg', distance: '1.2 km', icon: 'right' as const, street: 'Aurobindo Marg' },
  { instruction: 'Continue onto Sri Aurobindo Marg', distance: '0.8 km', icon: 'straight' as const, street: 'Sri Aurobindo Marg' },
  { instruction: 'Turn left onto Ring Road', distance: '2.1 km', icon: 'left' as const, street: 'Ring Road' },
  { instruction: 'Take the exit toward AIIMS', distance: '0.5 km', icon: 'right' as const, street: 'AIIMS Exit' },
  { instruction: 'Turn right onto Ansari Nagar East', distance: '0.3 km', icon: 'right' as const, street: 'Ansari Nagar East' },
  { instruction: 'Arrive at AIIMS New Delhi — Emergency Wing', distance: '', icon: 'arrive' as const, street: 'AIIMS Emergency' },
];

/* ──────────────────────────────────────────────
   SVG Route points for ambulance animation
   ────────────────────────────────────────────── */
const ROUTE_POINTS = [
  { x: 120, y: 380 },
  { x: 170, y: 330 },
  { x: 230, y: 290 },
  { x: 310, y: 250 },
  { x: 400, y: 210 },
  { x: 480, y: 175 },
  { x: 550, y: 150 },
  { x: 620, y: 125 },
  { x: 670, y: 108 },
];

const ROUTE_COORDS: [number, number][] = [
  [28.5447, 77.2065],
  [28.5467, 77.2065],
  [28.5497, 77.2085],
  [28.5527, 77.2095],
  [28.5567, 77.2105],
  [28.5607, 77.2125],
  [28.5637, 77.2135],
  [28.5657, 77.2145],
  [28.5677, 77.2165],
];

/* ──────────────────────────────────────────────
   Driver Navigation Page
   ────────────────────────────────────────────── */
export default function DriverNavigationPage() {
  const [activeDirection, setActiveDirection] = useState(2);
  const [progress, setProgress] = useState(38);
  const [speed, setSpeed] = useState(42);
  const [etaMinutes, setEtaMinutes] = useState(12);
  const [ambulancePosition, setAmbulancePosition] = useState(3); // index along ROUTE_POINTS

  const setCurrentPage = useNavigationStore((s) => s.setCurrentPage);
  const { markArrived, completeEmergency } = useEmergencyStore();
  const { assignment: realAssignment, clearAssignment } = useDriverAssignmentStore();
  const { toast } = useToast();
  const [completing, setCompleting] = useState(false);
  const router = useRouter();

  const handleCompleteTrip = async () => {
    if (!realAssignment?.emergencyId) {
      // Demo mode fallback
      completeEmergency();
      clearAssignment();
      setCurrentPage('driver-dashboard');
      router.push('/?page=driver-dashboard');
      return;
    }

    setCompleting(true);
    try {
      const res = await fetch('/api/driver/complete-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyId: realAssignment.emergencyId }),
      });

      if (!res.ok) throw new Error('Failed to complete emergency');

      completeEmergency();
      clearAssignment();
      setCurrentPage('driver-dashboard');
      router.push('/?page=driver-dashboard');
      toast({ title: 'Trip Completed', description: 'Emergency resolved successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to complete trip.', variant: 'destructive' });
    } finally {
      setCompleting(false);
    }
  };

  /* Assignment data — prefer real data from SSE accept, fall back to demo */
  const assignment = useMemo(() => {
    if (realAssignment) {
      const patient = {
        name: realAssignment.patient.name ?? 'Unknown Patient',
        bloodGroup: realAssignment.patient.patientProfile?.bloodGroup ?? 'O_POS',
        id: realAssignment.patient.id,
        phone: realAssignment.patient.phone,
      };
      const demoHosp = DEMO_HOSPITALS[0];
      return {
        patient,
        hospital: demoHosp,
        severity: realAssignment.severity,
        pickup: `${realAssignment.city} (${realAssignment.latitude.toFixed(3)}, ${realAssignment.longitude.toFixed(3)})`,
        eta: '~8 min',
        distance: '~3 km',
        emergencyId: realAssignment.emergencyId,
      };
    }
    // Demo fallback
    return {
      patient: DEMO_PATIENTS.find((p) => p.id === 'usr-patient-1') ?? DEMO_PATIENTS[0],
      hospital: DEMO_HOSPITALS.find((h) => h.id === 'hosp-3') ?? DEMO_HOSPITALS[0],
      severity: 4,
      pickup: '42, Hauz Khas, New Delhi',
      eta: '12 min',
      distance: '3.2 km',
      emergencyId: 'ER-A3F2K1',
    };
  }, [realAssignment]);

  const sev = SEVERITY_LABELS[assignment.severity] || SEVERITY_LABELS[1];
  const bloodLabel = BLOOD_GROUP_LABELS[assignment.patient.bloodGroup ?? 'O_POS'];

  /* Simulate progress and speed changes */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 1.2;
        return next >= 100 ? 100 : next;
      });
      setSpeed((prev) => {
        const delta = (Math.random() - 0.45) * 8;
        return Math.max(15, Math.min(65, prev + delta));
      });
      setEtaMinutes((prev) => Math.max(1, prev - 0.15));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* Advance ambulance along route */
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulancePosition((prev) => {
        if (prev >= ROUTE_POINTS.length - 1) return prev;
        return prev + 1;
      });
      setActiveDirection((prev) => (prev < TURN_DIRECTIONS.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  /* Smooth ambulance position interpolation */
  const ambulancePos = useMemo(() => {
    const idx = Math.min(ambulancePosition, ROUTE_POINTS.length - 1);
    return ROUTE_POINTS[idx];
  }, [ambulancePosition]);

  const ambulanceGeoPos = useMemo(() => {
    const idx = Math.min(ambulancePosition, ROUTE_COORDS.length - 1);
    return ROUTE_COORDS[idx];
  }, [ambulancePosition]);

  /* Current turn */
  const currentTurn = TURN_DIRECTIONS[activeDirection];

  /* Next 3 upcoming turns */
  const upcomingTurns = TURN_DIRECTIONS.slice(activeDirection + 1, activeDirection + 4);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4 p-4 md:p-6 pb-12">
      {/* ──── Page Title ──── */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Navigation</h1>
        <p className="text-muted-foreground mt-1">Active route to hospital</p>
      </motion.div>

      {/* ──── 1. Route Progress Bar ──── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waypoints className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold">Route Progress</span>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-400" />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>📍 Hauz Khas Enclave</span>
              <span>AIIMS Emergency Wing 🏥</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ──── Main Navigation Area ──── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ──── Map Area with Animated Route ──── */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 h-[400px] md:h-[500px] overflow-hidden">
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* ──── 9. Animated Route Visualization (Leaflet) ──── */}
                <div className="absolute inset-0 w-full h-full z-0">
                  <MapWrapper
                    center={ambulanceGeoPos}
                    zoom={14}
                    route={ROUTE_COORDS}
                    markers={[
                      { id: 'patient', position: ROUTE_COORDS[0], type: 'patient', label: 'Patient' },
                      { id: 'hospital', position: ROUTE_COORDS[ROUTE_COORDS.length - 1], type: 'hospital', label: 'Hospital' },
                      { id: 'ambulance', position: ambulanceGeoPos, type: 'ambulance', label: 'Ambulance' }
                    ]}
                  />
                </div>

                {/* ──── Top overlay: Patient info ──── */}
                <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 pointer-events-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-red-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-semibold">{assignment.patient.name}</p>
                            <Badge className={`${sev.bgColor} ${sev.color} border-0 text-[9px] font-bold px-1.5`}>
                              SEV {assignment.severity}
                            </Badge>
                          </div>
                          <p className="text-white/60 text-[10px] font-mono">{assignment.emergencyId}</p>
                        </div>
                      </div>
                      {/* ──── 2. ETA and Distance Display ──── */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <motion.p
                            key={etaMinutes.toFixed(1)}
                            className="text-emerald-400 text-lg font-bold"
                            initial={{ scale: 1.1, color: '#4ade80' }}
                            animate={{ scale: 1, color: '#4ade80' }}
                            transition={{ duration: 0.4 }}
                          >
                            {Math.round(etaMinutes)} min
                          </motion.p>
                          <p className="text-white/50 text-[10px]">ETA</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sky-400 text-lg font-bold">{assignment.distance}</p>
                          <p className="text-white/50 text-[10px]">Remaining</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ──── Speed Indicator overlay (bottom-left) ──── */}
                <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                  {/* ──── 8. Speed Indicator with Gauge ──── */}
                  <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 w-[120px] pointer-events-auto">
                    <div className="flex items-center justify-center">
                      <svg viewBox="0 0 100 60" className="w-full">
                        {/* Gauge arc background */}
                        <path
                          d="M 10 55 A 40 40 0 0 1 90 55"
                          fill="none"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        {/* Gauge arc fill */}
                        <path
                          d="M 10 55 A 40 40 0 0 1 90 55"
                          fill="none"
                          stroke="url(#speedGradient)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray="126"
                          strokeDashoffset={126 - (speed / 60) * 126}
                        />
                        <defs>
                          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                        {/* Speed text */}
                        <text x="50" y="48" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                          {Math.round(speed)}
                        </text>
                        <text x="50" y="58" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
                          km/h
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ──── 7. Action Buttons overlay (bottom-right) ──── */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10 pointer-events-none">
                  <Button
                    onClick={() => toast({ title: 'Emergency Services Alerted', description: 'Additional support is on the way.' })}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2 h-12 rounded-full px-5 shadow-lg shadow-red-500/30 text-xs pointer-events-auto"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Emergency
                  </Button>
                  <Button
                    onClick={handleCompleteTrip}
                    disabled={completing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-12 rounded-full px-5 shadow-lg shadow-emerald-500/30 text-xs pointer-events-auto"
                  >
                    {completing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Complete Trip
                  </Button>
                </div>

                {/* Compass indicator */}
                <div className="absolute top-24 right-3 z-10 pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2 border border-white/10 pointer-events-auto">
                    <Crosshair className="h-5 w-5 text-white/70" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ──── Right Panel ──── */}
        <div className="space-y-4">
          {/* ──── 3. Current Turn Instruction ──── */}
          <motion.div variants={fadeUp}>
            <Card className="card-shine overflow-hidden border-l-4 border-l-sky-500">
              <CardContent className="p-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Direction</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDirection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-12 w-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                      <DirectionIcon
                        type={currentTurn?.icon ?? 'straight'}
                        className="h-6 w-6 text-sky-600 dark:text-sky-400"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-tight">{currentTurn?.instruction}</p>
                      {currentTurn?.distance && (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">{currentTurn.distance}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* ──── 4. Next 3 Upcoming Turns ──── */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Upcoming Turns</h3>
                </div>
                {upcomingTurns.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingTurns.map((turn, idx) => (
                      <motion.div
                        key={activeDirection + 1 + idx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <DirectionIcon type={turn.icon} className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{turn.instruction}</p>
                          {turn.distance && (
                            <p className="text-[10px] text-muted-foreground">{turn.distance}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[9px] text-muted-foreground shrink-0">
                          {idx === 0 ? 'Next' : `${idx + 1}`}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">No more turns — arriving soon!</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ──── 5. Patient Info Card ──── */}
          <motion.div variants={fadeUp}>
            <Card className="card-hover">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-red-500" />
                  <CardTitle className="text-sm">Patient Info</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${sev.bgColor}`}>
                    {assignment.patient.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{assignment.patient.name}</p>
                    <Badge className={`${sev.bgColor} ${sev.color} border-0 text-[9px] font-bold px-1.5 mt-0.5`}>
                      {sev.label} — SEV {assignment.severity}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Droplets className="h-3.5 w-3.5 text-red-500 mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{bloodLabel}</p>
                    <p className="text-[9px] text-muted-foreground">Blood</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Heart className="h-3.5 w-3.5 text-red-500 mx-auto mb-0.5" />
                    <p className="text-xs font-bold">Chest Pain</p>
                    <p className="text-[9px] text-muted-foreground">Condition</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Activity className="h-3.5 w-3.5 text-amber-500 mx-auto mb-0.5" />
                    <p className="text-xs font-bold">Critical</p>
                    <p className="text-[9px] text-muted-foreground">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ──── 6. Hospital Info Card ──── */}
          <motion.div variants={fadeUp}>
            <Card className="card-hover">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-sm">Destination Hospital</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div>
                  <p className="text-sm font-semibold">{assignment.hospital.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{assignment.hospital.address}, {assignment.hospital.city}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${s <= Math.round(assignment.hospital.emergencyRating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">{assignment.hospital.emergencyRating}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{assignment.hospital.phone}</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 h-7 text-[10px]" onClick={() => toast({ title: 'Calling Hospital', description: 'Connecting to emergency ward...' })}>
                    <PhoneCall className="h-3 w-3 text-emerald-500" />
                    Call Hospital
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Emergency Beds</span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">
                    {assignment.hospital.availableBeds} available
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick call buttons */}
          <motion.div variants={fadeUp}>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-2 h-10 text-xs" onClick={() => toast({ title: 'Calling Patient', description: 'Connecting...' })}>
                <Phone className="h-3.5 w-3.5" /> Call Patient
              </Button>
              <Button variant="outline" className="gap-2 h-10 text-xs" onClick={() => markArrived()}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Mark Arrived
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
