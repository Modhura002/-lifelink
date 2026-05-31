'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Search, Filter, X, Eye, CheckCircle2,
  Clock, AlertCircle, Ban, RefreshCw, User, Stethoscope,
  MapPin, Phone, CreditCard, ChevronDown, Star,
  Calendar, Video, Building2, Download, Printer,
  MessageSquare, Check, ArrowUpDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

type ApptStatus = 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
type ConsultType = 'VIDEO' | 'IN_PERSON';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  hospital: string;
  date: string;
  time: string;
  type: ConsultType;
  status: ApptStatus;
  amount: number;
  paymentMethod: string;
  bookingId: string;
  reason: string;
  notes?: string;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const APPOINTMENTS: Appointment[] = [
  { id: 'a1',  patientName: 'Arjun Sharma',     patientPhone: '9876543210', patientEmail: 'arjun@email.com',     doctorName: 'Dr. Priya Sharma',       doctorSpecialty: 'Cardiology',       hospital: 'AIIMS Delhi',         date: '2026-05-30', time: '10:00 AM', type: 'IN_PERSON', status: 'CONFIRMED',   amount: 1750, paymentMethod: 'UPI',         bookingId: 'LLK-A3F2B1', reason: 'Chest pain follow-up' },
  { id: 'a2',  patientName: 'Priya Patel',       patientPhone: '9765432109', patientEmail: 'priya@email.com',     doctorName: 'Dr. Rajesh Kumar',       doctorSpecialty: 'Neurology',        hospital: 'Fortis Gurgaon',      date: '2026-05-30', time: '11:30 AM', type: 'VIDEO',     status: 'CONFIRMED',   amount: 1298, paymentMethod: 'Card',        bookingId: 'LLK-B5C3D2', reason: 'Migraine treatment' },
  { id: 'a3',  patientName: 'Vikram Singh',      patientPhone: '9654321098', patientEmail: 'vikram@email.com',    doctorName: 'Dr. Anitha Reddy',       doctorSpecialty: 'Orthopedics',      hospital: 'Apollo Hospitals',    date: '2026-05-31', time: '09:00 AM', type: 'IN_PERSON', status: 'PENDING',     amount: 2006, paymentMethod: 'NetBanking',  bookingId: 'LLK-C7E4F3', reason: 'Knee replacement consultation' },
  { id: 'a4',  patientName: 'Sneha Gupta',       patientPhone: '9543210987', patientEmail: 'sneha@email.com',     doctorName: 'Dr. Suresh Mehta',       doctorSpecialty: 'Pediatrics',       hospital: 'Max Hospital',        date: '2026-05-31', time: '02:30 PM', type: 'IN_PERSON', status: 'CONFIRMED',   amount: 826,  paymentMethod: 'Wallet',      bookingId: 'LLK-D9G5H4', reason: 'Child vaccination & check-up' },
  { id: 'a5',  patientName: 'Ravi Nair',         patientPhone: '9432109876', patientEmail: 'ravi@email.com',      doctorName: 'Dr. Meena Krishnan',     doctorSpecialty: 'Dermatology',      hospital: 'Medanta Hospital',    date: '2026-06-01', time: '10:30 AM', type: 'VIDEO',     status: 'PENDING',     amount: 1121, paymentMethod: 'UPI',         bookingId: 'LLK-E2I6J5', reason: 'Acne and skin allergy' },
  { id: 'a6',  patientName: 'Kavitha Menon',     patientPhone: '9321098765', patientEmail: 'kavitha@email.com',   doctorName: 'Dr. Arun Verma',         doctorSpecialty: 'General Medicine', hospital: 'Safdarjung Hospital', date: '2026-06-01', time: '04:00 PM', type: 'IN_PERSON', status: 'CONFIRMED',   amount: 472,  paymentMethod: 'COD',         bookingId: 'LLK-F4K7L6', reason: 'Fever and fatigue' },
  { id: 'a7',  patientName: 'Deepak Joshi',      patientPhone: '9210987654', patientEmail: 'deepak@email.com',    doctorName: 'Dr. Lakshmi Iyer',       doctorSpecialty: 'Gynecology',       hospital: 'Sri Ganga Ram',       date: '2026-06-02', time: '11:00 AM', type: 'IN_PERSON', status: 'COMPLETED',   amount: 1534, paymentMethod: 'Card',        bookingId: 'LLK-G6M8N7', reason: 'Regular check-up' },
  { id: 'a8',  patientName: 'Anjali Rao',        patientPhone: '9109876543', patientEmail: 'anjali@email.com',    doctorName: 'Dr. Vivek Sharma',       doctorSpecialty: 'Psychiatry',       hospital: 'NIMHANS',             date: '2026-06-02', time: '03:00 PM', type: 'VIDEO',     status: 'COMPLETED',   amount: 1652, paymentMethod: 'UPI',         bookingId: 'LLK-H8O9P8', reason: 'Anxiety counseling session' },
  { id: 'a9',  patientName: 'Suresh Pillai',     patientPhone: '9098765432', patientEmail: 'suresh@email.com',    doctorName: 'Dr. Rekha Singh',        doctorSpecialty: 'Ophthalmology',    hospital: 'Sankara Nethralaya', date: '2026-06-03', time: '09:30 AM', type: 'IN_PERSON', status: 'CANCELLED',   amount: 1180, paymentMethod: 'Card',        bookingId: 'LLK-I9Q0R9', reason: 'Cataract evaluation' },
  { id: 'a10', patientName: 'Meena Iyer',        patientPhone: '8987654321', patientEmail: 'meena@email.com',     doctorName: 'Dr. Srinivas Rao',       doctorSpecialty: 'Endocrinology',    hospital: 'Christian Medical',  date: '2026-06-03', time: '01:00 PM', type: 'VIDEO',     status: 'RESCHEDULED', amount: 1298, paymentMethod: 'UPI',         bookingId: 'LLK-J1S2T0', reason: 'Thyroid management' },
  { id: 'a11', patientName: 'Rahul Verma',       patientPhone: '8876543210', patientEmail: 'rahul@email.com',     doctorName: 'Dr. Nandita Ghosh',      doctorSpecialty: 'Pulmonology',      hospital: 'Lilavati Hospital',   date: '2026-06-04', time: '11:00 AM', type: 'IN_PERSON', status: 'CONFIRMED',   amount: 1770, paymentMethod: 'Card',        bookingId: 'LLK-K3U4V1', reason: 'Asthma management' },
  { id: 'a12', patientName: 'Pooja Singh',       patientPhone: '8765432109', patientEmail: 'pooja@email.com',     doctorName: 'Dr. Arjun Nair',         doctorSpecialty: 'Gastroenterology', hospital: 'Kokilaben Hospital',  date: '2026-06-04', time: '02:00 PM', type: 'VIDEO',     status: 'PENDING',     amount: 1534, paymentMethod: 'NetBanking',  bookingId: 'LLK-L5W6X2', reason: 'IBS consultation' },
  { id: 'a13', patientName: 'Anil Kumar',        patientPhone: '8654321098', patientEmail: 'anil@email.com',      doctorName: 'Dr. Priya Sharma',       doctorSpecialty: 'Cardiology',       hospital: 'AIIMS Delhi',         date: '2026-06-05', time: '10:00 AM', type: 'IN_PERSON', status: 'CONFIRMED',   amount: 2006, paymentMethod: 'UPI',         bookingId: 'LLK-M7Y8Z3', reason: 'ECG follow-up' },
  { id: 'a14', patientName: 'Sita Devi',         patientPhone: '8543210987', patientEmail: 'sita@email.com',      doctorName: 'Dr. Suresh Mehta',       doctorSpecialty: 'Pediatrics',       hospital: 'Max Hospital',        date: '2026-06-05', time: '04:30 PM', type: 'IN_PERSON', status: 'NO_SHOW',     amount: 826,  paymentMethod: 'Wallet',      bookingId: 'LLK-N9A0B4', reason: 'Child growth monitoring' },
  { id: 'a15', patientName: 'Gopal Das',         patientPhone: '8432109876', patientEmail: 'gopal@email.com',     doctorName: 'Dr. Meena Krishnan',     doctorSpecialty: 'Dermatology',      hospital: 'Medanta Hospital',    date: '2026-06-06', time: '11:30 AM', type: 'VIDEO',     status: 'CONFIRMED',   amount: 1121, paymentMethod: 'Card',        bookingId: 'LLK-O1C2D5', reason: 'Psoriasis treatment review' },
  { id: 'a16', patientName: 'Bharti Mishra',     patientPhone: '8321098765', patientEmail: 'bharti@email.com',    doctorName: 'Dr. Vivek Sharma',       doctorSpecialty: 'Psychiatry',       hospital: 'NIMHANS',             date: '2026-06-06', time: '03:30 PM', type: 'VIDEO',     status: 'CONFIRMED',   amount: 1948, paymentMethod: 'UPI',         bookingId: 'LLK-P3E4F6', reason: 'Depression management' },
  { id: 'a17', patientName: 'Santosh Patil',     patientPhone: '8210987654', patientEmail: 'santosh@email.com',   doctorName: 'Dr. Rajesh Kumar',       doctorSpecialty: 'Neurology',        hospital: 'Fortis Gurgaon',      date: '2026-06-07', time: '09:00 AM', type: 'IN_PERSON', status: 'PENDING',     amount: 1534, paymentMethod: 'Card',        bookingId: 'LLK-Q5G6H7', reason: 'Epilepsy medication review' },
  { id: 'a18', patientName: 'Latha Krishnan',    patientPhone: '8109876543', patientEmail: 'latha@email.com',     doctorName: 'Dr. Anitha Reddy',       doctorSpecialty: 'Orthopedics',      hospital: 'Apollo Hospitals',    date: '2026-06-07', time: '12:00 PM', type: 'IN_PERSON', status: 'CONFIRMED',   amount: 2360, paymentMethod: 'UPI',         bookingId: 'LLK-R7I8J8', reason: 'Fracture follow-up' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ApptStatus, { label: string; color: string; bg: string; dot: string }> = {
  CONFIRMED:   { label: 'Confirmed',   color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', dot: 'bg-emerald-500' },
  PENDING:     { label: 'Pending',     color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30',     dot: 'bg-amber-500'   },
  COMPLETED:   { label: 'Completed',   color: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-100 dark:bg-blue-900/30',       dot: 'bg-blue-500'    },
  CANCELLED:   { label: 'Cancelled',   color: 'text-red-700 dark:text-red-400',         bg: 'bg-red-100 dark:bg-red-900/30',         dot: 'bg-red-500'     },
  RESCHEDULED: { label: 'Rescheduled', color: 'text-violet-700 dark:text-violet-400',   bg: 'bg-violet-100 dark:bg-violet-900/30',   dot: 'bg-violet-500'  },
  NO_SHOW:     { label: 'No Show',     color: 'text-gray-700 dark:text-gray-400',       bg: 'bg-gray-100 dark:bg-gray-900/30',       dot: 'bg-gray-400'    },
};

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ── Detail Modal ──────────────────────────────────────────────────────────────

function AppointmentDetailModal({ appt, onClose, onStatusChange }: {
  appt: Appointment; onClose: () => void;
  onStatusChange: (id: string, status: ApptStatus) => void;
}) {
  const sc = STATUS_CONFIG[appt.status];
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-card rounded-3xl border shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="font-bold text-lg">Appointment Details</h2>
              <p className="text-xs text-muted-foreground font-mono">{appt.bookingId}</p>
            </div>
            <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
          </div>
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Status */}
            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold', sc.bg, sc.color)}>
              <span className={cn('size-2 rounded-full', sc.dot)} /> {sc.label}
            </span>
            {/* Patient & Doctor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Patient</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{appt.patientName.split(' ').map((n) => n[0]).join('')}</div>
                  <div>
                    <p className="font-bold text-sm">{appt.patientName}</p>
                    <p className="text-[10px] text-muted-foreground">{appt.patientEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" />{appt.patientPhone}</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Doctor</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs"><Stethoscope className="size-4" /></div>
                  <div>
                    <p className="font-bold text-sm">{appt.doctorName}</p>
                    <p className="text-[10px] text-muted-foreground">{appt.doctorSpecialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="size-3" />{appt.hospital}</div>
              </div>
            </div>
            {/* Appointment Info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Date', value: new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
                { label: 'Time', value: appt.time, icon: Clock },
                { label: 'Type', value: appt.type === 'VIDEO' ? 'Video Consultation' : 'In-Person Visit', icon: appt.type === 'VIDEO' ? Video : MapPin },
                { label: 'Amount Paid', value: `₹${appt.amount}`, icon: CreditCard },
                { label: 'Payment Method', value: appt.paymentMethod, icon: CreditCard },
                { label: 'Reason', value: appt.reason, icon: MessageSquare },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium"><Icon className="size-3.5 text-muted-foreground" />{value}</div>
                </div>
              ))}
            </div>
            {/* Action Buttons */}
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Update Status</p>
              <div className="grid grid-cols-3 gap-2">
                {([['CONFIRMED', 'Confirm', 'emerald'], ['COMPLETED', 'Complete', 'blue'], ['CANCELLED', 'Cancel', 'red'], ['RESCHEDULED', 'Reschedule', 'violet'], ['NO_SHOW', 'No Show', 'gray']] as const).map(([s, label, color]) => (
                  <button key={s} disabled={appt.status === s} onClick={() => { onStatusChange(appt.id, s); onClose(); }} className={cn('text-xs font-semibold py-2 px-3 rounded-xl border-2 transition-all', appt.status === s ? 'opacity-40 cursor-not-allowed border-border' : `border-${color}-300 text-${color}-600 hover:bg-${color}-50 dark:hover:bg-${color}-950/20`)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1"><Printer className="size-3.5" /> Print</Button>
            <Button size="sm" className="gap-1.5 flex-1" onClick={onClose}><Check className="size-3.5" /> Done</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminAppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApptStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ConsultType | 'ALL'>('ALL');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    let list = appts.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || a.bookingId.toLowerCase().includes(q) || a.doctorSpecialty.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const matchType = typeFilter === 'ALL' || a.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
    list = [...list].sort((a, b) => {
      const v = sortField === 'date' ? a.date.localeCompare(b.date) : a.amount - b.amount;
      return sortDir === 'asc' ? v : -v;
    });
    return list;
  }, [appts, search, statusFilter, typeFilter, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: appts.length,
    confirmed: appts.filter((a) => a.status === 'CONFIRMED').length,
    pending: appts.filter((a) => a.status === 'PENDING').length,
    completed: appts.filter((a) => a.status === 'COMPLETED').length,
    cancelled: appts.filter((a) => a.status === 'CANCELLED').length,
    revenue: appts.filter((a) => a.status === 'COMPLETED').reduce((s, a) => s + a.amount, 0),
    today: appts.filter((a) => a.date === '2026-05-30').length,
  }), [appts]);

  const changeStatus = (id: string, status: ApptStatus) => {
    setAppts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    toast.success(`Appointment ${status.toLowerCase()}`, { description: appts.find((a) => a.id === id)?.patientName });
  };

  const handleExportCSV = () => {
    const data = filtered.length > 0 ? filtered : appts;
    const headers = ['Booking ID', 'Patient Name', 'Patient Phone', 'Patient Email', 'Doctor', 'Specialty', 'Hospital', 'Date', 'Time', 'Type', 'Status', 'Amount (₹)', 'Payment', 'Reason'];
    const rows = data.map((a) => [
      a.bookingId, `"${a.patientName}"`, a.patientPhone, a.patientEmail,
      `"${a.doctorName}"`, a.doctorSpecialty, `"${a.hospital}"`, a.date, a.time,
      a.type, a.status, a.amount, a.paymentMethod, `"${a.reason.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifelink-appointments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} appointments as CSV`);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 pb-10">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><CalendarCheck className="size-6 text-primary" /> Appointments Manager</h1>
          <p className="text-muted-foreground text-sm mt-0.5">View, manage, and update all doctor appointments across the system</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportCSV}><Download className="size-3.5" /> Export CSV</Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-primary', bg: 'bg-primary/10' },
          { label: "Today's", value: stats.today, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Completed', value: stats.completed, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Revenue', value: `₹${(stats.revenue / 1000).toFixed(1)}k`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} className="card-hover">
            <CardContent className="p-3 text-center">
              <p className={cn('text-xl font-black', color)}>{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search patient, doctor, booking ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted/40 border-0" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="size-3.5 text-muted-foreground" /></button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('text-xs px-3 py-1.5 rounded-lg font-semibold transition-all', statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
              {s === 'ALL' ? 'All Status' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'VIDEO', 'IN_PERSON'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn('text-xs px-3 py-1.5 rounded-lg font-semibold transition-all', typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
              {t === 'ALL' ? 'All Types' : t === 'VIDEO' ? '📹 Video' : '🏥 In-Person'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} appointments</p>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Booking ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold">Doctor / Specialty</th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-foreground" onClick={() => toggleSort('date')}>
                    Date & Time <ArrowUpDown className="size-3 inline ml-0.5" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold cursor-pointer hover:text-foreground" onClick={() => toggleSort('amount')}>
                    Amount <ArrowUpDown className="size-3 inline ml-0.5" />
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {filtered.map((appt, idx) => {
                    const sc = STATUS_CONFIG[appt.status];
                    return (
                      <motion.tr key={appt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.02 }} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                        <td className="px-4 py-3 font-mono text-xs text-primary font-bold">{appt.bookingId}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">{appt.patientName.split(' ').map((n) => n[0]).join('')}</div>
                            <div>
                              <p className="font-semibold text-xs">{appt.patientName}</p>
                              <p className="text-[10px] text-muted-foreground">{appt.patientPhone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-xs">{appt.doctorName}</p>
                          <p className="text-[10px] text-muted-foreground">{appt.doctorSpecialty} · {appt.hospital}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium">{new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] text-muted-foreground">{appt.time}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-[11px] font-semibold flex items-center gap-1', appt.type === 'VIDEO' ? 'text-blue-600' : 'text-violet-600')}>
                            {appt.type === 'VIDEO' ? <Video className="size-3" /> : <Building2 className="size-3" />}
                            {appt.type === 'VIDEO' ? 'Video' : 'In-Person'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', sc.bg, sc.color)}>
                            <span className={cn('size-1.5 rounded-full', sc.dot)} />{sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-sm">₹{appt.amount}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }} className="size-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:scale-110 transition-transform" title="View Details">
                              <Eye className="size-3.5" />
                            </button>
                            {appt.status === 'PENDING' && (
                              <button onClick={(e) => { e.stopPropagation(); changeStatus(appt.id, 'CONFIRMED'); }} className="size-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center hover:scale-110 transition-transform" title="Confirm">
                                <CheckCircle2 className="size-3.5" />
                              </button>
                            )}
                            {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                              <button onClick={(e) => { e.stopPropagation(); changeStatus(appt.id, 'CANCELLED'); }} className="size-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:scale-110 transition-transform" title="Cancel">
                                <Ban className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-16 text-muted-foreground">
                    <CalendarCheck className="size-10 mx-auto mb-2 opacity-20" />
                    <p className="font-medium">No appointments found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Detail Modal */}
      {selectedAppt && (
        <AppointmentDetailModal appt={selectedAppt} onClose={() => setSelectedAppt(null)} onStatusChange={changeStatus} />
      )}
    </motion.div>
  );
}
