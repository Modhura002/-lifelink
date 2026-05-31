'use client';
import { useSession } from 'next-auth/react';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Shield,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Contact,
  UserCircle,
  Camera,
  FileDown,
  Activity,
  Building2,
  Clock,
  Stethoscope,
  Truck,
  BadgeCheck,
  Car,
  KeyRound,
  Users,
  Tag,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigationStore } from '@/store';
import { BLOOD_GROUP_LABELS } from '@/lib/constants';
import type { EmergencyContact, BloodGroup, User as UserType } from '@/types';
import { toast } from 'sonner';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' as const } },
};

const BLOOD_OPTIONS = Object.entries(BLOOD_GROUP_LABELS).map(([k, v]) => ({ value: k, label: v }));

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseExtra(address?: string | null): Record<string, string> {
  if (!address) return {};
  try {
    const p = JSON.parse(address);
    if (typeof p === 'object' && p !== null) return p as Record<string, string>;
  } catch {}
  return {};
}

function isJSONAddress(address?: string | null): boolean {
  if (!address) return false;
  try { JSON.parse(address); return true; } catch { return false; }
}

const ROLE_LABELS: Record<string, string> = {
  PATIENT: 'Patient',
  DRIVER: 'Ambulance Driver',
  HOSPITAL_STAFF: 'Hospital Staff',
  ADMIN: 'Administrator',
};

const ROLE_COLORS: Record<string, string> = {
  PATIENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  DRIVER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  HOSPITAL_STAFF: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  ADMIN: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
};

