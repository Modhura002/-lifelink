'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Truck,
  Building2,
  Clock,
  User,
  Heart,
  Download,
  Play,
  RefreshCw,
  Calendar,
  Mail,
  LayoutTemplate,
  CheckCircle2,
  PauseCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Animation variants ───────────────────────────────────────────────────────
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

// ─── Static data ──────────────────────────────────────────────────────────────
const quickReports = [
  {
    icon: FileText,
    title: 'Daily Emergency Summary',
    desc: 'Auto-generated incident log with severity breakdowns and response metrics',
    lastGen: 'Today 00:01',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Truck,
    title: 'Ambulance Performance',
    desc: 'Weekly fleet efficiency, fuel usage, trip counts, and driver ratings',
    lastGen: 'Monday 06:00',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Building2,
    title: 'Hospital Capacity Report',
    desc: 'Real-time bed availability, ICU occupancy, and ER wait times across network',
    lastGen: '2 hours ago',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Clock,
    title: 'Response Time Analysis',
    desc: 'Detailed breakdown of dispatch, travel, and on-scene times by city and shift',
    lastGen: 'Yesterday 23:55',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: User,
    title: 'Driver Performance',
    desc: 'Ratings, trips completed, earnings overview, and training compliance status',
    lastGen: 'Monday 07:30',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Heart,
    title: 'Patient Outcome Report',
    desc: 'Recovery rates, patient satisfaction scores, and post-care follow-up results',
    lastGen: 'Last week',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
];

const scheduledReports = [
  { name: 'Daily Emergency Summary', freq: 'Daily', recipient: 'admin@lifelink.in', lastSent: 'Today 00:01', nextSend: 'Tomorrow 00:01', status: 'Active' },
  { name: 'Weekly Fleet Performance', freq: 'Weekly', recipient: 'fleet@lifelink.in', lastSent: 'Mon 06:00', nextSend: 'Mon 06:00', status: 'Active' },
  { name: 'Monthly KPI Digest', freq: 'Monthly', recipient: 'board@lifelink.in', lastSent: 'May 01', nextSend: 'Jun 01', status: 'Active' },
  { name: 'Hospital Capacity Alert', freq: 'Every 4h', recipient: 'hospitals@lifelink.in', lastSent: '2 hrs ago', nextSend: 'In 2 hrs', status: 'Active' },
  { name: 'Driver Scorecard', freq: 'Weekly', recipient: 'drivers@lifelink.in', lastSent: 'Mon 08:00', nextSend: 'Mon 08:00', status: 'Paused' },
];

const recentExports = [
  { name: 'Emergency Summary — May 2026', format: 'PDF', size: '2.4 MB', by: 'Admin', date: 'Today 09:12' },
  { name: 'City Response Time Analysis', format: 'Excel', size: '1.8 MB', by: 'Admin', date: 'Yesterday 16:45' },
  { name: 'Driver Performance Q1 2026', format: 'PDF', size: '3.1 MB', by: 'Admin', date: '25 May' },
  { name: 'Ambulance Fleet — April', format: 'CSV', size: '0.6 MB', by: 'Admin', date: '24 May' },
  { name: 'Hospital Bed Utilisation', format: 'Excel', size: '1.2 MB', by: 'Admin', date: '22 May' },
  { name: 'Patient Outcomes Q1 2026', format: 'PDF', size: '4.7 MB', by: 'Admin', date: '20 May' },
  { name: 'Financial Billing Summary', format: 'CSV', size: '0.9 MB', by: 'Finance', date: '18 May' },
  { name: 'Compliance Audit Log', format: 'PDF', size: '5.2 MB', by: 'Legal', date: '15 May' },
  { name: 'Network Uptime Report', format: 'Excel', size: '0.4 MB', by: 'Admin', date: '12 May' },
  { name: 'Annual Performance 2025', format: 'PDF', size: '9.8 MB', by: 'Admin', date: '01 May' },
];

const templates = [
  {
    icon: Calendar,
    title: 'Executive Monthly Digest',
    desc: 'High-level KPIs, city rankings, trend charts and YoY comparisons formatted for board presentations.',
  },
  {
    icon: Mail,
    title: 'Regulatory Compliance Pack',
    desc: 'Incident logs, response SLAs, data audit trails, and NABH-ready compliance summaries.',
  },
  {
    icon: LayoutTemplate,
    title: 'Operational Briefing',
    desc: 'Daily ops snapshot: active emergencies, fleet status, hospital capacity, and shift handover notes.',
  },
];

const formatColor: Record<string, string> = {
  PDF: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  CSV: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Excel: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function AdminReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (title: string) => {
    setGenerating(title);
    setTimeout(() => setGenerating(null), 1800);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6">

      {/* ── Header ── */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight">Reports Center</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Generate, schedule, and export system reports</p>
      </motion.div>

      {/* ── Quick Report Cards ── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickReports.map((r) => {
            const Icon = r.icon;
            const isGen = generating === r.title;
            return (
              <Card key={r.title} className="flex flex-col">
                <CardContent className="p-4 flex flex-col flex-1 gap-3">
                  <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${r.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t">
                    <span className="text-[11px] text-muted-foreground">Last: {r.lastGen}</span>
                    <Button
                      size="sm"
                      variant={isGen ? 'outline' : 'default'}
                      className="h-7 text-xs gap-1.5"
                      onClick={() => handleGenerate(r.title)}
                    >
                      {isGen ? (
                        <><RefreshCw className="w-3 h-3 animate-spin" />Generating…</>
                      ) : (
                        <><Play className="w-3 h-3" />Generate</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* ── Scheduled Reports Table ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Report Name', 'Frequency', 'Recipients', 'Last Sent', 'Next Send', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduledReports.map((row) => (
                    <tr key={row.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.freq}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.recipient}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{row.lastSent}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{row.nextSend}</td>
                      <td className="px-4 py-3">
                        {row.status === 'Active' ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                            <PauseCircle className="w-3.5 h-3.5" />Paused
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Exports Table ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Exports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Report Name', 'Format', 'Size', 'Generated By', 'Date', ''].map((h, i) => (
                      <th key={i} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentExports.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium max-w-[220px] truncate">{row.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] font-semibold ${formatColor[row.format] ?? ''}`}>
                          {row.format}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{row.size}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{row.by}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-3">
                        <a href="#" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Report Templates ── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-auto">
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

    </motion.div>
  );
}
