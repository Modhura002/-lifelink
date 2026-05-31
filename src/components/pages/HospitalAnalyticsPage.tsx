'use client';

import { motion } from 'framer-motion';
import {
  BarChart2,
  Users,
  Ambulance,
  CalendarClock,
  BedDouble,
  Star,
  HeartPulse,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ── Animation variants ──────────────────────────────────────────────────────
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ── Chart data ──────────────────────────────────────────────────────────────
const DAILY_ADMISSIONS = [
  { day: 'May 14', emergency: 28, planned: 41 },
  { day: 'May 15', emergency: 34, planned: 38 },
  { day: 'May 16', emergency: 22, planned: 45 },
  { day: 'May 17', emergency: 30, planned: 42 },
  { day: 'May 18', emergency: 19, planned: 50 },
  { day: 'May 19', emergency: 15, planned: 33 },
  { day: 'May 20', emergency: 12, planned: 29 },
  { day: 'May 21', emergency: 33, planned: 44 },
  { day: 'May 22', emergency: 38, planned: 47 },
  { day: 'May 23', emergency: 27, planned: 40 },
  { day: 'May 24', emergency: 31, planned: 43 },
  { day: 'May 25', emergency: 25, planned: 39 },
  { day: 'May 26', emergency: 36, planned: 46 },
  { day: 'May 27', emergency: 23, planned: 41 },
];

const DEPT_VOLUME = [
  { dept: 'Emergency',  patients: 423 },
  { dept: 'Cardiology', patients: 187 },
  { dept: 'Neurology',  patients: 143 },
  { dept: 'Ortho',      patients: 98  },
  { dept: 'Pediatrics', patients: 76  },
];

const RESPONSE_TIME = [
  { month: 'Jun',  minutes: 18 },
  { month: 'Jul',  minutes: 17 },
  { month: 'Aug',  minutes: 16.5 },
  { month: 'Sep',  minutes: 16 },
  { month: 'Oct',  minutes: 15.2 },
  { month: 'Nov',  minutes: 14.8 },
  { month: 'Dec',  minutes: 14 },
  { month: 'Jan',  minutes: 13.5 },
  { month: 'Feb',  minutes: 13 },
  { month: 'Mar',  minutes: 12.4 },
  { month: 'Apr',  minutes: 11.8 },
  { month: 'May',  minutes: 11 },
];

// ── KPI definitions ─────────────────────────────────────────────────────────
interface KPI {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: React.ElementType;
  color: string;
  border: string;
}

const KPIS: KPI[] = [
  {
    label: 'Total Patients',
    value: '1,847',
    delta: '+12% vs last month',
    positive: true,
    icon: Users,
    color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    border: 'border-l-sky-500',
  },
  {
    label: 'Emergency Admissions',
    value: '423',
    delta: '+8% vs last month',
    positive: true,
    icon: Ambulance,
    color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    border: 'border-l-red-500',
  },
  {
    label: 'Avg Length of Stay',
    value: '4.2 days',
    delta: '-0.5 days vs last month',
    positive: true,
    icon: CalendarClock,
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    border: 'border-l-emerald-500',
  },
  {
    label: 'Bed Utilization',
    value: '78.4%',
    delta: '+3.2% vs last month',
    positive: true,
    icon: BedDouble,
    color: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
    border: 'border-l-violet-500',
  },
  {
    label: 'Patient Satisfaction',
    value: '4.6 / 5',
    delta: '+0.2 vs last month',
    positive: true,
    icon: Star,
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    border: 'border-l-amber-500',
  },
  {
    label: 'Recovery Rate',
    value: '94.2%',
    delta: '+1.1% vs last month',
    positive: true,
    icon: HeartPulse,
    color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
    border: 'border-l-teal-500',
  },
];

// ── Department performance data ─────────────────────────────────────────────
interface DeptRow {
  dept: string;
  patients: number;
  avgStay: string;
  satisfaction: string;
  occupancy: string;
}

const DEPT_PERF: DeptRow[] = [
  { dept: 'Emergency',       patients: 423, avgStay: '1.8 days', satisfaction: '4.4 / 5', occupancy: '91%' },
  { dept: 'Cardiology',      patients: 187, avgStay: '5.2 days', satisfaction: '4.7 / 5', occupancy: '84%' },
  { dept: 'Neurology',       patients: 143, avgStay: '6.1 days', satisfaction: '4.6 / 5', occupancy: '78%' },
  { dept: 'Orthopedics',     patients: 98,  avgStay: '4.8 days', satisfaction: '4.5 / 5', occupancy: '72%' },
  { dept: 'Pediatrics',      patients: 76,  avgStay: '3.4 days', satisfaction: '4.8 / 5', occupancy: '65%' },
  { dept: 'General Surgery', patients: 234, avgStay: '3.9 days', satisfaction: '4.5 / 5', occupancy: '88%' },
  { dept: 'Internal Med.',   patients: 312, avgStay: '4.5 days', satisfaction: '4.6 / 5', occupancy: '82%' },
  { dept: 'Gynecology',      patients: 124, avgStay: '2.7 days', satisfaction: '4.7 / 5', occupancy: '69%' },
];

function OccupancyBar({ value }: { value: string }) {
  const pct = parseInt(value);
  const color = pct >= 85 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: value }} />
      </div>
      <span className="text-xs font-medium w-8 text-right">{value}</span>
    </div>
  );
}