// ── Profile Completion Ring ───────────────────────────────────────────────────
function CompletionRing({ pct }: { pct: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-red-500';
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/50" />
        <motion.circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} className={color} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-lg font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {pct}%
        </motion.span>
        <span className="text-[9px] text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}

// ── Tag Pill editor ───────────────────────────────────────────────────────────
function TagList({ tags, onRemove, onAdd, placeholder }: { tags: string[]; onRemove: (t: string) => void; onAdd: (t: string) => void; placeholder?: string }) {
  const [val, setVal] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
            {t}
            <button onClick={() => onRemove(t)} className="hover:text-destructive transition-colors"><X className="h-2.5 w-2.5" /></button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-xs text-muted-foreground italic">None listed</span>}
      </div>
      <div className="flex gap-2">
        <Input
          value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder || 'Add item…'}
          className="h-7 text-xs" onKeyDown={(e) => { if (e.key === 'Enter' && val.trim()) { onAdd(val.trim()); setVal(''); } }}
        />
        <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(''); } }}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session } = useSession();
  
  const storeUser = session?.user;
  const updateProfile = (u: any) => {}; // TODO: implement update profile api
  const { setCurrentPage } = useNavigationStore();

  // Live user state (starts with store user, refreshed from API)
  const [profile, setProfile] = useState<UserType | null>(storeUser as UserType | null);
  const [loading, setLoading] = useState(false);

  // Refresh from DB on mount
  useEffect(() => {
    if (!storeUser?.id) return;
    setLoading(true);
    fetch(`/api/users/${storeUser.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setProfile(data);
          updateProfile(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = profile ?? storeUser;
  if (!p) return null;

  return <ProfileContent profile={p as UserType} setProfile={setProfile} updateProfile={updateProfile} setCurrentPage={setCurrentPage} loading={loading} />;
}

function ProfileContent({
  profile,
  setProfile,
  updateProfile,
  setCurrentPage,
  loading,
}: {
  profile: UserType;
  setProfile: (u: UserType) => void;
  updateProfile: (u: Partial<UserType>) => void;
  setCurrentPage: (p: import('@/types').PageRoute) => void;
  loading: boolean;
}) {
  // ── Personal form state ───────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const extra = useMemo(() => parseExtra(profile.address), [profile.address]);
  const plainAddress = isJSONAddress(profile.address) ? '' : (profile.address || '');

  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone,
    gender: profile.gender || '',
    dateOfBirth: profile.dateOfBirth || '',
    address: plainAddress,
  });

  // Keep form in sync if profile changes (fresh fetch)
  useEffect(() => {
    setForm({
      name: profile.name,
      phone: profile.phone,
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth || '',
      address: isJSONAddress(profile.address) ? '' : (profile.address || ''),
    });
  }, [profile.id]); // only re-sync when user changes, not on every save

  // ── Medical form (PATIENT only) ───────────────────────────────────────────
  const [medEditing, setMedEditing] = useState(false);
  const pp = (profile as any).patientProfile || {};
  const [medForm, setMedForm] = useState({
    bloodGroup: pp.bloodGroup || '',
    allergies: pp.allergies ? JSON.parse(pp.allergies) : [],
    currentMedications: pp.currentMedications ? JSON.parse(pp.currentMedications) : [],
    chronicConditions: pp.chronicConditions ? JSON.parse(pp.chronicConditions) : [],
  });

  // ── Emergency contacts ────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<EmergencyContact[]>(profile.emergencyContacts || []);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' });
  const [savingContact, setSavingContact] = useState(false);

  // ── Service Area form (DRIVER only) ───────────────────────────────────────────
  const [serviceAreaEditing, setServiceAreaEditing] = useState(false);
  const [serviceAreaForm, setServiceAreaForm] = useState({
    city: profile.city || '',
    pinCode: profile.pinCode || '',
    country: profile.country || '',
  });

  useEffect(() => {
    setServiceAreaForm({
      city: profile.city || '',
      pinCode: profile.pinCode || '',
      country: profile.country || '',
    });
  }, [profile.id, profile.city, profile.pinCode, profile.country]);

  // ── Save personal info ────────────────────────────────────────────────────
  const handleSave = async () => {
    const updates: Partial<UserType> = {
      name: form.name,
      phone: form.phone,
      gender: form.gender || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
    };
    // Only update address for roles that use plain string addresses
    if (!isJSONAddress(profile.address)) {
      updates.address = form.address;
    }

    const next = { ...profile, ...updates };
    setProfile(next);
    updateProfile(updates);

    if (profile.id) {
      await fetch(`/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch(() => {});
    }
    toast.success('Profile updated');
    setEditing(false);
  };

  // ── Save medical info ─────────────────────────────────────────────────────
  const handleSaveMedical = async () => {
    const updates: Partial<UserType> = {
      bloodGroup: medForm.bloodGroup as BloodGroup,
      allergies: medForm.allergies,
      currentMedications: medForm.currentMedications,
      chronicConditions: medForm.chronicConditions,
    };
    const next = { ...profile, ...updates };
    setProfile(next);
    updateProfile(updates);

    if (profile.id) {
      await fetch(`/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch(() => {});
    }
    toast.success('Medical info updated');
    setMedEditing(false);
  };

  // ── Save Service Area ─────────────────────────────────────────────────────
  const handleSaveServiceArea = async () => {
    const updates: Partial<UserType> = {
      city: serviceAreaForm.city,
      pinCode: serviceAreaForm.pinCode,
      country: serviceAreaForm.country,
    };
    const next = { ...profile, ...updates };
    setProfile(next);
    updateProfile(updates);

    if (profile.id) {
      await fetch(`/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch(() => {});
    }
    toast.success('Service area updated');
    setServiceAreaEditing(false);
  };

  // ── Emergency contact management ──────────────────────────────────────────
  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    setSavingContact(true);
    try {
      const res = await fetch(`/api/users/${profile.id}/emergency-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });
      const contact: EmergencyContact = await res.json();
      const updated = [...contacts, contact];
      setContacts(updated);
      updateProfile({ emergencyContacts: updated });
      setNewContact({ name: '', relationship: '', phone: '' });
      setShowAddContact(false);
      toast.success('Emergency contact added');
    } catch {
      toast.error('Failed to add contact');
    } finally {
      setSavingContact(false);
    }
  };

  const handleRemoveContact = async (id: string) => {
    await fetch(`/api/users/${profile.id}/emergency-contacts/${id}`, { method: 'DELETE' }).catch(() => {});
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    updateProfile({ emergencyContacts: updated });
    toast.success('Contact removed');
  };

  // ── Profile completion ────────────────────────────────────────────────────
  const completionFields = useMemo(() => {
    const base = [
      { label: 'Full Name', filled: !!profile.name },
      { label: 'Email', filled: !!profile.email },
      { label: 'Phone', filled: !!profile.phone },
      { label: 'Gender', filled: !!profile.gender },
      { label: 'Date of Birth', filled: !!profile.dateOfBirth },
    ];
    if (profile.role === 'PATIENT') {
      base.push(
        { label: 'Blood Group', filled: !!profile.bloodGroup },
        { label: 'Address', filled: !!plainAddress },
        { label: 'Emergency Contact', filled: contacts.length > 0 },
        { label: 'Medical History', filled: (profile.allergies?.length ?? 0) > 0 || (profile.chronicConditions?.length ?? 0) > 0 },
      );
    } else if (profile.role === 'DRIVER') {
      base.push(
        { label: 'License Number', filled: !!extra.licenseNumber },
        { label: 'Experience', filled: !!extra.experience },
      );
    } else if (profile.role === 'HOSPITAL_STAFF') {
      base.push(
        { label: 'Department', filled: !!extra.department },
        { label: 'Employee ID', filled: !!extra.employeeId },
      );
    }
    return base;
  }, [profile, plainAddress, contacts.length, extra]);

  const completionPct = Math.round((completionFields.filter((f) => f.filled).length / completionFields.length) * 100);

  // ── Role icon ─────────────────────────────────────────────────────────────
  const RoleIcon = profile.role === 'PATIENT' ? Heart
    : profile.role === 'DRIVER' ? Truck
    : profile.role === 'HOSPITAL_STAFF' ? Building2
    : Shield;

  // ── Header initials ───────────────────────────────────────────────────────
  const initials = profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing latest data…
        </div>
      )}

      {/* ── Header ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <button
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  onClick={() => toast.info('Photo upload coming soon')}
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />{profile.email}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className={`text-xs ${ROLE_COLORS[profile.role] || ''}`}>
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {ROLE_LABELS[profile.role] || profile.role}
                  </Badge>
                  {profile.isVerified && (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Verified
                    </Badge>
                  )}
                  {profile.role === 'HOSPITAL_STAFF' && extra.department && (
                    <Badge variant="outline" className="text-xs">
                      <Stethoscope className="h-3 w-3 mr-1" />{extra.department}
                    </Badge>
                  )}
                  {profile.role === 'DRIVER' && (profile as UserType & { ambulance?: { vehicleNumber: string } }).ambulance?.vehicleNumber && (
                    <Badge variant="outline" className="text-xs">
                      <Car className="h-3 w-3 mr-1" />{(profile as UserType & { ambulance?: { vehicleNumber: string } }).ambulance!.vehicleNumber}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right hidden sm:flex flex-col items-end gap-1">
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Profile Completion + Role Info row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-col items-center gap-4">
                <CompletionRing pct={completionPct} />
                <div className="w-full space-y-1.5">
                  {completionFields.map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-xs">
                      {f.filled
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />}
                      <span className={f.filled ? 'text-foreground' : 'text-muted-foreground'}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role-specific info card */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <RoleIcon className="h-5 w-5 text-primary" />
                {profile.role === 'PATIENT' ? 'Health Summary'
                  : profile.role === 'DRIVER' ? 'Driver Info'
                  : profile.role === 'HOSPITAL_STAFF' ? 'Hospital Info'
                  : 'Admin Access'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {profile.role === 'PATIENT' && (
                <>
                  <InfoRow icon={<Heart className="h-3.5 w-3.5 text-red-500" />} label="Blood Group"
                    value={BLOOD_GROUP_LABELS[profile.bloodGroup || ''] || 'Not set'} />
                  <InfoRow icon={<Tag className="h-3.5 w-3.5 text-amber-500" />} label="Allergies"
                    value={profile.allergies?.length ? profile.allergies.join(', ') : 'None'} />
                  <InfoRow icon={<Activity className="h-3.5 w-3.5 text-violet-500" />} label="Conditions"
                    value={profile.chronicConditions?.length ? profile.chronicConditions.join(', ') : 'None'} />
                  <InfoRow icon={<Users className="h-3.5 w-3.5 text-sky-500" />} label="Emergency Contacts"
                    value={`${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`} />
                </>
              )}
              {profile.role === 'DRIVER' && (
                <>
                  <InfoRow icon={<KeyRound className="h-3.5 w-3.5 text-amber-500" />} label="License No."
                    value={extra.licenseNumber || 'Not set'} />
                  <InfoRow icon={<Clock className="h-3.5 w-3.5 text-sky-500" />} label="Experience"
                    value={extra.experience ? `${extra.experience} years` : 'Not set'} />
                  <InfoRow icon={<Car className="h-3.5 w-3.5 text-emerald-500" />} label="Vehicle"
                    value={(profile as UserType & { ambulance?: { vehicleNumber: string; status: string } }).ambulance?.vehicleNumber || 'Not assigned'} />
                  <InfoRow icon={<Activity className="h-3.5 w-3.5 text-violet-500" />} label="Vehicle Status"
                    value={(profile as UserType & { ambulance?: { vehicleNumber: string; status: string } }).ambulance?.status || 'N/A'} />
                </>
              )}
              {profile.role === 'HOSPITAL_STAFF' && (
                <>
                  <InfoRow icon={<Building2 className="h-3.5 w-3.5 text-sky-500" />} label="Hospital"
                    value={(profile as UserType & { hospital?: { name: string; city: string } }).hospital?.name || 'N/A'} />
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5 text-rose-500" />} label="City"
                    value={(profile as UserType & { hospital?: { name: string; city: string } }).hospital?.city || 'N/A'} />
                  <InfoRow icon={<Stethoscope className="h-3.5 w-3.5 text-emerald-500" />} label="Department"
                    value={extra.department || 'Not set'} />
                  <InfoRow icon={<BadgeCheck className="h-3.5 w-3.5 text-violet-500" />} label="Employee ID"
                    value={extra.employeeId || 'Not set'} />
                </>
              )}
              {profile.role === 'ADMIN' && (
                <>
                  <InfoRow icon={<Shield className="h-3.5 w-3.5 text-violet-500" />} label="Access Level" value="Full System Admin" />
                  <InfoRow icon={<UserCircle className="h-3.5 w-3.5 text-sky-500" />} label="Modules" value="Users, Hospitals, Analytics, Reports" />
                  <InfoRow icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />} label="Status" value="Active & Verified" />
                  <InfoRow icon={<Clock className="h-3.5 w-3.5 text-amber-500" />} label="Admin Since"
                    value={new Date(profile.createdAt).toLocaleDateString('en-IN')} />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Personal Info (editable) ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Information
              </CardTitle>
              {!editing ? (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setEditing(true)}>
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditing(false)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" className="gap-1.5 text-xs" onClick={handleSave}>
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" editing={editing}
                display={<span className="text-sm font-medium">{profile.name}</span>}
                input={<Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
              />
              <Field label="Email" editing={false}
                display={
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{profile.email}</span>
                    <Badge variant="outline" className="text-[10px]">Read Only</Badge>
                  </div>
                }
                input={null}
              />
              <Field label="Phone" editing={editing}
                display={<span className="text-sm font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{profile.phone || 'Not set'}</span>}
                input={<Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91-XXXXXXXXXX" />}
              />
              <Field label="Gender" editing={editing}
                display={<span className="text-sm font-medium">{profile.gender || 'Not set'}</span>}
                input={
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
              <Field label="Date of Birth" editing={editing}
                display={<span className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}
                </span>}
                input={<Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />}
              />
              {/* Address — only for patient & admin (not JSON-encoded roles) */}
              {!isJSONAddress(profile.address) && (
                <Field label="Address" editing={editing}
                  display={<span className="text-sm font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />{plainAddress || 'Not set'}
                  </span>}
                  input={<Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" />}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Medical Profile (PATIENT only) ── */}
      {profile.role === 'PATIENT' && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" /> Medical Profile
                </CardTitle>
                {!medEditing ? (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setMedEditing(true)}>
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setMedEditing(false)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="gap-1.5 text-xs" onClick={handleSaveMedical}>
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {/* Blood Group */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Blood Group</Label>
                {medEditing ? (
                  <Select value={medForm.bloodGroup} onValueChange={(v) => setMedForm({ ...medForm, bloodGroup: v })}>
                    <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                    <SelectContent>{BLOOD_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-red-500" />
                    {BLOOD_GROUP_LABELS[profile.bloodGroup || ''] || 'Not set'}
                  </p>
                )}
              </div>

              {/* Medical tags */}
              {[
                { key: 'allergies' as const, label: 'Allergies', placeholder: 'e.g. Penicillin…' },
                { key: 'currentMedications' as const, label: 'Current Medications', placeholder: 'e.g. Metformin 500mg…' },
                { key: 'chronicConditions' as const, label: 'Chronic Conditions', placeholder: 'e.g. Type 2 Diabetes…' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  {medEditing ? (
                    <TagList
                      tags={medForm[key]}
                      onAdd={(t) => setMedForm((prev) => ({ ...prev, [key]: [...prev[key], t] }))}
                      onRemove={(t) => setMedForm((prev) => ({ ...prev, [key]: prev[key].filter((x) => x !== t) }))}
                      placeholder={placeholder}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {(profile[key] || []).length === 0
                        ? <span className="text-xs text-muted-foreground italic">None listed</span>
                        : (profile[key] || []).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border">{t}</span>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Emergency Contacts (PATIENT only) ── */}
      {profile.role === 'PATIENT' && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Contact className="h-5 w-5 text-primary" /> Emergency Contacts
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowAddContact(!showAddContact)}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {contacts.length === 0 && !showAddContact && (
                <p className="text-sm text-muted-foreground text-center py-4">No emergency contacts added yet.</p>
              )}
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {c.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.relationship} · {c.phone}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                  </a>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveContact(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <AnimatePresence>
                {showAddContact && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="space-y-2 p-3 rounded-lg border">
                      <Input placeholder="Contact name" value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Relationship" value={newContact.relationship}
                          onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} />
                        <Input placeholder="Phone number" value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={handleAddContact} disabled={savingContact}>
                          {savingContact ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                          Add Contact
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowAddContact(false)}>Cancel</Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Driver Service Area (editable) ── */}
      {profile.role === 'DRIVER' && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Service Area
                </CardTitle>
                {!serviceAreaEditing ? (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setServiceAreaEditing(true)}>
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setServiceAreaEditing(false)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="gap-1.5 text-xs" onClick={handleSaveServiceArea}>
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground mb-3">Update your location to receive relevant SOS alerts.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="City" editing={serviceAreaEditing}
                  display={<span className="text-sm font-medium">{profile.city || 'Not set'}</span>}
                  input={<Input value={serviceAreaForm.city} onChange={(e) => setServiceAreaForm({ ...serviceAreaForm, city: e.target.value })} placeholder="e.g. New Delhi" />}
                />
                <Field label="Pin Code" editing={serviceAreaEditing}
                  display={<span className="text-sm font-medium">{profile.pinCode || 'Not set'}</span>}
                  input={<Input value={serviceAreaForm.pinCode} onChange={(e) => setServiceAreaForm({ ...serviceAreaForm, pinCode: e.target.value })} placeholder="e.g. 110016" />}
                />
                <Field label="Country" editing={serviceAreaEditing}
                  display={<span className="text-sm font-medium">{profile.country || 'Not set'}</span>}
                  input={<Input value={serviceAreaForm.country} onChange={(e) => setServiceAreaForm({ ...serviceAreaForm, country: e.target.value })} placeholder="e.g. India" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Driver Vehicle info (read-only, managed by admin) ── */}
      {profile.role === 'DRIVER' && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Vehicle & License Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground mb-3">Contact your admin to update these details.</p>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={<KeyRound className="h-3.5 w-3.5 text-amber-500" />} label="License Number" value={extra.licenseNumber || 'Not set'} />
                <InfoRow icon={<Clock className="h-3.5 w-3.5 text-sky-500" />} label="Experience" value={extra.experience ? `${extra.experience} years` : 'Not set'} />
                <InfoRow icon={<Car className="h-3.5 w-3.5 text-emerald-500" />} label="Vehicle No."
                  value={(profile as UserType & { ambulance?: { vehicleNumber: string } }).ambulance?.vehicleNumber || 'Not assigned'} />
                <InfoRow icon={<Activity className="h-3.5 w-3.5 text-violet-500" />} label="Status"
                  value={(profile as UserType & { ambulance?: { status: string } }).ambulance?.status || 'N/A'} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Account Actions ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Button variant="outline" className="w-full gap-2 justify-start"
              onClick={() => toast.success('Password reset link sent to your email.')}>
              <Lock className="h-4 w-4" /> Change Password
            </Button>

            {profile.role === 'PATIENT' && (
              <Button variant="outline" className="w-full gap-2 justify-start"
                onClick={() => toast.success('Health summary PDF generated!')}>
                <FileDown className="h-4 w-4" /> Download Health Summary
              </Button>
            )}

            {profile.role === 'PATIENT' && (
              <Button variant="outline" className="w-full gap-2 justify-start"
                onClick={() => setCurrentPage('insurance')}>
                <Heart className="h-4 w-4" /> Manage Insurance
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2 justify-start">
                  <AlertTriangle className="h-4 w-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => { toast.error('Account deletion requested — contact support to confirm.'); }}>
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({ label, editing, display, input }: { label: string; editing: boolean; display: React.ReactNode; input: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {editing && input ? input : display}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="font-medium text-sm leading-tight">{value}</p>
      </div>
    </div>
  );
}
