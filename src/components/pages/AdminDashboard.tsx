'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Building2,
  Truck,
  Siren,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
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
  DEMO_AMBULANCES,
  DEMO_PATIENTS,
  DASHBOARD_STATS,
  SEVERITY_LABELS,
} from '@/lib/mock-data';
import { STATUS_COLORS } from '@/lib/constants';
import EmergencyRadar from '@/components/dashboard/EmergencyRadar';
import DashboardHero from '@/components/dashboard/DashboardHero';

// ──────────────────────────────────────────────
// Mock chart data
// ──────────────────────────────────────────────
const monthlyData = [
  { month: 'Jan', emergencies: 120, avgTime: 4.2 },
  { month: 'Feb', emergencies: 135, avgTime: 3.9 },
  { month: 'Mar', emergencies: 142, avgTime: 3.7 },
  { month: 'Apr', emergencies: 128, avgTime: 4.0 },
  { month: 'May', emergencies: 155, avgTime: 3.5 },
  { month: 'Jun', emergencies: 168, avgTime: 3.3 },
  { month: 'Jul', emergencies: 178, avgTime: 3.1 },
  { month: 'Aug', emergencies: 162, avgTime: 3.4 },
  { month: 'Sep', emergencies: 149, avgTime: 3.6 },
  { month: 'Oct', emergencies: 175, avgTime: 3.2 },
  { month: 'Nov', emergencies: 190, avgTime: 3.0 },
  { month: 'Dec', emergencies: 198, avgTime: 2.8 },
];

const regionData = [
  { city: 'Delhi', count: 42 },
  { city: 'Mumbai', count: 38 },
  { city: 'Bangalore', count: 31 },
  { city: 'Chennai', count: 27 },
  { city: 'Hyderabad', count: 24 },
  { city: 'Kolkata', count: 19 },
  { city: 'Pune', count: 16 },
  { city: 'Ahmedabad', count: 14 },
];

const performanceData = [
  { day: 'Mon', uptime: 99.8, responseTime: 3.2 },
  { day: 'Tue', uptime: 99.9, responseTime: 3.1 },
  { day: 'Wed', uptime: 99.7, responseTime: 3.5 },
  { day: 'Thu', uptime: 99.9, responseTime: 2.9 },
  { day: 'Fri', uptime: 99.8, responseTime: 3.3 },
  { day: 'Sat', uptime: 100, responseTime: 2.7 },
  { day: 'Sun', uptime: 99.9, responseTime: 3.0 },
];

const sparklineData = {
  emergencies: [35, 42, 38, 47, 39, 44, 47].map((v, i) => ({ v, i })),
  hospitals: [210, 215, 212, 218, 214, 216, 218].map((v, i) => ({ v, i })),
  ambulances: [140, 152, 148, 156, 150, 153, 156].map((v, i) => ({ v, i })),
  users: [11200, 11800, 11500, 12100, 11900, 12200, 12480].map((v, i) => ({ v, i })),
  responseTime: [4.5, 4.2, 4.0, 3.8, 3.9, 3.7, 3.8].map((v, i) => ({ v, i })),
  livesSaved: [48000, 49200, 50100, 50800, 51500, 52000, 52487].map((v, i) => ({ v, i })),
};

// Sparkline gradient ids keyed by color
const sparklineColors: Record<string, { stroke: string; fill: string; gradientId: string }> = {
  red: { stroke: '#ef4444', fill: 'url(#sparkRed)', gradientId: 'sparkRed' },
  emerald: { stroke: '#10b981', fill: 'url(#sparkEmerald)', gradientId: 'sparkEmerald' },
  sky: { stroke: '#0ea5e9', fill: 'url(#sparkSky)', gradientId: 'sparkSky' },
  violet: { stroke: '#8b5cf6', fill: 'url(#sparkViolet)', gradientId: 'sparkViolet' },
  amber: { stroke: '#f59e0b', fill: 'url(#sparkAmber)', gradientId: 'sparkAmber' },
  rose: { stroke: '#f43f5e', fill: 'url(#sparkRose)', gradientId: 'sparkRose' },
};

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
// Sparkline component
// ──────────────────────────────────────────────
function Sparkline({ data, colorKey }: { data: { v: number; i: number }[]; colorKey: string }) {
  const colors = sparklineColors[colorKey] ?? sparklineColors.emerald;
  return (
    <div className="w-full h-[30px] mt-1">
      <svg className="w-full h-full" viewBox="0 0 80 30" preserveAspectRatio="none">
        <defs>
          <linearGradient id={colors.gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={colors.stroke} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={colors.stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data
            .map((d, idx) => {
              const x = (idx / (data.length - 1)) * 78 + 1;
              const min = Math.min(...data.map((dd) => dd.v));
              const max = Math.max(...data.map((dd) => dd.v));
              const range = max - min || 1;
              const y = 28 - ((d.v - min) / range) * 24;
              return `${x},${y}`;
            })
            .join(' ')}
        />
        <polygon
          fill={colors.fill}
          points={`1,28 ${data
            .map((d, idx) => {
              const x = (idx / (data.length - 1)) * 78 + 1;
              const min = Math.min(...data.map((dd) => dd.v));
              const max = Math.max(...data.map((dd) => dd.v));
              const range = max - min || 1;
              const y = 28 - ((d.v - min) / range) * 24;
              return `${x},${y}`;
            })
            .join(' ')} 79,28`}
        />
      </svg>
    </div>
  );
}

// ──────────────────────────────────────────────
// Helper: find patient name by id
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
// Custom tooltip
// ──────────────────────────────────────────────
function CustomTooltipLine({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'Avg Response (min)' ? `${entry.value}m` : entry.value}
        </p>
      ))}
    </div>
  );
}

