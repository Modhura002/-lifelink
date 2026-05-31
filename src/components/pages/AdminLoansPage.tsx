'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote, Search, X, CheckCircle, XCircle,
  IndianRupee, Calendar, Users, TrendingUp, AlertCircle,
  FileText, Clock, ChevronRight, BarChart3, Zap,
  Heart, Phone, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ── Types & Seed data ─────────────────────────────────────────────────────────

interface LoanApp {
  id: string; refNo: string; applicant: string; email: string; phone: string;
  product: string; amount: number; tenure: number; interestRate: number; emi: number;
  purpose: string; employment: string; income: number; creditScore: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed' | 'Closed';
  appliedOn: string; riskLevel: 'Low' | 'Medium' | 'High';
}

interface ActiveLoan {
  id: string; refNo: string; borrower: string; product: string;
  disbursed: number; outstanding: number; emi: number; nextEmi: string;
  paidEmis: number; totalEmis: number; status: 'Active' | 'Overdue' | 'Closed';
}

const APPS: LoanApp[] = [
  { id: 'a1', refNo: 'LLL-2026-00421', applicant: 'Rahul Gupta', email: 'rahul.g@example.com', phone: '+91 98765 43210', product: 'Medical Emergency Loan', amount: 150000, tenure: 18, interestRate: 11.99, emi: 9244, purpose: 'Emergency treatment', employment: 'Salaried (Private)', income: 65000, creditScore: 742, status: 'Pending', appliedOn: '27 May 2026', riskLevel: 'Low' },
  { id: 'a2', refNo: 'LLL-2026-00418', applicant: 'Priya Mehta', email: 'priya.m@example.com', phone: '+91 87654 32109', product: 'Personal Health Loan', amount: 300000, tenure: 36, interestRate: 10.49, emi: 9756, purpose: 'Surgery', employment: 'Salaried (Government)', income: 82000, creditScore: 789, status: 'Approved', appliedOn: '26 May 2026', riskLevel: 'Low' },
  { id: 'a3', refNo: 'LLL-2026-00415', applicant: 'Arjun Kapoor', email: 'arjun.k@example.com', phone: '+91 76543 21098', product: 'ICU Care Finance', amount: 800000, tenure: 60, interestRate: 12.99, emi: 18170, purpose: 'ICU/Critical care', employment: 'Business Owner', income: 150000, creditScore: 708, status: 'Disbursed', appliedOn: '24 May 2026', riskLevel: 'Medium' },
  { id: 'a4', refNo: 'LLL-2026-00409', applicant: 'Sunita Sharma', email: 'sunita.s@example.com', phone: '+91 65432 10987', product: 'Family Health Credit', amount: 200000, tenure: 24, interestRate: 11.49, emi: 9360, purpose: 'Senior care', employment: 'Self-Employed', income: 45000, creditScore: 621, status: 'Pending', appliedOn: '23 May 2026', riskLevel: 'High' },
  { id: 'a5', refNo: 'LLL-2026-00403', applicant: 'Vikram Singh', email: 'vikram.s@example.com', phone: '+91 54321 09876', product: 'Personal Health Loan', amount: 500000, tenure: 48, interestRate: 10.49, emi: 12797, purpose: 'Fertility treatment', employment: 'Salaried (Private)', income: 120000, creditScore: 755, status: 'Disbursed', appliedOn: '20 May 2026', riskLevel: 'Low' },
  { id: 'a6', refNo: 'LLL-2026-00398', applicant: 'Kavita Rao', email: 'kavita.r@example.com', phone: '+91 43210 98765', product: 'Medical Emergency Loan', amount: 75000, tenure: 12, interestRate: 11.99, emi: 6657, purpose: 'Dental work', employment: 'Freelancer', income: 35000, creditScore: 668, status: 'Rejected', appliedOn: '18 May 2026', riskLevel: 'High' },
  { id: 'a7', refNo: 'LLL-2026-00391', applicant: 'Rohit Verma', email: 'rohit.v@example.com', phone: '+91 32109 87654', product: 'Family Health Credit', amount: 350000, tenure: 36, interestRate: 11.49, emi: 11540, purpose: 'Maternity expenses', employment: 'Salaried (Private)', income: 70000, creditScore: 731, status: 'Active' as unknown as LoanApp['status'], appliedOn: '15 May 2026', riskLevel: 'Low' },
];

