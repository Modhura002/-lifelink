'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Heart, Mail, Lock, User, Phone, ShieldCheck, Check,
  X, CircleCheckBig, PartyPopper, Truck, Building2, Shield, KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigationStore } from '@/store';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

interface RoleConfig {
  id: Role;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  features: string[];
}

const ROLE_CONFIGS: RoleConfig[] = [
  {
    id: 'PATIENT',
    label: 'Patient',
    description: 'Access emergency services, track ambulances, manage your health profile',
    icon: Heart,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 to-teal-600/10',
    borderColor: 'border-emerald-500/40',
    features: ['SOS Emergency Button', 'Real-time Ambulance Tracking', 'Medical Records', 'AI Health Assistant'],
  },
  {
    id: 'DRIVER',
    label: 'Ambulance Driver',
    description: 'Manage emergency assignments, track your vehicle, update your availability',
    icon: Truck,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/10 to-orange-600/10',
    borderColor: 'border-amber-500/40',
    features: ['Emergency Assignments', 'Live Navigation', 'Earnings Dashboard', 'Vehicle Management'],
  },
  {
    id: 'HOSPITAL_STAFF',
    label: 'Hospital Staff',
    description: 'Manage emergency queue, patient intake, and hospital resources',
    icon: Building2,
    gradient: 'from-sky-500 to-blue-600',
    bgGradient: 'from-sky-500/10 to-blue-600/10',
    borderColor: 'border-sky-500/40',
    features: ['Emergency Queue', 'Patient Intake', 'Bed Management', 'Resource Tracking'],
  },
  {
    id: 'ADMIN',
    label: 'Administrator',
    description: 'Full access to LifeLink management console and system oversight',
    icon: Shield,
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/10 to-purple-600/10',
    borderColor: 'border-violet-500/40',
    features: ['System Management', 'User Administration', 'Analytics & Reports', 'Full Console Access'],
  },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  adminCode: string;
}

const INITIAL_FORM: FormData = {
  name: '', email: '', phone: '', password: '', confirmPassword: '', adminCode: ''
};

function validateAccountStep(data: FormData, role: Role): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = 'Full name is required';
  else if (data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  
  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email';
  
  if (!data.phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^[+]?[\d\s-]{10,15}$/.test(data.phone.replace(/\s/g, '')))
    errors.phone = 'Please enter a valid phone number';
    
  if (!data.password) errors.password = 'Password is required';
  else if (data.password.length < 8) errors.password = 'Password must be at least 8 characters';
  
  if (!data.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (role === 'ADMIN' && !data.adminCode.trim()) {
    errors.adminCode = 'Admin invite code is required';
  }

  return errors;
}

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '', bgColor: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500', bgColor: 'bg-red-500/10 text-red-600 dark:text-red-400' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500', bgColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-amber-500', bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500', bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
}

