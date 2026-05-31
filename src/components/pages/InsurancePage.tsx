'use client';
import { useSession } from 'next-auth/react';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, X, CheckCircle, ChevronRight, Star,
  Heart, Zap, Crown, Users, FileText, Clock,
  AlertCircle, Phone, IndianRupee, Calendar, Download,
  Building2, Stethoscope, Ambulance, Eye, Pill,
  CreditCard, Smartphone, Wallet, ArrowLeft, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';

// ── Plans ─────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPremium: number;
  annualPremium: number;
  coverageAmount: number;
  color: string;
  gradient: string;
  icon: React.ElementType;
  badge?: string;
  features: string[];
  cashlessHospitals: number;
  preExisting: string;
  maternity: boolean;
  dental: boolean;
  vision: boolean;
  roomRent: string;
  ambulance: string;
  daycare: boolean;
  restoration: boolean;
  healthCheckup: string;
  noClaimBonus: string;
}

const PLANS: Plan[] = [
  {
    id: 'basic', name: 'LifeLink Basic', tagline: 'Essential protection for individuals',
    monthlyPremium: 499, annualPremium: 5388, coverageAmount: 300000,
    color: 'text-sky-600 dark:text-sky-400', gradient: 'from-sky-500 to-blue-600',
    icon: Heart, features: [
      '₹3 Lakh sum insured', 'Cashless at 3,000+ hospitals', 'Pre & post hospitalization', 'Day-care procedures (100+)',
      'Free annual health checkup', 'Ambulance cover up to ₹2,000', '30-day waiting period only',
    ],
    cashlessHospitals: 3000, preExisting: '2 years', maternity: false, dental: false, vision: false,
    roomRent: 'Single AC room', ambulance: '₹2,000/trip', daycare: true, restoration: false,
    healthCheckup: 'Once a year', noClaimBonus: '5% per year (max 50%)',
  },
  {
    id: 'silver', name: 'LifeLink Silver', tagline: 'Enhanced cover with added benefits',
    monthlyPremium: 899, annualPremium: 9588, coverageAmount: 500000,
    color: 'text-slate-600 dark:text-slate-300', gradient: 'from-slate-400 to-slate-600',
    icon: Zap, badge: 'Popular', features: [
      '₹5 Lakh sum insured', 'Cashless at 5,500+ hospitals', 'Maternity cover (₹50,000)', 'OPD cover up to ₹5,000/year',
      'Mental health consultations', '2 free annual checkups', 'No room rent limit', 'Pre-existing from year 1',
    ],
    cashlessHospitals: 5500, preExisting: '1 year', maternity: true, dental: false, vision: true,
    roomRent: 'Any private room', ambulance: '₹3,500/trip', daycare: true, restoration: true,
    healthCheckup: 'Twice a year', noClaimBonus: '10% per year (max 100%)',
  },
  {
    id: 'gold', name: 'LifeLink Gold', tagline: 'Comprehensive coverage for your whole family',
    monthlyPremium: 1599, annualPremium: 17388, coverageAmount: 1000000,
    color: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-400 to-orange-600',
    icon: Crown, badge: 'Best Value', features: [
      '₹10 Lakh sum insured', 'Cashless at 8,000+ hospitals', 'Maternity + newborn cover', 'Dental & vision included',
      'International emergency cover', '4 free health checkups', 'Home healthcare', 'Restoration benefit (100%)',
      'OPD + medicines covered', 'Mental wellness program',
    ],
    cashlessHospitals: 8000, preExisting: 'Covered from day 1', maternity: true, dental: true, vision: true,
    roomRent: 'Suite/deluxe room', ambulance: 'Unlimited', daycare: true, restoration: true,
    healthCheckup: 'Quarterly', noClaimBonus: '20% per year (max 100%)',
  },
  {
    id: 'platinum', name: 'LifeLink Platinum', tagline: 'Premium protection, zero compromises',
    monthlyPremium: 2999, annualPremium: 32388, coverageAmount: 2500000,
    color: 'text-violet-600 dark:text-violet-400', gradient: 'from-violet-500 to-purple-700',
    icon: Star, badge: 'Premium', features: [
      '₹25 Lakh sum insured', 'Global cashless network (50+ countries)', 'Unlimited restoration', 'Wellness & preventive care',
      'Personal health manager', '24/7 doctor on call', 'Air ambulance cover', 'Critical illness lumpsum',
      'Bariatric surgery covered', 'Robotic surgery included', 'Fertility treatments', 'Annual concierge health plan',
    ],
    cashlessHospitals: 15000, preExisting: 'No waiting period', maternity: true, dental: true, vision: true,
    roomRent: 'Premium suite, no limit', ambulance: 'Air ambulance included', daycare: true, restoration: true,
    healthCheckup: 'Monthly & executive', noClaimBonus: '25% per year (max 100%)',
  },
  {
    id: 'family', name: 'LifeLink Family', tagline: 'One plan, entire family covered',
    monthlyPremium: 2199, annualPremium: 23988, coverageAmount: 1500000,
    color: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-teal-600',
    icon: Users, badge: 'Family', features: [
      '₹15 Lakh floater sum insured', 'Cover up to 6 family members', 'All-ages maternity cover', 'Paediatric care included',
      'Senior parent cover (upto 70 yrs)', 'Home care nursing', '5 free health checkups', 'Dental for all members',
      'Mental health for all', 'School accident cover for children',
    ],
    cashlessHospitals: 8000, preExisting: '1 year', maternity: true, dental: true, vision: true,
    roomRent: 'Private AC room', ambulance: '₹5,000/trip', daycare: true, restoration: true,
    healthCheckup: 'Twice/member/year', noClaimBonus: '15% per year (max 100%)',
  },
];