// Custom tooltip shared styles
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function HospitalAnalyticsPage() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hospital Analytics</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Performance metrics · AIIMS Delhi · Last 30 days
            </p>
          </div>
          <Badge variant="outline" className="ml-auto text-xs hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live data
          </Badge>
        </div>
      </motion.div>

      {/* KPI cards — 2×3 grid */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={fadeUp}
            whileHover={{ scale: 1.04, rotateX: -3, rotateY: 3 }}
            style={{ perspective: 800, transformStyle: 'preserve-3d' }}
          >
            <Card className={`shadow-sm hover:shadow-lg transition-shadow border-l-4 ${kpi.border}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${kpi.color} shrink-0`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-xl font-bold mt-0.5 leading-none">{kpi.value}</p>
                    <p className={`text-[11px] mt-1 flex items-center gap-0.5 ${kpi.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {kpi.positive
                        ? <TrendingUp className="h-3 w-3 shrink-0" />
                        : <TrendingDown className="h-3 w-3 shrink-0" />
                      }
                      {kpi.delta}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row 1: AreaChart + BarChart */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily admissions area chart */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Admissions — Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent className="pr-4">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={DAILY_ADMISSIONS} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                  <Area
                    type="monotone"
                    dataKey="emergency"
                    name="Emergency"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#colorEmergency)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    name="Planned"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorPlanned)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top departments bar chart */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top 5 Departments by Patient Volume</CardTitle>
            </CardHeader>
            <CardContent className="pr-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DEPT_VOLUME} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="dept" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="patients"
                    name="Patients"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Response time line chart */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Average Response Time — Last 12 Months
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] ml-auto">
                Trending Down — 18 min → 11 min
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pr-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={RESPONSE_TIME} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[8, 20]}
                  tickFormatter={(v) => `${v}m`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                        <p className="font-medium mb-1">{label}</p>
                        <p style={{ color: '#10b981' }}>
                          Avg Response: <span className="font-semibold">{payload[0].value} min</span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="Avg Response (min)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Department performance table */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Department Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Department</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Total Patients</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Avg Stay</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Satisfaction</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 min-w-[160px]">Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPT_PERF.map((row) => (
                    <tr key={row.dept} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.dept}</td>
                      <td className="px-4 py-3 font-semibold">{row.patients.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row.avgStay}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          {row.satisfaction}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <OccupancyBar value={row.occupancy} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
