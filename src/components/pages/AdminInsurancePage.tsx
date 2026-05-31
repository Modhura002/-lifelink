'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Search, Filter, X, CheckCircle, XCircle,
  IndianRupee, Calendar, Users, TrendingUp, AlertCircle,
  FileText, Eye, ChevronRight, Download, BarChart3,
  Clock, Star, Building2, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Seed data ─────────────────────────────────────────────────────────────────

interface Subscriber {
  id: string; name: string; email: string; plan: string;
  premium: number; coverage: number; status: 'Active' | 'Lapsed' | 'Pending';
  since: string; claimsCount: number; claimsTotal: number; nextRenewal: string;
}

interface ClaimRecord {
  id: string; claimNo: string; subscriber: string; type: string;
  hospital: string; amount: number; status: 'Under Review' | 'Approved' | 'Settled' | 'Rejected';
  date: string; policyId: string;
}

const SUBS: Subscriber[] = [
  { id: 's1', name: 'Rahul Gupta', email: 'rahul.g@example.com', plan: 'LifeLink Gold', premium: 1599, coverage: 1000000, status: 'Active', since: 'Jan 2025', claimsCount: 1, claimsTotal: 48500, nextRenewal: '01 Jan 2027' },
  { id: 's2', name: 'Priya Mehta', email: 'priya.m@example.com', plan: 'LifeLink Silver', premium: 899, coverage: 500000, status: 'Active', since: 'Mar 2025', claimsCount: 0, claimsTotal: 0, nextRenewal: '01 Mar 2027' },
  { id: 's3', name: 'Arjun Kapoor', email: 'arjun.k@example.com', plan: 'LifeLink Platinum', premium: 2999, coverage: 2500000, status: 'Active', since: 'Jun 2024', claimsCount: 3, claimsTotal: 182000, nextRenewal: '01 Jun 2026' },
  { id: 's4', name: 'Sunita Sharma', email: 'sunita.s@example.com', plan: 'LifeLink Basic', premium: 499, coverage: 300000, status: 'Lapsed', since: 'Sep 2024', claimsCount: 0, claimsTotal: 0, nextRenewal: '01 Sep 2025' },
  { id: 's5', name: 'Vikram Singh', email: 'vikram.s@example.com', plan: 'LifeLink Family', premium: 2199, coverage: 1500000, status: 'Active', since: 'Feb 2026', claimsCount: 2, claimsTotal: 34000, nextRenewal: '01 Feb 2027' },
  { id: 's6', name: 'Kavita Rao', email: 'kavita.r@example.com', plan: 'LifeLink Gold', premium: 1599, coverage: 1000000, status: 'Pending', since: 'May 2026', claimsCount: 0, claimsTotal: 0, nextRenewal: '01 May 2027' },
  { id: 's7', name: 'Rohit Verma', email: 'rohit.v@example.com', plan: 'LifeLink Silver', premium: 899, coverage: 500000, status: 'Active', since: 'Nov 2024', claimsCount: 1, claimsTotal: 22000, nextRenewal: '01 Nov 2026' },
  { id: 's8', name: 'Meera Iyer', email: 'meera.i@example.com', plan: 'LifeLink Platinum', premium: 2999, coverage: 2500000, status: 'Active', since: 'Aug 2023', claimsCount: 5, claimsTotal: 380000, nextRenewal: '01 Aug 2026' },
];

const CLAIMS: ClaimRecord[] = [
  { id: 'c1', claimNo: 'CLM-2026-00841', subscriber: 'Rahul Gupta', type: 'Hospitalisation', hospital: 'Apollo Hospitals, Delhi', amount: 48500, status: 'Settled', date: '15 Mar 2026', policyId: 'LLINS-A1B2C3D4' },
  { id: 'c2', claimNo: 'CLM-2026-01233', subscriber: 'Priya Mehta', type: 'Day-care Procedure', hospital: 'Max Healthcare, Gurugram', amount: 12000, status: 'Approved', date: '02 Apr 2026', policyId: 'LLINS-E5F6G7H8' },
  { id: 'c3', claimNo: 'CLM-2026-01890', subscriber: 'Arjun Kapoor', type: 'OPD / Consultation', hospital: 'Online', amount: 2400, status: 'Under Review', date: '19 May 2026', policyId: 'LLINS-I9J0K1L2' },
  { id: 'c4', claimNo: 'CLM-2026-02100', subscriber: 'Meera Iyer', type: 'Maternity', hospital: 'Cloudnine Hospital', amount: 95000, status: 'Approved', date: '22 May 2026', policyId: 'LLINS-M3N4O5P6' },
  { id: 'c5', claimNo: 'CLM-2026-02345', subscriber: 'Vikram Singh', type: 'Dental', hospital: 'SmileCare Dental', amount: 8500, status: 'Under Review', date: '25 May 2026', policyId: 'LLINS-Q7R8S9T0' },
  { id: 'c6', claimNo: 'CLM-2026-00201', subscriber: 'Rohit Verma', type: 'Ambulance', hospital: 'AIIMS Delhi', amount: 3500, status: 'Settled', date: '10 Feb 2026', policyId: 'LLINS-U1V2W3X4' },
];

const PLAN_STATS = [
  { plan: 'Basic', subscribers: 142, revenue: 70858, color: 'bg-sky-500' },
  { plan: 'Silver', subscribers: 389, revenue: 349711, color: 'bg-slate-500' },
  { plan: 'Gold', subscribers: 276, revenue: 441324, color: 'bg-amber-500' },
  { plan: 'Platinum', subscribers: 98, revenue: 293902, color: 'bg-violet-500' },
  { plan: 'Family', subscribers: 184, revenue: 404616, color: 'bg-emerald-500' },
];

