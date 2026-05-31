'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Heart,
  Wifi,
  Truck,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// ─── Animation variants ───────────────────────────────────────────────────────
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

// ─── Static data ──────────────────────────────────────────────────────────────
const DATE_RANGES = ['Today', '7D', '30D', '90D'] as const;
type DateRange = typeof DATE_RANGES[number];

const volumeData = [
  { day: 'May 14', count: 152 },
  { day: 'May 15', count: 178 },
  { day: 'May 16', count: 165 },
  { day: 'May 17', count: 190 },
  { day: 'May 18', count: 142 },
  { day: 'May 19', count: 158 },
  { day: 'May 20', count: 204 },
  { day: 'May 21', count: 196 },
  { day: 'May 22', count: 171 },
  { day: 'May 23', count: 183 },
  { day: 'May 24', count: 210 },
  { day: 'May 25', count: 168 },
  { day: 'May 26', count: 195 },
  { day: 'May 27', count: 187 },
];

const cityData = [
  { city: 'Mumbai', count: 842 },
  { city: 'Delhi', count: 721 },
  { city: 'Bangalore', count: 534 },
  { city: 'Chennai', count: 412 },
  { city: 'Hyderabad', count: 387 },
  { city: 'Pune', count: 298 },
  { city: 'Kolkata', count: 276 },
  { city: 'Ahmedabad', count: 243 },
  { city: 'Surat', count: 198 },
  { city: 'Jaipur', count: 156 },
];

const responseTimeTrend = [
  { month: 'Jan', time: 5.8 },
  { month: 'Feb', time: 5.4 },
  { month: 'Mar', time: 5.1 },
  { month: 'Apr', time: 4.9 },
  { month: 'May', time: 4.6 },
  { month: 'Jun', time: 4.3 },
  { month: 'Jul', time: 4.0 },
  { month: 'Aug', time: 3.8 },
  { month: 'Sep', time: 3.7 },
  { month: 'Oct', time: 3.5 },
  { month: 'Nov', time: 3.4 },
  { month: 'Dec', time: 3.4 },
];

const emergencyTypes = [
  { name: 'Medical', value: 42, color: '#3b82f6' },
  { name: 'Accident', value: 31, color: '#ef4444' },
  { name: 'Cardiac', value: 18, color: '#f97316' },
  { name: 'Other', value: 9, color: '#8b5cf6' },
];

const topAmbulances = [
  { vehicle: 'MH-02-AB-1234', driver: 'Ramesh Kumar', trips: 312, avgResponse: '3.1 min', rating: 4.9, city: 'Mumbai' },
  { vehicle: 'DL-01-CD-5678', driver: 'Suresh Sharma', trips: 298, avgResponse: '3.3 min', rating: 4.8, city: 'Delhi' },
  { vehicle: 'KA-03-EF-9012', driver: 'Prakash Nair', trips: 287, avgResponse: '3.5 min', rating: 4.8, city: 'Bangalore' },
  { vehicle: 'TN-04-GH-3456', driver: 'Vijay Rajan', trips: 274, avgResponse: '3.4 min', rating: 4.7, city: 'Chennai' },
  { vehicle: 'TS-05-IJ-7890', driver: 'Anil Reddy', trips: 261, avgResponse: '3.6 min', rating: 4.7, city: 'Hyderabad' },
  { vehicle: 'MH-12-KL-2345', driver: 'Dinesh Patil', trips: 248, avgResponse: '3.7 min', rating: 4.6, city: 'Pune' },
  { vehicle: 'WB-06-MN-6789', driver: 'Sanjoy Das', trips: 235, avgResponse: '3.8 min', rating: 4.6, city: 'Kolkata' },
  { vehicle: 'GJ-07-OP-0123', driver: 'Hitesh Shah', trips: 222, avgResponse: '3.9 min', rating: 4.5, city: 'Ahmedabad' },
  { vehicle: 'GJ-21-QR-4567', driver: 'Nilesh Patel', trips: 209, avgResponse: '4.0 min', rating: 4.5, city: 'Surat' },
  { vehicle: 'RJ-14-ST-8901', driver: 'Mohan Verma', trips: 196, avgResponse: '4.1 min', rating: 4.4, city: 'Jaipur' },
];