function ValidationIndicator({ status }: { status: 'valid' | 'invalid' | 'empty' }) {
  if (status === 'empty') return <div className="size-4" />;
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="size-4 flex items-center justify-center shrink-0">
      {status === 'valid'
        ? <CircleCheckBig className="size-4 text-emerald-500" />
        : <X className="size-4 text-destructive" />}
    </motion.div>
  );
}

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field as string]; return next; });
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const handleBack = () => {
    setErrors({});
    setSelectedRole(null);
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;
    
    const stepErrors = validateAccountStep(formData, selectedRole);
    if (Object.keys(stepErrors).length > 0) { 
      setErrors(stepErrors); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      const body = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: selectedRole,
        adminCode: formData.adminCode,
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowSuccess(true);
        // Wait for animation
        await new Promise((r) => setTimeout(r, 2200));
        
        // Sign in using NextAuth
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInResult?.ok) {
          toast.success('Account created! Welcome to LifeLink.');
          // Force reload to sync NextAuth session and trigger dashboard redirect
          window.location.href = '/';
        } else {
          toast.error('Account created, but failed to log in.');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? 'Signup failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const err = (field: string) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const fv = useMemo(() => ({
    email: formData.email
      ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'valid' : 'invalid')
      : 'empty',
    phone: formData.phone
      ? (/^[+]?[\d\s-]{10,15}$/.test(formData.phone.replace(/\s/g, '')) ? 'valid' : 'invalid')
      : 'empty',
    password: formData.password
      ? (formData.password.length >= 8 ? 'valid' : 'invalid')
      : 'empty',
    confirmPassword: formData.confirmPassword
      ? (formData.password === formData.confirmPassword ? 'valid' : 'invalid')
      : 'empty',
  } as Record<string, 'valid' | 'invalid' | 'empty'>), [formData.email, formData.phone, formData.password, formData.confirmPassword]);

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-4xl">
          <button onClick={() => useNavigationStore.getState().setCurrentPage('landing')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="size-4" /> Back to Home
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <Heart className="size-7 text-primary-foreground" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Join LifeLink</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose your role to get started with a personalized experience tailored to your needs.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Button variant="outline" className="h-12 px-8 gap-3 font-normal text-base w-full sm:w-auto" type="button" onClick={() => signIn('google')}>
              <svg className="size-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-8 max-w-sm mx-auto">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">
                or sign up with email
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ROLE_CONFIGS.map((config, i) => {
              const Icon = config.icon;
              return (
                <motion.button
                  key={config.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  onClick={() => handleRoleSelect(config.id)}
                  className={cn(
                    'group relative text-left p-6 rounded-2xl border-2 bg-gradient-to-br transition-all duration-300',
                    config.bgGradient, config.borderColor,
                    'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl'
                  )}
                >
                  <div className={cn('inline-flex p-3 rounded-xl bg-gradient-to-br mb-4 shadow-md', config.gradient)}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{config.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{config.description}</p>
                  <ul className="space-y-1.5">
                    {config.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="size-3.5 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Already have an account?</span>
            <button
              onClick={() => useNavigationStore.getState().setCurrentPage('login')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline rounded-md px-2 py-1 hover:bg-primary/5 transition-colors"
            >
              Sign In <ArrowRight className="size-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const roleConfig = ROLE_CONFIGS.find((r) => r.id === selectedRole)!;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-lg">
        <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="size-4" /> Change Role
        </button>

        <div className="bg-card rounded-2xl border shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br shadow-md', roleConfig.gradient)}>
              <RoleIcon className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Create {roleConfig.label} Account</h1>
              <p className="text-xs text-muted-foreground">Complete your registration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="s-name" placeholder="John Doe" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={cn('pl-10', errors.name && 'border-destructive')} autoComplete="name" />
              </div>
              {err('name')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="s-email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={cn('pl-10 pr-10', errors.email && 'border-destructive')} autoComplete="email" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><ValidationIndicator status={fv.email} /></div>
              </div>
              {err('email')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="s-phone" type="tel" placeholder="+91-9876543210" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className={cn('pl-10 pr-10', errors.phone && 'border-destructive')} autoComplete="tel" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><ValidationIndicator status={fv.phone} /></div>
              </div>
              {err('phone')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="s-password" type="password" placeholder="Min. 8 characters" value={formData.password} onChange={(e) => updateField('password', e.target.value)} className={cn('pl-10 pr-10', errors.password && 'border-destructive')} autoComplete="new-password" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><ValidationIndicator status={fv.password} /></div>
              </div>
              {err('password')}
              {formData.password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(passwordStrength.score / 5) * 100}%` }} transition={{ duration: 0.3 }} className={cn('h-full rounded-full', passwordStrength.color)} />
                    </div>
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', passwordStrength.bgColor)}>{passwordStrength.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i <= passwordStrength.score ? passwordStrength.color : 'bg-muted')} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-confirm">Confirm Password</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="s-confirm" type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} className={cn('pl-10 pr-10', errors.confirmPassword && 'border-destructive')} autoComplete="new-password" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><ValidationIndicator status={fv.confirmPassword} /></div>
              </div>
              {err('confirmPassword')}
            </div>

            {selectedRole === 'ADMIN' && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="admin-code">Admin Invitation Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input id="admin-code" type="password" placeholder="Enter your invite code" value={formData.adminCode} onChange={(e) => updateField('adminCode', e.target.value)} className={cn('pl-10', errors.adminCode && 'border-destructive')} />
                </div>
                {err('adminCode')}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full gap-2">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <><Check className="size-4" /> Create Account</>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Already have an account?</span>
          <button onClick={() => useNavigationStore.getState().setCurrentPage('login')} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline rounded-md px-2 py-1 hover:bg-primary/5 transition-colors">
            Sign In <ArrowRight className="size-3.5" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="bg-card rounded-3xl border shadow-2xl p-12 text-center max-w-sm mx-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="mx-auto mb-6 size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}>
                  <Check className="size-10 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </motion.div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <PartyPopper className="size-8 text-amber-500 mx-auto mb-4" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-2xl font-bold mb-2">
                Welcome to LifeLink!
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-muted-foreground text-sm">
                Your {roleConfig.label.toLowerCase()} account is ready. Redirecting you now...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
