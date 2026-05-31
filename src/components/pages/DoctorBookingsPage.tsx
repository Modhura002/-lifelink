'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Video, User, CheckCircle, XCircle,
  Bell, Mail, ThumbsUp, ThumbsDown, Stethoscope,
  IndianRupee, MapPin, AlertCircle, X, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore, useLiveFeedStore, type BookingRequest } from '@/store';

// ── Seeded demo requests ──────────────────────────────────────────────────────

const SEED: BookingRequest[] = [
  { id: 'seed1', bookingId: 'LLK-AB3X9K', patientName: 'Rahul Gupta', patientEmail: 'rahul.gupta@example.com', doctorId: 'd1', doctorName: 'Dr. Priya Sharma', specialty: 'Cardiology', hospital: 'Apollo Hospitals, Delhi', date: 'Thu, 29 May 2026', time: '04:30 PM', type: 'in-person', fee: 1200, reason: 'Experiencing chest discomfort and shortness of breath during physical activity for the past 2 weeks.', status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'seed2', bookingId: 'LLK-ZQ8M2R', patientName: 'Priya Mehta', patientEmail: 'priya.mehta@example.com', doctorId: 'd2', doctorName: 'Dr. Arjun Mehta', specialty: 'Neurology', hospital: 'AIIMS, Delhi', date: 'Fri, 30 May 2026', time: '10:00 AM', type: 'video', fee: 1500, reason: 'Persistent migraines with visual aura for 3 months. Previous CT scan was inconclusive.', status: 'pending', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'seed3', bookingId: 'LLK-TY4P8W', patientName: 'Arjun Kapoor', patientEmail: 'arjun.k@example.com', doctorId: 'd3', doctorName: 'Dr. Sunita Rao', specialty: 'Orthopedics', hospital: 'Fortis Hospital, Gurugram', date: 'Wed, 28 May 2026', time: '02:00 PM', type: 'in-person', fee: 900, reason: 'Left knee pain and swelling after sports injury. Cannot bear weight fully.', status: 'accepted', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'seed4', bookingId: 'LLK-XP2N5R', patientName: 'Sunita Sharma', patientEmail: 'sunita.s@example.com', doctorId: 'd4', doctorName: 'Dr. Vikram Singh', specialty: 'Dermatology', hospital: 'Max Healthcare, Gurugram', date: 'Mon, 26 May 2026', time: '11:00 AM', type: 'video', fee: 800, reason: 'Recurring skin rash on arms and neck. No improvement with OTC creams.', status: 'rejected', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'seed5', bookingId: 'LLK-BV7Q1S', patientName: 'Rohit Verma', patientEmail: 'rohit.v@example.com', doctorId: 'd5', doctorName: 'Dr. Ananya Krishnamurthy', specialty: 'Pediatrics', hospital: 'Rainbow Children\'s Hospital, Hyd', date: 'Sat, 31 May 2026', time: '09:00 AM', type: 'in-person', fee: 700, reason: 'Child (8 yrs) has recurring fever spikes every 3-4 days with no clear diagnosis.', status: 'pending', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'seed6', bookingId: 'LLK-CK3M7P', patientName: 'Kavita Rao', patientEmail: 'kavita.r@example.com', doctorId: 'd6', doctorName: 'Dr. Rajesh Nair', specialty: 'Gastroenterology', hospital: 'Manipal Hospital, Bangalore', date: 'Sun, 01 Jun 2026', time: '03:00 PM', type: 'video', fee: 1100, reason: 'Chronic acid reflux not responding to PPIs. Requesting endoscopy referral.', status: 'pending', createdAt: new Date(Date.now() - 900000).toISOString() },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function relTime(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1) return 'Just now';
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingRequest['status'] }) {
  if (status === 'pending') return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
      <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />Pending
    </span>
  );
  if (status === 'accepted') return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
      <CheckCircle className="size-3" />Accepted
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
      <XCircle className="size-3" />Declined
    </span>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({ req, onClose, onAccept, onReject }: {
  req: BookingRequest;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card rounded-3xl border shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="font-bold">{req.patientName}</p>
            <p className="text-xs text-muted-foreground">{req.bookingId}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={req.status} />
            <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient */}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
              {req.patientName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-bold">{req.patientName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="size-3" />{req.patientEmail}</p>
            </div>
          </div>

          {/* Appointment details */}
          <div className="bg-muted/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Stethoscope className="size-4 text-primary shrink-0" />
              <span className="font-semibold">{req.doctorName}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{req.specialty}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{req.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{req.time}</span>
              <span className="flex items-center gap-1.5">
                {req.type === 'video' ? <Video className="size-3.5" /> : <User className="size-3.5" />}
                {req.type === 'video' ? 'Video Call' : 'In-Person'}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <IndianRupee className="size-3.5" />₹{req.fee.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />{req.hospital}
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Patient's Reason</p>
            <p className="text-sm bg-muted/30 rounded-xl px-4 py-3 italic text-muted-foreground leading-relaxed">
              &ldquo;{req.reason}&rdquo;
            </p>
          </div>

          {/* Actions */}
          {req.status === 'pending' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 gap-2"
                onClick={() => { onReject(req.id); onClose(); }}>
                <ThumbsDown className="size-4" />Decline
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={() => { onAccept(req.id); onClose(); }}>
                <ThumbsUp className="size-4" />Accept
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Booking card ──────────────────────────────────────────────────────────────

function BookingCard({ req, onAccept, onReject, onClick }: {
  req: BookingRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onClick: () => void;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        'bg-card border rounded-2xl p-5 space-y-4 cursor-pointer hover:shadow-md transition-all',
        req.status === 'pending' && 'border-amber-200/60 dark:border-amber-800/40',
        req.status === 'accepted' && 'border-emerald-200/60 dark:border-emerald-800/40',
        req.status === 'rejected' && 'opacity-60',
      )}
      onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {req.patientName.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-sm">{req.patientName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="size-3" />{req.patientEmail}</p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      <div className="bg-muted/40 rounded-xl p-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <Stethoscope className="size-3.5 text-primary shrink-0" />
          <span className="font-semibold">{req.doctorName}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{req.specialty}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="size-3" />{req.date}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" />{req.time}</span>
          <span className="flex items-center gap-1">
            {req.type === 'video' ? <Video className="size-3" /> : <User className="size-3" />}
            {req.type === 'video' ? 'Video' : 'In-Person'}
          </span>
          <span className="flex items-center gap-1 font-semibold text-foreground"><IndianRupee className="size-3" />{req.fee.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {req.reason && (
        <p className="text-xs text-muted-foreground italic line-clamp-2">&ldquo;{req.reason}&rdquo;</p>
      )}

      <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Bell className="size-3" />{relTime(req.createdAt)}
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-[10px]">{req.bookingId}</span>
        </p>
        {req.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => onReject(req.id)}>
              <ThumbsDown className="size-3 mr-1" />Decline
            </Button>
            <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => onAccept(req.id)}>
              <ThumbsUp className="size-3 mr-1" />Accept
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DoctorBookingsPage() {
  const { bookingRequests, updateBookingStatus } = useLiveFeedStore();
  const addNotification = useUIStore((s) => s.addNotification);
  const [seedState, setSeedState] = useState<Record<string, BookingRequest['status']>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selected, setSelected] = useState<BookingRequest | null>(null);

  const allRequests = useMemo(() => {
    const seeded = SEED.map((r) => ({ ...r, status: seedState[r.id] ?? r.status }));
    return [...bookingRequests, ...seeded];
  }, [bookingRequests, seedState]);

  const filtered = useMemo(() =>
    filter === 'all' ? allRequests : allRequests.filter((r) => r.status === filter),
    [allRequests, filter]
  );

  const stats = useMemo(() => ({
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    accepted: allRequests.filter(r => r.status === 'accepted').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
  }), [allRequests]);

  const doAccept = (id: string) => {
    const req = allRequests.find(r => r.id === id);
    if (!req) return;
    if (bookingRequests.find(r => r.id === id)) {
      updateBookingStatus(id, 'accepted');
    } else {
      setSeedState(p => ({ ...p, [id]: 'accepted' }));
    }
    addNotification({
      title: 'Appointment Confirmed ✓',
      message: `Your appointment with ${req.doctorName} (${req.specialty}) on ${req.date} at ${req.time} has been confirmed. Booking ID: ${req.bookingId}`,
      type: 'SYSTEM',
    });
    toast.success('Booking accepted', { description: `${req.patientName}'s appointment confirmed.` });
  };

  const doReject = (id: string) => {
    const req = allRequests.find(r => r.id === id);
    if (!req) return;
    if (bookingRequests.find(r => r.id === id)) {
      updateBookingStatus(id, 'rejected');
    } else {
      setSeedState(p => ({ ...p, [id]: 'rejected' }));
    }
    toast.info('Booking declined', { description: `${req?.patientName}'s request declined.` });
  };

  const TABS = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'accepted', label: 'Accepted', count: stats.accepted },
    { key: 'rejected', label: 'Declined', count: stats.rejected },
  ] as const;

  const STAT_CARDS = [
    { label: 'Total', value: stats.total, color: 'text-primary', bg: 'bg-primary/10', icon: Calendar },
    { label: 'Awaiting', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/20', icon: Bell },
    { label: 'Confirmed', value: stats.accepted, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20', icon: CheckCircle },
    { label: 'Declined', value: stats.rejected, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20', icon: XCircle },
  ];

  return (
    <>
      <div className="p-4 md:p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border rounded-2xl p-4 flex items-center gap-3">
                <div className={cn('size-10 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
                  <Icon className={cn('size-5', c.color)} />
                </div>
                <div>
                  <p className={cn('text-2xl font-black', c.color)}>{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pending banner */}
        {stats.pending > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3">
            <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {stats.pending} booking{stats.pending !== 1 ? 's' : ''} awaiting your response
            </p>
            <button onClick={() => setFilter('pending')} className="ml-auto text-xs underline text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              View <ChevronDown className="size-3 -rotate-90" />
            </button>
          </motion.div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0',
                filter === tab.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted',
              )}>
              {tab.label}
              <span className={cn('min-w-[18px] h-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1',
                filter === tab.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-muted-foreground')}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                  <Calendar className="size-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-muted-foreground">No {filter === 'all' ? '' : filter} bookings</p>
              </motion.div>
            ) : filtered.map((req) => (
              <BookingCard key={req.id} req={req} onAccept={doAccept} onReject={doReject}
                onClick={() => setSelected(req)} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            req={allRequests.find(r => r.id === selected.id) ?? selected}
            onClose={() => setSelected(null)}
            onAccept={(id) => { doAccept(id); setSelected(null); }}
            onReject={(id) => { doReject(id); setSelected(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
