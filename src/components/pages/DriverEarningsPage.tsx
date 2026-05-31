'use client';

import { motion } from 'framer-motion';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  Wallet,
  CreditCard,
  CheckCircle2,
  Clock,
  Star,
  Award,
  Zap,
  Moon,
  Route,
  ChevronRight,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

/* ─────────────────────────────────────────
   Animation variants
───────────────────────────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

/* ─────────────────────────────────────────
   Static data
───────────────────────────────────────── */
const EARNINGS_14_DAYS = [
  { date: '28 May', trips: 7,  km: 42, base: 2100, bonus: 750,  total: 2850, status: 'PAID'    },
  { date: '27 May', trips: 6,  km: 38, base: 1800, bonus: 600,  total: 2400, status: 'PAID'    },
  { date: '26 May', trips: 8,  km: 51, base: 2400, bonus: 900,  total: 3300, status: 'PAID'    },
  { date: '25 May', trips: 5,  km: 31, base: 1500, bonus: 400,  total: 1900, status: 'PAID'    },
  { date: '24 May', trips: 9,  km: 58, base: 2700, bonus: 1050, total: 3750, status: 'PAID'    },
  { date: '23 May', trips: 4,  km: 24, base: 1200, bonus: 300,  total: 1500, status: 'PAID'    },
  { date: '22 May', trips: 7,  km: 44, base: 2100, bonus: 700,  total: 2800, status: 'PAID'    },
  { date: '21 May', trips: 6,  km: 37, base: 1800, bonus: 620,  total: 2420, status: 'PENDING' },
  { date: '20 May', trips: 8,  km: 52, base: 2400, bonus: 880,  total: 3280, status: 'PENDING' },
  { date: '19 May', trips: 5,  km: 29, base: 1500, bonus: 350,  total: 1850, status: 'PENDING' },
  { date: '18 May', trips: 7,  km: 45, base: 2100, bonus: 750,  total: 2850, status: 'PENDING' },
  { date: '17 May', trips: 6,  km: 36, base: 1800, bonus: 580,  total: 2380, status: 'PENDING' },
  { date: '16 May', trips: 9,  km: 60, base: 2700, bonus: 1100, total: 3800, status: 'PAID'    },
  { date: '15 May', trips: 4,  km: 22, base: 1200, bonus: 280,  total: 1480, status: 'PAID'    },
];

const MONTHLY_CHART = [
  { month: 'Jun',  earnings: 54200 },
  { month: 'Jul',  earnings: 58700 },
  { month: 'Aug',  earnings: 61400 },
  { month: 'Sep',  earnings: 55900 },
  { month: 'Oct',  earnings: 63800 },
  { month: 'Nov',  earnings: 67200 },
  { month: 'Dec',  earnings: 72100 },
  { month: 'Jan',  earnings: 59300 },
  { month: 'Feb',  earnings: 64500 },
  { month: 'Mar',  earnings: 70800 },
  { month: 'Apr',  earnings: 66400 },
  { month: 'May',  earnings: 68900 },
];

const LAST_PAYOUTS = [
  { id: 'PAY-88241', date: '20 May 2026', amount: 16420, method: 'Bank Transfer', bank: 'SBI ••••4832', status: 'SUCCESS' },
  { id: 'PAY-87109', date: '13 May 2026', amount: 15780, method: 'Bank Transfer', bank: 'SBI ••••4832', status: 'SUCCESS' },
  { id: 'PAY-85934', date: '06 May 2026', amount: 17340, method: 'Bank Transfer', bank: 'SBI ••••4832', status: 'SUCCESS' },
];