// ── Demo claims ───────────────────────────────────────────────────────────────

interface Claim {
  id: string; claimNo: string; date: string; type: string; hospital: string;
  amount: number; status: 'Approved' | 'Under Review' | 'Rejected' | 'Settled';
}

const DEMO_CLAIMS: Claim[] = [
  { id: 'c1', claimNo: 'CLM-2026-00841', date: '15 Mar 2026', type: 'Hospitalisation', hospital: 'Apollo Hospitals, Delhi', amount: 48500, status: 'Settled' },
  { id: 'c2', claimNo: 'CLM-2026-01233', date: '02 Apr 2026', type: 'Day-care Procedure', hospital: 'Max Healthcare, Gurugram', amount: 12000, status: 'Approved' },
  { id: 'c3', claimNo: 'CLM-2026-01890', date: '19 May 2026', type: 'OPD / Consultation', hospital: 'Online via LifeLink', amount: 2400, status: 'Under Review' },
];

// ── Claim status badge ────────────────────────────────────────────────────────

function ClaimBadge({ status }: { status: Claim['status'] }) {
  const MAP = {
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Settled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  return <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', MAP[status])}>{status}</span>;
}

// ── Plan detail modal ─────────────────────────────────────────────────────────

function PlanModal({ plan, onClose, onSubscribe }: { plan: Plan; onClose: () => void; onSubscribe: (plan: Plan) => void }) {
  const Icon = plan.icon;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="bg-card rounded-3xl border shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Hero */}
        <div className={cn('bg-gradient-to-br p-6 rounded-t-3xl text-white', plan.gradient)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"><Icon className="size-6" /></div>
              <div>
                <p className="font-black text-lg">{plan.name}</p>
                <p className="text-white/80 text-sm">{plan.tagline}</p>
              </div>
            </div>
            <button onClick={onClose} className="size-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black">₹{(plan.coverageAmount / 100000).toFixed(0)}L</p>
              <p className="text-xs text-white/80">Sum Insured</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black">₹{plan.monthlyPremium.toLocaleString('en-IN')}</p>
              <p className="text-xs text-white/80">per month</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Key features */}
          <div>
            <p className="font-bold text-sm mb-3">What's Covered</p>
            <div className="space-y-2">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Cashless Hospitals', value: `${plan.cashlessHospitals.toLocaleString()}+`, icon: Building2 },
              { label: 'Pre-existing Cover', value: plan.preExisting, icon: Clock },
              { label: 'Room Rent', value: plan.roomRent, icon: Stethoscope },
              { label: 'Ambulance', value: plan.ambulance, icon: Ambulance },
              { label: 'Health Checkup', value: plan.healthCheckup, icon: Heart },
              { label: 'No-Claim Bonus', value: plan.noClaimBonus, icon: Star },
            ].map(({ label, value, icon: Ic }) => (
              <div key={label} className="bg-muted/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Ic className="size-3.5 text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                </div>
                <p className="text-xs font-bold leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {plan.maternity && <Badge variant="secondary" className="text-xs gap-1"><Heart className="size-3" />Maternity</Badge>}
            {plan.dental && <Badge variant="secondary" className="text-xs gap-1"><Stethoscope className="size-3" />Dental</Badge>}
            {plan.vision && <Badge variant="secondary" className="text-xs gap-1"><Eye className="size-3" />Vision</Badge>}
            {plan.daycare && <Badge variant="secondary" className="text-xs gap-1"><Pill className="size-3" />Day-care</Badge>}
            {plan.restoration && <Badge variant="secondary" className="text-xs gap-1"><Zap className="size-3" />Restoration</Badge>}
          </div>

          <Button className="w-full h-12 text-base font-bold gap-2" onClick={() => onSubscribe(plan)}>
            Subscribe — ₹{plan.monthlyPremium.toLocaleString('en-IN')}/mo
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Subscribe flow ────────────────────────────────────────────────────────────

type SubStep = 'details' | 'payment' | 'processing' | 'confirmed';

function SubscribeFlow({ plan, onClose, onSuccess }: { plan: Plan; onClose: () => void; onSuccess: (plan: Plan) => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [step, setStep] = useState<SubStep>('details');
  const [dob, setDob] = useState('');
  const [members, setMembers] = useState('1');
  const [payMode, setPayMode] = useState<'annual' | 'monthly'>('annual');
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [policyId, setPolicyId] = useState('');

  const premium = payMode === 'annual' ? plan.annualPremium : plan.monthlyPremium;
  const savings = payMode === 'annual' ? plan.monthlyPremium * 12 - plan.annualPremium : 0;
  const Icon = plan.icon;

  const handlePay = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2500));
    const pid = `LLINS-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    setPolicyId(pid);
    useUIStore.getState().addNotification({
      title: 'Insurance Subscribed!',
      message: `Your ${plan.name} policy (ID: ${pid}) is now active. Coverage: ₹${(plan.coverageAmount / 100000).toFixed(0)} Lakh.`,
      type: 'SYSTEM',
    });
    setStep('confirmed');
    onSuccess(plan);
  };

  if (step === 'processing') return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card rounded-3xl border shadow-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className={cn('size-20 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white', plan.gradient)}>
          <Icon className="size-10" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black mb-2">Activating Policy</h3>
          <p className="text-muted-foreground text-sm">Verifying your details and processing payment...</p>
        </div>
        <div className="flex gap-1.5">{[0,1,2].map(i => (
          <motion.div key={i} className="size-2.5 rounded-full bg-primary" animate={{ y: [0,-8,0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }} />
        ))}</div>
      </motion.div>
    </motion.div>
  );

  if (step === 'confirmed') return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="bg-card rounded-3xl border shadow-2xl p-8 text-center space-y-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <ShieldCheck className="size-10 text-emerald-500" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-black text-emerald-600">Policy Activated!</h2>
          <p className="text-muted-foreground text-sm mt-1">You're now protected under {plan.name}.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-muted/50 rounded-2xl p-4 text-left space-y-2.5">
          {[
            { l: 'Policy ID', v: policyId },
            { l: 'Plan', v: plan.name },
            { l: 'Sum Insured', v: `₹${(plan.coverageAmount / 100000).toFixed(0)} Lakh` },
            { l: 'Premium', v: `₹${premium.toLocaleString('en-IN')} / ${payMode === 'annual' ? 'year' : 'month'}` },
            { l: 'Renewal Date', v: payMode === 'annual' ? 'May 2027' : 'June 2026' },
          ].map(({ l, v }) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
        </motion.div>
        <Button className="w-full h-12 font-bold" onClick={onClose}>View My Policy</Button>
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
          {step !== 'details' && (
            <button onClick={() => setStep('details')} className="size-8 rounded-full hover:bg-muted flex items-center justify-center">
              <ArrowLeft className="size-4" />
            </button>
          )}
          <div className={step !== 'details' ? '' : 'flex-1'}>
            <p className="font-bold text-sm">{step === 'details' ? 'Subscription Details' : 'Payment'}</p>
            <p className="text-xs text-muted-foreground">{plan.name}</p>
          </div>
          <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === 'details' && (
            <>
              {/* Payment frequency */}
              <div>
                <p className="text-sm font-semibold mb-2">Payment Frequency</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['annual', 'monthly'] as const).map(m => (
                    <button key={m} onClick={() => setPayMode(m)}
                      className={cn('p-4 rounded-2xl border-2 text-left transition-all', payMode === m ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30')}>
                      <p className={cn('font-bold text-sm capitalize', payMode === m ? 'text-primary' : '')}>{m}</p>
                      <p className="text-lg font-black mt-0.5">₹{(m === 'annual' ? plan.annualPremium : plan.monthlyPremium).toLocaleString('en-IN')}</p>
                      {m === 'annual' && <p className="text-xs text-emerald-600 font-semibold mt-0.5">Save ₹{savings.toLocaleString('en-IN')}</p>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Members */}
              <div className="space-y-1">
                <label className="text-sm font-semibold">Number of Members</label>
                <select value={members} onChange={e => setMembers(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {['1','2','3','4','5','6'].map(n => <option key={n} value={n}>{n} member{n !== '1' ? 's' : ''}</option>)}
                </select>
              </div>

              {/* DOB */}
              <div className="space-y-1">
                <label className="text-sm font-semibold">Primary Member Date of Birth</label>
                <Input type="date" value={dob} onChange={e => setDob(e.target.value)} className="h-11 rounded-xl" />
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">What you get immediately</span>
                </div>
                <ul className="space-y-1">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle className="size-3 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full h-12 font-bold gap-2" onClick={() => setStep('payment')}>
                Continue to Payment <ChevronRight className="size-4" />
              </Button>
            </>
          )}

          {step === 'payment' && (
            <>
              {/* Method selector */}
              <div>
                <p className="text-sm font-semibold mb-3">Choose Payment Method</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'upi', label: 'UPI', icon: Smartphone },
                    { key: 'card', label: 'Card', icon: CreditCard },
                    { key: 'netbanking', label: 'Net Banking', icon: Building2 },
                  ].map(({ key, label, icon: Ic }) => (
                    <button key={key} onClick={() => setPayMethod(key as typeof payMethod)}
                      className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold',
                        payMethod === key ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30')}>
                      <Ic className="size-5" />{label}
                    </button>
                  ))}
                </div>
              </div>

              {payMethod === 'upi' && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold">UPI ID</label>
                  <Input placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} className="h-11 rounded-xl" />
                </div>
              )}
              {payMethod === 'card' && (
                <div className="space-y-3">
                  <Input placeholder="Card Number" value={cardNum} onChange={e => setCardNum(e.target.value.slice(0,16))} className="h-11 rounded-xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value.slice(0,5))} className="h-11 rounded-xl" />
                    <Input placeholder="CVV" type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.slice(0,4))} className="h-11 rounded-xl" />
                  </div>
                </div>
              )}
              {payMethod === 'netbanking' && (
                <select className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'Bank of Baroda'].map(b => <option key={b}>{b}</option>)}
                </select>
              )}

              <div className="bg-muted/40 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Plan</span><span className="font-bold">{plan.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Premium</span><span className="font-bold">₹{premium.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Frequency</span><span className="font-bold capitalize">{payMode}</span></div>
                {savings > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Annual Savings</span><span className="font-bold text-emerald-600 dark:text-emerald-400">-₹{savings.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between text-sm border-t pt-2.5"><span className="font-bold">Total Due</span><span className="font-black text-base">₹{premium.toLocaleString('en-IN')}</span></div>
              </div>

              <Button className="w-full h-12 font-bold gap-2" onClick={handlePay}>
                <ShieldCheck className="size-4" />Activate Policy — ₹{premium.toLocaleString('en-IN')}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── File claim modal ──────────────────────────────────────────────────────────

function FileClaimModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');
  const [claimType, setClaimType] = useState('');
  const [hospital, setHospital] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [claimNo, setClaimNo] = useState('');

  const handleSubmit = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2200));
    setClaimNo(`CLM-2026-0${Date.now().toString().slice(-4)}`);
    setStep('done');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={step === 'done' ? onClose : undefined}>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card rounded-3xl border shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>

        {step === 'processing' && (
          <div className="p-10 flex flex-col items-center gap-5">
            <Loader2 className="size-10 text-primary animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-black">Submitting Claim</h3>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we register your claim...</p>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="p-8 text-center space-y-5">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="size-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-emerald-600">Claim Registered!</h3>
              <p className="text-sm text-muted-foreground mt-1">Our team will review your claim within 48 hours.</p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Claim No.</span><span className="font-bold text-primary">{claimNo}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="font-bold">{claimType}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-bold">₹{parseInt(amount || '0').toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="font-bold text-amber-600">Under Review</span></div>
            </div>
            <Button className="w-full h-11" onClick={onClose}>Done</Button>
          </div>
        )}

        {step === 'form' && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <p className="font-bold">File a Claim</p>
                <p className="text-xs text-muted-foreground">Fill in the details below</p>
              </div>
              <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Claim Type</label>
                <select value={claimType} onChange={e => setClaimType(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select type</option>
                  {['Hospitalisation', 'Day-care Procedure', 'OPD / Consultation', 'Maternity', 'Dental', 'Vision', 'Ambulance', 'Home Care'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Hospital / Provider Name</label>
                <Input placeholder="e.g. Apollo Hospitals, Delhi" value={hospital} onChange={e => setHospital(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Claim Amount (₹)</label>
                <Input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Brief description of treatment / procedure..."
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-4 text-center">
                <Download className="size-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Upload bills / discharge summary <span className="text-primary font-semibold cursor-pointer">(browse)</span></p>
              </div>
              <Button className="w-full h-12 font-bold gap-2" disabled={!claimType || !hospital || !amount} onClick={handleSubmit}>
                <FileText className="size-4" />Submit Claim
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InsurancePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [subscribePlan, setSubscribePlan] = useState<Plan | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(PLANS[1]); // Demo: Silver active
  const [showClaims, setShowClaims] = useState(false);
  const [showFileClaim, setShowFileClaim] = useState(false);
  const [tab, setTab] = useState<'plans' | 'my-policy' | 'claims'>('plans');

  const TAB_LABELS = [
    { key: 'plans', label: 'Browse Plans' },
    { key: 'my-policy', label: 'My Policy' },
    { key: 'claims', label: 'Claims History' },
  ] as const;

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 size-48 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-20 size-32 rounded-full bg-white/5 translate-y-8" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center"><ShieldCheck className="size-6" /></div>
              <div>
                <h1 className="text-xl font-black">LifeLink Health Insurance</h1>
                <p className="text-white/80 text-sm">Your health, fully protected</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: '5,000+', l: 'Network Hospitals' }, { v: '₹25L', l: 'Max Coverage' }, { v: '15 min', l: 'Claim Settlement' }].map(({ v, l }) => (
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
          {TAB_LABELS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={cn('flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                tab === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Plans tab */}
        {tab === 'plans' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              const isActive = activePlan?.id === plan.id;
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className={cn('bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group',
                    isActive && 'ring-2 ring-primary')}>
                  <div className={cn('bg-gradient-to-br p-5 text-white', plan.gradient)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center"><Icon className="size-5" /></div>
                        <div>
                          <p className="font-bold text-sm">{plan.name}</p>
                          <p className="text-white/70 text-xs">{plan.tagline}</p>
                        </div>
                      </div>
                      {plan.badge && <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{plan.badge}</span>}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-black">₹{(plan.coverageAmount / 100000).toFixed(0)}L</p>
                        <p className="text-white/70 text-xs">Sum Insured</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black">₹{plan.monthlyPremium.toLocaleString('en-IN')}</p>
                        <p className="text-white/70 text-xs">per month</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="space-y-1.5">
                      {plan.features.slice(0, 3).map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="size-3.5 text-emerald-500 shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setSelectedPlan(plan)}>Details</Button>
                      {isActive ? (
                        <Button size="sm" variant="secondary" className="flex-1 text-xs h-8 gap-1" disabled>
                          <CheckCircle className="size-3" />Active
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1 text-xs h-8" onClick={() => setSubscribePlan(plan)}>Subscribe</Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* My Policy tab */}
        {tab === 'my-policy' && (
          <div className="space-y-4 max-w-lg mx-auto">
            {activePlan ? (
              <>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={cn('bg-gradient-to-br rounded-3xl p-6 text-white', activePlan.gradient)}>
                  {(() => { const I = activePlan.icon; return (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center"><I className="size-7" /></div>
                      <div>
                        <p className="text-xl font-black">{activePlan.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                          <p className="text-white/80 text-sm">Active · Policy No. LLINS-A8F2X4K1</p>
                        </div>
                      </div>
                    </div>
                  ); })()}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: 'Sum Insured', v: `₹${(activePlan.coverageAmount / 100000).toFixed(0)} Lakh` },
                      { l: 'Monthly Premium', v: `₹${activePlan.monthlyPremium.toLocaleString('en-IN')}` },
                      { l: 'Cashless Hospitals', v: `${activePlan.cashlessHospitals.toLocaleString()}+` },
                      { l: 'Policy Expires', v: 'May 28, 2027' },
                    ].map(({ l, v }) => (
                      <div key={l} className="bg-white/15 rounded-xl p-3">
                        <p className="text-xs text-white/70">{l}</p>
                        <p className="font-bold mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Claims this year', value: '2', sub: '₹60,500 settled', color: 'text-primary' },
                    { label: 'Remaining Cover', value: `₹${((activePlan.coverageAmount - 60500) / 100000).toFixed(1)}L`, sub: 'of ₹'+(activePlan.coverageAmount/100000).toFixed(0)+'L total', color: 'text-emerald-600 dark:text-emerald-400' },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="bg-card border rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className={cn('text-2xl font-black mt-0.5', color)}>{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2 h-11" onClick={() => setShowFileClaim(true)}>
                    <FileText className="size-4" />File a Claim
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 h-11" onClick={() => setTab('claims')}>
                    <Clock className="size-4" />View Claims
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-2xl p-4 flex items-start gap-3">
                  <Phone className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">24/7 Claims Helpline</p>
                    <p className="text-xs text-muted-foreground mt-0.5">1800-200-9900 (toll-free) · claims@lifelink.app</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <ShieldCheck className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-bold text-muted-foreground">No Active Policy</p>
                <p className="text-sm text-muted-foreground mt-1">Subscribe to a plan to get covered.</p>
                <Button className="mt-4" onClick={() => setTab('plans')}>Browse Plans</Button>
              </div>
            )}
          </div>
        )}

        {/* Claims tab */}
        {tab === 'claims' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <p className="font-bold">Claims History</p>
              <Button size="sm" className="gap-2 h-8" onClick={() => setShowFileClaim(true)}>
                <FileText className="size-3.5" />New Claim
              </Button>
            </div>
            {DEMO_CLAIMS.map((claim, i) => (
              <motion.div key={claim.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-card border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm">{claim.type}</p>
                    <p className="text-xs text-muted-foreground">{claim.hospital}</p>
                  </div>
                  <ClaimBadge status={claim.status} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="font-black text-lg flex items-center gap-1"><IndianRupee className="size-4" />{claim.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" />{claim.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-muted-foreground">{claim.claimNo}</p>
                    <button className="text-xs text-primary font-semibold mt-0.5 flex items-center gap-0.5 ml-auto">
                      Details <ChevronRight className="size-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {DEMO_CLAIMS.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="size-10 mx-auto mb-3" />
                <p className="font-semibold">No claims yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPlan && <PlanModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onSubscribe={(p) => { setSelectedPlan(null); setSubscribePlan(p); }} />}
        {subscribePlan && <SubscribeFlow plan={subscribePlan} onClose={() => setSubscribePlan(null)} onSuccess={(p) => { setActivePlan(p); toast.success(`${p.name} activated!`); }} />}
        {showFileClaim && <FileClaimModal onClose={() => setShowFileClaim(false)} />}
      </AnimatePresence>
    </>
  );
}
