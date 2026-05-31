'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Fuel,
  Wind,
  Heart,
  Bed,
  Radio,
  Wrench,
  ShieldCheck,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  MapPin,
  Activity,
  Zap,
  ChevronRight,
  Timer,
  BadgeCheck,
  Edit2,
  X,
  Save,
  Plus,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

/* ─────────────────────────────────────────
   Animation variants
───────────────────────────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' as const } },
};

/* ─────────────────────────────────────────
   Health status items
───────────────────────────────────────── */
interface HealthItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  pct: number;            // 0-100 for bar; -1 = no bar (boolean)
  status: 'good' | 'warning' | 'critical' | 'active';
  detail?: string;
}

const HEALTH_ITEMS: HealthItem[] = [
  { icon: <Activity className="h-4 w-4" />,    label: 'Engine',           value: 'Good',           pct: 92, status: 'good',    detail: 'Last checked 2 days ago' },
  { icon: <Fuel className="h-4 w-4" />,        label: 'Fuel',             value: '68%',            pct: 68, status: 'good',    detail: '34 L remaining' },
  { icon: <Wind className="h-4 w-4" />,        label: 'Oxygen Supply',    value: '85%',            pct: 85, status: 'good',    detail: '17 L cylinder' },
  { icon: <Zap className="h-4 w-4" />,         label: 'AED Unit',         value: 'Charged',        pct: 97, status: 'good',    detail: 'LifePak 20e — Full' },
  { icon: <Bed className="h-4 w-4" />,         label: 'Stretcher',        value: 'OK',             pct: -1, status: 'good',    detail: 'Locked & secure' },
  { icon: <Radio className="h-4 w-4" />,       label: 'Communication',    value: 'Active',         pct: -1, status: 'active',  detail: 'VHF + GSM online' },
  { icon: <Heart className="h-4 w-4" />,       label: 'ECG Monitor',      value: 'Good',           pct: 88, status: 'good',    detail: 'ZOLL X Series' },
  { icon: <Gauge className="h-4 w-4" />,       label: 'Tyre Pressure',    value: 'Low — 28 PSI',   pct: 56, status: 'warning', detail: 'Recommended: 35 PSI' },
];

/* ─────────────────────────────────────────
   Daily checklist
───────────────────────────────────────── */
interface CheckItem {
  label: string;
  ok: boolean;
  note?: string;
}

const CHECKLIST: CheckItem[] = [
  { label: 'Vehicle exterior inspection',      ok: true  },
  { label: 'All lights & sirens operational',  ok: true  },
  { label: 'First aid kit restocked',          ok: true  },
  { label: 'Oxygen cylinder pressure ≥ 80%',  ok: true  },
  { label: 'AED battery fully charged',        ok: true  },
  { label: 'Stretcher rails & locks secure',   ok: true  },
  { label: 'Communication radio tested',       ok: true  },
  { label: 'Tyre pressure checked',            ok: false, note: 'Front-left 28 PSI — inflate before next shift' },
  { label: 'Fuel level ≥ 50%',                ok: true  },
  { label: 'GPS/navigation system calibrated', ok: true  },
  { label: 'Gloves & PPE supply adequate',     ok: true  },
  { label: 'Disinfection of cabin completed',  ok: true  },
];

/* ─────────────────────────────────────────
   Maintenance history
───────────────────────────────────────── */
const MAINTENANCE_HISTORY = [
  { date: '04 Apr 2026', type: 'Full Service',          cost: 8200,  workshop: 'Tata Authorised, Okhla', odometer: '77,500 km' },
  { date: '10 Feb 2026', type: 'Tyre Replacement (×4)', cost: 14800, workshop: 'MRF Tyres, Lajpat Nagar', odometer: '72,100 km' },
  { date: '15 Dec 2025', type: 'Oil & Filter Change',   cost: 2400,  workshop: 'Tata Authorised, Okhla', odometer: '67,200 km' },
  { date: '20 Oct 2025', type: 'Brake Pad Replacement', cost: 5600,  workshop: 'Brembo Service, Nehru Place', odometer: '61,800 km' },
  { date: '05 Aug 2025', type: 'AC Servicing',          cost: 3100,  workshop: 'Cool Care, Dwarka', odometer: '56,400 km' },
  { date: '22 Jun 2025', type: 'Full Service',          cost: 7900,  workshop: 'Tata Authorised, Okhla', odometer: '51,000 km' },
];