function CustomTooltipBar({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; payload: any }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold">{payload[0].payload.city}</p>
      <p className="text-xs" style={{ color: payload[0].color }}>
        Emergencies: {payload[0].value}
      </p>
    </div>
  );
}

function CustomTooltipArea({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export default function AdminDashboard() {
  const activeEmergencies = DEMO_EMERGENCIES.filter(
    (e) => !['COMPLETED', 'CANCELLED'].includes(e.status)
  );
  const availableAmbulances = DEMO_AMBULANCES.filter((a) => a.status === 'AVAILABLE').length;

  const overviewCards = [
    { icon: Siren, label: 'Active Emergencies', value: activeEmergencies.length, color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400', sparkKey: 'emergencies', sparkColor: 'red' },
    { icon: Building2, label: 'Hospitals Online', value: DASHBOARD_STATS.hospitalsOnline, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', sparkKey: 'hospitals', sparkColor: 'emerald' },
    { icon: Truck, label: 'Ambulances Available', value: availableAmbulances, color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400', sparkKey: 'ambulances', sparkColor: 'sky' },
    { icon: Users, label: 'Total Users', value: 12480, color: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400', sparkKey: 'users', sparkColor: 'violet' },
    { icon: Clock, label: 'Avg Response Time', value: `${DASHBOARD_STATS.avgResponseTime}m`, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', sparkKey: 'responseTime', sparkColor: 'amber' },
    { icon: TrendingUp, label: 'Lives Saved', value: DASHBOARD_STATS.totalLivesSaved.toLocaleString(), color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400', sparkKey: 'livesSaved', sparkColor: 'rose' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Hero Header */}
      <DashboardHero
        greeting="System Command Center"
        name="Admin Dashboard"
        subtitle="Network-wide overview · Real-time emergency coordination"
        gradient="linear-gradient(135deg, #2e1065 0%, #3730a3 50%, #0f172a 100%)"
        accentColor="rgba(139,92,246,0.3)"
        icon={<BarChart3 className="w-6 h-6 text-violet-300" />}
        badge="Administrator"
        stats={[
          { value: String(DASHBOARD_STATS.activeEmergencies), label: 'Active emergencies' },
          { value: String(DASHBOARD_STATS.hospitalsOnline), label: 'Hospitals online' },
          { value: String(DASHBOARD_STATS.ambulancesOnline), label: 'Ambulances active' },
          { value: `${DASHBOARD_STATS.avgResponseTime} min`, label: 'Avg response' },
        ]}
      />

      {/* Stat Cards with Sparklines */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewCards.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            whileHover={{
              scale: 1.04,
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
                  <div className={`p-2 rounded-lg shrink-0 ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-lg font-bold leading-tight">{card.value}</p>
                  </div>
                </div>
                <Sparkline data={sparklineData[card.sparkKey as keyof typeof sparklineData]} colorKey={card.sparkColor} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row 1: Line Chart + Bar Chart */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Response Trends */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Emergency Response Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[2, 5]} className="text-muted-foreground" />
                    <Tooltip content={<CustomTooltipLine />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="emergencies"
                      name="Emergencies"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#10b981' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgTime"
                      name="Avg Response (min)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#f59e0b' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergencies by Region */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Emergencies by Region
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis
                      type="category"
                      dataKey="city"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      width={70}
                    />
                    <Tooltip content={<CustomTooltipBar />} />
                    <Bar
                      dataKey="count"
                      name="Emergencies"
                      fill="#10b981"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Row 2: Area Chart */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="respTimeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis domain={[95, 101]} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip content={<CustomTooltipArea />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area
                      type="monotone"
                      dataKey="uptime"
                      name="Uptime %"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#uptimeGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Time mini chart */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Response Time (This Week)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis domain={[2, 4]} tick={{ fontSize: 11 }} className="text-muted-foreground" unit="m" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                            <p className="font-semibold">{label}</p>
                            <p className="text-xs" style={{ color: '#f59e0b' }}>
                              Response: {payload[0].value}m
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="responseTime"
                      name="Response Time (min)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#rtGrad)"
                      dot={{ r: 3, fill: '#f59e0b' }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Active Emergencies Table */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Active Emergencies
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeEmergencies.length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {activeEmergencies.map((em) => {
                const patientName = getPatientName(em.patientId);
                const severityInfo = SEVERITY_LABELS[em.severity];
                return (
                  <div key={em.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-1 h-10 rounded-full shrink-0 ${
                          em.severity >= 4
                            ? 'bg-red-500'
                            : em.severity >= 3
                            ? 'bg-orange-500'
                            : 'bg-yellow-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold font-mono">{em.id}</p>
                          <SeverityBadge severity={em.severity} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="font-medium text-foreground/80">{patientName}</span>
                          {' · '}
                          {em.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-xs shrink-0 ml-2 ${STATUS_COLORS[em.status] || ''}`}>
                      {em.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                );
              })}
              {activeEmergencies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No active emergencies</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emergency Radar */}
      <motion.div variants={fadeUp}>
        <EmergencyRadar />
      </motion.div>
    </motion.div>
  );
}
