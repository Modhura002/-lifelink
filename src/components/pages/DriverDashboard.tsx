'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Route,
  Star,
  Clock,
  MapPin,
  User,
  Building2,
  Navigation,
  CheckCircle2,
  Truck,
  Phone,
  Siren,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { SEVERITY_LABELS, DEMO_PATIENTS, DEMO_HOSPITALS } from '@/lib/mock-data';
import { STATUS_COLORS, getRelativeTime } from '@/lib/constants';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface TripHistory {
  id: string;
  patient: string;
  pickup: string;
  hospital: string;
  distance: string;
  duration: string;
  status: string;
  completedAt: string;
}

const MOCK_TRIP_HISTORY: TripHistory[] = [
  { id: 'TR-001', patient: 'A. M.', pickup: 'Hauz Khas, Delhi', hospital: 'AIIMS', distance: '12 km', duration: '28 min', status: 'COMPLETED', completedAt: '2024-12-15T12:30:00Z' },
  { id: 'TR-002', patient: 'S. R.', pickup: 'Jubilee Hills, Hyderabad', hospital: 'Apollo Chennai', distance: '8 km', duration: '18 min', status: 'COMPLETED', completedAt: '2024-12-15T11:00:00Z' },
  { id: 'TR-003', patient: 'V. S.', pickup: 'CG Road, Ahmedabad', hospital: 'Fortis Gurugram', distance: '22 km', duration: '42 min', status: 'COMPLETED', completedAt: '2024-12-15T09:15:00Z' },
  { id: 'TR-004', patient: 'K. D.', pickup: 'Sector 44, Gurugram', hospital: 'Medanta', distance: '5 km', duration: '12 min', status: 'COMPLETED', completedAt: '2024-12-14T18:30:00Z' },
  { id: 'TR-005', patient: 'P. J.', pickup: 'Dwarka, Delhi', hospital: 'AIIMS', distance: '18 km', duration: '35 min', status: 'CANCELLED', completedAt: '2024-12-14T16:00:00Z' },
];

type AssignmentStep = 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'TRANSPORTING';

export default function DriverDashboard() {
  const [currentStep, setCurrentStep] = useState<AssignmentStep>('EN_ROUTE');

  const todaysStats = useMemo(
    () => [
      { icon: ClipboardCheck, label: 'Completed Trips', value: '4', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
      { icon: Route, label: 'Total Distance', value: '87 km', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400' },
      { icon: Star, label: 'Rating', value: '4.8', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
      { icon: Clock, label: 'Hours on Duty', value: '6.5', color: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400' },
    ],
    [],
  );

  // Current assignment data
  const currentAssignment = useMemo(() => ({
    patient: 'A. M.',
    severity: 4,
    description: 'Chest pain and difficulty breathing',
    pickup: '42, Hauz Khas, New Delhi - 110016',
    hospital: 'AIIMS New Delhi',
    eta: '12 min',
    distance: '3.2 km',
    emergencyId: 'ER-A3F2K1',
  }), []);

  const steps: { key: AssignmentStep; label: string; icon: typeof CheckCircle2 }[] = [
    { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
    { key: 'EN_ROUTE', label: 'En Route', icon: Navigation },
    { key: 'ARRIVED', label: 'Arrived', icon: MapPin },
    { key: 'TRANSPORTING', label: 'Transporting', icon: Truck },
  ];

  const stepOrder: AssignmentStep[] = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'TRANSPORTING'];
  const currentStepIdx = stepOrder.indexOf(currentStep);

  const sev = SEVERITY_LABELS[currentAssignment.severity] || SEVERITY_LABELS[1];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 min-w-0">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">My Assignments</h1>
        <p className="text-muted-foreground mt-1 break-words">Welcome back, Rajesh</p>
      </motion.div>

      {/* Current Assignment */}
      <motion.div variants={fadeUp}>
        <Card className="border-l-4 border-l-emerald-500 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Siren className="h-5 w-5 text-red-500" />
              Current Assignment
              <Badge variant="secondary" className={`${sev.bgColor} ${sev.color} border-0 text-[10px] font-bold`}>
                SEV {currentAssignment.severity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-5">
            {/* Patient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{currentAssignment.patient}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentAssignment.description}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{currentAssignment.emergencyId}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pickup</p>
                    <p className="text-xs font-medium">{currentAssignment.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <Building2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hospital</p>
                    <p className="text-xs font-medium">{currentAssignment.hospital}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ETA & Distance */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">ETA</p>
                  <p className="text-lg font-bold">{currentAssignment.eta}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-sky-500" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Distance</p>
                  <p className="text-lg font-bold">{currentAssignment.distance}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isCurrent ? 1.15 : 1,
                          backgroundColor: isCompleted || isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                        }}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </motion.div>
                      <p className={`text-[10px] mt-1 font-medium ${isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* Progress bar behind steps */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-0 mx-8">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {currentStep === 'EN_ROUTE' && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  onClick={() => setCurrentStep('ARRIVED')}
                >
                  <MapPin className="h-4 w-4" /> Mark Arrived
                </Button>
              )}
              {currentStep === 'ARRIVED' && (
                <Button
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-700 text-white gap-1"
                  onClick={() => setCurrentStep('TRANSPORTING')}
                >
                  <Truck className="h-4 w-4" /> Start Transport
                </Button>
              )}
              {currentStep === 'TRANSPORTING' && (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white gap-1"
                  onClick={() => setCurrentStep('ACCEPTED')}
                >
                  <CheckCircle2 className="h-4 w-4" /> Complete
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1 text-red-500">
                <Phone className="h-4 w-4" /> Call Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {todaysStats.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card className="card-hover overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${stat.color}`}>
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold truncate">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground break-words line-clamp-2">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Trip History */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Recent Trips
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden sm:table-cell">From</TableHead>
                    <TableHead className="hidden md:table-cell">Hospital</TableHead>
                    <TableHead className="hidden lg:table-cell">Distance</TableHead>
                    <TableHead className="hidden lg:table-cell">Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_TRIP_HISTORY.map((trip) => (
                    <TableRow key={trip.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-4 font-mono text-sm font-medium">{trip.id}</TableCell>
                      <TableCell className="text-sm font-medium">{trip.patient}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground max-w-[150px] truncate">{trip.pickup}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{trip.hospital}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{trip.distance}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{trip.duration}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${STATUS_COLORS[trip.status] || ''} border-0 text-xs font-medium`}
                        >
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-4 text-sm text-muted-foreground">{getRelativeTime(trip.completedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
