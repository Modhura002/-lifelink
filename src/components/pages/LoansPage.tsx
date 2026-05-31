'use client';
import { useSession } from 'next-auth/react';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote, X, CheckCircle, ChevronRight, ArrowLeft,
  Calculator, Clock, Percent, TrendingDown, IndianRupee,
  FileText, Zap, Heart, AlertCircle, ShieldCheck,
  CreditCard, Smartphone, Building2, Loader2, Star,
  CalendarDays, BarChart3, Users, Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';

// ── Loan products ─────────────────────────────────────────────────────────────

interface LoanProduct {
  id: string;
  name: string;
  tagline: string;
  icon: React.ElementType;
  gradient: string;
  color: string;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  interestRate: number;
  processingFee: string;
  disbursal: string;
  badge?: string;
  features: string[];
  eligibility: string[];
  documents: string[];
}

const PRODUCTS: LoanProduct[] = [
  {
    id: 'emergency', name: 'Medical Emergency Loan', tagline: 'Instant funds for emergency treatments',
    icon: Zap, gradient: 'from-red-500 to-rose-700', color: 'text-red-600 dark:text-red-400',
    minAmount: 10000, maxAmount: 500000, minTenure: 3, maxTenure: 24,
    interestRate: 11.99, processingFee: '0% (waived)', disbursal: 'Within 2 hours', badge: 'Instant',
    features: [
      'Zero processing fee for emergencies', 'Approval in under 10 minutes', 'Direct hospital disbursement',
      'No prepayment penalty', 'Flexible EMI structure', 'No collateral required',
    ],
    eligibility: ['Age 21–65 years', 'Min income ₹15,000/month', 'Credit score 650+', 'Indian resident'],
    documents: ['Aadhaar Card', 'PAN Card', 'Income proof (1 month)', 'Hospital admission letter'],
  },
  {
    id: 'personal', name: 'Personal Health Loan', tagline: 'For planned medical procedures & treatments',
    icon: Heart, gradient: 'from-pink-500 to-rose-600', color: 'text-pink-600 dark:text-pink-400',
    minAmount: 25000, maxAmount: 2000000, minTenure: 6, maxTenure: 60,
    interestRate: 10.49, processingFee: '1% of loan amount', disbursal: 'Within 24 hours', badge: 'Popular',
    features: [
      'Lowest interest rate at 10.49%', 'No hidden charges', 'Pre-approved for existing customers',
      'Top-up facility available', 'Part prepayment allowed after 6 EMIs', 'Insurance bundled option',
    ],
    eligibility: ['Age 23–60 years', 'Min income ₹20,000/month', 'Credit score 700+', 'Salaried or self-employed'],
    documents: ['Aadhaar + PAN', '3-month salary slips', 'Bank statement (6 months)', 'Medical treatment estimate'],
  },
  {
    id: 'icu', name: 'ICU Care Finance', tagline: 'Critical care financing with extended tenure',
    icon: AlertCircle, gradient: 'from-amber-500 to-orange-600', color: 'text-amber-600 dark:text-amber-400',
    minAmount: 50000, maxAmount: 5000000, minTenure: 12, maxTenure: 84,
    interestRate: 12.99, processingFee: '0.5% of loan amount', disbursal: 'Same day', badge: 'Critical Care',
    features: [
      'Up to ₹50 Lakh for critical illness', '7-year repayment tenure', 'Moratorium period of 3–6 months',
      'Step-up EMI (pay less initially)', 'Family member as co-applicant', 'Dedicated relationship manager',
    ],
    eligibility: ['Age 21–70 years', 'Min income ₹30,000/month', 'Credit score 680+', 'ICU/critical care diagnosis required'],
    documents: ['Aadhaar + PAN', 'Income proof (3 months)', 'ICU admission papers', 'Doctor certificate'],
  },
  {
    id: 'family', name: 'Family Health Credit', tagline: 'One loan to cover your entire family',
    icon: Users, gradient: 'from-teal-500 to-emerald-600', color: 'text-teal-600 dark:text-teal-400',
    minAmount: 20000, maxAmount: 3000000, minTenure: 6, maxTenure: 72,
    interestRate: 11.49, processingFee: '1.25% of loan amount', disbursal: 'Within 48 hours',
    features: [
      'Cover all family medical expenses', 'One loan, multiple beneficiaries', 'Auto-refill after 50% repayment',
      'OPD + dental + vision covered', 'Child education medical costs', 'Elder care financing',
    ],
    eligibility: ['Age 25–65 years', 'Household income ₹40,000/month', 'Credit score 700+', 'Family size 2–8 members'],
    documents: ['Aadhaar + PAN (all members)', 'Family income proof', 'Ration card / utility bill', 'Medical need summary'],
  },
];