/* ─────────────────────────────────────────
   Permits & documents
───────────────────────────────────────── */
const DOCUMENTS = [
  { label: 'Insurance',            valid: 'Dec 31, 2026', provider: 'New India Assurance',  status: 'valid'   },
  { label: 'Commercial Permit',    valid: 'Mar 31, 2027', provider: 'GNCT Delhi',           status: 'valid'   },
  { label: 'Fitness Certificate',  valid: 'Sep 14, 2026', provider: 'MoRTH — Delhi RTO',   status: 'valid'   },
  { label: 'PUC Certificate',      valid: 'Jul 08, 2026', provider: 'Govt Authorised Lab',  status: 'valid'   },
];

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function statusColor(status: HealthItem['status']) {
  switch (status) {
    case 'good':    return 'text-emerald-600 dark:text-emerald-400';
    case 'warning': return 'text-amber-600 dark:text-amber-400';
    case 'critical':return 'text-red-600 dark:text-red-400';
    case 'active':  return 'text-sky-600 dark:text-sky-400';
  }
}
function barColor(status: HealthItem['status'], pct: number) {
  if (status === 'warning' || pct < 60) return 'from-amber-500 to-orange-400';
  if (status === 'critical' || pct < 30) return 'from-red-600 to-red-400';
  return 'from-emerald-500 to-teal-400';
}
function iconBg(status: HealthItem['status']) {
  switch (status) {
    case 'good':    return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
    case 'warning': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
    case 'critical':return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    case 'active':  return 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400';
  }
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function DriverVehiclePage() {
  const [checklist, setChecklist] = useState(CHECKLIST.map((c, i) => ({ ...c, id: i })));
  const [healthItems, setHealthItems] = useState(HEALTH_ITEMS);
  const [odometer, setOdometer] = useState('78,420');
  const [editOdometer, setEditOdometer] = useState(false);
  const [odoInput, setOdoInput] = useState('78420');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ type: '', description: '', urgency: 'normal' as 'low' | 'normal' | 'urgent' });
  const [issueForm, setIssueForm] = useState({ system: '', description: '', severity: 'warning' as 'warning' | 'critical' });

  const warningCount = healthItems.filter((h) => h.status === 'warning' || h.status === 'critical').length;

  const toggleCheckItem = (id: number) => {
    setChecklist((prev) => prev.map((c) => c.id === id ? { ...c, ok: !c.ok } : c));
    const item = checklist.find((c) => c.id === id);
    if (item) toast.success(item.ok ? 'Item marked as failed' : 'Item marked as passed', { description: item.label });
  };

  const saveOdometer = () => {
    const val = parseInt(odoInput.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      setOdometer(val.toLocaleString('en-IN'));
      toast.success('Odometer updated', { description: `${val.toLocaleString('en-IN')} km` });
    }
    setEditOdometer(false);
  };

  const submitServiceRequest = () => {
    if (!serviceForm.type.trim()) return;
    toast.success('Service request submitted', { description: `${serviceForm.type} — ${serviceForm.urgency} priority` });
    setShowServiceModal(false);
    setServiceForm({ type: '', description: '', urgency: 'normal' });
  };

  const reportIssue = () => {
    if (!issueForm.system.trim() || !issueForm.description.trim()) return;
    setHealthItems((prev) => prev.map((h) => h.label === issueForm.system ? { ...h, status: issueForm.severity, value: issueForm.severity === 'critical' ? 'Critical' : 'Warning', detail: issueForm.description } : h));
    toast.error('Issue reported', { description: `${issueForm.system}: ${issueForm.description}` });
    setShowIssueModal(false);
    setIssueForm({ system: '', description: '', severity: 'warning' });
  };

  return (
    <>
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 pb-12">

      {/* ── Page Header ── */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vehicle & Maintenance</h1>
        <p className="text-muted-foreground mt-1 text-sm">Ambulance health, daily checks and service records</p>
      </motion.div>

      {/* ── Vehicle Identity Card ── */}
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-5">

              {/* Ambulance icon */}
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
                <Truck className="h-10 w-10 text-white" />
              </div>

              {/* Details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold">DL-01-EM-0012</h2>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 gap-1 text-xs">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Active Duty
                  </Badge>
                  {warningCount > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0 gap-1 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      {warningCount} Warning
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">Tata Winger Ambulance · 2022 · White</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {/* Odometer — editable */}
                  <div className="bg-muted/50 rounded-lg p-2.5 group">
                    <div className="flex items-center justify-between text-muted-foreground mb-0.5">
                      <div className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /><span className="text-[10px]">Odometer</span></div>
                      <button onClick={() => setEditOdometer(true)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="h-3 w-3" /></button>
                    </div>
                    {editOdometer ? (
                      <div className="flex items-center gap-1">
                        <Input value={odoInput} onChange={(e) => setOdoInput(e.target.value)} className="h-6 text-xs px-1.5 py-0" onKeyDown={(e) => e.key === 'Enter' && saveOdometer()} autoFocus />
                        <button onClick={saveOdometer} className="text-emerald-500"><Save className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditOdometer(false)} className="text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold">{odometer} km</p>
                    )}
                  </div>
                  {[
                    { label: 'Year',      value: '2022',         icon: <Calendar className="h-3.5 w-3.5" /> },
                    { label: 'Base',      value: 'Sarita Vihar', icon: <MapPin className="h-3.5 w-3.5" /> },
                    { label: 'Capacity',  value: '2 patients',  icon: <Bed className="h-3.5 w-3.5" /> },
                  ].map((d) => (
                    <div key={d.label} className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                        {d.icon}
                        <span className="text-[10px]">{d.label}</span>
                      </div>
                      <p className="text-sm font-semibold">{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next service countdown */}
              <div className="md:text-right space-y-1.5 shrink-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Next Service Due</p>
                <div className="flex md:justify-end items-center gap-2">
                  <Timer className="h-4 w-4 text-amber-500" />
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">15 days</span>
                </div>
                <p className="text-[11px] text-muted-foreground">or 2,580 km (whichever first)</p>
                <div className="h-2 w-40 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">82% of service interval used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Two-column: Health indicators + Checklist ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Vehicle Health ── */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-base">System Health</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs gap-1">
                    {healthItems.filter(h => h.status === 'good' || h.status === 'active').length}/{healthItems.length} OK
                  </Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowIssueModal(true)}>
                    <AlertCircle className="h-3 w-3 text-red-500" /> Report Issue
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {healthItems.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3"
                >
                  {/* Icon */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg(item.status)}`}>
                    {item.icon}
                  </div>

                  {/* Label + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{item.label}</span>
                      <span className={`text-xs font-bold ${statusColor(item.status)}`}>{item.value}</span>
                    </div>
                    {item.pct >= 0 && (
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor(item.status, item.pct)}`}
                          initial={{ width: '0%' }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + idx * 0.04 }}
                        />
                      </div>
                    )}
                    {item.detail && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Daily Checklist ── */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-500" />
                  <CardTitle className="text-base">Daily Inspection</CardTitle>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                  {checklist.filter(c => c.ok).length}/{checklist.length} Passed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {checklist.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors cursor-pointer select-none ${item.ok ? 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10' : 'bg-amber-50/60 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40'}`}
                  onClick={() => toggleCheckItem(item.id)}
                  title="Click to toggle"
                >
                  {item.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${!item.ok ? 'text-amber-700 dark:text-amber-400' : ''}`}>{item.label}</p>
                    {item.note && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">{item.note}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5">tap</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Maintenance History ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-violet-500" />
                <CardTitle className="text-base">Maintenance History</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowServiceModal(true)}>
                Request Service
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-5 gap-2 px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <div>Date</div>
              <div className="col-span-2">Service Type</div>
              <div className="text-right">Cost</div>
              <div className="truncate">Workshop</div>
            </div>
            <div className="divide-y divide-border">
              {MAINTENANCE_HISTORY.map((m, idx) => (
                <motion.div
                  key={m.date}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="grid grid-cols-5 gap-2 items-center px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <p className="text-xs font-medium">{m.date}</p>
                    <p className="text-[10px] text-muted-foreground">{m.odometer}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium">{m.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{m.cost.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground truncate">{m.workshop}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Documents & Permits ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-500" />
              <CardTitle className="text-base">Documents & Permits</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0">
            {DOCUMENTS.map((doc, idx) => (
              <motion.div
                key={doc.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-border hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 h-[18px] w-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{doc.label}</p>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[9px] shrink-0">
                      VALID
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{doc.provider}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Valid till {doc.valid}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>

      {/* ── Service Request Modal ── */}
      <AnimatePresence>
        {showServiceModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowServiceModal(false)} />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-violet-500" />
                    <h2 className="font-bold text-lg">Request Service</h2>
                  </div>
                  <button onClick={() => setShowServiceModal(false)} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Service Type *</label>
                    <Input placeholder="e.g. Oil Change, Tyre Rotation, AC Service..." value={serviceForm.type} onChange={(e) => setServiceForm((p) => ({ ...p, type: e.target.value }))} className="bg-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Description</label>
                    <textarea placeholder="Describe the issue or service needed..." value={serviceForm.description} onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))} className="flex w-full min-h-[80px] rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Urgency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'normal', 'urgent'] as const).map((val) => {
                        const labels = { low: 'Low', normal: 'Normal', urgent: 'Urgent' };
                        const clsMap = { low: 'text-emerald-600 bg-emerald-50 border-emerald-300', normal: 'text-blue-600 bg-blue-50 border-blue-300', urgent: 'text-red-600 bg-red-50 border-red-300' };
                        return (
                          <button key={val} onClick={() => setServiceForm((p) => ({ ...p, urgency: val }))} className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${serviceForm.urgency === val ? clsMap[val] : 'border-border text-muted-foreground'}`}>
                            {labels[val]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowServiceModal(false)}>Cancel</Button>
                  <Button className="flex-1 gap-2" disabled={!serviceForm.type.trim()} onClick={submitServiceRequest}><Send className="h-4 w-4" /> Submit Request</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Report Issue Modal ── */}
      <AnimatePresence>
        {showIssueModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowIssueModal(false)} />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h2 className="font-bold text-lg">Report Vehicle Issue</h2>
                  </div>
                  <button onClick={() => setShowIssueModal(false)} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">System / Component *</label>
                    <select value={issueForm.system} onChange={(e) => setIssueForm((p) => ({ ...p, system: e.target.value }))} className="w-full text-sm bg-muted/40 border border-input rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select system...</option>
                      {healthItems.map((h) => <option key={h.label} value={h.label}>{h.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Issue Description *</label>
                    <textarea placeholder="Describe the problem in detail..." value={issueForm.description} onChange={(e) => setIssueForm((p) => ({ ...p, description: e.target.value }))} className="flex w-full min-h-[80px] rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Severity</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['warning', 'critical'] as const).map((val) => {
                        const labels = { warning: '⚠️ Warning', critical: '🚨 Critical' };
                        const clsMap = { warning: 'text-amber-600 bg-amber-50 border-amber-300', critical: 'text-red-600 bg-red-50 border-red-300' };
                        return (
                          <button key={val} onClick={() => setIssueForm((p) => ({ ...p, severity: val }))} className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${issueForm.severity === val ? clsMap[val] : 'border-border text-muted-foreground'}`}>
                            {labels[val]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowIssueModal(false)}>Cancel</Button>
                  <Button variant="destructive" className="flex-1 gap-2" disabled={!issueForm.system || !issueForm.description.trim()} onClick={reportIssue}><AlertTriangle className="h-4 w-4" /> Report Issue</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
