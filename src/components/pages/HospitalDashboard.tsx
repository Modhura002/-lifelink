'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BedDouble,
  UserPlus,
  Activity,
  Clock,
  TrendingDown,
  ScanLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DEMO_EMERGENCIES,
  DEMO_HOSPITALS,
  DEMO_PATIENTS,
  MOCK_BEDS,
  SEVERITY_LABELS,
} from '@/lib/mock-data';
import { STATUS_COLORS } from '@/lib/constants';
import DashboardHero from '@/components/dashboard/DashboardHero';
import { useNavigationStore } from '@/store';

// ──────────────────────────────────────────────
// Animation variants
// ──────────────────────────────────────────────
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ──────────────────────────────────────────────
// Helper: get patient name
// ──────────────────────────────────────────────
function getPatientName(patientId?: string) {
  if (!patientId) return 'Unknown';
  const patient = DEMO_PATIENTS.find((p) => p.id === patientId);
  return patient?.name ?? 'Unknown';
}

// ──────────────────────────────────────────────
// Severity badge helper
// ──────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: number }) {
  const info = SEVERITY_LABELS[severity];
  if (!info) return null;
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${info.bgColor} ${info.color}`}>
      {info.label}
    </span>
  );
}

// ──────────────────────────────────────────────
// Circular Progress Indicator (pure SVG)
// ──────────────────────────────────────────────
function CircularProgress({ percentage, size = 100, strokeWidth = 8, color = '#10b981' }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{percentage}%</span>
        <span className="text-[10px] text-muted-foreground -mt-0.5">Occupancy</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Pulse dot for live indicator
// ──────────────────────────────────────────────
function LivePulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  );
}

// ──────────────────────────────────────────────
// Donut chart colors
// ──────────────────────────────────────────────
const DONUT_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const BED_TYPE_COLORS: Record<string, string> = {
  ICU: '#ef4444',
  EMERGENCY: '#f59e0b',
  GENERAL: '#10b981',
  PEDIATRIC: '#8b5cf6',
};

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export default function HospitalDashboard() {
  const { setCurrentPage } = useNavigationStore();
  const hospital = DEMO_HOSPITALS[2]; // AIIMS
  const pendingEmergencies = DEMO_EMERGENCIES.filter(
    (e) => e.hospitalId === hospital.id && !['COMPLETED', 'CANCELLED'].includes(e.status)
  );

  const bedStats = {
    total: MOCK_BEDS.length,
    available: MOCK_BEDS.filter((b) => b.status === 'AVAILABLE').length,
    occupied: MOCK_BEDS.filter((b) => b.status === 'OCCUPIED').length,
    reserved: MOCK_BEDS.filter((b) => b.status === 'RESERVED').length,
  };

  const occupancyRate = Math.round(((bedStats.occupied + bedStats.reserved) / bedStats.total) * 100);

  // Donut data
  const donutData = [
    { name: 'Available', value: bedStats.available },
    { name: 'Occupied', value: bedStats.occupied },
    { name: 'Reserved', value: bedStats.reserved },
  ];

  // Bed type breakdown
  const bedTypes = ['ICU', 'EMERGENCY', 'GENERAL', 'PEDIATRIC'] as const;
  const bedTypeData = bedTypes.map((type) => ({
    type,
    total: MOCK_BEDS.filter((b) => b.type === type).length,
    occupied: MOCK_BEDS.filter((b) => b.type === type && b.status === 'OCCUPIED').length,
    available: MOCK_BEDS.filter((b) => b.type === type && b.status === 'AVAILABLE').length,
    reserved: MOCK_BEDS.filter((b) => b.type === type && b.status === 'RESERVED').length,
  }));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Hero Header */}
      <DashboardHero
        greeting="Hospital Operations"
        name={hospital.name}
        subtitle={`Emergency queue · ${pendingEmergencies.length} active incoming · ${bedStats.available} beds available`}
        gradient="linear-gradient(135deg, #0c4a6e 0%, #075985 40%, #0f172a 100%)"
        accentColor="rgba(14,165,233,0.3)"
        icon={<AlertTriangle className="w-6 h-6 text-sky-300" />}
        badge="Hospital Staff"
        stats={[
          { value: String(pendingEmergencies.length), label: 'Active emergencies' },
          { value: String(bedStats.available), label: 'Available beds' },
          { value: `${occupancyRate}%`, label: 'Occupancy rate' },
          { value: '12 min', label: 'Avg wait time' },
        ]}
      />

      {/* Stat Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BedDouble, label: 'Available Beds', value: bedStats.available, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
          { icon: Activity, label: 'Occupied', value: bedStats.occupied, color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
          { icon: TrendingDown, label: 'Reserved', value: bedStats.reserved, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
          { icon: Clock, label: 'Avg Wait Time', value: '12m', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
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
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row: Donut + Circular Progress */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bed Occupancy Donut */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-primary" />
                Bed Occupancy Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={DONUT_COLORS[idx]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                              <p style={{ color: payload[0].payload.fill || DONUT_COLORS[payload[0].name === 'Available' ? 0 : payload[0].name === 'Occupied' ? 1 : 2] }}>
                                {payload[0].name}: {payload[0].value} beds
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5">
                  {donutData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: DONUT_COLORS[idx] }}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                        <p className="text-sm font-semibold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 border-t mt-1">
                    <p className="text-xs text-muted-foreground">Total Beds</p>
                    <p className="text-sm font-bold">{bedStats.total}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Occupancy Rate + Bed Type Bar Chart */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Occupancy Rate &amp; Bed Types
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Circular progress */}
                <div className="shrink-0">
                  <CircularProgress
                    percentage={occupancyRate}
                    size={110}
                    strokeWidth={10}
                    color={occupancyRate > 80 ? '#ef4444' : occupancyRate > 60 ? '#f59e0b' : '#10b981'}
                  />
                </div>
                {/* Bed type bar chart */}
                <div className="flex-1 w-full min-w-0">
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bedTypeData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis dataKey="type" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                                {payload.map((entry) => (
                                  <p key={entry.name} style={{ color: entry.color }}>
                                    {entry.name}: {entry.value}
                                  </p>
                                ))}
                              </div>
                            );
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 10 }} iconType="square" iconSize={8} />
                        <Bar dataKey="occupied" name="Occupied" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={20} />
                        <Bar dataKey="reserved" name="Reserved" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={20} />
                        <Bar dataKey="available" name="Available" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Incoming Emergencies */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="inline-flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Incoming Emergencies
                {pendingEmergencies.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
                    <LivePulse />
                    Live
                  </span>
                )}
              </span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {pendingEmergencies.length} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {pendingEmergencies.length > 0 ? (
                pendingEmergencies.map((em) => {
                  const patientName = getPatientName(em.patientId);
                  const severityInfo = SEVERITY_LABELS[em.severity];
                  const severityColor =
                    em.severity >= 4
                      ? 'bg-red-500'
                      : em.severity >= 3
                      ? 'bg-orange-500'
                      : 'bg-yellow-500';

                  return (
                    <div key={em.id} className="p-3 rounded-lg border hover:bg-muted/40 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Severity color bar */}
                          <div
                            className={`w-1 h-12 rounded-full shrink-0 mt-0.5 ${severityColor}`}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold font-mono">{em.id}</p>
                              <SeverityBadge severity={em.severity} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <span className="font-medium text-foreground/80">{patientName}</span>
                              {' · '}
                              {em.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <Badge className={`text-xs ${STATUS_COLORS[em.status] || ''}`}>
                            {em.status.replace(/_/g, ' ')}
                          </Badge>
                          {severityInfo && (
                            <span className={`text-[10px] ${severityInfo.color}`}>
                              {severityInfo.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BedDouble className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No incoming emergencies</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">All clear for now</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating Scanner Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 shadow-2xl flex items-center justify-center bg-primary hover:bg-primary/90 hover:scale-105 transition-all"
          onClick={() => setCurrentPage('hospital-scanner')}
        >
          <ScanLine className="h-7 w-7 text-white" />
        </Button>
      </div>
    </motion.div>
  );
}