const BONUS_TYPES = [
  { icon: <Zap className="h-4 w-4" />, label: 'Emergency Premium', rate: '+₹150 / trip', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { icon: <Moon className="h-4 w-4" />, label: 'Night Allowance',   rate: '+₹200 / night', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { icon: <Route className="h-4 w-4" />, label: 'Distance Bonus',  rate: '+₹4 / km > 10', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

const WEEKLY_TARGET = 20000;
const WEEKLY_EARNED = 16420;
const WEEKLY_PCT    = Math.round((WEEKLY_EARNED / WEEKLY_TARGET) * 100);

/* ─────────────────────────────────────────
   Custom Recharts tooltip
───────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
        ₹{payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page component
───────────────────────────────────────── */
export default function DriverEarningsPage() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 pb-12">

      {/* ── Page Header ── */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your complete earnings overview — Rajesh Kumar</p>
      </motion.div>

      {/* ── Hero Stats Row ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Today',      value: '₹2,850',    sub: '7 trips',         icon: <Calendar className="h-4 w-4" />,    color: 'text-sky-600 dark:text-sky-400',     iconBg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
          { label: 'This Week',  value: '₹16,420',   sub: '47 trips',        icon: <TrendingUp className="h-4 w-4" />,  color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
          { label: 'This Month', value: '₹68,900',   sub: '203 trips',       icon: <Wallet className="h-4 w-4" />,     color: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
          { label: 'All Time',   value: '₹4,23,500', sub: 'Since Apr 2024',  icon: <Award className="h-4 w-4" />,      color: 'text-amber-600 dark:text-amber-400',   iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{
              scale: 1.04,
              rotateX: -4,
              rotateY: 5,
              z: 24,
              transition: { type: 'spring', stiffness: 420, damping: 22 },
            }}
            style={{ perspective: 900, transformStyle: 'preserve-3d' }}
          >
            <Card className="shadow-sm hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-4">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                  {stat.icon}
                </div>
                <p className={`text-xl md:text-2xl font-bold tracking-tight mt-3 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-semibold mt-0.5">{stat.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Weekly Target Progress ── */}
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold">Weekly Target Progress</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs font-bold">
                {WEEKLY_PCT}% achieved
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{WEEKLY_EARNED.toLocaleString('en-IN')} earned</span>
                <span>Target: ₹{WEEKLY_TARGET.toLocaleString('en-IN')}</span>
              </div>
              <div className="relative h-5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${WEEKLY_PCT}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white mix-blend-plus-lighter">
                  ₹3,580 more to target
                </span>
              </div>
            </div>

            {/* Bonus type pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {BONUS_TYPES.map((b) => (
                <div key={b.label} className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${b.bg}`}>
                  <span className={b.color}>{b.icon}</span>
                  <span className="text-[11px] font-medium">{b.label}</span>
                  <span className={`text-[11px] font-bold ${b.color}`}>{b.rate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Two-column: Table + Payment Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* ── 14-day Earnings Table ── */}
        <motion.div variants={fadeUp} className="xl:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Daily Earnings — Last 14 Days</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table header */}
              <div className="grid grid-cols-7 gap-1 px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                <div>Date</div>
                <div className="text-center">Trips</div>
                <div className="text-center">Dist km</div>
                <div className="text-right">Base</div>
                <div className="text-right">Bonus</div>
                <div className="text-right font-bold">Total</div>
                <div className="text-center">Status</div>
              </div>

              <div className="divide-y divide-border">
                {EARNINGS_14_DAYS.map((row, idx) => (
                  <motion.div
                    key={row.date}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="grid grid-cols-7 gap-1 items-center px-4 py-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="text-xs font-medium">{row.date}</div>
                    <div className="text-center text-xs text-muted-foreground">{row.trips}</div>
                    <div className="text-center text-xs text-muted-foreground">{row.km}</div>
                    <div className="text-right text-xs">₹{row.base.toLocaleString('en-IN')}</div>
                    <div className="text-right text-xs text-amber-600 dark:text-amber-400 font-medium">+₹{row.bonus.toLocaleString('en-IN')}</div>
                    <div className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{row.total.toLocaleString('en-IN')}</div>
                    <div className="flex justify-center">
                      {row.status === 'PAID' ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[9px] px-1.5 gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[9px] px-1.5 gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Right column: Payment + Bonus breakdown ── */}
        <motion.div variants={fadeUp} className="space-y-4">

          {/* Bank details */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-semibold">Payment Method</h3>
              </div>
              <div className="bg-gradient-to-br from-sky-900 to-indigo-900 rounded-xl p-4 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <Building2 className="h-5 w-5 text-sky-300" />
                  <BadgeCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-sm font-bold mt-2">State Bank of India</p>
                <p className="font-mono text-xs tracking-widest text-white/70">•••• •••• •••• 4832</p>
                <div className="flex items-center justify-between text-[10px] text-white/50 pt-1">
                  <span>IFSC: SBIN0001234</span>
                  <span>Savings A/C</span>
                </div>
              </div>

              {/* Last 3 payouts */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Payouts</p>
                {LAST_PAYOUTS.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div>
                      <p className="text-xs font-medium">{p.date}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</p>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[9px] mt-0.5">
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                View All Transactions
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Bonus breakdown */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Month — Bonus Breakdown</p>
              {[
                { label: 'Emergency Premium', amount: 22350, trips: 149, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Night Allowance',   amount: 8200,  trips: 41,  color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Distance Bonus',    amount: 6180,  trips: null, color: 'text-emerald-600 dark:text-emerald-400' },
              ].map((b) => (
                <div key={b.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{b.label}</p>
                    {b.trips && <p className="text-[10px] text-muted-foreground">{b.trips} qualifying trips</p>}
                  </div>
                  <span className={`text-sm font-bold ${b.color}`}>₹{b.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Monthly Bar Chart ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base">Monthly Earnings — Last 12 Months</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_CHART} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="earnings" radius={[6, 6, 0, 0]}>
                  {MONTHLY_CHART.map((entry, idx) => (
                    <Cell
                      key={entry.month}
                      fill={idx === MONTHLY_CHART.length - 1 ? '#10b981' : 'url(#earningsGrad)'}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}