function ClaimStatusBadge({ status }: { status: ClaimRecord['status'] }) {
  const MAP = {
    'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Approved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Settled': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', MAP[status])}>{status}</span>;
}

function SubStatusBadge({ status }: { status: Subscriber['status'] }) {
  const MAP = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Lapsed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', MAP[status])}>{status}</span>;
}

// ── Subscriber detail modal ───────────────────────────────────────────────────

function SubModal({ sub, onClose }: { sub: Subscriber; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card rounded-3xl border shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="font-bold">{sub.name}</p>
            <p className="text-xs text-muted-foreground">{sub.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <SubStatusBadge status={sub.status} />
            <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: 'Plan', v: sub.plan },
              { l: 'Monthly Premium', v: `₹${sub.premium.toLocaleString('en-IN')}` },
              { l: 'Sum Insured', v: `₹${(sub.coverage / 100000).toFixed(0)} Lakh` },
              { l: 'Member Since', v: sub.since },
              { l: 'Next Renewal', v: sub.nextRenewal },
              { l: 'Claims Filed', v: sub.claimsCount.toString() },
            ].map(({ l, v }) => (
              <div key={l} className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">{l}</p>
                <p className="font-bold text-sm mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          {sub.claimsTotal > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Total Claims Settled</span>
              <span className="font-black text-amber-600 dark:text-amber-400">₹{sub.claimsTotal.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 text-xs h-9 gap-1.5"><Phone className="size-3.5" />Contact</Button>
            <Button variant="outline" className="flex-1 text-xs h-9 gap-1.5"><Download className="size-3.5" />Policy PDF</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminInsurancePage() {
  const [tab, setTab] = useState<'overview' | 'subscribers' | 'claims'>('overview');
  const [search, setSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState<Subscriber | null>(null);
  const [claimsFilter, setClaimsFilter] = useState<'all' | ClaimRecord['status']>('all');

  const filteredSubs = useMemo(() => {
    if (!search.trim()) return SUBS;
    const q = search.toLowerCase();
    return SUBS.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q));
  }, [search]);

  const filteredClaims = useMemo(() =>
    claimsFilter === 'all' ? CLAIMS : CLAIMS.filter(c => c.status === claimsFilter),
    [claimsFilter]
  );

  const totalRevenue = SUBS.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.premium * 12, 0);
  const activeCount = SUBS.filter(s => s.status === 'Active').length;
  const pendingClaims = CLAIMS.filter(c => c.status === 'Under Review').length;
  const totalClaimed = CLAIMS.reduce((sum, c) => sum + c.amount, 0);

  const STAT_CARDS = [
    { label: 'Total Subscribers', value: SUBS.length.toString(), sub: `${activeCount} active`, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Annual Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, sub: 'from active policies', icon: IndianRupee, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
    { label: 'Pending Claims', value: pendingClaims.toString(), sub: 'awaiting review', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/20' },
    { label: 'Claims Paid Out', value: `₹${(totalClaimed / 100000).toFixed(1)}L`, sub: 'total settled', icon: FileText, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/20' },
  ];

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border rounded-2xl p-4 flex items-center gap-3">
                <div className={cn('size-11 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
                  <Icon className={cn('size-5', c.color)} />
                </div>
                <div>
                  <p className={cn('text-xl font-black', c.color)}>{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground/70">{c.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted/50 rounded-2xl p-1">
          {[{ key: 'overview', label: 'Plan Overview' }, { key: 'subscribers', label: 'Subscribers' }, { key: 'claims', label: 'Claims' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={cn('flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                tab === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PLAN_STATS.map((p, i) => (
                <motion.div key={p.plan} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-card border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('size-3 rounded-full', p.color)} />
                      <p className="font-bold">{p.plan}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{p.subscribers} subscribers</span>
                  </div>
                  <p className="text-2xl font-black">₹{(p.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">annual revenue</p>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', p.color)}
                      style={{ width: `${(p.subscribers / Math.max(...PLAN_STATS.map(x => x.subscribers))) * 100}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Subscribers */}
        {tab === 'subscribers' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search by name, email or plan..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl" />
            </div>
            <div className="space-y-3">
              {filteredSubs.map((sub, i) => (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card border rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedSub(sub)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {sub.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.email}</p>
                      </div>
                    </div>
                    <SubStatusBadge status={sub.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ShieldCheck className="size-3 text-primary" />{sub.plan}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="size-3" />₹{sub.premium}/mo</span>
                    <span className="flex items-center gap-1"><FileText className="size-3" />{sub.claimsCount} claims</span>
                    <span className="flex items-center gap-1"><Calendar className="size-3" />Renews {sub.nextRenewal}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Claims */}
        {tab === 'claims' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'Under Review', 'Approved', 'Settled', 'Rejected'] as const).map(f => (
                <button key={f} onClick={() => setClaimsFilter(f)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                    claimsFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredClaims.map((claim, i) => (
                <motion.div key={claim.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm">{claim.subscriber}</p>
                      <p className="text-xs text-muted-foreground">{claim.type} · {claim.hospital}</p>
                    </div>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-xl font-black flex items-center gap-0.5"><IndianRupee className="size-4" />{claim.amount.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Calendar className="size-3" />{claim.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] text-muted-foreground">{claim.claimNo}</p>
                      {claim.status === 'Under Review' && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50">Reject</Button>
                          <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">Approve</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedSub && <SubModal sub={selectedSub} onClose={() => setSelectedSub(null)} />}
      </AnimatePresence>
    </>
  );
}