// ── Demo active loans ─────────────────────────────────────────────────────────

interface ActiveLoan {
  id: string; loanNo: string; product: string; amount: number;
  outstanding: number; emi: number; nextEmiDate: string;
  tenure: number; paidEmis: number; status: 'Active' | 'Closed' | 'Overdue';
}

const DEMO_LOANS: ActiveLoan[] = [
  { id: 'l1', loanNo: 'LLL-2025-00421', product: 'Personal Health Loan', amount: 150000, outstanding: 88000, emi: 3280, nextEmiDate: '05 Jun 2026', tenure: 48, paidEmis: 13, status: 'Active' },
];

// ── EMI Calculator ────────────────────────────────────────────────────────────

function calcEmi(principal: number, annualRate: number, months: number): number {
  if (months === 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
}

function EmiCalculator({ defaultRate = 11.49 }: { defaultRate?: number }) {
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(24);
  const [rate, setRate] = useState(defaultRate);

  const emi = useMemo(() => calcEmi(amount, rate, tenure), [amount, tenure, rate]);
  const total = emi * tenure;
  const interest = total - amount;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="size-5 text-primary" />
        <h3 className="font-bold">EMI Calculator</h3>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Loan Amount (₹)</label>
          <input type="range" min={10000} max={5000000} step={5000} value={amount} onChange={e => setAmount(+e.target.value)} className="w-full accent-primary" />
          <p className="text-base font-black">₹{amount.toLocaleString('en-IN')}</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Tenure (months)</label>
          <input type="range" min={3} max={84} step={3} value={tenure} onChange={e => setTenure(+e.target.value)} className="w-full accent-primary" />
          <p className="text-base font-black">{tenure} months</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Interest Rate (%)</label>
          <input type="range" min={8} max={20} step={0.1} value={rate} onChange={e => setRate(+e.target.value)} className="w-full accent-primary" />
          <p className="text-base font-black">{rate.toFixed(2)}% p.a.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2 border-t">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Monthly EMI</p>
          <p className="text-xl font-black text-primary">₹{emi.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Interest</p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400">₹{interest.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Payment</p>
          <p className="text-xl font-black">₹{total.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({ product, onApply, onDetails }: { product: LoanProduct; onApply: (p: LoanProduct) => void; onDetails: (p: LoanProduct) => void }) {
  const Icon = product.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
      <div className={cn('bg-gradient-to-br p-5 text-white', product.gradient)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center"><Icon className="size-5" /></div>
            <div>
              <p className="font-bold text-sm">{product.name}</p>
              <p className="text-white/70 text-xs">{product.tagline}</p>
            </div>
          </div>
          {product.badge && <span className="bg-white/25 text-[10px] font-bold px-2 py-0.5 rounded-full">{product.badge}</span>}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/15 rounded-xl p-2">
            <p className="font-black text-sm">₹{(product.maxAmount / 100000).toFixed(0)}L</p>
            <p className="text-[10px] text-white/70">Max Loan</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2">
            <p className="font-black text-sm">{product.interestRate}%</p>
            <p className="text-[10px] text-white/70">p.a.</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2">
            <p className="font-black text-sm">{product.disbursal.split(' ').slice(0, 2).join(' ')}</p>
            <p className="text-[10px] text-white/70">Disbursal</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          {product.features.slice(0, 3).map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CheckCircle className="size-3.5 text-emerald-500 shrink-0" />
              <span className="text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => onDetails(product)}>Details</Button>
          <Button size="sm" className="flex-1 text-xs h-8 gap-1" onClick={() => onApply(product)}>
            Apply Now <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Product detail modal ──────────────────────────────────────────────────────

function ProductModal({ product, onClose, onApply }: { product: LoanProduct; onClose: () => void; onApply: () => void }) {
  const Icon = product.icon;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card rounded-3xl border shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className={cn('bg-gradient-to-br p-6 rounded-t-3xl text-white', product.gradient)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center"><Icon className="size-6" /></div>
              <div>
                <p className="font-black text-lg">{product.name}</p>
                <p className="text-white/80 text-sm">{product.tagline}</p>
              </div>
            </div>
            <button onClick={onClose} className="size-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="size-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: 'Min Amount', v: `₹${(product.minAmount / 1000).toFixed(0)}K` },
              { l: 'Max Amount', v: `₹${(product.maxAmount / 100000).toFixed(0)}L` },
              { l: 'Interest Rate', v: `${product.interestRate}% p.a.` },
              { l: 'Min Tenure', v: `${product.minTenure}m` },
              { l: 'Max Tenure', v: `${product.maxTenure}m` },
              { l: 'Disbursal', v: product.disbursal },
            ].map(({ l, v }) => (
              <div key={l} className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="font-bold text-sm">{v}</p>
                <p className="text-[10px] text-white/70 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="font-bold text-sm mb-3">Key Features</p>
            <div className="space-y-2">
              {product.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold text-sm mb-3">Eligibility</p>
            <div className="space-y-2">
              {product.eligibility.map((e, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <div className="size-1.5 rounded-full bg-primary shrink-0" />{e}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold text-sm mb-3">Documents Required</p>
            <div className="flex flex-wrap gap-2">
              {product.documents.map((d, i) => (
                <span key={i} className="bg-muted rounded-lg px-3 py-1.5 text-xs font-semibold">{d}</span>
              ))}
            </div>
          </div>
          <EmiCalculator defaultRate={product.interestRate} />
          <Button className="w-full h-12 font-bold gap-2" onClick={onApply}>
            Apply for {product.name} <ChevronRight className="size-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Application flow ──────────────────────────────────────────────────────────

type AppStep = 'amount' | 'kyc' | 'review' | 'processing' | 'approved';

function ApplicationFlow({ product, onClose, onApproved }: { product: LoanProduct; onClose: () => void; onApproved: (ref: string) => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [step, setStep] = useState<AppStep>('amount');
  const [loanAmount, setLoanAmount] = useState(product.minAmount);
  const [tenure, setTenure] = useState(product.minTenure + 12);
  const [purpose, setPurpose] = useState('');
  const [employment, setEmployment] = useState('');
  const [income, setIncome] = useState('');
  const [panNum, setPanNum] = useState('');
  const [refId, setRefId] = useState('');

  const emi = useMemo(() => calcEmi(loanAmount, product.interestRate, tenure), [loanAmount, tenure, product.interestRate]);
  const Icon = product.icon;

  const handleSubmit = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2800));
    const ref = `LLL-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    setRefId(ref);
    useUIStore.getState().addNotification({
      title: 'Loan Application Approved!',
      message: `Your ${product.name} of ₹${loanAmount.toLocaleString('en-IN')} has been approved. Ref: ${ref}. Disbursement: ${product.disbursal}.`,
      type: 'SYSTEM',
    });
    setStep('approved');
    onApproved(ref);
  };

  if (step === 'processing') return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card rounded-3xl border shadow-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className={cn('size-20 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white', product.gradient)}>
          <Icon className="size-10" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black mb-2">Reviewing Application</h3>
          <p className="text-muted-foreground text-sm">Verifying your details and running credit checks...</p>
        </div>
        <div className="w-full space-y-2">
          {['Identity verification', 'Credit score check', 'Income validation', 'Final approval'].map((s, i) => (
            <div key={s} className="flex items-center gap-3 text-sm">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.5 + 0.3 }}
                className="size-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle className="size-3 text-white" />
              </motion.div>
              <span className="text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  if (step === 'approved') return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="bg-card rounded-3xl border shadow-2xl p-8 text-center space-y-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <CheckCircle className="size-10 text-emerald-500" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-black text-emerald-600">Loan Approved!</h2>
          <p className="text-muted-foreground text-sm mt-1">Amount will be disbursed {product.disbursal.toLowerCase()}.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-muted/50 rounded-2xl p-4 text-left space-y-2.5">
          {[
            { l: 'Reference No.', v: refId },
            { l: 'Loan Product', v: product.name },
            { l: 'Approved Amount', v: `₹${loanAmount.toLocaleString('en-IN')}` },
            { l: 'EMI', v: `₹${emi.toLocaleString('en-IN')} × ${tenure} months` },
            { l: 'Interest Rate', v: `${product.interestRate}% p.a.` },
            { l: 'Disbursal', v: product.disbursal },
          ].map(({ l, v }) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
        </motion.div>
        <Button className="w-full h-12 font-bold" onClick={onClose}>View My Loans</Button>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card rounded-3xl border shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {step !== 'amount' && (
            <button onClick={() => setStep(step === 'review' ? 'kyc' : 'amount')} className="size-8 rounded-full hover:bg-muted flex items-center justify-center">
              <ArrowLeft className="size-4" />
            </button>
          )}
          <div className={step !== 'amount' ? '' : 'flex-1'}>
            <p className="font-bold text-sm">{step === 'amount' ? 'Choose Amount' : step === 'kyc' ? 'Your Details' : 'Review & Submit'}</p>
            <p className="text-xs text-muted-foreground">{product.name}</p>
          </div>
          <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-1.5">
          {['amount', 'kyc', 'review'].map((s, i) => (
            <div key={s} className={cn('h-1 flex-1 rounded-full transition-all',
              ['amount', 'kyc', 'review'].indexOf(step) >= i ? 'bg-primary' : 'bg-muted')} />
          ))}
        </div>

        <div className="p-6 space-y-5">
          {step === 'amount' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Loan Amount</label>
                <input type="range" min={product.minAmount} max={product.maxAmount} step={5000} value={loanAmount}
                  onChange={e => setLoanAmount(+e.target.value)} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{(product.minAmount / 1000).toFixed(0)}K</span>
                  <span className="text-2xl font-black text-primary">₹{loanAmount.toLocaleString('en-IN')}</span>
                  <span>₹{(product.maxAmount / 100000).toFixed(0)}L</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Repayment Tenure</label>
                <input type="range" min={product.minTenure} max={product.maxTenure} step={3} value={tenure}
                  onChange={e => setTenure(+e.target.value)} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{product.minTenure}m</span>
                  <span className="text-lg font-black">{tenure} months</span>
                  <span>{product.maxTenure}m</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-2xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Your Monthly EMI</p>
                <p className="text-3xl font-black text-primary">₹{emi.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-1">@ {product.interestRate}% p.a. · {tenure} months</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Purpose of Loan</label>
                <select value={purpose} onChange={e => setPurpose(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select purpose</option>
                  {['Emergency treatment', 'Surgery', 'ICU/Critical care', 'OPD & consultation', 'Dental work', 'Fertility treatment', 'Senior care', 'Maternity expenses'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <Button className="w-full h-12 font-bold gap-2" disabled={!purpose} onClick={() => setStep('kyc')}>
                Continue <ChevronRight className="size-4" />
              </Button>
            </>
          )}

          {step === 'kyc' && (
            <>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Full Name</label>
                  <Input value={user?.name ?? ''} readOnly className="h-11 rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Employment Type</label>
                  <select value={employment} onChange={e => setEmployment(e.target.value)}
                    className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select type</option>
                    {['Salaried (Private)', 'Salaried (Government)', 'Self-Employed', 'Business Owner', 'Freelancer', 'Retired'].map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Monthly Income (₹)</label>
                  <Input type="number" placeholder="e.g. 45000" value={income} onChange={e => setIncome(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">PAN Number</label>
                  <Input placeholder="ABCDE1234F" value={panNum} onChange={e => setPanNum(e.target.value.toUpperCase().slice(0, 10))} className="h-11 rounded-xl font-mono" />
                </div>
              </div>
              <Button className="w-full h-12 font-bold gap-2" disabled={!employment || !income || panNum.length < 10} onClick={() => setStep('review')}>
                Review Application <ChevronRight className="size-4" />
              </Button>
            </>
          )}

          {step === 'review' && (
            <>
              <div className="bg-muted/40 rounded-2xl p-4 space-y-2.5">
                {[
                  { l: 'Product', v: product.name },
                  { l: 'Loan Amount', v: `₹${loanAmount.toLocaleString('en-IN')}` },
                  { l: 'Tenure', v: `${tenure} months` },
                  { l: 'Interest Rate', v: `${product.interestRate}% p.a.` },
                  { l: 'Monthly EMI', v: `₹${emi.toLocaleString('en-IN')}` },
                  { l: 'Processing Fee', v: product.processingFee },
                  { l: 'Disbursal', v: product.disbursal },
                  { l: 'Purpose', v: purpose },
                ].map(({ l, v }) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-bold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">By submitting, you authorise LifeLink to verify your CIBIL score and initiate disbursement on approval.</p>
              </div>
              <Button className="w-full h-12 font-bold gap-2" onClick={handleSubmit}>
                <Banknote className="size-4" />Submit Application
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LoansPage() {
  const [tab, setTab] = useState<'products' | 'my-loans' | 'calculator'>('products');
  const [detailProduct, setDetailProduct] = useState<LoanProduct | null>(null);
  const [applyProduct, setApplyProduct] = useState<LoanProduct | null>(null);
  const [myLoans] = useState<ActiveLoan[]>(DEMO_LOANS);

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 size-48 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-20 size-32 rounded-full bg-white/5 translate-y-8" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center"><Banknote className="size-6" /></div>
              <div>
                <h1 className="text-xl font-black">LifeLink Health Finance</h1>
                <p className="text-white/80 text-sm">Zero-worry funding for your healthcare</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: '₹50L', l: 'Max Loan' }, { v: '10.49%', l: 'Starting Rate' }, { v: '2 hrs', l: 'Fast Disbursal' }].map(({ v, l }) => (
                <div key={l} className="bg-white/15 rounded-2xl p-3 text-center">
                  <p className="text-lg font-black">{v}</p>
                  <p className="text-[10px] text-white/70">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted/50 rounded-2xl p-1">
          {[{ key: 'products', label: 'Loan Products' }, { key: 'my-loans', label: 'My Loans' }, { key: 'calculator', label: 'EMI Calculator' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={cn('flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                tab === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Products */}
        {tab === 'products' && (
          <div className="grid gap-4 md:grid-cols-2">
            {PRODUCTS.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <ProductCard product={p} onApply={setApplyProduct} onDetails={setDetailProduct} />
              </motion.div>
            ))}
          </div>
        )}

        {/* My Loans */}
        {tab === 'my-loans' && (
          <div className="space-y-4 max-w-lg mx-auto">
            {myLoans.length > 0 ? myLoans.map((loan, i) => {
              const paidPct = (loan.paidEmis / loan.tenure) * 100;
              return (
                <motion.div key={loan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-card border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{loan.product}</p>
                      <p className="text-xs text-muted-foreground font-mono">{loan.loanNo}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold">{loan.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: 'Loan Amount', v: `₹${(loan.amount / 1000).toFixed(0)}K` },
                      { l: 'Outstanding', v: `₹${(loan.outstanding / 1000).toFixed(0)}K` },
                      { l: 'Monthly EMI', v: `₹${loan.emi.toLocaleString('en-IN')}` },
                    ].map(({ l, v }) => (
                      <div key={l} className="bg-muted/40 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-muted-foreground">{l}</p>
                        <p className="font-bold text-sm mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{loan.paidEmis} of {loan.tenure} EMIs paid</span>
                      <span>{paidPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${paidPct}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <span className="flex items-center gap-1"><CalendarDays className="size-3" />Next EMI: {loan.nextEmiDate}</span>
                    <Button size="sm" className="h-7 text-xs gap-1">Pay EMI <ChevronRight className="size-3" /></Button>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="text-center py-16">
                <Banknote className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-bold text-muted-foreground">No active loans</p>
                <Button className="mt-4" onClick={() => setTab('products')}>Apply for a Loan</Button>
              </div>
            )}
          </div>
        )}

        {/* Calculator */}
        {tab === 'calculator' && (
          <div className="max-w-2xl mx-auto">
            <EmiCalculator />
          </div>
        )}
      </div>

      <AnimatePresence>
        {detailProduct && <ProductModal product={detailProduct} onClose={() => setDetailProduct(null)} onApply={() => { setApplyProduct(detailProduct); setDetailProduct(null); }} />}
        {applyProduct && <ApplicationFlow product={applyProduct} onClose={() => setApplyProduct(null)} onApproved={(ref) => { toast.success('Loan approved!', { description: `Ref: ${ref}` }); }} />}
      </AnimatePresence>
    </>
  );
}