const kpiCards = [
  {
    title: 'Total Emergencies',
    value: '4,823',
    sub: '30-day total',
    change: '+18% MoM',
    positive: true,
    icon: Activity,
    gradient: 'from-blue-500/10 to-blue-600/5',
    iconColor: 'text-blue-500',
    border: 'border-blue-500/20',
  },
  {
    title: 'Avg Response Time',
    value: '3.8 min',
    sub: 'network average',
    change: '-22% MoM',
    positive: true,
    icon: Clock,
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    iconColor: 'text-emerald-500',
    border: 'border-emerald-500/20',
  },
  {
    title: 'Lives Saved',
    value: '4,612',
    sub: '30-day total',
    change: '+15% MoM',
    positive: true,
    icon: Heart,
    gradient: 'from-rose-500/10 to-rose-600/5',
    iconColor: 'text-rose-500',
    border: 'border-rose-500/20',
  },
  {
    title: 'Network Uptime',
    value: '99.97%',
    sub: 'all systems',
    change: 'Excellent',
    positive: true,
    icon: Wifi,
    gradient: 'from-violet-500/10 to-violet-600/5',
    iconColor: 'text-violet-500',
    border: 'border-violet-500/20',
  },
  {
    title: 'Ambulances Deployed',
    value: '1,247',
    sub: 'total deployments',
    change: '+8% MoM',
    positive: true,
    icon: Truck,
    gradient: 'from-amber-500/10 to-amber-600/5',
    iconColor: 'text-amber-500',
    border: 'border-amber-500/20',
  },
  {
    title: 'Patient Satisfaction',
    value: '4.7/5',
    sub: 'avg rating',
    change: '+0.2 MoM',
    positive: true,
    icon: Star,
    gradient: 'from-orange-500/10 to-orange-600/5',
    iconColor: 'text-orange-500',
    border: 'border-orange-500/20',
  },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-xl shadow-xl p-3 text-xs space-y-1">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30D');

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6">

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-2">
            Network-wide performance intelligence
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </p>
        </div>

        {/* Date range selector */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                dateRange === r
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── KPI Cards 2×3 ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              whileHover={{ y: -4, scale: 1.02, rotateX: 2 }}
              transition={{ duration: 0.2 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className={`bg-gradient-to-br ${kpi.gradient} ${kpi.border} border h-full`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                    </div>
                    <div className={`p-2 rounded-xl bg-background/60 ${kpi.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    {kpi.positive ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-rose-500" />
                    )}
                    <span className={`text-xs font-medium ${kpi.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Charts row 1 ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Area Chart – Emergency Volume */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Emergency Volume — Last 14 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={volumeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" name="Emergencies" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart – Response Time Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Response Time Trend — 12 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={responseTimeTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[3, 6.5]} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="time" name="Avg Response (min)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Charts row 2 ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar Chart – Top 10 Cities */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top 10 Cities by Emergency Count (30D)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cityData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="city" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Emergencies" radius={[4, 4, 0, 0]}>
                  {cityData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${210 + i * 12}, 80%, ${55 - i * 1.5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart – Emergency Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Emergency Types</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={emergencyTypes} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {emergencyTypes.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
              {emergencyTypes.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: t.color }} />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="font-semibold ml-auto">{t.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Top Ambulances Table ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Top 10 Performing Ambulances</CardTitle>
              <Badge variant="secondary">This month</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">#</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Vehicle No.</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Driver</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Trips</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Avg Response</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Rating</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">City</th>
                  </tr>
                </thead>
                <tbody>
                  {topAmbulances.map((row, i) => (
                    <tr key={row.vehicle} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs font-medium">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{row.vehicle}</td>
                      <td className="px-4 py-3 font-medium">{row.driver}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{row.trips}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">{row.avgResponse}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="font-semibold">{row.rating}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.city}</td>
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