const ACTIVE_LOANS: ActiveLoan[] = [
  { id: 'l1', refNo: 'LLL-2025-00421', borrower: 'Priya Mehta', product: 'Personal Health Loan', disbursed: 300000, outstanding: 188000, emi: 9756, nextEmi: '05 Jun 2026', paidEmis: 13, totalEmis: 36, status: 'Active' },
  { id: 'l2', refNo: 'LLL-2025-00380', borrower: 'Arjun Kapoor', product: 'ICU Care Finance', disbursed: 800000, outstanding: 710000, emi: 18170, nextEmi: '03 Jun 2026', paidEmis: 4, totalEmis: 60, status: 'Active' },
  { id: 'l3', refNo: 'LLL-2025-00302', borrower: 'Vikram Singh', product: 'Personal Health Loan', disbursed: 500000, outstanding: 390000, emi: 12797, nextEmi: '01 Jun 2026', paidEmis: 9, totalEmis: 48, status: 'Overdue' },
  { id: 'l4', refNo: 'LLL-2024-00188', borrower: 'Meera Iyer', product: 'Medical Emergency Loan', disbursed: 200000, outstanding: 0, emi: 0, nextEmi: '—', paidEmis: 24, totalEmis: 24, status: 'Closed' },
];

function RiskBadge({ level }: { level: LoanApp['riskLevel'] }) {
  const MAP = { Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  return <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', MAP[level])}>{level} Risk</span>;
}

function AppStatusBadge({ status }: { status: LoanApp['status'] }) {
  const MAP: Record<LoanApp['status'], string> = {
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Disbursed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Closed: 'bg-muted text-muted-foreground',
  };
  return <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', MAP[status])}>{status}</span>;
}

// ── Application detail modal ──────────────────────────────────────────────────

function AppModal({ app, onClose, onApprove, onReject }: {
  app: LoanApp; onClose: () => void;
  onApprove: (id: string) => void; onReject: (id: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card rounded-3xl border shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="font-bold">{app.applicant}</p>
            <p className="text-xs text-muted-foreground font-mono">{app.refNo}</p>
          </div>
          <div className="flex items-center gap-2">
            <AppStatusBadge status={app.status} />
            <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Loan details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: 'Loan Product', v: app.product },
              { l: 'Loan Amount', v: `₹${app.amount.toLocaleString('en-IN')}` },
              { l: 'Tenure', v: `${app.tenure} months` },
              { l: 'Interest Rate', v: `${app.interestRate}% p.a.` },
              { l: 'Monthly EMI', v: `₹${app.emi.toLocaleString('en-IN')}` },
              { l: 'Purpose', v: app.purpose },
            ].map(({ l, v }) => (
              <div key={l} className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">{l}</p>
                <p className="font-bold text-sm mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Applicant profile */}
          <div className="space-y-2">
            <p className="font-bold text-sm">Applicant Profile</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { l: 'Employment', v: app.employment },
                { l: 'Monthly Income', v: `₹${app.income.toLocaleString('en-IN')}` },
                { l: 'Phone', v: app.phone },
                { l: 'Applied On', v: app.appliedOn },
              ].map(({ l, v }) => (
                <div key={l} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{l}</span>
                  <span className="font-semibold text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit score */}
          <div className="bg-muted/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold">CIBIL Score</p>
              <RiskBadge level={app.riskLevel} />
            </div>
            <div className="flex items-end gap-3">
              <p className={cn('text-3xl font-black', app.creditScore >= 750 ? 'text-emerald-600 dark:text-emerald-400' : app.creditScore >= 680 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400')}>{app.creditScore}</p>
              <p className="text-sm text-muted-foreground mb-1">/ 900</p>
            </div>
            <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div className={cn('h-full rounded-full', app.creditScore >= 750 ? 'bg-emerald-500' : app.creditScore >= 680 ? 'bg-amber-500' : 'bg-red-500')}
                style={{ width: `${(app.creditScore / 900) * 100}%` }} />
            </div>
          </div>

          {app.status === 'Pending' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 gap-2 h-11"
                onClick={() => { onReject(app.id); onClose(); }}>
                <XCircle className="size-4" />Reject
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11"
                onClick={() => { onApprove(app.id); onClose(); }}>
                <CheckCircle className="size-4" />Approve
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminLoansPage() {
  const [tab, setTab] = useState<'applications' | 'portfolio' | 'analytics'>('applications');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LoanApp['status']>('all');
  const [selectedApp, setSelectedApp] = useState<LoanApp | null>(null);
  const [appStates, setAppStates] = useState<Record<string, LoanApp['status']>>({});

  const effectiveApps = useMemo(() =>
    APPS.map(a => ({ ...a, status: appStates[a.id] ?? a.status })),
    [appStates]
  );

  const filtered = useMemo(() => {
    let list = effectiveApps;
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => a.applicant.toLowerCase().includes(q) || a.refNo.toLowerCase().includes(q) || a.product.toLowerCase().includes(q));
    }
    return list;
  }, [effectiveApps, statusFilter, search]);

  const doApprove = (id: string) => {
    setAppStates(p => ({ ...p, [id]: 'Approved' }));
    toast.success('Loan application approved!');
  };
  const doReject = (id: string) => {
    setAppStates(p => ({ ...p, [id]: 'Rejected' }));
    toast.info('Loan application rejected');
  };

  const pendingCount = effectiveApps.filter(a => a.status === 'Pending').length;
  const approvedTotal = effectiveApps.filter(a => ['Approved', 'Disbursed'].includes(a.status)).reduce((s, a) => s + a.amount, 0);
  const portfolioTotal = ACTIVE_LOANS.filter(l => l.status === 'Active').reduce((s, l) => s + l.outstanding, 0);
  const overdueCount = ACTIVE_LOANS.filter(l => l.status === 'Overdue').length;

  const STAT_CARDS = [
    { label: 'Pending Applications', value: pendingCount.toString(), sub: 'awaiting review', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/20' },
    { label: 'Approved / Disbursed', value: `₹${(approvedTotal / 100000).toFixed(1)}L`, sub: 'total amount', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
    { label: 'Active Portfolio', value: `₹${(portfolioTotal / 100000).toFixed(1)}L`, sub: 'outstanding', icon: Banknote, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Overdue Accounts', value: overdueCount.toString(), sub: 'need attention', icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' },
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
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Alert for pending */}
        {pendingCount > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3">
            <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {pendingCount} loan application{pendingCount !== 1 ? 's' : ''} pending review
            </p>
            <button onClick={() => setStatusFilter('Pending')} className="ml-auto text-xs font-semibold underline text-amber-600 dark:text-amber-400">View</button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-muted/50 rounded-2xl p-1">
          {[{ key: 'applications', label: 'Applications' }, { key: 'portfolio', label: 'Active Portfolio' }, { key: 'analytics', label: 'Analytics' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={cn('flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                tab === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Applications */}
        {tab === 'applications' && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search by name, ref no, product..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'Pending', 'Approved', 'Disbursed', 'Rejected'] as const).map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className={cn('px-3 py-2 rounded-xl text-xs font-semibold transition-all h-11',
                      statusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filtered.map((app, i) => (
                <motion.div key={app.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedApp(app)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {app.applicant.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{app.applicant}</p>
                        <p className="text-xs text-muted-foreground">{app.product}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RiskBadge level={app.riskLevel} />
                      <AppStatusBadge status={app.status} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-foreground"><IndianRupee className="size-3" />₹{app.amount.toLocaleString('en-IN')}</span>
                    <span className="flex items-center gap-1">{app.tenure} months</span>
                    <span className="flex items-center gap-1">{app.interestRate}% p.a.</span>
                    <span className="flex items-center gap-1">EMI: ₹{app.emi.toLocaleString('en-IN')}</span>
                    <span className="flex items-center gap-1"><Calendar className="size-3" />{app.appliedOn}</span>
                    <span className="ml-auto font-semibold">CIBIL: {app.creditScore}</span>
                  </div>
                  {app.status === 'Pending' && (
                    <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                        onClick={() => doReject(app.id)}>
                        <XCircle className="size-3 mr-1" />Reject
                      </Button>
                      <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => doApprove(app.id)}>
                        <CheckCircle className="size-3 mr-1" />Approve
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {tab === 'portfolio' && (
          <div className="space-y-3">
            {ACTIVE_LOANS.map((loan, i) => {
              const pct = (loan.paidEmis / loan.totalEmis) * 100;
              return (
                <motion.div key={loan.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-card border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold">{loan.borrower}</p>
                      <p className="text-xs text-muted-foreground">{loan.product} · <span className="font-mono">{loan.refNo}</span></p>
                    </div>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold shrink-0',
                      loan.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      loan.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-muted text-muted-foreground')}>{loan.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { l: 'Disbursed', v: `₹${(loan.disbursed / 1000).toFixed(0)}K` },
                      { l: 'Outstanding', v: `₹${(loan.outstanding / 1000).toFixed(0)}K` },
                      { l: 'Monthly EMI', v: loan.emi > 0 ? `₹${loan.emi.toLocaleString('en-IN')}` : '—' },
                    ].map(({ l, v }) => (
                      <div key={l} className="bg-muted/40 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-muted-foreground">{l}</p>
                        <p className="font-bold text-sm mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                  {loan.totalEmis > 0 && (
                    <>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{loan.paidEmis}/{loan.totalEmis} EMIs</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div className={cn('h-full rounded-full', loan.status === 'Overdue' ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-emerald-500')}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      {loan.status !== 'Closed' && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="size-3" />Next EMI: {loan.nextEmi}
                          {loan.status === 'Overdue' && <span className="ml-1 text-red-600 dark:text-red-400 font-semibold">⚠ Overdue</span>}
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Analytics */}
        {tab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Applications by product */}
              <div className="bg-card border rounded-2xl p-5">
                <h3 className="font-bold text-sm mb-4">Applications by Product</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Medical Emergency', count: 2, color: 'bg-red-500' },
                    { name: 'Personal Health', count: 2, color: 'bg-pink-500' },
                    { name: 'ICU Care Finance', count: 1, color: 'bg-amber-500' },
                    { name: 'Family Health Credit', count: 2, color: 'bg-teal-500' },
                  ].map(({ name, count, color }) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className={cn('size-2.5 rounded-full shrink-0', color)} />
                      <span className="text-sm flex-1">{name}</span>
                      <span className="font-bold text-sm">{count}</span>
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', color)} style={{ width: `${(count / 2) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk distribution */}
              <div className="bg-card border rounded-2xl p-5">
                <h3 className="font-bold text-sm mb-4">Risk Distribution</h3>
                <div className="space-y-3">
                  {[
                    { level: 'Low', count: APPS.filter(a => a.riskLevel === 'Low').length, color: 'bg-emerald-500' },
                    { level: 'Medium', count: APPS.filter(a => a.riskLevel === 'Medium').length, color: 'bg-amber-500' },
                    { level: 'High', count: APPS.filter(a => a.riskLevel === 'High').length, color: 'bg-red-500' },
                  ].map(({ level, count, color }) => (
                    <div key={level} className="flex items-center gap-3">
                      <div className={cn('size-2.5 rounded-full shrink-0', color)} />
                      <span className="text-sm flex-1">{level} Risk</span>
                      <span className="font-bold text-sm">{count} apps</span>
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', color)} style={{ width: `${(count / APPS.length) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedApp && (
          <AppModal
            app={effectiveApps.find(a => a.id === selectedApp.id) ?? selectedApp}
            onClose={() => setSelectedApp(null)}
            onApprove={doApprove}
            onReject={doReject}
          />
        )}
      </AnimatePresence>
    </>
  );
}
